import 'dart:convert';

/// Dart model for the FormDefinition JSON stored in form_versions.definition.
/// Parsed at runtime — no question text lives in Dart code.

class FormLevel {
  final int value;
  final Map<String, String> label;
  final Map<String, String>? description;

  const FormLevel({required this.value, required this.label, this.description});

  factory FormLevel.fromJson(Map<String, dynamic> j) => FormLevel(
        value: j['value'] as int,
        label: Map<String, String>.from(j['label'] as Map),
        description: j['description'] == null
            ? null
            : Map<String, String>.from(j['description'] as Map),
      );
}

class FormScale {
  final String key;
  final Map<String, String>? title;
  final List<FormLevel> levels;

  const FormScale({required this.key, this.title, required this.levels});

  factory FormScale.fromJson(Map<String, dynamic> j) => FormScale(
        key: j['key'] as String,
        title: j['title'] == null ? null : Map<String, String>.from(j['title'] as Map),
        levels: (j['levels'] as List).map((e) => FormLevel.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class VisibleIfCondition {
  final String item;
  final String op;
  final dynamic value;

  const VisibleIfCondition({required this.item, required this.op, required this.value});

  factory VisibleIfCondition.fromJson(Map<String, dynamic> j) =>
      VisibleIfCondition(item: j['item'] as String, op: j['op'] as String, value: j['value']);
}

class FormItem {
  final String key;
  final String type;
  final String? scale;
  final String? group;
  final Map<String, String> title;
  final Map<String, String>? guidance;
  final Map<String, String>? prompt;
  final bool required;
  final num? weight;
  final bool? includeInTotal;
  final VisibleIfCondition? visibleIf;

  const FormItem({
    required this.key,
    required this.type,
    this.scale,
    this.group,
    required this.title,
    this.guidance,
    this.prompt,
    this.required = false,
    this.weight,
    this.includeInTotal,
    this.visibleIf,
  });

  factory FormItem.fromJson(Map<String, dynamic> j) => FormItem(
        key: j['key'] as String,
        type: j['type'] as String,
        scale: j['scale'] as String?,
        group: j['group'] as String?,
        title: Map<String, String>.from(j['title'] as Map),
        guidance: j['guidance'] == null ? null : Map<String, String>.from(j['guidance'] as Map),
        prompt: j['prompt'] == null ? null : Map<String, String>.from(j['prompt'] as Map),
        required: j['required'] as bool? ?? false,
        weight: j['weight'] as num?,
        includeInTotal: j['include_in_total'] as bool?,
        visibleIf: j['visible_if'] == null
            ? null
            : VisibleIfCondition.fromJson(j['visible_if'] as Map<String, dynamic>),
      );
}

class FormGroup {
  final String key;
  final Map<String, String> title;

  const FormGroup({required this.key, required this.title});

  factory FormGroup.fromJson(Map<String, dynamic> j) => FormGroup(
        key: j['key'] as String,
        title: Map<String, String>.from(j['title'] as Map),
      );
}

class FormSection {
  final String key;
  final Map<String, String> title;
  final Map<String, String>? description;
  final List<FormGroup> groups;
  final List<FormItem> items;

  const FormSection({
    required this.key,
    required this.title,
    this.description,
    required this.groups,
    required this.items,
  });

  factory FormSection.fromJson(Map<String, dynamic> j) => FormSection(
        key: j['key'] as String,
        title: Map<String, String>.from(j['title'] as Map),
        description:
            j['description'] == null ? null : Map<String, String>.from(j['description'] as Map),
        groups: (j['groups'] as List? ?? [])
            .map((e) => FormGroup.fromJson(e as Map<String, dynamic>))
            .toList(),
        items: (j['items'] as List)
            .map((e) => FormItem.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class FormDefinition {
  final int schemaVersion;
  final String formKey;
  final String version;
  final String defaultLanguage;
  final List<String> languages;
  final Map<String, String> title;
  final List<FormScale> scales;
  final List<FormSection> sections;

  const FormDefinition({
    required this.schemaVersion,
    required this.formKey,
    required this.version,
    required this.defaultLanguage,
    required this.languages,
    required this.title,
    required this.scales,
    required this.sections,
  });

  factory FormDefinition.fromJson(Map<String, dynamic> j) => FormDefinition(
        schemaVersion: j['schema_version'] as int,
        formKey: j['form_key'] as String,
        version: j['version'] as String,
        defaultLanguage: j['default_language'] as String,
        languages: List<String>.from(j['languages'] as List),
        title: Map<String, String>.from(j['title'] as Map),
        scales: (j['scales'] as List)
            .map((e) => FormScale.fromJson(e as Map<String, dynamic>))
            .toList(),
        sections: (j['sections'] as List)
            .map((e) => FormSection.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  factory FormDefinition.fromJsonString(String s) =>
      FormDefinition.fromJson(jsonDecode(s) as Map<String, dynamic>);
}
