import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t, fmtDate, fmtPct } from "@/lib/utils";
import { ReviewActions } from "./ReviewActions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: a } = await sb
    .from("assessments")
    .select(
      "*, form_versions(version, definition), locations(name), profiles!created_by(full_name)"
    )
    .eq("id", params.id)
    .single();

  if (!a) notFound();

  const { data: responses } = await sb.from("responses").select("*").eq("assessment_id", params.id);

  const totals = a.totals as {
    score?: number;
    max?: number;
    pct?: number;
    sections?: Record<string, { score: number; max: number; pct: number }>;
  } | null;
  const def = (a.form_versions as { definition?: Record<string, unknown> })?.definition;

  return (
    <div className="page-container">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assessments" aria-label="Back to assessments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="eyebrow">ASSESSMENT DETAILS</p>
          <h1 className="page-title">
            {t((a.locations as { name?: Record<string, string> })?.name)} — {fmtDate(a.assessed_on)}
          </h1>
          <p className="text-sm text-muted">
            {(a.profiles as { full_name?: string })?.full_name ?? "—"} · v
            {(a.form_versions as { version?: string })?.version}
          </p>
        </div>
        <Badge
          className="ms-auto"
          variant={
            a.status === "approved" ? "success" : a.status === "submitted" ? "warning" : "outline"
          }
        >
          {a.status}
        </Badge>
      </div>

      {/* Scores */}
      {totals && (
        <Card>
          <CardHeader>
            <CardTitle>Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">{totals.score}</span>
              <span className="text-lg text-muted">/ {totals.max}</span>
              <span className="ms-2 text-lg font-medium text-text-main">{fmtPct(totals.pct)}</span>
            </div>
            {totals.sections && (
              <div className="space-y-2">
                {Object.entries(totals.sections).map(([key, sec]) => (
                  <div key={key} className="flex flex-wrap items-center gap-3 py-2">
                    <span className="w-full text-sm capitalize sm:w-40">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 bg-bg rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, sec.pct ?? 0))}%` }}
                      />
                    </div>
                    <span className="text-sm tabular-nums w-24 text-end">
                      {sec.score}/{sec.max} ({fmtPct(sec.pct)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review actions (submitted only) */}
      {a.status === "submitted" && (
        <ReviewActions assessmentId={a.id} reviewNote={a.review_note ?? ""} />
      )}

      {/* Responses table */}
      {def && (
        <Card>
          <CardHeader>
            <CardTitle>Responses ({responses?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="border-b border-border bg-bg text-muted text-left">
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium">Value</th>
                    <th className="px-4 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(responses ?? []).map((r) => (
                    <tr
                      key={r.item_key}
                      className="border-b border-border last:border-0 hover:bg-bg"
                    >
                      <td className="px-4 py-2 font-mono text-xs">{r.item_key}</td>
                      <td className="px-4 py-2">
                        {r.not_assessed ? (
                          <span className="text-muted italic">Not assessed</span>
                        ) : (
                          (r.value ?? <span className="text-muted">—</span>)
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted text-xs max-w-xs truncate">
                        {r.note ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
