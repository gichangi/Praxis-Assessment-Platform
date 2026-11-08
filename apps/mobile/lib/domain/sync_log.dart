import 'dart:async';
import 'dart:io';

/// How a sync attempt ended.
enum SyncOutcome {
  /// Everything went through.
  ok,

  /// Synced, but the server had newer data for some changes and kept its own.
  conflict,

  /// Synced, but the server refused some changes (e.g. unanswered items, a form not assigned).
  rejected,

  /// The server couldn't be reached or answered with an error. Nothing was lost; it will retry.
  error,

  /// The phone has no connection to the server.
  offline;

  /// The name stored in the sync log.
  String get code => name;

  /// True when the server answered, so the phone was up to date as of that moment.
  bool get reachedServer => this == ok || this == conflict || this == rejected;

  static SyncOutcome fromCode(String code) =>
      SyncOutcome.values.firstWhere((o) => o.name == code, orElse: () => SyncOutcome.error);
}

/// An error turned into an outcome and a short message fit for the sync log.
typedef ClassifiedError = ({SyncOutcome outcome, String message});

const _maxMessage = 300;

/// Tidy a raw error text: drop Dart's `Exception: ` prefix, collapse whitespace, cap the length.
String tidyMessage(String raw) {
  var s = raw.replaceFirst(RegExp(r'^(Exception|Error|Bad state): '), '').replaceAll(RegExp(r'\s+'), ' ').trim();
  if (s.length > _maxMessage) s = '${s.substring(0, _maxMessage - 1)}…';
  return s;
}

/// Sort a failed sync into "no connection" or "something went wrong".
ClassifiedError classifySyncError(Object e) {
  final text = e.toString();
  final offline = e is SocketException ||
      e is TimeoutException ||
      text.contains('SocketException') ||
      text.contains('Failed host lookup') ||
      text.contains('ClientException') ||
      text.contains('FunctionsFetchException') ||
      text.contains('Connection refused') ||
      text.contains('Network is unreachable') ||
      text.contains('AuthRetryableFetchException');
  return (outcome: offline ? SyncOutcome.offline : SyncOutcome.error, message: tidyMessage(text));
}

/// How long ago something happened, in the unit people read it in.
enum AgeUnit { justNow, minutes, hours, date }

({AgeUnit unit, int value}) ageOf(DateTime at, DateTime now) {
  final diff = now.difference(at);
  if (diff.inMinutes < 1) return (unit: AgeUnit.justNow, value: 0);
  if (diff.inMinutes < 60) return (unit: AgeUnit.minutes, value: diff.inMinutes);
  if (diff.inHours < 24) return (unit: AgeUnit.hours, value: diff.inHours);
  return (unit: AgeUnit.date, value: diff.inDays);
}

/// The one-line state of syncing shown in the app bar and in settings.
enum SyncSummaryKind { syncing, failed, offline, rejected, synced, never }

SyncSummaryKind syncSummaryKind({
  required bool syncing,
  SyncOutcome? lastAttempt,
  DateTime? lastSuccess,
}) {
  if (syncing) return SyncSummaryKind.syncing;
  switch (lastAttempt) {
    case SyncOutcome.error:
      return SyncSummaryKind.failed;
    case SyncOutcome.offline:
      return SyncSummaryKind.offline;
    case SyncOutcome.conflict || SyncOutcome.rejected:
      return SyncSummaryKind.rejected;
    case SyncOutcome.ok || null:
      return lastSuccess == null ? SyncSummaryKind.never : SyncSummaryKind.synced;
  }
}
