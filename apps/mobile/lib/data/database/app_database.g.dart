// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $LocalAssessmentsTable extends LocalAssessments
    with TableInfo<$LocalAssessmentsTable, LocalAssessment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalAssessmentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _organisationIdMeta = const VerificationMeta(
    'organisationId',
  );
  @override
  late final GeneratedColumn<String> organisationId = GeneratedColumn<String>(
    'organisation_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _formVersionIdMeta = const VerificationMeta(
    'formVersionId',
  );
  @override
  late final GeneratedColumn<String> formVersionId = GeneratedColumn<String>(
    'form_version_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _locationIdMeta = const VerificationMeta(
    'locationId',
  );
  @override
  late final GeneratedColumn<String> locationId = GeneratedColumn<String>(
    'location_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _languageMeta = const VerificationMeta(
    'language',
  );
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
    'language',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('en'),
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('draft'),
  );
  static const VerificationMeta _createdByMeta = const VerificationMeta(
    'createdBy',
  );
  @override
  late final GeneratedColumn<String> createdBy = GeneratedColumn<String>(
    'created_by',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _assessedOnMeta = const VerificationMeta(
    'assessedOn',
  );
  @override
  late final GeneratedColumn<String> assessedOn = GeneratedColumn<String>(
    'assessed_on',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _assessorsJsonMeta = const VerificationMeta(
    'assessorsJson',
  );
  @override
  late final GeneratedColumn<String> assessorsJson = GeneratedColumn<String>(
    'assessors_json',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _reviewNoteMeta = const VerificationMeta(
    'reviewNote',
  );
  @override
  late final GeneratedColumn<String> reviewNote = GeneratedColumn<String>(
    'review_note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _totalsJsonMeta = const VerificationMeta(
    'totalsJson',
  );
  @override
  late final GeneratedColumn<String> totalsJson = GeneratedColumn<String>(
    'totals_json',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _dirtyMeta = const VerificationMeta('dirty');
  @override
  late final GeneratedColumn<bool> dirty = GeneratedColumn<bool>(
    'dirty',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("dirty" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    organisationId,
    formVersionId,
    locationId,
    language,
    status,
    createdBy,
    assessedOn,
    assessorsJson,
    reviewNote,
    totalsJson,
    createdAt,
    updatedAt,
    dirty,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_assessments';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalAssessment> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organisation_id')) {
      context.handle(
        _organisationIdMeta,
        organisationId.isAcceptableOrUnknown(
          data['organisation_id']!,
          _organisationIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_organisationIdMeta);
    }
    if (data.containsKey('form_version_id')) {
      context.handle(
        _formVersionIdMeta,
        formVersionId.isAcceptableOrUnknown(
          data['form_version_id']!,
          _formVersionIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_formVersionIdMeta);
    }
    if (data.containsKey('location_id')) {
      context.handle(
        _locationIdMeta,
        locationId.isAcceptableOrUnknown(data['location_id']!, _locationIdMeta),
      );
    } else if (isInserting) {
      context.missing(_locationIdMeta);
    }
    if (data.containsKey('language')) {
      context.handle(
        _languageMeta,
        language.isAcceptableOrUnknown(data['language']!, _languageMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('created_by')) {
      context.handle(
        _createdByMeta,
        createdBy.isAcceptableOrUnknown(data['created_by']!, _createdByMeta),
      );
    } else if (isInserting) {
      context.missing(_createdByMeta);
    }
    if (data.containsKey('assessed_on')) {
      context.handle(
        _assessedOnMeta,
        assessedOn.isAcceptableOrUnknown(data['assessed_on']!, _assessedOnMeta),
      );
    } else if (isInserting) {
      context.missing(_assessedOnMeta);
    }
    if (data.containsKey('assessors_json')) {
      context.handle(
        _assessorsJsonMeta,
        assessorsJson.isAcceptableOrUnknown(
          data['assessors_json']!,
          _assessorsJsonMeta,
        ),
      );
    }
    if (data.containsKey('review_note')) {
      context.handle(
        _reviewNoteMeta,
        reviewNote.isAcceptableOrUnknown(data['review_note']!, _reviewNoteMeta),
      );
    }
    if (data.containsKey('totals_json')) {
      context.handle(
        _totalsJsonMeta,
        totalsJson.isAcceptableOrUnknown(data['totals_json']!, _totalsJsonMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('dirty')) {
      context.handle(
        _dirtyMeta,
        dirty.isAcceptableOrUnknown(data['dirty']!, _dirtyMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalAssessment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalAssessment(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      organisationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}organisation_id'],
      )!,
      formVersionId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}form_version_id'],
      )!,
      locationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}location_id'],
      )!,
      language: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}language'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      createdBy: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_by'],
      )!,
      assessedOn: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}assessed_on'],
      )!,
      assessorsJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}assessors_json'],
      ),
      reviewNote: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}review_note'],
      ),
      totalsJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}totals_json'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
      dirty: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}dirty'],
      )!,
    );
  }

  @override
  $LocalAssessmentsTable createAlias(String alias) {
    return $LocalAssessmentsTable(attachedDatabase, alias);
  }
}

