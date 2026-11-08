"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { Eye, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { say } from "@/lib/builder-ops";

/** The selected question the way it looks on a phone (or tablet), with Back and Next to walk the form. */
export function PhonePreview({
  def,
  selectedKey,
  lang,
  device,
  onSelect,
}: {
  def: FormDefinition;
  selectedKey: string | null;
  lang: string;
  device: "phone" | "tablet";
  onSelect: (key: string) => void;
}) {
  const flat = useMemo(
    () =>
      def.sections.flatMap((section, si) =>
        section.items.map((item, qi) => ({
          section,
          item,
          si,
          qi,
          total: section.items.length,
        }))
      ),
    [def]
  );
  // A selected section shows its first question.
  const at = Math.max(
    0,
    flat.findIndex(
      (f) => f.item.key === selectedKey || (f.qi === 0 && f.section.key === selectedKey)
    )
  );
  const current = flat[at];
  const [picked, setPicked] = useState<number | string | null>(null);
  useEffect(() => setPicked(null), [current?.item.key]);

  if (!current) {
    return (
      <div className="flex min-h-64 items-center justify-center px-8 text-center text-xs leading-6 text-muted">
        Add a question to see how it appears on the mobile app.
      </div>
    );
  }

  const { item, section, si, qi, total } = current;
  const fallback = def.default_language;
  const scale = def.scales.find((s) => s.key === item.scale);
  const levels = scale ? [...scale.levels].sort((a, b) => a.value - b.value) : [];
  const guidance = say(item.guidance, lang, fallback);

  return (
    <div className="flex flex-col items-center gap-5 px-5 py-6">
      <div
        className={cn(
          "flex w-full flex-col border-text-main bg-surface shadow-xl",
          device === "phone"
            ? "max-w-[290px] rounded-[2.4rem] border-[6px] px-5 pb-5 pt-8"
            : "max-w-[420px] rounded-[1.6rem] border-[8px] px-7 pb-6 pt-8"
        )}
        style={{ minHeight: device === "phone" ? 520 : 420 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Section {si + 1} · Question {qi + 1} of {total}
        </p>
        <h4 className="mt-1 font-serif text-xl leading-tight">
          {say(section.title, lang, fallback)}
        </h4>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${((qi + 1) / total) * 100}%` }}
          />
        </div>

        <div className="mt-6 flex-1">
          <p className="text-base font-semibold leading-snug">{say(item.title, lang, fallback)}</p>
          {guidance && <p className="mt-2 text-xs leading-relaxed text-muted">{guidance}</p>}

          <div className="mt-5">
            {item.type === "scale" && levels.length > 0 && levels.length <= 7 ? (
              <>
                <div className="flex gap-2">
                  {levels.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setPicked(l.value)}
                      className={cn(
                        "flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                        picked === l.value
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {l.value}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex justify-between gap-3 text-[11px] text-muted">
                  <span>{say(levels[0].label, lang, fallback)}</span>
                  <span className="text-end">
                    {say(levels[levels.length - 1].label, lang, fallback)}
                  </span>
                </div>
              </>
            ) : item.type === "scale" ? (
              <div className="space-y-2">
                {[...levels].reverse().map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setPicked(l.value)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-start text-xs",
                      picked === l.value ? "border-primary bg-primary-50" : "border-border"
                    )}
                  >
                    <span className="font-semibold">{l.value}</span>
                    {say(l.label, lang, fallback)}
                  </button>
                ))}
              </div>
            ) : item.type === "yes_no" ? (
              <div className="grid grid-cols-2 gap-2">
                {["Yes", "No"].map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setPicked(o)}
                    className={cn(
                      "rounded-xl border py-3 text-sm font-medium",
                      picked === o ? "border-primary bg-primary text-white" : "border-border"
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ) : item.type === "text" ? (
              <div className="min-h-[88px] rounded-xl border border-border px-3 py-2.5 text-xs text-muted">
                Type your answer…
              </div>
            ) : item.type === "number" ? (
              <div className="rounded-xl border border-border px-3 py-2.5 text-xs text-muted">
                0{item.unit ? ` ${item.unit}` : ""}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted">
                {item.type === "photo"
                  ? "Take a photo"
                  : item.type === "gps"
                    ? "Capture location"
                    : item.type}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={at === 0}
            onClick={() => onSelect(flat[at - 1].item.key)}
            className="h-11 rounded-xl border border-border text-sm font-semibold hover:bg-bg disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={at >= flat.length - 1}
            onClick={() => onSelect(flat[at + 1].item.key)}
            className="h-11 rounded-xl bg-action text-sm font-semibold text-action-ink hover:bg-action-hover disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" onClick={() => onSelect(flat[0].item.key)}>
          <Eye className="h-4 w-4" />
          Preview full form
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(window.location.href)
              .then(() => toast({ title: "Link copied", variant: "success" }))
              .catch(() => toast({ title: "Couldn’t copy the link", variant: "destructive" }));
          }}
        >
          <Link2 className="h-4 w-4" />
          Share link
        </Button>
      </div>
      <p className="text-xs text-muted">Updates as you edit · showing item {at + 1}</p>
    </div>
  );
}
