import 'dart:convert';
import 'dart:math';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../database/app_database.dart';

String _newUuid() {
  final r = Random.secure();
  final bytes = List<int>.generate(16, (_) => r.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  String hex(int b) => b.toRadixString(16).padLeft(2, '0');
  final h = bytes.map(hex).join();
  return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}';
}

final dbProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(db.close);
  return db;
});

final assessmentRepoProvider = Provider<AssessmentRepository>(
  (ref) => AssessmentRepository(ref.watch(dbProvider)),
);

class AssessmentRepository {
  final AppDatabase _db;
  AssessmentRepository(this._db);

  AssessmentsDao get _dao => _db.assessmentsDao;

  Stream<List<LocalAssessment>> watchAssessments() => _dao.watchAll();

  Future<LocalAssessment?> getAssessment(String id) => _dao.getById(id);

  /// Create a brand-new draft assessment (called from the device — UUID is generated here).
  Future<String> createAssessment({
    required String organisationId,
    required String formVersionId,
    required String locationId,
    required String language,
    required String createdBy,
    required String assessedOn,
  }) async {
    final id = _newUuid();
    await _dao.upsertAssessment(LocalAssessmentsCompanion.insert(
      id: id,
      organisationId: organisationId,
      formVersionId: formVersionId,
      locationId: locationId,
      language: Value(language),
      createdBy: createdBy,
      assessedOn: assessedOn,
    ));
    return id;
  }

  /// Save or update a single item response.
  Future<void> saveResponse({
    required String assessmentId,
    required String itemKey,
    double? value,
    bool notAssessed = false,
    String? note,
  }) async {
    await _dao.upsertResponse(LocalResponsesCompanion.insert(
      assessmentId: assessmentId,
      itemKey: itemKey,
      value: Value(value),
      notAssessed: Value(notAssessed),
      note: Value(note),
      updatedAt: Value(DateTime.now()),
      dirty: const Value(true),
    ));
    // Mark the parent assessment dirty too
    await _dao.upsertAssessment(LocalAssessmentsCompanion(
      id: Value(assessmentId),
      updatedAt: Value(DateTime.now()),
      dirty: const Value(true),
    ));
  }

  Stream<List<LocalResponse>> watchResponses(String assessmentId) =>
      _dao.watchResponses(assessmentId);

  Future<List<LocalResponse>> getResponses(String assessmentId) =>
      _dao.responsesFor(assessmentId);

  Future<void> updateStatus(String assessmentId, String status) =>
      _dao.upsertAssessment(LocalAssessmentsCompanion(
        id: Value(assessmentId),
        status: Value(status),
        updatedAt: Value(DateTime.now()),
        dirty: const Value(true),
      ));

  Future<List<LocalLocation>> getLocations() => _dao.allLocations();

  Future<List<LocalMember>> getMembers() => _dao.allMembers();

  Future<void> updateAssessors(String assessmentId, List<String> assessorIds) =>
      _dao.upsertAssessment(LocalAssessmentsCompanion(
        id: Value(assessmentId),
        assessorsJson: Value(assessorIds.isEmpty ? null : jsonEncode(assessorIds)),
        updatedAt: Value(DateTime.now()),
        dirty: const Value(true),
      ));

  Future<LocalFormVersion?> getLatestFormVersion() => _dao.latestFormVersion();
}
