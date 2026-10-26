import type { FormDefinition } from "./schema.js";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  sections: { key: string; items: number; scored: number; maxScore: number }[];
  coverage: Record<string, { done: number; total: number }>;
}

export function validate(def: FormDefinition, previous?: FormDefinition): ValidationReport {
  const issues: ValidationIssue[] = [];
  const { languages, default_language: dflt } = def;

  if (!languages.includes(dflt)) {
    issues.push({ type: "error", message: `default_language '${dflt}' not in languages` });
  }

  const scaleMax = new Map<string, number>();
  for (const s of def.scales) {
    const values = s.levels.map((l) => l.value).sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const expected = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    if (JSON.stringify(values) !== JSON.stringify(expected)) {
      issues.push({
        type: "error",
        message: `Scale '${s.key}' levels are not contiguous: ${values}`,
      });
    }
    scaleMax.set(s.key, max);
  }

  const itemKeys = new Set<string>();
  const sections: ValidationReport["sections"] = [];

  for (const sec of def.sections) {
    const groupKeys = new Set(sec.groups.map((g) => g.key));
    let maxScore = 0;
    let scored = 0;

    for (const it of sec.items) {
      if (itemKeys.has(it.key)) {
        issues.push({ type: "error", message: `Duplicate item key '${it.key}'` });
      }
      itemKeys.add(it.key);

      if (it.group && !groupKeys.has(it.group)) {
        issues.push({
          type: "error",
          message: `Item '${it.key}' uses unknown group '${it.group}'`,
        });
      }

      if ((it.type === "scale" || it.type === "single_choice") && it.scale) {
        if (!scaleMax.has(it.scale)) {
          issues.push({
            type: "error",
            message: `Item '${it.key}' uses unknown scale '${it.scale}'`,
          });
        } else if (it.include_in_total !== false) {
          maxScore += scaleMax.get(it.scale)! * (it.weight ?? 1);
          scored++;
        }
      } else if (it.type === "yes_no" && it.include_in_total !== false) {
        maxScore += it.weight ?? 1;
        scored++;
      }

      if (!it.title[dflt]) {
        issues.push({
          type: "error",
          message: `Item '${it.key}' has no title in default language '${dflt}'`,
        });
      }
    }
    sections.push({ key: sec.key, items: sec.items.length, scored, maxScore });
  }

  if (previous) {
    const prevItemMap = new Map(
      previous.sections.flatMap((s) => s.items.map((it) => [it.key, it]))
    );
    const prevScaleMax = new Map(
      previous.scales.map((s) => [s.key, Math.max(...s.levels.map((l) => l.value))])
    );

    for (const [k] of prevItemMap) {
      if (!itemKeys.has(k)) {
        issues.push({
          type: "warning",
          message: `Item '${k}' removed since previous version — history kept`,
        });
      }
    }

    for (const sec of def.sections) {
      for (const it of sec.items) {
        const prev = prevItemMap.get(it.key);
        if (prev?.scale && it.scale && prev.scale !== it.scale) {
          const oldMax = prevScaleMax.get(prev.scale) ?? 0;
          const newMax = scaleMax.get(it.scale) ?? 0;
          if (oldMax !== newMax) {
            issues.push({
              type: "error",
              message: `Item '${it.key}' scale max changed ${oldMax}→${newMax}; use a new key`,
            });
          }
        }
      }
    }
  }

  const coverage: ValidationReport["coverage"] = {};
  for (const lang of languages) {
    let total = 0;
    let done = 0;
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      const obj = node as Record<string, unknown>;
      const vals = Object.values(obj);
      if (vals.every((v) => v === null || typeof v === "string")) {
        if ((obj[dflt] as string | undefined)?.trim()) {
          total++;
          if (obj[lang]) done++;
          return;
        }
      }
      vals.forEach(walk);
    };
    walk(def);
    coverage[lang] = { done, total };
    if (lang !== dflt && done < total) {
      issues.push({
        type: "warning",
        message: `'${lang}' translation ${done}/${total}: missing text falls back to '${dflt}'`,
      });
    }
  }

  return { issues, sections, coverage };
}
