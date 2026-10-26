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

  // ── Locations ──────────────────────────────────────────────────────────────

  Future<List<LocalLocation>> allLocations() => select(localLocations).get();

  Future<void> upsertLocations(List<LocalLocationsCompanion> rows) =>
      batch((b) => b.insertAllOnConflictUpdate(localLocations, rows));

  // ── Form versions ──────────────────────────────────────────────────────────

  Future<LocalFormVersion?> latestFormVersion() =>
      (select(localFormVersions)..orderBy([(t) => OrderingTerm.desc(t.pulledAt)])..limit(1))
          .getSingleOrNull();

  Future<int> upsertFormVersion(LocalFormVersionsCompanion row) =>
      into(localFormVersions).insertOnConflictUpdate(row);

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
}
