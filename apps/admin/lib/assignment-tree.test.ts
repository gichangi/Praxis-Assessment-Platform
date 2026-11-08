import { describe, expect, it } from "vitest";
import {
  allLeafIds,
  assignmentCoverage,
  buildTree,
  checkState,
  compressSelection,
  overlapsSelection,
  selectionAreas,
  toggleNode,
  typeLabel,
  visibleNodeIds,
  withAncestors,
  type LocationInput,
} from "./assignment-tree";

// Puntland > Bari > (Bosaso, Qandala) ; Puntland > Nugaal > (Garowe, Eyl) ; Jubbaland (a leaf root)
const LOCS: LocationInput[] = [
  { id: "puntland", parent_id: null, name: "Puntland", level: 0 },
  { id: "bari", parent_id: "puntland", name: "Bari", level: 1 },
  { id: "nugaal", parent_id: "puntland", name: "Nugaal", level: 1 },
  { id: "bosaso", parent_id: "bari", name: "Bosaso", level: 2 },
  { id: "qandala", parent_id: "bari", name: "Qandala", level: 2 },
  { id: "garowe", parent_id: "nugaal", name: "Garowe", level: 2 },
  { id: "eyl", parent_id: "nugaal", name: "Eyl", level: 2 },
  { id: "jubbaland", parent_id: null, name: "Jubbaland", level: 0 },
];
const tree = buildTree(LOCS);
const node = (id: string) => tree.byId.get(id)!;

describe("buildTree", () => {
  it("nests children and lists the leaves under each node", () => {
    expect(tree.roots.map((r) => r.id)).toEqual(["puntland", "jubbaland"]);
    expect(node("puntland").leafIds.sort()).toEqual(["bosaso", "eyl", "garowe", "qandala"]);
    expect(node("bari").leafIds.sort()).toEqual(["bosaso", "qandala"]);
    expect(node("jubbaland").leafIds).toEqual(["jubbaland"]);
  });

  it("treats a location whose parent is missing as a top-level one", () => {
    const t = buildTree([{ id: "x", parent_id: "gone", name: "X", level: 1 }]);
    expect(t.roots.map((r) => r.id)).toEqual(["x"]);
  });

  it("lists every leaf once", () => {
    expect(allLeafIds(tree).sort()).toEqual(["bosaso", "eyl", "garowe", "jubbaland", "qandala"]);
  });
});

describe("selection state", () => {
  it("is partly checked when only some leaves are", () => {
    const sel = new Set(["bosaso"]);
    expect(checkState(node("bari"), sel)).toBe("some");
    expect(checkState(node("puntland"), sel)).toBe("some");
    expect(checkState(node("nugaal"), sel)).toBe("none");
  });

  it("checks a parent once all its leaves are", () => {
    expect(checkState(node("bari"), new Set(["bosaso", "qandala"]))).toBe("all");
  });

  it("toggling a parent selects all its leaves, then clears them", () => {
    const on = toggleNode(node("bari"), new Set());
    expect([...on].sort()).toEqual(["bosaso", "qandala"]);
    expect(toggleNode(node("bari"), on).size).toBe(0);
  });

  it("toggling a partly checked parent completes it rather than clearing it", () => {
    const next = toggleNode(node("bari"), new Set(["bosaso"]));
    expect(checkState(node("bari"), next)).toBe("all");
  });
});

describe("compressSelection", () => {
  it("uses a region instead of each of its districts", () => {
    const r = compressSelection(tree, new Set(["bosaso", "qandala"]));
    expect(r).toEqual({ all: false, locationIds: ["bari"] });
  });

  it("keeps individual districts when the region is only partly selected", () => {
    const r = compressSelection(tree, new Set(["bosaso", "garowe", "eyl"]));
    expect(r.locationIds.sort()).toEqual(["bosaso", "nugaal"]);
  });

  it("collapses to one level up where everything beneath is selected", () => {
    const r = compressSelection(tree, new Set(["bosaso", "qandala", "garowe", "eyl"]));
    expect(r.locationIds).toEqual(["puntland"]);
  });

  it("means everywhere only when every top-level location is fully selected", () => {
    expect(compressSelection(tree, new Set(allLeafIds(tree))).all).toBe(true);
    expect(compressSelection(tree, new Set(["bosaso", "qandala", "garowe", "eyl"])).all).toBe(
      false
    );
  });

  it("is empty for no selection", () => {
    expect(compressSelection(tree, new Set())).toEqual({ all: false, locationIds: [] });
  });
});

