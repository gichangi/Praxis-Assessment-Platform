import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AssessmentTable } from "@/components/AssessmentTable";
import { assessmentRows } from "@/lib/assessment-rows";
import { ASSESSMENT_STATUSES } from "@/lib/assessment-status";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";
import {
  PAGE_SIZE,
  pageCount,
  pageHref,
  parsePage,
  parsePageSize,
  rangeFor,
  sizeParam,
} from "@/lib/pagination";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
const STATUSES = ASSESSMENT_STATUSES;

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; size?: string };
}) {
  const sb = createClient();
  const status = STATUSES.find((value) => value === searchParams.status) ?? "";
  const page = parsePage(searchParams.page);
  const pageSize = parsePageSize(searchParams.size, PAGE_SIZE);

  let query = sb
    .from("assessments")
    .select(
      "id, status, assessed_on, language, totals, locations(name), profiles!created_by(full_name), form_versions(version, id, forms(title))",
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(...rangeFor(page, pageSize));
  if (status) query = query.eq("status", status);
  const { data: rows, count, error } = await query;
  // A page past the end (rows were removed, or an old link) goes to the last page. The database
  // refuses such a range, so the total has to be asked for separately.
  if (error?.code === "PGRST103") {
    let all = sb
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);
    if (status) all = all.eq("status", status);
    const { count: all_ } = await all;
    redirect(
      pageHref(
        "/assessments",
        { status, size: sizeParam(pageSize, PAGE_SIZE) },
        pageCount(all_ ?? 0, pageSize)
      )
    );
  }
  const total = count ?? 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Assessments"
        eyebrow="YOUR EVIDENCE, ORGANISED"
        description="Follow each assessment from first draft to final approval."
      >
        <Button asChild>
          <Link href="/assessments/new">
            <Plus className="h-4 w-4" />
            New assessment
          </Link>
        </Button>
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
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        defaultPageSize={PAGE_SIZE}
        noun="assessments"
        basePath="/assessments"
        params={{ status }}
      />
    </div>
  );
}
