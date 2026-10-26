import 'dart:ui' as ui;

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme.dart';
import '../../data/repositories/assessment_repository.dart';
import '../../data/database/app_database.dart';
import '../../domain/form_definition.dart';
import '../../domain/text_resolver.dart';
import 'attachments_section.dart';

class ItemScreen extends ConsumerStatefulWidget {
  final String assessmentId;
  final String itemKey;

  const ItemScreen({
    super.key,
    required this.assessmentId,
    required this.itemKey,
  });

  @override
  ConsumerState<ItemScreen> createState() => _ItemScreenState();
}

class _ItemScreenState extends ConsumerState<ItemScreen> {
  FormDefinition? _def;
  FormItem? _item;
  FormSection? _section;
  FormGroup? _group;
  List<FormItem> _allItems = [];
  int _currentIndex = 0; // 1-based display index
  List<LocalResponse> _responses = [];
  bool _loading = true;
  bool _showNote = false;
  final _noteCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  String get _lang => Localizations.localeOf(context).languageCode;

  Future<void> _load() async {
    final repo = ref.read(assessmentRepoProvider);
    final fvRow = await repo.getLatestFormVersion();
    if (fvRow == null) return;

    final def = FormDefinition.fromJsonString(fvRow.definitionJson);

    // Collect all items and find current item's section/group/index
    final allItems = def.sections.expand((s) => s.items).toList();
    FormItem? found;
    FormSection? foundSection;
    FormGroup? foundGroup;

    for (final sec in def.sections) {
      for (final it in sec.items) {
        if (it.key == widget.itemKey) {
          found = it;
          foundSection = sec;
          if (it.group != null) {
            foundGroup = sec.groups.where((g) => g.key == it.group).firstOrNull;
          }
          break;
        }
      }
      if (found != null) break;
    }

    final idx = allItems.indexWhere((it) => it.key == widget.itemKey);
    final responses = await repo.getResponses(widget.assessmentId);
    final thisResponse = responses.where((r) => r.itemKey == widget.itemKey).firstOrNull;
    if (thisResponse?.note != null) _noteCtrl.text = thisResponse!.note!;
    final hasNote = thisResponse?.note?.isNotEmpty == true;

    if (mounted) {
      setState(() {
        _def = def;
        _item = found;
        _section = foundSection;
        _group = foundGroup;
        _allItems = allItems;
        _currentIndex = idx + 1; // 1-based
        _responses = responses;
        _loading = false;
        _showNote = hasNote;
      });
    }
  }

  LocalResponse? get _currentResponse =>
      _responses.where((r) => r.itemKey == widget.itemKey).firstOrNull;

  FormScale? get _scale {
    final it = _item;
    if (it == null || _def == null) return null;
    return _def!.scales.where((s) => s.key == it.scale).firstOrNull;
  }

  Future<void> _setScore(double? value, {bool notAssessed = false}) async {
    await ref.read(assessmentRepoProvider).saveResponse(
          assessmentId: widget.assessmentId,
          itemKey: widget.itemKey,
          value: value,
          notAssessed: notAssessed,
          note: _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        );
    final responses = await ref.read(assessmentRepoProvider).getResponses(widget.assessmentId);
    if (mounted) setState(() => _responses = responses);
  }

  Future<void> _saveNote() async {
    final current = _currentResponse;
    await _setScore(current?.value, notAssessed: current?.notAssessed ?? false);
  }

  void _showJumpToSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.3,
        expand: false,
        builder: (_, controller) => _JumpToSheet(
          def: _def!,
          responses: _responses,
          currentKey: widget.itemKey,
          assessmentId: widget.assessmentId,
          scrollController: controller,
          lang: _lang,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final item = _item;
    if (item == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Item not found: ${widget.itemKey}')),
      );
    }

    final scale = _scale;
    final current = _currentResponse;
    final isRtlLang = isRtl(_lang);
    final total = _allItems.length;

