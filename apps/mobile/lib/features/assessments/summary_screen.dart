import 'dart:convert';
import 'dart:io';
import 'dart:math' show pi;

import 'package:easy_localization/easy_localization.dart';
import 'package:excel/excel.dart' as xl;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';

import '../../app/theme.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../data/database/app_database.dart';
import '../../domain/form_definition.dart';
import '../../domain/scoring.dart';
import '../../domain/text_resolver.dart';

class SummaryScreen extends ConsumerStatefulWidget {
  final String assessmentId;
  const SummaryScreen({super.key, required this.assessmentId});

  @override
  ConsumerState<SummaryScreen> createState() => _SummaryScreenState();
}

class _SummaryScreenState extends ConsumerState<SummaryScreen> {
  FormDefinition? _def;
  LocalAssessment? _assessment;
  Totals? _totals;
  List<LocalMember> _members = [];
  bool _loading = true;
  bool _submitting = false;
  bool _exporting = false;

  String get _lang => Localizations.localeOf(context).languageCode;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final repo = ref.read(assessmentRepoProvider);
    final results = await Future.wait([
      repo.getAssessment(widget.assessmentId),
      repo.getLatestFormVersion(),
      repo.getResponses(widget.assessmentId),
      repo.getMembers(),
    ]);

    final assessment = results[0] as LocalAssessment?;
    final fv = results[1] as LocalFormVersion?;
    final responses = results[2] as List<LocalResponse>;
    final members = results[3] as List<LocalMember>;

    if (fv == null || assessment == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    final def = FormDefinition.fromJsonString(fv.definitionJson);
    final answersMap = {
      for (final r in responses)
        r.itemKey: Answer(value: r.value, notAssessed: r.notAssessed),
    };
    final totals = computeTotals(def, answersMap);

    if (mounted) {
      setState(() {
        _def = def;
        _assessment = assessment;
        _totals = totals;
        _members = members;
        _loading = false;
      });
    }
  }

