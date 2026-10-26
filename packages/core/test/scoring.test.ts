import { describe, it, expect } from "vitest";
import { computeTotals } from "../src/scoring.js";
import { FormDefinition } from "../src/schema.js";
import garoweForm from "./fixtures/garowe_form.json";
import garoweAnswers from "./fixtures/garowe_answers.json";
import type { Answer } from "../src/scoring.js";

const def = FormDefinition.parse(garoweForm);
const answers = garoweAnswers as Record<string, Answer>;

describe("computeTotals — Garowe parity fixture", () => {
  const result = computeTotals(def, answers);

  it("overall score is 116", () => {
    expect(result.score).toBe(116);
  });

  it("overall max is 228", () => {
    expect(result.max).toBe(228);
  });

  it("overall pct is 50.9", () => {
    // round(1000 * 116 / 228) / 10 = round(508.77) / 10 = 509 / 10 = 50.9
    expect(result.pct).toBe(50.9);
  });

  it("governance section: 98/192", () => {
    // item 1 = 5, items 2-32 = 3  → 5 + 31×3 = 5 + 93 = 98; max = 32×6 = 192
    expect(result.sections.governance.score).toBe(98);
    expect(result.sections.governance.max).toBe(192);
  });

  it("logistics section: 18/36", () => {
    // items 33-38 = 3 (6 items), item 39 = not_assessed → 6×3 = 18; max = 6×6 = 36
    expect(result.sections.logistics.score).toBe(18);
    expect(result.sections.logistics.max).toBe(36);
  });

  it("one not_assessed in logistics", () => {
    expect(result.sections.logistics.not_assessed).toBe(1);
  });

  it("no missing items (all 38 scored items answered)", () => {
    expect(result.missing).toHaveLength(0);
  });
});

describe("computeTotals — edge cases", () => {
  it("empty answers → all items missing, score and max both 0", () => {
    const r = computeTotals(def, {});
    expect(r.score).toBe(0);
    expect(r.max).toBe(0);
    expect(r.pct).toBeNull();
    expect(r.missing.length).toBe(39);
  });

  it("all not_assessed → score 0, max 0, pct null", () => {
    const allNa: Record<string, Answer> = {};
    for (const sec of def.sections) {
      for (const it of sec.items) {
        allNa[it.key] = { value: null, not_assessed: true };
      }
    }
    const r = computeTotals(def, allNa);
    expect(r.score).toBe(0);
    expect(r.max).toBe(0);
    expect(r.pct).toBeNull();
  });
});
