/// Resolve a localised text field to the best available string.
/// Falls back to the default language when [lang] has no translation.
String t(Map<String, String>? text, String lang, String fallback) {
  if (text == null || text.isEmpty) return '';
  final localised = text[lang]?.trim();
  if (localised != null && localised.isNotEmpty) return localised;
  return text[fallback]?.trim() ?? '';
}

bool isRtl(String lang) => const {'ar', 'ur', 'fa', 'he'}.contains(lang);