class LocalAssessment extends DataClass implements Insertable<LocalAssessment> {
  final String id;
  final String organisationId;
  final String formVersionId;
  final String locationId;
  final String language;
  final String status;
  final String createdBy;
  final String assessedOn;
  final String? assessorsJson;
  final String? reviewNote;
  final String? totalsJson;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool dirty;
  const LocalAssessment({
    required this.id,
    required this.organisationId,
    required this.formVersionId,
    required this.locationId,
    required this.language,
    required this.status,
    required this.createdBy,
    required this.assessedOn,
    this.assessorsJson,
    this.reviewNote,
    this.totalsJson,
    required this.createdAt,
    required this.updatedAt,
    required this.dirty,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organisation_id'] = Variable<String>(organisationId);
    map['form_version_id'] = Variable<String>(formVersionId);
    map['location_id'] = Variable<String>(locationId);
    map['language'] = Variable<String>(language);
    map['status'] = Variable<String>(status);
    map['created_by'] = Variable<String>(createdBy);
    map['assessed_on'] = Variable<String>(assessedOn);
    if (!nullToAbsent || assessorsJson != null) {
      map['assessors_json'] = Variable<String>(assessorsJson);
    }
    if (!nullToAbsent || reviewNote != null) {
      map['review_note'] = Variable<String>(reviewNote);
    }
    if (!nullToAbsent || totalsJson != null) {
      map['totals_json'] = Variable<String>(totalsJson);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['dirty'] = Variable<bool>(dirty);
    return map;
  }

  LocalAssessmentsCompanion toCompanion(bool nullToAbsent) {
    return LocalAssessmentsCompanion(
      id: Value(id),
      organisationId: Value(organisationId),
      formVersionId: Value(formVersionId),
      locationId: Value(locationId),
      language: Value(language),
      status: Value(status),
      createdBy: Value(createdBy),
      assessedOn: Value(assessedOn),
      assessorsJson: assessorsJson == null && nullToAbsent
          ? const Value.absent()
          : Value(assessorsJson),
      reviewNote: reviewNote == null && nullToAbsent
          ? const Value.absent()
          : Value(reviewNote),
      totalsJson: totalsJson == null && nullToAbsent
          ? const Value.absent()
          : Value(totalsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      dirty: Value(dirty),
    );
  }

  factory LocalAssessment.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalAssessment(
      id: serializer.fromJson<String>(json['id']),
      organisationId: serializer.fromJson<String>(json['organisationId']),
      formVersionId: serializer.fromJson<String>(json['formVersionId']),
      locationId: serializer.fromJson<String>(json['locationId']),
      language: serializer.fromJson<String>(json['language']),
      status: serializer.fromJson<String>(json['status']),
      createdBy: serializer.fromJson<String>(json['createdBy']),
      assessedOn: serializer.fromJson<String>(json['assessedOn']),
      assessorsJson: serializer.fromJson<String?>(json['assessorsJson']),
      reviewNote: serializer.fromJson<String?>(json['reviewNote']),
      totalsJson: serializer.fromJson<String?>(json['totalsJson']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      dirty: serializer.fromJson<bool>(json['dirty']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organisationId': serializer.toJson<String>(organisationId),
      'formVersionId': serializer.toJson<String>(formVersionId),
      'locationId': serializer.toJson<String>(locationId),
      'language': serializer.toJson<String>(language),
      'status': serializer.toJson<String>(status),
      'createdBy': serializer.toJson<String>(createdBy),
      'assessedOn': serializer.toJson<String>(assessedOn),
      'assessorsJson': serializer.toJson<String?>(assessorsJson),
      'reviewNote': serializer.toJson<String?>(reviewNote),
      'totalsJson': serializer.toJson<String?>(totalsJson),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'dirty': serializer.toJson<bool>(dirty),
    };
  }

  LocalAssessment copyWith({
    String? id,
    String? organisationId,
    String? formVersionId,
    String? locationId,
    String? language,
    String? status,
    String? createdBy,
    String? assessedOn,
    Value<String?> assessorsJson = const Value.absent(),
    Value<String?> reviewNote = const Value.absent(),
    Value<String?> totalsJson = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? dirty,
  }) => LocalAssessment(
    id: id ?? this.id,
    organisationId: organisationId ?? this.organisationId,
    formVersionId: formVersionId ?? this.formVersionId,
    locationId: locationId ?? this.locationId,
    language: language ?? this.language,
    status: status ?? this.status,
    createdBy: createdBy ?? this.createdBy,
    assessedOn: assessedOn ?? this.assessedOn,
    assessorsJson: assessorsJson.present
        ? assessorsJson.value
        : this.assessorsJson,
    reviewNote: reviewNote.present ? reviewNote.value : this.reviewNote,
    totalsJson: totalsJson.present ? totalsJson.value : this.totalsJson,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    dirty: dirty ?? this.dirty,
  );
  LocalAssessment copyWithCompanion(LocalAssessmentsCompanion data) {
    return LocalAssessment(
      id: data.id.present ? data.id.value : this.id,
      organisationId: data.organisationId.present
          ? data.organisationId.value
          : this.organisationId,
      formVersionId: data.formVersionId.present
          ? data.formVersionId.value
          : this.formVersionId,
      locationId: data.locationId.present
          ? data.locationId.value
          : this.locationId,
      language: data.language.present ? data.language.value : this.language,
      status: data.status.present ? data.status.value : this.status,
      createdBy: data.createdBy.present ? data.createdBy.value : this.createdBy,
      assessedOn: data.assessedOn.present
          ? data.assessedOn.value
          : this.assessedOn,
      assessorsJson: data.assessorsJson.present
          ? data.assessorsJson.value
          : this.assessorsJson,
      reviewNote: data.reviewNote.present
          ? data.reviewNote.value
          : this.reviewNote,
      totalsJson: data.totalsJson.present
          ? data.totalsJson.value
          : this.totalsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      dirty: data.dirty.present ? data.dirty.value : this.dirty,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalAssessment(')
          ..write('id: $id, ')
          ..write('organisationId: $organisationId, ')
          ..write('formVersionId: $formVersionId, ')
          ..write('locationId: $locationId, ')
          ..write('language: $language, ')
          ..write('status: $status, ')
          ..write('createdBy: $createdBy, ')
          ..write('assessedOn: $assessedOn, ')
          ..write('assessorsJson: $assessorsJson, ')
          ..write('reviewNote: $reviewNote, ')
          ..write('totalsJson: $totalsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('dirty: $dirty')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    organisationId,
    formVersionId,
    locationId,
    language,
    status,
    createdBy,
    assessedOn,
    assessorsJson,
    reviewNote,
    totalsJson,
    createdAt,
    updatedAt,
    dirty,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalAssessment &&
          other.id == this.id &&
          other.organisationId == this.organisationId &&
          other.formVersionId == this.formVersionId &&
          other.locationId == this.locationId &&
          other.language == this.language &&
          other.status == this.status &&
          other.createdBy == this.createdBy &&
          other.assessedOn == this.assessedOn &&
          other.assessorsJson == this.assessorsJson &&
          other.reviewNote == this.reviewNote &&
          other.totalsJson == this.totalsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.dirty == this.dirty);
}

class LocalAssessmentsCompanion extends UpdateCompanion<LocalAssessment> {
  final Value<String> id;
  final Value<String> organisationId;
  final Value<String> formVersionId;
  final Value<String> locationId;
  final Value<String> language;
  final Value<String> status;
  final Value<String> createdBy;
  final Value<String> assessedOn;
  final Value<String?> assessorsJson;
  final Value<String?> reviewNote;
  final Value<String?> totalsJson;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<bool> dirty;
  final Value<int> rowid;
  const LocalAssessmentsCompanion({
    this.id = const Value.absent(),
    this.organisationId = const Value.absent(),
    this.formVersionId = const Value.absent(),
    this.locationId = const Value.absent(),
    this.language = const Value.absent(),
    this.status = const Value.absent(),
    this.createdBy = const Value.absent(),
    this.assessedOn = const Value.absent(),
    this.assessorsJson = const Value.absent(),
    this.reviewNote = const Value.absent(),
    this.totalsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.dirty = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalAssessmentsCompanion.insert({
    required String id,
    required String organisationId,
    required String formVersionId,
    required String locationId,
    this.language = const Value.absent(),
    this.status = const Value.absent(),
    required String createdBy,
    required String assessedOn,
    this.assessorsJson = const Value.absent(),
    this.reviewNote = const Value.absent(),
    this.totalsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.dirty = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       organisationId = Value(organisationId),
       formVersionId = Value(formVersionId),
       locationId = Value(locationId),
       createdBy = Value(createdBy),
       assessedOn = Value(assessedOn);
  static Insertable<LocalAssessment> custom({
    Expression<String>? id,
    Expression<String>? organisationId,
    Expression<String>? formVersionId,
    Expression<String>? locationId,
    Expression<String>? language,
    Expression<String>? status,
    Expression<String>? createdBy,
    Expression<String>? assessedOn,
    Expression<String>? assessorsJson,
    Expression<String>? reviewNote,
    Expression<String>? totalsJson,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<bool>? dirty,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organisationId != null) 'organisation_id': organisationId,
      if (formVersionId != null) 'form_version_id': formVersionId,
      if (locationId != null) 'location_id': locationId,
      if (language != null) 'language': language,
      if (status != null) 'status': status,
      if (createdBy != null) 'created_by': createdBy,
      if (assessedOn != null) 'assessed_on': assessedOn,
      if (assessorsJson != null) 'assessors_json': assessorsJson,
      if (reviewNote != null) 'review_note': reviewNote,
      if (totalsJson != null) 'totals_json': totalsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (dirty != null) 'dirty': dirty,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalAssessmentsCompanion copyWith({
    Value<String>? id,
    Value<String>? organisationId,
    Value<String>? formVersionId,
    Value<String>? locationId,
    Value<String>? language,
    Value<String>? status,
    Value<String>? createdBy,
    Value<String>? assessedOn,
    Value<String?>? assessorsJson,
    Value<String?>? reviewNote,
    Value<String?>? totalsJson,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<bool>? dirty,
    Value<int>? rowid,
  }) {
    return LocalAssessmentsCompanion(
      id: id ?? this.id,
      organisationId: organisationId ?? this.organisationId,
      formVersionId: formVersionId ?? this.formVersionId,
      locationId: locationId ?? this.locationId,
      language: language ?? this.language,
      status: status ?? this.status,
      createdBy: createdBy ?? this.createdBy,
      assessedOn: assessedOn ?? this.assessedOn,
      assessorsJson: assessorsJson ?? this.assessorsJson,
      reviewNote: reviewNote ?? this.reviewNote,
      totalsJson: totalsJson ?? this.totalsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      dirty: dirty ?? this.dirty,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organisationId.present) {
      map['organisation_id'] = Variable<String>(organisationId.value);
    }
    if (formVersionId.present) {
      map['form_version_id'] = Variable<String>(formVersionId.value);
    }
    if (locationId.present) {
      map['location_id'] = Variable<String>(locationId.value);
    }
    if (language.present) {
      map['language'] = Variable<String>(language.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdBy.present) {
      map['created_by'] = Variable<String>(createdBy.value);
    }
    if (assessedOn.present) {
      map['assessed_on'] = Variable<String>(assessedOn.value);
    }
    if (assessorsJson.present) {
      map['assessors_json'] = Variable<String>(assessorsJson.value);
    }
    if (reviewNote.present) {
      map['review_note'] = Variable<String>(reviewNote.value);
    }
    if (totalsJson.present) {
      map['totals_json'] = Variable<String>(totalsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (dirty.present) {
      map['dirty'] = Variable<bool>(dirty.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalAssessmentsCompanion(')
          ..write('id: $id, ')
          ..write('organisationId: $organisationId, ')
          ..write('formVersionId: $formVersionId, ')
          ..write('locationId: $locationId, ')
          ..write('language: $language, ')
          ..write('status: $status, ')
          ..write('createdBy: $createdBy, ')
          ..write('assessedOn: $assessedOn, ')
          ..write('assessorsJson: $assessorsJson, ')
          ..write('reviewNote: $reviewNote, ')
          ..write('totalsJson: $totalsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('dirty: $dirty, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalResponsesTable extends LocalResponses
    with TableInfo<$LocalResponsesTable, LocalResponse> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalResponsesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _assessmentIdMeta = const VerificationMeta(
    'assessmentId',
  );
  @override
  late final GeneratedColumn<String> assessmentId = GeneratedColumn<String>(
    'assessment_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _itemKeyMeta = const VerificationMeta(
    'itemKey',
  );
  @override
  late final GeneratedColumn<String> itemKey = GeneratedColumn<String>(
    'item_key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<double> value = GeneratedColumn<double>(
    'value',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _notAssessedMeta = const VerificationMeta(
    'notAssessed',
  );
  @override
  late final GeneratedColumn<bool> notAssessed = GeneratedColumn<bool>(
    'not_assessed',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("not_assessed" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  static const VerificationMeta _dirtyMeta = const VerificationMeta('dirty');
  @override
  late final GeneratedColumn<bool> dirty = GeneratedColumn<bool>(
    'dirty',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("dirty" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  @override
  List<GeneratedColumn> get $columns => [
    assessmentId,
    itemKey,
    value,
    notAssessed,
    note,
    updatedAt,
    dirty,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_responses';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalResponse> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('assessment_id')) {
      context.handle(
        _assessmentIdMeta,
        assessmentId.isAcceptableOrUnknown(
          data['assessment_id']!,
          _assessmentIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_assessmentIdMeta);
    }
    if (data.containsKey('item_key')) {
      context.handle(
        _itemKeyMeta,
        itemKey.isAcceptableOrUnknown(data['item_key']!, _itemKeyMeta),
      );
    } else if (isInserting) {
      context.missing(_itemKeyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
        _valueMeta,
        value.isAcceptableOrUnknown(data['value']!, _valueMeta),
      );
    }
    if (data.containsKey('not_assessed')) {
      context.handle(
        _notAssessedMeta,
        notAssessed.isAcceptableOrUnknown(
          data['not_assessed']!,
          _notAssessedMeta,
        ),
      );
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('dirty')) {
      context.handle(
        _dirtyMeta,
        dirty.isAcceptableOrUnknown(data['dirty']!, _dirtyMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {assessmentId, itemKey};
  @override
  LocalResponse map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalResponse(
      assessmentId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}assessment_id'],
      )!,
      itemKey: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}item_key'],
      )!,
      value: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}value'],
      ),
      notAssessed: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}not_assessed'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
      dirty: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}dirty'],
      )!,
    );
  }

  @override
  $LocalResponsesTable createAlias(String alias) {
    return $LocalResponsesTable(attachedDatabase, alias);
  }
}

class LocalResponse extends DataClass implements Insertable<LocalResponse> {
  final String assessmentId;
  final String itemKey;
  final double? value;
  final bool notAssessed;
  final String? note;
  final DateTime updatedAt;
  final bool dirty;
  const LocalResponse({
    required this.assessmentId,
    required this.itemKey,
    this.value,
    required this.notAssessed,
    this.note,
    required this.updatedAt,
    required this.dirty,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['assessment_id'] = Variable<String>(assessmentId);
    map['item_key'] = Variable<String>(itemKey);
    if (!nullToAbsent || value != null) {
      map['value'] = Variable<double>(value);
    }
    map['not_assessed'] = Variable<bool>(notAssessed);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['dirty'] = Variable<bool>(dirty);
    return map;
  }

  LocalResponsesCompanion toCompanion(bool nullToAbsent) {
    return LocalResponsesCompanion(
      assessmentId: Value(assessmentId),
      itemKey: Value(itemKey),
      value: value == null && nullToAbsent
          ? const Value.absent()
          : Value(value),
      notAssessed: Value(notAssessed),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      updatedAt: Value(updatedAt),
      dirty: Value(dirty),
    );
  }

  factory LocalResponse.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalResponse(
      assessmentId: serializer.fromJson<String>(json['assessmentId']),
      itemKey: serializer.fromJson<String>(json['itemKey']),
      value: serializer.fromJson<double?>(json['value']),
      notAssessed: serializer.fromJson<bool>(json['notAssessed']),
      note: serializer.fromJson<String?>(json['note']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      dirty: serializer.fromJson<bool>(json['dirty']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'assessmentId': serializer.toJson<String>(assessmentId),
      'itemKey': serializer.toJson<String>(itemKey),
      'value': serializer.toJson<double?>(value),
      'notAssessed': serializer.toJson<bool>(notAssessed),
      'note': serializer.toJson<String?>(note),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'dirty': serializer.toJson<bool>(dirty),
    };
  }

  LocalResponse copyWith({
    String? assessmentId,
    String? itemKey,
    Value<double?> value = const Value.absent(),
    bool? notAssessed,
    Value<String?> note = const Value.absent(),
    DateTime? updatedAt,
    bool? dirty,
  }) => LocalResponse(
    assessmentId: assessmentId ?? this.assessmentId,
    itemKey: itemKey ?? this.itemKey,
    value: value.present ? value.value : this.value,
    notAssessed: notAssessed ?? this.notAssessed,
    note: note.present ? note.value : this.note,
    updatedAt: updatedAt ?? this.updatedAt,
    dirty: dirty ?? this.dirty,
  );
  LocalResponse copyWithCompanion(LocalResponsesCompanion data) {
    return LocalResponse(
      assessmentId: data.assessmentId.present
          ? data.assessmentId.value
          : this.assessmentId,
      itemKey: data.itemKey.present ? data.itemKey.value : this.itemKey,
      value: data.value.present ? data.value.value : this.value,
      notAssessed: data.notAssessed.present
          ? data.notAssessed.value
          : this.notAssessed,
      note: data.note.present ? data.note.value : this.note,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      dirty: data.dirty.present ? data.dirty.value : this.dirty,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalResponse(')
          ..write('assessmentId: $assessmentId, ')
          ..write('itemKey: $itemKey, ')
          ..write('value: $value, ')
          ..write('notAssessed: $notAssessed, ')
          ..write('note: $note, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('dirty: $dirty')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    assessmentId,
    itemKey,
    value,
    notAssessed,
    note,
    updatedAt,
    dirty,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalResponse &&
          other.assessmentId == this.assessmentId &&
          other.itemKey == this.itemKey &&
          other.value == this.value &&
          other.notAssessed == this.notAssessed &&
          other.note == this.note &&
          other.updatedAt == this.updatedAt &&
          other.dirty == this.dirty);
}

class LocalResponsesCompanion extends UpdateCompanion<LocalResponse> {
  final Value<String> assessmentId;
  final Value<String> itemKey;
  final Value<double?> value;
  final Value<bool> notAssessed;
  final Value<String?> note;
  final Value<DateTime> updatedAt;
  final Value<bool> dirty;
  final Value<int> rowid;
  const LocalResponsesCompanion({
    this.assessmentId = const Value.absent(),
    this.itemKey = const Value.absent(),
    this.value = const Value.absent(),
    this.notAssessed = const Value.absent(),
    this.note = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.dirty = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalResponsesCompanion.insert({
    required String assessmentId,
    required String itemKey,
    this.value = const Value.absent(),
    this.notAssessed = const Value.absent(),
    this.note = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.dirty = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : assessmentId = Value(assessmentId),
       itemKey = Value(itemKey);
  static Insertable<LocalResponse> custom({
    Expression<String>? assessmentId,
    Expression<String>? itemKey,
    Expression<double>? value,
    Expression<bool>? notAssessed,
    Expression<String>? note,
    Expression<DateTime>? updatedAt,
    Expression<bool>? dirty,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (assessmentId != null) 'assessment_id': assessmentId,
      if (itemKey != null) 'item_key': itemKey,
      if (value != null) 'value': value,
      if (notAssessed != null) 'not_assessed': notAssessed,
      if (note != null) 'note': note,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (dirty != null) 'dirty': dirty,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalResponsesCompanion copyWith({
    Value<String>? assessmentId,
    Value<String>? itemKey,
    Value<double?>? value,
    Value<bool>? notAssessed,
    Value<String?>? note,
    Value<DateTime>? updatedAt,
    Value<bool>? dirty,
    Value<int>? rowid,
  }) {
    return LocalResponsesCompanion(
      assessmentId: assessmentId ?? this.assessmentId,
      itemKey: itemKey ?? this.itemKey,
      value: value ?? this.value,
      notAssessed: notAssessed ?? this.notAssessed,
      note: note ?? this.note,
      updatedAt: updatedAt ?? this.updatedAt,
      dirty: dirty ?? this.dirty,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (assessmentId.present) {
      map['assessment_id'] = Variable<String>(assessmentId.value);
    }
    if (itemKey.present) {
      map['item_key'] = Variable<String>(itemKey.value);
    }
    if (value.present) {
      map['value'] = Variable<double>(value.value);
    }
    if (notAssessed.present) {
      map['not_assessed'] = Variable<bool>(notAssessed.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (dirty.present) {
      map['dirty'] = Variable<bool>(dirty.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalResponsesCompanion(')
          ..write('assessmentId: $assessmentId, ')
          ..write('itemKey: $itemKey, ')
          ..write('value: $value, ')
          ..write('notAssessed: $notAssessed, ')
          ..write('note: $note, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('dirty: $dirty, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalFormVersionsTable extends LocalFormVersions
    with TableInfo<$LocalFormVersionsTable, LocalFormVersion> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalFormVersionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _formIdMeta = const VerificationMeta('formId');
  @override
  late final GeneratedColumn<String> formId = GeneratedColumn<String>(
    'form_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _versionMeta = const VerificationMeta(
    'version',
  );
  @override
  late final GeneratedColumn<String> version = GeneratedColumn<String>(
    'version',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _definitionJsonMeta = const VerificationMeta(
    'definitionJson',
  );
  @override
  late final GeneratedColumn<String> definitionJson = GeneratedColumn<String>(
    'definition_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _pulledAtMeta = const VerificationMeta(
    'pulledAt',
  );
  @override
  late final GeneratedColumn<DateTime> pulledAt = GeneratedColumn<DateTime>(
    'pulled_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    formId,
    version,
    definitionJson,
    pulledAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_form_versions';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalFormVersion> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('form_id')) {
      context.handle(
        _formIdMeta,
        formId.isAcceptableOrUnknown(data['form_id']!, _formIdMeta),
      );
    } else if (isInserting) {
      context.missing(_formIdMeta);
    }
    if (data.containsKey('version')) {
      context.handle(
        _versionMeta,
        version.isAcceptableOrUnknown(data['version']!, _versionMeta),
      );
    } else if (isInserting) {
      context.missing(_versionMeta);
    }
    if (data.containsKey('definition_json')) {
      context.handle(
        _definitionJsonMeta,
        definitionJson.isAcceptableOrUnknown(
          data['definition_json']!,
          _definitionJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_definitionJsonMeta);
    }
    if (data.containsKey('pulled_at')) {
      context.handle(
        _pulledAtMeta,
        pulledAt.isAcceptableOrUnknown(data['pulled_at']!, _pulledAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalFormVersion map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalFormVersion(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      formId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}form_id'],
      )!,
      version: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}version'],
      )!,
      definitionJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}definition_json'],
      )!,
      pulledAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}pulled_at'],
      )!,
    );
  }

  @override
  $LocalFormVersionsTable createAlias(String alias) {
    return $LocalFormVersionsTable(attachedDatabase, alias);
  }
}

class LocalFormVersion extends DataClass
    implements Insertable<LocalFormVersion> {
  final String id;
  final String formId;
  final String version;
  final String definitionJson;
  final DateTime pulledAt;
  const LocalFormVersion({
    required this.id,
    required this.formId,
    required this.version,
    required this.definitionJson,
    required this.pulledAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['form_id'] = Variable<String>(formId);
    map['version'] = Variable<String>(version);
    map['definition_json'] = Variable<String>(definitionJson);
    map['pulled_at'] = Variable<DateTime>(pulledAt);
    return map;
  }

  LocalFormVersionsCompanion toCompanion(bool nullToAbsent) {
    return LocalFormVersionsCompanion(
      id: Value(id),
      formId: Value(formId),
      version: Value(version),
      definitionJson: Value(definitionJson),
      pulledAt: Value(pulledAt),
    );
  }

  factory LocalFormVersion.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalFormVersion(
      id: serializer.fromJson<String>(json['id']),
      formId: serializer.fromJson<String>(json['formId']),
      version: serializer.fromJson<String>(json['version']),
      definitionJson: serializer.fromJson<String>(json['definitionJson']),
      pulledAt: serializer.fromJson<DateTime>(json['pulledAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'formId': serializer.toJson<String>(formId),
      'version': serializer.toJson<String>(version),
      'definitionJson': serializer.toJson<String>(definitionJson),
      'pulledAt': serializer.toJson<DateTime>(pulledAt),
    };
  }

  LocalFormVersion copyWith({
    String? id,
    String? formId,
    String? version,
    String? definitionJson,
    DateTime? pulledAt,
  }) => LocalFormVersion(
    id: id ?? this.id,
    formId: formId ?? this.formId,
    version: version ?? this.version,
    definitionJson: definitionJson ?? this.definitionJson,
    pulledAt: pulledAt ?? this.pulledAt,
  );
  LocalFormVersion copyWithCompanion(LocalFormVersionsCompanion data) {
    return LocalFormVersion(
      id: data.id.present ? data.id.value : this.id,
      formId: data.formId.present ? data.formId.value : this.formId,
      version: data.version.present ? data.version.value : this.version,
      definitionJson: data.definitionJson.present
          ? data.definitionJson.value
          : this.definitionJson,
      pulledAt: data.pulledAt.present ? data.pulledAt.value : this.pulledAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalFormVersion(')
          ..write('id: $id, ')
          ..write('formId: $formId, ')
          ..write('version: $version, ')
          ..write('definitionJson: $definitionJson, ')
          ..write('pulledAt: $pulledAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, formId, version, definitionJson, pulledAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalFormVersion &&
          other.id == this.id &&
          other.formId == this.formId &&
          other.version == this.version &&
          other.definitionJson == this.definitionJson &&
          other.pulledAt == this.pulledAt);
}

class LocalFormVersionsCompanion extends UpdateCompanion<LocalFormVersion> {
  final Value<String> id;
  final Value<String> formId;
  final Value<String> version;
  final Value<String> definitionJson;
  final Value<DateTime> pulledAt;
  final Value<int> rowid;
  const LocalFormVersionsCompanion({
    this.id = const Value.absent(),
    this.formId = const Value.absent(),
    this.version = const Value.absent(),
    this.definitionJson = const Value.absent(),
    this.pulledAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalFormVersionsCompanion.insert({
    required String id,
    required String formId,
    required String version,
    required String definitionJson,
    this.pulledAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       formId = Value(formId),
       version = Value(version),
       definitionJson = Value(definitionJson);
  static Insertable<LocalFormVersion> custom({
    Expression<String>? id,
    Expression<String>? formId,
    Expression<String>? version,
    Expression<String>? definitionJson,
    Expression<DateTime>? pulledAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (formId != null) 'form_id': formId,
      if (version != null) 'version': version,
      if (definitionJson != null) 'definition_json': definitionJson,
      if (pulledAt != null) 'pulled_at': pulledAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalFormVersionsCompanion copyWith({
    Value<String>? id,
    Value<String>? formId,
    Value<String>? version,
    Value<String>? definitionJson,
    Value<DateTime>? pulledAt,
    Value<int>? rowid,
  }) {
    return LocalFormVersionsCompanion(
      id: id ?? this.id,
      formId: formId ?? this.formId,
      version: version ?? this.version,
      definitionJson: definitionJson ?? this.definitionJson,
      pulledAt: pulledAt ?? this.pulledAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (formId.present) {
      map['form_id'] = Variable<String>(formId.value);
    }
    if (version.present) {
      map['version'] = Variable<String>(version.value);
    }
    if (definitionJson.present) {
      map['definition_json'] = Variable<String>(definitionJson.value);
    }
    if (pulledAt.present) {
      map['pulled_at'] = Variable<DateTime>(pulledAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalFormVersionsCompanion(')
          ..write('id: $id, ')
          ..write('formId: $formId, ')
          ..write('version: $version, ')
          ..write('definitionJson: $definitionJson, ')
          ..write('pulledAt: $pulledAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalLocationsTable extends LocalLocations
    with TableInfo<$LocalLocationsTable, LocalLocation> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalLocationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _parentIdMeta = const VerificationMeta(
    'parentId',
  );
  @override
  late final GeneratedColumn<String> parentId = GeneratedColumn<String>(
    'parent_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _codeMeta = const VerificationMeta('code');
  @override
  late final GeneratedColumn<String> code = GeneratedColumn<String>(
    'code',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameJsonMeta = const VerificationMeta(
    'nameJson',
  );
  @override
  late final GeneratedColumn<String> nameJson = GeneratedColumn<String>(
    'name_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _levelMeta = const VerificationMeta('level');
  @override
  late final GeneratedColumn<int> level = GeneratedColumn<int>(
    'level',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _activeMeta = const VerificationMeta('active');
  @override
  late final GeneratedColumn<bool> active = GeneratedColumn<bool>(
    'active',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("active" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    parentId,
    code,
    nameJson,
    level,
    active,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_locations';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalLocation> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('parent_id')) {
      context.handle(
        _parentIdMeta,
        parentId.isAcceptableOrUnknown(data['parent_id']!, _parentIdMeta),
      );
    }
    if (data.containsKey('code')) {
      context.handle(
        _codeMeta,
        code.isAcceptableOrUnknown(data['code']!, _codeMeta),
      );
    } else if (isInserting) {
      context.missing(_codeMeta);
    }
    if (data.containsKey('name_json')) {
      context.handle(
        _nameJsonMeta,
        nameJson.isAcceptableOrUnknown(data['name_json']!, _nameJsonMeta),
      );
    } else if (isInserting) {
      context.missing(_nameJsonMeta);
    }
    if (data.containsKey('level')) {
      context.handle(
        _levelMeta,
        level.isAcceptableOrUnknown(data['level']!, _levelMeta),
      );
    }
    if (data.containsKey('active')) {
      context.handle(
        _activeMeta,
        active.isAcceptableOrUnknown(data['active']!, _activeMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalLocation map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalLocation(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      parentId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}parent_id'],
      ),
      code: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}code'],
      )!,
      nameJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name_json'],
      )!,
      level: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}level'],
      )!,
      active: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}active'],
      )!,
    );
  }

  @override
  $LocalLocationsTable createAlias(String alias) {
    return $LocalLocationsTable(attachedDatabase, alias);
  }
}

class LocalLocation extends DataClass implements Insertable<LocalLocation> {
  final String id;
  final String? parentId;
  final String code;
  final String nameJson;
  final int level;
  final bool active;
  const LocalLocation({
    required this.id,
    this.parentId,
    required this.code,
    required this.nameJson,
    required this.level,
    required this.active,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || parentId != null) {
      map['parent_id'] = Variable<String>(parentId);
    }
    map['code'] = Variable<String>(code);
    map['name_json'] = Variable<String>(nameJson);
    map['level'] = Variable<int>(level);
    map['active'] = Variable<bool>(active);
    return map;
  }

  LocalLocationsCompanion toCompanion(bool nullToAbsent) {
    return LocalLocationsCompanion(
      id: Value(id),
      parentId: parentId == null && nullToAbsent
          ? const Value.absent()
          : Value(parentId),
      code: Value(code),
      nameJson: Value(nameJson),
      level: Value(level),
      active: Value(active),
    );
  }

  factory LocalLocation.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalLocation(
      id: serializer.fromJson<String>(json['id']),
      parentId: serializer.fromJson<String?>(json['parentId']),
      code: serializer.fromJson<String>(json['code']),
      nameJson: serializer.fromJson<String>(json['nameJson']),
      level: serializer.fromJson<int>(json['level']),
      active: serializer.fromJson<bool>(json['active']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'parentId': serializer.toJson<String?>(parentId),
      'code': serializer.toJson<String>(code),
      'nameJson': serializer.toJson<String>(nameJson),
      'level': serializer.toJson<int>(level),
      'active': serializer.toJson<bool>(active),
    };
  }

  LocalLocation copyWith({
    String? id,
    Value<String?> parentId = const Value.absent(),
    String? code,
    String? nameJson,
    int? level,
    bool? active,
  }) => LocalLocation(
    id: id ?? this.id,
    parentId: parentId.present ? parentId.value : this.parentId,
    code: code ?? this.code,
    nameJson: nameJson ?? this.nameJson,
    level: level ?? this.level,
    active: active ?? this.active,
  );
  LocalLocation copyWithCompanion(LocalLocationsCompanion data) {
    return LocalLocation(
      id: data.id.present ? data.id.value : this.id,
      parentId: data.parentId.present ? data.parentId.value : this.parentId,
      code: data.code.present ? data.code.value : this.code,
      nameJson: data.nameJson.present ? data.nameJson.value : this.nameJson,
      level: data.level.present ? data.level.value : this.level,
      active: data.active.present ? data.active.value : this.active,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalLocation(')
          ..write('id: $id, ')
          ..write('parentId: $parentId, ')
          ..write('code: $code, ')
          ..write('nameJson: $nameJson, ')
          ..write('level: $level, ')
          ..write('active: $active')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, parentId, code, nameJson, level, active);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalLocation &&
          other.id == this.id &&
          other.parentId == this.parentId &&
          other.code == this.code &&
          other.nameJson == this.nameJson &&
          other.level == this.level &&
          other.active == this.active);
}

class LocalLocationsCompanion extends UpdateCompanion<LocalLocation> {
  final Value<String> id;
  final Value<String?> parentId;
  final Value<String> code;
  final Value<String> nameJson;
  final Value<int> level;
  final Value<bool> active;
  final Value<int> rowid;
  const LocalLocationsCompanion({
    this.id = const Value.absent(),
    this.parentId = const Value.absent(),
    this.code = const Value.absent(),
    this.nameJson = const Value.absent(),
    this.level = const Value.absent(),
    this.active = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalLocationsCompanion.insert({
    required String id,
    this.parentId = const Value.absent(),
    required String code,
    required String nameJson,
    this.level = const Value.absent(),
    this.active = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       code = Value(code),
       nameJson = Value(nameJson);
  static Insertable<LocalLocation> custom({
    Expression<String>? id,
    Expression<String>? parentId,
    Expression<String>? code,
    Expression<String>? nameJson,
    Expression<int>? level,
    Expression<bool>? active,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (parentId != null) 'parent_id': parentId,
      if (code != null) 'code': code,
      if (nameJson != null) 'name_json': nameJson,
      if (level != null) 'level': level,
      if (active != null) 'active': active,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalLocationsCompanion copyWith({
    Value<String>? id,
    Value<String?>? parentId,
    Value<String>? code,
    Value<String>? nameJson,
    Value<int>? level,
    Value<bool>? active,
    Value<int>? rowid,
  }) {
    return LocalLocationsCompanion(
      id: id ?? this.id,
      parentId: parentId ?? this.parentId,
      code: code ?? this.code,
      nameJson: nameJson ?? this.nameJson,
      level: level ?? this.level,
      active: active ?? this.active,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (parentId.present) {
      map['parent_id'] = Variable<String>(parentId.value);
    }
    if (code.present) {
      map['code'] = Variable<String>(code.value);
    }
    if (nameJson.present) {
      map['name_json'] = Variable<String>(nameJson.value);
    }
    if (level.present) {
      map['level'] = Variable<int>(level.value);
    }
    if (active.present) {
      map['active'] = Variable<bool>(active.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalLocationsCompanion(')
          ..write('id: $id, ')
          ..write('parentId: $parentId, ')
          ..write('code: $code, ')
          ..write('nameJson: $nameJson, ')
          ..write('level: $level, ')
          ..write('active: $active, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalHelpArticlesTable extends LocalHelpArticles
    with TableInfo<$LocalHelpArticlesTable, LocalHelpArticle> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalHelpArticlesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _slugMeta = const VerificationMeta('slug');
  @override
  late final GeneratedColumn<String> slug = GeneratedColumn<String>(
    'slug',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _titleJsonMeta = const VerificationMeta(
    'titleJson',
  );
  @override
  late final GeneratedColumn<String> titleJson = GeneratedColumn<String>(
    'title_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bodyJsonMeta = const VerificationMeta(
    'bodyJson',
  );
  @override
  late final GeneratedColumn<String> bodyJson = GeneratedColumn<String>(
    'body_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    slug,
    titleJson,
    bodyJson,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_help_articles';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalHelpArticle> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('slug')) {
      context.handle(
        _slugMeta,
        slug.isAcceptableOrUnknown(data['slug']!, _slugMeta),
      );
    } else if (isInserting) {
      context.missing(_slugMeta);
    }
    if (data.containsKey('title_json')) {
      context.handle(
        _titleJsonMeta,
        titleJson.isAcceptableOrUnknown(data['title_json']!, _titleJsonMeta),
      );
    } else if (isInserting) {
      context.missing(_titleJsonMeta);
    }
    if (data.containsKey('body_json')) {
      context.handle(
        _bodyJsonMeta,
        bodyJson.isAcceptableOrUnknown(data['body_json']!, _bodyJsonMeta),
      );
    } else if (isInserting) {
      context.missing(_bodyJsonMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalHelpArticle map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalHelpArticle(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      slug: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}slug'],
      )!,
      titleJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}title_json'],
      )!,
      bodyJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}body_json'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $LocalHelpArticlesTable createAlias(String alias) {
    return $LocalHelpArticlesTable(attachedDatabase, alias);
  }
}

class LocalHelpArticle extends DataClass
    implements Insertable<LocalHelpArticle> {
  final String id;
  final String slug;
  final String titleJson;
  final String bodyJson;
  final DateTime updatedAt;
  const LocalHelpArticle({
    required this.id,
    required this.slug,
    required this.titleJson,
    required this.bodyJson,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['slug'] = Variable<String>(slug);
    map['title_json'] = Variable<String>(titleJson);
    map['body_json'] = Variable<String>(bodyJson);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LocalHelpArticlesCompanion toCompanion(bool nullToAbsent) {
    return LocalHelpArticlesCompanion(
      id: Value(id),
      slug: Value(slug),
      titleJson: Value(titleJson),
      bodyJson: Value(bodyJson),
      updatedAt: Value(updatedAt),
    );
  }

  factory LocalHelpArticle.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalHelpArticle(
      id: serializer.fromJson<String>(json['id']),
      slug: serializer.fromJson<String>(json['slug']),
      titleJson: serializer.fromJson<String>(json['titleJson']),
      bodyJson: serializer.fromJson<String>(json['bodyJson']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'slug': serializer.toJson<String>(slug),
      'titleJson': serializer.toJson<String>(titleJson),
      'bodyJson': serializer.toJson<String>(bodyJson),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  LocalHelpArticle copyWith({
    String? id,
    String? slug,
    String? titleJson,
    String? bodyJson,
    DateTime? updatedAt,
  }) => LocalHelpArticle(
    id: id ?? this.id,
    slug: slug ?? this.slug,
    titleJson: titleJson ?? this.titleJson,
    bodyJson: bodyJson ?? this.bodyJson,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  LocalHelpArticle copyWithCompanion(LocalHelpArticlesCompanion data) {
    return LocalHelpArticle(
      id: data.id.present ? data.id.value : this.id,
      slug: data.slug.present ? data.slug.value : this.slug,
      titleJson: data.titleJson.present ? data.titleJson.value : this.titleJson,
      bodyJson: data.bodyJson.present ? data.bodyJson.value : this.bodyJson,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalHelpArticle(')
          ..write('id: $id, ')
          ..write('slug: $slug, ')
          ..write('titleJson: $titleJson, ')
          ..write('bodyJson: $bodyJson, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, slug, titleJson, bodyJson, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalHelpArticle &&
          other.id == this.id &&
          other.slug == this.slug &&
          other.titleJson == this.titleJson &&
          other.bodyJson == this.bodyJson &&
          other.updatedAt == this.updatedAt);
}

class LocalHelpArticlesCompanion extends UpdateCompanion<LocalHelpArticle> {
  final Value<String> id;
  final Value<String> slug;
  final Value<String> titleJson;
  final Value<String> bodyJson;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LocalHelpArticlesCompanion({
    this.id = const Value.absent(),
    this.slug = const Value.absent(),
    this.titleJson = const Value.absent(),
    this.bodyJson = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalHelpArticlesCompanion.insert({
    required String id,
    required String slug,
    required String titleJson,
    required String bodyJson,
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       slug = Value(slug),
       titleJson = Value(titleJson),
       bodyJson = Value(bodyJson);
  static Insertable<LocalHelpArticle> custom({
    Expression<String>? id,
    Expression<String>? slug,
    Expression<String>? titleJson,
    Expression<String>? bodyJson,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (slug != null) 'slug': slug,
      if (titleJson != null) 'title_json': titleJson,
      if (bodyJson != null) 'body_json': bodyJson,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalHelpArticlesCompanion copyWith({
    Value<String>? id,
    Value<String>? slug,
    Value<String>? titleJson,
    Value<String>? bodyJson,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return LocalHelpArticlesCompanion(
      id: id ?? this.id,
      slug: slug ?? this.slug,
      titleJson: titleJson ?? this.titleJson,
      bodyJson: bodyJson ?? this.bodyJson,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (slug.present) {
      map['slug'] = Variable<String>(slug.value);
    }
    if (titleJson.present) {
      map['title_json'] = Variable<String>(titleJson.value);
    }
    if (bodyJson.present) {
      map['body_json'] = Variable<String>(bodyJson.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalHelpArticlesCompanion(')
          ..write('id: $id, ')
          ..write('slug: $slug, ')
          ..write('titleJson: $titleJson, ')
          ..write('bodyJson: $bodyJson, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalAttachmentsTable extends LocalAttachments
    with TableInfo<$LocalAttachmentsTable, LocalAttachment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalAttachmentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _assessmentIdMeta = const VerificationMeta(
    'assessmentId',
  );
  @override
  late final GeneratedColumn<String> assessmentId = GeneratedColumn<String>(
    'assessment_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _itemKeyMeta = const VerificationMeta(
    'itemKey',
  );
  @override
  late final GeneratedColumn<String> itemKey = GeneratedColumn<String>(
    'item_key',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _kindMeta = const VerificationMeta('kind');
  @override
  late final GeneratedColumn<String> kind = GeneratedColumn<String>(
    'kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _localPathMeta = const VerificationMeta(
    'localPath',
  );
  @override
  late final GeneratedColumn<String> localPath = GeneratedColumn<String>(
    'local_path',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _storagePathMeta = const VerificationMeta(
    'storagePath',
  );
  @override
  late final GeneratedColumn<String> storagePath = GeneratedColumn<String>(
    'storage_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _mimeTypeMeta = const VerificationMeta(
    'mimeType',
  );
  @override
  late final GeneratedColumn<String> mimeType = GeneratedColumn<String>(
    'mime_type',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _sizeBytesMeta = const VerificationMeta(
    'sizeBytes',
  );
  @override
  late final GeneratedColumn<int> sizeBytes = GeneratedColumn<int>(
    'size_bytes',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _uploadedMeta = const VerificationMeta(
    'uploaded',
  );
  @override
  late final GeneratedColumn<bool> uploaded = GeneratedColumn<bool>(
    'uploaded',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("uploaded" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    assessmentId,
    itemKey,
    kind,
    localPath,
    storagePath,
    mimeType,
    sizeBytes,
    uploaded,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_attachments';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalAttachment> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('assessment_id')) {
      context.handle(
        _assessmentIdMeta,
        assessmentId.isAcceptableOrUnknown(
          data['assessment_id']!,
          _assessmentIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_assessmentIdMeta);
    }
    if (data.containsKey('item_key')) {
      context.handle(
        _itemKeyMeta,
        itemKey.isAcceptableOrUnknown(data['item_key']!, _itemKeyMeta),
      );
    }
    if (data.containsKey('kind')) {
      context.handle(
        _kindMeta,
        kind.isAcceptableOrUnknown(data['kind']!, _kindMeta),
      );
    } else if (isInserting) {
      context.missing(_kindMeta);
    }
    if (data.containsKey('local_path')) {
      context.handle(
        _localPathMeta,
        localPath.isAcceptableOrUnknown(data['local_path']!, _localPathMeta),
      );
    } else if (isInserting) {
      context.missing(_localPathMeta);
    }
    if (data.containsKey('storage_path')) {
      context.handle(
        _storagePathMeta,
        storagePath.isAcceptableOrUnknown(
          data['storage_path']!,
          _storagePathMeta,
        ),
      );
    }
    if (data.containsKey('mime_type')) {
      context.handle(
        _mimeTypeMeta,
        mimeType.isAcceptableOrUnknown(data['mime_type']!, _mimeTypeMeta),
      );
    }
    if (data.containsKey('size_bytes')) {
      context.handle(
        _sizeBytesMeta,
        sizeBytes.isAcceptableOrUnknown(data['size_bytes']!, _sizeBytesMeta),
      );
    }
    if (data.containsKey('uploaded')) {
      context.handle(
        _uploadedMeta,
        uploaded.isAcceptableOrUnknown(data['uploaded']!, _uploadedMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalAttachment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalAttachment(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      assessmentId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}assessment_id'],
      )!,
      itemKey: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}item_key'],
      ),
      kind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}kind'],
      )!,
      localPath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}local_path'],
      )!,
      storagePath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}storage_path'],
      ),
      mimeType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}mime_type'],
      ),
      sizeBytes: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}size_bytes'],
      ),
      uploaded: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}uploaded'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $LocalAttachmentsTable createAlias(String alias) {
    return $LocalAttachmentsTable(attachedDatabase, alias);
  }
}

class LocalAttachment extends DataClass implements Insertable<LocalAttachment> {
  final String id;
  final String assessmentId;
  final String? itemKey;
  final String kind;
  final String localPath;
  final String? storagePath;
  final String? mimeType;
  final int? sizeBytes;
  final bool uploaded;
  final DateTime createdAt;
  const LocalAttachment({
    required this.id,
    required this.assessmentId,
    this.itemKey,
    required this.kind,
    required this.localPath,
    this.storagePath,
    this.mimeType,
    this.sizeBytes,
    required this.uploaded,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['assessment_id'] = Variable<String>(assessmentId);
    if (!nullToAbsent || itemKey != null) {
      map['item_key'] = Variable<String>(itemKey);
    }
    map['kind'] = Variable<String>(kind);
    map['local_path'] = Variable<String>(localPath);
    if (!nullToAbsent || storagePath != null) {
      map['storage_path'] = Variable<String>(storagePath);
    }
    if (!nullToAbsent || mimeType != null) {
      map['mime_type'] = Variable<String>(mimeType);
    }
    if (!nullToAbsent || sizeBytes != null) {
      map['size_bytes'] = Variable<int>(sizeBytes);
    }
    map['uploaded'] = Variable<bool>(uploaded);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalAttachmentsCompanion toCompanion(bool nullToAbsent) {
    return LocalAttachmentsCompanion(
      id: Value(id),
      assessmentId: Value(assessmentId),
      itemKey: itemKey == null && nullToAbsent
          ? const Value.absent()
          : Value(itemKey),
      kind: Value(kind),
      localPath: Value(localPath),
      storagePath: storagePath == null && nullToAbsent
          ? const Value.absent()
          : Value(storagePath),
      mimeType: mimeType == null && nullToAbsent
          ? const Value.absent()
          : Value(mimeType),
      sizeBytes: sizeBytes == null && nullToAbsent
          ? const Value.absent()
          : Value(sizeBytes),
      uploaded: Value(uploaded),
      createdAt: Value(createdAt),
    );
  }

  factory LocalAttachment.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalAttachment(
      id: serializer.fromJson<String>(json['id']),
      assessmentId: serializer.fromJson<String>(json['assessmentId']),
      itemKey: serializer.fromJson<String?>(json['itemKey']),
      kind: serializer.fromJson<String>(json['kind']),
      localPath: serializer.fromJson<String>(json['localPath']),
      storagePath: serializer.fromJson<String?>(json['storagePath']),
      mimeType: serializer.fromJson<String?>(json['mimeType']),
      sizeBytes: serializer.fromJson<int?>(json['sizeBytes']),
      uploaded: serializer.fromJson<bool>(json['uploaded']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'assessmentId': serializer.toJson<String>(assessmentId),
      'itemKey': serializer.toJson<String?>(itemKey),
      'kind': serializer.toJson<String>(kind),
      'localPath': serializer.toJson<String>(localPath),
      'storagePath': serializer.toJson<String?>(storagePath),
      'mimeType': serializer.toJson<String?>(mimeType),
      'sizeBytes': serializer.toJson<int?>(sizeBytes),
      'uploaded': serializer.toJson<bool>(uploaded),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  LocalAttachment copyWith({
    String? id,
    String? assessmentId,
    Value<String?> itemKey = const Value.absent(),
    String? kind,
    String? localPath,
    Value<String?> storagePath = const Value.absent(),
    Value<String?> mimeType = const Value.absent(),
    Value<int?> sizeBytes = const Value.absent(),
    bool? uploaded,
    DateTime? createdAt,
  }) => LocalAttachment(
    id: id ?? this.id,
    assessmentId: assessmentId ?? this.assessmentId,
    itemKey: itemKey.present ? itemKey.value : this.itemKey,
    kind: kind ?? this.kind,
    localPath: localPath ?? this.localPath,
    storagePath: storagePath.present ? storagePath.value : this.storagePath,
    mimeType: mimeType.present ? mimeType.value : this.mimeType,
    sizeBytes: sizeBytes.present ? sizeBytes.value : this.sizeBytes,
    uploaded: uploaded ?? this.uploaded,
    createdAt: createdAt ?? this.createdAt,
  );
  LocalAttachment copyWithCompanion(LocalAttachmentsCompanion data) {
    return LocalAttachment(
      id: data.id.present ? data.id.value : this.id,
      assessmentId: data.assessmentId.present
          ? data.assessmentId.value
          : this.assessmentId,
      itemKey: data.itemKey.present ? data.itemKey.value : this.itemKey,
      kind: data.kind.present ? data.kind.value : this.kind,
      localPath: data.localPath.present ? data.localPath.value : this.localPath,
      storagePath: data.storagePath.present
          ? data.storagePath.value
          : this.storagePath,
      mimeType: data.mimeType.present ? data.mimeType.value : this.mimeType,
      sizeBytes: data.sizeBytes.present ? data.sizeBytes.value : this.sizeBytes,
      uploaded: data.uploaded.present ? data.uploaded.value : this.uploaded,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalAttachment(')
          ..write('id: $id, ')
          ..write('assessmentId: $assessmentId, ')
          ..write('itemKey: $itemKey, ')
          ..write('kind: $kind, ')
          ..write('localPath: $localPath, ')
          ..write('storagePath: $storagePath, ')
          ..write('mimeType: $mimeType, ')
          ..write('sizeBytes: $sizeBytes, ')
          ..write('uploaded: $uploaded, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    assessmentId,
    itemKey,
    kind,
    localPath,
    storagePath,
    mimeType,
    sizeBytes,
    uploaded,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalAttachment &&
          other.id == this.id &&
          other.assessmentId == this.assessmentId &&
          other.itemKey == this.itemKey &&
          other.kind == this.kind &&
          other.localPath == this.localPath &&
          other.storagePath == this.storagePath &&
          other.mimeType == this.mimeType &&
          other.sizeBytes == this.sizeBytes &&
          other.uploaded == this.uploaded &&
          other.createdAt == this.createdAt);
}

class LocalAttachmentsCompanion extends UpdateCompanion<LocalAttachment> {
  final Value<String> id;
  final Value<String> assessmentId;
  final Value<String?> itemKey;
  final Value<String> kind;
  final Value<String> localPath;
  final Value<String?> storagePath;
  final Value<String?> mimeType;
  final Value<int?> sizeBytes;
  final Value<bool> uploaded;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const LocalAttachmentsCompanion({
    this.id = const Value.absent(),
    this.assessmentId = const Value.absent(),
    this.itemKey = const Value.absent(),
    this.kind = const Value.absent(),
    this.localPath = const Value.absent(),
    this.storagePath = const Value.absent(),
    this.mimeType = const Value.absent(),
    this.sizeBytes = const Value.absent(),
    this.uploaded = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalAttachmentsCompanion.insert({
    required String id,
    required String assessmentId,
    this.itemKey = const Value.absent(),
    required String kind,
    required String localPath,
    this.storagePath = const Value.absent(),
    this.mimeType = const Value.absent(),
    this.sizeBytes = const Value.absent(),
    this.uploaded = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       assessmentId = Value(assessmentId),
       kind = Value(kind),
       localPath = Value(localPath);
  static Insertable<LocalAttachment> custom({
    Expression<String>? id,
    Expression<String>? assessmentId,
    Expression<String>? itemKey,
    Expression<String>? kind,
    Expression<String>? localPath,
    Expression<String>? storagePath,
    Expression<String>? mimeType,
    Expression<int>? sizeBytes,
    Expression<bool>? uploaded,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (assessmentId != null) 'assessment_id': assessmentId,
      if (itemKey != null) 'item_key': itemKey,
      if (kind != null) 'kind': kind,
      if (localPath != null) 'local_path': localPath,
      if (storagePath != null) 'storage_path': storagePath,
      if (mimeType != null) 'mime_type': mimeType,
      if (sizeBytes != null) 'size_bytes': sizeBytes,
      if (uploaded != null) 'uploaded': uploaded,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalAttachmentsCompanion copyWith({
    Value<String>? id,
    Value<String>? assessmentId,
    Value<String?>? itemKey,
    Value<String>? kind,
    Value<String>? localPath,
    Value<String?>? storagePath,
    Value<String?>? mimeType,
    Value<int?>? sizeBytes,
    Value<bool>? uploaded,
    Value<DateTime>? createdAt,
    Value<int>? rowid,
  }) {
    return LocalAttachmentsCompanion(
      id: id ?? this.id,
      assessmentId: assessmentId ?? this.assessmentId,
      itemKey: itemKey ?? this.itemKey,
      kind: kind ?? this.kind,
      localPath: localPath ?? this.localPath,
      storagePath: storagePath ?? this.storagePath,
      mimeType: mimeType ?? this.mimeType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      uploaded: uploaded ?? this.uploaded,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (assessmentId.present) {
      map['assessment_id'] = Variable<String>(assessmentId.value);
    }
    if (itemKey.present) {
      map['item_key'] = Variable<String>(itemKey.value);
    }
    if (kind.present) {
      map['kind'] = Variable<String>(kind.value);
    }
    if (localPath.present) {
      map['local_path'] = Variable<String>(localPath.value);
    }
    if (storagePath.present) {
      map['storage_path'] = Variable<String>(storagePath.value);
    }
    if (mimeType.present) {
      map['mime_type'] = Variable<String>(mimeType.value);
    }
    if (sizeBytes.present) {
      map['size_bytes'] = Variable<int>(sizeBytes.value);
    }
    if (uploaded.present) {
      map['uploaded'] = Variable<bool>(uploaded.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalAttachmentsCompanion(')
          ..write('id: $id, ')
          ..write('assessmentId: $assessmentId, ')
          ..write('itemKey: $itemKey, ')
          ..write('kind: $kind, ')
          ..write('localPath: $localPath, ')
          ..write('storagePath: $storagePath, ')
          ..write('mimeType: $mimeType, ')
          ..write('sizeBytes: $sizeBytes, ')
          ..write('uploaded: $uploaded, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalMembersTable extends LocalMembers
    with TableInfo<$LocalMembersTable, LocalMember> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalMembersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _fullNameMeta = const VerificationMeta(
    'fullName',
  );
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
    'full_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, fullName];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_members';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalMember> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('full_name')) {
      context.handle(
        _fullNameMeta,
        fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta),
      );
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalMember map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalMember(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      fullName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}full_name'],
      )!,
    );
  }

  @override
  $LocalMembersTable createAlias(String alias) {
    return $LocalMembersTable(attachedDatabase, alias);
  }
}

class LocalMember extends DataClass implements Insertable<LocalMember> {
  final String id;
  final String fullName;
  const LocalMember({required this.id, required this.fullName});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['full_name'] = Variable<String>(fullName);
    return map;
  }

  LocalMembersCompanion toCompanion(bool nullToAbsent) {
    return LocalMembersCompanion(id: Value(id), fullName: Value(fullName));
  }

  factory LocalMember.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalMember(
      id: serializer.fromJson<String>(json['id']),
      fullName: serializer.fromJson<String>(json['fullName']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'fullName': serializer.toJson<String>(fullName),
    };
  }

  LocalMember copyWith({String? id, String? fullName}) =>
      LocalMember(id: id ?? this.id, fullName: fullName ?? this.fullName);
  LocalMember copyWithCompanion(LocalMembersCompanion data) {
    return LocalMember(
      id: data.id.present ? data.id.value : this.id,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalMember(')
          ..write('id: $id, ')
          ..write('fullName: $fullName')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, fullName);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalMember &&
          other.id == this.id &&
          other.fullName == this.fullName);
}

class LocalMembersCompanion extends UpdateCompanion<LocalMember> {
  final Value<String> id;
  final Value<String> fullName;
  final Value<int> rowid;
  const LocalMembersCompanion({
    this.id = const Value.absent(),
    this.fullName = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalMembersCompanion.insert({
    required String id,
    required String fullName,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       fullName = Value(fullName);
  static Insertable<LocalMember> custom({
    Expression<String>? id,
    Expression<String>? fullName,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (fullName != null) 'full_name': fullName,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalMembersCompanion copyWith({
    Value<String>? id,
    Value<String>? fullName,
    Value<int>? rowid,
  }) {
    return LocalMembersCompanion(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalMembersCompanion(')
          ..write('id: $id, ')
          ..write('fullName: $fullName, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LocalAssessmentsTable localAssessments = $LocalAssessmentsTable(
    this,
  );
  late final $LocalResponsesTable localResponses = $LocalResponsesTable(this);
  late final $LocalFormVersionsTable localFormVersions =
      $LocalFormVersionsTable(this);
  late final $LocalLocationsTable localLocations = $LocalLocationsTable(this);
  late final $LocalHelpArticlesTable localHelpArticles =
      $LocalHelpArticlesTable(this);
  late final $LocalAttachmentsTable localAttachments = $LocalAttachmentsTable(
    this,
  );
  late final $LocalMembersTable localMembers = $LocalMembersTable(this);
  late final AssessmentsDao assessmentsDao = AssessmentsDao(
    this as AppDatabase,
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    localAssessments,
    localResponses,
    localFormVersions,
    localLocations,
    localHelpArticles,
    localAttachments,
    localMembers,
  ];
}

typedef $$LocalAssessmentsTableCreateCompanionBuilder =
    LocalAssessmentsCompanion Function({
      required String id,
      required String organisationId,
      required String formVersionId,
      required String locationId,
      Value<String> language,
      Value<String> status,
      required String createdBy,
      required String assessedOn,
      Value<String?> assessorsJson,
      Value<String?> reviewNote,
      Value<String?> totalsJson,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<bool> dirty,
      Value<int> rowid,
    });
typedef $$LocalAssessmentsTableUpdateCompanionBuilder =
    LocalAssessmentsCompanion Function({
      Value<String> id,
      Value<String> organisationId,
      Value<String> formVersionId,
      Value<String> locationId,
      Value<String> language,
      Value<String> status,
      Value<String> createdBy,
      Value<String> assessedOn,
      Value<String?> assessorsJson,
      Value<String?> reviewNote,
      Value<String?> totalsJson,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<bool> dirty,
      Value<int> rowid,
    });

class $$LocalAssessmentsTableFilterComposer
    extends Composer<_$AppDatabase, $LocalAssessmentsTable> {
  $$LocalAssessmentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get organisationId => $composableBuilder(
    column: $table.organisationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get formVersionId => $composableBuilder(
    column: $table.formVersionId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get locationId => $composableBuilder(
    column: $table.locationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdBy => $composableBuilder(
    column: $table.createdBy,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get assessedOn => $composableBuilder(
    column: $table.assessedOn,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get assessorsJson => $composableBuilder(
    column: $table.assessorsJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get reviewNote => $composableBuilder(
    column: $table.reviewNote,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get totalsJson => $composableBuilder(
    column: $table.totalsJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get dirty => $composableBuilder(
    column: $table.dirty,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalAssessmentsTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalAssessmentsTable> {
  $$LocalAssessmentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get organisationId => $composableBuilder(
    column: $table.organisationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get formVersionId => $composableBuilder(
    column: $table.formVersionId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get locationId => $composableBuilder(
    column: $table.locationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdBy => $composableBuilder(
    column: $table.createdBy,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get assessedOn => $composableBuilder(
    column: $table.assessedOn,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get assessorsJson => $composableBuilder(
    column: $table.assessorsJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get reviewNote => $composableBuilder(
    column: $table.reviewNote,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get totalsJson => $composableBuilder(
    column: $table.totalsJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get dirty => $composableBuilder(
    column: $table.dirty,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalAssessmentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalAssessmentsTable> {
  $$LocalAssessmentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organisationId => $composableBuilder(
    column: $table.organisationId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get formVersionId => $composableBuilder(
    column: $table.formVersionId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get locationId => $composableBuilder(
    column: $table.locationId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get language =>
      $composableBuilder(column: $table.language, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get createdBy =>
      $composableBuilder(column: $table.createdBy, builder: (column) => column);

  GeneratedColumn<String> get assessedOn => $composableBuilder(
    column: $table.assessedOn,
    builder: (column) => column,
  );

  GeneratedColumn<String> get assessorsJson => $composableBuilder(
    column: $table.assessorsJson,
    builder: (column) => column,
  );

  GeneratedColumn<String> get reviewNote => $composableBuilder(
    column: $table.reviewNote,
    builder: (column) => column,
  );

  GeneratedColumn<String> get totalsJson => $composableBuilder(
    column: $table.totalsJson,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<bool> get dirty =>
      $composableBuilder(column: $table.dirty, builder: (column) => column);
}

class $$LocalAssessmentsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalAssessmentsTable,
          LocalAssessment,
          $$LocalAssessmentsTableFilterComposer,
          $$LocalAssessmentsTableOrderingComposer,
          $$LocalAssessmentsTableAnnotationComposer,
          $$LocalAssessmentsTableCreateCompanionBuilder,
          $$LocalAssessmentsTableUpdateCompanionBuilder,
          (
            LocalAssessment,
            BaseReferences<
              _$AppDatabase,
              $LocalAssessmentsTable,
              LocalAssessment
            >,
          ),
          LocalAssessment,
          PrefetchHooks Function()
        > {
  $$LocalAssessmentsTableTableManager(
    _$AppDatabase db,
    $LocalAssessmentsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalAssessmentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalAssessmentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalAssessmentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> organisationId = const Value.absent(),
                Value<String> formVersionId = const Value.absent(),
                Value<String> locationId = const Value.absent(),
                Value<String> language = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> createdBy = const Value.absent(),
                Value<String> assessedOn = const Value.absent(),
                Value<String?> assessorsJson = const Value.absent(),
                Value<String?> reviewNote = const Value.absent(),
                Value<String?> totalsJson = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<bool> dirty = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalAssessmentsCompanion(
                id: id,
                organisationId: organisationId,
                formVersionId: formVersionId,
                locationId: locationId,
                language: language,
                status: status,
                createdBy: createdBy,
                assessedOn: assessedOn,
                assessorsJson: assessorsJson,
                reviewNote: reviewNote,
                totalsJson: totalsJson,
                createdAt: createdAt,
                updatedAt: updatedAt,
                dirty: dirty,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String organisationId,
                required String formVersionId,
                required String locationId,
                Value<String> language = const Value.absent(),
                Value<String> status = const Value.absent(),
                required String createdBy,
                required String assessedOn,
                Value<String?> assessorsJson = const Value.absent(),
                Value<String?> reviewNote = const Value.absent(),
                Value<String?> totalsJson = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<bool> dirty = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalAssessmentsCompanion.insert(
                id: id,
                organisationId: organisationId,
                formVersionId: formVersionId,
                locationId: locationId,
                language: language,
                status: status,
                createdBy: createdBy,
                assessedOn: assessedOn,
                assessorsJson: assessorsJson,
                reviewNote: reviewNote,
                totalsJson: totalsJson,
                createdAt: createdAt,
                updatedAt: updatedAt,
                dirty: dirty,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalAssessmentsTable, LocalAssessment>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalAssessmentsTable,
                    LocalAssessment
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalAssessmentsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalAssessmentsTable,
      LocalAssessment,
      $$LocalAssessmentsTableFilterComposer,
      $$LocalAssessmentsTableOrderingComposer,
      $$LocalAssessmentsTableAnnotationComposer,
      $$LocalAssessmentsTableCreateCompanionBuilder,
      $$LocalAssessmentsTableUpdateCompanionBuilder,
      (
        LocalAssessment,
        BaseReferences<_$AppDatabase, $LocalAssessmentsTable, LocalAssessment>,
      ),
      LocalAssessment,
      PrefetchHooks Function()
    >;
typedef $$LocalResponsesTableCreateCompanionBuilder =
    LocalResponsesCompanion Function({
      required String assessmentId,
      required String itemKey,
      Value<double?> value,
      Value<bool> notAssessed,
      Value<String?> note,
      Value<DateTime> updatedAt,
      Value<bool> dirty,
      Value<int> rowid,
    });
typedef $$LocalResponsesTableUpdateCompanionBuilder =
    LocalResponsesCompanion Function({
      Value<String> assessmentId,
      Value<String> itemKey,
      Value<double?> value,
      Value<bool> notAssessed,
      Value<String?> note,
      Value<DateTime> updatedAt,
      Value<bool> dirty,
      Value<int> rowid,
    });

class $$LocalResponsesTableFilterComposer
    extends Composer<_$AppDatabase, $LocalResponsesTable> {
  $$LocalResponsesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get itemKey => $composableBuilder(
    column: $table.itemKey,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get notAssessed => $composableBuilder(
    column: $table.notAssessed,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get dirty => $composableBuilder(
    column: $table.dirty,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalResponsesTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalResponsesTable> {
  $$LocalResponsesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get itemKey => $composableBuilder(
    column: $table.itemKey,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get notAssessed => $composableBuilder(
    column: $table.notAssessed,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get dirty => $composableBuilder(
    column: $table.dirty,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalResponsesTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalResponsesTable> {
  $$LocalResponsesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get itemKey =>
      $composableBuilder(column: $table.itemKey, builder: (column) => column);

  GeneratedColumn<double> get value =>
      $composableBuilder(column: $table.value, builder: (column) => column);

  GeneratedColumn<bool> get notAssessed => $composableBuilder(
    column: $table.notAssessed,
    builder: (column) => column,
  );

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<bool> get dirty =>
      $composableBuilder(column: $table.dirty, builder: (column) => column);
}

class $$LocalResponsesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalResponsesTable,
          LocalResponse,
          $$LocalResponsesTableFilterComposer,
          $$LocalResponsesTableOrderingComposer,
          $$LocalResponsesTableAnnotationComposer,
          $$LocalResponsesTableCreateCompanionBuilder,
          $$LocalResponsesTableUpdateCompanionBuilder,
          (
            LocalResponse,
            BaseReferences<_$AppDatabase, $LocalResponsesTable, LocalResponse>,
          ),
          LocalResponse,
          PrefetchHooks Function()
        > {
  $$LocalResponsesTableTableManager(
    _$AppDatabase db,
    $LocalResponsesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalResponsesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalResponsesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalResponsesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> assessmentId = const Value.absent(),
                Value<String> itemKey = const Value.absent(),
                Value<double?> value = const Value.absent(),
                Value<bool> notAssessed = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<bool> dirty = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalResponsesCompanion(
                assessmentId: assessmentId,
                itemKey: itemKey,
                value: value,
                notAssessed: notAssessed,
                note: note,
                updatedAt: updatedAt,
                dirty: dirty,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String assessmentId,
                required String itemKey,
                Value<double?> value = const Value.absent(),
                Value<bool> notAssessed = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<bool> dirty = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalResponsesCompanion.insert(
                assessmentId: assessmentId,
                itemKey: itemKey,
                value: value,
                notAssessed: notAssessed,
                note: note,
                updatedAt: updatedAt,
                dirty: dirty,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalResponsesTable, LocalResponse>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalResponsesTable,
                    LocalResponse
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalResponsesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalResponsesTable,
      LocalResponse,
      $$LocalResponsesTableFilterComposer,
      $$LocalResponsesTableOrderingComposer,
      $$LocalResponsesTableAnnotationComposer,
      $$LocalResponsesTableCreateCompanionBuilder,
      $$LocalResponsesTableUpdateCompanionBuilder,
      (
        LocalResponse,
        BaseReferences<_$AppDatabase, $LocalResponsesTable, LocalResponse>,
      ),
      LocalResponse,
      PrefetchHooks Function()
    >;
typedef $$LocalFormVersionsTableCreateCompanionBuilder =
    LocalFormVersionsCompanion Function({
      required String id,
      required String formId,
      required String version,
      required String definitionJson,
      Value<DateTime> pulledAt,
      Value<int> rowid,
    });
typedef $$LocalFormVersionsTableUpdateCompanionBuilder =
    LocalFormVersionsCompanion Function({
      Value<String> id,
      Value<String> formId,
      Value<String> version,
      Value<String> definitionJson,
      Value<DateTime> pulledAt,
      Value<int> rowid,
    });

class $$LocalFormVersionsTableFilterComposer
    extends Composer<_$AppDatabase, $LocalFormVersionsTable> {
  $$LocalFormVersionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get formId => $composableBuilder(
    column: $table.formId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get version => $composableBuilder(
    column: $table.version,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get definitionJson => $composableBuilder(
    column: $table.definitionJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get pulledAt => $composableBuilder(
    column: $table.pulledAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalFormVersionsTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalFormVersionsTable> {
  $$LocalFormVersionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get formId => $composableBuilder(
    column: $table.formId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get version => $composableBuilder(
    column: $table.version,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get definitionJson => $composableBuilder(
    column: $table.definitionJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get pulledAt => $composableBuilder(
    column: $table.pulledAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalFormVersionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalFormVersionsTable> {
  $$LocalFormVersionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get formId =>
      $composableBuilder(column: $table.formId, builder: (column) => column);

  GeneratedColumn<String> get version =>
      $composableBuilder(column: $table.version, builder: (column) => column);

  GeneratedColumn<String> get definitionJson => $composableBuilder(
    column: $table.definitionJson,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get pulledAt =>
      $composableBuilder(column: $table.pulledAt, builder: (column) => column);
}

class $$LocalFormVersionsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalFormVersionsTable,
          LocalFormVersion,
          $$LocalFormVersionsTableFilterComposer,
          $$LocalFormVersionsTableOrderingComposer,
          $$LocalFormVersionsTableAnnotationComposer,
          $$LocalFormVersionsTableCreateCompanionBuilder,
          $$LocalFormVersionsTableUpdateCompanionBuilder,
          (
            LocalFormVersion,
            BaseReferences<
              _$AppDatabase,
              $LocalFormVersionsTable,
              LocalFormVersion
            >,
          ),
          LocalFormVersion,
          PrefetchHooks Function()
        > {
  $$LocalFormVersionsTableTableManager(
    _$AppDatabase db,
    $LocalFormVersionsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalFormVersionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalFormVersionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalFormVersionsTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> formId = const Value.absent(),
                Value<String> version = const Value.absent(),
                Value<String> definitionJson = const Value.absent(),
                Value<DateTime> pulledAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalFormVersionsCompanion(
                id: id,
                formId: formId,
                version: version,
                definitionJson: definitionJson,
                pulledAt: pulledAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String formId,
                required String version,
                required String definitionJson,
                Value<DateTime> pulledAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalFormVersionsCompanion.insert(
                id: id,
                formId: formId,
                version: version,
                definitionJson: definitionJson,
                pulledAt: pulledAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalFormVersionsTable, LocalFormVersion>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalFormVersionsTable,
                    LocalFormVersion
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalFormVersionsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalFormVersionsTable,
      LocalFormVersion,
      $$LocalFormVersionsTableFilterComposer,
      $$LocalFormVersionsTableOrderingComposer,
      $$LocalFormVersionsTableAnnotationComposer,
      $$LocalFormVersionsTableCreateCompanionBuilder,
      $$LocalFormVersionsTableUpdateCompanionBuilder,
      (
        LocalFormVersion,
        BaseReferences<
          _$AppDatabase,
          $LocalFormVersionsTable,
          LocalFormVersion
        >,
      ),
      LocalFormVersion,
      PrefetchHooks Function()
    >;
typedef $$LocalLocationsTableCreateCompanionBuilder =
    LocalLocationsCompanion Function({
      required String id,
      Value<String?> parentId,
      required String code,
      required String nameJson,
      Value<int> level,
      Value<bool> active,
      Value<int> rowid,
    });
typedef $$LocalLocationsTableUpdateCompanionBuilder =
    LocalLocationsCompanion Function({
      Value<String> id,
      Value<String?> parentId,
      Value<String> code,
      Value<String> nameJson,
      Value<int> level,
      Value<bool> active,
      Value<int> rowid,
    });

class $$LocalLocationsTableFilterComposer
    extends Composer<_$AppDatabase, $LocalLocationsTable> {
  $$LocalLocationsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get parentId => $composableBuilder(
    column: $table.parentId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get code => $composableBuilder(
    column: $table.code,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nameJson => $composableBuilder(
    column: $table.nameJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get level => $composableBuilder(
    column: $table.level,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get active => $composableBuilder(
    column: $table.active,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalLocationsTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalLocationsTable> {
  $$LocalLocationsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get parentId => $composableBuilder(
    column: $table.parentId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get code => $composableBuilder(
    column: $table.code,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nameJson => $composableBuilder(
    column: $table.nameJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get level => $composableBuilder(
    column: $table.level,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get active => $composableBuilder(
    column: $table.active,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalLocationsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalLocationsTable> {
  $$LocalLocationsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get parentId =>
      $composableBuilder(column: $table.parentId, builder: (column) => column);

  GeneratedColumn<String> get code =>
      $composableBuilder(column: $table.code, builder: (column) => column);

  GeneratedColumn<String> get nameJson =>
      $composableBuilder(column: $table.nameJson, builder: (column) => column);

  GeneratedColumn<int> get level =>
      $composableBuilder(column: $table.level, builder: (column) => column);

  GeneratedColumn<bool> get active =>
      $composableBuilder(column: $table.active, builder: (column) => column);
}

class $$LocalLocationsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalLocationsTable,
          LocalLocation,
          $$LocalLocationsTableFilterComposer,
          $$LocalLocationsTableOrderingComposer,
          $$LocalLocationsTableAnnotationComposer,
          $$LocalLocationsTableCreateCompanionBuilder,
          $$LocalLocationsTableUpdateCompanionBuilder,
          (
            LocalLocation,
            BaseReferences<_$AppDatabase, $LocalLocationsTable, LocalLocation>,
          ),
          LocalLocation,
          PrefetchHooks Function()
        > {
  $$LocalLocationsTableTableManager(
    _$AppDatabase db,
    $LocalLocationsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalLocationsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalLocationsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalLocationsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String?> parentId = const Value.absent(),
                Value<String> code = const Value.absent(),
                Value<String> nameJson = const Value.absent(),
                Value<int> level = const Value.absent(),
                Value<bool> active = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalLocationsCompanion(
                id: id,
                parentId: parentId,
                code: code,
                nameJson: nameJson,
                level: level,
                active: active,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                Value<String?> parentId = const Value.absent(),
                required String code,
                required String nameJson,
                Value<int> level = const Value.absent(),
                Value<bool> active = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalLocationsCompanion.insert(
                id: id,
                parentId: parentId,
                code: code,
                nameJson: nameJson,
                level: level,
                active: active,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalLocationsTable, LocalLocation>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalLocationsTable,
                    LocalLocation
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalLocationsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalLocationsTable,
      LocalLocation,
      $$LocalLocationsTableFilterComposer,
      $$LocalLocationsTableOrderingComposer,
      $$LocalLocationsTableAnnotationComposer,
      $$LocalLocationsTableCreateCompanionBuilder,
      $$LocalLocationsTableUpdateCompanionBuilder,
      (
        LocalLocation,
        BaseReferences<_$AppDatabase, $LocalLocationsTable, LocalLocation>,
      ),
      LocalLocation,
      PrefetchHooks Function()
    >;
typedef $$LocalHelpArticlesTableCreateCompanionBuilder =
    LocalHelpArticlesCompanion Function({
      required String id,
      required String slug,
      required String titleJson,
      required String bodyJson,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });
typedef $$LocalHelpArticlesTableUpdateCompanionBuilder =
    LocalHelpArticlesCompanion Function({
      Value<String> id,
      Value<String> slug,
      Value<String> titleJson,
      Value<String> bodyJson,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$LocalHelpArticlesTableFilterComposer
    extends Composer<_$AppDatabase, $LocalHelpArticlesTable> {
  $$LocalHelpArticlesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get slug => $composableBuilder(
    column: $table.slug,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get titleJson => $composableBuilder(
    column: $table.titleJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get bodyJson => $composableBuilder(
    column: $table.bodyJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalHelpArticlesTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalHelpArticlesTable> {
  $$LocalHelpArticlesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get slug => $composableBuilder(
    column: $table.slug,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get titleJson => $composableBuilder(
    column: $table.titleJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get bodyJson => $composableBuilder(
    column: $table.bodyJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalHelpArticlesTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalHelpArticlesTable> {
  $$LocalHelpArticlesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get slug =>
      $composableBuilder(column: $table.slug, builder: (column) => column);

  GeneratedColumn<String> get titleJson =>
      $composableBuilder(column: $table.titleJson, builder: (column) => column);

  GeneratedColumn<String> get bodyJson =>
      $composableBuilder(column: $table.bodyJson, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LocalHelpArticlesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalHelpArticlesTable,
          LocalHelpArticle,
          $$LocalHelpArticlesTableFilterComposer,
          $$LocalHelpArticlesTableOrderingComposer,
          $$LocalHelpArticlesTableAnnotationComposer,
          $$LocalHelpArticlesTableCreateCompanionBuilder,
          $$LocalHelpArticlesTableUpdateCompanionBuilder,
          (
            LocalHelpArticle,
            BaseReferences<
              _$AppDatabase,
              $LocalHelpArticlesTable,
              LocalHelpArticle
            >,
          ),
          LocalHelpArticle,
          PrefetchHooks Function()
        > {
  $$LocalHelpArticlesTableTableManager(
    _$AppDatabase db,
    $LocalHelpArticlesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalHelpArticlesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalHelpArticlesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalHelpArticlesTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> slug = const Value.absent(),
                Value<String> titleJson = const Value.absent(),
                Value<String> bodyJson = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalHelpArticlesCompanion(
                id: id,
                slug: slug,
                titleJson: titleJson,
                bodyJson: bodyJson,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String slug,
                required String titleJson,
                required String bodyJson,
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalHelpArticlesCompanion.insert(
                id: id,
                slug: slug,
                titleJson: titleJson,
                bodyJson: bodyJson,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalHelpArticlesTable, LocalHelpArticle>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalHelpArticlesTable,
                    LocalHelpArticle
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalHelpArticlesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalHelpArticlesTable,
      LocalHelpArticle,
      $$LocalHelpArticlesTableFilterComposer,
      $$LocalHelpArticlesTableOrderingComposer,
      $$LocalHelpArticlesTableAnnotationComposer,
      $$LocalHelpArticlesTableCreateCompanionBuilder,
      $$LocalHelpArticlesTableUpdateCompanionBuilder,
      (
        LocalHelpArticle,
        BaseReferences<
          _$AppDatabase,
          $LocalHelpArticlesTable,
          LocalHelpArticle
        >,
      ),
      LocalHelpArticle,
      PrefetchHooks Function()
    >;
typedef $$LocalAttachmentsTableCreateCompanionBuilder =
    LocalAttachmentsCompanion Function({
      required String id,
      required String assessmentId,
      Value<String?> itemKey,
      required String kind,
      required String localPath,
      Value<String?> storagePath,
      Value<String?> mimeType,
      Value<int?> sizeBytes,
      Value<bool> uploaded,
      Value<DateTime> createdAt,
      Value<int> rowid,
    });
typedef $$LocalAttachmentsTableUpdateCompanionBuilder =
    LocalAttachmentsCompanion Function({
      Value<String> id,
      Value<String> assessmentId,
      Value<String?> itemKey,
      Value<String> kind,
      Value<String> localPath,
      Value<String?> storagePath,
      Value<String?> mimeType,
      Value<int?> sizeBytes,
      Value<bool> uploaded,
      Value<DateTime> createdAt,
      Value<int> rowid,
    });

class $$LocalAttachmentsTableFilterComposer
    extends Composer<_$AppDatabase, $LocalAttachmentsTable> {
  $$LocalAttachmentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get itemKey => $composableBuilder(
    column: $table.itemKey,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get kind => $composableBuilder(
    column: $table.kind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get localPath => $composableBuilder(
    column: $table.localPath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get mimeType => $composableBuilder(
    column: $table.mimeType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get sizeBytes => $composableBuilder(
    column: $table.sizeBytes,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get uploaded => $composableBuilder(
    column: $table.uploaded,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalAttachmentsTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalAttachmentsTable> {
  $$LocalAttachmentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get itemKey => $composableBuilder(
    column: $table.itemKey,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get kind => $composableBuilder(
    column: $table.kind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get localPath => $composableBuilder(
    column: $table.localPath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get mimeType => $composableBuilder(
    column: $table.mimeType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get sizeBytes => $composableBuilder(
    column: $table.sizeBytes,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get uploaded => $composableBuilder(
    column: $table.uploaded,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalAttachmentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalAttachmentsTable> {
  $$LocalAttachmentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get assessmentId => $composableBuilder(
    column: $table.assessmentId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get itemKey =>
      $composableBuilder(column: $table.itemKey, builder: (column) => column);

  GeneratedColumn<String> get kind =>
      $composableBuilder(column: $table.kind, builder: (column) => column);

  GeneratedColumn<String> get localPath =>
      $composableBuilder(column: $table.localPath, builder: (column) => column);

  GeneratedColumn<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => column,
  );

  GeneratedColumn<String> get mimeType =>
      $composableBuilder(column: $table.mimeType, builder: (column) => column);

  GeneratedColumn<int> get sizeBytes =>
      $composableBuilder(column: $table.sizeBytes, builder: (column) => column);

  GeneratedColumn<bool> get uploaded =>
      $composableBuilder(column: $table.uploaded, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$LocalAttachmentsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalAttachmentsTable,
          LocalAttachment,
          $$LocalAttachmentsTableFilterComposer,
          $$LocalAttachmentsTableOrderingComposer,
          $$LocalAttachmentsTableAnnotationComposer,
          $$LocalAttachmentsTableCreateCompanionBuilder,
          $$LocalAttachmentsTableUpdateCompanionBuilder,
          (
            LocalAttachment,
            BaseReferences<
              _$AppDatabase,
              $LocalAttachmentsTable,
              LocalAttachment
            >,
          ),
          LocalAttachment,
          PrefetchHooks Function()
        > {
  $$LocalAttachmentsTableTableManager(
    _$AppDatabase db,
    $LocalAttachmentsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalAttachmentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalAttachmentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalAttachmentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> assessmentId = const Value.absent(),
                Value<String?> itemKey = const Value.absent(),
                Value<String> kind = const Value.absent(),
                Value<String> localPath = const Value.absent(),
                Value<String?> storagePath = const Value.absent(),
                Value<String?> mimeType = const Value.absent(),
                Value<int?> sizeBytes = const Value.absent(),
                Value<bool> uploaded = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalAttachmentsCompanion(
                id: id,
                assessmentId: assessmentId,
                itemKey: itemKey,
                kind: kind,
                localPath: localPath,
                storagePath: storagePath,
                mimeType: mimeType,
                sizeBytes: sizeBytes,
                uploaded: uploaded,
                createdAt: createdAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String assessmentId,
                Value<String?> itemKey = const Value.absent(),
                required String kind,
                required String localPath,
                Value<String?> storagePath = const Value.absent(),
                Value<String?> mimeType = const Value.absent(),
                Value<int?> sizeBytes = const Value.absent(),
                Value<bool> uploaded = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalAttachmentsCompanion.insert(
                id: id,
                assessmentId: assessmentId,
                itemKey: itemKey,
                kind: kind,
                localPath: localPath,
                storagePath: storagePath,
                mimeType: mimeType,
                sizeBytes: sizeBytes,
                uploaded: uploaded,
                createdAt: createdAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalAttachmentsTable, LocalAttachment>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalAttachmentsTable,
                    LocalAttachment
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalAttachmentsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalAttachmentsTable,
      LocalAttachment,
      $$LocalAttachmentsTableFilterComposer,
      $$LocalAttachmentsTableOrderingComposer,
      $$LocalAttachmentsTableAnnotationComposer,
      $$LocalAttachmentsTableCreateCompanionBuilder,
      $$LocalAttachmentsTableUpdateCompanionBuilder,
      (
        LocalAttachment,
        BaseReferences<_$AppDatabase, $LocalAttachmentsTable, LocalAttachment>,
      ),
      LocalAttachment,
      PrefetchHooks Function()
    >;
typedef $$LocalMembersTableCreateCompanionBuilder =
    LocalMembersCompanion Function({
      required String id,
      required String fullName,
      Value<int> rowid,
    });
typedef $$LocalMembersTableUpdateCompanionBuilder =
    LocalMembersCompanion Function({
      Value<String> id,
      Value<String> fullName,
      Value<int> rowid,
    });

class $$LocalMembersTableFilterComposer
    extends Composer<_$AppDatabase, $LocalMembersTable> {
  $$LocalMembersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get fullName => $composableBuilder(
    column: $table.fullName,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalMembersTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalMembersTable> {
  $$LocalMembersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get fullName => $composableBuilder(
    column: $table.fullName,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalMembersTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalMembersTable> {
  $$LocalMembersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);
}

class $$LocalMembersTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalMembersTable,
          LocalMember,
          $$LocalMembersTableFilterComposer,
          $$LocalMembersTableOrderingComposer,
          $$LocalMembersTableAnnotationComposer,
          $$LocalMembersTableCreateCompanionBuilder,
          $$LocalMembersTableUpdateCompanionBuilder,
          (
            LocalMember,
            BaseReferences<_$AppDatabase, $LocalMembersTable, LocalMember>,
          ),
          LocalMember,
          PrefetchHooks Function()
        > {
  $$LocalMembersTableTableManager(_$AppDatabase db, $LocalMembersTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalMembersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalMembersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalMembersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> fullName = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalMembersCompanion(
                id: id,
                fullName: fullName,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String fullName,
                Value<int> rowid = const Value.absent(),
              }) => LocalMembersCompanion.insert(
                id: id,
                fullName: fullName,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalMembersTable, LocalMember>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalMembersTable,
                    LocalMember
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalMembersTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalMembersTable,
      LocalMember,
      $$LocalMembersTableFilterComposer,
      $$LocalMembersTableOrderingComposer,
      $$LocalMembersTableAnnotationComposer,
      $$LocalMembersTableCreateCompanionBuilder,
      $$LocalMembersTableUpdateCompanionBuilder,
      (
        LocalMember,
        BaseReferences<_$AppDatabase, $LocalMembersTable, LocalMember>,
      ),
      LocalMember,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LocalAssessmentsTableTableManager get localAssessments =>
      $$LocalAssessmentsTableTableManager(_db, _db.localAssessments);
  $$LocalResponsesTableTableManager get localResponses =>
      $$LocalResponsesTableTableManager(_db, _db.localResponses);
  $$LocalFormVersionsTableTableManager get localFormVersions =>
      $$LocalFormVersionsTableTableManager(_db, _db.localFormVersions);
  $$LocalLocationsTableTableManager get localLocations =>
      $$LocalLocationsTableTableManager(_db, _db.localLocations);
  $$LocalHelpArticlesTableTableManager get localHelpArticles =>
      $$LocalHelpArticlesTableTableManager(_db, _db.localHelpArticles);
  $$LocalAttachmentsTableTableManager get localAttachments =>
      $$LocalAttachmentsTableTableManager(_db, _db.localAttachments);
  $$LocalMembersTableTableManager get localMembers =>
      $$LocalMembersTableTableManager(_db, _db.localMembers);
}
