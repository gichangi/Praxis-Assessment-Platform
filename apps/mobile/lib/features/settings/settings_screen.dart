import 'dart:ui' as ui;

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../app/router.dart';
import '../../app/theme.dart';
import '../../data/sync/sync_engine.dart';
import '../sync/sync_format.dart';
import '../sync/sync_providers.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('settings_title')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 40),
        children: [
          if (user != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('auth_email'),
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(color: AppTheme.muted),
                    ),
                    const SizedBox(height: 4),
                    Text(user.email ?? '—', style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          const _SyncTile(),
          const SizedBox(height: 12),
          // Language picker
          Card(
            child: Column(
              children: [
                ListTile(
                  title: Text(tr('settings_language')),
                  trailing: DropdownButton<Locale>(
                    value: context.locale,
                    underline: const SizedBox.shrink(),
                    items: [
                      DropdownMenuItem(
                          value: const Locale('en'),
                          child: Text(tr('settings_language_en'))),
                      DropdownMenuItem(
                          value: const Locale('so'),
                          child: Text(tr('settings_language_so'))),
                      DropdownMenuItem(
                          value: const Locale('ar'),
                          child: Text(tr('settings_language_ar'))),
                    ],
                    onChanged: (locale) {
                      if (locale != null) context.setLocale(locale);
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Sign out
          Card(
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: Text(
                tr('auth_sign_out'),
                style: const TextStyle(color: Colors.red),
              ),
              onTap: () async {
                await Supabase.instance.client.auth.signOut();
                if (context.mounted) context.go(Routes.login);
              },
            ),
          ),
        ],
      ),
    );
  }
}


/// Opens the sync log; shows when the phone last synced and whether the last try failed.
class _SyncTile extends ConsumerWidget {
  const _SyncTile();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final engine = ref.watch(syncEngineProvider);
    final attempt = ref.watch(lastSyncAttemptProvider).valueOrNull;
    final success = ref.watch(lastSuccessfulSyncProvider).valueOrNull;
    final line = syncSummaryLine(
      context,
      syncing: engine.isSyncing,
      lastAttempt: attempt,
      lastSuccess: success,
    );
    return Card(
      child: ListTile(
        leading: const Icon(Icons.sync),
        title: Text(tr('sync_title')),
        subtitle: Text(line.text, style: TextStyle(color: line.tone)),
        trailing: Icon(Directionality.of(context) == ui.TextDirection.rtl ? Icons.chevron_left : Icons.chevron_right),
        onTap: () => context.push(Routes.sync),
      ),
    );
  }
}
