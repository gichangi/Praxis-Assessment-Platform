import 'dart:convert';

import 'package:easy_localization/easy_localization.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme.dart';
import '../../data/database/app_database.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../domain/form_definition.dart';
import '../../domain/scoring.dart';
import '../../domain/text_resolver.dart';

// Up to 4 assessments can be compared simultaneously.
const _maxCompare = 4;
const _compareColors = [
  Color(0xFF1D5C63),
  Color(0xFF9C5416),
  Color(0xFF0D6EFD),
  Color(0xFF6F42C1),
];

class CompareScreen extends ConsumerStatefulWidget {
  const CompareScreen({super.key});

  @override
  ConsumerState<CompareScreen> createState() => _CompareScreenState();
}

class _CompareScreenState extends ConsumerState<CompareScreen> {
  final Set<String> _selected = {};
  FormDefinition? _def;

  String get _lang => Localizations.localeOf(context).languageCode;

  @override
  void initState() {
    super.initState();
    _loadDef();
  }

  Future<void> _loadDef() async {
    final fv = await ref.read(assessmentRepoProvider).getLatestFormVersion();
    if (fv != null && mounted) {
      setState(() => _def = FormDefinition.fromJsonString(fv.definitionJson));
    }
  }

  void _toggle(String id) {
    setState(() {
      if (_selected.contains(id)) {
        _selected.remove(id);
      } else if (_selected.length < _maxCompare) {
        _selected.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final stream = ref.watch(assessmentRepoProvider)
        .watchAssessments()
        .map((list) => list.where((a) => a.status == 'approved').toList());

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('compare_title')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: StreamBuilder<List<LocalAssessment>>(
        stream: stream,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final approved = snap.data ?? [];

          if (approved.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  tr('compare_no_approved'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: AppTheme.muted),
                ),
              ),
            );
          }

          final selectedList = approved
              .where((a) => _selected.contains(a.id))
              .toList();

          return SingleChildScrollView(
            padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Selection list
                Text(
                  tr('compare_select_hint'),
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: AppTheme.muted),
                ),
                const SizedBox(height: 10),
                ...approved.map((a) {
                  final idx = selectedList.indexWhere((s) => s.id == a.id);
                  final active = idx >= 0;
                  final color = active ? _compareColors[idx % _compareColors.length] : null;
                  final totals = _totalsFrom(a);

                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.cardRadius),
                      side: active
                          ? BorderSide(color: color!, width: 2)
                          : BorderSide.none,
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppTheme.cardRadius),
                      onTap: () => _toggle(a.id),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        child: Row(
                          children: [
                            if (active)
                              Container(
                                width: 10,
                                height: 10,
                                margin: const EdgeInsetsDirectional.only(end: 10),
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                ),
                              )
                            else
                              const SizedBox(width: 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    a.assessedOn,
                                    style: Theme.of(context).textTheme.titleSmall,
                                  ),
                                  Text(
                                    a.locationId,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(color: AppTheme.muted),
                                  ),
                                ],
                              ),
                            ),
                            if (totals != null && totals.pct != null)
                              Text(
                                '${totals.pct?.toStringAsFixed(0)}%',
                                style: TextStyle(
                                  color: active ? color : AppTheme.muted,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),

                // Charts
                if (selectedList.length >= 2 && _def != null) ...[
                  const SizedBox(height: 24),
                  _CompareRadar(
                    assessments: selectedList,
                    def: _def!,
                    lang: _lang,
                  ),
                  const SizedBox(height: 20),
                  _CompareBar(
                    assessments: selectedList,
                    lang: _lang,
                  ),
                ] else if (selectedList.length == 1) ...[
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      tr('compare_select_one_more'),
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: AppTheme.muted),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Totals? _totalsFrom(LocalAssessment a) {
    if (_def == null) return null;
    // Assessments on this screen are approved — their responses may not be local.
    // We show pct from the server-synced totals if available via a JSON field.
    // For now, return null; the percentage badge is shown when totals sync down.
    return null;
  }
}

class _CompareRadar extends StatelessWidget {
  final List<LocalAssessment> assessments;
  final FormDefinition def;
  final String lang;

  const _CompareRadar({
    required this.assessments,
    required this.def,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    // Build radar datasets — one per assessment
    final datasets = assessments.asMap().entries.map((entry) {
      final i = entry.key;
      final a = entry.value;
      final color = _compareColors[i % _compareColors.length];

      // Parse section pcts from totals JSON stored on the assessment row
      final totalsMap = a.totalsJson != null
          ? jsonDecode(a.totalsJson!) as Map<String, dynamic>
          : <String, dynamic>{};
      final sectionPcts = def.sections.map((sec) {
        final sectionData =
            (totalsMap['sections'] as Map<String, dynamic>?)?[sec.key];
        final pct = (sectionData?['pct'] as num?)?.toDouble() ?? 0.0;
        return RadarEntry(value: pct);
      }).toList();

      return RadarDataSet(
        fillColor: color.withAlpha(35),
        borderColor: color,
        borderWidth: 2,
        dataEntries: sectionPcts,
      );
    }).toList();

    final sectionTitles = def.sections
        .map((sec) => t(sec.title, lang, 'en'))
        .toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('compare_radar_title'),
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 220,
              child: RadarChart(
                RadarChartData(
                  dataSets: datasets,
                  radarBackgroundColor: Colors.transparent,
                  borderData: FlBorderData(show: false),
                  radarBorderData:
                      const BorderSide(color: AppTheme.divider),
                  titlePositionPercentageOffset: 0.2,
                  getTitle: (index, angle) {
                    return RadarChartTitle(
                      text: index < sectionTitles.length
                          ? sectionTitles[index]
                          : '',
                      angle: 0,
                    );
                  },
                  tickCount: 5,
                  tickBorderData:
                      const BorderSide(color: AppTheme.divider, width: 1),
                  gridBorderData:
                      const BorderSide(color: AppTheme.divider, width: 1),
                  ticksTextStyle:
                      const TextStyle(color: Colors.transparent, fontSize: 0),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // Legend
            Wrap(
              spacing: 16,
              runSpacing: 4,
              children: assessments.asMap().entries.map((entry) {
                final color = _compareColors[entry.key % _compareColors.length];
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      entry.value.assessedOn,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: AppTheme.muted),
                    ),
                  ],
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _CompareBar extends StatelessWidget {
  final List<LocalAssessment> assessments;
  final String lang;

  const _CompareBar({required this.assessments, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('compare_bar_title'),
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 14),
            ...assessments.asMap().entries.map((entry) {
              final i = entry.key;
              final a = entry.value;
              final color = _compareColors[i % _compareColors.length];
              final totalsMap = a.totalsJson != null
                  ? jsonDecode(a.totalsJson!) as Map<String, dynamic>
                  : <String, dynamic>{};
              final pctRaw = totalsMap['pct'] as num?;
              final pct = pctRaw?.toDouble() ?? 0.0;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            a.assessedOn,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                        Text(
                          '${pct.toStringAsFixed(0)}%',
                          style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: pct / 100,
                        color: color,
                        backgroundColor: AppTheme.bg,
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
