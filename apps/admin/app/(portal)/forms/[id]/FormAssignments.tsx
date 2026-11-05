"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const ANY = "__all__";

export type AssignmentRow = {
  id: string;
  locationName: string | null;
  personName: string | null;
};
export type LocationChoice = { id: string; name: string; level: number };
export type PersonChoice = { id: string; name: string };

export function FormAssignments({
  formId,
  organisationId,
  canManage,
  assignments,
  locations,
  people,
}: {
  formId: string;
  organisationId: string;
  canManage: boolean;
  assignments: AssignmentRow[];
  locations: LocationChoice[];
  people: PersonChoice[];
}) {
  const [locationId, setLocationId] = useState(ANY);
  const [personId, setPersonId] = useState(ANY);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const sb = createClient();

  async function add() {
    setBusy(true);
    const { error } = await sb.from("form_assignments").insert({
      organisation_id: organisationId,
      form_id: formId,
      location_id: locationId === ANY ? null : locationId,
      user_id: personId === ANY ? null : personId,
    });
    setBusy(false);
    if (error) {
      toast({
        title: error.code === "23505" ? "This assignment already exists" : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Form assigned" });
    setLocationId(ANY);
    setPersonId(ANY);
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    const { error } = await sb.from("form_assignments").delete().eq("id", id);
    setBusy(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Assignment removed" });
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <div className="space-y-1 p-6 pb-4">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Who can use this form
        </h2>
        <p className="text-xs leading-relaxed text-muted">
          Only assigned people see this form on their phone, and only for the locations you pick.
          A location also covers everything inside it. Assessors never see places their own
          access doesn’t reach. Only published versions reach phones.
        </p>
      </div>

      {assignments.length ? (
        <ul className="divide-y divide-border border-t border-border">
          {assignments.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted" />
                {a.locationName ?? "All locations"}
              </span>
              <span className="flex flex-1 items-center gap-2">
                <User className="h-4 w-4 text-muted" />
                {a.personName ?? "Everyone with assessor access"}
              </span>
              {canManage && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(a.id)}
                  className="rounded p-1 text-muted transition-colors hover:bg-bg hover:text-fg"
                  aria-label="Remove assignment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-border px-6 py-5 text-sm text-muted">
          Not assigned yet. Nobody can start this form on their phone.
        </p>
      )}

      {canManage && (
        <form
          className="flex flex-wrap items-end gap-3 border-t border-border bg-bg/40 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="assign-location" className="field-label">
              Location
            </label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger id="assign-location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {"  ".repeat(loc.level)}
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="assign-person" className="field-label">
              Person
            </label>
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger id="assign-person">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Everyone with assessor access</SelectItem>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy}>
            <Plus className="h-4 w-4" />
            {busy ? "Saving…" : "Assign"}
          </Button>
        </form>
      )}
    </Card>
  );
}
