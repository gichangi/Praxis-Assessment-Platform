"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { LANGUAGE_NAMES } from "@/components/assessment/setup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { cleanTitle, TITLE_LANGUAGES, titleProblem } from "@/lib/forms";
import { createClient } from "@/lib/supabase/client";

/** A form's name, whether it is switched on, and (when nothing was assessed with it) deletion. */
export function FormSettings({
  formId,
  formKey,
  title,
  defaultLanguage,
  active,
  assessmentCount,
  versionCount,
}: {
  formId: string;
  formKey: string;
  title: Record<string, string>;
  defaultLanguage: string;
  active: boolean;
  assessmentCount: number;
  versionCount: number;
}) {
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(TITLE_LANGUAGES.map((l) => [l, title[l] ?? ""]))
  );
  const [isActive, setIsActive] = useState(active);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const sb = createClient();

  const problem = titleProblem(names, defaultLanguage);
  const dirty =
    isActive !== active ||
    TITLE_LANGUAGES.some((l) => (names[l] ?? "").trim() !== (title[l] ?? "").trim());

  async function save() {
    if (problem) return;
    setSaving(true);
    // Keep any translation we don't edit here (a language outside the three above).
    const known = new Set<string>(TITLE_LANGUAGES);
    const extra = Object.fromEntries(Object.entries(title).filter(([k]) => !known.has(k)));
    const { error } = await sb
      .from("forms")
      .update({ title: { ...extra, ...cleanTitle(names) }, active: isActive })
      .eq("id", formId);
    setSaving(false);
    if (error) {
      toast({
        title: "Couldn’t save the changes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Form updated",
      description:
        isActive === active
          ? undefined
          : isActive
            ? "The form is active."
            : "The form is disabled.",
      variant: "success",
    });
    router.refresh();
  }

  async function remove() {
    setDeleting(true);
    const { error } = await sb.rpc("delete_form", { p_form: formId });
    setDeleting(false);
    if (error) {
      toast({
        title: "Couldn’t delete the form",
        description: error.message,
        variant: "destructive",
      });
      setConfirming(false);
      router.refresh();
      return;
    }
    toast({ title: "Form deleted", variant: "success" });
    router.push("/forms");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-6 p-6">
        <div>
          <h2 className="font-serif text-lg font-semibold">Form details</h2>
          <p className="mt-1 text-sm text-muted">
            The name people see. Questions are edited in a version’s draft.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {TITLE_LANGUAGES.map((lang) => {
            const required = lang === defaultLanguage;
            return (
              <div key={lang} className={required ? "sm:col-span-2" : undefined}>
                <label htmlFor={`title-${lang}`} className="field-label">
                  Name in {LANGUAGE_NAMES[lang]}
                  {required ? " (required)" : " (optional)"}
                </label>
                <Input
                  id={`title-${lang}`}
                  dir={lang === "ar" ? "rtl" : undefined}
                  value={names[lang] ?? ""}
                  onChange={(e) => setNames((n) => ({ ...n, [lang]: e.target.value }))}
                />
              </div>
            );
          })}
          <div className="sm:col-span-2">
            <p className="field-label">Form code</p>
            <p className="font-mono text-sm">{formKey}</p>
            <p className="mt-1 text-xs text-muted">
              A short code the system generated. It identifies the form in exports and stays the
              same when you rename the form.
            </p>
          </div>
        </div>

        <div>
          <p className="field-label">Status</p>
          <div className="flex items-start gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} label="Form active" />
            <div className="text-sm">
              <p className="font-semibold">{isActive ? "Active" : "Disabled"}</p>
              <p className="text-xs text-muted">
                {isActive
                  ? "People it is assigned to can start new assessments."
                  : "Nobody can start new assessments. Existing assessments, versions and assignments are kept, and you can switch it back on."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button onClick={() => void save()} disabled={!dirty || !!problem || saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {problem && <p className="text-sm text-red-700">{problem}</p>}
        </div>
      </Card>

      <Card className="border-red-200 p-6">
        <h2 className="font-serif text-lg font-semibold">Delete form</h2>
        {assessmentCount > 0 ? (
          <p className="mt-1 text-sm text-muted">
            {assessmentCount} {assessmentCount === 1 ? "assessment uses" : "assessments use"} this
            form, so it can’t be deleted. Switch it off above to stop new assessments instead.
          </p>
        ) : confirming ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Delete this form for good?</p>
            <p className="mt-1 text-sm text-red-800/90">
              Its {versionCount} {versionCount === 1 ? "version" : "versions"} and its assignments
              are removed too. This can’t be undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void remove()}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting…" : "Yes, delete it"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Nothing has been assessed with this form, so it can be deleted.
            </p>
            <Button
              variant="outline"
              className="mt-3 text-red-700"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete form
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
