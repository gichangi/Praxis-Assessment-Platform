import 'dart:convert';

/// Resolve a localised text field to the best available string.
/// Falls back to the default language when [lang] has no translation.
String t(Map<String, String>? text, String lang, String fallback) {
  if (text == null || text.isEmpty) return '';
  final localised = text[lang]?.trim();
  if (localised != null && localised.isNotEmpty) return localised;
  return text[fallback]?.trim() ?? '';
}

/// [t] for a JSON-encoded i18n object as stored in the local database. Empty when unreadable.
String tJson(String json, String lang, String fallback) {
  try {
    final decoded = jsonDecode(json);
    if (decoded is Map) {
      return t(decoded.map((k, v) => MapEntry('$k', '$v')), lang, fallback);
    }
  } catch (_) {}
  return '';
}

bool isRtl(String lang) => const {'ar', 'ur', 'fa', 'he'}.contains(lang);
