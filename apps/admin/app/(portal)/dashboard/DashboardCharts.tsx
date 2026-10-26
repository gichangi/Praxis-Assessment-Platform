"use client";

import { useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

type Activity = { month: string; total: number };
type LocationScore = { location: string; pct: number };

export function DashboardCharts({
  activity,
  scores,
  activityError,
  scoresError,
}: {
  activity: Activity[];
  scores: LocationScore[];
  activityError: boolean;
  scoresError: boolean;
}) {
  const [view, setView] = useState<"activity" | "locations">("activity");
  const months = activity;
  const activityTotal = activity.reduce((sum, month) => sum + month.total, 0);
  const hasError = view === "activity" ? activityError : scoresError;
  const average = scores.length
    ? scores.reduce((sum, row) => sum + row.pct, 0) / scores.length
    : null;
  const tabs = [
    { key: "activity", label: "Activity" },
    { key: "locations", label: "Location scores" },
  ] as const;

  return (
    <Card className="flex min-h-[350px] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-4">
        <div>
          <h2 className="text-[15px] font-semibold">
            {view === "activity" ? "Assessment activity" : "Location performance"}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {view === "activity"
              ? "Assessments created over the last six months"
              : "Latest location scores in recent approvals"}
          </p>
        </div>
        <div role="tablist" aria-label="Chart view" className="flex rounded-lg bg-bg p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              tabIndex={view === key ? 0 : -1}
              id={`chart-tab-${key}`}
              aria-controls="chart-panel"
              aria-selected={view === key}
              onClick={() => setView(key)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "activity"
                    : event.key === "End"
                      ? "locations"
                      : view === "activity"
                        ? "locations"
                        : "activity";
                setView(next);
                document.getElementById(`chart-tab-${next}`)?.focus();
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                view === key
                  ? "bg-surface text-text-main shadow-sm"
                  : "text-muted hover:text-text-main"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        id="chart-panel"
        role="tabpanel"
        aria-labelledby={`chart-tab-${view}`}
        className="flex flex-1 flex-col"
      >
        {hasError ? (
          <EmptyState
            title="Chart data is unavailable"
            description="Refresh the page to try loading your workspace data again."
          />
        ) : view === "locations" && !scores.length ? (
          <EmptyState
            title="Performance starts with a review"
            description="Approve an assessment to see location scores and compare progress across your workspace."
          />
        ) : !activityTotal && view === "activity" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-2">
            <div className="mb-5 flex h-24 items-end gap-3" aria-hidden="true">
              {[28, 48, 37, 64, 51, 80].map((height, index) => (
                <span key={index} className="w-7 rounded-t-md bg-primary/10" style={{ height }} />
              ))}
            </div>
            <p className="text-sm font-medium">Your next chapter starts here</p>
            <p className="mt-2 max-w-sm text-center text-xs leading-relaxed text-muted">
              New assessments will build a picture of your team’s activity over time.
            </p>
          </div>
        ) : (
          <div className="px-3 pb-4 sm:px-5">
            <div className="mb-3 flex items-baseline gap-2 px-1">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {view === "activity" ? activityTotal.toLocaleString() : `${average?.toFixed(1)}%`}
              </span>
              <span className="text-[11px] text-muted">
                {view === "activity" ? "created in this period" : "average location score"}
              </span>
            </div>
            <div
              className="h-[215px]"
              aria-label={
                view === "activity" ? "Monthly assessment counts" : "Location score percentages"
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={view === "activity" ? months : scores.slice(0, 12)}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey={view === "activity" ? "month" : "location"}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                    dy={8}
                  />
                  <YAxis
                    domain={view === "activity" ? [0, "auto"] : [0, 100]}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--muted)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--bg)" }}
                    contentStyle={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-main)", fontSize: 12 }}
                    formatter={(value) => [
                      view === "activity" ? value : `${Number(value).toFixed(1)}%`,
                      view === "activity" ? "Assessments" : "Score",
                    ]}
                  />
                  <Bar
                    dataKey={view === "activity" ? "total" : "pct"}
                    fill="var(--primary)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <details className="mt-3 px-1 text-[11px] text-muted">
              <summary className="cursor-pointer hover:text-primary">View chart data</summary>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {view === "activity"
                  ? months.map((row) => (
                      <li key={row.month}>
                        {row.month}: {row.total} assessments
                      </li>
                    ))
                  : scores.map((row) => (
                      <li key={row.location}>
                        {row.location}: {row.pct.toFixed(1)}%
                      </li>
                    ))}
              </ul>
            </details>
            {view === "locations" && scores.length > 12 && (
              <p className="mt-2 text-[10px] text-muted">
                Chart shows the 12 highest scores. Expand the data list to see all locations.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border px-6 py-3 text-[10px] text-muted">
        <BarChart3 className="h-3.5 w-3.5" />
        {view === "activity"
          ? "Based on assessment creation dates"
          : "Based on up to 1,000 recent approved assessments"}
      </div>
    </Card>
  );
}
