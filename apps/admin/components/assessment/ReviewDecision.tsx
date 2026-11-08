import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";

/** Who approved or returned an assessment, when, and what they said. Nothing for other statuses. */
export function ReviewDecision({
  status,
  reviewer,
  reviewedAt,
  note,
}: {
  status: string;
  reviewer?: string | null;
  reviewedAt?: string | null;
  note?: string | null;
}) {
  if (status !== "approved" && status !== "returned" && status !== "rejected") return null;
  const approved = status === "approved";
  const rejected = status === "rejected";
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : RotateCcw;
  const tone = approved
    ? { box: "border-emerald-200 bg-emerald-50", head: "text-emerald-800", sub: "text-emerald-700" }
    : rejected
      ? { box: "border-red-200 bg-red-50", head: "text-red-800", sub: "text-red-700" }
      : { box: "border-amber-200 bg-amber-50", head: "text-amber-800", sub: "text-amber-700" };
  const message = note?.trim();

  return (
    <div className={cn("rounded-xl border p-4 text-sm", tone.box)}>
      <p className={cn("flex items-center gap-2 font-semibold", tone.head)}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {approved ? "Approved" : rejected ? "Rejected" : "Returned"}
        {reviewer ? ` by ${reviewer}` : ""}
      </p>
      {reviewedAt && <p className={cn("mt-0.5 text-xs", tone.sub)}>{fmtDate(reviewedAt)}</p>}
      <p className="mt-3 text-xs font-medium text-muted">Message</p>
      {message ? (
        <p className="mt-1 whitespace-pre-wrap text-text-main">{message}</p>
      ) : (
        <p className="mt-1 italic text-muted">No message was left.</p>
      )}
    </div>
  );
}
