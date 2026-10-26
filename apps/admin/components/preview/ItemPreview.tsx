"use client";
import type { FormDefinition } from "@assessment/core";
import { t } from "@/lib/utils";

type Item = FormDefinition["sections"][number]["items"][number];
type Scale = FormDefinition["scales"][number];

type Props = {
  item: Item | null;
  scales: Scale[];
  lang?: string;
};

export function ItemPreview({ item, scales, lang = "en" }: Props) {
  if (!item) {
    return (
      <div className="flex min-h-64 items-center justify-center text-xs leading-6 text-muted px-8 text-center">
        Select an item to preview how it appears on the mobile app
      </div>
    );
  }

  const scale = scales.find((s) => s.key === item.scale);
  const itemTitle = t(item.title as Record<string, string>, lang);
  const guidance = t(item.guidance as Record<string, string> | null, lang);

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Phone chrome */}
      <div className="mx-auto w-full max-w-sm rounded-[28px] border-4 border-text-main bg-bg overflow-hidden shadow-xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[10px] font-medium text-text-main">9:41</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-text-main" />
            <div className="h-1.5 w-1.5 rounded-full bg-text-main" />
            <div className="h-1.5 w-1.5 rounded-full bg-text-main" />
          </div>
        </div>

        {/* App bar */}
        <div className="bg-primary px-4 py-3">
          <p className="text-white text-xs opacity-70">Section</p>
          <p className="text-white text-sm font-semibold mt-0.5 leading-snug line-clamp-2">
            {itemTitle}
          </p>
        </div>

        {/* Card body */}
        <div className="bg-surface mx-3 mt-3 rounded-[14px] p-4 shadow-sm">
          {guidance && <p className="text-xs text-muted mb-3 leading-relaxed">{guidance}</p>}

          {item.type === "scale" && scale ? (
            <div className="flex flex-col gap-2">
              {[...scale.levels].reverse().map((lvl) => (
                <button
                  key={lvl.value}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-start hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {lvl.value}
                  </span>
                  <span className="text-xs text-text-main leading-snug">
                    {t(lvl.label as Record<string, string>, lang)}
                  </span>
                </button>
              ))}
            </div>
          ) : item.type === "yes_no" ? (
            <div className="grid grid-cols-2 gap-2">
              {["Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  className="rounded-xl border border-border py-3 text-sm font-medium text-text-main hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : item.type === "text" ? (
            <div className="rounded-xl border border-border px-3 py-2.5 min-h-[80px] text-xs text-muted">
              Type your answer…
            </div>
          ) : item.type === "number" ? (
            <div className="rounded-xl border border-border px-3 py-2.5 text-xs text-muted">
              0
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted">
              {item.type}
            </div>
          )}

          {/* Not assessed toggle */}
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <div className="h-4 w-8 rounded-full bg-border" />
            <span className="text-[10px] text-muted">Not assessed</span>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>

      {/* Meta */}
      <div className="text-center text-xs text-muted space-y-0.5">
        <p>
          Key: <code className="bg-border/50 px-1 rounded">{item.key}</code>
        </p>
        {item.scale && <p>Scale: {item.scale}</p>}
        <p>
          Include in total: {item.include_in_total !== false ? "yes" : "no"} · Weight:{" "}
          {item.weight ?? 1}
        </p>
      </div>
    </div>
  );
}
