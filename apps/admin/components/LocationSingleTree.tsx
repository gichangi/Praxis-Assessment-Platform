"use client";
import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/LocationTreePicker";
import { cn } from "@/lib/utils";
import { typeLabel, visibleNodeIds, type Tree, type TreeNode } from "@/lib/assignment-tree";

/**
 * Pick exactly one location from a tree. Only `selectable` ids can be chosen; the rest are
 * shown greyed purely so the path to them is visible.
 */
export function LocationSingleTree({
  tree,
  selectable,
  selectedId,
  onSelect,
}: {
  tree: Tree;
  selectable: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  // Open the path to the selection, plus the top level.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(tree.roots.map((r) => r.id)));
  const visible = useMemo(() => visibleNodeIds(tree, query), [tree, query]);

  const rows = useMemo(() => {
    const out: { node: TreeNode; depth: number }[] = [];
    const walk = (node: TreeNode, depth: number) => {
      if (visible && !visible.has(node.id)) return;
      out.push({ node, depth });
      if (node.children.length && (visible || expanded.has(node.id))) {
        node.children.forEach((c) => walk(c, depth + 1));
      }
    };
    tree.roots.forEach((r) => walk(r, 0));
    return out;
  }, [tree, expanded, visible]);

  const selected = selectedId ? tree.byId.get(selectedId) : undefined;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Search locations" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setExpanded(
              new Set([...tree.byId.values()].filter((n) => n.children.length).map((n) => n.id))
            )
          }
        >
          Expand all
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
          Collapse all
        </Button>
      </div>

      <div
        role="radiogroup"
        aria-label="Location"
        className="max-h-80 overflow-y-auto border-t border-border"
      >
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            {tree.byId.size === 0
              ? "No locations are assigned to you for this form."
              : "No locations match your search."}
          </p>
        )}
        {rows.map(({ node, depth }) => {
          const canPick = selectable.has(node.id);
          const isSelected = node.id === selectedId;
          const hasChildren = node.children.length > 0;
          const open = !!visible || expanded.has(node.id);
          return (
            <div
              key={node.id}
              className={cn(
                "flex items-center gap-2.5 border-b border-border/70 px-4 py-2.5 text-sm last:border-0",
                isSelected && "bg-primary-50"
              )}
            >
              <div
                className="flex min-w-0 flex-1 items-center gap-2.5"
                style={{ paddingInlineStart: depth * 24 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(node.id)}
                    aria-label={`${open ? "Collapse" : "Expand"} ${node.name}`}
                    aria-expanded={open}
                    className="shrink-0 rounded p-0.5 text-muted hover:text-text-main"
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="w-5 shrink-0" aria-hidden="true" />
                )}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={!canPick}
                  disabled={!canPick}
                  onClick={() => onSelect(node.id)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded text-start",
                    canPick ? "cursor-pointer" : "cursor-default text-muted"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      !canPick && "border-transparent",
                      canPick &&
                        (isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface")
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  <span className={cn("truncate", isSelected && "font-semibold")}>{node.name}</span>
                </button>
              </div>
              <span className="hidden text-xs text-muted sm:block">{typeLabel(node.level)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border bg-bg/50 px-4 py-2.5 text-sm">
        {selected ? (
          <span>
            Selected: <strong>{selected.name}</strong>
          </span>
        ) : (
          <span className="text-muted">Choose one location.</span>
        )}
      </div>
    </div>
  );
}
