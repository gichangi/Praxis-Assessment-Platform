export const ALL_LOCATIONS = "__all__";

export type LocationOption = { id: string; name: string; level: number };

export const ROLES: { value: string; label: string; hint: string }[] = [
  { value: "assessor", label: "Assessor", hint: "Collects assessments in the field." },
  { value: "manager", label: "Manager", hint: "Reviews and approves assessments." },
  { value: "form_editor", label: "Form editor", hint: "Builds, publishes and assigns forms." },
  { value: "translator", label: "Translator", hint: "Translates form text." },
  { value: "viewer", label: "Viewer", hint: "Views results only." },
  { value: "super_admin", label: "Super admin", hint: "Full access, including team and settings." },
];

export function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label ?? role.replace(/_/g, " ");
}

export function roleHint(role: string): string {
  return ROLES.find((r) => r.value === role)?.hint ?? "";
}

export function initials(name: string): string {
  const letters = name
    .split(" ")
    .filter((w) => /^[^\s()0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return letters || "?";
}

const AVATAR_TONES = [
  "bg-primary-50 text-primary",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
];

export function avatarTone(name: string): string {
  return AVATAR_TONES[name.length % AVATAR_TONES.length];
}

/** Why a new password can't be used yet, or null when it's fine. */
export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < 8) return "The password needs at least 8 characters.";
  if (password !== confirm) return "The passwords don’t match.";
  return null;
}
