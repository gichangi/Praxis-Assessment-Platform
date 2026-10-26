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

type LocationOption = {
  id: string;
  parent_id: string | null;
  code: string;
  name: Record<string, string>;
  level: number;
};

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

export function NewAssessmentButton({ locations }: { locations: LocationOption[] }) {
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [language, setLanguage] = useState("en");
  const [assessedOn, setAssessedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  function reset() {
    setLocationId("");
    setLanguage("en");
    setAssessedOn(new Date().toISOString().slice(0, 10));
  }

  async function create() {
    if (!locationId) return;
    setLoading(true);

    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      toast({ title: "Not signed in", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Get the org and latest published form version
    const [memberRes, fvRes] = await Promise.all([
      sb.from("memberships").select("organisation_id").eq("user_id", user.id).limit(1).maybeSingle(),
      sb.from("form_versions").select("id").eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (!memberRes.data?.organisation_id) {
      toast({ title: "No organisation found", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!fvRes.data?.id) {
      toast({ title: "No published form version available", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await sb.from("assessments").insert({
      id: newUuid(),
      organisation_id: memberRes.data.organisation_id,
      form_version_id: fvRes.data.id,
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

  const sortedLocations = [...locations].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return t(a.name).localeCompare(t(b.name));
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New assessment
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>New assessment</DialogTitle>
          </DialogHeader>
          <form
            id="new-assessment"
            onSubmit={(e) => { e.preventDefault(); void create(); }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="asmnt-location" className="field-label">
                Location
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="asmnt-location">
                  <SelectValue placeholder="Select location…" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {"  ".repeat(loc.level)}{t(loc.name)} ({loc.code})
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
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-assessment"
              disabled={loading || !locationId}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
