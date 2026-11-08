import 'dart:ui' as ui;

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme.dart';
import '../../data/database/app_database.dart';
import '../../data/sync/sync_engine.dart';
import '../../domain/sync_log.dart';
import 'sync_format.dart';
import 'sync_providers.dart';

/// When the phone last synced, whether the last try failed and why, and the recent history.
class SyncScreen extends ConsumerWidget {
  const SyncScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final log = ref.watch(syncLogProvider).valueOrNull ?? const <LocalSyncLog>[];

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('sync_title')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 40),
        children: [
          const _StatusCard(),
          const SizedBox(height: 20),
          Text(
            tr('sync_recent'),
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          if (log.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(tr('sync_log_empty'), style: TextStyle(color: AppTheme.muted)),
              ),
            )
          else
            Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  for (var i = 0; i < log.length; i++) ...[
                    if (i > 0) const Divider(height: 1),
                    _LogRow(entry: log[i]),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _StatusCard extends ConsumerWidget {
  const _StatusCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final engine = ref.watch(syncEngineProvider);
    final attempt = ref.watch(lastSyncAttemptProvider).valueOrNull;
    final success = ref.watch(lastSuccessfulSyncProvider).valueOrNull;
    final pending = ref.watch(pendingUploadCountProvider).valueOrNull ?? 0;

    return StreamBuilder<SyncStatus>(
      stream: engine.statusStream,
      initialData: engine.isSyncing ? const SyncProgress() : const SyncIdle(),
      builder: (context, snap) {
        final syncing = snap.data is SyncProgress;
        final outcome = attempt == null ? null : SyncOutcome.fromCode(attempt.outcome);
        // A failed latest try is worth showing even though an older sync succeeded.
        final failed = attempt != null && (outcome == SyncOutcome.error || outcome == SyncOutcome.offline);
        final headlineOutcome = success == null ? outcome : SyncOutcome.ok;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      headlineOutcome == null ? Icons.cloud_queue : syncOutcomeIcon(headlineOutcome),
                      color: headlineOutcome == null ? AppTheme.muted : syncOutcomeColor(headlineOutcome),
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            success == null
                                ? tr('sync_never')
                                : tr('sync_last_sync', namedArgs: {'time': syncAgeText(context, success.at)}),
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          if (success != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              syncStamp(context, success.at),
                              style: TextStyle(fontSize: 13, color: AppTheme.muted),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                if (failed && !syncing) ...[
                  const SizedBox(height: 14),
                  _Problem(entry: attempt),
                ],
                const SizedBox(height: 14),
                Text(
                  pending > 0
                      ? tr('sync_pending', namedArgs: {'n': '$pending'})
                      : tr('sync_all_uploaded'),
                  style: TextStyle(
                    fontSize: 13,
                    color: pending > 0 ? AppTheme.warning : AppTheme.muted,
                    fontWeight: pending > 0 ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: syncing ? null : engine.sync,
                    icon: syncing
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.sync),
                    label: Text(syncing ? tr('sync_syncing') : tr('sync_now')),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// The latest attempt failed: when, why, and that it will try again.
class _Problem extends StatelessWidget {
  const _Problem({required this.entry});

  final LocalSyncLog entry;

  @override
  Widget build(BuildContext context) {
    final outcome = SyncOutcome.fromCode(entry.outcome);
    final ink = syncOutcomeColor(outcome);
    final detail = syncDetailText(entry);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ink.withAlpha(20),
        border: Border.all(color: ink.withAlpha(90)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${tr('sync_last_failed')} · ${syncStamp(context, entry.at)}',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: ink),
          ),
          if (detail != null) ...[
            const SizedBox(height: 4),
            SelectableText(detail, style: TextStyle(fontSize: 13, color: ink)),
          ],
          if (entry.endpoint != null) _Endpoint(endpoint: entry.endpoint!, ink: ink),
          const SizedBox(height: 4),
          Text(tr('sync_retry_note'), style: TextStyle(fontSize: 12, color: ink.withAlpha(200))),
        ],
      ),
    );
  }
}

class _LogRow extends StatelessWidget {
  const _LogRow({required this.entry});

  final LocalSyncLog entry;

  @override
  Widget build(BuildContext context) {
    final outcome = SyncOutcome.fromCode(entry.outcome);
    final ink = syncOutcomeColor(outcome);
    final detail = syncDetailText(entry);
    return Padding(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(syncOutcomeIcon(outcome), color: ink, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  syncOutcomeLabel(outcome),
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: ink),
                ),
                const SizedBox(height: 2),
                Text(
                  syncStamp(context, entry.at),
                  style: TextStyle(fontSize: 12, color: AppTheme.muted),
                ),
                if (outcome.reachedServer && (entry.pushed > 0 || entry.pulled > 0)) ...[
                  const SizedBox(height: 2),
                  Text(
                    tr('sync_counts', namedArgs: {'up': '${entry.pushed}', 'down': '${entry.pulled}'}),
                    style: TextStyle(fontSize: 12, color: AppTheme.muted),
                  ),
                ],
                if (detail != null) ...[
                  const SizedBox(height: 4),
                  SelectableText(detail, style: TextStyle(fontSize: 12, color: ink)),
                ],
                if (!outcome.reachedServer && entry.endpoint != null) _Endpoint(endpoint: entry.endpoint!, ink: ink),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The address the failed call was sent to, selectable so it can be copied.
class _Endpoint extends StatelessWidget {
  const _Endpoint({required this.endpoint, required this.ink});

  final String endpoint;
  final Color ink;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(top: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            tr('sync_endpoint'),
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: ink.withAlpha(180)),
          ),
          SelectableText(
            endpoint,
            textDirection: ui.TextDirection.ltr,
            style: TextStyle(fontSize: 12, fontFamily: 'monospace', color: ink),
          ),
        ],
      ),
    );
  }
}
