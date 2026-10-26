"use client";
import type { FormDefinition } from "@assessment/core";
import { ChevronRight, ChevronDown, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/utils";

type Props = {
  def: FormDefinition;
  selectedKey: string | null;
  onSelect: (type: "section" | "item", key: string) => void;
  onAddSection: () => void;
  onAddItem: (sectionKey: string) => void;
  onDelete: (type: "section" | "item", key: string) => void;
  readOnly?: boolean;
};

export function Outline({
  def,
  selectedKey,
  onSelect,
  onAddSection,
  onAddItem,
  onDelete,
  readOnly = false,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Structure</span>
        <Button
          disabled={readOnly}
          size="sm"
          variant="ghost"
          onClick={onAddSection}
          title="Add section"
          aria-label="Add section"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {!def.sections.length && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium">Start with a section</p>
            <p className="mt-2 text-xs leading-6 text-muted">
              Group related questions to make your questionnaire easy to follow.
            </p>
            {!readOnly && (
              <Button size="sm" variant="outline" className="mt-4" onClick={onAddSection}>
                <Plus className="h-3.5 w-3.5" />
                Add section
              </Button>
            )}
          </div>
        )}
        {def.sections.map((sec) => {
          const open = !collapsed.has(sec.key);
          return (
            <div key={sec.key}>
              {/* Section row */}
              <div
                className={cn(
                  "group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-bg rounded mx-1",
                  selectedKey === sec.key && "bg-primary/10 text-primary"
                )}
                onClick={() => onSelect("section", sec.key)}
              >
                <button
                  aria-label={`${open ? "Collapse" : "Expand"} ${t(sec.title as Record<string, string>)}`}
                  aria-expanded={open}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(sec.key);
                  }}
                  className="shrink-0"
                >
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  )}
                </button>
                <button
                  type="button"
                  aria-pressed={selectedKey === sec.key}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect("section", sec.key);
                  }}
                  className="min-w-0 flex-1 truncate py-2 text-left text-xs font-medium"
                >
                  {t(sec.title as Record<string, string>)}
                </button>
                <span className="text-xs text-muted shrink-0">{sec.items.length}</span>
                <button
                  disabled={readOnly}
                  aria-label={`Delete ${t(sec.title as Record<string, string>)} section`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete("section", sec.key);
                  }}
                  className="ms-1 p-1 text-muted opacity-50 transition-opacity hover:text-red-600 group-focus-within:opacity-100 group-hover:opacity-100 disabled:hidden"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Items */}
              {open && (
                <div className="ms-6">
                  {sec.items.map((it) => (
                    <div
                      key={it.key}
                      className={cn(
                        "group flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-bg rounded mx-1",
                        selectedKey === it.key && "bg-primary/10 text-primary"
                      )}
                      onClick={() => onSelect("item", it.key)}
                    >
                      <FileText className="h-3 w-3 shrink-0 text-muted" />
                      <button
                        type="button"
                        aria-pressed={selectedKey === it.key}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect("item", it.key);
                        }}
                        className="min-w-0 flex-1 truncate py-2 text-left text-xs"
                      >
                        {t(it.title as Record<string, string>)}
                      </button>
                      <span className="text-[10px] text-muted bg-bg rounded px-1">{it.type}</span>
                      <button
                        disabled={readOnly}
                        aria-label={`Delete ${t(it.title as Record<string, string>)} question`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete("item", it.key);
                        }}
                        className="p-1 text-muted opacity-50 transition-opacity hover:text-red-600 group-focus-within:opacity-100 group-hover:opacity-100 disabled:hidden"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    disabled={readOnly}
                    onClick={() => onAddItem(sec.key)}
                    className="flex items-center gap-1 px-2 py-2 text-xs text-muted transition-colors hover:text-primary disabled:hidden"
                  >
                    <Plus className="h-3 w-3" />
                    Add item
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
