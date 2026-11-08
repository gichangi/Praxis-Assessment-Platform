/**
 * Selection logic for the "choose locations" tree.
 *
 * The unit of selection is a leaf (a location with nothing beneath it). A parent is
 * checked when all its leaves are, and partly checked when only some are. When saving,
 * the selection is compressed into the fewest assignments that mean the same thing,
 * because assigning a location already covers everything inside it.
 */

export type LocationInput = {
  id: string;
  parent_id: string | null;
  name: string;
  level: number;
};

export type TreeNode = {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  children: TreeNode[];
  /** The leaves at or beneath this node (just itself for a leaf). */
  leafIds: string[];
};

export type Tree = { roots: TreeNode[]; byId: Map<string, TreeNode> };
export type CheckState = "all" | "some" | "none";

export function buildTree(locations: LocationInput[]): Tree {
  const byId = new Map<string, TreeNode>();
  for (const l of locations) {
    byId.set(l.id, {
      id: l.id,
      name: l.name,
      level: l.level,
      parentId: null,
      children: [],
      leafIds: [],
    });
  }
  const roots: TreeNode[] = [];
  for (const l of locations) {
    const node = byId.get(l.id)!;
    const parent = l.parent_id ? byId.get(l.parent_id) : undefined;
    if (parent && parent !== node) {
      node.parentId = parent.id;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const seen = new Set<string>();
  const fill = (node: TreeNode): string[] => {
    if (seen.has(node.id)) return node.leafIds;
    seen.add(node.id);
    node.leafIds = node.children.length ? node.children.flatMap(fill) : [node.id];
    return node.leafIds;
  };
  roots.forEach(fill);
  return { roots, byId };
}

export function checkState(node: TreeNode, selected: Set<string>): CheckState {
  const n = node.leafIds.filter((id) => selected.has(id)).length;
  if (n === 0) return "none";
  return n === node.leafIds.length ? "all" : "some";
}

/** Fully checked → clear its leaves; otherwise (none or partly) → check them all. */
export function toggleNode(node: TreeNode, selected: Set<string>): Set<string> {
  const next = new Set(selected);
  if (checkState(node, selected) === "all") node.leafIds.forEach((id) => next.delete(id));
  else node.leafIds.forEach((id) => next.add(id));
  return next;
}

export function allLeafIds(tree: Tree): string[] {
  return tree.roots.flatMap((r) => r.leafIds);
}

/**
 * The fewest locations that mean exactly this selection. When every top-level location is
 * fully selected the answer is "everywhere" (`all`), which also covers locations added later.
 */
export function compressSelection(
  tree: Tree,
  selected: Set<string>
): { all: boolean; locationIds: string[] } {
  if (tree.roots.length > 0 && tree.roots.every((r) => checkState(r, selected) === "all")) {
    return { all: true, locationIds: [] };
  }
  const out: string[] = [];
  const walk = (node: TreeNode) => {
    const state = checkState(node, selected);
    if (state === "all") out.push(node.id);
    else if (state === "some") node.children.forEach(walk);
  };
  tree.roots.forEach(walk);
  return { all: false, locationIds: out };
}

/**
 * Ids to show while searching: every match with its ancestors (so the path is visible)
 * and its descendants (so a matching region still shows its districts). Null = no filter.
 */
export function visibleNodeIds(tree: Tree, query: string): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const visible = new Set<string>();
  const addDown = (node: TreeNode) => {
    visible.add(node.id);
    node.children.forEach(addDown);
  };
  for (const node of tree.byId.values()) {
    if (!node.name.toLowerCase().includes(q)) continue;
    addDown(node);
    for (
      let up = node.parentId ? tree.byId.get(node.parentId) : undefined;
      up;
      up = up.parentId ? tree.byId.get(up.parentId) : undefined
    ) {
      visible.add(up.id);
    }
  }
  return visible;
}

/** Whether a person whose access is `scopeIds` (null = every location) can work in the selection. */
export function overlapsSelection(
  scopeIds: (string | null)[],
  tree: Tree,
  selected: Set<string>
): boolean {
  return scopeIds.some((scope) => {
    if (scope === null) return true;
    const node = tree.byId.get(scope);
    return !!node && node.leafIds.some((id) => selected.has(id));
  });
}

/** Names of the areas the selected leaves sit in (their parent, or themselves at the top level). */
export function selectionAreas(tree: Tree, selected: Set<string>): string[] {
  const names = new Set<string>();
  for (const id of selected) {
    const node = tree.byId.get(id);
    if (!node) continue;
    const parent = node.parentId ? tree.byId.get(node.parentId) : undefined;
    names.add((parent ?? node).name);
  }
  return [...names];
}

const TYPE_LABELS = ["Region", "District", "Sub-district"];
export function typeLabel(level: number): string {
  return TYPE_LABELS[level] ?? `Level ${level + 1}`;
}

export type Coverage = {
  /** Districts (leaf locations) the form is assigned to. */
  locations: number;
  allLocations: boolean;
  users: number;
  allUsers: boolean;
};

/** What a set of assignments adds up to: how many locations and people can start the form. */
export function assignmentCoverage(
  tree: Tree,
  rows: { location_id: string | null; user_id: string | null }[]
): Coverage {
  const allLocations = rows.some((r) => r.location_id === null);
  const allUsers = rows.some((r) => r.user_id === null);
  const leaves = new Set<string>();
  const users = new Set<string>();
  for (const r of rows) {
    if (r.location_id) tree.byId.get(r.location_id)?.leafIds.forEach((id) => leaves.add(id));
    if (r.user_id) users.add(r.user_id);
  }
  return {
    locations: allLocations ? allLeafIds(tree).length : leaves.size,
    allLocations,
    users: users.size,
    allUsers,
  };
}

/**
 * The allowed locations plus all their ancestors, so a tree built from the result stays
 * connected. Ancestors are for navigation only; callers decide which ids are selectable.
 */
export function withAncestors(locations: LocationInput[], allowed: Set<string>): LocationInput[] {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const keep = new Set<string>();
  for (const id of allowed) {
    for (
      let cur = byId.get(id);
      cur && !keep.has(cur.id);
      cur = cur.parent_id ? byId.get(cur.parent_id) : undefined
    ) {
      keep.add(cur.id);
    }
  }
  return locations.filter((l) => keep.has(l.id));
}
