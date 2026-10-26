"use client";
import { useEffect, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Item = FormDefinition["sections"][number]["items"][number];
type Section = FormDefinition["sections"][number];

type Props = {
  def: FormDefinition;
  selectedKey: string | null;
  onChange: (updatedDef: FormDefinition) => void;
};

const ITEM_TYPES = ["scale", "yes_no", "single_choice", "text", "number", "photo", "gps"] as const;

export function ItemEditor({ def, selectedKey, onChange }: Props) {
  // Find whether selected key is a section or item
  const section = def.sections.find((s) => s.key === selectedKey);
  const itemResult = def.sections
    .flatMap((s) => s.items.map((it) => ({ item: it, section: s })))
    .find(({ item }) => item.key === selectedKey);

  if (!selectedKey) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-8 text-center text-sm">
        <p className="font-medium">Make each question count.</p>
        <p className="mt-2 max-w-xs text-xs leading-6 text-muted">
          Select a section or question from the structure panel to view its details.
        </p>
      </div>
    );
  }

  if (section) return <SectionEditor def={def} section={section} onChange={onChange} />;
  if (itemResult)
    return (
      <ItemFieldEditor
        def={def}
        item={itemResult.item}
        parentSection={itemResult.section}
        onChange={onChange}
      />
    );
  return null;
}

function SectionEditor({
  def,
  section,
  onChange,
}: {
  def: FormDefinition;
  section: Section;
  onChange: (d: FormDefinition) => void;
}) {
  const [title, setTitle] = useState(section.title?.["en"] ?? "");

  useEffect(() => {
    setTitle(section.title?.["en"] ?? "");
  }, [section.key]);

  function save() {
    const updated = structuredClone(def);
    const s = updated.sections.find((x) => x.key === section.key)!;
    s.title = { ...s.title, en: title };
    onChange(updated);
  }

  return (
    <div className="p-6 space-y-5">
      <h3 className="font-medium text-sm">Section — {section.key}</h3>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Title (English)</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} />
      </div>
      <p className="text-xs text-muted">
        Key: <code className="bg-bg px-1 rounded">{section.key}</code>
      </p>
    </div>
  );
}

function ItemFieldEditor({
  def,
  item,
  parentSection,
  onChange,
}: {
  def: FormDefinition;
  item: Item;
  parentSection: Section;
  onChange: (d: FormDefinition) => void;
}) {
  const [title, setTitle] = useState(item.title?.["en"] ?? "");
  const [guidance, setGuidance] = useState(item.guidance?.["en"] ?? "");
  const [type, setType] = useState(item.type);
  const [scale, setScale] = useState(item.scale ?? "");
  const [weight, setWeight] = useState(String(item.weight ?? 1));
  const [includeInTotal, setIncludeInTotal] = useState(item.include_in_total ?? true);

  useEffect(() => {
    setTitle(item.title?.["en"] ?? "");
    setGuidance(item.guidance?.["en"] ?? "");
    setType(item.type);
    setScale(item.scale ?? "");
    setWeight(String(item.weight ?? 1));
    setIncludeInTotal(item.include_in_total ?? true);
  }, [item.key]);

  function save(overrides: Partial<Pick<Item, "type" | "scale" | "include_in_total">> = {}) {
    const updated = structuredClone(def);
    const sec = updated.sections.find((s) => s.key === parentSection.key)!;
    const it = sec.items.find((x) => x.key === item.key)!;
    it.title = { ...it.title, en: title };
    it.guidance = guidance ? { ...it.guidance, en: guidance } : undefined;
    const nextType = overrides.type ?? type;
    it.type = nextType;
    it.scale = nextType === "scale" ? (overrides.scale ?? (scale || undefined)) : undefined;
    it.weight = parseFloat(weight) || 1;
    it.include_in_total = overrides.include_in_total ?? includeInTotal;
    onChange(updated);
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <h3 className="font-medium text-sm">Item — {item.key}</h3>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Title (English)</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => save()} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Guidance (English)</label>
        <textarea
          className="flex w-full rounded border border-border bg-surface px-3 py-1.5 text-sm text-text-main min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-y"
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          onBlur={() => save()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Type</label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as Item["type"]);
              save({ type: v as Item["type"] });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "scale" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Scale</label>
            <Select
              value={scale}
              onValueChange={(v) => {
                setScale(v);
                save({ scale: v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="choose…" />
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Weight</label>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => save()}
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeInTotal}
              onChange={(e) => {
                setIncludeInTotal(e.target.checked);
                save({ include_in_total: e.target.checked });
              }}
              className="h-4 w-4 accent-primary"
            />
            Include in total
          </label>
        </div>
      </div>

      <p className="text-xs text-muted">
        Key: <code className="bg-bg px-1 rounded">{item.key}</code>
      </p>
    </div>
  );
}
