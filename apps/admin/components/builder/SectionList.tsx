"use client";
import { useEffect, useRef, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  LayoutList,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addFromLibrary,
  addSection,
  deleteItem,
  deleteSection,
  duplicateItem,
  duplicateSection,
  findItem,
  itemTypeLabel,
  moveItem,
  moveSection,
  nudgeItem,
  nudgeSection,
  renameSection,
  say,
  type BuilderItem,
  type LibraryEntry,
} from "@/lib/builder-ops";

const PREVIEW_COUNT = 4;
const DRAG_ITEM = "application/x-builder-item";
const DRAG_SECTION = "application/x-builder-section";
const DRAG_LIBRARY = "application/x-library";

type Over = { section: string; index: number } | null;

/** Wording in `lang`; italic and muted when it is borrowed from the default language. */
function Wording({
  text,
  lang,
  fallback,
  className,
}: {
  text: Record<string, string> | null | undefined;
  lang: string;
  fallback: string;
  className?: string;
}) {
  const own = text?.[lang]?.trim();
  return (
    <span className={cn(className, !own && lang !== fallback && "italic text-muted")}>
      {own || say(text, lang, fallback)}
    </span>
  );
}

function SectionMenu({
  onMoveUp,
  onMoveDown,
  onDelete,
  disabled,
  name,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  disabled: boolean;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const Row = ({ label, run, danger }: { label: string; run: () => void; danger?: boolean }) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        run();
      }}
      className={cn(
        "block w-full px-3 py-2 text-start text-sm hover:bg-bg",
        danger && "text-red-700"
      )}
    >
      {label}
    </button>
  );

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={`More actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1.5 text-muted hover:bg-bg hover:text-text-main disabled:opacity-40"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          <Row label="Move up" run={onMoveUp} />
          <Row label="Move down" run={onMoveDown} />
          <Row label="Delete section" run={onDelete} danger />
        </div>
      )}
    </div>
  );
}

/**
 * The questionnaire: sections as cards, questions as rows. Reorder by dragging the grip (or with
 * the arrow keys while it is focused), and drop a question from the library onto a section.
 */
export function SectionList({
  def,
  lang,
  selectedKey,
  readOnly,
  onSelect,
  onEdit,
  libraryById,
}: {
  def: FormDefinition;
  lang: string;
  selectedKey: string | null;
  readOnly: boolean;
  onSelect: (key: string) => void;
  /** A new definition, and what to select afterwards (undefined keeps the selection). */
  onEdit: (next: FormDefinition, select?: string | null) => void;
  libraryById: (id: string) => LibraryEntry | undefined;
}) {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [dragKind, setDragKind] = useState<"item" | "section" | "library" | null>(null);
  const [over, setOver] = useState<Over>(null);
  const [overSection, setOverSection] = useState<number | null>(null);

  const toggle = (set: Set<string>, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const kindOf = (e: React.DragEvent) => {
    const types = Array.from(e.dataTransfer.types);
    if (types.includes(DRAG_LIBRARY)) return "library" as const;
    if (types.includes(DRAG_ITEM)) return "item" as const;
    if (types.includes(DRAG_SECTION)) return "section" as const;
    return null;
  };

  function endDrag() {
    setDragKind(null);
    setOver(null);
    setOverSection(null);
  }

  function dropAt(e: React.DragEvent, target: NonNullable<Over>) {
    e.preventDefault();
    e.stopPropagation();
    const kind = kindOf(e);
    if (kind === "item") {
      const key = e.dataTransfer.getData(DRAG_ITEM);
      const from = findItem(def, key);
      let index = target.index;
      if (from && from.section.key === target.section && from.index < index) index -= 1;
      onEdit(moveItem(def, key, target.section, index), key);
    } else if (kind === "library") {
      const entry = libraryById(e.dataTransfer.getData(DRAG_LIBRARY));
      if (entry) {
        const { def: next, newKey } = addFromLibrary(def, entry, target.section, target.index);
        onEdit(next, newKey);
      }
    }
    endDrag();
  }

  function commitRename(key: string) {
    const value = draft.trim();
    if (value) onEdit(renameSection(def, key, lang, value));
    setRenaming(null);
  }

  const DropRow = () => (
    <li
      aria-hidden="true"
      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-primary bg-primary-50/60 text-sm font-medium text-primary-600"
    >
      <Plus className="h-4 w-4" />
      Drop question here
    </li>
  );

  return (
    <div className="space-y-4" onDragEnd={endDrag}>
      {def.sections.map((section, si) => {
        const isOpen = !closed.has(section.key);
        const isOver = over?.section === section.key && dragKind !== "section";
        const showAll =
          expanded.has(section.key) ||
          section.items.length <= PREVIEW_COUNT ||
          section.items.some((i, idx) => idx >= PREVIEW_COUNT && i.key === selectedKey);
        const rows = showAll ? section.items : section.items.slice(0, PREVIEW_COUNT);
        const name = say(section.title, lang, def.default_language);

        return (
          <section
            key={section.key}
            onDragOver={(e) => {
              const kind = kindOf(e);
              if (!kind || readOnly) return;
              e.preventDefault();
              setDragKind(kind);
              if (kind === "section") setOverSection(si);
              else if (over?.section !== section.key)
                setOver({ section: section.key, index: section.items.length });
            }}
            onDrop={(e) => {
              if (readOnly) return;
              const kind = kindOf(e);
              if (kind === "section") {
                e.preventDefault();
                onEdit(moveSection(def, e.dataTransfer.getData(DRAG_SECTION), si));
                endDrag();
              } else if (kind) {
                dropAt(
                  e,
                  over?.section === section.key
                    ? over
                    : { section: section.key, index: section.items.length }
                );
              }
            }}
            className={cn(
              "rounded-2xl border bg-surface transition-colors",
              isOver || overSection === si
                ? "border-dashed border-primary"
                : selectedKey === section.key
                  ? "border-primary/50"
                  : "border-border"
            )}
          >
            <header className="flex items-center gap-2 p-3 ps-2 sm:gap-3">
              <button
                type="button"
                draggable={!readOnly}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_SECTION, section.key);
                  e.dataTransfer.effectAllowed = "move";
                  setDragKind("section");
                }}
                onKeyDown={(e) => {
                  if (readOnly || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
                  e.preventDefault();
                  onEdit(nudgeSection(def, section.key, e.key === "ArrowUp" ? -1 : 1));
                }}
                aria-label={`Move ${name}. Drag, or use the up and down arrow keys.`}
                disabled={readOnly}
                className="cursor-grab rounded p-1 text-border hover:text-muted disabled:cursor-default"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
                {si + 1}
              </span>

              {renaming === section.key ? (
                <input
                  autoFocus
                  value={draft}
                  aria-label="Section name"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(section.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(section.key);
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-primary bg-surface px-3 text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(section.key)}
                    className="min-w-0 truncate text-start text-lg font-semibold"
                  >
                    <Wording text={section.title} lang={lang} fallback={def.default_language} />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      aria-label={`Rename ${name}`}
                      onClick={() => {
                        setDraft(section.title?.[lang] ?? "");
                        setRenaming(section.key);
                      }}
                      className="rounded p-1 text-muted hover:bg-bg hover:text-text-main"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}

              <span className="shrink-0 rounded-full bg-bg px-2.5 py-1 text-xs text-muted">
                {section.items.length} {section.items.length === 1 ? "item" : "items"}
              </span>

              <div className="ms-auto flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label={`Duplicate ${name}`}
                  disabled={readOnly}
                  onClick={() => {
                    const { def: next, newKey } = duplicateSection(def, section.key);
                    onEdit(next, newKey);
                  }}
                  className="rounded p-1.5 text-muted hover:bg-bg hover:text-text-main disabled:opacity-40"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <SectionMenu
                  name={name}
                  disabled={readOnly}
                  onMoveUp={() => onEdit(nudgeSection(def, section.key, -1))}
                  onMoveDown={() => onEdit(nudgeSection(def, section.key, 1))}
                  onDelete={() => onEdit(deleteSection(def, section.key), null)}
                />
                <button
                  type="button"
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${name}`}
                  aria-expanded={isOpen}
                  onClick={() => setClosed((c) => toggle(c, section.key))}
                  className="rounded p-1.5 text-muted hover:bg-bg hover:text-text-main"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </header>

            {isOpen && (
              <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                {section.items.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-8 text-center",
                      isOver ? "border-primary bg-primary-50/60" : "border-border"
                    )}
                  >
                    <LayoutList className="mb-1 h-5 w-5 text-muted" aria-hidden="true" />
                    <p className="text-sm font-semibold">No items yet</p>
                    <p className="text-sm text-muted">
                      Drag a question here, or click + beside a question
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {rows.map((item, i) => (
                      <ItemRow
                        key={item.key}
                        def={def}
                        item={item}
                        index={i}
                        lang={lang}
                        selected={item.key === selectedKey}
                        readOnly={readOnly}
                        before={isOver && over!.index === i ? <DropRow /> : null}
                        onSelect={() => onSelect(item.key)}
                        onDragStart={() => setDragKind("item")}
                        onOver={(e) => {
                          const kind = kindOf(e);
                          if (!kind || kind === "section" || readOnly) return;
                          e.preventDefault();
                          e.stopPropagation();
                          setDragKind(kind);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const index = e.clientY < rect.top + rect.height / 2 ? i : i + 1;
                          if (over?.section !== section.key || over.index !== index)
                            setOver({ section: section.key, index });
                        }}
                        onDrop={(e) =>
                          dropAt(
                            e,
                            over?.section === section.key
                              ? over
                              : { section: section.key, index: i }
                          )
                        }
                        onDuplicate={() => {
                          const { def: next, newKey } = duplicateItem(def, item.key);
                          onEdit(next, newKey);
                        }}
                        onDelete={() => onEdit(deleteItem(def, item.key), null)}
                        onNudge={(dir) => onEdit(nudgeItem(def, item.key, dir))}
                      />
                    ))}
                    {isOver && over!.index >= rows.length && <DropRow />}
                  </ul>
                )}

                {section.items.length > PREVIEW_COUNT && (
                  <button
                    type="button"
                    onClick={() => setExpanded((x) => toggle(x, section.key))}
                    className="mt-3 flex items-center gap-2 px-1 text-sm text-muted hover:text-text-main"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")}
                    />
                    {showAll
                      ? "Show fewer items"
                      : `Show ${section.items.length - PREVIEW_COUNT} more items`}
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            const { def: next, newKey } = addSection(def);
            onEdit(next, newKey);
          }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-semibold text-text-main transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
      )}
    </div>
  );
}

