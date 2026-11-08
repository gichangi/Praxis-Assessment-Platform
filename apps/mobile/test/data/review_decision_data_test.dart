import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/data/database/app_database.dart';
import 'package:assessment_platform/data/repositories/assessment_repository.dart';
import 'package:assessment_platform/domain/review_decision.dart';

void main() {
  late AppDatabase db;
  late AssessmentRepository repo;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repo = AssessmentRepository(db);
  });

  tearDown(() => db.close());

  test('keeps who reviewed an assessment, when, and the message', () async {
    final when = DateTime.utc(2026, 11, 8, 10);
    await db.assessmentsDao.upsertAssessment(LocalAssessmentsCompanion(
      id: const Value('a1'),
      organisationId: const Value('org'),
      formVersionId: const Value('fv'),
      locationId: const Value('loc'),
      status: const Value('rejected'),
      createdBy: const Value('me'),
      assessedOn: const Value('2026-11-01'),
      reviewNote: const Value('Evidence is missing'),
      reviewedBy: const Value('boss'),
      reviewedAt: Value(when),
      dirty: const Value(false),
    ));
    await db.assessmentsDao.upsertMembers([
      LocalMembersCompanion.insert(id: 'boss', fullName: 'Demo Admin'),
    ]);

    final saved = (await db.select(db.localAssessments).get()).single;
    expect(saved.reviewedBy, 'boss');
    expect(saved.reviewedAt!.toUtc(), when);

    // The names the list and summary screens use to say who decided.
    final lookups = await repo.loadLookups('en');
    final decision = reviewDecisionOf(
      status: saved.status,
      reviewedBy: saved.reviewedBy,
      reviewedAt: saved.reviewedAt,
      note: saved.reviewNote,
      memberNames: lookups.memberNameById,
    )!;
    expect(decision.outcome, ReviewOutcome.rejected);
    expect(decision.reviewerName, 'Demo Admin');
    expect(decision.message, 'Evidence is missing');
  });

  test('an assessment with no decision recorded has no reviewer', () async {
    await db.assessmentsDao.upsertAssessment(LocalAssessmentsCompanion(
      id: const Value('a2'),
      organisationId: const Value('org'),
      formVersionId: const Value('fv'),
      locationId: const Value('loc'),
      createdBy: const Value('me'),
      assessedOn: const Value('2026-11-01'),
    ));
    final saved = (await db.select(db.localAssessments).get()).single;
    expect(saved.reviewedBy, isNull);
    expect(saved.reviewedAt, isNull);
  });
}
