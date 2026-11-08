import { describe, expect, it } from "vitest";
import type { FormDefinition } from "@assessment/core";
import {
  addBlankItem,
  addFromLibrary,
  addSection,
  collectLibrary,
  deleteItem,
  deleteSection,
  duplicateItem,
  duplicateSection,
  findItem,
  itemCount,
  itemTypeLabel,
  matchesQuery,
  moveItem,
  moveSection,
  nudgeItem,
  nudgeSection,
  questionId,
  renameSection,
  say,
  uniqueKey,
} from "./builder-ops";

const item = (key: string, extra: Record<string, unknown> = {}) => ({
  key,
  type: "scale" as const,
  scale: "s",
  title: { en: key.toUpperCase() },
  required: false,
  weight: 1,
  include_in_total: true,
  ...extra,
});

const def = (): FormDefinition =>
  ({
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
          { value: 5, label: { en: "Full" } },
        ],
      },
    ],
    sections: [
      {
        key: "a",
        title: { en: "A" },
        groups: [],
        items: [item("a1", { group: "g" }), item("a2"), item("a3")],
      },
      { key: "b", title: { en: "B" }, groups: [], items: [item("b1")] },
    ],
  }) as unknown as FormDefinition;

const keys = (d: FormDefinition, section: string) =>
  d.sections.find((s) => s.key === section)!.items.map((i) => i.key);

describe("uniqueKey", () => {
  it("makes a readable key and avoids taken ones", () => {
    expect(uniqueKey("New Question!", new Set())).toBe("new_question");
    expect(uniqueKey("item", new Set(["item", "item_2"]))).toBe("item_3");
  });

  it("always yields a valid key", () => {
    expect(uniqueKey("123", new Set())).toMatch(/^[a-z][a-z0-9_]{1,62}$/);
    expect(uniqueKey("", new Set())).toMatch(/^[a-z][a-z0-9_]{1,62}$/);
  });
});

describe("moving questions", () => {
  it("reorders within a section", () => {
    expect(keys(moveItem(def(), "a1", "a", 2), "a")).toEqual(["a2", "a3", "a1"]);
  });

  it("moves to another section and drops its group", () => {
    const d = moveItem(def(), "a1", "b", 0);
    expect(keys(d, "a")).toEqual(["a2", "a3"]);
    expect(keys(d, "b")).toEqual(["a1", "b1"]);
    expect(findItem(d, "a1")!.item.group).toBeUndefined();
  });

  it("does not change the original", () => {
    const d = def();
    moveItem(d, "a1", "b", 0);
    expect(keys(d, "a")).toEqual(["a1", "a2", "a3"]);
  });

  it("steps up and down, carrying on into the next section", () => {
    expect(keys(nudgeItem(def(), "a2", -1), "a")).toEqual(["a2", "a1", "a3"]);
    const down = nudgeItem(def(), "a3", 1);
    expect(keys(down, "b")).toEqual(["a3", "b1"]);
    const up = nudgeItem(def(), "b1", -1);
    expect(keys(up, "a")).toEqual(["a1", "a2", "a3", "b1"]);
  });

  it("stays put at the very ends", () => {
    expect(nudgeItem(def(), "a1", -1)).toEqual(def());
    expect(nudgeItem(def(), "b1", 1)).toEqual(def());
  });
});

describe("moving sections", () => {
  it("reorders sections", () => {
    expect(moveSection(def(), "a", 1).sections.map((s) => s.key)).toEqual(["b", "a"]);
    expect(nudgeSection(def(), "b", -1).sections.map((s) => s.key)).toEqual(["b", "a"]);
    expect(nudgeSection(def(), "a", -1).sections.map((s) => s.key)).toEqual(["a", "b"]);
  });
});

