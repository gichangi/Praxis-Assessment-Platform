import type { AssessmentTableRow } from "@/components/AssessmentTable";
import { t } from "@/lib/utils";

type RelatedAssessment = {
  id: string;
  status: string;
  assessed_on: string;
  totals: unknown;
  locations: unknown;
  profiles: unknown;
  form_versions?: unknown;
};

export function assessmentRows(rows: RelatedAssessment[]): AssessmentTableRow[] {
  return rows.map((row) => {
    const totals = row.totals as { score?: number; max?: number; pct?: number } | null;
    return {
      id: row.id,
      status: row.status,
      date: row.assessed_on,
      location: t((row.locations as { name?: Record<string, string> } | null)?.name),
      assessor: (row.profiles as { full_name?: string } | null)?.full_name ?? "",
      version: (row.form_versions as { version?: string } | null)?.version,
      score: totals?.score ?? null,
      max: totals?.max ?? null,
      pct: totals?.pct ?? null,
    };
  });
}
