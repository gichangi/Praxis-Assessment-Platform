import { describe, expect, it } from "vitest";
import type { FormDefinition } from "@assessment/core";
import {
  answerLabel,
  askable,
  choiceLevels,
  fromRows,
  hotkeyHint,
  isVisible,
  levelForKey,
  localize,
  nextUnanswered,
  progress,
  requiredMissing,
  toRows,
  type Answers,
} from "./assessment-entry";

// Same shape as the database test: r_scale and r_text required, o_scale optional,
// r_hidden required but only shown when r_scale >= 2, shot is a required photo.
const def = {
  schema_version: 1,
  form_key: "f",
  version: "1.0.0",
  default_language: "en",
  languages: ["en", "so"],
  title: { en: "F" },
  scoring: { method: "sum", exclude_not_assessed: true, show_percentage: true },
  scales: [
    {
      key: "s",
      levels: [
        { value: 0, label: { en: "None" } },
        { value: 2, label: { en: "Full" } },
        { value: 1, label: { en: "Some" } },
      ],
    },
  ],
  sections: [
    {
      key: "sec",
      title: { en: "Section" },
      groups: [],
      items: [
        {
          key: "r_scale",
          type: "scale",
          scale: "s",
          title: { en: "A" },
          required: true,
          weight: 1,
          include_in_total: true,
        },
        {
          key: "o_scale",
          type: "scale",
          scale: "s",
          title: { en: "B" },
          required: false,
          weight: 1,
          include_in_total: true,
        },
        {
          key: "r_text",
          type: "text",
          title: { en: "C" },
          required: true,
          weight: 1,
          include_in_total: true,
        },
        {
          key: "r_hidden",
          type: "scale",
          scale: "s",
          title: { en: "D" },
          required: true,
          weight: 1,
          include_in_total: true,
          visible_if: { item: "r_scale", op: "gte", value: 2 },
        },
        {
          key: "shot",
          type: "photo",
          title: { en: "E" },
          required: true,
          weight: 1,
          include_in_total: false,
        },
      ],
    },
  ],
} as unknown as FormDefinition;

const a = (value: number | null, note = "", notAssessed = false) => ({ value, note, notAssessed });

describe("requiredMissing", () => {
  it("lists only required, visible, answerable items", () => {
    expect(requiredMissing(def, {})).toEqual(["r_scale", "r_text"]);
  });

  it("is empty once the required items are answered, even with an optional one blank", () => {
    const answers: Answers = { r_scale: a(0), r_text: a(null, "Looks fine") };
    expect(requiredMissing(def, answers)).toEqual([]);
  });

  it("brings a hidden required item into play when its condition is met", () => {
    const answers: Answers = { r_scale: a(2), r_text: a(null, "ok") };
    expect(requiredMissing(def, answers)).toEqual(["r_hidden"]);
  });

  it("counts not assessed as answered", () => {
    const answers: Answers = { r_scale: a(2), r_text: a(null, "ok"), r_hidden: a(null, "", true) };
    expect(requiredMissing(def, answers)).toEqual([]);
  });

  it("does not accept blank text", () => {
    expect(requiredMissing(def, { r_scale: a(0), r_text: a(null, "   ") })).toEqual(["r_text"]);
  });

  it("never blocks on photo or gps items", () => {
    expect(requiredMissing(def, {})).not.toContain("shot");
  });
});

describe("isVisible", () => {
  const hidden = def.sections[0].items[3];

  it("hides an item until the condition holds", () => {
    expect(isVisible(hidden, {})).toBe(false);
    expect(isVisible(hidden, { r_scale: a(1) })).toBe(false);
    expect(isVisible(hidden, { r_scale: a(2) })).toBe(true);
  });
});

describe("progress", () => {
  it("counts answerable visible items and what is left", () => {
    expect(progress(def, { r_scale: a(0) })).toEqual({ total: 3, answered: 1, requiredLeft: 1 });
  });

  it("grows when a hidden item appears", () => {
    expect(progress(def, { r_scale: a(2) }).total).toBe(4);
  });
});

