/** Every status an assessment can have, in the order a person meets them. */
export const ASSESSMENT_STATUSES = [
  "draft",
  "submitted",
  "returned",
  "approved",
  "rejected",
] as const;

export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

/** Badge colour per status. Returned work can still be fixed; rejected is final. */
const VARIANTS = {
  draft: "outline",
  submitted: "warning",
  returned: "logistics",
  approved: "success",
  rejected: "destructive",
} as const;

export function statusVariant(
  status: string
): "outline" | "warning" | "logistics" | "success" | "destructive" {
  return (VARIANTS as Record<string, (typeof VARIANTS)[AssessmentStatus]>)[status] ?? "outline";
}
