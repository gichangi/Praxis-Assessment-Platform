import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/router.dart';
import 'app/theme.dart';
import 'data/services/server_config.dart';
import 'data/sync/sync_engine.dart';

// Triggers a full rebuild of ProviderScope + AssessmentApp when incremented.
final appRestartSignal = ValueNotifier<int>(0);

// Call after saving a new server URL to reconnect to the new backend.
Future<void> reinitSupabase() async {
  final cfg = await ServerConfig.load();
  try {
    await Supabase.instance.dispose();
  } catch (_) {}
  await Supabase.initialize(url: cfg.url, publishableKey: cfg.anonKey);
  appRestartSignal.value++;
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  final cfg = await ServerConfig.load();
  await Supabase.initialize(url: cfg.url, publishableKey: cfg.anonKey);

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('so'), Locale('ar')],
      path: 'lib/l10n',
      fallbackLocale: const Locale('en'),
      child: ValueListenableBuilder<int>(
        valueListenable: appRestartSignal,
        builder: (_, _, _) => const ProviderScope(child: AssessmentApp()),
      ),
    ),
  );
}

class AssessmentApp extends ConsumerStatefulWidget {
  const AssessmentApp({super.key});

  @override
  ConsumerState<AssessmentApp> createState() => _AssessmentAppState();
}

class _AssessmentAppState extends ConsumerState<AssessmentApp> {
  @override
  void initState() {
    super.initState();
    // Initialise the sync engine once the widget tree is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(syncEngineProvider).start();
      _checkForceUpdate();
    });
  }

  Future<void> _checkForceUpdate() async {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return;

    try {
      final info = await PackageInfo.fromPlatform();
      final installed = _parseVersion(info.version);

      final orgRes = await Supabase.instance.client
          .from('memberships')
          .select('organisation_id')
          .eq('user_id', session.user.id)
          .limit(1)
          .single();
      final orgId = orgRes['organisation_id'] as String;

      final cfgRes = await Supabase.instance.client
          .from('app_config')
          .select('value')
          .eq('organisation_id', orgId)
          .eq('key', 'min_app_version')
          .maybeSingle();

      if (cfgRes == null) return;
      final minVersion = _parseVersion(cfgRes['value'] as String? ?? '0.0.0');

      if (_compareVersions(installed, minVersion) < 0) {
        router.go(Routes.forceUpdate);
      }
    } catch (_) {
      // Non-fatal: if we can't fetch config, don't block the user.
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Assessment Platform',
      theme: AppTheme.light(),
      routerConfig: router,
      localizationsDelegates: [
        ...context.localizationDelegates,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: context.supportedLocales,
      locale: context.locale,
    );
  }
}

List<int> _parseVersion(String v) =>
    v.split('.').map((s) => int.tryParse(s) ?? 0).toList();

int _compareVersions(List<int> a, List<int> b) {
  for (var i = 0; i < 3; i++) {
    final ai = i < a.length ? a[i] : 0;
    final bi = i < b.length ? b[i] : 0;
    if (ai != bi) return ai.compareTo(bi);
  }
  return 0;
}
