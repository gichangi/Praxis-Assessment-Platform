"use client";
import { useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BLANK,
  choiceLevels,
  hotkeyFor,
  isChoice,
  localize,
  type AnswerState,
  type DefItem,
} from "@/lib/assessment-entry";

const TEXTAREA =
  "flex min-h-[88px] w-full rounded border border-border bg-surface px-3.5 py-2.5 text-sm text-text-main transition-colors placeholder:text-muted/80 hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

/** One question: its prompt and the right input for its type. */
export function ItemField({
  def,
  item,
  number,
  lang,
  answer,
  readOnly = false,
  onChange,
}: {
  def: FormDefinition;
  item: DefItem;
  number: number;
  lang: string;
  answer: AnswerState | undefined;
  readOnly?: boolean;
  onChange: (next: AnswerState) => void;
}) {
  const a = answer ?? BLANK;
  const [noteOpen, setNoteOpen] = useState(a.note !== "");
  const fallback = def.default_language;
  const title = localize(item.title, lang, fallback);
  const guidance = localize(item.guidance, lang, fallback);
  const prompt = localize(item.prompt, lang, fallback);

  const canSkip = isChoice(item) || item.type === "number";

  const header = (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
        {number}
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-base font-semibold leading-snug">
          {title}
          {item.required && (
            <span className="ms-1 text-red-600" title="Required" aria-label="required">
              *
            </span>
          )}
        </p>
        {guidance && <p className="mt-1.5 text-sm leading-relaxed text-muted">{guidance}</p>}
        {prompt && <p className="mt-1 text-sm italic text-muted">{prompt}</p>}
      </div>
    </div>
  );

  // Viewing only: show what was answered, not the controls.
  if (readOnly) {
    const level = isChoice(item) ? choiceLevels(def, item).find((l) => l.value === a.value) : null;
    const levelLabel = level ? localize(level.label, lang, fallback) : "";
    const levelText = level
      ? item.type === "yes_no"
        ? levelLabel
        : `${level.value} · ${levelLabel}`
      : "";
    const levelNote = level ? localize(level.description, lang, fallback) : "";
    const typed = item.type === "text" ? a.note.trim() : "";
    const extraNote = item.type === "text" ? "" : a.note.trim();
    return (
      <div id={`item-${item.key}`} className="scroll-mt-4 space-y-4 px-5 py-5 sm:px-6">
        {header}
        <div className="space-y-3 sm:ps-11">
          {a.notAssessed ? (
            <p className="text-sm italic text-muted">Not assessed</p>
          ) : level ? (
            <div className="rounded-lg border border-primary bg-primary-50 px-3.5 py-2.5 text-sm">
              <span className="font-semibold">{levelText}</span>
              {levelNote && (
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{levelNote}</span>
              )}
            </div>
          ) : item.type === "number" && a.value != null ? (
            <p className="text-sm font-semibold">
              {a.value}
              {item.unit ? ` ${item.unit}` : ""}
            </p>
          ) : typed ? (
            <p className="whitespace-pre-wrap text-sm">{typed}</p>
          ) : item.type === "photo" || item.type === "gps" ? (
            <p className="text-sm text-muted">Captured in the mobile app.</p>
          ) : (
            <p className="text-sm text-muted">Not answered</p>
          )}
          {extraNote && (
            <p className="whitespace-pre-wrap rounded-md bg-bg px-3 py-2 text-xs text-muted">
              <span className="font-medium text-text-main">Note: </span>
              {extraNote}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id={`item-${item.key}`} className="scroll-mt-4 space-y-4 px-5 py-5 sm:px-6">
      {header}

      <div className="space-y-4 sm:ps-11">
        {isChoice(item) && (
          <div
            role="radiogroup"
            aria-label={title}
            className={cn(
              item.type === "yes_no" ? "grid max-w-xs grid-cols-2 gap-2" : "grid gap-2",
              a.notAssessed && "opacity-50"
            )}
          >
            {choiceLevels(def, item).map((level) => {
              const selected = !a.notAssessed && a.value === level.value;
              const label =
                localize(level.label, lang, fallback) || localize(level.label, "en", "en");
              const description = localize(level.description, lang, fallback);
              const hotkey = hotkeyFor(item, level);
              return (
                <label
                  key={level.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    selected ? "border-primary bg-primary-50" : "border-border hover:bg-bg/60",
                    a.notAssessed && "cursor-not-allowed"
                  )}
                >
                  <input
                    type="radio"
                    name={item.key}
                    checked={selected}
                    disabled={a.notAssessed}
                    onChange={() => onChange({ ...a, value: level.value, notAssessed: false })}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">
                      {item.type === "yes_no" ? label : `${level.value} · ${label}`}
                    </span>
                    {description && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {description}
                      </span>
                    )}
                  </span>
                  {hotkey && (
                    <kbd
                      aria-hidden="true"
                      className="shrink-0 rounded border border-border bg-bg px-1.5 text-[11px] leading-5 text-muted"
                    >
                      {hotkey}
                    </kbd>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {item.type === "number" && (
          <div className="flex max-w-xs items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              min={item.min}
              max={item.max}
              aria-label={title}
              disabled={a.notAssessed}
              value={a.value ?? ""}
              onChange={(e) =>
                onChange({
                  ...a,
                  value: e.target.value === "" ? null : Number(e.target.value),
                  notAssessed: false,
                })
              }
            />
            {item.unit && <span className="text-sm text-muted">{item.unit}</span>}
          </div>
        )}

        {item.type === "text" &&
          (item.multiline === false ? (
            <Input
              aria-label={title}
              value={a.note}
              onChange={(e) => onChange({ ...a, note: e.target.value, notAssessed: false })}
              placeholder="Type your answer"
            />
          ) : (
            <textarea
              aria-label={title}
              className={TEXTAREA}
              value={a.note}
              onChange={(e) => onChange({ ...a, note: e.target.value, notAssessed: false })}
              placeholder="Type your answer"
            />
          ))}

        {(item.type === "photo" || item.type === "gps") && (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted">
            {item.type === "photo" ? "Photos" : "GPS location"} are captured in the mobile app.
          </p>
        )}

        {canSkip && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={a.notAssessed}
                onChange={(e) =>
                  onChange({
                    ...a,
                    notAssessed: e.target.checked,
                    value: e.target.checked ? null : a.value,
                  })
                }
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              Not assessed
            </label>
            {!noteOpen && (
              <button
                type="button"
                onClick={() => setNoteOpen(true)}
                className="font-medium text-primary-600 hover:underline"
              >
                Add a note
              </button>
            )}
          </div>
        )}

        {canSkip && noteOpen && (
          <textarea
            aria-label={`Note for: ${title}`}
            className={cn(TEXTAREA, "min-h-[64px]")}
            value={a.note}
            onChange={(e) => onChange({ ...a, note: e.target.value })}
            placeholder="Add a note for this item"
          />
        )}
      </div>
    </div>
  );
}
