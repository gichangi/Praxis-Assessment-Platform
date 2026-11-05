import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../app/theme.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../data/database/app_database.dart';
import '../../data/sync/sync_engine.dart';
import '../../domain/text_resolver.dart';

class NewAssessmentScreen extends ConsumerStatefulWidget {
  const NewAssessmentScreen({super.key});

  @override
  ConsumerState<NewAssessmentScreen> createState() => _NewAssessmentScreenState();
}

class _NewAssessmentScreenState extends ConsumerState<NewAssessmentScreen> {
  List<AssignedForm>? _forms; // null while loading
  List<LocalLocation> _locations = [];
  AssignedForm? _form;
  LocalLocation? _location;
  DateTime _assessedOn = DateTime.now();
  bool _creating = false;
  bool _syncing = false;

  String get _lang => Localizations.localeOf(context).languageCode;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final repo = ref.read(assessmentRepoProvider);
    final forms = await repo.getAssignedForms();
    final locations = await repo.getLocations();
    if (!mounted) return;
    setState(() {
      _forms = forms;
      _locations = locations;
      // Keep the choice only while it is still assigned.
      _form = forms.where((f) => f.form.id == _form?.form.id).firstOrNull;
      if (_form == null) _location = null;
      if (_form == null && forms.length == 1) _form = forms.first;
    });
  }

  Future<void> _syncNow() async {
    setState(() => _syncing = true);
    await ref.read(syncEngineProvider).sync();
    await _load();
    if (mounted) setState(() => _syncing = false);
  }

  /// The locations a form is assigned to, plus their ancestors so the tree stays connected.
  List<LocalLocation> _visibleLocations(Set<String> allowed) {
    final byId = {for (final l in _locations) l.id: l};
    final visible = <String>{};
    for (final id in allowed) {
      String? current = id;
      while (current != null && visible.add(current)) {
        current = byId[current]?.parentId;
      }
    }
    return _locations.where((l) => visible.contains(l.id)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final forms = _forms;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('assessments_new')),
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: forms == null
          ? const Center(child: CircularProgressIndicator())
          : forms.isEmpty
              ? _NoFormsAssigned(onSync: _syncNow, busy: _syncing)
              : _buildForm(context, forms),
    );
  }

  Widget _buildForm(BuildContext context, List<AssignedForm> forms) {
    final sorted = [...forms]..sort((a, b) => a.title(_lang).compareTo(b.title(_lang)));
    final form = _form;

    return SingleChildScrollView(
      padding: const EdgeInsetsDirectional.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionLabel(tr('assessments_select_form')),
          for (final f in sorted)
            _FormTile(
              title: f.title(_lang),
              selected: form?.form.id == f.form.id,
              onTap: () => setState(() {
                if (form?.form.id != f.form.id) _location = null;
                _form = f;
              }),
            ),
          const SizedBox(height: 20),
          if (form != null) ...[
            _SectionLabel(tr('location_label')),
            _LocationPicker(
              key: ValueKey(form.form.id),
              locations: _visibleLocations(form.locationIds),
              selectableIds: form.locationIds,
              selected: _location,
              onSelected: (loc) => setState(() => _location = loc),
            ),
            const SizedBox(height: 20),
          ],
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
              padding: const EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.divider),
                borderRadius: BorderRadius.circular(10),
                color: AppTheme.surface,
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 18, color: AppTheme.muted),
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
              onPressed: form == null || _location == null || _creating ? null : _create,
              style: FilledButton.styleFrom(
                backgroundColor: AppTheme.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _creating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(
                      tr('common_next'),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _create() async {
    final form = _form;
    final location = _location;
    if (form == null || location == null) return;

    setState(() => _creating = true);

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      if (mounted) context.go('/login');
      return;
    }

    final assessedOnStr =
        '${_assessedOn.year}-${_assessedOn.month.toString().padLeft(2, '0')}-${_assessedOn.day.toString().padLeft(2, '0')}';

    final id = await ref.read(assessmentRepoProvider).createAssessment(
          organisationId: form.form.organisationId,
          formVersionId: form.version.id,
          locationId: location.id,
          language: _lang,
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

// ── Form choice ─────────────────────────────────────────────────────────────

class _FormTile extends StatelessWidget {
  final String title;
  final bool selected;
  final VoidCallback onTap;
  const _FormTile({required this.title, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(
              color: selected ? AppTheme.primary : AppTheme.divider,
              width: selected ? 1.5 : 1,
            ),
            borderRadius: BorderRadius.circular(10),
            color: AppTheme.surface,
          ),
          child: Row(
            children: [
              Icon(Icons.assignment_outlined,
                  size: 18, color: selected ? AppTheme.primary : AppTheme.muted),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                      ),
                ),
              ),
              if (selected) const Icon(Icons.check_circle, size: 18, color: AppTheme.primary),
            ],
          ),
        ),
      ),
    );
  }
}

class _NoFormsAssigned extends StatelessWidget {
  final VoidCallback onSync;
  final bool busy;
  const _NoFormsAssigned({required this.onSync, required this.busy});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.assignment_late_outlined, size: 56, color: AppTheme.muted.withAlpha(120)),
            const SizedBox(height: 16),
            Text(
              tr('assessments_no_forms_assigned'),
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              tr('assessments_no_forms_assigned_hint'),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: busy ? null : onSync,
              icon: busy
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.sync),
              label: Text(tr('sync_now')),
              style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Location tree picker ────────────────────────────────────────────────────
// Only locations the form is assigned to can be chosen; their ancestors are
// shown (greyed) purely to keep the tree connected.

class _LocationPicker extends StatefulWidget {
  final List<LocalLocation> locations;
  final Set<String> selectableIds;
  final LocalLocation? selected;
  final ValueChanged<LocalLocation> onSelected;

  const _LocationPicker({
    super.key,
    required this.locations,
    required this.selectableIds,
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
              child: Text(tr('location_tree_empty'), style: TextStyle(color: AppTheme.muted)),
            )
          : Column(children: roots.map((r) => _buildNode(r, 0)).toList()),
    );
  }

  Widget _buildNode(LocalLocation loc, int depth) {
    final children = _tree[loc.id] ?? [];
    final hasChildren = children.isNotEmpty;
    final isExpanded = _expanded.contains(loc.id);
    final isSelected = widget.selected?.id == loc.id;
    final selectable = widget.selectableIds.contains(loc.id);
    final name = _resolveName(loc, context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () {
            if (selectable) widget.onSelected(loc);
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
                    child: const Icon(Icons.chevron_right, size: 16, color: AppTheme.muted),
                  )
                else
                  const Icon(Icons.location_on_outlined, size: 16, color: AppTheme.muted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    name,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected
                              ? AppTheme.primary
                              : selectable
                                  ? AppTheme.text
                                  : AppTheme.muted,
                        ),
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle, size: 16, color: AppTheme.primary),
              ],
            ),
          ),
        ),
        if (hasChildren && isExpanded) ...children.map((child) => _buildNode(child, depth + 1)),
      ],
    );
  }

  String _resolveName(LocalLocation loc, BuildContext context) {
    final resolved = tJson(loc.nameJson, Localizations.localeOf(context).languageCode, 'en');
    return resolved.isNotEmpty ? resolved : loc.code;
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