function ItemRow({
  def,
  item,
  index,
  lang,
  selected,
  readOnly,
  before,
  onSelect,
  onDragStart,
  onOver,
  onDrop,
  onDuplicate,
  onDelete,
  onNudge,
}: {
  def: FormDefinition;
  item: BuilderItem;
  index: number;
  lang: string;
  selected: boolean;
  readOnly: boolean;
  before: React.ReactNode;
  onSelect: () => void;
  onDragStart: () => void;
  onOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onNudge: (dir: -1 | 1) => void;
}) {
  const title = say(item.title, lang, def.default_language);
  return (
    <>
      {before}
      <li
        id={`row-${item.key}`}
        draggable={!readOnly}
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_ITEM, item.key);
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragOver={onOver}
        onDrop={onDrop}
        className={cn(
          "group flex items-center gap-2 rounded-xl border bg-surface px-2 py-2 sm:gap-3 sm:px-3",
          selected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
        )}
      >
        <button
          type="button"
          disabled={readOnly}
          onKeyDown={(e) => {
            if (readOnly || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
            e.preventDefault();
            onNudge(e.key === "ArrowUp" ? -1 : 1);
          }}
          aria-label={`Move ${title}. Drag, or use the up and down arrow keys.`}
          className="cursor-grab rounded p-0.5 text-border hover:text-muted disabled:cursor-default"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex min-w-0 flex-1 items-center gap-3 py-1 text-start"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted">
            {index + 1}
          </span>
          <Wording
            text={item.title}
            lang={lang}
            fallback={def.default_language}
            className="min-w-0 flex-1 truncate text-sm"
          />
        </button>
        <span className="hidden shrink-0 rounded-md border border-border bg-bg px-2 py-1 text-xs text-muted sm:inline">
          {itemTypeLabel(def, item)}
        </span>
        {item.required && (
          <span className="hidden shrink-0 text-xs font-medium text-primary-600 sm:inline">
            Required
          </span>
        )}
        <button
          type="button"
          aria-label={`Duplicate ${title}`}
          disabled={readOnly}
          onClick={onDuplicate}
          className="shrink-0 rounded p-1.5 text-muted hover:bg-bg hover:text-text-main disabled:opacity-40"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${title}`}
          disabled={readOnly}
          onClick={onDelete}
          className="shrink-0 rounded p-1.5 text-muted hover:bg-bg hover:text-red-700 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </li>
    </>
  );
}
