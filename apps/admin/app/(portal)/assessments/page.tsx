import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AssessmentTable } from "@/components/AssessmentTable";
import { assessmentRows } from "@/lib/assessment-rows";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewAssessmentButton } from "./NewAssessmentButton";

export const dynamic = "force-dynamic";
const STATUSES = ["draft", "submitted", "returned", "approved"] as const;

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const sb = createClient();
  const status = STATUSES.find((value) => value === searchParams.status) ?? "";
  const parsedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
  const pageSize = 25;

  const [locationsRes] = await Promise.all([
    sb.from("locations").select("id, parent_id, code, name, level").order("level").order("code"),
  ]);
  const locations = locationsRes.data ?? [];

  let query = sb
    .from("assessments")
    .select(
      "id, status, assessed_on, language, totals, locations(name), profiles!created_by(full_name), form_versions(version, id)",
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (status) query = query.eq("status", status);
  const { data: rows, count, error } = await query;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="page-container">
      <PageHeader
        title="Assessments"
        eyebrow="YOUR EVIDENCE, ORGANISED"
        description="Follow each assessment from first draft to final approval."
      >
        <NewAssessmentButton locations={locations} />
      </PageHeader>
      <nav className="status-tabs w-fit max-w-full" aria-label="Filter assessments by status">
        {["", ...STATUSES].map((value) => (
          <Link
            key={value}
            href={value ? `/assessments?status=${value}` : "/assessments"}
            aria-current={status === value ? "page" : undefined}
            className={cn("status-tab", status === value && "status-tab-active")}
          >
            {value || "All assessments"}
          </Link>
        ))}
      </nav>
      <AssessmentTable rows={assessmentRows(rows ?? [])} total={total} hasError={!!error} />
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>
            {rows?.length
              ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} assessments`
              : "No assessments on this page"}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/assessments?status=${status}&page=${page - 1}`}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              </Button>
            )}
            <span className="px-2">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/assessments?status=${status}&page=${page + 1}`}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
