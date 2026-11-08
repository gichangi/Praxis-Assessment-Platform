"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormDefinition } from "@assessment/core";
import { CalendarDays, ChevronDown, FileText, MapPin } from "lucide-react";
import { AssessmentEntry } from "@/components/assessment/AssessmentEntry";
import { AssessmentIntro, FIELD_BOX, SetupField } from "@/components/assessment/setup";
import { LocationSingleTree } from "@/components/LocationSingleTree";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildTree, withAncestors, type LocationInput, type Tree } from "@/lib/assignment-tree";
import { createClient } from "@/lib/supabase/client";
import { cn, fmtDate } from "@/lib/utils";

export type FormChoice = {
  id: string;
  organisationId: string;
  title: string;
  version: string;
  versionId: string;
  /** Locations this person may use this form at. */
  locationIds: string[];
};
export type LocationChoice = LocationInput;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "so", label: "Somali" },
  { value: "ar", label: "Arabic" },
];

const today = () => new Date().toISOString().slice(0, 10);

/** "Sun, 8 Nov 2026" */
function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-GB", o);
  return `${part({ weekday: "short" })}, ${part({ day: "numeric" })} ${part({ month: "short" })} ${part({ year: "numeric" })}`;
}

/** "Jubbaland › Baidoa": the place's parents, then the place. */
function pathOf(tree: Tree, id: string): { name: string; parents: string } {
  const node = tree.byId.get(id);
  const parents: string[] = [];
  for (let p = node?.parentId ? tree.byId.get(node.parentId) : undefined; p;) {
    parents.unshift(p.name);
    p = p.parentId ? tree.byId.get(p.parentId) : undefined;
  }
  return { name: node?.name ?? "", parents: parents.join(" › ") };
}

export function NewAssessmentFlow({
  forms,
  locations,
}: {
  forms: FormChoice[];
  locations: LocationChoice[];
}) {
  const [formId, setFormId] = useState(forms.length === 1 ? forms[0].id : "");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [pickingPlace, setPickingPlace] = useState(false);
  const [language, setLanguage] = useState("en");
  const [assessedOn, setAssessedOn] = useState(today);
  const [definition, setDefinition] = useState<FormDefinition | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [reload, setReload] = useState(0);
  const dateInput = useRef<HTMLInputElement>(null);
  const sb = createClient();

  const form = forms.find((f) => f.id === formId);
  const selectable = useMemo(() => new Set(form?.locationIds ?? []), [form]);
  const tree = useMemo(
    () => buildTree(withAncestors(locations, selectable)),
    [locations, selectable]
  );

  // Fetch the form's questions when a form is chosen.
  useEffect(() => {
    if (!form) {
      setDefinition(null);
      setLoadState("idle");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    setDefinition(null);
    sb.from("form_versions")
      .select("definition")
      .eq("id", form.versionId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLoadState("error");
          return;
        }
        const def = data.definition as unknown as FormDefinition;
        setDefinition(def);
        setLoadState("idle");
        setLanguage((current) =>
          def.languages.includes(current) ? current : def.default_language
        );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.versionId, reload]);

  const languages = LANGUAGES.filter((l) => !definition || definition.languages.includes(l.value));
  const place = locationId ? pathOf(tree, locationId) : null;
  const langLabel = LANGUAGES.find((l) => l.value === language)?.label ?? language;

  const setup = (
    <>
      <SetupField step={1} label="Form" htmlFor="asmnt-form">
        <Select
          value={formId}
          onValueChange={(v) => {
            setFormId(v);
            setLocationId(null);
            setPickingPlace(false);
          }}
        >
          <SelectTrigger id="asmnt-form" className="h-12 rounded-lg px-3.5">
            <SelectValue placeholder="Choose a form" className="min-w-0 flex-1 text-start">
              {form && (
                <span className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  <span className="truncate font-semibold">{form.title}</span>
                  <span className="ms-auto shrink-0 pe-2 text-xs text-muted">v{form.version}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.title} · v{f.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SetupField>

      <SetupField step={2} label="Location">
        <button
          type="button"
          disabled={!form}
          aria-expanded={pickingPlace}
          onClick={() => setPickingPlace((o) => !o)}
          className={cn(
            FIELD_BOX,
            "transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
            pickingPlace && "border-primary"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            {place ? (
              <>
                <span className="font-semibold">{place.name}</span>
                {place.parents && <span className="ms-2 text-xs text-muted">{place.parents}</span>}
              </>
            ) : (
              <span className="text-muted">
                {form ? "Choose a location" : "Choose a form first"}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform",
              pickingPlace && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        {form && pickingPlace && (
          <div className="mt-2">
            <LocationSingleTree
              key={form.id}
              tree={tree}
              selectable={selectable}
              selectedId={locationId}
              onSelect={(id) => {
                setLocationId(id);
                setPickingPlace(false);
              }}
            />
          </div>
        )}
      </SetupField>

      <SetupField step={3} label="Date" htmlFor="asmnt-date">
        <div className="relative">
          <button
            id="asmnt-date"
            type="button"
            onClick={() => dateInput.current?.showPicker?.()}
            className={cn(FIELD_BOX, "justify-between transition-colors hover:border-primary/40")}
          >
            <span>{longDate(assessedOn)}</span>
            <CalendarDays className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          </button>
          {/* The native picker, hidden behind the button above. */}
          <input
            ref={dateInput}
            type="date"
            required
            tabIndex={-1}
            aria-hidden="true"
            value={assessedOn}
            max={today()}
            onChange={(e) => e.target.value && setAssessedOn(e.target.value)}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0 opacity-0"
          />
        </div>
      </SetupField>

      <SetupField step={4} label="Language" htmlFor="asmnt-lang">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="asmnt-lang" className="h-12 rounded-lg px-3.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SetupField>
    </>
  );

  const ready = !!form && !!locationId && !!definition;

  let placeholder: React.ReactNode;
  if (form && locationId && loadState === "loading") placeholder = "Loading the form…";
  else if (form && locationId && loadState === "error")
    placeholder = (
      <span className="flex flex-col items-center gap-3">
        <span className="text-red-700">
          Couldn’t load this form. Check your connection and try again.
        </span>
        <Button variant="outline" size="sm" onClick={() => setReload((n) => n + 1)}>
          Try again
        </Button>
      </span>
    );

  return (
    <AssessmentEntry
      // Starting over for another form or place must not carry answers across.
      key={`${form?.id ?? ""}:${locationId ?? ""}`}
      definition={ready ? definition : null}
      language={language}
      ready={ready}
      placeholder={placeholder}
      intro={
        <AssessmentIntro
          backHref="/assessments"
          backLabel="Back to assessments"
          title="New assessment"
          description="Choose what you are assessing, then answer on the right."
        />
      }
      setup={setup}
      title={form?.title}
      place={place?.name}
      dateLabel={fmtDate(assessedOn)}
      languageLabel={langLabel}
      meta={{
        organisationId: form?.organisationId ?? "",
        formVersionId: form?.versionId ?? "",
        locationId: locationId ?? "",
        assessedOn,
      }}
    />
  );
}
