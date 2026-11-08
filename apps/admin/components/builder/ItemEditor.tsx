"use client";
import { useEffect, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_NAMES } from "@/components/assessment/setup";
import { findItem, renameSection } from "@/lib/builder-ops";

type Item = FormDefinition["sections"][number]["items"][number];

type Props = {
  def: FormDefinition;
  selectedKey: string | null;
  /** The language the wording is edited in. */
  lang: string;
  onChange: (updatedDef: FormDefinition) => void;
};

const ITEM_TYPES: { value: Item["type"]; label: string }[] = [
  { value: "scale", label: "Scale" },
  { value: "yes_no", label: "Yes / No" },
  { value: "single_choice", label: "Single choice" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "photo", label: "Photo" },
  { value: "gps", label: "GPS" },
];

const LABEL = "mb-1.5 block text-xs font-medium text-muted";
const TEXTAREA =
  "flex min-h-[72px] w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Details of the selected section or question. */
export function ItemEditor({ def, selectedKey, lang, onChange }: Props) {
  const section = def.sections.find((s) => s.key === selectedKey);
  const found = findItem(def, selectedKey);

  if (!selectedKey || (!section && !found)) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-8 text-center text-sm">
        <p className="font-medium">Make each question count.</p>
        <p className="mt-2 max-w-xs text-xs leading-6 text-muted">
          Select a section or question to see and change its details here.
        </p>
      </div>
    );
  }
  if (section)
    return <SectionEditor def={def} sectionKey={section.key} lang={lang} onChange={onChange} />;
  return <ItemFieldEditor def={def} item={found!.item} lang={lang} onChange={onChange} />;
}

function Heading({ lang, def, children }: { lang: string; def: FormDefinition; children: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{children}</h3>
      {lang !== def.default_language && (
        <p className="mt-1 text-xs text-muted">Writing in {LANGUAGE_NAMES[lang] ?? lang}.</p>
      )}
    </div>
  );
}

function SectionEditor({
  def,
  sectionKey,
  lang,
  onChange,
}: {
  def: FormDefinition;
  sectionKey: string;
  lang: string;
  onChange: (d: FormDefinition) => void;
}) {
  const section = def.sections.find((s) => s.key === sectionKey)!;
  const [title, setTitle] = useState(section.title?.[lang] ?? "");
  useEffect(() => {
    setTitle(section.title?.[lang] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey, lang]);

  return (
    <div className="space-y-5 p-5">
      <Heading lang={lang} def={def}>
        Section
      </Heading>
      <div>
        <label className={LABEL} htmlFor="section-title">
          Name
        </label>
        <Input
          id="section-title"
          value={title}
          placeholder={section.title?.[def.default_language]}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() =>
            title.trim() && onChange(renameSection(def, sectionKey, lang, title.trim()))
          }
        />
      </div>
      <p className="text-xs text-muted">
        Key: <code className="rounded bg-bg px-1">{section.key}</code>
      </p>
    </div>
  );
}

function ItemFieldEditor({
  def,
  item,
  lang,
  onChange,
}: {
  def: FormDefinition;
  item: Item;
  lang: string;
  onChange: (d: FormDefinition) => void;
}) {
  const [title, setTitle] = useState(item.title?.[lang] ?? "");
  const [guidance, setGuidance] = useState(item.guidance?.[lang] ?? "");
  const [weight, setWeight] = useState(String(item.weight ?? 1));

  useEffect(() => {
    setTitle(item.title?.[lang] ?? "");
    setGuidance(item.guidance?.[lang] ?? "");
    setWeight(String(item.weight ?? 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key, lang]);

  /** Apply `edit` to this question inside a copy of the definition. */
  function update(edit: (it: Item) => void) {
    const next = structuredClone(def);
    const it = findItem(next, item.key)!.item;
    edit(it);
    onChange(next);
  }

  function saveWording() {
    update((it) => {
      const t = title.trim();
      // Never leave the default-language wording empty.
      if (t || lang !== def.default_language) {
        const copy = { ...it.title };
        if (t) copy[lang] = t;
        else delete copy[lang];
        it.title = copy;
      }
      const g = guidance.trim();
      const guide = { ...(it.guidance ?? {}) };
      if (g) guide[lang] = g;
      else delete guide[lang];
      it.guidance = Object.keys(guide).length ? guide : undefined;
      it.weight = parseFloat(weight) || 1;
    });
  }

  return (
    <div className="space-y-5 p-5">
      <Heading lang={lang} def={def}>
        Question
      </Heading>

      <div>
        <label className={LABEL} htmlFor="item-title">
          Question
        </label>
        <Input
          id="item-title"
          value={title}
          placeholder={item.title?.[def.default_language]}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveWording}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="item-guidance">
          Guidance
        </label>
        <textarea
          id="item-guidance"
          className={TEXTAREA}
          value={guidance}
          placeholder={item.guidance?.[def.default_language] ?? undefined}
          onChange={(e) => setGuidance(e.target.value)}
          onBlur={saveWording}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Answer type</label>
          <Select
            value={item.type}
            onValueChange={(v) =>
              update((it) => {
                it.type = v as Item["type"];
                it.scale =
                  it.type === "scale" ? (it.scale ?? def.scales[0]?.key ?? undefined) : undefined;
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {item.type === "scale" && (
          <div>
            <label className={LABEL}>Scale</label>
            <Select
              value={item.scale ?? ""}
              onValueChange={(v) => update((it) => void (it.scale = v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {def.scales.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Required</p>
            <p className="text-xs text-muted">
              The assessment can’t be submitted until it is answered.
            </p>
          </div>
          <Switch
            checked={item.required ?? false}
            onCheckedChange={(v) => update((it) => void (it.required = v))}
            label="Required"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Counts towards the score</p>
            <p className="text-xs text-muted">Included in the total for the section.</p>
          </div>
          <Switch
            checked={item.include_in_total !== false}
            onCheckedChange={(v) => update((it) => void (it.include_in_total = v))}
            label="Counts towards the score"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="item-weight">
            Weight
          </label>
          <Input
            id="item-weight"
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={saveWording}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Key: <code className="rounded bg-bg px-1">{item.key}</code>
      </p>
    </div>
  );
}
