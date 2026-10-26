import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pick the best available translation for a JSON i18n object. */
export function t(
  i18n: Record<string, string> | null | undefined,
  lang = "en",
): string {
  if (!i18n) return "";
  return i18n[lang]?.trim() || i18n["en"]?.trim() || Object.values(i18n)[0] || "";
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n.toFixed(1)} %`;
}
