"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { FORM_MANAGER_ROLES, myMembership } from "@/lib/org";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function NewFormButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  async function create() {
    if (!title.trim()) return;
    setLoading(true);
    const mem = await myMembership(sb, FORM_MANAGER_ROLES);
    if (!mem) {
      toast({
        title: "Only a super admin or form editor can create forms",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: form, error: formErr } = await sb
      .from("forms")
      // The database gives the form its code (form_001, form_002, ...).
      .insert({ organisation_id: mem.organisation_id, title: { en: title.trim() } })
      .select("id, key")
      .single();
    if (formErr) {
      toast({ title: formErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create initial draft version
    const emptyDef = {
      schema_version: 1,
      form_key: form.key,
      version: "1.0.0",
      default_language: "en",
      languages: ["en"],
      title: { en: title.trim() },
      scoring: { method: "sum", exclude_not_assessed: true, show_percentage: true },
      scales: [],
      sections: [],
    };
    const { data: fv, error: fvErr } = await sb
      .from("form_versions")
      .insert({ form_id: form.id, version: "1.0.0", status: "draft", definition: emptyDef })
      .select("id")
      .single();
    if (fvErr) {
      // Don't leave a form with no version behind.
      await sb.from("forms").delete().eq("id", form.id);
      toast({ title: fvErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    toast({
      title: "Form created",
      description: "Add your questions, then publish it and assign it to your team.",
      variant: "success",
    });
    router.push(`/forms/${fv.id}/builder`);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New form
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Create form</DialogTitle>
          </DialogHeader>
          <form
            id="new-form"
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="form-title" className="field-label">
                Title (English)
              </label>
              <Input
                id="form-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Service Quality Assessment"
              />
              <p className="mt-1 text-xs text-muted">
                The form gets its own short code, like form_001. You can rename the form later; the
                code stays the same.
              </p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-form" disabled={loading || !title.trim()}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
