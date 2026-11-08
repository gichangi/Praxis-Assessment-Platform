"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Globe, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  allLeafIds,
  checkState,
  toggleNode,
  typeLabel,
  visibleNodeIds,
  type CheckState,
  type Tree,
  type TreeNode,
} from "@/lib/assignment-tree";

export function TriCheckbox({
  state,
  onChange,
  label,
}: {
  state: CheckState;
  onChange: () => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "some";
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={state === "all"}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
    />
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-[10rem] flex-1">
      <Search
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ps-9"
      />
    </div>
  );
}

export function PickerFooter({
  children,
  onSelectAll,
  onClear,
}: {
  children: React.ReactNode;
  onSelectAll?: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
      <span>{children}</span>
      <span className="flex gap-4 font-semibold text-primary-600">
        {onSelectAll && (
          <button type="button" onClick={onSelectAll} className="hover:underline">
            Select all
          </button>
        )}
        <button type="button" onClick={onClear} className="hover:underline">
          Clear
        </button>
      </span>
    </div>
  );
}

const GRID = "grid-cols-[minmax(0,1fr)_4.5rem] xl:grid-cols-[minmax(0,1fr)_6rem_5rem]";

/**
 * Search, expand/collapse and a checkable location tree. Ticking a region ticks every
 * district inside it. The selection (a set of leaf ids) is owned by the caller.
 */
export function LocationTreePicker({
  tree,
  selected,
  onChange,
  allRow = false,
}: {
  tree: Tree;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Pin an "All locations" row under the tree that ticks everything (and includes future locations). */
  allRow?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(tree.roots.map((r) => r.id)));
  const totalLeaves = useMemo(() => allLeafIds(tree).length, [tree]);
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

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Search regions and districts" />
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
        className={cn(
          "grid gap-2 border-y border-border bg-bg/80 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted",
          GRID
        )}
      >
        <span>Location</span>
        <span className="hidden xl:block">Type</span>
        <span className="text-right">Selected</span>
      </div>
      <div className="max-h-[26rem] overflow-y-auto">
        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">
            {tree.byId.size === 0
              ? "No locations yet. Add some first."
              : "No locations match your search."}
          </p>
        )}
        {rows.map(({ node, depth }) => {
          const state = checkState(node, selected);
          const count = node.leafIds.filter((id) => selected.has(id)).length;
          const hasChildren = node.children.length > 0;
          const open = !!visible || expanded.has(node.id);
          return (
            <div
              key={node.id}
              className={cn(
                "grid items-center gap-2 border-b border-border/70 px-5 py-2.5 text-sm last:border-0",
                GRID,
                state === "all" && "bg-primary-50/60"
              )}
            >
              <div
                className="flex min-w-0 items-center gap-2.5"
                style={{ paddingInlineStart: depth * 28 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(node.id)}
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
                <TriCheckbox
                  state={state}
                  label={`Select ${node.name}`}
                  onChange={() => onChange(toggleNode(node, selected))}
                />
                <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <span className={cn("truncate", hasChildren && "font-medium")}>{node.name}</span>
              </div>
              <span className="hidden text-xs text-muted xl:block">{typeLabel(node.level)}</span>
              <span className="text-right text-xs tabular-nums text-muted">
                {hasChildren ? `${count} / ${node.leafIds.length}` : ""}
              </span>
            </div>
          );
        })}
      </div>
      {allRow && (
        <div
          className={cn(
            "grid items-center gap-2 border-t border-border bg-bg/60 px-5 py-3 text-sm",
            GRID
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="w-5 shrink-0" aria-hidden="true" />
            <TriCheckbox
              state={
                totalLeaves > 0 && selected.size === totalLeaves
                  ? "all"
                  : selected.size > 0
                    ? "some"
                    : "none"
              }
              label="All locations"
              onChange={() =>
                onChange(selected.size === totalLeaves ? new Set() : new Set(allLeafIds(tree)))
              }
            />
            <Globe className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate font-semibold">All locations</span>
          </div>
          <span className="hidden xl:block" />
          <span className="text-right text-xs tabular-nums text-muted">
            {selected.size} / {totalLeaves}
          </span>
        </div>
      )}
      <PickerFooter
        onSelectAll={allRow ? undefined : () => onChange(new Set(allLeafIds(tree)))}
        onClear={() => onChange(new Set())}
      >
        <strong>{selected.size}</strong> of {totalLeaves} locations selected
      </PickerFooter>
    </>
  );
}
