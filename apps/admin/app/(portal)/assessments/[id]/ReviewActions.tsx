"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { CheckCircle, RotateCcw } from "lucide-react";

export function ReviewActions({
  assessmentId,
  reviewNote,
}: {
  assessmentId: string;
  reviewNote: string;
}) {
  const [note, setNote] = useState(reviewNote);
  const [loading, setLoading] = useState<"approve" | "return" | null>(null);
  const router = useRouter();
  const sb = createClient();

  async function review(decision: "approved" | "returned") {
    setLoading(decision === "approved" ? "approve" : "return");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).rpc("review_assessment", {
      p_id: assessmentId,
      p_decision: decision,
      p_note: note || null,
    });
    setLoading(null);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: decision === "approved" ? "Assessment approved" : "Returned to assessor" });
    router.refresh();
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-4 space-y-3">
        <p className="text-sm font-medium text-amber-800">Review required</p>
        <div>
          <label htmlFor="review-note" className="field-label">
            Review note (optional)
          </label>
          <Input
            id="review-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Feedback for the assessor…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => review("approved")} disabled={!!loading} size="sm">
            <CheckCircle className="h-4 w-4" />
            {loading === "approve" ? "Approving…" : "Approve"}
          </Button>
          <Button
            variant="outline"
            onClick={() => review("returned")}
            disabled={!!loading}
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
            {loading === "return" ? "Returning…" : "Return"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
