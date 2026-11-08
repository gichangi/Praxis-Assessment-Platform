import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../data/database/app_database.dart';
import '../../domain/sync_log.dart';

const _errorInk = Color(0xFFB3261E);

/// "just now", "5 min ago", "3 h ago", or the date once it is a day or more.
String syncAgeText(BuildContext context, DateTime at, {DateTime? now}) {
  final age = ageOf(at, now ?? DateTime.now());
  return switch (age.unit) {
    AgeUnit.justNow => tr('sync_ago_now'),
    AgeUnit.minutes => tr('sync_ago_minutes', namedArgs: {'n': '${age.value}'}),
    AgeUnit.hours => tr('sync_ago_hours', namedArgs: {'n': '${age.value}'}),
    AgeUnit.date => DateFormat.yMMMd(Localizations.localeOf(context).toString()).format(at),
  };
}

/// Full date and time, e.g. "8 Nov 2026, 10:42".
String syncStamp(BuildContext context, DateTime at) =>
    DateFormat.yMMMd(Localizations.localeOf(context).toString()).add_jm().format(at.toLocal());

/// Colour that goes with an outcome.
Color syncOutcomeColor(SyncOutcome outcome) => switch (outcome) {
      SyncOutcome.ok => AppTheme.good,
      SyncOutcome.conflict || SyncOutcome.rejected || SyncOutcome.offline => AppTheme.warning,
      SyncOutcome.error => _errorInk,
    };

IconData syncOutcomeIcon(SyncOutcome outcome) => switch (outcome) {
      SyncOutcome.ok => Icons.cloud_done_outlined,
      SyncOutcome.conflict || SyncOutcome.rejected => Icons.sync_problem_outlined,
      SyncOutcome.offline => Icons.cloud_off_outlined,
      SyncOutcome.error => Icons.error_outline,
    };

String syncOutcomeLabel(SyncOutcome outcome) => tr('sync_outcome_${outcome.code}');

/// What went wrong (or was kept back) in a sync, in words; null when nothing did.
String? syncDetailText(LocalSyncLog log) {
  final message = log.message;
  switch (SyncOutcome.fromCode(log.outcome)) {
    case SyncOutcome.ok:
      return null;
    case SyncOutcome.conflict:
      return tr('sync_detail_conflict', namedArgs: {'n': '${log.rejected}'});
    case SyncOutcome.rejected:
      return message == 'not_assigned' ? tr('sync_detail_not_assigned') : message;
    case SyncOutcome.offline:
      return tr('sync_detail_offline');
    case SyncOutcome.error:
      // The gateway refuses a wrong anon key with 401 even though sign-in itself worked.
      if (message != null && message.startsWith('HTTP 401')) {
        return '$message\n${tr('sync_hint_unauthorized')}';
      }
      return message;
  }
}

/// The short line under a title: what state syncing is in. [tone] colours it.
({String text, Color tone}) syncSummaryLine(
  BuildContext context, {
  required bool syncing,
  LocalSyncLog? lastAttempt,
  LocalSyncLog? lastSuccess,
}) {
  final kind = syncSummaryKind(
    syncing: syncing,
    lastAttempt: lastAttempt == null ? null : SyncOutcome.fromCode(lastAttempt.outcome),
    lastSuccess: lastSuccess?.at,
  );
  switch (kind) {
    case SyncSummaryKind.syncing:
      return (text: tr('sync_syncing'), tone: AppTheme.muted);
    case SyncSummaryKind.failed:
      return (text: tr('sync_failed_tap'), tone: _errorInk);
    case SyncSummaryKind.offline:
      return (text: tr('sync_offline'), tone: AppTheme.warning);
    case SyncSummaryKind.rejected:
      return (text: tr('sync_conflict'), tone: AppTheme.warning);
    case SyncSummaryKind.synced:
      return (
        text: tr('sync_last_sync', namedArgs: {'time': syncAgeText(context, lastSuccess!.at)}),
        tone: AppTheme.muted,
      );
    case SyncSummaryKind.never:
      return (text: tr('sync_never'), tone: AppTheme.muted);
  }
}
