import 'dart:convert';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../app/theme.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../data/database/app_database.dart';
import '../../domain/text_resolver.dart';

class NewAssessmentScreen extends ConsumerStatefulWidget {
  const NewAssessmentScreen({super.key});

  @override
  ConsumerState<NewAssessmentScreen> createState() => _NewAssessmentScreenState();
}

class _NewAssessmentScreenState extends ConsumerState<NewAssessmentScreen> {
  LocalLocation? _selectedLocation;
  DateTime _assessedOn = DateTime.now();
  bool _creating = false;

  @override
  Widget build(BuildContext context) {
    final repo = ref.watch(assessmentRepoProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('assessments_new')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: FutureBuilder<List<LocalLocation>>(
        future: repo.getLocations(),
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final locations = snap.data ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsetsDirectional.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SectionLabel(tr('location_label')),
                if (locations.isEmpty)
                  _InfoCard(tr('location_tree_empty'))
                else
                  _LocationPicker(
                    locations: locations,
                    selected: _selectedLocation,
                    onSelected: (loc) => setState(() => _selectedLocation = loc),
                  ),
                const SizedBox(height: 20),
                _SectionLabel(tr('assessments_date')),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _assessedOn,
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) setState(() => _assessedOn = picked);
                  },
                  child: Container(
                    padding: const EdgeInsetsDirectional.symmetric(
                        horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.divider),
                      borderRadius: BorderRadius.circular(10),
                      color: AppTheme.surface,
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined,
                            size: 18, color: AppTheme.muted),
                        const SizedBox(width: 10),
                        Text(
                          '${_assessedOn.year}-'
                          '${_assessedOn.month.toString().padLeft(2, '0')}-'
                          '${_assessedOn.day.toString().padLeft(2, '0')}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 36),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed:
                        _selectedLocation == null || _creating ? null : _create,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _creating
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            tr('common_next'),
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _create() async {
    final location = _selectedLocation;
    if (location == null) return;

    setState(() => _creating = true);

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      if (mounted) context.go('/login');
      return;
    }

    final repo = ref.read(assessmentRepoProvider);
    final fv = await repo.getLatestFormVersion();
    if (fv == null) {
      if (mounted) {
        setState(() => _creating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(tr('sync_error') + ': no form version cached')),
        );
      }
      return;
    }

    final assessedOnStr =
        '${_assessedOn.year}-${_assessedOn.month.toString().padLeft(2, '0')}-${_assessedOn.day.toString().padLeft(2, '0')}';

    final language =
        mounted ? Localizations.localeOf(context).languageCode : 'en';

    const orgId = '00000000-0000-0000-0000-000000000002';

    final id = await repo.createAssessment(
      organisationId: orgId,
      formVersionId: fv.id,
      locationId: location.id,
      language: language,
      createdBy: user.id,
      assessedOn: assessedOnStr,
    );

    if (mounted) {
      setState(() => _creating = false);
      context.pop();
      context.push('/assessments/$id/summary');
    }
  }
}

// ── Location tree picker ────────────────────────────────────────────────────

class _LocationPicker extends StatefulWidget {
  final List<LocalLocation> locations;
  final LocalLocation? selected;
  final ValueChanged<LocalLocation> onSelected;

  const _LocationPicker({
    required this.locations,
    required this.selected,
    required this.onSelected,
  });

  @override
  State<_LocationPicker> createState() => _LocationPickerState();
}

class _LocationPickerState extends State<_LocationPicker> {
  late final Map<String?, List<LocalLocation>> _tree;
  final Set<String> _expanded = {};

  @override
  void initState() {
    super.initState();
    _tree = {};
    for (final loc in widget.locations) {
      (_tree[loc.parentId] ??= []).add(loc);
    }
    // Auto-expand top-level nodes
    for (final root in _tree[null] ?? []) {
      _expanded.add(root.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final roots = _tree[null] ?? [];
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.divider),
        borderRadius: BorderRadius.circular(10),
        color: AppTheme.surface,
      ),
      child: roots.isEmpty
          ? Padding(
              padding: const EdgeInsets.all(16),
              child: Text(tr('location_tree_empty'),
                  style: TextStyle(color: AppTheme.muted)),
            )
          : Column(
              children: roots
                  .map((r) => _buildNode(r, 0))
                  .toList(),
            ),
    );
  }

  Widget _buildNode(LocalLocation loc, int depth) {
    final children = _tree[loc.id] ?? [];
    final hasChildren = children.isNotEmpty;
    final isExpanded = _expanded.contains(loc.id);
    final isSelected = widget.selected?.id == loc.id;
    final name = _resolveName(loc, context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () {
            widget.onSelected(loc);
            if (hasChildren) {
              setState(() {
                if (isExpanded) {
                  _expanded.remove(loc.id);
                } else {
                  _expanded.add(loc.id);
                }
              });
            }
          },
          child: Padding(
            padding: EdgeInsetsDirectional.only(
              start: (depth * 20 + 12).toDouble(),
              end: 12,
              top: 12,
              bottom: 12,
            ),
            child: Row(
              children: [
                if (hasChildren)
                  AnimatedRotation(
                    turns: isExpanded ? 0.25 : 0,
                    duration: const Duration(milliseconds: 150),
                    child: const Icon(Icons.chevron_right,
                        size: 16, color: AppTheme.muted),
                  )
                else
                  const Icon(Icons.location_on_outlined,
                      size: 16, color: AppTheme.muted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    name,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: isSelected ? AppTheme.primary : AppTheme.text,
                        ),
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle,
                      size: 16, color: AppTheme.primary),
              ],
            ),
          ),
        ),
        if (hasChildren && isExpanded)
          ...children.map((child) => _buildNode(child, depth + 1)),
      ],
    );
  }

  String _resolveName(LocalLocation loc, BuildContext context) {
    try {
      final locale = Localizations.localeOf(context).languageCode;
      final decoded = jsonDecode(loc.nameJson);
      if (decoded is Map<String, dynamic>) {
        final map = decoded.map((k, v) => MapEntry(k, v.toString()));
        final resolved = t(map, locale, 'en');
        if (resolved.isNotEmpty) return resolved;
      }
    } catch (_) {}
    return loc.code;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: Theme.of(context)
            .textTheme
            .labelLarge
            ?.copyWith(fontWeight: FontWeight.w600, color: AppTheme.text),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String text;
  const _InfoCard(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.divider),
        borderRadius: BorderRadius.circular(10),
        color: AppTheme.surface,
      ),
      child: Text(text, style: TextStyle(color: AppTheme.muted)),
    );
  }
}
