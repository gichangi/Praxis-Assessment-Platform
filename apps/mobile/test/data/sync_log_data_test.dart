import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/data/database/app_database.dart';

void main() {
  late AppDatabase db;

  setUp(() => db = AppDatabase.forTesting(NativeDatabase.memory()));
  tearDown(() => db.close());

  final t0 = DateTime.utc(2026, 11, 8, 10);

  test('keeps each sync with its counts, newest first', () async {
    final dao = db.assessmentsDao;
    await dao.recordSync(outcome: 'ok', pushed: 2, pulled: 5, at: t0);
    await dao.recordSync(outcome: 'error', message: 'boom', at: t0.add(const Duration(minutes: 2)));

    final log = await dao.watchSyncLog().first;
    expect(log.map((l) => l.outcome), ['error', 'ok']);
    expect(log.last.pushed, 2);
    expect(log.last.pulled, 5);
    expect(log.first.message, 'boom');
  });

  test('the last attempt can fail while the last success stays put', () async {
    final dao = db.assessmentsDao;
    await dao.recordSync(outcome: 'ok', at: t0);
    await dao.recordSync(outcome: 'conflict', rejected: 1, at: t0.add(const Duration(minutes: 1)));
    await dao.recordSync(outcome: 'offline', at: t0.add(const Duration(minutes: 2)));

    expect((await dao.watchLastSyncAttempt().first)!.outcome, 'offline');
    final success = await dao.watchLastSuccessfulSync().first;
    // A sync that reached the server but had conflicts still counts as synced.
    expect(success!.outcome, 'conflict');
    expect(success.at.isAtSameMomentAs(t0.add(const Duration(minutes: 1))), isTrue);
  });

  test('there is no last success before one happens', () async {
    await db.assessmentsDao.recordSync(outcome: 'error', message: 'x', at: t0);
    expect(await db.assessmentsDao.watchLastSuccessfulSync().first, isNull);
    expect(await db.assessmentsDao.watchLastSyncAttempt().first, isNotNull);
  });

  test('keeps only the newest lines', () async {
    final dao = db.assessmentsDao;
    for (var i = 0; i < AssessmentsDao.syncLogKeep + 10; i++) {
      await dao.recordSync(outcome: 'ok', pulled: i, at: t0.add(Duration(minutes: i)));
    }
    final log = await dao.watchSyncLog().first;
    expect(log.length, AssessmentsDao.syncLogKeep);
    expect(log.first.pulled, AssessmentsDao.syncLogKeep + 9);
    expect(log.last.pulled, 10);
  });

  test('remembers the address that was called', () async {
    await db.assessmentsDao.recordSync(
      outcome: 'error',
      message: 'HTTP 500',
      endpoint: 'POST https://s/functions/v1/sync',
      at: t0,
    );
    final log = await db.assessmentsDao.watchSyncLog().first;
    expect(log.single.endpoint, 'POST https://s/functions/v1/sync');
  });

  test('can be cleared', () async {
    await db.assessmentsDao.recordSync(outcome: 'ok', at: t0);
    await db.assessmentsDao.clearSyncLog();
    expect(await db.assessmentsDao.watchSyncLog().first, isEmpty);
  });

  test('counts assessments with changes waiting to upload', () async {
    final dao = db.assessmentsDao;
    expect(await dao.watchPendingUploadCount().first, 0);

    Future<void> assessment(String id, {required bool dirty}) => dao.upsertAssessment(LocalAssessmentsCompanion(
          id: Value(id),
          organisationId: const Value('org'),
          formVersionId: const Value('fv'),
          locationId: const Value('loc'),
          createdBy: const Value('me'),
          assessedOn: const Value('2026-11-01'),
          dirty: Value(dirty),
        ));
    await assessment('a1', dirty: true);
    await assessment('a2', dirty: false);
    await assessment('a3', dirty: false);
    // a3 is clean itself, but one of its answers hasn't been uploaded.
    await dao.upsertResponse(LocalResponsesCompanion(
      assessmentId: const Value('a3'),
      itemKey: const Value('q1'),
      value: const Value(3),
      dirty: const Value(true),
    ));
    // a1 has a waiting answer too: still one assessment, not two.
    await dao.upsertResponse(LocalResponsesCompanion(
      assessmentId: const Value('a1'),
      itemKey: const Value('q1'),
      value: const Value(2),
      dirty: const Value(true),
    ));

    expect(await dao.watchPendingUploadCount().first, 2);
  });
}
