import type { FormDefinition } from "./schema.js";

export type Answer = { value: number | null; not_assessed: boolean };
export type Totals = {
  score: number;
  max: number;
  pct: number | null;
  missing: string[];
  sections: Record<
    string,
    {
      score: number;
      max: number;
      pct: number | null;
      answered: number;
      not_assessed: number;
      groups: Record<string, { score: number; max: number; count: number }>;
    }
  >;
};

const SCORED = new Set(["scale", "single_choice", "yes_no"]);

export function computeTotals(def: FormDefinition, answers: Record<string, Answer>): Totals {
  const scaleMax = Object.fromEntries(
    def.scales.map((s) => [s.key, Math.max(...s.levels.map((l) => l.value))])
  );
  const out: Totals = { score: 0, max: 0, pct: null, missing: [], sections: {} };
  for (const sec of def.sections) {
    const s = {
      score: 0,
      max: 0,
      pct: null as number | null,
      answered: 0,
      not_assessed: 0,
      groups: {} as Totals["sections"][string]["groups"],
    };
    for (const it of sec.items) {
      if (!it.include_in_total || !SCORED.has(it.type) || !isVisible(it, answers)) continue;
      const itemMax = it.type === "yes_no" ? 1 : scaleMax[it.scale!];
      const a = answers[it.key];
      if (a?.not_assessed) {
        s.not_assessed++;
        continue;
      }
      if (a?.value == null) {
        out.missing.push(it.key);
        continue;
      }
      const g = (s.groups[it.group ?? sec.key] ??= { score: 0, max: 0, count: 0 });
      s.answered++;
      s.score += a.value * it.weight;
      s.max += itemMax * it.weight;
      g.score += a.value * it.weight;
      g.max += itemMax * it.weight;
      g.count++;
    }
    s.pct = s.max > 0 ? Math.round((1000 * s.score) / s.max) / 10 : null;
    out.sections[sec.key] = s;
    out.score += s.score;
    out.max += s.max;
  }
  out.pct = out.max > 0 ? Math.round((1000 * out.score) / out.max) / 10 : null;
  return out;
}

function isVisible(
  it: { visible_if?: { item: string; op: string; value: unknown } | null },
  answers: Record<string, Answer>
): boolean {
  const c = it.visible_if;
  if (!c) return true;
  const v = answers[c.item]?.value;
  switch (c.op) {
    case "eq":
      return v === c.value;
    case "neq":
      return v !== c.value;
    case "gte":
      return v != null && v >= (c.value as number);
    case "lte":
      return v != null && v <= (c.value as number);
    default:
      return true;
  }
}
