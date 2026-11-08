import 'dart:async';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/domain/sync_log.dart';

void main() {
  group('SyncOutcome', () {
    test('round-trips through its stored code', () {
      for (final o in SyncOutcome.values) {
        expect(SyncOutcome.fromCode(o.code), o);
      }
      expect(SyncOutcome.fromCode('something-new'), SyncOutcome.error);
    });

    test('knows which outcomes reached the server', () {
      expect(SyncOutcome.ok.reachedServer, isTrue);
      expect(SyncOutcome.conflict.reachedServer, isTrue);
      expect(SyncOutcome.rejected.reachedServer, isTrue);
      expect(SyncOutcome.error.reachedServer, isFalse);
      expect(SyncOutcome.offline.reachedServer, isFalse);
    });
  });

  group('classifySyncError', () {
    test('treats network problems as offline', () {
      expect(classifySyncError(const SocketException('Failed host lookup')).outcome, SyncOutcome.offline);
      expect(classifySyncError(TimeoutException('slow')).outcome, SyncOutcome.offline);
      expect(classifySyncError(Exception('ClientException: Connection reset')).outcome, SyncOutcome.offline);
    });

    test('treats anything else as a failure and keeps a tidy message', () {
      final c = classifySyncError(Exception('  Server   said\nno  '));
      expect(c.outcome, SyncOutcome.error);
      expect(c.message, 'Server said no');
    });

    test('drops the Bad state prefix of a lapsed sign-in', () {
      final c = classifySyncError(StateError('Not authenticated'));
      expect(c.outcome, SyncOutcome.error);
      expect(c.message, 'Not authenticated');
    });

    test('caps very long messages', () {
      final c = classifySyncError(Exception('x' * 1000));
      expect(c.message.length, lessThanOrEqualTo(300));
      expect(c.message, endsWith('…'));
    });
  });

  group('ageOf', () {
    final now = DateTime.utc(2026, 11, 8, 12);

    test('reads in minutes, hours, then dates', () {
      expect(ageOf(now.subtract(const Duration(seconds: 20)), now).unit, AgeUnit.justNow);
      final m = ageOf(now.subtract(const Duration(minutes: 5)), now);
      expect((m.unit, m.value), (AgeUnit.minutes, 5));
      final h = ageOf(now.subtract(const Duration(hours: 3, minutes: 10)), now);
      expect((h.unit, h.value), (AgeUnit.hours, 3));
      expect(ageOf(now.subtract(const Duration(days: 2)), now).unit, AgeUnit.date);
    });
  });

  group('syncSummaryKind', () {
    final when = DateTime.utc(2026, 11, 8);

    test('says syncing while a sync runs, whatever happened before', () {
      expect(syncSummaryKind(syncing: true, lastAttempt: SyncOutcome.error), SyncSummaryKind.syncing);
    });

    test('shows a failed or offline last attempt even after an older success', () {
      expect(syncSummaryKind(syncing: false, lastAttempt: SyncOutcome.error, lastSuccess: when), SyncSummaryKind.failed);
      expect(syncSummaryKind(syncing: false, lastAttempt: SyncOutcome.offline, lastSuccess: when), SyncSummaryKind.offline);
    });

    test('flags refused or conflicting changes', () {
      expect(syncSummaryKind(syncing: false, lastAttempt: SyncOutcome.conflict, lastSuccess: when), SyncSummaryKind.rejected);
      expect(syncSummaryKind(syncing: false, lastAttempt: SyncOutcome.rejected, lastSuccess: when), SyncSummaryKind.rejected);
    });

    test('says synced after a good sync and never before any', () {
      expect(syncSummaryKind(syncing: false, lastAttempt: SyncOutcome.ok, lastSuccess: when), SyncSummaryKind.synced);
      expect(syncSummaryKind(syncing: false), SyncSummaryKind.never);
    });
  });
}
