import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/data/database/app_database.dart';
import 'package:assessment_platform/data/repositories/assessment_repository.dart';

void main() {
  late AppDatabase db;
  late AssessmentRepository repo;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repo = AssessmentRepository(db);
  });

  tearDown(() => db.close());

  Future<void> addForm(String id, {String title = '{"en":"Form"}'}) =>
      db.assessmentsDao.upsertForms([
        LocalFormsCompanion.insert(
            id: id, organisationId: 'org', key: 'key_$id', titleJson: title),
      ]);

  Future<void> addVersion(String id, String formId, String version,
          {String status = 'published'}) =>
      db.assessmentsDao.upsertFormVersion(LocalFormVersionsCompanion.insert(
        id: id,
        formId: formId,
        version: version,
        definitionJson: '{}',
        status: Value(status),
      ));

  Future<void> assign(List<(String, String)> pairs) => db.assessmentsDao.replaceFormLocations([
        for (final (form, loc) in pairs)
          LocalFormLocationsCompanion.insert(formId: form, locationId: loc),
      ]);

  group('getAssignedForms', () {
    test('offers only assigned forms that have a published version', () async {
      await addForm('f_assigned');
      await addForm('f_unassigned');
      await addForm('f_unpublished');
      await addVersion('v1', 'f_assigned', '1.0.0');
      await addVersion('v2', 'f_unassigned', '1.0.0');
      await addVersion('v3', 'f_unpublished', '1.0.0', status: 'archived');
      await assign([('f_assigned', 'loc1'), ('f_unpublished', 'loc1')]);

      final forms = await repo.getAssignedForms();

      expect(forms.map((f) => f.form.id), ['f_assigned']);
    });

    test('uses the newest published version, comparing numbers rather than text', () async {
      await addForm('f');
      await addVersion('v_old', 'f', '1.9.0');
      await addVersion('v_new', 'f', '1.10.0');
      await addVersion('v_archived', 'f', '2.0.0', status: 'archived');
      await assign([('f', 'loc1')]);

      final forms = await repo.getAssignedForms();

      expect(forms.single.version.id, 'v_new');
    });

    test('after a new version is published and synced, new assessments use it', () async {
      // What a phone holds once it has synced: the old version marked superseded, the new one active.
      await addForm('f');
      await addVersion('v1', 'f', '1.0.0', status: 'archived');
      await addVersion('v2', 'f', '1.1.0');
      await assign([('f', 'loc1')]);

      expect((await repo.getAssignedForms()).single.version.id, 'v2');
    });

    test('before the new version has synced, the phone keeps using the one it has', () async {
      await addForm('f');
      await addVersion('v1', 'f', '1.0.0');
      await assign([('f', 'loc1')]);

      expect((await repo.getAssignedForms()).single.version.id, 'v1');
    });

    test('a superseded version stays available for assessments already started on it', () async {
      await addForm('f');
      await addVersion('v1', 'f', '1.0.0', status: 'archived');
      await addVersion('v2', 'f', '1.1.0');

      expect((await repo.getFormVersion('v1'))?.version, '1.0.0');
      expect((await repo.loadLookups('en')).versionLabelByVersionId, {'v1': '1.0.0', 'v2': '1.1.0'});
    });

    test('carries every location the form is assigned to', () async {
      await addForm('f');
      await addVersion('v', 'f', '1.0.0');
      await assign([('f', 'loc1'), ('f', 'loc2')]);

      final forms = await repo.getAssignedForms();

      expect(forms.single.locationIds, {'loc1', 'loc2'});
    });

    test('an assignment removed on the server disappears on the next sync', () async {
      await addForm('f');
      await addVersion('v', 'f', '1.0.0');
      await assign([('f', 'loc1'), ('f', 'loc2')]);
      await assign([('f', 'loc2')]);

      final forms = await repo.getAssignedForms();

      expect(forms.single.locationIds, {'loc2'});
    });

    test('an empty list from the server withdraws every assignment', () async {
      await addForm('f');
      await addVersion('v', 'f', '1.0.0');
      await assign([('f', 'loc1')]);
      await assign([]);

      expect(await repo.getAssignedForms(), isEmpty);
    });

    test('resolves the title in the requested language, falling back to English', () async {
      await addForm('f', title: '{"en":"District form","so":"Foomka degmada"}');
      await addVersion('v', 'f', '1.0.0');
      await assign([('f', 'loc1')]);

      final form = (await repo.getAssignedForms()).single;

      expect(form.title('so'), 'Foomka degmada');
      expect(form.title('ar'), 'District form');
    });
  });

  group('pending responses', () {
    Future<void> addAssessment(String id) => db.assessmentsDao.upsertAssessment(
          LocalAssessmentsCompanion.insert(
            id: id,
            organisationId: 'org',
            formVersionId: 'v',
            locationId: 'loc1',
            createdBy: 'user',
            assessedOn: '2026-10-01',
          ),
        );

    test('lists only assessments that still have unsent answers', () async {
      await addAssessment('a_pending');
      await addAssessment('a_sent');
      await db.assessmentsDao.upsertResponse(LocalResponsesCompanion.insert(
          assessmentId: 'a_pending', itemKey: 'q1', dirty: const Value(true)));
      await db.assessmentsDao.upsertResponse(LocalResponsesCompanion.insert(
          assessmentId: 'a_sent', itemKey: 'q1', dirty: const Value(false)));

      expect(await repo.watchPendingResponseIds().first, {'a_pending'});
    });
  });

  group('form version lookup', () {
    test('formIdByVersionId maps every stored version to its form', () async {
      await addForm('f1');
      await addForm('f2');
      await addVersion('v1', 'f1', '1.0.0');
      await addVersion('v2', 'f2', '1.0.0');

      expect(await repo.formIdByVersionId(), {'v1': 'f1', 'v2': 'f2'});
    });
  });
}
