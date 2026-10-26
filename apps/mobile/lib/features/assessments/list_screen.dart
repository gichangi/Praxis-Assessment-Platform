import 'dart:convert';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/router.dart';
import '../../app/theme.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../data/database/app_database.dart';
import '../../data/sync/sync_engine.dart';

enum _StatusFilter { all, draft, submitted, returned }

class AssessmentsListScreen extends ConsumerStatefulWidget {
  const AssessmentsListScreen({super.key});

  @override
  ConsumerState<AssessmentsListScreen> createState() => _AssessmentsListScreenState();
}

class _AssessmentsListScreenState extends ConsumerState<AssessmentsListScreen> {
  _StatusFilter _filter = _StatusFilter.all;

  List<LocalAssessment> _applyFilter(List<LocalAssessment> all) {
    return switch (_filter) {
      _StatusFilter.all => all,
      _StatusFilter.draft => all.where((a) => a.status == 'draft').toList(),
      _StatusFilter.submitted => all.where((a) => a.status == 'submitted').toList(),
      _StatusFilter.returned => all.where((a) => a.status == 'returned').toList(),
    };
  }

  int _countByStatus(List<LocalAssessment> all, String status) =>
      all.where((a) => a.status == status).length;

  @override
  Widget build(BuildContext context) {
    final stream = ref.watch(assessmentRepoProvider).watchAssessments();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(tr('assessments_title')),
            _SyncSubtitle(),
          ],
        ),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 16,
        actions: [
          _PendingChip(),
          Padding(
            padding: const EdgeInsetsDirectional.only(end: 10),
            child: InkWell(
              onTap: () => context.push(Routes.newAssessment),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: AppTheme.primary,
        unselectedItemColor: AppTheme.muted,
        backgroundColor: AppTheme.surface,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 10,
        unselectedFontSize: 10,
        onTap: (i) {
          if (i == 1) context.push(Routes.compare);
          if (i == 2) context.push(Routes.settings);
        },
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.assignment_outlined),
            activeIcon: const Icon(Icons.assignment),
            label: tr('tab_assessments'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.bar_chart_outlined),
            activeIcon: const Icon(Icons.bar_chart),
            label: tr('tab_compare'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.settings_outlined),
            activeIcon: const Icon(Icons.settings),
            label: tr('tab_settings'),
          ),
        ],
      ),
      body: StreamBuilder<List<LocalAssessment>>(
        stream: stream,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final all = snap.data ?? [];
          final filtered = _applyFilter(all);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Filter chip bar
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 0),
                  children: [
                    _FilterChip(
                      label: '${tr('assessments_filter_all')} (${all.length})',
                      active: _filter == _StatusFilter.all,
                      onTap: () => setState(() => _filter = _StatusFilter.all),
                    ),
                    const SizedBox(width: 6),
                    _FilterChip(
                      label: '${tr('assessments_filter_drafts')} (${_countByStatus(all, 'draft')})',
                      active: _filter == _StatusFilter.draft,
                      onTap: () => setState(() => _filter = _StatusFilter.draft),
                    ),
                    const SizedBox(width: 6),
                    _FilterChip(
                      label: '${tr('assessments_filter_submitted')} (${_countByStatus(all, 'submitted')})',
                      active: _filter == _StatusFilter.submitted,
                      onTap: () => setState(() => _filter = _StatusFilter.submitted),
                    ),
                    const SizedBox(width: 6),
                    _FilterChip(
                      label: '${tr('assessments_filter_returned')} (${_countByStatus(all, 'returned')})',
                      active: _filter == _StatusFilter.returned,
                      onTap: () => setState(() => _filter = _StatusFilter.returned),
                    ),
                  ],
                ),
              ),

              // List
              Expanded(
                child: filtered.isEmpty
                    ? _EmptyState(onNew: () => context.push(Routes.newAssessment))
                    : ListView.builder(
                        padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 16),
                        itemCount: filtered.length + 1,
                        itemBuilder: (ctx, i) {
                          if (i == filtered.length) {
                            return _NewAssessmentCard(
                              onTap: () => context.push(Routes.newAssessment),
                            );
                          }
                          return _AssessmentCard(assessment: filtered[i]);
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ── Filter chip ───────────────────────────────────────────────────────────────

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.active, required this.onTap});

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppTheme.primary.withAlpha(20) : AppTheme.surface,
          border: Border.all(
            color: active ? AppTheme.primary : AppTheme.divider,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: active ? AppTheme.primary : AppTheme.muted,
          ),
        ),
      ),
    );
  }
}

// ── Sync subtitle ─────────────────────────────────────────────────────────────

class _SyncSubtitle extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return StreamBuilder<SyncStatus>(
      stream: ref.watch(syncEngineProvider).statusStream,
      initialData: const SyncIdle(),
      builder: (context, snap) {
        final status = snap.data ?? const SyncIdle();
        final label = switch (status) {
          SyncProgress() => tr('sync_syncing'),
          SyncError() => tr('sync_error'),
          SyncConflict() => tr('sync_conflict'),
          SyncIdle() => tr('sync_now'),
        };
        return Text(
          label,
          style: TextStyle(fontSize: 11, color: AppTheme.muted),
        );
      },
    );
  }
}

