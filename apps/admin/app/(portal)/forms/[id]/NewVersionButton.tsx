"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export function NewVersionButton({
  sourceVersionId,
  sourceVersion,
  suggested,
}: {
  sourceVersionId: string;
  sourceVersion: string;
  suggested: string;
}) {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(suggested);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  async function create() {
    setLoading(true);
    const { data, error } = await sb.rpc("create_draft_from", {
      p_version_id: sourceVersionId,
      p_new_version: version.trim(),
    });
    setLoading(false);
    if (error) {
      toast({
        title:
          error.code === "23505"
            ? "A draft is already open, or that version number is taken"
            : error.message,
        variant: "destructive",
      });
      return;
    }
    setOpen(false);
    toast({
      title: `Draft ${version.trim()} created`,
      description:
        "Edit it, then publish when it’s ready. Nothing changes for your team until then.",
      variant: "success",
    });
    router.push(`/forms/${data.id}/builder`);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New version
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>New version of this form</DialogTitle>
          </DialogHeader>
          <form
            id="new-version"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
            className="space-y-4"
          >
            <p className="text-sm text-muted">
              Starts a draft copied from version {sourceVersion}. Nothing changes for your team
              until you publish it. Assessments already started keep the version they began with;
              new ones use the new version once a phone has synced it.
            </p>
            <div>
              <label htmlFor="new-version-number" className="field-label">
                Version number
              </label>
              <Input
                id="new-version-number"
                required
                pattern="\d+\.\d+\.\d+"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.1.0"
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-version" disabled={loading || !version.trim()}>
              {loading ? "Creating…" : "Create draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
