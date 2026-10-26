import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../database/app_database.dart';
import '../repositories/assessment_repository.dart';
import 'sync_api.dart';

// ─── Status ───────────────────────────────────────────────────────────────────

sealed class SyncStatus {
  const SyncStatus();
}

final class SyncIdle extends SyncStatus {
  const SyncIdle();
}

final class SyncProgress extends SyncStatus {
  const SyncProgress();
}

final class SyncError extends SyncStatus {
  const SyncError(this.message);
  final String message;
}

final class SyncConflict extends SyncStatus {
  const SyncConflict(this.count);
  final int count;
}

// ─── Providers ────────────────────────────────────────────────────────────────

final syncEngineProvider = Provider<SyncEngine>((ref) {
  final engine = SyncEngine(
    db: ref.watch(dbProvider),
    api: SyncApi(Supabase.instance.client),
    storage: const FlutterSecureStorage(),
  );
  ref.onDispose(engine.dispose);
  return engine;
});

// ─── Engine ───────────────────────────────────────────────────────────────────

class SyncEngine {
  SyncEngine({required this.db, required this.api, required this.storage});

  final AppDatabase db;
  final SyncApi api;
  final FlutterSecureStorage storage;

  final _statusCtrl = StreamController<SyncStatus>.broadcast();
  Stream<SyncStatus> get statusStream => _statusCtrl.stream;

  bool _syncing = false;
  int _failureCount = 0;
  Timer? _retryTimer;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  static const _retryDelays = [
    Duration(seconds: 10),
    Duration(seconds: 30),
    Duration(seconds: 90),
  ];

