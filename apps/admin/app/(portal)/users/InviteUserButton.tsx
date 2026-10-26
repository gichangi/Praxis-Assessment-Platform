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
import { Eye, EyeOff, Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { LocationOption } from "./EditMemberButton";

const ROLES = ["assessor", "manager", "form_editor", "translator", "viewer", "super_admin"];

export function InviteUserButton({
  orgId,
  locations,
}: {
  orgId: string;
  locations: LocationOption[];
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("assessor");
  const [locationId, setLocationId] = useState("__all__");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function reset() {
    setEmail("");
    setFullName("");
    setRole("assessor");
    setLocationId("__all__");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setPwError(null);
  }

  async function submit() {
    if (!email.trim() || !role) return;
    if (password && password.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (password && password !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwError(null);
    setLoading(true);
    const res = await fetch("/api/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        full_name: fullName.trim(),
        organisation_id: orgId,
        role,
        ...(locationId !== "__all__" ? { location_id: locationId } : {}),
        ...(password ? { password } : {}),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({ title: d.error ?? "Failed to add member", variant: "destructive" });
      return;
    }
    const d = await res.json();
    if (d.created) {
      toast({ title: "Member added", description: `${email} can now sign in with their password.` });
    } else {
      toast({ title: "Invitation sent", description: `Magic link sent to ${email}` });
    }
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add member
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
          </DialogHeader>
          <form
            id="invite-user"
            onSubmit={(e) => { e.preventDefault(); void submit(); }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="invite-email" className="field-label">
                Work email
              </label>
              <Input
                id="invite-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="invite-name" className="field-label">
                Full name
              </label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina Hassan"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="field-label">
                Role
              </label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
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
              <label htmlFor="invite-location" className="field-label">
                Location access
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="invite-location">
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

            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-fg">Set a password</strong> so the member can sign in
                immediately, or leave blank to send them a magic-link invite instead.
              </p>
              <div>
                <label htmlFor="invite-password" className="field-label">
                  Password <span className="font-normal text-muted">(optional)</span>
                </label>
                <div className="relative">
                  <Input
                    id="invite-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPwError(null); }}
                    placeholder="Min. 8 characters"
                    className="pr-9"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 end-0 flex items-center px-3 text-muted hover:text-fg"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {password && (
                <div>
                  <label htmlFor="invite-confirm" className="field-label">
                    Confirm password
                  </label>
                  <Input
                    id="invite-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPwError(null); }}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
              )}
              {pwError && (
                <p className="text-xs text-destructive">{pwError}</p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" form="invite-user" disabled={loading || !email.trim() || !orgId}>
              {loading ? "Adding…" : password ? "Add member" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
