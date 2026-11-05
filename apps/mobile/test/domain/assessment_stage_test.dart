import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/domain/assessment_stage.dart';
import 'package:assessment_platform/domain/versions.dart';

void main() {
  group('assessmentStage', () {
    test('an unfinished assessment is a draft, whether or not it was uploaded', () {
      expect(assessmentStage(status: 'draft', hasPendingChanges: true), AssessmentStage.draft);
      expect(assessmentStage(status: 'draft', hasPendingChanges: false), AssessmentStage.draft);
    });

    test('a submitted assessment still waiting for a connection is completed', () {
      expect(assessmentStage(status: 'submitted', hasPendingChanges: true), AssessmentStage.completed);
    });

    test('a submitted assessment with nothing left to upload is synced', () {
      expect(assessmentStage(status: 'submitted', hasPendingChanges: false), AssessmentStage.synced);
    });

    test('reviewer decisions win over sync state', () {
      expect(assessmentStage(status: 'returned', hasPendingChanges: true), AssessmentStage.returned);
      expect(assessmentStage(status: 'approved', hasPendingChanges: false), AssessmentStage.approved);
    });

    test('an unknown status is treated as a draft rather than hidden', () {
      expect(assessmentStage(status: 'something_new', hasPendingChanges: false), AssessmentStage.draft);
    });
  });

  group('compareVersions', () {
    test('compares numbers, not text', () {
      expect(compareVersions('1.10.0', '1.9.0'), greaterThan(0));
      expect(compareVersions('1.9.0', '1.10.0'), lessThan(0));
    });

    test('treats missing parts as zero', () {
      expect(compareVersions('2', '2.0.0'), 0);
      expect(compareVersions('2.1', '2.0.9'), greaterThan(0));
    });

    test('ignores unreadable parts instead of throwing', () {
      expect(compareVersions('1.x.0', '1.0.0'), 0);
    });
  });
}
