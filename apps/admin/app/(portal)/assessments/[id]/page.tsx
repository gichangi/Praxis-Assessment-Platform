import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, FileText, Globe, MapPin, Pencil, User } from "lucide-react";
import type { FormDefinition } from "@assessment/core";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEntry } from "@/components/assessment/AssessmentEntry";
import { AssessmentIntro, LANGUAGE_NAMES, SetupStatic } from "@/components/assessment/setup";
import { ReviewDecision } from "@/components/assessment/ReviewDecision";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canEditAssessment } from "@/lib/assessment-access";
import { fromRows } from "@/lib/assessment-entry";
import { statusVariant } from "@/lib/assessment-status";
import { fmtDate, fmtPct, t } from "@/lib/utils";
import { ReviewActions } from "./ReviewActions";

export const dynamic = "force-dynamic";

type Totals = {
  score?: number;
  max?: number;
  pct?: number;
  sections?: Record<string, { score: number; max: number; pct: number }>;
};

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const [{ data: a }, { data: auth }] = await Promise.all([
    sb
      .from("assessments")
      .select(
        "*, form_versions(version, definition, forms(title)), locations(name), profiles!created_by(full_name), reviewer:profiles!reviewed_by(full_name)"
      )
      .eq("id", params.id)
      .single(),
    sb.auth.getUser(),
  ]);

  if (!a) notFound();

  const { data: rows } = await sb
    .from("responses")
    .select("item_key, value, not_assessed, note")
    .eq("assessment_id", params.id);

  const version = a.form_versions as {
    version: string;
    definition: unknown;
    forms: { title: Record<string, string> } | null;
  } | null;
  if (!version) notFound();

  // Only the person it belongs to can change it, and never once it is approved.
  const canEdit = canEditAssessment({
    status: a.status,
    createdBy: a.created_by,
    assessors: a.assessors,
    userId: auth.user?.id,
  });
  const mine = !!auth.user && a.created_by === auth.user.id;

  const totals = a.totals as Totals | null;
  const place = t((a.locations as { name?: Record<string, string> } | null)?.name);
  const title = t(version.forms?.title);
  const date = fmtDate(a.assessed_on);
  const language = LANGUAGE_NAMES[a.language] ?? a.language;
  const author = (a.profiles as { full_name?: string } | null)?.full_name ?? "—";
  const icon = "h-4 w-4 shrink-0 text-muted";

  const badge = <Badge variant={statusVariant(a.status)}>{a.status}</Badge>;

  return (
    <AssessmentEntry
      readOnly
      title={title}
      place={place}
      dateLabel={date}
      languageLabel={language}
      statusBadge={badge}
      sectionScores={totals?.sections}
      intro={
        <AssessmentIntro
          backHref="/assessments"
          backLabel="Back to assessments"
          title="Assessment details"
          description={`${mine ? "Started by you" : `Started by ${author}`} on ${date}.`}
        />
      }
      setup={
        <>
          <SetupStatic
            step={1}
            label="Form"
            icon={<FileText className={icon} aria-hidden="true" />}
            aside={`v${version.version}`}
          >
            {title}
          </SetupStatic>
          <SetupStatic
            step={2}
            label="Location"
            icon={<MapPin className={icon} aria-hidden="true" />}
          >
            {place}
          </SetupStatic>
          <SetupStatic
            step={3}
            label="Date"
            icon={<CalendarDays className={icon} aria-hidden="true" />}
          >
            {date}
          </SetupStatic>
          <SetupStatic
            step={4}
            label="Language"
            icon={<Globe className={icon} aria-hidden="true" />}
          >
            {language}
          </SetupStatic>
          <SetupStatic
            step={5}
            label="Assessor"
            icon={<User className={icon} aria-hidden="true" />}
          >
            {author}
          </SetupStatic>
        </>
      }
      summary={
        <div className="space-y-4">
          <ReviewDecision
            status={a.status}
            reviewer={(a.reviewer as { full_name?: string } | null)?.full_name}
            reviewedAt={a.reviewed_at}
            note={a.review_note}
          />
          {totals && typeof totals.score === "number" && (
            <div className="rounded-xl border border-border bg-bg/60 p-4">
              <p className="text-xs text-muted">Overall score</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-bold text-primary">{totals.score}</span>
                <span className="text-lg text-muted">/ {totals.max}</span>
                <span className="ms-auto text-lg font-medium">{fmtPct(totals.pct)}</span>
              </p>
            </div>
          )}
          {a.status === "submitted" && (
            <ReviewActions assessmentId={a.id} reviewNote={a.review_note ?? ""} />
          )}
        </div>
      }
      actions={
        canEdit ? (
          <div className="space-y-2">
            <Button asChild className="h-11 w-full">
              <Link href={`/assessments/${a.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit assessment
              </Link>
            </Button>
            {a.status === "submitted" && (
              <p className="text-xs text-muted">
                Editing moves it back to draft until you submit it again.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {a.status === "approved" || a.status === "rejected"
              ? `${a.status === "approved" ? "Approved" : "Rejected"} assessments can’t be edited.`
              : mine
                ? "This assessment can’t be edited."
                : "Only the person who started it can edit it."}
          </p>
        )
      }
      definition={version.definition as FormDefinition}
      language={a.language}
      meta={{
        id: a.id,
        organisationId: a.organisation_id,
        formVersionId: a.form_version_id,
        locationId: a.location_id,
        assessedOn: a.assessed_on,
      }}
      initialAnswers={fromRows(rows ?? [])}
    />
  );
}
