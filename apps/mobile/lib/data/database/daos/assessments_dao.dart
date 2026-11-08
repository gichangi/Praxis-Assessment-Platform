import 'package:drift/drift.dart';

import '../app_database.dart';

part 'assessments_dao.g.dart';

@DriftAccessor(tables: [
  LocalAssessments,
  LocalResponses,
  LocalFormVersions,
  LocalLocations,
  LocalHelpArticles,
  LocalAttachments,
  LocalMembers,
  LocalForms,
  LocalFormLocations,
  LocalSyncLogs,
])
class AssessmentsDao extends DatabaseAccessor<AppDatabase> with _$AssessmentsDaoMixin {
  AssessmentsDao(super.db);

  // ── Assessments ────────────────────────────────────────────────────────────

  Stream<List<LocalAssessment>> watchAll() =>
      (select(localAssessments)..orderBy([(t) => OrderingTerm.desc(t.updatedAt)])).watch();

  Future<LocalAssessment?> getById(String id) =>
      (select(localAssessments)..where((t) => t.id.equals(id))).getSingleOrNull();

  Future<int> upsertAssessment(LocalAssessmentsCompanion row) =>
      into(localAssessments).insertOnConflictUpdate(row);

  Future<void> markAssessmentClean(String id) => (update(localAssessments)
        ..where((t) => t.id.equals(id)))
      .write(LocalAssessmentsCompanion(dirty: const Value(false)));

  Future<List<LocalAssessment>> getDirty() =>
      (select(localAssessments)..where((t) => t.dirty.equals(true))).get();

  // ── Responses ──────────────────────────────────────────────────────────────

  Future<List<LocalResponse>> responsesFor(String assessmentId) =>
      (select(localResponses)..where((t) => t.assessmentId.equals(assessmentId))).get();

  Stream<List<LocalResponse>> watchResponses(String assessmentId) =>
      (select(localResponses)..where((t) => t.assessmentId.equals(assessmentId))).watch();

  Future<int> upsertResponse(LocalResponsesCompanion row) =>
      into(localResponses).insertOnConflictUpdate(row);

  Future<List<LocalResponse>> getDirtyResponses() =>
      (select(localResponses)..where((t) => t.dirty.equals(true))).get();

  Future<void> markResponseClean(String assessmentId, String itemKey) =>
      (update(localResponses)
            ..where((t) => t.assessmentId.equals(assessmentId) & t.itemKey.equals(itemKey)))
          .write(LocalResponsesCompanion(dirty: const Value(false)));

  Future<void> markResponsesClean(String assessmentId) =>
      (update(localResponses)..where((t) => t.assessmentId.equals(assessmentId)))
          .write(LocalResponsesCompanion(dirty: const Value(false)));

  /// Assessments that still have answers waiting to be uploaded.
  Stream<Set<String>> watchAssessmentIdsWithPendingResponses() {
    final q = selectOnly(localResponses, distinct: true)
      ..addColumns([localResponses.assessmentId])
      ..where(localResponses.dirty.equals(true));
    return q.watch().map((rows) => {for (final r in rows) r.read(localResponses.assessmentId)!});
  }

  // ── Locations ──────────────────────────────────────────────────────────────

  Future<List<LocalLocation>> allLocations() => select(localLocations).get();

  Future<void> upsertLocations(List<LocalLocationsCompanion> rows) =>
      batch((b) => b.insertAllOnConflictUpdate(localLocations, rows));

  // ── Form versions ──────────────────────────────────────────────────────────

  Future<LocalFormVersion?> formVersionById(String id) =>
      (select(localFormVersions)..where((t) => t.id.equals(id))).getSingleOrNull();

  Future<List<LocalFormVersion>> publishedVersionsOf(String formId) => (select(localFormVersions)
        ..where((t) => t.formId.equals(formId) & t.status.equals('published')))
      .get();

  /// Ids the phone already holds, sent to the server so it only returns what is missing.
  Future<List<String>> allFormVersionIds() async {
    final q = selectOnly(localFormVersions)..addColumns([localFormVersions.id]);
    return [for (final r in await q.get()) r.read(localFormVersions.id)!];
  }

  Future<Map<String, String>> versionLabelById() async {
    final q = selectOnly(localFormVersions)
      ..addColumns([localFormVersions.id, localFormVersions.version]);
    return {
      for (final r in await q.get())
        r.read(localFormVersions.id)!: r.read(localFormVersions.version)!,
    };
  }

  Future<Map<String, String>> formIdByVersionId() async {
    final q = selectOnly(localFormVersions)
      ..addColumns([localFormVersions.id, localFormVersions.formId]);
    return {
      for (final r in await q.get())
        r.read(localFormVersions.id)!: r.read(localFormVersions.formId)!,
    };
  }

  Future<int> upsertFormVersion(LocalFormVersionsCompanion row) =>
      into(localFormVersions).insertOnConflictUpdate(row);

  // ── Forms and assignments ──────────────────────────────────────────────────

  Future<List<LocalForm>> allForms() => select(localForms).get();

