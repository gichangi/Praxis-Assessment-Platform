import type { FormDefinition } from "@assessment/core";

/**
 * Rules for filling in an assessment on the web. They mirror the database:
 * required_missing() decides whether submit_assessment() accepts it, so keep the two in step.
 */

export type DefSection = FormDefinition["sections"][number];
export type DefItem = DefSection["items"][number];

export type AnswerState = { value: number | null; notAssessed: boolean; note: string };
export type Answers = Record<string, AnswerState>;

export const BLANK: AnswerState = { value: null, notAssessed: false, note: "" };

/** Item types a person can answer on the web. Photo and GPS are captured on the phone. */
const ANSWERABLE = new Set(["scale", "single_choice", "yes_no", "number", "text"]);
export const isAnswerable = (item: DefItem) => ANSWERABLE.has(item.type);

/** Scored types answer with a number from a scale (yes/no is 1 or 0). */
export const isChoice = (item: DefItem) =>
  item.type === "scale" || item.type === "single_choice" || item.type === "yes_no";

export function localize(
  text: Record<string, string> | null | undefined,
  lang: string,
  fallback: string
): string {
  if (!text) return "";
  return text[lang]?.trim() || text[fallback]?.trim() || Object.values(text)[0] || "";
}

/** An item can be hidden until another item's answer meets a condition. */
export function isVisible(item: DefItem, answers: Answers): boolean {
  const c = item.visible_if;
  if (!c) return true;
  const v = answers[c.item]?.value ?? null;
  switch (c.op) {
    case "eq":
      return v === c.value;
    case "neq":
      return v !== c.value;
    case "gte":
      return v != null && typeof c.value === "number" && v >= c.value;
    case "lte":
      return v != null && typeof c.value === "number" && v <= c.value;
    default:
      return true;
  }
}

export function isAnswered(item: DefItem, a: AnswerState | undefined): boolean {
  if (!a) return false;
  if (a.notAssessed) return true;
  if (item.type === "text") return a.note.trim() !== "";
  return a.value != null;
}

/** Items to show and ask for, in order, with the section each belongs to. */
export function visibleItems(def: FormDefinition, answers: Answers) {
  return def.sections.flatMap((section) =>
    section.items.filter((item) => isVisible(item, answers)).map((item) => ({ section, item }))
  );
}

/** Keys of required, visible, answerable items that are still blank. */
export function requiredMissing(def: FormDefinition, answers: Answers): string[] {
  return visibleItems(def, answers)
    .filter(
      ({ item }) => item.required && isAnswerable(item) && !isAnswered(item, answers[item.key])
    )
    .map(({ item }) => item.key);
}

export function progress(def: FormDefinition, answers: Answers) {
  const items = visibleItems(def, answers)
    .map(({ item }) => item)
    .filter(isAnswerable);
  return {
    total: items.length,
    answered: items.filter((i) => isAnswered(i, answers[i.key])).length,
    requiredLeft: requiredMissing(def, answers).length,
  };
}

export type ResponseRow = {
  item_key: string;
  value: number | null;
  not_assessed: boolean;
  note: string | null;
};

/**
 * What to store: one row per visible item that has any content. Text answers live in `note`;
 * "not assessed" clears the number. Hidden items are left out so stale answers don't linger.
 */
export function toRows(def: FormDefinition, answers: Answers): ResponseRow[] {
  const rows: ResponseRow[] = [];
  for (const { item } of visibleItems(def, answers)) {
    if (!isAnswerable(item)) continue;
    const a = answers[item.key];
    if (!a) continue;
    const note = a.note.trim();
    const value = a.notAssessed || item.type === "text" ? null : a.value;
    if (value == null && !a.notAssessed && note === "") continue;
    rows.push({ item_key: item.key, value, not_assessed: a.notAssessed, note: note || null });
  }
  return rows;
}

/** Rebuild answers from stored response rows (for continuing a draft). */
export function fromRows(
  rows: { item_key: string; value: number | null; not_assessed: boolean; note: string | null }[]
): Answers {
  const out: Answers = {};
  for (const r of rows) {
    out[r.item_key] = {
      value: r.value == null ? null : Number(r.value),
      notAssessed: r.not_assessed,
      note: r.note ?? "",
    };
  }
  return out;
}

/** The levels to offer for a choice item (yes/no is a fixed pair). */
export function choiceLevels(
  def: FormDefinition,
  item: DefItem
): { value: number; label: Record<string, string>; description?: Record<string, string> | null }[] {
  if (item.type === "yes_no") {
    return [
      { value: 1, label: { en: "Yes" } },
      { value: 0, label: { en: "No" } },
    ];
  }
  const scale = def.scales.find((s) => s.key === item.scale);
  return [...(scale?.levels ?? [])].sort((a, b) => b.value - a.value);
}

/** The questions a person walks through on the web, per section, in order. */
export function askable(def: FormDefinition, answers: Answers) {
  return def.sections
    .map((section) => ({
      section,
      items: section.items.filter((item) => isVisible(item, answers) && isAnswerable(item)),
    }))
    .filter((s) => s.items.length > 0);
}

/** Short text for how an item was answered, for the collapsed row. Empty when unanswered. */
export function answerLabel(
  def: FormDefinition,
  item: DefItem,
  a: AnswerState | undefined,
  lang: string
): string {
  if (!a) return "";
  if (a.notAssessed) return "Not assessed";
  const fallback = def.default_language;
  if (isChoice(item)) {
    if (a.value == null) return "";
    const level = choiceLevels(def, item).find((l) => l.value === a.value);
    const label = level ? localize(level.label, lang, fallback) : "";
    return item.type === "yes_no" ? label : `${a.value} · ${label}`;
  }
  if (item.type === "number")
    return a.value == null ? "" : `${a.value}${item.unit ? ` ${item.unit}` : ""}`;
  if (item.type === "text") {
    const text = a.note.trim();
    return text.length > 28 ? `${text.slice(0, 28)}…` : text;
  }
  return "";
}

/** Where to go next: the first unanswered question after `from`, wrapping round to the start. */
export function nextUnanswered(flat: { key: string; answered: boolean }[], from: number): number {
  for (let step = 1; step <= flat.length; step++) {
    const i = (from + step) % flat.length;
    if (!flat[i].answered) return i;
  }
  return -1;
}

type Level = ReturnType<typeof choiceLevels>[number];

/** The key that picks a level: its digit (0-9), or Y/N for yes/no. Empty when it has none. */
export function hotkeyFor(item: DefItem, level: Level): string {
  if (item.type === "yes_no") return level.value === 1 ? "Y" : "N";
  return Number.isInteger(level.value) && level.value >= 0 && level.value <= 9
    ? String(level.value)
    : "";
}

/** The level a pressed key picks for this question, or null. */
export function levelForKey(def: FormDefinition, item: DefItem, key: string): number | null {
  const k = key.toUpperCase();
  const level = choiceLevels(def, item).find((l) => hotkeyFor(item, l) === k);
  return level ? level.value : null;
}

/** "1–6" or "Y or N": what to press to answer. Empty when no key applies. */
export function hotkeyHint(def: FormDefinition, item: DefItem): string {
  if (!isChoice(item)) return "";
  if (item.type === "yes_no") return "Y or N";
  const keys = choiceLevels(def, item)
    .map((l) => hotkeyFor(item, l))
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b);
  if (keys.length === 0) return "";
  const contiguous = keys.every((k, i) => i === 0 || k === keys[i - 1] + 1);
  if (keys.length === 1) return String(keys[0]);
  return contiguous ? `${keys[0]}–${keys[keys.length - 1]}` : keys.join(", ");
}
