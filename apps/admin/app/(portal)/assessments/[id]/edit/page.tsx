import { notFound, redirect } from "next/navigation";
import { CalendarDays, FileText, Globe, MapPin, User } from "lucide-react";
import type { FormDefinition } from "@assessment/core";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEntry } from "@/components/assessment/AssessmentEntry";
import { ReviewDecision } from "@/components/assessment/ReviewDecision";
import { AssessmentIntro, LANGUAGE_NAMES, SetupStatic } from "@/components/assessment/setup";
import { canEditAssessment } from "@/lib/assessment-access";
import { fromRows } from "@/lib/assessment-entry";
import { fmtDate, t } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditAssessmentPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const [{ data: a }, { data: auth }] = await Promise.all([
    sb
      .from("assessments")
      .select(
        "id, status, organisation_id, form_version_id, location_id, language, assessed_on, created_by, assessors, form_versions(version, definition, forms(title)), locations(name), profiles!created_by(full_name), reviewer:profiles!reviewed_by(full_name), review_note, reviewed_at"
      )
      .eq("id", params.id)
      .single(),
    sb.auth.getUser(),
  ]);
  if (!a) notFound();

  // Only the person it belongs to can edit, and never once it is approved.
  const canEdit = canEditAssessment({
    status: a.status,
    createdBy: a.created_by,
    assessors: a.assessors,
    userId: auth.user?.id,
  });
  if (!canEdit) redirect(`/assessments/${a.id}`);

  const { data: rows } = await sb
    .from("responses")
    .select("item_key, value, not_assessed, note")
    .eq("assessment_id", a.id);

  const version = a.form_versions as {
    version: string;
    definition: unknown;
    forms: { title: Record<string, string> } | null;
  } | null;
  if (!version) notFound();

  const place = t((a.locations as { name?: Record<string, string> } | null)?.name);
  const title = t(version.forms?.title);
  const date = fmtDate(a.assessed_on);
  const language = LANGUAGE_NAMES[a.language] ?? a.language;
  const assessor = (a.profiles as { full_name?: string } | null)?.full_name || "—";
  const icon = "h-4 w-4 shrink-0 text-muted";

  return (
    <AssessmentEntry
      reopen={a.status === "submitted"}
      summary={
        <ReviewDecision
          status={a.status}
          reviewer={(a.reviewer as { full_name?: string } | null)?.full_name}
          reviewedAt={a.reviewed_at}
          note={a.review_note}
        />
      }
      title={title}
      place={place}
      dateLabel={date}
      languageLabel={language}
      intro={
        <AssessmentIntro
          backHref={`/assessments/${a.id}`}
          backLabel="Back to assessment"
          title={
            a.status === "returned"
              ? "Returned for changes"
              : a.status === "submitted"
                ? "Edit assessment"
                : "Continue assessment"
          }
          description={
            a.status === "submitted"
              ? "Your first save moves it back to draft. Submit it again when you are done."
              : "Pick up where you left off. Save a draft any time, and submit once the required questions are answered."
          }
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
            {assessor}
          </SetupStatic>
        </>
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
