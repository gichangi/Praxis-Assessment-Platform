import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@assessment/api-types";

export type AppRole = Database["public"]["Enums"]["app_role"];

/** Roles that may create forms and assign them. Mirrors the form/form_assignment RLS policies. */
export const FORM_MANAGER_ROLES: AppRole[] = ["super_admin", "form_editor"];

/**
 * The signed-in person's own membership, preferring one whose role is in `roles`.
 * Always filters by user: a super admin can read everyone's rows, so an unfiltered
 * `.limit(1)` would return somebody else's membership.
 */
export async function myMembership(sb: SupabaseClient<Database>, roles?: AppRole[]) {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from("memberships")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .order("created_at");
  const rows = data ?? [];
  return (roles ? rows.find((m) => roles.includes(m.role)) : rows[0]) ?? null;
}