  Future<void> _editAssessors(List<String> current) async {
    final selected = Set<String>.from(current);
    final confirmed = await showModalBottomSheet<Set<String>>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => _AssessorPickerSheet(
        members: _members,
        selected: selected,
        createdBy: _assessment!.createdBy,
      ),
    );
    if (confirmed == null || !mounted) return;
    await ref.read(assessmentRepoProvider).updateAssessors(
      widget.assessmentId,
      confirmed.toList(),
    );
    await _load();
  }

  Future<void> _submit() async {
    final totals = _totals;
    if (totals == null || totals.missing.isNotEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(tr('assessments_submit')),
        content: Text(tr('assessments_submit_confirm')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(tr('common_cancel'))),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
            child: Text(tr('common_confirm'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _submitting = true);
    // Mark as submitted locally — sync engine pushes to server
    await ref.read(assessmentRepoProvider).updateStatus(widget.assessmentId, 'submitted');

    if (mounted) {
      setState(() => _submitting = false);
      context.go('/assessments');
    }
  }

  Future<void> _showExportSheet() async {
    final def = _def;
    final totals = _totals;
    final assessment = _assessment;
    if (def == null || totals == null || assessment == null) return;

    await showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.table_chart_outlined),
              title: Text(tr('export_xlsx')),
              onTap: () {
                Navigator.pop(ctx);
                _exportXlsx(def, totals, assessment);
              },
            ),
            ListTile(
              leading: const Icon(Icons.picture_as_pdf_outlined),
              title: Text(tr('export_pdf')),
              onTap: () {
                Navigator.pop(ctx);
                _exportPdf(def, totals, assessment);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _exportXlsx(
      FormDefinition def, Totals totals, LocalAssessment assessment) async {
    setState(() => _exporting = true);
    try {
      final workbook = xl.Excel.createExcel();
      final sheet = workbook['Assessment'];

      sheet.appendRow([
        xl.TextCellValue(tr('assessments_score')),
        xl.TextCellValue('${totals.score.toInt()} / ${totals.max.toInt()}'),
        xl.TextCellValue('${totals.pct?.toStringAsFixed(1) ?? '—'}%'),
      ]);
      sheet.appendRow([
        xl.TextCellValue(''),
        xl.TextCellValue(''),
        xl.TextCellValue(''),
      ]);

      for (final sec in def.sections) {
        final st = totals.sections[sec.key];
        if (st == null) continue;
        sheet.appendRow([
          xl.TextCellValue(t(sec.title, _lang, 'en')),
          xl.DoubleCellValue(st.score),
          xl.DoubleCellValue(st.max),
          xl.TextCellValue(
              st.pct != null ? '${st.pct!.toStringAsFixed(1)}%' : '—'),
        ]);
      }

      final bytes = workbook.save()!;
      final dir = await getTemporaryDirectory();
      final file = File(
          '${dir.path}/assessment_${assessment.id.substring(0, 8)}.xlsx');
      await file.writeAsBytes(bytes);
      await SharePlus.instance.share(ShareParams(
        files: [XFile(file.path)],
        subject: tr('assessments_summary'),
      ));
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  Future<void> _exportPdf(
      FormDefinition def, Totals totals, LocalAssessment assessment) async {
    setState(() => _exporting = true);
    try {
      final doc = pw.Document();
      doc.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) => [
            pw.Header(
              level: 0,
              child: pw.Text(
                tr('assessments_summary'),
                style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold),
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Text(
              '${tr('assessments_score')}: '
              '${totals.score.toInt()} / ${totals.max.toInt()}'
              '${totals.pct != null ? '  (${totals.pct!.toStringAsFixed(1)}%)' : ''}',
            ),
            pw.SizedBox(height: 16),
            pw.TableHelper.fromTextArray(
              headers: ['Section', 'Score', 'Max', '%'],
              data: def.sections
                  .map((sec) {
                    final st = totals.sections[sec.key];
                    if (st == null) return null;
                    return [
                      t(sec.title, _lang, 'en'),
                      st.score.toStringAsFixed(0),
                      st.max.toStringAsFixed(0),
                      st.pct != null
                          ? '${st.pct!.toStringAsFixed(1)}%'
                          : '—',
                    ];
                  })
                  .whereType<List<String>>()
                  .toList(),
            ),
          ],
        ),
      );

      final bytes = await doc.save();
      final dir = await getTemporaryDirectory();
      final file = File(
          '${dir.path}/assessment_${assessment.id.substring(0, 8)}.pdf');
      await file.writeAsBytes(bytes);
      await SharePlus.instance.share(ShareParams(
        files: [XFile(file.path)],
        subject: tr('assessments_summary'),
      ));
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final def = _def;
    final totals = _totals;
    final assessment = _assessment;

    if (def == null || totals == null || assessment == null) {
      return Scaffold(
        appBar: AppBar(title: Text(tr('assessments_summary'))),
        body: Center(child: Text(tr('common_error'))),
      );
    }

    final isReturned = assessment.status == 'returned';
    final isDraft = assessment.status == 'draft';
    final canSubmit = (isDraft || isReturned) && totals.missing.isEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('assessments_summary')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          if (_exporting)
            const Padding(
              padding: EdgeInsetsDirectional.only(end: 12),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.share_outlined),
              tooltip: tr('export_share'),
              onPressed: _showExportSheet,
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Returned banner with reviewer note
              if (isReturned) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsetsDirectional.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3CD),
                    border: Border.all(color: const Color(0xFFFFD60A)),
                    borderRadius: BorderRadius.circular(AppTheme.cardRadius),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.reply, color: Color(0xFF7A5800), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tr('assessments_returned'),
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF7A5800),
                              ),
                            ),
                            if (assessment.reviewNote != null &&
                                assessment.reviewNote!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                assessment.reviewNote!,
                                style: const TextStyle(color: Color(0xFF7A5800)),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Overall score card
              _ScoreCard(totals: totals),
              const SizedBox(height: 20),

              // Radar chart (sections)
              if (totals.sections.length >= 3)
                _SectionRadar(def: def, totals: totals, lang: _lang),

              const SizedBox(height: 20),

              // Per-section breakdown (wrapped in a single card)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tr('assessments_section').toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.muted,
                              letterSpacing: 0.7,
                            ),
                      ),
                      const SizedBox(height: 12),
                      ...def.sections.map((sec) {
                        final st = totals.sections[sec.key];
                        if (st == null) return const SizedBox.shrink();
                        return _SectionBar(
                          title: t(sec.title, _lang, 'en'),
                          st: st,
                          onTap: () {
                            final firstItem = sec.items.firstOrNull;
                            if (firstItem != null) {
                              context.push(
                                '/assessments/${widget.assessmentId}/items/${firstItem.key}',
                              );
                            }
                          },
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Co-assessors card
              _AssessorsCard(
                assessment: assessment,
                members: _members,
                canEdit: isDraft || isReturned,
                onEdit: _editAssessors,
              ),

              // Missing items warning
              if (totals.missing.isNotEmpty) ...[
                const SizedBox(height: 16),
                _MissingItemsBanner(
                  missing: totals.missing,
                  def: def,
                  lang: _lang,
                  assessmentId: widget.assessmentId,
                ),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: isDraft
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 8),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: canSubmit && !_submitting ? _submit : null,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            tr('assessments_submit'),
                            style: const TextStyle(
                                color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
              ),
            )
          : null,
    );
  }
}

