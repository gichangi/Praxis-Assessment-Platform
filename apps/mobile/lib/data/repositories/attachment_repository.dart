import 'dart:io';
import 'dart:math';

import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../database/app_database.dart';
import 'assessment_repository.dart';

final attachmentRepoProvider = Provider<AttachmentRepository>(
  (ref) => AttachmentRepository(ref.watch(dbProvider)),
);

class AttachmentRepository {
  AttachmentRepository(this._db);

  final AppDatabase _db;

  AssessmentsDao get _dao => _db.assessmentsDao;

  Stream<List<LocalAttachment>> watchItem(String assessmentId, String itemKey) =>
      _dao.watchAttachments(assessmentId, itemKey);

  Future<List<LocalAttachment>> listItem(String assessmentId, String itemKey) =>
      _dao.attachmentsFor(assessmentId, itemKey);

  /// Saves a voice note file and registers it for upload.
  /// [sourceFile] is the temporary file produced by the recorder.
  Future<LocalAttachment> addVoiceNote({
    required String assessmentId,
    required String itemKey,
    required File sourceFile,
  }) async {
    final id = _uuid();
    final dest = await _permanentPath(assessmentId, id, 'voice', 'm4a');
    await sourceFile.copy(dest);
    final size = await File(dest).length();

    final companion = LocalAttachmentsCompanion.insert(
      id: id,
      assessmentId: assessmentId,
      itemKey: Value(itemKey),
      kind: 'voice',
      localPath: dest,
      mimeType: const Value('audio/m4a'),
      sizeBytes: Value(size),
    );
    await _dao.insertAttachment(companion);
    final inserted = await _dao.attachmentsFor(assessmentId, itemKey);
    return inserted.firstWhere((a) => a.id == id);
  }

  /// Saves a compressed photo file and registers it for upload.
  Future<LocalAttachment> addPhoto({
    required String assessmentId,
    required String itemKey,
    required File sourceFile,
  }) async {
    final id = _uuid();
    final dest = await _permanentPath(assessmentId, id, 'photo', 'jpg');
    await sourceFile.copy(dest);
    final size = await File(dest).length();

    final companion = LocalAttachmentsCompanion.insert(
      id: id,
      assessmentId: assessmentId,
      itemKey: Value(itemKey),
      kind: 'photo',
      localPath: dest,
      mimeType: const Value('image/jpeg'),
      sizeBytes: Value(size),
    );
    await _dao.insertAttachment(companion);
    final inserted = await _dao.attachmentsFor(assessmentId, itemKey);
    return inserted.firstWhere((a) => a.id == id);
  }

  Future<void> delete(LocalAttachment att) async {
    await _dao.deleteAttachment(att.id);
    try {
      await File(att.localPath).delete();
    } catch (_) {}
  }

  Future<String> _permanentPath(String assessmentId, String id, String kind, String ext) async {
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(base.path, 'attachments', assessmentId, kind));
    await dir.create(recursive: true);
    return p.join(dir.path, '$id.$ext');
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
