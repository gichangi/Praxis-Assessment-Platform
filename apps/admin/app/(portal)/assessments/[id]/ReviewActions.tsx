"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";

type Decision = "approved" | "returned" | "rejected";

const DONE: Record<Decision, string> = {
  approved: "Assessment approved",
  returned: "Returned to the assessor for changes",
  rejected: "Assessment rejected",
};

export function ReviewActions({
  assessmentId,
  reviewNote,
}: {
  assessmentId: string;
  reviewNote: string;
}) {
  const [note, setNote] = useState(reviewNote);
  const [loading, setLoading] = useState<Decision | null>(null);
  const router = useRouter();
  const sb = createClient();

  // A rejection is final, so the assessor must be told why.
  const needsMessage = note.trim() === "";

  async function review(decision: Decision) {
    setLoading(decision);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).rpc("review_assessment", {
      p_id: assessmentId,
      p_decision: decision,
      p_note: note.trim() || null,
    });
    setLoading(null);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: DONE[decision], variant: "success" });
    router.refresh();
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm font-medium text-amber-800">Review required</p>
        <div>
          <label htmlFor="review-note" className="field-label">
            Message to the assessor
          </label>
          <textarea
            id="review-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional, but required to reject."
            className="flex w-full rounded border border-border bg-surface px-3.5 py-2.5 text-sm text-text-main placeholder:text-muted/80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => review("approved")} disabled={!!loading} size="sm">
            <CheckCircle className="h-4 w-4" />
            {loading === "approved" ? "Approving…" : "Approve"}
          </Button>
          <Button
            variant="outline"
            onClick={() => review("returned")}
            disabled={!!loading}
            size="sm"
            title="Send back to be fixed and submitted again"
          >
            <RotateCcw className="h-4 w-4" />
            {loading === "returned" ? "Returning…" : "Return"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => review("rejected")}
            disabled={!!loading || needsMessage}
            size="sm"
            title={needsMessage ? "Write a message first" : "Final: it can’t be edited afterwards"}
          >
            <XCircle className="h-4 w-4" />
            {loading === "rejected" ? "Rejecting…" : "Reject"}
          </Button>
        </div>
        <p className="text-xs text-amber-800/80">
          Return lets the assessor fix it and submit again. Reject is final.
        </p>
      </CardContent>
    </Card>
  );
}