  void start() {
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      if (results.any((r) => r != ConnectivityResult.none)) sync();
    });
    sync();
  }

  void dispose() {
    _retryTimer?.cancel();
    _connectivitySub?.cancel();
    _statusCtrl.close();
  }

  Future<void> sync() async {
    if (_syncing) return;
    if (Supabase.instance.client.auth.currentSession == null) return;
    _syncing = true;
    _retryTimer?.cancel();
    _statusCtrl.add(const SyncProgress());

    try {
      await _doSync();
      _failureCount = 0;
      _statusCtrl.add(const SyncIdle());
    } catch (e) {
      _failureCount++;
      _statusCtrl.add(SyncError(e.toString()));
      _scheduleRetry();
    } finally {
      _syncing = false;
    }
  }

  void _scheduleRetry() {
    final idx = (_failureCount - 1).clamp(0, _retryDelays.length - 1);
    _retryTimer = Timer(_retryDelays[idx], sync);
  }

  // ─── Core sync ───────────────────────────────────────────────────────────────

  Future<void> _doSync() async {
    final deviceId = await _deviceId();
    final cursor = await storage.read(key: 'sync_cursor');

    final dirtyAssessments = await db.assessmentsDao.getDirty();
    final dirtyResponses = await db.assessmentsDao.getDirtyResponses();

    final push = <Map<String, dynamic>>[
      ...dirtyAssessments.map(_assessmentRow),
      ...dirtyResponses.map(_responseRow),
    ];

    final result = await api.call(SyncRequest(
      deviceId: deviceId,
      push: push,
      cursor: cursor,
    ));

    // Mark each accepted push as clean
    final rejectedAsmntIds = result.rejected
        .where((r) => r.table == 'assessments')
        .map((r) => r.id)
        .toSet();
    final rejectedResponseKeys = result.rejected
        .where((r) => r.table == 'responses')
        .map((r) => r.id)
        .toSet();

    for (final a in dirtyAssessments) {
      if (!rejectedAsmntIds.contains(a.id)) {
        await db.assessmentsDao.markAssessmentClean(a.id);
      }
    }
    for (final r in dirtyResponses) {
      if (!rejectedResponseKeys.contains('${r.assessmentId}/${r.itemKey}')) {
        await db.assessmentsDao.markResponseClean(r.assessmentId, r.itemKey);
      }
    }

    await _applyPull(result.pull);
    await storage.write(key: 'sync_cursor', value: result.cursor);
    await _uploadPendingAttachments();

    final conflicts = result.rejected.where((r) => r.isConflict).length;
    if (conflicts > 0) _statusCtrl.add(SyncConflict(conflicts));
  }

  // ─── Push serialisers ────────────────────────────────────────────────────────

  Map<String, dynamic> _assessmentRow(LocalAssessment a) => {
        'table': 'assessments',
        'record': {
          'id': a.id,
          'organisation_id': a.organisationId,
          'form_version_id': a.formVersionId,
          'location_id': a.locationId,
          'language': a.language,
          'created_by': a.createdBy,
          'assessed_on': a.assessedOn,
          'assessors': a.assessorsJson != null
              ? (jsonDecode(a.assessorsJson!) as List).cast<String>()
              : <String>[],
          'updated_at': a.updatedAt.toIso8601String(),
        },
      };

  Map<String, dynamic> _responseRow(LocalResponse r) => {
        'table': 'responses',
        'record': {
          'assessment_id': r.assessmentId,
          'item_key': r.itemKey,
          if (r.value != null) 'value': r.value,
          'not_assessed': r.notAssessed,
          if (r.note != null) 'note': r.note,
          'updated_at': r.updatedAt.toIso8601String(),
        },
      };

  // ─── Pull applier ────────────────────────────────────────────────────────────

  Future<void> _applyPull(SyncPull pull) async {
    for (final fv in pull.formVersions) {
      await db.assessmentsDao.upsertFormVersion(LocalFormVersionsCompanion.insert(
        id: fv['id'] as String,
        formId: fv['form_id'] as String,
        version: fv['version'] as String,
        definitionJson: jsonEncode(fv['definition']),
        pulledAt: Value(DateTime.now()),
      ));
    }

    if (pull.locations.isNotEmpty) {
      await db.assessmentsDao.upsertLocations(pull.locations.map((d) =>
        LocalLocationsCompanion.insert(
          id: d['id'] as String,
          parentId: Value(d['parent_id'] as String?),
          code: d['code'] as String,
          nameJson: jsonEncode(d['name']),
          level: Value(d['level'] as int? ?? 0),
          active: Value(d['active'] as bool? ?? true),
        )).toList());
    }

    for (final a in pull.assessments) {
      await db.assessmentsDao.upsertAssessment(LocalAssessmentsCompanion(
        id: Value(a['id'] as String),
        organisationId: Value(a['organisation_id'] as String),
        formVersionId: Value(a['form_version_id'] as String),
        locationId: Value(a['location_id'] as String),
        language: Value(a['language'] as String? ?? 'en'),
        status: Value(a['status'] as String? ?? 'draft'),
        createdBy: Value(a['created_by'] as String),
        assessedOn: Value(a['assessed_on'] as String),
        reviewNote: Value(a['review_note'] as String?),
        assessorsJson: Value(a['assessors'] != null ? jsonEncode(a['assessors']) : null),
        totalsJson: Value(a['totals'] != null ? jsonEncode(a['totals']) : null),
        updatedAt: Value(DateTime.parse(a['updated_at'] as String)),
        dirty: const Value(false),
      ));
    }

    for (final r in pull.responses) {
      await db.assessmentsDao.upsertResponse(LocalResponsesCompanion(
        assessmentId: Value(r['assessment_id'] as String),
        itemKey: Value(r['item_key'] as String),
        value: Value((r['value'] as num?)?.toDouble()),
        notAssessed: Value(r['not_assessed'] as bool? ?? false),
        note: Value(r['note'] as String?),
        updatedAt: Value(DateTime.parse(r['updated_at'] as String)),
        dirty: const Value(false),
      ));
    }

    for (final h in pull.helpArticles) {
      await db.assessmentsDao.upsertHelpArticle(LocalHelpArticlesCompanion.insert(
        id: h['id'] as String,
        slug: h['slug'] as String,
        titleJson: jsonEncode(h['title']),
        bodyJson: jsonEncode(h['body']),
        updatedAt: Value(DateTime.parse(h['updated_at'] as String)),
      ));
    }

    if (pull.members.isNotEmpty) {
      await db.assessmentsDao.upsertMembers(pull.members.map((m) =>
        LocalMembersCompanion.insert(
          id: m['id'] as String,
          fullName: m['full_name'] as String? ?? '',
        )).toList());
    }
  }

  // ─── Attachment upload ────────────────────────────────────────────────────────

  Future<void> _uploadPendingAttachments() async {
    final pending = await db.assessmentsDao.pendingUploads();
    for (final att in pending) {
      try {
        final file = File(att.localPath);
        if (!await file.exists()) continue;
        final bytes = await file.readAsBytes();
        final path = att.storagePath ?? att.id;
        await Supabase.instance.client.storage.from('attachments').uploadBinary(
              path,
              bytes,
              fileOptions: FileOptions(contentType: att.mimeType ?? 'application/octet-stream'),
            );
        await db.assessmentsDao.markAttachmentUploaded(att.id, path);
      } catch (_) {
        // Non-fatal; retried on next successful sync.
      }
    }
  }

  // ─── Device ID ────────────────────────────────────────────────────────────────

  Future<String> _deviceId() async {
    var id = await storage.read(key: 'device_id');
    if (id == null) {
      id = _uuid();
      await storage.write(key: 'device_id', value: id);
    }
    return id;
  }

  static String _uuid() {
    final r = Random.secure();
    final bytes = List<int>.generate(16, (_) => r.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    String hex(int b) => b.toRadixString(16).padLeft(2, '0');
    final h = bytes.map(hex).join();
    return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}';
  }
}