describe("toRows", () => {
  it("stores one row per item with content, text answers in the note", () => {
    const rows = toRows(def, { r_scale: a(0), o_scale: a(null), r_text: a(null, " Looks fine ") });
    expect(rows).toEqual([
      { item_key: "r_scale", value: 0, not_assessed: false, note: null },
      { item_key: "r_text", value: null, not_assessed: false, note: "Looks fine" },
    ]);
  });

  it("clears the number when an item is marked not assessed, and keeps its note", () => {
    const rows = toRows(def, { r_scale: { value: 1, notAssessed: true, note: "n/a here" } });
    expect(rows).toEqual([
      { item_key: "r_scale", value: null, not_assessed: true, note: "n/a here" },
    ]);
  });

  it("leaves out hidden items so stale answers don't linger", () => {
    const rows = toRows(def, { r_scale: a(0), r_hidden: a(2) });
    expect(rows.map((r) => r.item_key)).toEqual(["r_scale"]);
  });
});

describe("fromRows", () => {
  it("rebuilds answers from stored rows", () => {
    const answers = fromRows([
      { item_key: "r_scale", value: 2, not_assessed: false, note: null },
      { item_key: "r_text", value: null, not_assessed: false, note: "hi" },
    ]);
    expect(answers.r_scale).toEqual({ value: 2, notAssessed: false, note: "" });
    expect(answers.r_text.note).toBe("hi");
  });
});

describe("choiceLevels and localize", () => {
  it("offers a scale's levels highest first, and a fixed yes/no pair", () => {
    expect(choiceLevels(def, def.sections[0].items[0]).map((l) => l.value)).toEqual([2, 1, 0]);
    const yesNo = {
      key: "y",
      type: "yes_no",
    } as unknown as FormDefinition["sections"][number]["items"][number];
    expect(choiceLevels(def, yesNo).map((l) => l.value)).toEqual([1, 0]);
  });

  it("falls back to the default language", () => {
    expect(localize({ en: "Hello", so: "Salaan" }, "so", "en")).toBe("Salaan");
    expect(localize({ en: "Hello" }, "ar", "en")).toBe("Hello");
    expect(localize(null, "en", "en")).toBe("");
  });
});

describe("askable", () => {
  it("lists visible answerable questions per section, skipping photo and hidden ones", () => {
    const keys = askable(def, {}).flatMap((s) => s.items.map((i) => i.key));
    expect(keys).toEqual(["r_scale", "o_scale", "r_text"]);
  });

  it("includes a hidden question once its condition is met", () => {
    const keys = askable(def, { r_scale: a(2) }).flatMap((s) => s.items.map((i) => i.key));
    expect(keys).toContain("r_hidden");
  });
});

describe("answerLabel", () => {
  const [rScale, , rText] = def.sections[0].items;

  it("describes a choice with its number and label", () => {
    expect(answerLabel(def, rScale, a(2), "en")).toBe("2 · Full");
  });

  it("says not assessed, and is empty when unanswered", () => {
    expect(answerLabel(def, rScale, a(null, "", true), "en")).toBe("Not assessed");
    expect(answerLabel(def, rScale, undefined, "en")).toBe("");
    expect(answerLabel(def, rScale, a(null), "en")).toBe("");
  });

  it("shortens long text answers", () => {
    const long = "x".repeat(40);
    expect(answerLabel(def, rText, a(null, long), "en")).toBe(`${"x".repeat(28)}…`);
  });
});

describe("nextUnanswered", () => {
  const flat = (...answered: boolean[]) => answered.map((x, i) => ({ key: `k${i}`, answered: x }));

  it("finds the next gap after the current question", () => {
    expect(nextUnanswered(flat(true, false, true, false), 1)).toBe(3);
  });

  it("wraps round to the start", () => {
    expect(nextUnanswered(flat(false, true, true), 2)).toBe(0);
  });

  it("returns -1 when everything is answered", () => {
    expect(nextUnanswered(flat(true, true), 0)).toBe(-1);
  });
});

describe("hotkeys", () => {
  const scale = def.sections[0].items[0];
  const yesNo = { ...scale, key: "yn", type: "yes_no" } as typeof scale;

  it("uses the level's own digit for scales", () => {
    expect(levelForKey(def, scale, "2")).toBe(2);
    expect(levelForKey(def, scale, "0")).toBe(0);
    expect(levelForKey(def, scale, "7")).toBeNull();
  });

  it("uses Y and N for yes/no, either case", () => {
    expect(levelForKey(def, yesNo, "y")).toBe(1);
    expect(levelForKey(def, yesNo, "N")).toBe(0);
    expect(levelForKey(def, yesNo, "1")).toBeNull();
  });

  it("describes what to press", () => {
    expect(hotkeyHint(def, scale)).toBe("0–2");
    expect(hotkeyHint(def, yesNo)).toBe("Y or N");
    expect(hotkeyHint(def, def.sections[0].items[2])).toBe("");
  });
});
