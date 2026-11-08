import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Settings, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { t, fmtDate, cn } from "@/lib/utils";
import { FORM_MANAGER_ROLES, myMembership } from "@/lib/org";
import { defaultTitleLanguage, formReadiness } from "@/lib/forms";
import { assignmentCoverage, buildTree } from "@/lib/assignment-tree";
import { nextVersion, versionStatusLabel } from "@/lib/versions";
import { NewVersionButton } from "./NewVersionButton";
import { FormAssignments, type LocationChoice, type PersonChoice } from "./FormAssignments";
import { FormSettings } from "./FormSettings";
import { Pagination } from "@/components/Pagination";
import { pageSlice, parsePage, parsePageSize } from "@/lib/pagination";

const VERSIONS_PER_PAGE = 10;

export const dynamic = "force-dynamic";

const ASSESSING_ROLES = new Set(["assessor", "manager", "super_admin"]);

function Stat({
  label,
  value,
  warn,
  href,
}: {
  label: string;
  value: string;
  warn?: boolean;
  href?: string;
}) {
  const body = (
    <div
      className={cn(
        "rounded-card border px-5 py-4",
        warn ? "border-amber-200 bg-amber-50" : "border-border bg-surface"
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className={cn("mt-1.5 text-xl font-semibold", warn && "text-amber-800")}>{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} scroll={false} className="block transition-opacity hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

function Tab({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 pt-2 text-sm transition-colors",
        active
          ? "border-primary font-semibold text-primary"
          : "border-transparent text-muted hover:text-text-main"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export default async function FormPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string; page?: string; size?: string };
}) {
  const tab =
    searchParams.tab === "assignment"
      ? "assignment"
      : searchParams.tab === "details"
        ? "details"
        : "versions";
  const sb = createClient();
  const [{ data: form }, manager, assignmentRes, locationRes, memberRes] = await Promise.all([
    sb
      .from("forms")
      .select(
        "id, key, title, active, organisation_id, form_versions(id, version, status, updated_at, published_at)"
      )
      .eq("id", params.id)
      .single(),
    myMembership(sb, FORM_MANAGER_ROLES),
    sb
      .from("form_assignments")
      .select("location_id, user_id")
      .eq("form_id", params.id)
      .order("created_at"),
    sb.from("locations").select("id, parent_id, name, level").order("level").order("code"),
    sb.from("memberships").select("user_id, role, location_id, profiles(full_name)"),
  ]);
  if (!form) notFound();

  const versions = [...(form.form_versions ?? [])].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at)
  );
  const versionSize = parsePageSize(searchParams.size, VERSIONS_PER_PAGE);
  const versionPage = pageSlice(versions, parsePage(searchParams.page), versionSize);
  const active = versions.find((v) => v.status === "published");
  const draft = versions.find((v) => v.status === "draft");
  // New versions start from the active one (or the latest if none is active yet).
  const source = active ?? versions[0];

  const locations: LocationChoice[] = (locationRes.data ?? []).map((l) => ({
    id: l.id,
    parent_id: l.parent_id,
    name: t(l.name as Record<string, string>),
    level: l.level,
  }));

  const assignmentRows = assignmentRes.data ?? [];
  const assignmentCount = assignmentRows.length;
  const coverage = assignmentCoverage(buildTree(locations), assignmentRows);

  // Everyone who can start an assessment, one entry per person (a person can hold several roles).
  const locationName = new Map(locations.map((l) => [l.id, l.name]));
  const byUser = new Map<string, PersonChoice>();
  for (const m of memberRes.data ?? []) {
    if (!ASSESSING_ROLES.has(m.role)) continue;
    const role = m.role.replace(/_/g, " ");
    const scope = m.location_id
      ? (locationName.get(m.location_id) ?? "Unknown location")
      : "All locations";
    const existing = byUser.get(m.user_id);
    if (existing) {
      existing.scopeIds.push(m.location_id);
      if (!existing.role.split(" / ").includes(role)) existing.role += ` / ${role}`;
      if (!existing.scopeLabel.split(", ").includes(scope)) existing.scopeLabel += `, ${scope}`;
    } else {
      byUser.set(m.user_id, {
        id: m.user_id,
        name:
          (m.profiles as { full_name?: string } | null)?.full_name ||
          `Unnamed (${m.user_id.slice(0, 8)})`,
        role,
        scopeIds: [m.location_id],
        scopeLabel: scope,
      });
    }
  }
  const people = [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name));

  const readiness = formReadiness({
    activeVersion: active?.version,
    draftVersion: draft?.version,
    assignmentCount: assignmentCount,
    enabled: form.active,
  });
  const canManage = !!manager;

  // Only form managers may ask, and the count covers assessments they can't otherwise see.
  const assessmentCount = canManage
    ? ((await sb.rpc("form_assessment_count", { p_form: form.id })).data ?? 0)
    : 0;
  const titles = form.title as Record<string, string>;

  return (
    <div className="page-container">
      <Link
        href="/forms"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to form library
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">{t(form.title as Record<string, string>)}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="font-mono">{form.key}</span>
            {canManage && (
              <>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                <Badge
                  variant={
                    readiness.tone === "success"
                      ? "success"
                      : readiness.tone === "warning"
                        ? "warning"
                        : "outline"
                  }
                >
                  {readiness.label}
                </Badge>
              </>
            )}
          </div>
        </div>
        {canManage && draft && (
          <Button asChild size="lg">
            <Link href={`/forms/${draft.id}/builder`}>Edit draft v{draft.version}</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active version" value={active ? `v${active.version}` : "None"} />
        <Stat label="Draft version" value={draft ? `v${draft.version}` : "None"} />
        <Stat
          label="Assigned users"
          value={coverage.allUsers ? "All" : String(coverage.users)}
          warn={canManage && !!active && assignmentCount === 0}
          href="?tab=assignment"
        />
        <Stat
          label="Assigned locations"
          value={coverage.allLocations ? "All" : String(coverage.locations)}
          warn={canManage && !!active && assignmentCount === 0}
          href="?tab=assignment"
        />
      </div>

      <nav aria-label="Form sections" className="flex gap-7 border-b border-border">
        <Tab
          href="?tab=versions"
          active={tab === "versions"}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
        >
          Versions
        </Tab>
        <Tab
          href="?tab=assignment"
          active={tab === "assignment"}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
        >
          Assignment
          <Badge variant="outline">{assignmentCount}</Badge>
        </Tab>
        {canManage && (
          <Tab
            href="?tab=details"
            active={tab === "details"}
            icon={<Settings className="h-4 w-4" aria-hidden="true" />}
          >
            Details
          </Tab>
        )}
      </nav>

      {tab === "details" && canManage ? (
        <FormSettings
          formId={form.id}
          formKey={form.key}
          title={titles}
          defaultLanguage={defaultTitleLanguage(titles)}
          active={form.active}
          assessmentCount={assessmentCount}
          versionCount={versions.length}
        />
      ) : tab === "versions" || tab === "details" ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <h2 className="font-serif text-lg font-semibold">Version history</h2>
            {canManage && source && !draft && (
              <NewVersionButton
                sourceVersionId={source.id}
                sourceVersion={source.version}
                suggested={nextVersion(versions.map((v) => v.version))}
              />
            )}
          </div>
          {versions.length ? (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Version</th>
                      <th scope="col">Status</th>
                      <th scope="col">Description</th>
                      <th scope="col">Last updated / published</th>
                      <th scope="col" className="text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {versionPage.items.map((version) => {
                      const isActive = version.status === "published";
                      const isDraft = version.status === "draft";
                      return (
                        <tr key={version.id}>
                          <td className="font-semibold">v{version.version}</td>
                          <td>
                            <Badge variant={isActive ? "success" : isDraft ? "warning" : "outline"}>
                              {versionStatusLabel(version.status)}
                            </Badge>
                          </td>
                          <td className="text-muted">
                            {isActive
                              ? "Published version in use"
                              : isDraft
                                ? active
                                  ? `Replaces v${active.version} when published`
                                  : "Not published yet"
                                : "Replaced by a newer version"}
                          </td>
                          <td className="whitespace-nowrap text-muted">
                            {isActive
                              ? `Published ${fmtDate(version.published_at)}`
                              : `Last updated ${fmtDate(version.updated_at)}`}
                          </td>
                          <td className="text-right">
                            <Button
                              asChild
                              size="sm"
                              variant={isDraft && canManage ? "default" : "outline"}
                            >
                              <Link href={`/forms/${version.id}/builder`}>
                                {isDraft ? "Edit" : "View"}
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={versionPage.page}
                total={versionPage.total}
                pageSize={versionSize}
                defaultPageSize={VERSIONS_PER_PAGE}
                noun="versions"
                basePath={`/forms/${form.id}`}
                params={{ tab: "versions" }}
                className="border-t border-border px-5 py-3"
              />
            </>
          ) : (
            <EmptyState
              title="No versions yet"
              description="Versions appear here when a draft is created."
            />
          )}
        </Card>
      ) : (
        <FormAssignments
          formId={form.id}
          organisationId={form.organisation_id}
          canManage={canManage}
          activeVersion={active?.version ?? null}
          locations={locations}
          people={people}
        />
      )}
    </div>
  );
}
