import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBanner } from "@/components/StatusBanner";
import { myMembership } from "@/lib/org";
import type { LocationInput } from "@/lib/assignment-tree";
import { MemberForm } from "./MemberForm";

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const [{ data: member }, admin, { data: locs }, { data: auth }] = await Promise.all([
    sb
      .from("memberships")
      .select("id, user_id, organisation_id, role, location_id, profiles(full_name, active)")
      .eq("id", params.id)
      .single(),
    myMembership(sb, ["super_admin"]),
    sb.from("locations").select("id, parent_id, name, level").order("level").order("code"),
    sb.auth.getUser(),
  ]);
  if (!member) notFound();

  // A person with several locations has one membership per location, all with the same role.
  const [{ data: group }, { data: email }] = await Promise.all([
    sb
      .from("memberships")
      .select("location_id")
      .eq("user_id", member.user_id)
      .eq("organisation_id", member.organisation_id)
      .eq("role", member.role),
    sb.rpc("member_email", { p_user: member.user_id }),
  ]);
  const scope = (group ?? [{ location_id: member.location_id }]).map((g) => g.location_id);

  const locations: LocationInput[] = (locs ?? []).map((l) => ({
    id: l.id,
    parent_id: l.parent_id,
    name: (l.name as Record<string, string>)?.en ?? l.id,
    level: l.level ?? 0,
  }));

  const profile = member.profiles as { full_name?: string; active?: boolean } | null;
  const name = profile?.full_name || "This member";
  const active = profile?.active !== false;
  const canEdit = !!admin && admin.organisation_id === member.organisation_id;

  return (
    <div className="page-container">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to team members
      </Link>

      <PageHeader
        title="Edit team member"
        description="Update their sign-in email, role and where they can work."
      />

      {!active && (
        <StatusBanner tone="warning" title={`${name} is deactivated`}>
          They can’t sign in or sync. Reactivate them below to give access back.
        </StatusBanner>
      )}

      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="font-serif text-xl font-semibold">Details</h2>
          <p className="mt-1 text-sm text-muted">
            {canEdit
              ? "Name, sign-in email, role and where they can work."
              : "Only a super admin can change these."}
          </p>
        </div>
        <MemberForm
          membershipId={member.id}
          fullName={profile?.full_name ?? ""}
          email={email ?? ""}
          role={member.role}
          locations={locations}
          allLocations={scope.some((id) => id === null)}
          locationIds={scope.filter((id): id is string => id !== null)}
          active={active}
          isSelf={auth.user?.id === member.user_id}
          canEdit={canEdit}
        />
      </Card>
    </div>
  );
}
