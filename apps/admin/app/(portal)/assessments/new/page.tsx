import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { t } from "@/lib/utils";
import { NewAssessmentFlow, type FormChoice, type LocationChoice } from "./NewAssessmentFlow";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage() {
  const sb = createClient();

  // Only forms and locations assigned to this person (the database enforces it too).
  const { data: pairs } = await sb.rpc("my_assessable_form_locations");
  const byForm = new Map<string, string[]>();
  for (const p of pairs ?? [])
    byForm.set(p.form_id, [...(byForm.get(p.form_id) ?? []), p.location_id]);

  const [formRes, locRes] = byForm.size
    ? await Promise.all([
        sb
          .from("forms")
          .select("id, organisation_id, title, form_versions(id, version, status, published_at)")
          .in("id", [...byForm.keys()]),
        sb.from("locations").select("id, parent_id, name, level").order("level").order("code"),
      ])
    : [{ data: [] }, { data: [] }];

  const forms: FormChoice[] = [];
  for (const f of formRes.data ?? []) {
    const active = (f.form_versions ?? []).find((v) => v.status === "published");
    if (!active) continue;
    forms.push({
      id: f.id,
      organisationId: f.organisation_id,
      title: t(f.title as Record<string, string>),
      version: active.version,
      versionId: active.id,
      locationIds: byForm.get(f.id) ?? [],
    });
  }
  forms.sort((a, b) => a.title.localeCompare(b.title));

  const locations: LocationChoice[] = (locRes.data ?? []).map((l) => ({
    id: l.id,
    parent_id: l.parent_id,
    name: t(l.name as Record<string, string>),
    level: l.level,
  }));

  // The workspace fills the whole page; only the empty state sits in a normal container.
  if (forms.length) return <NewAssessmentFlow forms={forms} locations={locations} />;

  return (
    <div className="page-container max-w-4xl">
      <Link
        href="/assessments"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to assessments
      </Link>

      <PageHeader
        title="New assessment"
        eyebrow="YOUR EVIDENCE, ORGANISED"
        description="Choose a form and a location, then fill it in."
      />

      <Card>
        <EmptyState
          title="No forms assigned to you yet"
          description="Ask a form editor to assign you a published form, then come back here."
        />
      </Card>
    </div>
  );
}
