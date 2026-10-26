import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  ClipboardList,
  FileText,
  MapPin,
  Clock3,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AssessmentTable } from "@/components/AssessmentTable";
import { assessmentRows } from "@/lib/assessment-rows";
import { t } from "@/lib/utils";
import { DashboardCharts } from "./DashboardCharts";
import { NewFormButton } from "../forms/NewFormButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const { data: membership } = await sb
    .from("memberships")
    .select("organisation_id")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .maybeSingle();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return {
      start,
      end,
      month: start.toLocaleDateString("en", { month: "short", timeZone: "UTC" }),
    };
  });
  const [
    drafts,
    submitted,
    approved,
    returned,
    total,
    locationCount,
    recent,
    activity,
    locationScores,
  ] = await Promise.all([
    sb
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "draft"),
    sb
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "submitted"),
    sb
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "approved"),
    sb
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "returned"),
    sb.from("assessments").select("*", { count: "exact", head: true }).is("deleted_at", null),
    sb.from("locations").select("*", { count: "exact", head: true }).eq("active", true),
    sb
      .from("assessments")
      .select("id, status, assessed_on, totals, locations(name), profiles!created_by(full_name)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
    Promise.all(
      months.map(({ start, end }) =>
        sb
          .from("assessments")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null)
          .gte("created_at", start.toISOString())
          .lt("created_at", end.toISOString())
      )
    ),
    sb
      .from("assessments")
      .select("location_id, totals, locations(name)")
      .is("deleted_at", null)
      .eq("status", "approved")
      .eq("organisation_id", membership?.organisation_id ?? "")
      .order("assessed_on", { ascending: false })
      .limit(1000),
  ]);
  const hasError = [
    drafts,
    submitted,
    approved,
    returned,
    total,
    locationCount,
    recent,
    ...activity,
    locationScores,
  ].some((result) => result.error);
  const pipelineError = [drafts, submitted, approved, returned, total].some(
    (result) => result.error
  );
  const stats = [
    {
      label: "Total assessments",
      value: total.error ? null : (total.count ?? 0),
      note: "Across all stages",
      icon: ClipboardList,
      href: "/assessments",
      color: "bg-primary-50 text-primary",
    },
    {
      label: "Awaiting review",
      value: submitted.error ? null : (submitted.count ?? 0),
      note: "Ready for your attention",
      icon: Clock3,
      href: "/assessments?status=submitted",
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Approved",
      value: approved.error ? null : (approved.count ?? 0),
      note: "Reviewed and finalised",
      icon: CheckCheck,
      href: "/assessments?status=approved",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active locations",
      value: locationCount.error ? null : (locationCount.count ?? 0),
      note: "In your workspace",
      icon: MapPin,
      href: "/locations",
      color: "bg-violet-50 text-violet-600",
    },
  ];
  const pipeline = [
    { label: "Draft", count: drafts.count ?? 0, color: "bg-slate-400", status: "draft" },
    { label: "Submitted", count: submitted.count ?? 0, color: "bg-amber-400", status: "submitted" },
    { label: "Approved", count: approved.count ?? 0, color: "bg-primary", status: "approved" },
    { label: "Returned", count: returned.count ?? 0, color: "bg-rose-400", status: "returned" },
  ];
  const seen = new Set<string>();
  const scores = (locationScores.data ?? [])
    .filter((row) => {
      if (seen.has(row.location_id)) return false;
      seen.add(row.location_id);
      return true;
    })
    .map((row) => ({
      location: t((row.locations as { name?: Record<string, string> } | null)?.name),
      pct: (row.totals as { pct?: number } | null)?.pct ?? null,
    }))
    .filter((row): row is { location: string; pct: number } => row.pct != null)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="page-container">
      <PageHeader
        title="Workspace overview"
        eyebrow="THE BIG PICTURE"
        description="A clearer view of your assessments, your evidence, and what comes next."
      >
        <Button asChild variant="outline">
          <Link href="/compare">
            <ArrowUpRight className="h-4 w-4" />
            Compare results
          </Link>
        </Button>
        <NewFormButton />
      </PageHeader>
      {hasError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Some workspace data couldn’t be loaded. Refresh to try again; unavailable metrics are
          shown as a dash.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        {stats.map(({ label, value, note, icon: Icon, href, color }) => (
          <Link
            href={href}
            key={label}
            className="group rounded-card border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted">{label}</span>
              <span className={`rounded-[10px] p-2 ${color}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
            <p className="mt-3 text-[32px] font-semibold leading-none tracking-tight tabular-nums">
              {value?.toLocaleString() ?? "—"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-muted">{note}</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-border transition-colors group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <DashboardCharts
          activity={months.map((month, index) => ({
            month: month.month,
            total: activity[index].count ?? 0,
          }))}
          scores={scores}
          activityError={activity.some((result) => !!result.error)}
          scoresError={!!locationScores.error}
        />
        <Card>
          <CardHeader className="pb-5">
            <CardTitle>Assessment pipeline</CardTitle>
            <p className="text-xs text-muted">Every stage, in one place.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((stage) => (
              <Link
                href={`/assessments?status=${stage.status}`}
                key={stage.label}
                className="group block"
              >
                <div className="mb-2 flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted">
                    <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                    {stage.label}
                  </span>
                  <span className="font-semibold tabular-nums group-hover:text-primary">
                    {pipelineError ? "—" : stage.count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                  <div
                    className={`h-full rounded-full ${stage.color}`}
                    style={{ width: `${total.count ? (stage.count / total.count) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            ))}
            <div className="!mt-6 rounded-xl bg-primary-50 p-4">
              <p className="text-xs font-semibold text-primary">
                {submitted.error
                  ? "Review your submissions"
                  : submitted.count
                    ? `${submitted.count} ${submitted.count === 1 ? "assessment needs" : "assessments need"} a review`
                    : "You’re all caught up"}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                {submitted.count
                  ? "A quick review keeps your team moving forward."
                  : "New submissions will appear here when they’re ready."}
              </p>
              <Link
                href="/assessments?status=submitted"
                className="mt-3 flex items-center gap-2 text-xs font-medium text-primary"
              >
                Open review queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <AssessmentTable rows={assessmentRows(recent.data ?? [])} recent hasError={!!recent.error} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[11px] text-muted">
        <span>Praxis · Insight into action.</span>
        <Link href="/help" className="flex items-center gap-1.5 hover:text-primary">
          <FileText className="h-3.5 w-3.5" />
          Platform guide
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
