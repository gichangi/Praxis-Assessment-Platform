"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { t } from "@/lib/utils";

type FormChoice = {
  id: string;
  organisationId: string;
  title: string;
  versionId: string;
  locationIds: Set<string>;
};
type LocationChoice = { id: string; code: string; name: string; level: number };

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "so", label: "Somali" },
  { value: "ar", label: "Arabic" },
];

function newUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function NewAssessmentButton() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<{ forms: FormChoice[]; locations: LocationChoice[] } | null>(null);
  const [formId, setFormId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [language, setLanguage] = useState("en");
  const [assessedOn, setAssessedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  function reset() {
    setFormId("");
    setLocationId("");
    setLanguage("en");
    setAssessedOn(new Date().toISOString().slice(0, 10));
  }

  // Only the forms and locations assigned to this person can be started (enforced by RLS too).
  async function loadOptions() {
    const { data: pairs, error } = await sb.rpc("my_assessable_form_locations");
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      setOptions({ forms: [], locations: [] });
      return;
    }
    const byForm = new Map<string, Set<string>>();
    for (const p of pairs ?? []) {
      if (!byForm.has(p.form_id)) byForm.set(p.form_id, new Set());
      byForm.get(p.form_id)!.add(p.location_id);
    }
    if (byForm.size === 0) {
      setOptions({ forms: [], locations: [] });
      return;
    }

    const [formRes, locRes] = await Promise.all([
      sb
        .from("forms")
        .select("id, organisation_id, title, form_versions(id, status, published_at)")
        .in("id", [...byForm.keys()]),
      sb.from("locations").select("id, code, name, level").order("level").order("code"),
    ]);

    const forms: FormChoice[] = [];
    for (const f of formRes.data ?? []) {
      const published = (f.form_versions ?? [])
        .filter((v) => v.status === "published")
        .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
      if (!published.length) continue;
      forms.push({
        id: f.id,
        organisationId: f.organisation_id,
        title: t(f.title as Record<string, string>),
        versionId: published[0].id,
        locationIds: byForm.get(f.id)!,
      });
    }
    forms.sort((a, b) => a.title.localeCompare(b.title));
    setOptions({
      forms,
      locations: (locRes.data ?? []).map((l) => ({
        id: l.id,
        code: l.code,
        name: t(l.name as Record<string, string>),
        level: l.level,
      })),
    });
    if (forms.length === 1) setFormId(forms[0].id);
  }

  const form = options?.forms.find((f) => f.id === formId);
  const selectableLocations = (options?.locations ?? []).filter((l) => form?.locationIds.has(l.id));

  async function create() {
    if (!form || !locationId) return;
    setLoading(true);

    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      toast({ title: "Not signed in", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await sb.from("assessments").insert({
      id: newUuid(),
      organisation_id: form.organisationId,
      form_version_id: form.versionId,
      location_id: locationId,
      language,
      status: "draft",
      created_by: user.id,
      assessors: [],
      assessed_on: assessedOn,
    });

    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Assessment created" });
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          void loadOptions();
        }}
      >
        <Plus className="h-4 w-4" />
        New assessment
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>New assessment</DialogTitle>
          </DialogHeader>
          {options && options.forms.length === 0 ? (
            <p className="py-2 text-sm text-muted">
              No published forms are assigned to you yet. Ask a form editor to assign one.
            </p>
          ) : (
            <form
              id="new-assessment"
              onSubmit={(e) => {
                e.preventDefault();
                void create();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="asmnt-form" className="field-label">
                  Form
                </label>
                <Select
                  value={formId}
                  onValueChange={(v) => {
                    setFormId(v);
                    setLocationId("");
                  }}
                >
                  <SelectTrigger id="asmnt-form">
                    <SelectValue placeholder={options ? "Select form…" : "Loading…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.forms ?? []).map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="asmnt-location" className="field-label">
                  Location
                </label>
                <Select value={locationId} onValueChange={setLocationId} disabled={!form}>
                  <SelectTrigger id="asmnt-location">
                    <SelectValue placeholder="Select location…" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {"  ".repeat(loc.level)}
                        {loc.name} ({loc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="asmnt-date" className="field-label">
                  Assessment date
                </label>
                <Input
                  id="asmnt-date"
                  type="date"
                  required
                  value={assessedOn}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setAssessedOn(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="asmnt-lang" className="field-label">
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="asmnt-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-assessment"
              disabled={loading || !form || !locationId}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
