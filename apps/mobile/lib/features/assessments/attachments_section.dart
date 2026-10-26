import 'dart:io';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import '../../app/theme.dart';
import '../../data/database/app_database.dart';
import '../../data/repositories/attachment_repository.dart';

class AttachmentsSection extends ConsumerStatefulWidget {
  const AttachmentsSection({
    super.key,
    required this.assessmentId,
    required this.itemKey,
    this.showActions = true,
  });

  final String assessmentId;
  final String itemKey;
  /// When false, renders only the attachment list without the Record/Camera/Gallery buttons.
  final bool showActions;

  @override
  ConsumerState<AttachmentsSection> createState() => _AttachmentsSectionState();
}

class _AttachmentsSectionState extends ConsumerState<AttachmentsSection> {
  final _recorder = AudioRecorder();
  final _player = AudioPlayer();
  bool _recording = false;
  String? _playingId;

  @override
  void dispose() {
    _recorder.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) return;
    final dir = await getTemporaryDirectory();
    final path = p.join(dir.path, 'voice_${DateTime.now().millisecondsSinceEpoch}.m4a');
    await _recorder.start(RecordConfig(encoder: AudioEncoder.aacLc), path: path);
    if (mounted) setState(() => _recording = true);
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    if (!mounted) return;
    setState(() => _recording = false);
    if (path == null) return;
    await ref.read(attachmentRepoProvider).addVoiceNote(
          assessmentId: widget.assessmentId,
          itemKey: widget.itemKey,
          sourceFile: File(path),
        );
  }

  Future<void> _pickPhoto(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 1600);
    if (picked == null || !mounted) return;

    final tmpDir = await getTemporaryDirectory();
    final outPath = p.join(tmpDir.path, 'photo_${DateTime.now().millisecondsSinceEpoch}.jpg');
    final result = await FlutterImageCompress.compressAndGetFile(
      picked.path,
      outPath,
      quality: 82,
      minWidth: 0,
      minHeight: 0,
    );
    if (result == null || !mounted) return;

    await ref.read(attachmentRepoProvider).addPhoto(
          assessmentId: widget.assessmentId,
          itemKey: widget.itemKey,
          sourceFile: File(result.path),
        );
  }

  Future<void> _togglePlay(LocalAttachment att) async {
    if (_playingId == att.id) {
      await _player.stop();
      if (mounted) setState(() => _playingId = null);
      return;
    }
    setState(() => _playingId = att.id);
    await _player.setFilePath(att.localPath);
    await _player.play();
    _player.playerStateStream.firstWhere((s) => s.processingState == ProcessingState.completed)
        .then((_) { if (mounted) setState(() => _playingId = null); });
  }

  Future<void> _delete(LocalAttachment att) async {
    await ref.read(attachmentRepoProvider).delete(att);
    if (_playingId == att.id) {
      await _player.stop();
      if (mounted) setState(() => _playingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stream = ref.watch(attachmentRepoProvider)
        // ignore: invalid_use_of_protected_member
        .watchItem(widget.assessmentId, widget.itemKey);

    return StreamBuilder<List<LocalAttachment>>(
      stream: stream,
      builder: (context, snap) {
        final attachments = snap.data ?? [];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('assessments_attachments'),
              style: Theme.of(context)
                  .textTheme
                  .labelLarge
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            if (attachments.isNotEmpty) ...[
              ...attachments.map((att) => _AttachmentTile(
                    att: att,
                    playing: _playingId == att.id,
                    onPlay: att.kind == 'voice' ? () => _togglePlay(att) : null,
                    onDelete: () => _delete(att),
                  )),
              const SizedBox(height: 8),
            ],
            if (widget.showActions)
              Row(
                children: [
                  _ActionButton(
                    icon: _recording ? Icons.stop_circle : Icons.mic,
                    label: _recording ? tr('common_stop') : tr('assessments_record'),
                    color: _recording ? Colors.red : AppTheme.primary,
                    onTap: _recording ? _stopRecording : _startRecording,
                  ),
                  const SizedBox(width: 8),
                  _ActionButton(
                    icon: Icons.photo_camera,
                    label: tr('assessments_camera'),
                    color: AppTheme.primary,
                    onTap: () => _pickPhoto(ImageSource.camera),
                  ),
                  const SizedBox(width: 8),
                  _ActionButton(
                    icon: Icons.photo_library,
                    label: tr('assessments_gallery'),
                    color: AppTheme.primary,
                    onTap: () => _pickPhoto(ImageSource.gallery),
                  ),
                ],
              ),
          ],
        );
      },
    );
  }
}

class _AttachmentTile extends StatelessWidget {
  const _AttachmentTile({
    required this.att,
    required this.playing,
    this.onPlay,
    required this.onDelete,
  });

  final LocalAttachment att;
  final bool playing;
  final VoidCallback? onPlay;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final isVoice = att.kind == 'voice';
    final isPhoto = att.kind == 'photo';

    return Card(
      margin: const EdgeInsetsDirectional.only(bottom: 6),
      child: ListTile(
        dense: true,
        leading: isVoice
            ? Icon(playing ? Icons.pause_circle : Icons.play_circle,
                color: AppTheme.primary, size: 32)
            : isPhoto && File(att.localPath).existsSync()
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: Image.file(File(att.localPath), width: 40, height: 40, fit: BoxFit.cover),
                  )
                : Icon(Icons.attachment, color: AppTheme.primary),
        title: Text(
          isVoice ? tr('assessments_voice_note') : tr('assessments_photo'),
          style: Theme.of(context).textTheme.bodySmall,
        ),
        subtitle: att.uploaded
            ? null
            : Text(tr('common_pending_upload'),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted)),
        onTap: onPlay,
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, size: 20),
          color: AppTheme.muted,
          onPressed: onDelete,
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: color.withAlpha(80)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 12, color: color)),
          ],
        ),
      ),
    );
  }
}
