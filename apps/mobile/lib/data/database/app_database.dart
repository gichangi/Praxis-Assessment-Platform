import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'tables.dart';
import 'daos/assessments_dao.dart';

export 'tables.dart';
export 'daos/assessments_dao.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    LocalAssessments,
    LocalResponses,
    LocalFormVersions,
    LocalLocations,
    LocalHelpArticles,
    LocalAttachments,
    LocalMembers,
  ],
  daos: [AssessmentsDao],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 4;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {
      if (from < 2) {
        await m.createTable(localHelpArticles);
        await m.createTable(localAttachments);
      }
      if (from < 3) {
        // Replace LocalDistricts with LocalLocations; rename districtId → locationId.
        await m.deleteTable('local_districts');
        await m.createTable(localLocations);
        await m.addColumn(localAssessments, localAssessments.locationId);
        await customStatement(
          'UPDATE local_assessments SET location_id = district_id WHERE location_id IS NULL',
        );
        await m.alterTable(TableMigration(localAssessments));
      }
      if (from < 4) {
        await m.createTable(localMembers);
        await m.addColumn(localAssessments, localAssessments.assessorsJson);
      }
    },
  );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'assessment_platform.db'));
    return NativeDatabase.createInBackground(file);
  });
}