describe("duplicating", () => {
  it("copies a question after the original with a new key", () => {
    const { def: d, newKey } = duplicateItem(def(), "a2");
    expect(keys(d, "a")).toEqual(["a1", "a2", newKey, "a3"]);
    expect(findItem(d, newKey)!.item.title.en).toBe("A2 (copy)");
  });

  it("copies a section with fresh keys throughout", () => {
    const { def: d, newKey } = duplicateSection(def(), "a");
    expect(d.sections.map((s) => s.key)).toEqual(["a", newKey, "b"]);
    const all = d.sections.flatMap((s) => s.items.map((i) => i.key));
    expect(new Set(all).size).toBe(all.length);
    expect(itemCount(d)).toBe(7);
  });
});

describe("adding and removing", () => {
  it("adds a section and a blank question", () => {
    const s = addSection(def());
    expect(s.def.sections).toHaveLength(3);
    const q = addBlankItem(s.def, s.newKey);
    expect(q.def.sections[2].items[0].title.en).toBe("New question");
    expect(q.def.sections[2].items[0].scale).toBe("s");
  });

  it("deletes questions and sections", () => {
    expect(itemCount(deleteItem(def(), "a1"))).toBe(3);
    expect(deleteSection(def(), "a").sections.map((s) => s.key)).toEqual(["b"]);
  });

  it("renames a section in one language only", () => {
    const d = renameSection(def(), "a", "so", "Qaybta A");
    expect(d.sections[0].title).toEqual({ en: "A", so: "Qaybta A" });
  });
});

describe("labels", () => {
  it("describes a scale by its range", () => {
    expect(itemTypeLabel(def(), item("x") as never)).toBe("Scale 0–5");
    expect(itemTypeLabel(def(), item("x", { type: "yes_no" }) as never)).toBe("Yes / No");
    expect(itemTypeLabel(def(), item("x", { type: "text" }) as never)).toBe("Text");
  });

  it("falls back across languages", () => {
    expect(say({ en: "Hi" }, "so", "en")).toBe("Hi");
    expect(say({ so: "Salaan" }, "en", "en")).toBe("Salaan");
    expect(say(null, "en", "en")).toBe("");
  });
});

describe("question library", () => {
  const other = def();
  other.sections[0].items = [
    item("w1", { title: { en: "Water supply" }, scale: "w" }),
    item("a2"),
  ] as never;
  other.scales = [
    {
      key: "w",
      levels: [
        { value: 1, label: { en: "Low" } },
        { value: 3, label: { en: "High" } },
      ],
    },
  ];

  it("lists each distinct question once, newest form first", () => {
    const lib = collectLibrary([
      { form: "Old", updatedAt: "2026-01-01", def: def() },
      { form: "New", updatedAt: "2026-06-01", def: other },
    ]);
    // a2 appears in both forms with the same wording but a different scale key, so both are kept.
    expect(lib[0].form).toBe("New");
    expect(lib.filter((e) => e.item.title.en === "Water supply")).toHaveLength(1);
    expect(new Set(lib.map((e) => e.id)).size).toBe(lib.length);
  });

  it("matches questions by wording and kind of answer", () => {
    expect(questionId(item("a") as never, "en")).toBe(questionId(item("a") as never, "en"));
    expect(questionId(item("a") as never, "en")).not.toBe(
      questionId(item("a", { type: "text" }) as never, "en")
    );
  });

  it("adds a library question with a new key and brings its scale", () => {
    const entry = collectLibrary([{ form: "New", updatedAt: "2026-06-01", def: other }]).find(
      (e) => e.item.key === "w1"
    )!;
    const { def: d, newKey } = addFromLibrary(def(), entry, "b");
    expect(keys(d, "b")).toEqual(["b1", newKey]);
    expect(d.scales.map((s) => s.key)).toContain("w");
    expect(findItem(d, newKey)!.item.group).toBeUndefined();
  });

  it("does not duplicate a scale the form already has", () => {
    const entry = collectLibrary([{ form: "Self", updatedAt: "2026-06-01", def: def() }])[0];
    const { def: d } = addFromLibrary(def(), entry, "b");
    expect(d.scales).toHaveLength(1);
  });

  it("searches by text", () => {
    expect(matchesQuery("How reliable is the water supply?", "water")).toBe(true);
    expect(matchesQuery("How reliable is the water supply?", "health")).toBe(false);
    expect(matchesQuery("anything", "")).toBe(true);
  });
});