  Future<void> upsertForms(List<LocalFormsCompanion> rows) =>
      batch((b) => b.insertAllOnConflictUpdate(localForms, rows));

  Future<List<LocalFormLocation>> allFormLocations() => select(localFormLocations).get();

  /// The server sends the complete current list on every sync, so removed assignments vanish.
  Future<void> replaceFormLocations(List<LocalFormLocationsCompanion> rows) => transaction(() async {
        await delete(localFormLocations).go();
        await batch((b) => b.insertAll(localFormLocations, rows, mode: InsertMode.insertOrIgnore));
      });

  // ── Help articles ──────────────────────────────────────────────────────────

  Future<List<LocalHelpArticle>> allHelpArticles() =>
      (select(localHelpArticles)..orderBy([(t) => OrderingTerm.asc(t.slug)])).get();

  Future<int> upsertHelpArticle(LocalHelpArticlesCompanion row) =>
      into(localHelpArticles).insertOnConflictUpdate(row);

  // ── Members ────────────────────────────────────────────────────────────────

  Future<List<LocalMember>> allMembers() =>
      (select(localMembers)..orderBy([(t) => OrderingTerm.asc(t.fullName)])).get();

  Future<void> upsertMembers(List<LocalMembersCompanion> rows) =>
      batch((b) => b.insertAllOnConflictUpdate(localMembers, rows));

  // ── Attachments ────────────────────────────────────────────────────────────

  Future<List<LocalAttachment>> attachmentsFor(String assessmentId, String itemKey) =>
      (select(localAttachments)
            ..where((t) => t.assessmentId.equals(assessmentId) & t.itemKey.equals(itemKey))
            ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
          .get();

  Stream<List<LocalAttachment>> watchAttachments(String assessmentId, String itemKey) =>
      (select(localAttachments)
            ..where((t) => t.assessmentId.equals(assessmentId) & t.itemKey.equals(itemKey))
            ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
          .watch();

  Future<List<LocalAttachment>> pendingUploads() =>
      (select(localAttachments)..where((t) => t.uploaded.equals(false))).get();

  Future<int> insertAttachment(LocalAttachmentsCompanion row) =>
      into(localAttachments).insertOnConflictUpdate(row);

  Future<void> markAttachmentUploaded(String id, String storagePath) =>
      (update(localAttachments)..where((t) => t.id.equals(id))).write(
        LocalAttachmentsCompanion(
          uploaded: const Value(true),
          storagePath: Value(storagePath),
        ),
      );

  Future<void> deleteAttachment(String id) =>
      (delete(localAttachments)..where((t) => t.id.equals(id))).go();

  // ── Sync log ───────────────────────────────────────────────────────────────

  /// How many sync lines to keep.
  static const syncLogKeep = 50;

  /// Outcomes where the server answered and the phone is up to date as of that moment.
  static const syncedOutcomes = ['ok', 'conflict', 'rejected'];

  Future<void> recordSync({
    required String outcome,
    String? message,
    String? endpoint,
    int pushed = 0,
    int pulled = 0,
    int rejected = 0,
    DateTime? at,
  }) async {
    await into(localSyncLogs).insert(LocalSyncLogsCompanion.insert(
      at: at ?? DateTime.now(),
      outcome: outcome,
      message: Value(message),
      endpoint: Value(endpoint),
      pushed: Value(pushed),
      pulled: Value(pulled),
      rejected: Value(rejected),
    ));
    // Keep only the newest lines.
    await customStatement(
      'DELETE FROM local_sync_logs WHERE id NOT IN '
      '(SELECT id FROM local_sync_logs ORDER BY at DESC, id DESC LIMIT $syncLogKeep)',
    );
  }

  Stream<List<LocalSyncLog>> watchSyncLog() => (select(localSyncLogs)
        ..orderBy([(t) => OrderingTerm.desc(t.at), (t) => OrderingTerm.desc(t.id)]))
      .watch();

  /// The latest sync attempt, whatever happened.
  Stream<LocalSyncLog?> watchLastSyncAttempt() => (select(localSyncLogs)
        ..orderBy([(t) => OrderingTerm.desc(t.at), (t) => OrderingTerm.desc(t.id)])
        ..limit(1))
      .watchSingleOrNull();

  /// The latest sync that reached the server.
  Stream<LocalSyncLog?> watchLastSuccessfulSync() => (select(localSyncLogs)
        ..where((t) => t.outcome.isIn(syncedOutcomes))
        ..orderBy([(t) => OrderingTerm.desc(t.at), (t) => OrderingTerm.desc(t.id)])
        ..limit(1))
      .watchSingleOrNull();

  Future<void> clearSyncLog() => delete(localSyncLogs).go();

  /// Assessments with changes saved on this phone that haven't reached the server yet.
  Stream<int> watchPendingUploadCount() => customSelect(
        'SELECT COUNT(*) AS c FROM ('
        'SELECT id FROM local_assessments WHERE dirty = 1 '
        'UNION SELECT assessment_id FROM local_responses WHERE dirty = 1)',
        readsFrom: {localAssessments, localResponses},
      ).watchSingle().map((r) => r.read<int>('c'));
}
