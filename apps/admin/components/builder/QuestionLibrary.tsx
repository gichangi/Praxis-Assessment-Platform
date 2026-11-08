"use client";
import { useMemo, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { Check, GripVertical, Info, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { itemTypeLabel, matchesQuery, questionId, say, type LibraryEntry } from "@/lib/builder-ops";

/** Every question you can reuse: this form's own, and those from your other forms. */
export function QuestionLibrary({
  def,
  lang,
  library,
  readOnly,
  onNew,
  onAdd,
  onSelectItem,
}: {
  def: FormDefinition;
  lang: string;
  library: LibraryEntry[];
  readOnly: boolean;
  onNew: () => void;
  onAdd: (entry: LibraryEntry) => void;
  onSelectItem: (key: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "az">("recent");

  // Which questions this form already has, and where.
  const inForm = useMemo(() => {
    const map = new Map<string, { section: string; key: string }>();
    for (const section of def.sections)
      for (const item of section.items) {
        const id = questionId(item, def.default_language);
        if (!map.has(id))
          map.set(id, {
            section: say(section.title, lang, def.default_language),
            key: item.key,
          });
      }
    return map;
  }, [def, lang]);

  const shown = useMemo(() => {
    const text = (e: LibraryEntry) => say(e.item.title, lang, def.default_language);
    const rows = library.filter((e) => matchesQuery(text(e), query));
    return sort === "az" ? [...rows].sort((a, b) => text(a).localeCompare(text(b))) : rows;
  }, [library, query, sort, lang, def.default_language]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">Questions</h2>
        <Button type="button" variant="outline" size="sm" onClick={onNew} disabled={readOnly}>
          <Plus className="h-3.5 w-3.5" />
          New question
        </Button>
      </div>

      <div className="space-y-2 px-4 pb-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search questions"
            placeholder="Search questions"
            className="h-10 w-full rounded-lg border border-border bg-surface ps-9 pe-3 text-sm placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span aria-live="polite">
            {shown.length} of {library.length} questions
          </span>
          <button
            type="button"
            onClick={() => setSort((s) => (s === "recent" ? "az" : "recent"))}
            className="hover:text-text-main"
          >
            Sort: {sort === "recent" ? "Recent" : "A–Z"}
          </button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-3">
        {shown.map((entry) => {
          const here = inForm.get(entry.qid);
          return (
            <li
              key={entry.id}
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData("application/x-library", entry.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className={cn(
                "flex gap-2 rounded-xl border bg-surface p-3",
                here ? "border-border bg-bg/60" : "border-border hover:border-primary/40"
              )}
            >
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-border" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm leading-snug">
                  {say(entry.item.title, lang, def.default_language)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-md border border-border bg-bg px-1.5 py-0.5 text-muted">
                    {itemTypeLabel(def, entry.item)}
                  </span>
                  <span className="text-muted">
                    {here ? `in ${here.section}` : `from ${entry.form}`}
                  </span>
                </div>
              </div>
              {here ? (
                <button
                  type="button"
                  onClick={() => onSelectItem(here.key)}
                  aria-label="Already in this form. Show it."
                  title="Already in this form"
                  className="mt-0.5 h-6 w-6 shrink-0 text-primary"
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd(entry)}
                  disabled={readOnly}
                  aria-label="Add to the selected section"
                  title="Add to the selected section"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="py-10 text-center text-sm text-muted">No questions match your search.</li>
        )}
      </ul>

      <p className="m-4 mt-1 flex gap-2 rounded-xl border border-border bg-bg/60 p-3 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Drag a question onto a section, or click + to add it to the selected section.
      </p>
    </div>
  );
}
