import 'dart:convert';
import 'dart:math';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/text_resolver.dart';
import '../../domain/versions.dart';
import '../database/app_database.dart';

/// A form the signed-in user may start assessments for, with the version to use and where.
class AssignedForm {
  const AssignedForm({required this.form, required this.version, required this.locationIds});

  final LocalForm form;
  final LocalFormVersion version;
  final Set<String> locationIds;

  String title(String lang) {
    final resolved = tJson(form.titleJson, lang, 'en');
    return resolved.isNotEmpty ? resolved : form.key;
  }
}

/// Names for the ids shown on assessment cards.
class AssessmentLookups {
  const AssessmentLookups({
    required this.formTitleByVersionId,
    required this.locationNameById,
    this.versionLabelByVersionId = const {},
    this.memberNameById = const {},
  });

  final Map<String, String> formTitleByVersionId;
  final Map<String, String> locationNameById;

  /// "1.2.0" for each form version on the phone, so an assessment shows which one it uses.
  final Map<String, String> versionLabelByVersionId;

  /// Names of the people in the organisation, to say who reviewed an assessment.
  final Map<String, String> memberNameById;
}

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

  Future<LocalFormVersion?> getFormVersion(String id) => _dao.formVersionById(id);

  Future<Map<String, String>> formIdByVersionId() => _dao.formIdByVersionId();

  /// Forms assigned to this user that have a published version on the phone, with the
  /// newest version to use for a new assessment.
  Future<List<AssignedForm>> getAssignedForms() async {
    final forms = await _dao.allForms();
    final locationsByForm = <String, Set<String>>{};
    for (final p in await _dao.allFormLocations()) {
      (locationsByForm[p.formId] ??= {}).add(p.locationId);
    }

    final result = <AssignedForm>[];
    for (final form in forms) {
      final locationIds = locationsByForm[form.id];
      if (locationIds == null || locationIds.isEmpty) continue;
      final versions = await _dao.publishedVersionsOf(form.id);
      if (versions.isEmpty) continue;
      versions.sort((a, b) => compareVersions(b.version, a.version));
      result.add(AssignedForm(form: form, version: versions.first, locationIds: locationIds));
    }
    return result;
  }

  Future<AssessmentLookups> loadLookups(String lang) async {
    final titleByFormId = {
      for (final f in await _dao.allForms()) f.id: tJson(f.titleJson, lang, 'en'),
    };
    final formIdByVersion = await _dao.formIdByVersionId();
    return AssessmentLookups(
      formTitleByVersionId: {
        for (final e in formIdByVersion.entries) e.key: titleByFormId[e.value] ?? '',
      },
      locationNameById: {
        for (final l in await _dao.allLocations())
          l.id: tJson(l.nameJson, lang, 'en').ifEmpty(l.code),
      },
      versionLabelByVersionId: await _dao.versionLabelById(),
      memberNameById: {for (final m in await _dao.allMembers()) m.id: m.fullName},
    );
  }

  /// Assessments with answers that have not reached the server yet.
  Stream<Set<String>> watchPendingResponseIds() => _dao.watchAssessmentIdsWithPendingResponses();

  /// The server refused a submission: take the status it kept, without queuing another upload.
  Future<void> restoreServerStatus(String assessmentId, String status) =>
      _dao.upsertAssessment(LocalAssessmentsCompanion(
        id: Value(assessmentId),
        status: Value(status),
        dirty: const Value(false),
      ));
}

extension on String {
  String ifEmpty(String other) => isEmpty ? other : this;
}
