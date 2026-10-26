import { ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtDate } from "@/lib/utils";
import { InviteUserButton } from "./InviteUserButton";
import { EditMemberButton, type LocationOption } from "./EditMemberButton";

export const dynamic = "force-dynamic";
const ROLE_VARIANT = {
  super_admin: "default",
  form_editor: "default",
  translator: "outline",
  manager: "warning",
  assessor: "success",
  viewer: "outline",
} as const;

export default async function UsersPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const [{ data: memberships, error }, { data: mem }, { data: locs }] = await Promise.all([
    sb
      .from("memberships")
      .select("id, user_id, role, location_id, created_at, profiles(full_name), locations(name)")
      .order("created_at", { ascending: false }),
    sb
      .from("memberships")
      .select("organisation_id, role")
      .eq("user_id", user?.id ?? "")
      .limit(1)
      .maybeSingle(),
    sb
      .from("locations")
      .select("id, name, level")
      .order("level")
      .order("code"),
  ]);

  const locationOptions: LocationOption[] = (locs ?? []).map((l) => ({
    id: l.id,
    name: (l.name as Record<string, string>)?.en ?? l.id,
    level: l.level ?? 0,
  }));
  return (
    <div className="page-container">
      <PageHeader
        title="Team members"
        eyebrow="BETTER TOGETHER"
        description="The people behind your assessments. Manage workspace access and responsibilities."
      >
        <InviteUserButton orgId={mem?.organisation_id ?? ""} locations={locationOptions} />
      </PageHeader>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Your team
            <span className="ml-1 rounded-md bg-bg px-2 py-0.5 text-[11px] text-muted">
              {memberships?.length ?? 0}
            </span>
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5" />
            Access is defined by role
          </span>
        </div>
        <CardContent className="p-0">
          {memberships?.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Team member</th>
                    <th scope="col">Role</th>
                    <th scope="col">Location</th>
                    <th scope="col">Joined</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((member) => {
                    const name =
                      (member.profiles as { full_name?: string })?.full_name ?? "Team member";
                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary-50 text-[11px] font-medium text-primary">
                              {name
                                .split(" ")
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")}
                            </span>
                            <span className="font-medium">{name}</span>
                          </div>
                        </td>
                        <td>
                          <Badge
                            variant={
                              ROLE_VARIANT[member.role as keyof typeof ROLE_VARIANT] ?? "outline"
                            }
                          >
                            {member.role.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="text-xs text-muted">
                          {member.locations
                            ? (member.locations as { name?: Record<string, string> })?.name?.en
                            : "All locations"}
                        </td>
                        <td className="whitespace-nowrap text-xs text-muted">
                          {fmtDate(member.created_at)}
                        </td>
                        <td>
                          <EditMemberButton
                            membership={{
                              id: member.id,
                              userId: member.user_id as string,
                              fullName: name,
                              role: member.role,
                              locationId: member.location_id as string | null,
                            }}
                            locations={locationOptions}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={error ? "Your team couldn’t be loaded" : "Make room for your team"}
              description={
                error
                  ? "Refresh this page to try again."
                  : "Invite a team member to start collecting, reviewing, and learning together."
              }
            />
          )}
        </CardContent>
      </Card>
      <p className="max-w-2xl text-xs leading-relaxed text-muted">
        Assign each person a role that matches their work. Assessors collect data, managers review
        it, and viewers can explore the results.
      </p>
    </div>
  );
}