class _ScoreCard extends StatelessWidget {
  final Totals totals;
  const _ScoreCard({required this.totals});

  @override
  Widget build(BuildContext context) {
    final pctValue = (totals.pct ?? 0) / 100.0;
    final pctLabel = '${totals.pct?.toStringAsFixed(0) ?? '0'}%';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            _ScoreRing(pct: pctValue, label: pctLabel),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${totals.score.toInt()} / ${totals.max.toInt()}',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    tr('assessments_score'),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreRing extends StatelessWidget {
  final double pct;
  final String label;

  const _ScoreRing({required this.pct, required this.label});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 80,
      height: 80,
      child: CustomPaint(
        painter: _DonutPainter(pct: pct.clamp(0.0, 1.0)),
        child: Center(
          child: Text(
            label,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.text,
                  fontSize: 16,
                ),
          ),
        ),
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  final double pct;
  const _DonutPainter({required this.pct});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;
    const strokeWidth = 9.0;

    // Background track
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = AppTheme.divider
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth,
    );

    if (pct > 0) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -pi / 2,
        2 * pi * pct,
        false,
        Paint()
          ..color = AppTheme.primary
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round,
      );
    }
  }

  @override
  bool shouldRepaint(_DonutPainter old) => old.pct != pct;
}

class _SectionBar extends StatelessWidget {
  final String title;
  final SectionTotals st;
  final VoidCallback onTap;

