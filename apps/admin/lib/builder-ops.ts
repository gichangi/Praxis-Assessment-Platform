import type { FormDefinition } from "@assessment/core";

/**
 * Pure edits to a form definition, used by the builder. Every function returns a new
 * definition and leaves its input alone.
 */

export type BuilderSection = FormDefinition["sections"][number];
export type BuilderItem = BuilderSection["items"][number];
type Scale = FormDefinition["scales"][number];

/** A readable key that isn't taken yet: base, base_2, base_3... */
export function uniqueKey(base: string, existing: Set<string>): string {
  const slug =
    base
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/^[^a-z]+/, "")
      .slice(0, 55) || "item";
  const stem = slug.length < 2 ? `${slug}_x` : slug;
  if (!existing.has(stem)) return stem;
  let n = 2;
  while (existing.has(`${stem}_${n}`)) n++;
  return `${stem}_${n}`;
}

export const itemKeys = (def: FormDefinition): Set<string> =>
  new Set(def.sections.flatMap((s) => s.items.map((i) => i.key)));

export const itemCount = (def: FormDefinition): number =>
  def.sections.reduce((n, s) => n + s.items.length, 0);

export function findItem(def: FormDefinition, key: string | null) {
  if (!key) return null;
  for (const section of def.sections) {
    const index = section.items.findIndex((i) => i.key === key);
    if (index >= 0) return { section, item: section.items[index], index };
  }
  return null;
}

/** Text in `lang`, else the form's default language, else anything. */
export function say(
  text: Record<string, string> | null | undefined,
  lang: string,
  fallback: string
): string {
  if (!text) return "";
  return text[lang]?.trim() || text[fallback]?.trim() || Object.values(text).find(Boolean) || "";
}

/** "Scale 0–6", "Yes / No", "Text"... what a question is, in a few words. */
export function itemTypeLabel(def: FormDefinition, item: BuilderItem): string {
  switch (item.type) {
    case "scale": {
      const values = def.scales.find((s) => s.key === item.scale)?.levels.map((l) => l.value) ?? [];
      return values.length ? `Scale ${Math.min(...values)}–${Math.max(...values)}` : "Scale";
    }
    case "single_choice":
      return "Single choice";
    case "yes_no":
      return "Yes / No";
    case "number":
      return "Number";
    case "text":
      return "Text";
    case "photo":
      return "Photo";
    case "gps":
      return "GPS";
  }
}

/** Where a question goes when it is dropped: a section, and a position within it. */
export function moveItem(
  def: FormDefinition,
  key: string,
  toSection: string,
  toIndex: number
): FormDefinition {
  const found = findItem(def, key);
  if (!found || !def.sections.some((s) => s.key === toSection)) return def;
  const next = structuredClone(def);
  const from = next.sections.find((s) => s.key === found.section.key)!;
  const [item] = from.items.splice(found.index, 1);
  const to = next.sections.find((s) => s.key === toSection)!;
  to.items.splice(Math.max(0, Math.min(toIndex, to.items.length)), 0, item);
  // Groups belong to a section; a question moved elsewhere can't keep one.
  if (from.key !== to.key) delete item.group;
  return next;
}

/** One step up (-1) or down (+1), carrying on into the neighbouring section at the edges. */
export function nudgeItem(def: FormDefinition, key: string, dir: -1 | 1): FormDefinition {
  const found = findItem(def, key);
  if (!found) return def;
  const si = def.sections.findIndex((s) => s.key === found.section.key);
  const target = found.index + dir;
  if (target >= 0 && target < found.section.items.length)
    return moveItem(def, key, found.section.key, target);
  const neighbour = def.sections[si + dir];
  if (!neighbour) return def;
  return moveItem(def, key, neighbour.key, dir === -1 ? neighbour.items.length : 0);
}

export function moveSection(def: FormDefinition, key: string, toIndex: number): FormDefinition {
  const from = def.sections.findIndex((s) => s.key === key);
  if (from < 0) return def;
  const next = structuredClone(def);
  const [section] = next.sections.splice(from, 1);
  next.sections.splice(Math.max(0, Math.min(toIndex, next.sections.length)), 0, section);
  return next;
}

export function nudgeSection(def: FormDefinition, key: string, dir: -1 | 1): FormDefinition {
  const i = def.sections.findIndex((s) => s.key === key);
  if (i < 0 || i + dir < 0 || i + dir >= def.sections.length) return def;
  return moveSection(def, key, i + dir);
}

const withSuffix = (text: Record<string, string>, suffix: string) =>
  Object.fromEntries(Object.entries(text).map(([lang, value]) => [lang, `${value}${suffix}`]));

