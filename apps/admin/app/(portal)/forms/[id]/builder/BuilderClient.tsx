"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormDefinition } from "@assessment/core";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Languages,
  LayoutTemplate,
  LockKeyhole,
  Smartphone,
  Tablet,
} from "lucide-react";
import { ItemEditor } from "@/components/builder/ItemEditor";
import { PhonePreview } from "@/components/builder/PhonePreview";
import { QuestionLibrary } from "@/components/builder/QuestionLibrary";
import { SectionList } from "@/components/builder/SectionList";
import { LANGUAGE_NAMES } from "@/components/assessment/setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  addBlankItem,
  addFromLibrary,
  addSection,
  collectLibrary,
  findItem,
  itemCount,
  type LibraryEntry,
} from "@/lib/builder-ops";
import { createClient } from "@/lib/supabase/client";
import { cn, t } from "@/lib/utils";
import { versionStatusLabel } from "@/lib/versions";

type FormVersion = {
  id: string;
  version: string;
  status: string;
  definition: unknown;
  form_id: string;
  updated_at: string;
  forms: { key: string; title: Record<string, string> } | null;
};

const langName = (code: string) => LANGUAGE_NAMES[code] ?? code;

export function BuilderClient({
  formVersion,
  library: otherQuestions,
}: {
  formVersion: FormVersion;
  /** Questions from the organisation's other forms. */
  library: LibraryEntry[];
}) {
  const initial = formVersion.definition as FormDefinition;
  const [def, setDef] = useState<FormDefinition>(initial);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initial.sections[0]?.items[0]?.key ?? initial.sections[0]?.key ?? null
  );
  const [editLang, setEditLang] = useState(initial.default_language);
  const [previewLang, setPreviewLang] = useState(initial.default_language);
  const [rightTab, setRightTab] = useState<"preview" | "properties">("preview");
  const [device, setDevice] = useState<"phone" | "tablet">("phone");
  const [showPreview, setShowPreview] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"questions" | "editor" | "preview">("editor");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const sb = createClient();
  const isDraft = formVersion.status === "draft";
  const title = t(formVersion.forms?.title);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, []);

  async function persistDef(updated: FormDefinition) {
    if (!isDraft) return false;
    setSaving(true);
    const { error } = await sb
      .from("form_versions")
      .update({ definition: updated })
      .eq("id", formVersion.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    setDirty(false);
    setSavedAt(new Date());
    return true;
  }

  const handleChange = useCallback(
    (updated: FormDefinition) => {
      if (!isDraft) return;
      setDef(updated);
      setDirty(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void persistDef(updated), 1200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDraft]
  );

  /** Apply an edit, and (when given) select what it produced. */
  const edit = useCallback(
    (next: FormDefinition, select?: string | null) => {
      handleChange(next);
      if (select !== undefined) setSelectedKey(select);
    },
    [handleChange]
  );

  // The section new questions go into: the selected one, or the one holding the selected question.
  const activeSectionKey =
    def.sections.find((s) => s.key === selectedKey)?.key ??
    findItem(def, selectedKey)?.section.key ??
    def.sections[0]?.key ??
    null;

  // This form's own questions, plus the ones from your other forms that it doesn't have yet.
  const library = useMemo(() => {
    const own = collectLibrary([{ form: title, updatedAt: formVersion.updated_at, def }]);
    const have = new Set(own.map((e) => e.qid));
    return [...own, ...otherQuestions.filter((e) => !have.has(e.qid))];
  }, [def, otherQuestions, title, formVersion.updated_at]);
  const byId = useMemo(() => new Map(library.map((e) => [e.id, e])), [library]);

  function newQuestion() {
    let working = def;
    let section = activeSectionKey;
    if (!section) {
      const made = addSection(working);
      working = made.def;
      section = made.newKey;
    }
    const { def: next, newKey } = addBlankItem(working, section);
    edit(next, newKey);
    setRightTab("properties");
    setMobilePanel("preview");
  }

  function addToSection(entry: LibraryEntry) {
    if (!activeSectionKey) return;
    const { def: next, newKey } = addFromLibrary(def, entry, activeSectionKey);
    edit(next, newKey);
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
      const issues: { path: string; message: string }[] = Array.isArray(body.issues)
        ? body.issues
        : [];
      toast({
        title: "Couldn’t publish yet",
        description: issues.length
          ? `Fix ${issues.length === 1 ? "this" : `these ${issues.length} problems`} first: ${issues
              .slice(0, 3)
              .map((i) => `${i.path || "form"} — ${i.message}`)
              .join("; ")}${issues.length > 3 ? "…" : ""}`
          : (body.error ?? "Please try again."),
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Version ${formVersion.version} is now active`,
      description:
        "Phones receive it on their next sync. Assessments already started keep their version.",
      variant: "success",
    });
    setPublishOpen(false);
    router.push("/forms");
    router.refresh();
  }

  const minutes = savedAt ? Math.floor((now - savedAt.getTime()) / 60_000) : 0;
  const status = !isDraft
    ? "Read only"
    : saving
      ? "Saving…"
      : dirty
        ? "Unsaved changes"
        : savedAt
          ? minutes < 1
            ? "Saved just now"
            : `Saved ${minutes} min ago`
          : "All changes saved";

  const Pane = ({
    id,
    className,
    children,
  }: {
    id: typeof mobilePanel;
    className: string;
    children: React.ReactNode;
  }) => (
    <div className={cn(mobilePanel === id ? "flex" : "hidden", "min-h-0 flex-col", className)}>
      {children}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-72px)] flex-col overflow-hidden bg-bg">
      {/* Top bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-surface px-5 py-3 sm:px-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/forms/${formVersion.form_id}`} aria-label="Back to form details">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-text-main">{title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <span>Version {formVersion.version}</span>
            <Badge variant={isDraft ? "warning" : "success"}>
              {versionStatusLabel(formVersion.status)}
            </Badge>
            <span>{isDraft ? "Auto-save enabled" : "Read only"}</span>
          </div>
        </div>
        <div className="ms-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-muted lg:flex">
            <Languages className="h-4 w-4" aria-hidden="true" />
            {def.languages.length} {def.languages.length === 1 ? "language" : "languages"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="hidden xl:inline-flex"
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
          Active and superseded versions are read only. You can explore the structure and preview
          each question.
        </div>
      )}

      <div
        role="group"
        aria-label="Builder panels"
        className="flex shrink-0 gap-2 border-b border-border bg-surface p-3 xl:hidden"
      >
        {(
          [
            { key: "questions", label: "Questions" },
            { key: "editor", label: "Editor" },
            { key: "preview", label: "Preview" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            aria-pressed={mobilePanel === key}
            onClick={() => setMobilePanel(key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-medium",
              mobilePanel === key ? "bg-primary-50 text-primary" : "text-muted hover:bg-bg"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: the question library */}
        <aside
          className={cn(
            mobilePanel === "questions" ? "flex" : "hidden",
            "min-h-0 w-full shrink-0 flex-col border-e border-border bg-surface xl:flex xl:w-[19rem]"
          )}
        >
          <QuestionLibrary
            def={def}
            lang={editLang}
            library={library}
            readOnly={!isDraft}
            onNew={newQuestion}
            onAdd={addToSection}
            onSelectItem={(key) => {
              setSelectedKey(key);
              setMobilePanel("editor");
              document
                .getElementById(`row-${key}`)
                ?.scrollIntoView({ block: "center", behavior: "smooth" });
            }}
          />
        </aside>

        {/* Middle: the questionnaire */}
        <main
          className={cn(
            mobilePanel === "editor" ? "flex" : "hidden",
            "min-h-0 min-w-0 flex-1 flex-col border-e border-border xl:flex"
          )}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <LayoutTemplate className="h-4 w-4 text-muted" aria-hidden="true" />
              Questionnaire editor
            </h2>
            <span className="text-xs text-muted">
              {def.sections.length} {def.sections.length === 1 ? "section" : "sections"} ·{" "}
              {itemCount(def)} items
            </span>
            <div
              role="tablist"
              aria-label="Language being edited"
              className="ms-auto flex rounded-lg border border-border bg-bg p-0.5"
            >
              {def.languages.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={editLang === code}
                  onClick={() => setEditLang(code)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    editLang === code
                      ? "bg-surface font-medium text-text-main shadow-sm"
                      : "text-muted hover:text-text-main"
                  )}
                >
                  {langName(code)}
                </button>
              ))}
            </div>
            <span
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 text-sm",
                dirty || saving ? "text-amber-700" : "text-emerald-700"
              )}
            >
              {!dirty && !saving && isDraft && <Check className="h-4 w-4" aria-hidden="true" />}
              {status}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-4xl">
              <SectionList
                def={def}
                lang={editLang}
                selectedKey={selectedKey}
                readOnly={!isDraft}
                onSelect={(key) => {
                  setSelectedKey(key);
                  setMobilePanel("preview");
                }}
                onEdit={edit}
                libraryById={(id) => byId.get(id)}
              />
            </div>
          </div>
        </main>

        {/* Right: preview and properties */}
        <aside
          className={cn(
            mobilePanel === "preview" ? "flex" : "hidden",
            showPreview ? "xl:flex" : "xl:hidden",
            "min-h-0 w-full shrink-0 flex-col bg-bg xl:w-[24rem]"
          )}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-3">
            <div
              role="tablist"
              aria-label="Right panel"
              className="flex rounded-lg border border-border bg-bg p-0.5"
            >
              {(["preview", "properties"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={rightTab === tab}
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
                    rightTab === tab
                      ? "bg-surface font-medium text-text-main shadow-sm"
                      : "text-muted hover:text-text-main"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            {rightTab === "preview" && (
              <>
                <div
                  role="group"
                  aria-label="Device"
                  className="flex rounded-lg border border-border bg-bg p-0.5"
                >
                  {(
                    [
                      { id: "phone", icon: Smartphone, label: "Phone" },
                      { id: "tablet", icon: Tablet, label: "Tablet" },
                    ] as const
                  ).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={label}
                      aria-pressed={device === id}
                      onClick={() => setDevice(id)}
                      className={cn(
                        "rounded-md p-1.5 transition-colors",
                        device === id
                          ? "bg-surface text-text-main shadow-sm"
                          : "text-muted hover:text-text-main"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <div className="relative ms-auto">
                  <select
                    aria-label="Preview language"
                    value={previewLang}
                    onChange={(e) => setPreviewLang(e.target.value)}
                    className="h-9 cursor-pointer appearance-none rounded-lg border border-border bg-surface ps-3 pe-8 text-sm"
                  >
                    {def.languages.map((code) => (
                      <option key={code} value={code}>
                        {langName(code)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {rightTab === "preview" ? (
              <PhonePreview
                def={def}
                selectedKey={selectedKey}
                lang={previewLang}
                device={device}
                onSelect={setSelectedKey}
              />
            ) : (
              <fieldset disabled={!isDraft} className="min-w-0 bg-surface">
                <ItemEditor
                  def={def}
                  selectedKey={selectedKey}
                  lang={editLang}
                  onChange={handleChange}
                />
              </fieldset>
            )}
          </div>
        </aside>
      </div>

      {/* Publish dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Publish v{formVersion.version}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted">
            Publishing freezes this definition and makes it the active version; the current active
            version is superseded. Assessments already started keep their version and can still be
            viewed and submitted. New assessments use this version once a phone has synced it.
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
