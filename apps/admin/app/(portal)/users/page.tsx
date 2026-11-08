import Link from "next/link";
import { Pencil, Plus, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtDate } from "@/lib/utils";
import { myMembership } from "@/lib/org";
import { initials } from "@/lib/team";
import { Pagination } from "@/components/Pagination";
import { PAGE_SIZE, pageSlice, parsePage, parsePageSize } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const ROLE_VARIANT = {
  super_admin: "default",
  form_editor: "default",
  translator: "outline",
  manager: "warning",
  assessor: "success",
  viewer: "outline",
} as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; size?: string };
}) {
  const sb = createClient();
  const [{ data: memberships, error }, admin, { data: emailRows }] = await Promise.all([
    sb
      .from("memberships")
      .select(
        "id, user_id, role, location_id, created_at, profiles(full_name, active), locations(name)"
      )
      .order("created_at", { ascending: false }),
    myMembership(sb, ["super_admin"]),
    sb.rpc("member_emails"),
  ]);
  const canManage = !!admin;
  // Sign-in emails are only returned to super admins, so the column only appears for them.
  const emailByUser = new Map((emailRows ?? []).map((r) => [r.user_id, r.email]));

  // A person with several locations has one membership per location; show them once.
  type Person = {
    id: string;
    userId: string;
    name: string;
    role: string;
    active: boolean;
    places: string[];
    everywhere: boolean;
    joined: string;
  };
  const people = new Map<string, Person>();
  for (const m of memberships ?? []) {
    const key = `${m.user_id}:${m.role}`;
    const place = (m.locations as { name?: Record<string, string> } | null)?.name?.en;
    const existing = people.get(key);
    if (existing) {
      if (place) existing.places.push(place);
      else existing.everywhere = true;
      if (m.created_at < existing.joined) existing.joined = m.created_at;
    } else {
      people.set(key, {
        id: m.id,
        userId: m.user_id,
        name: (m.profiles as { full_name?: string } | null)?.full_name || "Team member",
        role: m.role,
        active: (m.profiles as { active?: boolean } | null)?.active !== false,
        places: place ? [place] : [],
        everywhere: !place,
        joined: m.created_at,
      });
    }
  }
  const members = [...people.values()];
  const pageSize = parsePageSize(searchParams.size, PAGE_SIZE);
  const paged = pageSlice(members, parsePage(searchParams.page), pageSize);

  return (
    <div className="page-container">
      <PageHeader
        title="Team members"
        eyebrow="BETTER TOGETHER"
        description="The people behind your assessments. Manage workspace access and responsibilities."
      >
        {canManage && (
          <Button asChild>
            <Link href="/users/new">
              <Plus className="h-4 w-4" />
              Add member
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Your team
            <span className="ml-1 rounded-md bg-bg px-2 py-0.5 text-[11px] text-muted">
              {members.length}
            </span>
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck className="h-3.5 w-3.5" />
            Access is defined by role
          </span>
        </div>
        <CardContent className="p-0">
          {members.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Team member</th>
                    {canManage && <th scope="col">Username</th>}
                    <th scope="col">Role</th>
                    <th scope="col">Location</th>
                    <th scope="col">Joined</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((member) => {
                    const name = member.name;
                    return (
                      <tr key={member.id} className={member.active ? "" : "opacity-60"}>
                        <td>
                          <Link href={`/users/${member.id}`} className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary-50 text-[11px] font-medium text-primary">
                              {initials(name)}
                            </span>
                            <span className="font-medium hover:text-primary">{name}</span>
                          </Link>
                        </td>
                        {canManage && (
                          <td className="text-xs text-muted">
                            {emailByUser.get(member.userId) ?? "—"}
                          </td>
                        )}
                        <td>
                          <Badge
                            variant={
                              ROLE_VARIANT[member.role as keyof typeof ROLE_VARIANT] ?? "outline"
                            }
                          >
                            {member.role.replace(/_/g, " ")}
                          </Badge>
                          {!member.active && (
                            <Badge variant="destructive" className="ms-2">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="text-xs text-muted">
                          {member.everywhere
                            ? "All locations"
                            : member.places.length > 2
                              ? `${member.places.slice(0, 2).join(", ")} +${member.places.length - 2}`
                              : member.places.join(", ")}
                        </td>
                        <td className="whitespace-nowrap text-xs text-muted">
                          {fmtDate(member.joined)}
                        </td>
                        <td>
                          <Link
                            href={`/users/${member.id}`}
                            className="inline-flex rounded p-1 text-muted transition-colors hover:bg-bg hover:text-fg"
                            aria-label={`Edit ${name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
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
                  : "Add a team member to start collecting, reviewing, and learning together."
              }
            />
          )}
        </CardContent>
      </Card>
      <Pagination
        page={paged.page}
        total={paged.total}
        pageSize={pageSize}
        defaultPageSize={PAGE_SIZE}
        noun="team members"
        basePath="/users"
      />
      <p className="max-w-2xl text-xs leading-relaxed text-muted">
        Assign each person a role that matches their work. Assessors collect data, managers review
        it, and viewers can explore the results.
      </p>
    </div>
  );
}