  const _SectionBar({required this.title, required this.st, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final pct = st.max > 0 ? st.score / st.max : 0.0;
    final pctLabel = '${(pct * 100).toStringAsFixed(0)}%';
    final barColor = pct >= 0.7 ? AppTheme.primary : AppTheme.logistics;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w500),
                  ),
                ),
                Text(
                  pctLabel,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.muted,
                        fontFeatures: [const FontFeature.tabularFigures()],
                      ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: pct,
                backgroundColor: AppTheme.divider,
                color: barColor,
                minHeight: 6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionRadar extends StatelessWidget {
  final FormDefinition def;
  final Totals totals;
  final String lang;

  const _SectionRadar({required this.def, required this.totals, required this.lang});

  @override
  Widget build(BuildContext context) {
    final entries = def.sections.map((sec) {
      final st = totals.sections[sec.key];
      final pct = st != null && st.max > 0 ? st.score / st.max : 0.0;
      return (title: t(sec.title, lang, 'en'), pct: pct);
    }).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: SizedBox(
          height: 200,
          child: RadarChart(
            RadarChartData(
              dataSets: [
                RadarDataSet(
                  fillColor: AppTheme.primary.withAlpha(40),
                  borderColor: AppTheme.primary,
                  borderWidth: 2,
                  dataEntries: entries.map((e) => RadarEntry(value: e.pct)).toList(),
                ),
              ],
              radarBackgroundColor: Colors.transparent,
              borderData: FlBorderData(show: false),
              radarBorderData: const BorderSide(color: AppTheme.divider),
              titlePositionPercentageOffset: 0.2,
              getTitle: (index, angle) {
                final entry = entries[index];
                return RadarChartTitle(
                  text: entry.title,
                  angle: 0,
                );
              },
              tickCount: 5,
              tickBorderData: const BorderSide(color: AppTheme.divider, width: 1),
              gridBorderData: const BorderSide(color: AppTheme.divider, width: 1),
              ticksTextStyle: const TextStyle(color: Colors.transparent, fontSize: 0),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Assessors card ────────────────────────────────────────────────────────────

class _AssessorsCard extends StatelessWidget {
  final LocalAssessment assessment;
  final List<LocalMember> members;
  final bool canEdit;
  final void Function(List<String> current) onEdit;

  const _AssessorsCard({
    required this.assessment,
    required this.members,
    required this.canEdit,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final assessorIds = assessment.assessorsJson != null
        ? (jsonDecode(assessment.assessorsJson!) as List).cast<String>()
        : <String>[];
    final nameById = {for (final m in members) m.id: m.fullName};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    tr('assessment_assessors').toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.muted,
                          letterSpacing: 0.7,
                        ),
                  ),
                ),
                if (canEdit)
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    tooltip: tr('assessment_add_assessor'),
                    onPressed: () => onEdit(assessorIds),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            if (assessorIds.isEmpty)
              Text(
                tr('assessment_no_assessors'),
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppTheme.muted),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: assessorIds.map((id) {
                  final name = nameById[id] ?? id.substring(0, 8);
                  final initials = name
                      .split(' ')
                      .take(2)
                      .map((p) => p.isEmpty ? '' : p[0].toUpperCase())
                      .join();
                  return Chip(
                    avatar: CircleAvatar(
                      backgroundColor: AppTheme.primary.withAlpha(30),
                      child: Text(
                        initials,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    label: Text(name, style: const TextStyle(fontSize: 13)),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: EdgeInsets.zero,
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Assessor picker bottom sheet ──────────────────────────────────────────────

class _AssessorPickerSheet extends StatefulWidget {
  final List<LocalMember> members;
  final Set<String> selected;
  final String createdBy;

  const _AssessorPickerSheet({
    required this.members,
    required this.selected,
    required this.createdBy,
  });

  @override
  State<_AssessorPickerSheet> createState() => _AssessorPickerSheetState();
}

class _AssessorPickerSheetState extends State<_AssessorPickerSheet> {
  late final Set<String> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set.from(widget.selected);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (_, controller) => Column(
        children: [
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(16, 16, 8, 0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    tr('assessment_add_assessor'),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, _selected),
                  child: Text(tr('common_confirm')),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: ListView.builder(
              controller: controller,
              itemCount: widget.members.length,
              itemBuilder: (_, i) {
                final m = widget.members[i];
                final isOwner = m.id == widget.createdBy;
                return CheckboxListTile(
                  value: _selected.contains(m.id),
                  onChanged: isOwner
                      ? null
                      : (v) => setState(() {
                            if (v == true) {
                              _selected.add(m.id);
                            } else {
                              _selected.remove(m.id);
                            }
                          }),
                  title: Text(m.fullName),
                  subtitle: isOwner
                      ? Text(
                          'Primary assessor',
                          style: TextStyle(
                              fontSize: 11, color: AppTheme.muted),
                        )
                      : null,
                  secondary: CircleAvatar(
                    backgroundColor: AppTheme.primary.withAlpha(30),
                    radius: 18,
                    child: Text(
                      m.fullName.isNotEmpty ? m.fullName[0].toUpperCase() : '?',
                      style: const TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ── Missing items banner ──────────────────────────────────────────────────────

class _MissingItemsBanner extends StatelessWidget {
  final List<String> missing;
  final FormDefinition def;
  final String lang;
  final String assessmentId;

  const _MissingItemsBanner({
    required this.missing,
    required this.def,
    required this.lang,
    required this.assessmentId,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.warningTint,
        border: Border.all(color: const Color(0xFFE8B96A)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_outlined, color: AppTheme.warning, size: 18),
              const SizedBox(width: 8),
              Text(
                tr('assessments_missing_items'),
                style: const TextStyle(color: AppTheme.warning, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            tr('assessments_missing_items_desc'),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.warning),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: missing.take(8).map((key) {
              final item = def.sections
                  .expand((s) => s.items)
                  .where((it) => it.key == key)
                  .firstOrNull;
              final label = item != null ? t(item.title, lang, 'en') : key;
              return ActionChip(
                label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
                onPressed: () =>
                    context.push('/assessments/$assessmentId/items/$key'),
              );
            }).toList(),
          ),
          if (missing.length > 8)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                '+${missing.length - 8} more',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppTheme.warning),
              ),
            ),
        ],
      ),
    );
  }
}
