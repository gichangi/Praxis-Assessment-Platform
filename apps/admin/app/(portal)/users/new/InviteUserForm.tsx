"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ALL_LOCATIONS, ROLES, passwordProblem, roleHint, type LocationOption } from "@/lib/team";

type Method = "invite" | "password";

export function InviteUserForm({
  orgId,
  locations,
}: {
  orgId: string;
  locations: LocationOption[];
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("assessor");
  const [location, setLocation] = useState(ALL_LOCATIONS);
  const [method, setMethod] = useState<Method>("password");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    setError(null);
    if (!email.trim()) {
      setError("Enter their work email.");
      return;
    }
    if (method === "password") {
      const problem = passwordProblem(password, confirm);
      if (problem) {
        setError(problem);
        return;
      }
    }

    setLoading(true);
    const res = await fetch("/api/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        full_name: fullName.trim(),
        organisation_id: orgId,
        role,
        ...(location !== ALL_LOCATIONS ? { location_id: location } : {}),
        ...(method === "password" ? { password } : {}),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Couldn’t add this person. Please try again.");
      return;
    }
    toast({
      title: method === "password" ? "Member added" : "Invitation sent",
      description:
        method === "password"
          ? `${email.trim()} can sign in with their password now.`
          : `A sign-in link is on its way to ${email.trim()}.`,
      variant: "success",
    });
    router.push("/users");
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <form
        className="space-y-5 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="invite-email" className="field-label">
              Work email
            </label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organisation.org"
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
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted">{roleHint(role)}</p>
          </div>
          <div>
            <label htmlFor="invite-location" className="field-label">
              Location access
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="invite-location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>All locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {"  ".repeat(loc.level)}
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted">
              Includes everything inside the place you pick.
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <p className="field-label !mb-0">How will they sign in?</p>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-bg p-1 text-sm" role="tablist">
            {(
              [
                ["password", "Set a password"],
                ["invite", "Send an invite link"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={method === value}
                onClick={() => {
                  setMethod(value);
                  setError(null);
                }}
                className={cn(
                  "rounded px-3 py-2 transition-colors",
                  method === value
                    ? "bg-surface font-semibold text-text-main shadow-sm"
                    : "text-muted hover:text-text-main"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {method === "invite" ? (
            <p className="text-sm text-muted">We’ll email them a link that signs them in.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="invite-password" className="field-label">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="invite-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
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
                <label htmlFor="invite-confirm" className="field-label">
                  Confirm password
                </label>
                <Input
                  id="invite-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError(null);
                  }}
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : method === "password" ? "Add member" : "Send invite"}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/users">Cancel</Link>
          </Button>
        </div>
      </form>
    </Card>
  );
}