describe("visibleNodeIds", () => {
  it("shows everything when there is no query", () => {
    expect(visibleNodeIds(tree, "  ")).toBeNull();
  });

  it("shows a match with its ancestors, and a matching region with its districts", () => {
    expect([...visibleNodeIds(tree, "garowe")!].sort()).toEqual(["garowe", "nugaal", "puntland"]);
    expect([...visibleNodeIds(tree, "bari")!].sort()).toEqual([
      "bari",
      "bosaso",
      "puntland",
      "qandala",
    ]);
  });

  it("ignores case", () => {
    expect(visibleNodeIds(tree, "JUBBA")!.has("jubbaland")).toBe(true);
  });
});

describe("people and areas", () => {
  const sel = new Set(["bosaso", "garowe"]);

  it("a person with access everywhere always overlaps", () => {
    expect(overlapsSelection([null], tree, sel)).toBe(true);
  });

  it("a person overlaps when their area contains a selected district", () => {
    expect(overlapsSelection(["bari"], tree, sel)).toBe(true);
    expect(overlapsSelection(["bosaso"], tree, sel)).toBe(true);
  });

  it("a person elsewhere does not overlap", () => {
    expect(overlapsSelection(["jubbaland"], tree, sel)).toBe(false);
    expect(overlapsSelection(["qandala"], tree, sel)).toBe(false);
  });

  it("names the areas the selection sits in", () => {
    expect(selectionAreas(tree, sel).sort()).toEqual(["Bari", "Nugaal"]);
    expect(selectionAreas(tree, new Set(["jubbaland"]))).toEqual(["Jubbaland"]);
  });

  it("labels levels", () => {
    expect(typeLabel(0)).toBe("Region");
    expect(typeLabel(1)).toBe("District");
    expect(typeLabel(5)).toBe("Level 6");
  });
});

describe("assignmentCoverage", () => {
  it("counts the districts a region covers and the distinct users", () => {
    const c = assignmentCoverage(tree, [
      { location_id: "bari", user_id: "u1" },
      { location_id: "bari", user_id: "u2" },
      { location_id: "garowe", user_id: "u1" },
    ]);
    expect(c).toEqual({ locations: 3, allLocations: false, users: 2, allUsers: false });
  });

  it("treats a missing location or user as everyone", () => {
    const c = assignmentCoverage(tree, [{ location_id: null, user_id: null }]);
    expect(c.allLocations && c.allUsers).toBe(true);
    expect(c.locations).toBe(5);
  });

  it("handles a single assignment and nothing assigned", () => {
    expect(assignmentCoverage(tree, [{ location_id: "eyl", user_id: "u1" }])).toEqual({
      locations: 1,
      allLocations: false,
      users: 1,
      allUsers: false,
    });
    expect(assignmentCoverage(tree, [])).toEqual({
      locations: 0,
      allLocations: false,
      users: 0,
      allUsers: false,
    });
  });
});

describe("withAncestors", () => {
  it("keeps allowed locations and the path above them, and nothing else", () => {
    const kept = withAncestors(LOCS, new Set(["garowe", "jubbaland"]));
    expect(kept.map((l) => l.id).sort()).toEqual(["garowe", "jubbaland", "nugaal", "puntland"]);
  });

  it("returns an empty list when nothing is allowed", () => {
    expect(withAncestors(LOCS, new Set())).toEqual([]);
  });

  it("ignores allowed ids that don't exist", () => {
    expect(withAncestors(LOCS, new Set(["nowhere"]))).toEqual([]);
  });
});
