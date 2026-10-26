"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { fmtDate } from "@/lib/utils";

export type AssessmentTableRow = {
  id: string;
  location: string;
  assessor: string;
  date: string;
  status: string;
  score: number | null;
  max: number | null;
  pct: number | null;
  version?: string;
};

const statusVariants = {
  draft: "outline",
  submitted: "warning",
  approved: "success",
  returned: "destructive",
} as const;

export function AssessmentTable({
  rows,
  recent = false,
  total,
  hasError = false,
}: {
  rows: AssessmentTableRow[];
  recent?: boolean;
  total?: number;
  hasError?: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) =>
    `${row.location} ${row.assessor} ${row.status}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-[0_2px_8px_0_#73523908]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold">
            {recent ? "Recent assessments" : "Assessment directory"}
          </h2>
          <span className="rounded-md bg-bg px-2 py-0.5 text-[11px] font-medium text-muted">
            {total ?? rows.length}
          </span>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-52">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-muted"
              aria-hidden="true"
            />
            <Input
              className="h-9 pl-9 pr-8 text-xs"
              aria-label={recent ? "Search recent assessments" : "Search this page of assessments"}
              placeholder={recent ? "Search recent…" : "Search this page…"}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                className="absolute right-2 top-2 rounded p-0.5 text-muted"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {recent && (
            <Link
              href="/assessments"
              className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
      {filtered.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <caption className="sr-only">
              {recent ? "Recently updated assessments" : "Assessments on this page"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Location</th>
                <th scope="col">Assessor</th>
                {!recent && <th scope="col">Version</th>}
                <th scope="col">Assessed on</th>
                <th scope="col">Status</th>
                <th scope="col">Score</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      href={`/assessments/${row.id}`}
                      className="flex items-center gap-3 font-medium hover:text-primary"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg text-[10px] font-semibold text-muted"
                      >
                        {row.location.slice(0, 2).toUpperCase()}
                      </span>
                      {row.location || "Unnamed location"}
                    </Link>
                  </td>
                  <td className="text-muted">{row.assessor || "—"}</td>
                  {!recent && (
                    <td className="text-xs text-muted">{row.version ? `v${row.version}` : "—"}</td>
                  )}
                  <td className="whitespace-nowrap text-xs text-muted">{fmtDate(row.date)}</td>
                  <td>
                    <Badge
                      variant={
                        statusVariants[row.status as keyof typeof statusVariants] ?? "outline"
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                      {row.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="whitespace-nowrap text-xs font-medium tabular-nums">
                        {row.score != null && row.max != null ? `${row.score}/${row.max}` : "—"}
                      </span>
                      {row.pct != null && (
                        <span
                          className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-bg xl:block"
                          aria-hidden="true"
                        >
                          <span
                            className="block h-full rounded-full bg-primary/70"
                            style={{ width: `${Math.max(0, Math.min(100, row.pct))}%` }}
                          />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      {!recent && (row.status === "approved" || row.status === "submitted") && (
                        <Button asChild variant="ghost" size="icon">
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export?assessment_id=${row.id}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Download ${row.location || "assessment"} as XLSX`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          href={`/assessments/${row.id}`}
                          aria-label={`View ${row.location || "assessment"}`}
                        >
                          <ArrowRight className="h-4 w-4 text-muted" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={
            hasError
              ? "Assessments couldn’t be loaded"
              : search
                ? "No matching assessments"
                : "Your assessments will appear here"
          }
          description={
            hasError
              ? "Refresh this page to try again. If the issue continues, contact your workspace administrator."
              : search
                ? "Try a different location, assessor, or status."
                : "Once your team syncs an assessment from the mobile app, you can follow its progress and review it here."
          }
        />
      )}
      {!!rows.length && (
        <div className="border-t border-border px-6 py-3 text-[11px] text-muted">
          {recent ? "Most recently updated" : "On this page"} · {filtered.length}{" "}
          {filtered.length === 1 ? "assessment" : "assessments"}
          {search && " matching your search"}
        </div>
      )}
    </div>
  );
}
