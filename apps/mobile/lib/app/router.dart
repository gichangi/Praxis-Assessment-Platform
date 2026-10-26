import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../features/auth/force_update_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/assessments/list_screen.dart';
import '../features/assessments/new_screen.dart';
import '../features/assessments/item_screen.dart';
import '../features/assessments/summary_screen.dart';
import '../features/compare/compare_screen.dart';
import '../features/settings/settings_screen.dart';

// Route paths
abstract final class Routes {
  static const login = '/login';
  static const forceUpdate = '/force-update';
  static const assessments = '/assessments';
  static const newAssessment = '/assessments/new';
  static const assessmentItem = '/assessments/:id/items/:itemKey';
  static const assessmentSummary = '/assessments/:id/summary';
  static const compare = '/compare';
  static const settings = '/settings';
  static const helpList = '/help';
  static const helpArticle = '/help/:slug';
  static const reportProblem = '/report';
}

final router = GoRouter(
  initialLocation: Routes.login,
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    final isOnLogin = state.matchedLocation == Routes.login;
    if (session == null && !isOnLogin) return Routes.login;
    if (session != null && isOnLogin) return Routes.assessments;
    return null;
  },
  refreshListenable: _SupabaseAuthNotifier(),
  routes: [
    GoRoute(
      path: Routes.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: Routes.assessments,
      builder: (context, state) => const AssessmentsListScreen(),
      routes: [
        GoRoute(
          path: 'new',
          builder: (context, state) => const NewAssessmentScreen(),
        ),
        GoRoute(
          path: ':id/items/:itemKey',
          builder: (context, state) => ItemScreen(
            assessmentId: state.pathParameters['id']!,
            itemKey: state.pathParameters['itemKey']!,
          ),
        ),
        GoRoute(
          path: ':id/summary',
          builder: (context, state) => SummaryScreen(
            assessmentId: state.pathParameters['id']!,
          ),
        ),
      ],
    ),
    GoRoute(
      path: Routes.forceUpdate,
      builder: (context, state) => const ForceUpdateScreen(),
    ),
    GoRoute(
      path: Routes.compare,
      builder: (context, state) => const CompareScreen(),
    ),
    GoRoute(
      path: Routes.settings,
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: Routes.helpList,
      builder: (context, state) => const _PlaceholderScreen(title: 'Help'),
      routes: [
        GoRoute(
          path: ':slug',
          builder: (context, state) => const _PlaceholderScreen(title: 'Help Article'),
        ),
      ],
    ),
    GoRoute(
      path: Routes.reportProblem,
      builder: (context, state) => const _PlaceholderScreen(title: 'Report a Problem'),
    ),
  ],
);

/// Tells go_router to re-evaluate redirects when auth state changes.
class _SupabaseAuthNotifier extends ChangeNotifier {
  late final _sub = Supabase.instance.client.auth.onAuthStateChange
      .listen((_) => notifyListeners());

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text(title)),
    );
  }
}
