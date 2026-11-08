import 'package:drift/drift.dart';

/// Local cache of published form definition JSON blobs pulled from the server.
class LocalFormVersions extends Table {
  TextColumn get id => text()();
  TextColumn get formId => text()();
  TextColumn get version => text()();
  TextColumn get definitionJson => text()();
  TextColumn get status => text().withDefault(const Constant('published'))(); // published|archived
  DateTimeColumn get pulledAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

/// Forms the user can see: assigned ones, plus those behind existing assessments.
class LocalForms extends Table {
  TextColumn get id => text()();
  TextColumn get organisationId => text()();
  TextColumn get key => text()();
  TextColumn get titleJson => text()(); // jsonb {"en":..., "so":..., "ar":...}

  @override
  Set<Column> get primaryKey => {id};
}

/// Where each form may be assessed by this user. Computed by the server (assignments
/// expanded over the location tree and capped by the user's own access); replaced on every sync.
class LocalFormLocations extends Table {
  TextColumn get formId => text()();
  TextColumn get locationId => text()();

  @override
  Set<Column> get primaryKey => {formId, locationId};
}

/// Local mirror of server `assessments` table.
/// IDs are generated on the device (UUIDs) so records survive offline creation.
class LocalAssessments extends Table {
  TextColumn get id => text()();
  TextColumn get organisationId => text()();
  TextColumn get formVersionId => text()();
  TextColumn get locationId => text()();
  TextColumn get language => text().withDefault(const Constant('en'))();
  TextColumn get status =>
      text().withDefault(const Constant('draft'))(); // draft|submitted|returned|approved|rejected
  TextColumn get createdBy => text()();
  TextColumn get assessedOn => text()(); // ISO date string YYYY-MM-DD
  TextColumn get assessorsJson => text().nullable()(); // JSON array of co-assessor user IDs
  TextColumn get reviewNote => text().nullable()();
  /// Who approved, returned or rejected it, and when. Set by the server.
  TextColumn get reviewedBy => text().nullable()();
  DateTimeColumn get reviewedAt => dateTime().nullable()();
  TextColumn get totalsJson => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  BoolColumn get dirty => boolean().withDefault(const Constant(true))();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached list of org members, used for the co-assessor picker.
class LocalMembers extends Table {
  TextColumn get id => text()(); // auth user_id
  TextColumn get fullName => text()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Local mirror of server `responses` table (one row per answered item).
class LocalResponses extends Table {
  TextColumn get assessmentId => text()();
  TextColumn get itemKey => text()();
  RealColumn get value => real().nullable()();
  BoolColumn get notAssessed => boolean().withDefault(const Constant(false))();
  TextColumn get note => text().nullable()();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  BoolColumn get dirty => boolean().withDefault(const Constant(true))();

  @override
  Set<Column> get primaryKey => {assessmentId, itemKey};
}

/// Locations pulled from the server (for the "new assessment" picker).
class LocalLocations extends Table {
  TextColumn get id => text()();
  TextColumn get parentId => text().nullable()();
  TextColumn get code => text()();
  TextColumn get nameJson => text()(); // jsonb {"en":..., "so":..., "ar":...}
  IntColumn  get level => integer().withDefault(const Constant(0))();
  BoolColumn get active => boolean().withDefault(const Constant(true))();

  @override
  Set<Column> get primaryKey => {id};
}

/// Help articles pulled from the server for offline access.
class LocalHelpArticles extends Table {
  TextColumn get id => text()();
  TextColumn get slug => text()();
  TextColumn get titleJson => text()();
  TextColumn get bodyJson => text()(); // markdown per language
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

/// Locally created attachments (voice notes or photos) pending upload.
class LocalAttachments extends Table {
  TextColumn get id => text()();
  TextColumn get assessmentId => text()();
  TextColumn get itemKey => text().nullable()();
  TextColumn get kind => text()(); // 'voice' | 'photo'
  TextColumn get localPath => text()();
  TextColumn get storagePath => text().nullable()(); // set after successful upload
  TextColumn get mimeType => text().nullable()();
  IntColumn get sizeBytes => integer().nullable()();
  BoolColumn get uploaded => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

/// One line per sync attempt, so people can see when the phone last synced and why a sync failed.
/// Holds counts and short messages only, never assessment answers.
class LocalSyncLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  DateTimeColumn get at => dateTime()();

  /// 'ok' | 'conflict' | 'rejected' | 'error' | 'offline'
  TextColumn get outcome => text()();
  TextColumn get message => text().nullable()();

  /// The address the phone called, e.g. `POST https://server/functions/v1/sync`.
  TextColumn get endpoint => text().nullable()();
  IntColumn get pushed => integer().withDefault(const Constant(0))();
  IntColumn get pulled => integer().withDefault(const Constant(0))();
  IntColumn get rejected => integer().withDefault(const Constant(0))();
}
