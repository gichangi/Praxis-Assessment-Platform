"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { FormDefinition } from "@assessment/core";
import { Outline } from "@/components/builder/Outline";
import { ItemEditor } from "@/components/builder/ItemEditor";
import { ItemPreview } from "@/components/preview/ItemPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import {
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Languages,
  LockKeyhole,
  PanelsTopLeft,
} from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/utils";

type FormVersion = {
  id: string;
  version: string;
  status: string;
  definition: unknown;
  form_id: string;
  forms: { key: string; title: Record<string, string> } | null;
};

type Props = { formVersion: FormVersion };

function genKey(base: string, existing: Set<string>): string {
  const slug = base
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 55);
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}_${n}`)) n++;
  return `${slug}_${n}`;
}

export function BuilderClient({ formVersion }: Props) {
  const [def, setDef] = useState<FormDefinition>(formVersion.definition as FormDefinition);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    (formVersion.definition as FormDefinition).sections[0]?.key ?? null
  );
  const [mobilePanel, setMobilePanel] = useState<"structure" | "editor" | "preview">("structure");
  const [previewLanguage, setPreviewLanguage] = useState(
    (formVersion.definition as FormDefinition).default_language
  );
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const sb = createClient();
  const isDraft = formVersion.status === "draft";

  const allItemKeys = (): Set<string> =>
    new Set(def.sections.flatMap((s) => s.items.map((it) => it.key)));

  async function persistDef(updated: FormDefinition) {
    if (!isDraft) return false;
    setSaving(true);
    const { error } = await sb
      .from("form_versions")
      .update({ definition: updated })
      .eq("id", formVersion.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    return !error;
  }

  const handleChange = useCallback(
    (updated: FormDefinition) => {
      if (!isDraft) return;
      setDef(updated);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persistDef(updated), 1200);
    },
    [isDraft]
  );

  function addSection() {
    const existing = new Set(def.sections.map((s) => s.key));
    const key = genKey("section", existing);
    const updated = structuredClone(def);
    updated.sections.push({
      key,
      title: { en: "New Section" },
      description: null,
      groups: [],
      items: [],
    });
    handleChange(updated);
    setSelectedKey(key);
  }

  function addItem(sectionKey: string) {
    const keys = allItemKeys();
    const key = genKey("item", keys);
    const updated = structuredClone(def);
    const sec = updated.sections.find((s) => s.key === sectionKey)!;
    sec.items.push({
      key,
      type: "scale",
      title: { en: "New item" },
      weight: 1,
      include_in_total: true,
      required: false,
      scale: def.scales[0]?.key,
    });
    handleChange(updated);
    setSelectedKey(key);
  }

  function deleteNode(type: "section" | "item", key: string) {
    const updated = structuredClone(def);
    if (type === "section") {
      updated.sections = updated.sections.filter((s) => s.key !== key);
    } else {
      updated.sections = updated.sections.map((s) => ({
        ...s,
        items: s.items.filter((it) => it.key !== key),
      }));
    }
    handleChange(updated);
    setSelectedKey(null);
  }

  async function publish() {
    setPublishing(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!(await persistDef(def))) {
      setPublishing(false);
      return;
    }
    const res = await fetch("/api/publish-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version_id: formVersion.id, change_note: changeNote }),
    });
    setPublishing(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      toast({
        title: "Publish failed",
        description: body.error ?? JSON.stringify(body.issues),
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Published!", description: `v${formVersion.version} is now live` });
    setPublishOpen(false);
    router.push("/forms");
    router.refresh();
  }

  // Find selected item for preview
  const selectedItem =
    def.sections.flatMap((s) => s.items).find((it) => it.key === selectedKey) ?? null;

  return (
    <div className="flex h-[calc(100dvh-72px)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-surface px-5 py-4 sm:px-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/forms" aria-label="Back to form library">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-text-main">
            {t(formVersion.forms?.title)}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted">
            <span>Version {formVersion.version}</span>
            <Badge variant={isDraft ? "warning" : "success"}>{formVersion.status}</Badge>
            <span>{saving ? "Saving…" : isDraft ? "Auto-save enabled" : "Read only"}</span>
          </div>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[11px] text-muted 2xl:flex">
            <Languages className="h-3.5 w-3.5" />
            {def.languages.length} languages
          </span>
          <Button
            variant="outline"
            size="sm"
            className="hidden xl:inline-flex"
            aria-label={showPreview ? "Hide mobile preview" : "Show mobile preview"}
            aria-pressed={showPreview}
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Preview
          </Button>
          {isDraft && (
            <Button onClick={() => setPublishOpen(true)} size="sm">
              <CheckCircle className="h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
      {!isDraft && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-primary-50 px-6 py-2.5 text-xs text-primary">
          <LockKeyhole className="h-3.5 w-3.5" />
          Published versions are read only. You can explore the structure and preview each question.
        </div>
      )}
      <div
        role="group"
        aria-label="Builder panels"
        className="flex shrink-0 gap-2 border-b border-border bg-surface p-3 xl:hidden"
      >
        {(
          [
            { key: "structure", label: "Structure" },
            { key: "editor", label: "Editor" },
            { key: "preview", label: "Preview" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            aria-pressed={mobilePanel === key}
            onClick={() => setMobilePanel(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${mobilePanel === key ? "bg-primary-50 text-primary" : "text-muted hover:bg-bg"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3-panel layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Outline panel */}
        <div
          className={`${mobilePanel === "structure" ? "block" : "hidden"} w-full shrink-0 overflow-hidden border-e border-border bg-surface xl:block xl:w-60`}
        >
          <Outline
            def={def}
            selectedKey={selectedKey}
            onSelect={(_, key) => {
              setSelectedKey(key);
              setMobilePanel("editor");
            }}
            onAddSection={addSection}
            onAddItem={addItem}
            onDelete={deleteNode}
            readOnly={!isDraft}
          />
        </div>

        {/* Editor panel */}
        <div
          className={`${mobilePanel === "editor" ? "block" : "hidden"} min-w-0 flex-1 overflow-y-auto border-e border-border bg-surface xl:block`}
        >
          <div className="flex items-center gap-2 border-b border-border px-6 py-4 text-[11px] font-medium text-muted">
            <PanelsTopLeft className="h-4 w-4" />
            Questionnaire editor
          </div>
          <fieldset disabled={!isDraft} className="min-w-0">
            <ItemEditor def={def} selectedKey={selectedKey} onChange={handleChange} />
          </fieldset>
        </div>

        {/* Preview panel */}
        {
          <div
            className={`${mobilePanel === "preview" ? "block" : "hidden"} w-full shrink-0 overflow-y-auto bg-bg ${showPreview ? "xl:block" : "xl:hidden"} xl:w-80 2xl:w-[360px]`}
          >
            <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Preview
              </span>
              <select
                aria-label="Preview language"
                value={previewLanguage}
                onChange={(event) => setPreviewLanguage(event.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs"
              >
                {def.languages.map((language) => (
                  <option key={language} value={language}>
                    {({ en: "English", so: "Somali", ar: "Arabic" } as Record<string, string>)[
                      language
                    ] ?? language}
                  </option>
                ))}
              </select>
            </div>
            <ItemPreview item={selectedItem} scales={def.scales} lang={previewLanguage} />
          </div>
        }
      </div>

      {/* Publish dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Publish v{formVersion.version}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted">
            Publishing freezes this definition. Collectors will receive it on their next sync.
            Create a new draft to make further edits.
          </p>
          <div className="mt-4">
            <label htmlFor="change-note" className="field-label">
              Change note (optional)
            </label>
            <Input
              id="change-note"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed in this version?"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
