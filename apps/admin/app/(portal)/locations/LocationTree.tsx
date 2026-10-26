"use client";
import { useState } from "react";
import { ChevronRight, MapPin, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/utils";
import type { LocationRow } from "./page";

function buildTree(locations: LocationRow[]): Map<string | null, LocationRow[]> {
  const map = new Map<string | null, LocationRow[]>();
  for (const loc of locations) {
    const key = loc.parent_id ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(loc);
  }
  return map;
}

function LocationNode({
  loc,
  tree,
  depth,
}: {
  loc: LocationRow;
  tree: Map<string | null, LocationRow[]>;
  depth: number;
}) {
  const children = tree.get(loc.id) ?? [];
  const [open, setOpen] = useState(depth < 1);

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-surface-raised cursor-pointer select-none"
        style={{ paddingInlineStart: `${depth * 20 + 12}px` }}
        onClick={() => children.length > 0 && setOpen((o) => !o)}
      >
        {children.length > 0 ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
          />
        ) : (
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
        )}
        <span className="flex-1 text-sm font-medium text-text-main">
          {t(loc.name)}
        </span>
        <span className="font-mono text-[10px] text-muted">{loc.code}</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          L{loc.level}
        </Badge>
        <Badge variant={loc.active ? "success" : "outline"} className="text-[10px] px-1.5 py-0">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {loc.active ? "Active" : "Inactive"}
        </Badge>
        {children.length > 0 && (
          <span className="text-[10px] text-muted">{children.length} sub</span>
        )}
      </div>
      {open && children.map((child) => (
        <LocationNode key={child.id} loc={child} tree={tree} depth={depth + 1} />
      ))}
    </div>
  );
}

export function LocationTree({ locations }: { locations: LocationRow[] }) {
  const tree = buildTree(locations);
  const roots = tree.get(null) ?? [];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Network className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-text-main">Location hierarchy</span>
      </div>
      <div className="divide-y divide-border/50 py-1">
        {roots.map((root) => (
          <LocationNode key={root.id} loc={root} tree={tree} depth={0} />
        ))}
      </div>
    </div>
  );
}
