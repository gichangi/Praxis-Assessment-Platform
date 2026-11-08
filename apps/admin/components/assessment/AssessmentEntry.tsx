"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { FormDefinition } from "@assessment/core";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  answerLabel,
  askable,
  hotkeyHint,
  isAnswered,
  isChoice,
  levelForKey,
  localize,
  nextUnanswered,
  progress,
  requiredMissing,
  toRows,
  type Answers,
  type AnswerState,
} from "@/lib/assessment-entry";
import { ItemField } from "./ItemField";

export type EntryMeta = {
  /** Set when continuing a draft; empty for a brand-new assessment. */
  id?: string;
  organisationId: string;
  formVersionId: string;
  locationId: string;
  assessedOn: string;
};

function newUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const NO_FORM = {
  sections: [],
  scales: [],
  languages: ["en"],
  default_language: "en",
} as unknown as FormDefinition;

const clock = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Keys that type into a field, where shortcuts must stay out of the way. */
function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
  if (el.tagName !== "INPUT") return false;
  const type = (el as HTMLInputElement).type;
  return type !== "radio" && type !== "checkbox";
}

/**
 * The data-entry workspace. Setup and progress sit on the left; one question at a time on the
 * right. Submit is available once every required question is answered, the same rule the
 * database applies.
 */
