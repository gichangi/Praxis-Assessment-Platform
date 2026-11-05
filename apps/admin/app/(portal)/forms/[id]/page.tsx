import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Layers3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { t, fmtDate } from "@/lib/utils";
import { FORM_MANAGER_ROLES, myMembership } from "@/lib/org";
import {
  FormAssignments,
  type AssignmentRow,
  type LocationChoice,
  type PersonChoice,
} from "./FormAssignments";

export const dynamic = "force-dynamic";

export default async function FormPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const [{ data: form }, manager, assignmentRes, locationRes, peopleRes] = await Promise.all([
    sb
      .from("forms")
      .select("id, key, title, organisation_id, form_versions(id, version, status, updated_at)")
      .eq("id", params.id)
      .single(),
    myMembership(sb, FORM_MANAGER_ROLES),
    sb
      .from("form_assignments")
      .select(
        "id, created_at, locations(name), profiles!form_assignments_user_id_fkey(full_name)"
      )
      .eq("form_id", params.id)
      .order("created_at"),
    sb.from("locations").select("id, name, level").order("level").order("code"),
    sb.from("profiles").select("id, full_name").order("full_name"),
  ]);
  if (!form) notFound();
  const versions = [...(form.form_versions ?? [])].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at)
  );
  const assignments: AssignmentRow[] = (assignmentRes.data ?? []).map((a) => ({
    id: a.id,
    locationName: a.locations ? t((a.locations as { name: Record<string, string> }).name) : null,
    personName: a.profiles
      ? (a.profiles as { full_name: string }).full_name || "Unnamed team member"
      : null,
  }));
  const locations: LocationChoice[] = (locationRes.data ?? []).map((l) => ({
    id: l.id,
    name: t(l.name as Record<string, string>),
    level: l.level,
  }));
  const people: PersonChoice[] = (peopleRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || `Unnamed (${p.id.slice(0, 8)})`,
  }));
  return (
    <div className="page-container">
      <Link
        href="/forms"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to form library
      </Link>
      <PageHeader
        title={t(form.title as Record<string, string>)}
        description="View published questionnaires or continue working on a draft."
        eyebrow="QUESTIONNAIRE VERSIONS"
      />
      <Card>
        {versions.length ? (
          <div className="divide-y divide-border">
            {versions.map((version) => (
              <div key={version.id} className="flex flex-wrap items-center gap-4 p-6">
                <span className="rounded-xl bg-primary-50 p-3 text-primary">
                  <Layers3 className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold">Version {version.version}</h2>
                  <p className="mt-1 text-xs text-muted">Updated {fmtDate(version.updated_at)}</p>
                </div>
                <Badge
                  variant={
                    version.status === "published"
                      ? "success"
                      : version.status === "draft"
                        ? "warning"
                        : "outline"
                  }
                >
                  {version.status}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/forms/${version.id}/builder`}>
                    {version.status === "draft" ? "Edit draft" : "View questionnaire"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No versions yet"
            description="Versions will appear here when a draft is created."
          />
        )}
      </Card>
      <FormAssignments
        formId={form.id}
        organisationId={form.organisation_id}
        canManage={!!manager}
        assignments={assignments}
        locations={locations}
        people={people}
      />
    </div>
  );
}
