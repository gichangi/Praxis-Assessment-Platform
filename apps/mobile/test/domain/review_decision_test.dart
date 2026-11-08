import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/domain/review_decision.dart';

void main() {
  final when = DateTime.utc(2026, 11, 8, 10);

  group('reviewDecisionOf', () {
    test('is empty until a reviewer has decided', () {
      expect(reviewDecisionOf(status: 'draft'), isNull);
      expect(reviewDecisionOf(status: 'submitted'), isNull);
    });

    test('names the outcome for each decision', () {
      expect(reviewDecisionOf(status: 'approved')!.outcome, ReviewOutcome.approved);
      expect(reviewDecisionOf(status: 'returned')!.outcome, ReviewOutcome.returned);
      expect(reviewDecisionOf(status: 'rejected')!.outcome, ReviewOutcome.rejected);
    });

    test('looks the reviewer up by id and carries the date and message', () {
      final d = reviewDecisionOf(
        status: 'rejected',
        reviewedBy: 'u1',
        reviewedAt: when,
        note: ' Evidence is missing ',
        memberNames: const {'u1': 'Demo Admin'},
      )!;
      expect(d.reviewerName, 'Demo Admin');
      expect(d.reviewedAt, when);
      expect(d.message, 'Evidence is missing');
    });

    test('copes with an unknown reviewer and a missing or blank message', () {
      final d = reviewDecisionOf(
        status: 'approved',
        reviewedBy: 'someone-new',
        note: '   ',
        memberNames: const {'u1': 'Demo Admin'},
      )!;
      expect(d.reviewerName, isNull);
      expect(d.message, isNull);
      expect(reviewDecisionOf(status: 'approved')!.reviewerName, isNull);
    });
  });
}