    // Build breadcrumb
    final sectionTitle = _section != null ? t(_section!.title, _lang, 'en') : '';
    final groupTitle = _group != null ? t(_group!.title, _lang, 'en') : '';
    final breadcrumb = groupTitle.isNotEmpty
        ? '$sectionTitle · $groupTitle'
        : sectionTitle;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsetsDirectional.only(start: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (breadcrumb.isNotEmpty)
                Text(
                  breadcrumb,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.primary,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.4,
                  ),
                ),
              Text(
                t(item.title, _lang, 'en'),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        actions: [
          if (total > 0)
            Center(
              child: Padding(
                padding: const EdgeInsetsDirectional.only(end: 4),
                child: Text(
                  '$_currentIndex / $total',
                  style: TextStyle(fontSize: 12, color: AppTheme.muted, fontWeight: FontWeight.w500),
                ),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.list_outlined, size: 20),
            tooltip: tr('item_jump_to'),
            onPressed: _def != null ? _showJumpToSheet : null,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: total > 0 ? (_currentIndex - 1) / total : 0,
            backgroundColor: AppTheme.divider,
            color: AppTheme.primary,
            minHeight: 4,
          ),
        ),
      ),
      body: Directionality(
        textDirection: isRtlLang ? ui.TextDirection.rtl : ui.TextDirection.ltr,
        child: SingleChildScrollView(
          padding: const EdgeInsetsDirectional.fromSTEB(16, 14, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Guidance panel — always visible when present
              if (item.guidance != null)
                _GuidancePanel(text: t(item.guidance, _lang, 'en')),

              // Prompt text
              if (item.prompt != null) ...[
                const SizedBox(height: 10),
                Text(
                  t(item.prompt, _lang, 'en'),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
                ),
              ],

              // Scale levels
              if (scale != null) ...[
                const SizedBox(height: 12),
                ...scale.levels.map((level) => _ScaleOption(
                      level: level,
                      lang: _lang,
                      selected: current?.value == level.value.toDouble(),
                      onTap: () => _setScore(level.value.toDouble()),
                    )),
              ],

              const SizedBox(height: 12),
              // Not assessed option
              _NotAssessedToggle(
                checked: current?.notAssessed ?? false,
                onToggle: (v) => _setScore(null, notAssessed: v),
              ),

              const SizedBox(height: 20),
              // Notes / Voice / Photo row
              Row(
                children: [
                  Expanded(
                    child: _ActionButton(
                      emoji: '📝',
                      label: tr('assessments_note'),
                      active: _showNote,
                      onTap: () => setState(() => _showNote = !_showNote),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _ActionButton(
                      emoji: '🎙',
                      label: tr('attachments_voice'),
                      active: false,
                      onTap: () => setState(() => _showNote = false),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _ActionButton(
                      emoji: '📷',
                      label: tr('attachments_photo'),
                      active: false,
                      onTap: () => setState(() => _showNote = false),
                    ),
                  ),
                ],
              ),

              // Note text field (shown when Note button is active)
              if (_showNote) ...[
                const SizedBox(height: 10),
                TextFormField(
                  controller: _noteCtrl,
                  maxLines: 4,
                  textInputAction: TextInputAction.newline,
                  decoration: InputDecoration(
                    hintText: tr('assessments_note_hint'),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    filled: true,
                    fillColor: AppTheme.surface,
                  ),
                  onEditingComplete: _saveNote,
                ),
                const SizedBox(height: 6),
                Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: TextButton(
                    onPressed: _saveNote,
                    child: Text(tr('common_save')),
                  ),
                ),
              ],

              const SizedBox(height: 8),
              // Attachments list (no action buttons — row above handles that)
              AttachmentsSection(
                assessmentId: widget.assessmentId,
                itemKey: widget.itemKey,
                showActions: true,
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _ItemNav(
        assessmentId: widget.assessmentId,
        itemKey: widget.itemKey,
        def: _def!,
        responses: _responses,
      ),
    );
  }
}

// ── Guidance panel ────────────────────────────────────────────────────────────

class _GuidancePanel extends StatelessWidget {
  final String text;
  const _GuidancePanel({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.primary.withAlpha(18),
        border: Border.all(color: AppTheme.primary.withAlpha(60)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsetsDirectional.only(end: 8, top: 1),
            child: Text('📖', style: const TextStyle(fontSize: 14)),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tr('assessments_guidance').toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primary,
                    letterSpacing: 0.6,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  text,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.primary.withAlpha(220),
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Scale option ──────────────────────────────────────────────────────────────

class _ScaleOption extends StatelessWidget {
  final FormLevel level;
  final String lang;
  final bool selected;
  final VoidCallback onTap;

  const _ScaleOption({
    required this.level,
    required this.lang,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final desc = level.description != null ? t(level.description, lang, 'en') : null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: selected ? AppTheme.primary.withAlpha(20) : AppTheme.surface,
            border: Border.all(
              color: selected ? AppTheme.primary : AppTheme.divider,
              width: selected ? 1.5 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsetsDirectional.fromSTEB(12, 12, 14, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: selected ? AppTheme.primary : AppTheme.bg,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '${level.value}',
                  style: TextStyle(
                    color: selected ? Colors.white : AppTheme.text,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t(level.label, lang, 'en'),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                            fontSize: 13,
                          ),
                    ),
                    if (desc != null && desc.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        desc,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.muted,
                              fontSize: 11,
                              height: 1.4,
                            ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Not-assessed toggle ───────────────────────────────────────────────────────

class _NotAssessedToggle extends StatelessWidget {
  final bool checked;
  final ValueChanged<bool> onToggle;

  const _NotAssessedToggle({required this.checked, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onToggle(!checked),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: checked ? AppTheme.logistics.withAlpha(20) : AppTheme.surface,
          border: Border.all(
            color: checked ? AppTheme.logistics : AppTheme.divider,
            width: checked ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(
              checked ? Icons.block : Icons.block_outlined,
              color: checked ? AppTheme.logistics : AppTheme.muted,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                tr('assessments_mark_not_assessed'),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: checked ? AppTheme.logistics : null,
                      fontWeight: checked ? FontWeight.w600 : null,
                    ),
              ),
            ),
            if (checked)
              const Icon(Icons.check_circle, color: AppTheme.logistics, size: 20),
          ],
        ),
      ),
    );
  }
}

// ── Action button (Note / Voice / Photo) ─────────────────────────────────────

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.emoji,
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String emoji;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppTheme.cardRadius - 4),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppTheme.primary.withAlpha(15) : Colors.transparent,
          border: Border.all(
            color: active ? AppTheme.primary : AppTheme.divider,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(AppTheme.cardRadius - 4),
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: active ? AppTheme.primary : AppTheme.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Item navigation bar ───────────────────────────────────────────────────────

class _ItemNav extends StatelessWidget {
  final String assessmentId;
  final String itemKey;
  final FormDefinition def;
  final List<LocalResponse> responses;

  const _ItemNav({
    required this.assessmentId,
    required this.itemKey,
    required this.def,
    required this.responses,
  });

  List<FormItem> get _allItems =>
      def.sections.expand((s) => s.items).toList();

  int get _currentIndex => _allItems.indexWhere((it) => it.key == itemKey);

  @override
  Widget build(BuildContext context) {
    final items = _allItems;
    final idx = _currentIndex;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.divider)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 8),
          child: Row(
            children: [
              if (idx > 0)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.pushReplacement(
                      '/assessments/$assessmentId/items/${items[idx - 1].key}',
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppTheme.divider),
                      foregroundColor: AppTheme.muted,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('← ${tr('common_previous')}', style: const TextStyle(fontSize: 13)),
                  ),
                )
              else
                const Spacer(),
              const SizedBox(width: 10),
              Expanded(
                child: idx < items.length - 1
                    ? FilledButton(
                        onPressed: () => context.pushReplacement(
                          '/assessments/$assessmentId/items/${items[idx + 1].key}',
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text('${tr('common_next')} →', style: const TextStyle(color: Colors.white, fontSize: 13)),
                      )
                    : FilledButton(
                        onPressed: () => context.pushReplacement(
                          '/assessments/$assessmentId/summary',
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text(tr('assessments_summary'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Jump-to bottom sheet ──────────────────────────────────────────────────────

class _JumpToSheet extends StatelessWidget {
  final FormDefinition def;
  final List<LocalResponse> responses;
  final String currentKey;
  final String assessmentId;
  final ScrollController scrollController;
  final String lang;

  const _JumpToSheet({
    required this.def,
    required this.responses,
    required this.currentKey,
    required this.assessmentId,
    required this.scrollController,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    final answeredKeys = {for (final r in responses) r.itemKey};

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(16, 0, 16, 8),
          child: Row(
            children: [
              Text(
                tr('item_jump_to'),
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close, size: 18),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            controller: scrollController,
            itemCount: def.sections.fold<int>(0, (sum, s) => sum + s.items.length + 1),
            itemBuilder: (_, index) {
              int cursor = 0;
              for (final sec in def.sections) {
                if (index == cursor) {
                  return Padding(
                    padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 2),
                    child: Text(
                      t(sec.title, lang, 'en').toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.muted,
                        letterSpacing: 0.7,
                      ),
                    ),
                  );
                }
                cursor++;
                for (final item in sec.items) {
                  if (index == cursor) {
                    final isCurrent = item.key == currentKey;
                    final isAnswered = answeredKeys.contains(item.key);
                    return ListTile(
                      dense: true,
                      selected: isCurrent,
                      selectedTileColor: AppTheme.primary.withAlpha(15),
                      leading: Icon(
                        isAnswered ? Icons.check_circle : Icons.radio_button_unchecked,
                        size: 18,
                        color: isAnswered ? AppTheme.good : AppTheme.divider,
                      ),
                      title: Text(
                        t(item.title, lang, 'en'),
                        style: TextStyle(
                          fontSize: 13,
                          color: isCurrent ? AppTheme.primary : AppTheme.text,
                          fontWeight: isCurrent ? FontWeight.w600 : null,
                        ),
                      ),
                      onTap: () {
                        Navigator.pop(context);
                        context.pushReplacement(
                          '/assessments/$assessmentId/items/${item.key}',
                        );
                      },
                    );
                  }
                  cursor++;
                }
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ],
    );
  }
}