// ── Pending upload chip ───────────────────────────────────────────────────────

class _PendingChip extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return StreamBuilder<SyncStatus>(
      stream: ref.watch(syncEngineProvider).statusStream,
      initialData: const SyncIdle(),
      builder: (context, snap) {
        final status = snap.data ?? const SyncIdle();
        if (status is! SyncProgress) return const SizedBox.shrink();
        return Container(
          margin: const EdgeInsetsDirectional.only(end: 8),
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.logistics.withAlpha(25),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(
                width: 10,
                height: 10,
                child: CircularProgressIndicator(strokeWidth: 1.5),
              ),
              const SizedBox(width: 5),
              Text(
                tr('sync_syncing'),
                style: TextStyle(fontSize: 11, color: AppTheme.logistics, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Assessment card ───────────────────────────────────────────────────────────

class _AssessmentCard extends StatelessWidget {
  final LocalAssessment assessment;
  const _AssessmentCard({required this.assessment});

  @override
  Widget build(BuildContext context) {
    final statusInfo = _statusInfo(assessment.status);
    final totals = _parseTotals(assessment.totalsJson);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        onTap: () => context.push('/assessments/${assessment.id}/summary'),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title row
              Row(
                children: [
                  Expanded(
                    child: Text(
                      assessment.locationId,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                  ),
                  _StatusPill(label: statusInfo.$1, color: statusInfo.$2, tint: statusInfo.$3),
                ],
              ),

              const SizedBox(height: 4),
              Text(
                '${assessment.assessedOn} · ${assessment.createdBy}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
              ),

              // Returned note
              if (assessment.status == 'returned' &&
                  assessment.reviewNote != null &&
                  assessment.reviewNote!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsetsDirectional.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.logistics.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '✎ ${tr('assessments_returned')}: ${assessment.reviewNote}',
                    style: TextStyle(fontSize: 12, color: AppTheme.logistics),
                  ),
                ),
              ],

              // Progress bar
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(2),
                child: LinearProgressIndicator(
                  value: totals != null && totals.$2 > 0 ? totals.$1 / totals.$2 : 0,
                  backgroundColor: AppTheme.divider,
                  color: assessment.status == 'approved' ? AppTheme.good : AppTheme.primary,
                  minHeight: 4,
                ),
              ),

              const SizedBox(height: 4),
              Row(
                children: [
                  if (assessment.dirty)
                    Padding(
                      padding: const EdgeInsetsDirectional.only(end: 8),
                      child: Icon(Icons.cloud_upload_outlined, size: 14, color: AppTheme.muted),
                    ),
                  Text(
                    totals != null
                        ? '${totals.$1.toInt()} / ${totals.$2.toInt()} pts'
                        : tr('assessments_status_draft'),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  (String, Color, Color) _statusInfo(String status) => switch (status) {
        'submitted' => (
            tr('assessments_status_submitted'),
            const Color(0xFF1D5C63),
            const Color(0xFFE3EEEE),
          ),
        'returned' => (
            tr('assessments_status_returned'),
            AppTheme.logistics,
            const Color(0xFFF6E6D6),
          ),
        'approved' => (
            tr('assessments_status_approved'),
            AppTheme.good,
            AppTheme.goodTint,
          ),
        _ => (
            tr('assessments_status_draft'),
            AppTheme.muted,
            const Color(0xFFEDE8DD),
          ),
      };

  (double, double, int)? _parseTotals(String? json) {
    if (json == null) return null;
    try {
      final m = jsonDecode(json) as Map<String, dynamic>;
      final score = (m['score'] as num?)?.toDouble() ?? 0;
      final max = (m['max'] as num?)?.toDouble() ?? 0;
      final missing = (m['missing'] as List?)?.length ?? 0;
      return (score, max, missing);
    } catch (_) {
      return null;
    }
  }
}

// ── Status pill ───────────────────────────────────────────────────────────────

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color, required this.tint});

  final String label;
  final Color color;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: tint,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}

// ── New assessment card ───────────────────────────────────────────────────────

class _NewAssessmentCard extends StatelessWidget {
  const _NewAssessmentCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.divider, style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(Icons.add, color: AppTheme.primary, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tr('assessments_new'),
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.primary),
                ),
                Text(
                  tr('auth_app_tagline'),
                  style: TextStyle(fontSize: 12, color: AppTheme.muted),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final VoidCallback onNew;
  const _EmptyState({required this.onNew});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.assignment_outlined, size: 56, color: AppTheme.muted.withAlpha(120)),
            const SizedBox(height: 16),
            Text(
              tr('assessments_title'),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.muted),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onNew,
              icon: const Icon(Icons.add),
              label: Text(tr('assessments_new')),
              style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
            ),
          ],
        ),
      ),
    );
  }
}
