"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationTreePicker } from "@/components/LocationTreePicker";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  allLeafIds,
  buildTree,
  compressSelection,
  type LocationInput,
} from "@/lib/assignment-tree";
import { ROLES, passwordProblem, roleHint, roleLabel } from "@/lib/team";

function sameSet(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

export function MemberForm({
  membershipId,
  fullName,
  email,
  role,
  locations,
  allLocations,
  locationIds,
  active,
  isSelf,
  canEdit,
}: {
  membershipId: string;
  fullName: string;
  email: string;
  role: string;
  locations: LocationInput[];
  allLocations: boolean;
  locationIds: string[];
  active: boolean;
  isSelf: boolean;
  canEdit: boolean;
}) {
  const tree = useMemo(() => buildTree(locations), [locations]);

  const totalLeaves = useMemo(() => allLeafIds(tree).length, [tree]);

  // A membership on a region covers every district inside it; "all locations" ticks them all.
  const initialSelected = useMemo(() => {
    if (allLocations) return new Set(allLeafIds(tree));
    const s = new Set<string>();
    for (const id of locationIds) tree.byId.get(id)?.leafIds.forEach((leaf) => s.add(leaf));
    return s;
  }, [tree, allLocations, locationIds]);

  const [name, setName] = useState(fullName);
  const [mail, setMail] = useState(email);
  const [newRole, setNewRole] = useState(role);
  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [pickerKey, setPickerKey] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(active);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Names for the read-only view: the fewest places that cover the chosen districts.
  const locationNames = useMemo(
    () => compressSelection(tree, selected).locationIds.map((id) => tree.byId.get(id)?.name ?? id),
    [tree, selected]
  );

  const dirty =
    name.trim() !== fullName ||
    mail.trim() !== email ||
    newRole !== role ||
    password !== "" ||
    isActive !== active ||
    !sameSet(selected, initialSelected);

  if (!canEdit) {
    const rows: [string, string][] = [
      ["Name", fullName || "Not set"],
      ...(email ? ([["Email", email]] as [string, string][]) : []),
      ["Role", roleLabel(role)],
      ["Location access", allLocations ? "All locations" : locationNames.join(", ") || "None"],
    ];
    return (
      <dl className="divide-y divide-border border-t border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  async function save() {
    if (!name.trim()) {
      toast({ title: "Enter a name", variant: "destructive" });
      return;
    }
    if (!mail.trim()) {
      toast({ title: "Enter a sign-in email", variant: "destructive" });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "Choose at least one location", variant: "destructive" });
      return;
    }
    if (password || confirm) {
      const problem = passwordProblem(password, confirm);
      if (problem) {
        setPwError(problem);
        return;
      }
    }
    if (!dirty) {
      toast({ title: "No changes to save" });
      return;
    }

    const { all, locationIds: ids } = compressSelection(tree, selected);
    setSaving(true);
    const res = await fetch("/api/update-member", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        membership_id: membershipId,
        full_name: name.trim(),
        ...(mail.trim() !== email ? { email: mail.trim() } : {}),
        role: newRole,
        ...(password ? { password } : {}),
        ...(isActive !== active ? { active: isActive } : {}),
        location_ids: all ? null : ids,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({
        title: "Couldn’t save the changes",
        description: d.error ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Member updated", variant: "success" });
    router.push("/users");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="grid gap-8 border-t border-border p-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="member-name" className="field-label">
              Full name
            </label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div>
            <label htmlFor="member-email" className="field-label">
              Email address <span className="font-normal text-muted">(username)</span>
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                id="member-email"
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="name@organisation.org"
                className="ps-9"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              They sign in with this email. Invitations and password resets are sent here.
            </p>
          </div>

          <div>
            <label htmlFor="member-role" className="field-label">
              Role
            </label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted">{roleHint(newRole)}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="member-password" className="field-label">
                New password <span className="font-normal text-muted">(optional)</span>
              </label>
              <div className="relative">
                <Input
                  id="member-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPwError(null);
                  }}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-0 flex items-center px-3 text-muted hover:text-text-main"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="member-confirm" className="field-label">
                Confirm password
              </label>
              <Input
                id="member-confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setPwError(null);
                }}
                placeholder="Repeat the new password"
                autoComplete="new-password"
              />
              {pwError ? (
                <p role="alert" className="mt-1.5 text-xs text-red-700">
                  {pwError}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted">
                  Leave blank to keep the current password.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="field-label">Account status</p>
            <div className="flex items-start gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                label="Account active"
                disabled={isSelf}
              />
              <div className="text-sm">
                <p className="font-semibold">{isActive ? "Active" : "Inactive"}</p>
                <p className="text-xs text-muted">
                  {isSelf
                    ? "You can’t deactivate your own account."
                    : isActive
                      ? "Can sign in and sync."
                      : "Blocked from signing in and syncing. Their assessments are kept."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="field-label">Location access</p>
          <div className="overflow-hidden rounded-card border border-border [&>div:first-child]:border-t-0">
            <LocationTreePicker
              key={pickerKey}
              tree={tree}
              selected={selected}
              onChange={setSelected}
              allRow
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Tick a region to include all of its districts. All locations also includes any added
            later.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-bg/40 px-6 py-4">
        <Button asChild variant="ghost">
          <Link href="/users">Cancel</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setName(fullName);
            setMail(email);
            setNewRole(role);
            setPassword("");
            setConfirm("");
            setPwError(null);
            setIsActive(active);
            setSelected(initialSelected);
            setPickerKey((k) => k + 1);
          }}
        >
          Reset
        </Button>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