/** A copy of a question right after the original, with a new key. */
export function duplicateItem(def: FormDefinition, key: string) {
  const found = findItem(def, key);
  if (!found) return { def, newKey: null as string | null };
  const next = structuredClone(def);
  const section = next.sections.find((s) => s.key === found.section.key)!;
  const newKey = uniqueKey(`${key}_copy`, itemKeys(next));
  const copy = structuredClone(found.item);
  copy.key = newKey;
  copy.title = withSuffix(copy.title, " (copy)");
  section.items.splice(found.index + 1, 0, copy);
  return { def: next, newKey };
}

/** A copy of a section, with its questions, right after the original. */
export function duplicateSection(def: FormDefinition, key: string) {
  const index = def.sections.findIndex((s) => s.key === key);
  if (index < 0) return { def, newKey: null as string | null };
  const next = structuredClone(def);
  const copy = structuredClone(next.sections[index]);
  copy.key = uniqueKey(`${key}_copy`, new Set(next.sections.map((s) => s.key)));
  copy.title = withSuffix(copy.title, " (copy)");
  const taken = itemKeys(next);
  for (const item of copy.items) {
    item.key = uniqueKey(item.key, taken);
    taken.add(item.key);
  }
  next.sections.splice(index + 1, 0, copy);
  return { def: next, newKey: copy.key };
}

export function addSection(def: FormDefinition, title = "New section") {
  const next = structuredClone(def);
  const key = uniqueKey("section", new Set(next.sections.map((s) => s.key)));
  next.sections.push({
    key,
    title: { [def.default_language]: title },
    description: null,
    groups: [],
    items: [],
  });
  return { def: next, newKey: key };
}

export function addBlankItem(def: FormDefinition, sectionKey: string) {
  const next = structuredClone(def);
  const section = next.sections.find((s) => s.key === sectionKey);
  if (!section) return { def, newKey: null as string | null };
  const key = uniqueKey("question", itemKeys(next));
  section.items.push({
    key,
    type: "scale",
    title: { [def.default_language]: "New question" },
    weight: 1,
    include_in_total: true,
    required: false,
    scale: def.scales[0]?.key,
  });
  return { def: next, newKey: key };
}

export function deleteItem(def: FormDefinition, key: string): FormDefinition {
  const next = structuredClone(def);
  next.sections = next.sections.map((s) => ({ ...s, items: s.items.filter((i) => i.key !== key) }));
  return next;
}

export function deleteSection(def: FormDefinition, key: string): FormDefinition {
  const next = structuredClone(def);
  next.sections = next.sections.filter((s) => s.key !== key);
  return next;
}

export function renameSection(
  def: FormDefinition,
  key: string,
  lang: string,
  title: string
): FormDefinition {
  const next = structuredClone(def);
  const section = next.sections.find((s) => s.key === key);
  if (section) section.title = { ...section.title, [lang]: title };
  return next;
}

/* ---------- the question library ---------- */

export type LibraryEntry = {
  /** Unique within a list. */
  id: string;
  /** The question's identity (see questionId), shared by copies of it in other forms. */
  qid: string;
  form: string;
  section: string;
  item: BuilderItem;
  /** The scale the question uses, so it can come along. */
  scale?: Scale;
  updatedAt: string;
};

const normal = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

/** A question's identity for matching: same wording, same kind of answer. */
export function questionId(item: BuilderItem, fallbackLang: string): string {
  return `${item.type}|${item.scale ?? ""}|${normal(say(item.title, fallbackLang, fallbackLang))}`;
}

/** Every question across the given forms, one entry per distinct question, newest first. */
export function collectLibrary(
  forms: { form: string; updatedAt: string; def: FormDefinition }[]
): LibraryEntry[] {
  const seen = new Set<string>();
  const out: LibraryEntry[] = [];
  for (const { form, updatedAt, def } of forms) {
    for (const section of def.sections) {
      for (const item of section.items) {
        const id = questionId(item, def.default_language);
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          id: `${out.length}:${id}`,
          qid: id,
          form,
          section: say(section.title, def.default_language, def.default_language),
          item,
          scale: item.scale ? def.scales.find((s) => s.key === item.scale) : undefined,
          updatedAt,
        });
      }
    }
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Put a library question into a section as a copy with its own key. */
export function addFromLibrary(
  def: FormDefinition,
  entry: Pick<LibraryEntry, "item" | "scale">,
  sectionKey: string,
  index?: number
) {
  const next = structuredClone(def);
  const section = next.sections.find((s) => s.key === sectionKey);
  if (!section) return { def, newKey: null as string | null };
  const item = structuredClone(entry.item);
  item.key = uniqueKey(item.key, itemKeys(next));
  // These point at things in the question's old form.
  delete item.group;
  delete item.visible_if;
  if (item.scale && !next.scales.some((s) => s.key === item.scale) && entry.scale) {
    next.scales.push(structuredClone(entry.scale));
  }
  section.items.splice(index ?? section.items.length, 0, item);
  return { def: next, newKey: item.key };
}

export function matchesQuery(text: string, query: string): boolean {
  const q = normal(query);
  return !q || normal(text).includes(q);
}
