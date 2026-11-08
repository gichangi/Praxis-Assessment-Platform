import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { myMembership } from "@/lib/org";
import type { LocationOption } from "@/lib/team";
import { InviteUserForm } from "./InviteUserForm";

export const dynamic = "force-dynamic";

export default async function NewMemberPage() {
  const sb = createClient();
  const [admin, { data: locs }] = await Promise.all([
    myMembership(sb, ["super_admin"]),
    sb.from("locations").select("id, name, level").order("level").order("code"),
  ]);

  const locations: LocationOption[] = (locs ?? []).map((l) => ({
    id: l.id,
    name: (l.name as Record<string, string>)?.en ?? l.id,
    level: l.level ?? 0,
  }));

  return (
    <div className="page-container max-w-3xl">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to team members
      </Link>

      <PageHeader
        title="Add a team member"
        eyebrow="BETTER TOGETHER"
        description="They can sign in as soon as you add them."
      />

      {admin ? (
        <InviteUserForm orgId={admin.organisation_id} locations={locations} />
      ) : (
        <Card>
          <EmptyState
            title="Only a super admin can add members"
            description="Ask a super admin to add this person for you."
          />
        </Card>
      )}
    </div>
  );
}