export function AssessmentEntry({
  definition,
  language,
  meta,
  initialAnswers = {},
  intro,
  setup,
  title,
  place,
  dateLabel,
  languageLabel,
  placeholder,
  ready = true,
  readOnly = false,
  reopen = false,
  statusBadge,
  summary,
  actions,
  sectionScores,
}: {
  definition: FormDefinition | null;
  language: string;
  meta: EntryMeta;
  initialAnswers?: Answers;
  /** Back link, page title and a line of guidance at the top of the left panel. */
  intro?: ReactNode;
  /** Setup fields (form, location, date, language) under the intro. */
  setup?: ReactNode;
  title?: string;
  place?: string;
  dateLabel?: string;
  languageLabel?: string;
  /** Shown on the right until there are questions to answer. */
  placeholder?: ReactNode;
  /** False until a form and location are chosen; nothing can be answered or saved. */
  ready?: boolean;
  /** View the answers without being able to change them. */
  readOnly?: boolean;
  /** The assessment is submitted: the first save pulls it back to draft. */
  reopen?: boolean;
  /** Shown beside the title, e.g. the assessment's status. */
  statusBadge?: ReactNode;
  /** Extra content in the left panel under the setup, e.g. scores and review actions. */
  summary?: ReactNode;
  /** Replaces Save as draft / Submit at the foot of the left panel. */
  actions?: ReactNode;
  /** Score per section key, shown over each section's questions. */
  sectionScores?: Record<string, { score: number; max: number; pct: number }>;
}) {
  const def = definition ?? NO_FORM;
  const live = ready && definition !== null;
  const [needsReopen, setNeedsReopen] = useState(reopen);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [assessmentId, setAssessmentId] = useState<string | undefined>(meta.id);
  // Items already stored, so answers cleared since can be removed on the next save.
  const [savedKeys, setSavedKeys] = useState<Set<string>>(
    () => new Set(Object.keys(initialAnswers))
  );
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [curKey, setCurKey] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const router = useRouter();
  const sb = createClient();

  // Keeps "saved 2 min ago" fresh.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => progress(def, answers), [def, answers]);
  const missing = useMemo(() => requiredMissing(def, answers), [def, answers]);
  const canSubmit = live && missing.length === 0 && stats.total > 0;
  const pct = stats.total ? Math.round((100 * stats.answered) / stats.total) : 0;

  const groups = useMemo(() => askable(def, answers), [def, answers]);
  const flat = useMemo(() => {
    let n = 0;
    return groups.flatMap((g) =>
      g.items.map((item) => ({
        key: item.key,
        item,
        sectionKey: g.section.key,
        number: ++n,
        answered: isAnswered(item, answers[item.key]),
      }))
    );
  }, [groups, answers]);

  const found = flat.findIndex((q) => q.key === curKey);
  const cur = found >= 0 ? found : 0;
  const current = flat[cur];
  const activeSection = current?.sectionKey;

  function setAnswer(key: string, next: AnswerState) {
    setAnswers((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  }

  function go(index: number) {
    const q = flat[index];
    if (q) setCurKey(q.key);
  }

  // Bring the question you moved to into view (not on first load).
  useEffect(() => {
    if (!curKey) return;
    document
      .getElementById(`item-${curKey}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [curKey]);

  function jumpToNext() {
    const i = nextUnanswered(flat, cur);
    if (i >= 0) go(i);
  }

  // Keyboard: the key shown on an option picks it, Enter moves on.
  useEffect(() => {
    if (!live || !current || readOnly) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "Enter") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A") return;
        if (cur < flat.length - 1) {
          e.preventDefault();
          go(cur + 1);
        }
        return;
      }
      if (e.key.length === 1 && isChoice(current.item)) {
        const value = levelForKey(def, current.item, e.key);
        if (value == null) return;
        e.preventDefault();
        setAnswer(current.key, {
          ...(answers[current.key] ?? { value: null, notAssessed: false, note: "" }),
          value,
          notAssessed: false,
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, current?.key, cur, flat.length, answers]);

  /** Stores the assessment and its answers. Returns the assessment id, or null if it failed. */
  async function persist(): Promise<string | null> {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      toast({ title: "You’re signed out. Sign in again.", variant: "destructive" });
      return null;
    }

    let id = assessmentId;
    // A submitted assessment goes back to draft before its answers change.
    if (id && needsReopen) {
      const { error } = await sb.rpc("reopen_assessment", { p_id: id });
      if (error) {
        toast({
          title: "Couldn’t reopen the assessment",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      setNeedsReopen(false);
    }
    if (!id) {
      id = newUuid();
      const { error } = await sb.from("assessments").insert({
        id,
        organisation_id: meta.organisationId,
        form_version_id: meta.formVersionId,
        location_id: meta.locationId,
        language,
        status: "draft",
        created_by: user.id,
        assessors: [],
        assessed_on: meta.assessedOn,
      });
      if (error) {
        toast({
          title: "Couldn’t save the assessment",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      setAssessmentId(id);
    }

    const rows = toRows(def, answers);
    if (rows.length > 0) {
      const { error } = await sb.from("responses").upsert(
        rows.map((r) => ({
          assessment_id: id!,
          ...r,
          note_language: language,
          updated_by: user.id,
        })),
        { onConflict: "assessment_id,item_key" }
      );
      if (error) {
        toast({
          title: "Couldn’t save the answers",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    }

    const keys = new Set(rows.map((r) => r.item_key));
    const stale = [...savedKeys].filter((k) => !keys.has(k));
    if (stale.length > 0) {
      const { error } = await sb
        .from("responses")
        .delete()
        .eq("assessment_id", id)
        .in("item_key", stale);
      if (error) {
        toast({
          title: "Couldn’t save the answers",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    }
    setSavedKeys(keys);
    setDirty(false);
    setSavedAt(new Date());
    return id;
  }

  async function saveDraft() {
    setBusy("draft");
    const id = await persist();
    setBusy(null);
    if (!id) return;
    toast({
      title: "Draft saved",
      description: "You can pick it up again from the assessments list.",
      variant: "success",
    });
    // A new assessment now exists, so continue on its own page; otherwise just refresh.
    if (!meta.id) router.replace(`/assessments/${id}/edit`);
    else router.refresh();
  }

  async function submit() {
    if (!canSubmit) return;
    setBusy("submit");
    const id = await persist();
    if (!id) {
      setBusy(null);
      return;
    }
    const { error } = await sb.rpc("submit_assessment", { p_id: id });
    setBusy(null);
    if (error) {
      toast({ title: "Couldn’t submit yet", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Assessment submitted", variant: "success" });
    router.push(`/assessments/${id}`);
    router.refresh();
  }

  function goToMissing() {
    const first = missing[0];
    const i = flat.findIndex((q) => q.key === first);
    if (i >= 0) go(i);
  }

  const ago = savedAt ? Math.floor((now - savedAt.getTime()) / 60_000) : 0;
  const savedText = savedAt
    ? ago < 1
      ? "Draft saved just now"
      : ago < 60
        ? `Draft saved ${ago} min ago`
        : `Draft saved at ${clock(savedAt)}`
    : needsReopen
      ? "Submitted, no changes yet"
      : assessmentId
        ? "Draft saved"
        : "Not saved yet";

  const activeDef = def.sections.find((x) => x.key === activeSection);
  const sectionTitleText = localize(activeDef?.title, language, def.default_language);
  const sectionNote = localize(activeDef?.description, language, def.default_language);
  const activeItems = flat.filter((q) => q.sectionKey === activeSection);
  const hint = current ? hotkeyHint(def, current.item) : "";
  const chips = [
    place ? { icon: MapPin, label: place } : null,
    dateLabel ? { icon: CalendarDays, label: dateLabel } : null,
    languageLabel ? { icon: Globe, label: languageLabel } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
  const KBD = "rounded border border-border bg-bg px-1.5";

  return (
    <div
      className="flex flex-col gap-2.5 p-2.5 lg:h-full lg:flex-row"
      dir={language === "ar" ? "rtl" : undefined}
    >
      {/* Left: what you are assessing, progress, actions */}
      <aside className="flex shrink-0 flex-col gap-6 rounded-xl border border-border bg-surface px-6 py-6 lg:w-[25rem] lg:overflow-y-auto">
        {intro}
        {setup && <div className="space-y-5">{setup}</div>}
        {summary}

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted">
                <strong className="font-semibold text-text-main">{stats.answered}</strong> of{" "}
                {stats.total} answered
              </span>
              <span className="text-xs tabular-nums text-muted">
                {stats.total - stats.answered} left
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/50"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {flat.length > 0 && (
            <div>
              <div className="grid grid-cols-8 gap-1.5" role="group" aria-label="Questions">
                {flat.map((q, i) => (
                  <button
                    key={q.key}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Question ${q.number}${q.answered ? ", answered" : ""}`}
                    aria-current={i === cur ? "step" : undefined}
                    className={cn(
                      "flex h-8 items-center justify-center rounded-md border-2 text-xs font-semibold tabular-nums transition-colors",
                      i === cur
                        ? "border-primary bg-surface text-primary"
                        : q.answered
                          ? "border-primary bg-primary text-white"
                          : "border-transparent bg-border/40 text-muted hover:bg-border/70"
                    )}
                  >
                    {q.number}
                  </button>
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <li className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Answered
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm border-2 border-primary" /> Current
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-border/60" /> To do
                </li>
              </ul>
              <button
                type="button"
                onClick={jumpToNext}
                disabled={nextUnanswered(flat, cur) < 0}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
              >
                Jump to next unanswered
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="-mx-6 -mb-6 mt-auto space-y-3 bg-surface px-6 pb-6 pt-3 lg:sticky lg:bottom-0 lg:rounded-b-xl lg:border-t lg:border-border">
          {readOnly ? (
            actions
          ) : (
            <>
              {live && missing.length > 0 && (
                <p className="text-xs text-muted">
                  {missing.length} required {missing.length === 1 ? "question" : "questions"} left.{" "}
                  <button
                    type="button"
                    onClick={goToMissing}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    Go to next
                  </button>
                </p>
              )}
              {live && (
                <p
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    dirty
                      ? "text-amber-700"
                      : savedAt || assessmentId
                        ? "text-emerald-700"
                        : "text-muted"
                  )}
                  aria-live="polite"
                >
                  {dirty || !(savedAt || assessmentId) ? (
                    <span
                      className={cn("h-2 w-2 rounded-full", dirty ? "bg-amber-500" : "bg-border")}
                      aria-hidden="true"
                    />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {dirty ? "Unsaved changes" : savedText}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => void saveDraft()}
                  disabled={!live || busy !== null}
                >
                  {busy === "draft" ? "Saving…" : "Save as draft"}
                </Button>
                <Button
                  type="button"
                  className="h-11"
                  onClick={() => void submit()}
                  disabled={!canSubmit || busy !== null}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {busy === "submit" ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Right: one question at a time */}
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-border lg:overflow-hidden">
        {!live || !current ? (
          <div className="flex flex-1 items-center justify-center bg-bg px-6 py-20 text-center text-sm text-muted">
            {placeholder ??
              (live
                ? "This form has no questions to answer on the web."
                : "Choose a form and a location to start the assessment.")}
          </div>
        ) : (
          <>
            <header className="shrink-0 border-b border-border bg-surface px-6 pt-5 sm:px-10">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h2 className="font-serif text-[26px] leading-tight">{title || "Assessment"}</h2>
                  {statusBadge}
                </div>
                {chips.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {chips.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                role="tablist"
                aria-label="Sections"
                className="-mb-px mt-4 flex gap-6 overflow-x-auto"
              >
                {groups.map((g) => {
                  const done = g.items.filter((i) => isAnswered(i, answers[i.key])).length;
                  const active = g.section.key === activeSection;
                  return (
                    <button
                      key={g.section.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        const inSection = flat.filter((q) => q.sectionKey === g.section.key);
                        const target = inSection.find((q) => !q.answered) ?? inSection[0];
                        if (target) setCurKey(target.key);
                      }}
                      className={cn(
                        "flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm transition-colors",
                        active
                          ? "border-primary font-semibold text-primary-600"
                          : "border-transparent text-muted hover:text-text-main"
                      )}
                    >
                      {localize(g.section.title, language, def.default_language)}
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                          active ? "bg-primary-50 text-primary-600" : "bg-bg text-muted"
                        )}
                      >
                        {done} / {g.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-bg px-6 py-8 sm:px-10">
              <div className="mx-auto max-w-[90rem] space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                  <div>
                    <h3 className="font-serif text-[28px] leading-tight">{sectionTitleText}</h3>
                    {sectionNote && <p className="mt-1.5 text-sm text-muted">{sectionNote}</p>}
                    {activeSection && sectionScores?.[activeSection] && (
                      <p className="mt-1.5 text-sm">
                        <span className="text-muted">Section score </span>
                        <strong className="font-semibold">
                          {sectionScores[activeSection].score} / {sectionScores[activeSection].max}
                        </strong>
                        <span className="text-muted">
                          {" "}
                          · {Number(sectionScores[activeSection].pct).toFixed(1)}%
                        </span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    Question{" "}
                    <strong className="font-semibold text-text-main">
                      {activeItems.findIndex((q) => q.key === current.key) + 1}
                    </strong>{" "}
                    of {activeItems.length}
                  </p>
                </div>

                <ul className="space-y-3">
                  {activeItems.map((q) => {
                    if (q.key === current.key) {
                      return (
                        <li key={q.key}>
                          <div className="overflow-hidden rounded-xl border-[1.5px] border-primary bg-surface shadow-[0_4px_16px_0_#73523914]">
                            <ItemField
                              key={q.key}
                              def={def}
                              item={q.item}
                              number={q.number}
                              lang={language}
                              answer={answers[q.key]}
                              readOnly={readOnly}
                              onChange={(next) => setAnswer(q.key, next)}
                            />
                            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5 sm:px-6">
                              <p
                                className={cn(
                                  "hidden text-xs text-muted sm:block",
                                  readOnly && "sm:hidden"
                                )}
                              >
                                {hint && (
                                  <>
                                    Press <kbd className={KBD}>{hint}</kbd> to answer,{" "}
                                  </>
                                )}
                                <kbd className={KBD}>Enter</kbd> for next
                              </p>
                              <div className="ms-auto flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => go(cur - 1)}
                                  disabled={cur === 0}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => go(cur + 1)}
                                  disabled={cur >= flat.length - 1}
                                >
                                  Next question
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    }
                    const label = answerLabel(def, q.item, answers[q.key], language);
                    return (
                      <li key={q.key}>
                        <button
                          type="button"
                          onClick={() => setCurKey(q.key)}
                          className="flex min-h-[3.25rem] w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-start text-sm transition-colors hover:border-primary/40"
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                              q.answered
                                ? "bg-emerald-100 text-emerald-700"
                                : "border border-border text-muted"
                            )}
                          >
                            {q.answered ? <Check className="h-4 w-4" /> : null}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted">{q.number}</span>
                          <span className="min-w-0 flex-1 truncate">
                            {localize(q.item.title, language, def.default_language)}
                            {q.item.required && (
                              <span className="ms-1 text-red-600" aria-label="required">
                                *
                              </span>
                            )}
                          </span>
                          {label && (
                            <span className="hidden max-w-[45%] shrink-0 truncate rounded-md bg-bg px-2.5 py-1 text-xs font-medium sm:block">
                              {label}
                            </span>
                          )}
                          <span className="shrink-0 text-xs font-medium text-primary-600">
                            {readOnly ? "View" : q.answered ? "Edit" : "Answer"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
