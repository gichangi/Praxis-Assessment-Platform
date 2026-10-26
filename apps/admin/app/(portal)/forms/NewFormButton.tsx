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
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function NewFormButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");
  const [keyEdited, setKeyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  async function create() {
    if (!title.trim() || !key.trim()) return;
    setLoading(true);
    const { data: mem } = await sb.from("memberships").select("organisation_id").limit(1).single();
    if (!mem) {
      toast({ title: "No organisation", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: form, error: formErr } = await sb
      .from("forms")
      .insert({
        organisation_id: mem.organisation_id,
        key: key.trim(),
        title: { en: title.trim() },
      })
      .select("id")
      .single();
    if (formErr) {
      toast({ title: formErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create initial draft version
    const emptyDef = {
      schema_version: 1,
      form_key: key.trim(),
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
      toast({ title: fvErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!keyEdited)
                    setKey(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "")
                    );
                }}
                placeholder="Service Quality Assessment"
              />
            </div>
            <div>
              <label htmlFor="form-key" className="field-label">
                Form key
              </label>
              <Input
                id="form-key"
                required
                pattern="[a-z0-9_]+"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setKeyEdited(true);
                }}
                placeholder="service_quality_assessment"
              />
              <p className="mt-1 text-xs text-muted">
                Permanent identifier. Lower-case, underscores only.
              </p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-form"
              disabled={loading || !title.trim() || !key.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
