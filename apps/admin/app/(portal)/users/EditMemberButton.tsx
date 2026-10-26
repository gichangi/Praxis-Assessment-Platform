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
import { Pencil } from "lucide-react";
import { toast } from "@/components/ui/toast";

const ROLES = ["assessor", "manager", "form_editor", "translator", "viewer", "super_admin"];

export type LocationOption = { id: string; name: string; level: number };

export type MembershipData = {
  id: string;
  userId: string;
  fullName: string;
  role: string;
  locationId: string | null;
};

export function EditMemberButton({
  membership,
  locations,
}: {
  membership: MembershipData;
  locations: LocationOption[];
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(membership.fullName);
  const [role, setRole] = useState(membership.role);
  const [locationId, setLocationId] = useState(membership.locationId ?? "__all__");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function reset() {
    setFullName(membership.fullName);
    setRole(membership.role);
    setLocationId(membership.locationId ?? "__all__");
  }

  async function save() {
    setLoading(true);
    const res = await fetch("/api/update-member", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        membership_id: membership.id,
        full_name: fullName.trim(),
        role,
        location_id: locationId === "__all__" ? null : locationId,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({ title: d.error ?? "Update failed", variant: "destructive" });
      return;
    }
    toast({ title: "Member updated" });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded p-1 text-muted hover:text-fg hover:bg-bg transition-colors"
        aria-label="Edit member"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit team member</DialogTitle>
          </DialogHeader>
          <form
            id="edit-member"
            onSubmit={(e) => { e.preventDefault(); void save(); }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="edit-name" className="field-label">
                Full name
              </label>
              <Input
                id="edit-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina Hassan"
              />
            </div>
            <div>
              <label htmlFor="edit-role" className="field-label">
                Role
              </label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="edit-location" className="field-label">
                Location access
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="edit-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {"  ".repeat(loc.level)}{loc.name}
                    </SelectItem>
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
              form="edit-member"
              disabled={loading || !fullName.trim()}
            >
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
