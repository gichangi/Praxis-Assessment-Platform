"use client";
import { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Check, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { t, fmtDate, cn } from "@/lib/utils";

const COLORS = ["var(--primary)", "#B79B6A", "#7B8A83", "#A4877C"];
type AssessmentRow = {
  id: string;
  assessed_on: string;
  totals: {
    score: number;
    max: number;
    pct: number;
    sections?: Record<string, { score: number; max: number; pct: number }>;
  } | null;
  locations: { name: Record<string, string> } | null;
};

export default function ComparePage() {
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await createClient()
          .from("assessments")
          .select("id, assessed_on, totals, locations(name)")
          .is("deleted_at", null)
          .eq("status", "approved")
          .not("totals", "is", null)
          .order("assessed_on", { ascending: false })
          .limit(100);
        if (!cancelled) {
          setRows((data ?? []) as unknown as AssessmentRow[]);
          setError(!!error);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);
  function toggle(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : previous.length < 4
          ? [...previous, id]
          : previous
    );
  }
  const selectedRows = selected.flatMap((id) => rows.filter((row) => row.id === id));
  const sectionKeys = Array.from(
    new Set(selectedRows.flatMap((row) => Object.keys(row.totals?.sections ?? {})))
  );
  const radarData = sectionKeys.map((key) => {
    const entry: Record<string, string | number | null> = { section: key.replace(/_/g, " ") };
    selectedRows.forEach((row, index) => {
      entry[`a${index}`] = row.totals?.sections?.[key]?.pct ?? null;
    });
    return entry;
  });
  const barData = selectedRows.map((row, index) => ({
    name: `${t(row.locations?.name)} · ${fmtDate(row.assessed_on)}`,
    pct: row.totals?.pct ?? 0,
    color: COLORS[index],
  }));
  const filtered = rows.filter((row) =>
    t(row.locations?.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Compare results"
        eyebrow="A WIDER PERSPECTIVE"
        description="Explore the differences that matter. Select two to four approved assessments to compare their scores."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Choose assessments</CardTitle>
              <Badge variant="outline">{selected.length} / 4</Badge>
            </div>
            <p className="text-xs text-muted">The 100 most recent approved assessments.</p>
          </CardHeader>
          <CardContent className="px-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Find a location to compare"
                placeholder="Find a location…"
                className="pl-9"
              />
            </div>
            {loading ? (
              <div role="status" className="space-y-3 py-2">
                <p className="text-xs text-muted">Loading assessments…</p>
                {[1, 2, 3].map((key) => (
                  <div key={key} className="h-16 rounded-xl bg-bg motion-safe:animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Assessments couldn’t be loaded"
                description="Refresh this page to try again."
              />
            ) : !rows.length ? (
              <EmptyState
                title="Ready when your results are"
                description="Approved assessments will appear here for comparison."
              />
            ) : (
              <div className="max-h-[480px] space-y-2 overflow-y-auto">
                {filtered.map((row) => {
                  const index = selected.indexOf(row.id),
                    active = index >= 0;
                  return (
                    <button
                      key={row.id}
                      onClick={() => toggle(row.id)}
                      aria-pressed={active}
                      disabled={!active && selected.length === 4}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        active
                          ? "border-primary/40 bg-primary-50"
                          : "border-border hover:border-primary/30 hover:bg-bg"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          active ? "border-primary bg-primary text-white" : "border-border"
                        )}
                        aria-hidden="true"
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">
                          {t(row.locations?.name) || "Unnamed location"}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted">
                          {fmtDate(row.assessed_on)}
                        </span>
                      </span>
                      <span
                        className="text-xs font-semibold tabular-nums"
                        style={{ color: active ? COLORS[index] : undefined }}
                      >
                        {row.totals?.pct?.toFixed(0)}%
                      </span>
                    </button>
                  );
                })}
                {!filtered.length && (
                  <p className="py-8 text-center text-xs text-muted">
                    No locations match your search.
                  </p>
                )}
              </div>
            )}
            {selected.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-muted"
                onClick={() => setSelected([])}
              >
                <X className="h-3.5 w-3.5" />
                Clear selection
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="space-y-5">
          {selectedRows.length < 2 ? (
            <Card className="flex min-h-[430px] items-center justify-center p-8">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/10 bg-primary-50">
                  <BarChart3 className="h-9 w-9 text-primary" strokeWidth={1.2} />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {selectedRows.length
                    ? "One more gives you perspective."
                    : "Good decisions start with perspective."}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {selectedRows.length
                    ? "Choose another assessment to see their overall and section scores side by side."
                    : "Choose at least two approved assessments. We’ll bring their scores together so you can see where each location stands."}
                </p>
                <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-2 w-8 rounded-full",
                        index < selected.length ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Overall performance</CardTitle>
                  <p className="text-xs text-muted">Approved assessment scores, as a percentage.</p>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ left: -20, right: 8, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "var(--muted)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "var(--muted)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Score"]}
                          contentStyle={{ borderRadius: 4, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-main)", fontSize: 12 }}
                        />
                        <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {barData.map((row, index) => (
                            <Cell key={index} fill={row.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedRows.map((row, index) => (
                      <div key={row.id} className="rounded-lg bg-bg px-3 py-2 text-xs">
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full"
                          style={{ background: COLORS[index] }}
                        />
                        {t(row.locations?.name)}
                        <span className="ml-3 font-semibold">{row.totals?.pct?.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {sectionKeys.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Section breakdown</CardTitle>
                    <p className="text-xs text-muted">
                      Compare strengths across your assessment sections.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={340}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis
                          dataKey="section"
                          tick={{ fontSize: 10, fill: "var(--muted)" }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        {selectedRows.map((row, index) => (
                          <Radar
                            key={row.id}
                            name={`${t(row.locations?.name)} · ${fmtDate(row.assessed_on)}`}
                            dataKey={`a${index}`}
                            stroke={COLORS[index]}
                            fill={COLORS[index]}
                            fillOpacity={0.1}
                          />
                        ))}
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="table-scroll mt-5">
                      <table className="data-table">
                        <caption className="sr-only">
                          Comparison of section score percentages
                        </caption>
                        <thead>
                          <tr>
                            <th>Section</th>
                            {selectedRows.map((row) => (
                              <th key={row.id}>
                                {t(row.locations?.name)} · {fmtDate(row.assessed_on)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sectionKeys.map((key) => (
                            <tr key={key}>
                              <td className="capitalize">{key.replace(/_/g, " ")}</td>
                              {selectedRows.map((row) => (
                                <td key={row.id}>
                                  {row.totals?.sections?.[key]?.pct != null
                                    ? `${row.totals.sections[key].pct.toFixed(1)}%`
                                    : "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <EmptyState
                    title="No section breakdown available"
                    description="These assessments contain overall scores only."
                  />
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
