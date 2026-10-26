// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assessments_dao.dart';

// ignore_for_file: type=lint
mixin _$AssessmentsDaoMixin on DatabaseAccessor<AppDatabase> {
  $LocalAssessmentsTable get localAssessments =>
      attachedDatabase.localAssessments;
  $LocalResponsesTable get localResponses => attachedDatabase.localResponses;
  $LocalFormVersionsTable get localFormVersions =>
      attachedDatabase.localFormVersions;
  $LocalLocationsTable get localLocations => attachedDatabase.localLocations;
  $LocalHelpArticlesTable get localHelpArticles =>
      attachedDatabase.localHelpArticles;
  $LocalAttachmentsTable get localAttachments =>
      attachedDatabase.localAttachments;
  $LocalMembersTable get localMembers => attachedDatabase.localMembers;
  AssessmentsDaoManager get managers => AssessmentsDaoManager(this);
}

class AssessmentsDaoManager {
  final _$AssessmentsDaoMixin _db;
  AssessmentsDaoManager(this._db);
  $$LocalAssessmentsTableTableManager get localAssessments =>
      $$LocalAssessmentsTableTableManager(
        _db.attachedDatabase,
        _db.localAssessments,
      );
  $$LocalResponsesTableTableManager get localResponses =>
      $$LocalResponsesTableTableManager(
        _db.attachedDatabase,
        _db.localResponses,
      );
  $$LocalFormVersionsTableTableManager get localFormVersions =>
      $$LocalFormVersionsTableTableManager(
        _db.attachedDatabase,
        _db.localFormVersions,
      );
  $$LocalLocationsTableTableManager get localLocations =>
      $$LocalLocationsTableTableManager(
        _db.attachedDatabase,
        _db.localLocations,
      );
  $$LocalHelpArticlesTableTableManager get localHelpArticles =>
      $$LocalHelpArticlesTableTableManager(
        _db.attachedDatabase,
        _db.localHelpArticles,
      );
  $$LocalAttachmentsTableTableManager get localAttachments =>
      $$LocalAttachmentsTableTableManager(
        _db.attachedDatabase,
        _db.localAttachments,
      );
  $$LocalMembersTableTableManager get localMembers =>
      $$LocalMembersTableTableManager(_db.attachedDatabase, _db.localMembers);
}
