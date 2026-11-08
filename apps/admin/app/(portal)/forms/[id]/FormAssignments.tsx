"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  buildTree,
  compressSelection,
  overlapsSelection,
  selectionAreas,
  type LocationInput,
} from "@/lib/assignment-tree";
import {
  LocationTreePicker,
  PickerFooter as Footer,
  SearchBox,
} from "@/components/LocationTreePicker";

const AVATAR_TONES = [
  "bg-primary-50 text-primary",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
];

export type LocationChoice = LocationInput;
export type PersonChoice = {
  id: string;
  name: string;
  role: string;
  /** Locations this person's access covers; null = every location. */
  scopeIds: (string | null)[];
  scopeLabel: string;
};

function PanelHeader({ step, title, hint }: { step: number; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 p-5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
        {step}
      </span>
      <div>
        <h3 className="font-serif text-lg font-semibold leading-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
    </div>
  );
}

export function FormAssignments({
  formId,
  organisationId,
  canManage,
  activeVersion,
  locations,
  people,
}: {
  formId: string;
  organisationId: string;
  canManage: boolean;
  activeVersion: string | null;
  locations: LocationChoice[];
  people: PersonChoice[];
}) {
  const tree = useMemo(() => buildTree(locations), [locations]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pickerKey, setPickerKey] = useState(0);
  const [mode, setMode] = useState<"all" | "specific">("specific");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [userQuery, setUserQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const sb = createClient();

  // People whose access reaches the chosen locations; with nothing chosen, everyone.
  const eligible = useMemo(
    () =>
      people.filter((p) => selected.size === 0 || overlapsSelection(p.scopeIds, tree, selected)),
    [people, tree, selected]
  );
  const eligibleIds = useMemo(() => new Set(eligible.map((p) => p.id)), [eligible]);
  const shownPeople = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return q ? eligible.filter((p) => `${p.name} ${p.role}`.toLowerCase().includes(q)) : eligible;
  }, [eligible, userQuery]);
  // Only people you can see in the list are assigned, so a hidden pick never slips through.
  const chosenUsers = [...picked].filter((id) => eligibleIds.has(id));
  const areas = selectionAreas(tree, selected);

  function reset() {
    setSelected(new Set());
    setPicked(new Set());
    setPickerKey((k) => k + 1);
    setUserQuery("");
  }

  async function assign() {
    if (selected.size === 0) {
      toast({ title: "Choose at least one location", variant: "destructive" });
      return;
    }
    if (mode === "specific" && chosenUsers.length === 0) {
      toast({ title: "Choose at least one user", variant: "destructive" });
      return;
    }

    const { all, locationIds } = compressSelection(tree, selected);
    const locationRows: (string | null)[] = all ? [null] : locationIds;
    const userRows: (string | null)[] = mode === "all" ? [null] : chosenUsers;
    const payload = locationRows.flatMap((location_id) =>
      userRows.map((user_id) => ({
        organisation_id: organisationId,
        form_id: formId,
        location_id,
        user_id,
      }))
    );

    setBusy(true);
    const { data, error } = await sb
      .from("form_assignments")
      .upsert(payload, { onConflict: "form_id,location_id,user_id", ignoreDuplicates: true })
      .select("id");
    setBusy(false);

    if (error) {
      toast({
        title: "Couldn’t assign the form",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    const who =
      mode === "all"
        ? "All assessors"
        : `${chosenUsers.length} ${chosenUsers.length === 1 ? "user" : "users"}`;
    const where = all
      ? "all locations"
      : `${selected.size} ${selected.size === 1 ? "location" : "locations"}`;
    if ((data ?? []).length === 0) {
      toast({
        title: "Already assigned",
        description: `${who} already had this form in ${where}.`,
      });
    } else {
      toast({
        title: "Form assigned",
        description: `${who} can now start it in ${where}.`,
        variant: "success",
      });
    }
    reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <PanelHeader
                step={1}
                title="Choose locations"
                hint="Where this form can be started. Pick a region for all its districts."
              />
              <LocationTreePicker
                key={pickerKey}
                tree={tree}
                selected={selected}
                onChange={setSelected}
              />
            </Card>

            <Card className="overflow-hidden">
              <PanelHeader
                step={2}
                title="Choose users"
                hint="Who can start this form in those locations."
              />
              <div className="border-t border-border px-5 py-3">
                <div className="grid grid-cols-2 gap-1 rounded-md bg-bg p-1 text-sm" role="tablist">
                  {(
                    [
                      ["all", "All assessors"],
                      ["specific", "Specific users"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={mode === value}
                      onClick={() => setMode(value)}
                      className={cn(
                        "rounded px-3 py-2 transition-colors",
                        mode === value
                          ? "bg-surface font-semibold text-text-main shadow-sm"
                          : "text-muted hover:text-text-main"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "all" ? (
                <div className="flex flex-col items-center gap-2 border-t border-border px-6 py-12 text-center">
                  <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                  <p className="text-sm font-medium">Every assessor can start this form</p>
                  <p className="max-w-xs text-sm text-muted">
                    In the locations you chose, limited to the places their own access covers.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 px-5 pb-3">
                    <SearchBox
                      value={userQuery}
                      onChange={setUserQuery}
                      placeholder="Search users by name or role"
                    />
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      {selected.size === 0 ? (
                        "Showing all users. Choose locations to narrow the list."
                      ) : (
                        <>
                          Showing users in
                          {areas.slice(0, 4).map((a) => (
                            <Badge key={a} variant="outline" className="normal-case">
                              {a}
                            </Badge>
                          ))}
                          {areas.length > 4 && <span>+{areas.length - 4} more</span>}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="max-h-[22rem] overflow-y-auto border-t border-border">
                    {shownPeople.length === 0 && (
                      <p className="px-5 py-8 text-center text-sm text-muted">
                        No users match. Try another search or location.
                      </p>
                    )}
                    {shownPeople.map((p) => {
                      const initials = p.name
                        .split(" ")
                        .filter((w) => /^[^\s()0-9]/.test(w))
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase())
                        .join("");
                      const tone = AVATAR_TONES[p.name.length % AVATAR_TONES.length];
                      return (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-border/70 px-5 py-2.5 last:border-0 hover:bg-bg/60"
                        >
                          <input
                            type="checkbox"
                            checked={picked.has(p.id)}
                            onChange={() =>
                              setPicked((prev) => {
                                const next = new Set(prev);
                                if (next.has(p.id)) next.delete(p.id);
                                else next.add(p.id);
                                return next;
                              })
                            }
                            aria-label={`Select ${p.name}`}
                            className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                          />
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                              tone
                            )}
                            aria-hidden="true"
                          >
                            {initials || "?"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{p.name}</span>
                            <span className="block truncate text-xs text-muted">
                              {p.scopeLabel}
                            </span>
                          </span>
                          <Badge variant="outline">{p.role}</Badge>
                        </label>
                      );
                    })}
                  </div>
                  <Footer
                    onSelectAll={() => setPicked(new Set(shownPeople.map((p) => p.id)))}
                    onClear={() => setPicked(new Set())}
                  >
                    <strong>{chosenUsers.length}</strong> of {eligible.length} users selected
                  </Footer>
                </>
              )}
            </Card>
          </div>

          <Card className="flex flex-wrap items-center gap-x-7 gap-y-4 px-6 py-4">
            <div>
              <p className="text-2xl font-semibold leading-none">{selected.size}</p>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                Locations
              </p>
            </div>
            <span className="h-9 w-px bg-border" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">
                {mode === "all" ? "All" : chosenUsers.length}
              </p>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                Users
              </p>
            </div>
            <div className="min-w-[14rem] flex-1 text-sm">
              <p className="font-medium">
                {activeVersion ? `Form v${activeVersion} (active)` : "No active version yet"}
              </p>
              <p className="text-muted">
                Selected users can start it only in the chosen locations.
              </p>
            </div>
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
            <Button size="lg" onClick={() => void assign()} disabled={busy}>
              <Users className="h-4 w-4" />
              {busy
                ? "Saving…"
                : mode === "all"
                  ? "Assign to all assessors"
                  : `Assign to ${chosenUsers.length} ${chosenUsers.length === 1 ? "user" : "users"}`}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
