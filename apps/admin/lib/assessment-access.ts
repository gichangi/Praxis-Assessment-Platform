/**
 * Who may change an assessment. Mirrors the database: only the person it belongs to (who
 * started it, or is a co-assessor) can edit, and never once it has been approved. A submitted
 * one can be edited too; the first save pulls it back to draft (reopen_assessment).
 */
const EDITABLE = new Set(["draft", "returned", "submitted"]);

export function canEditAssessment(a: {
  status: string;
  createdBy: string;
  assessors: string[] | null;
  userId: string | null | undefined;
}): boolean {
  if (!a.userId || !EDITABLE.has(a.status)) return false;
  return a.createdBy === a.userId || (a.assessors ?? []).includes(a.userId);
}
