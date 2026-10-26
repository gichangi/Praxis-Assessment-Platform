export function t(
  text: Record<string, string> | null | undefined,
  lang: string,
  fallback: string
): string {
  if (!text) return "";
  return text[lang]?.trim() || text[fallback] || "";
}

export const isRtl = (lang: string) => ["ar", "ur", "fa", "he"].includes(lang);
