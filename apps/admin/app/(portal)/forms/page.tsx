import Link from "next/link";
import { FileText, ArrowRight, Layers3, Pencil, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { t, fmtDate } from "@/lib/utils";
import { NewFormButton } from "./NewFormButton";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const sb = createClient();
  const { data: forms, error } = await sb
    .from("forms")
    .select("id, key, title, created_at, form_versions(id, version, status, updated_at)")
    .order("created_at", { ascending: false });
  return (
    <div className="page-container">
      <PageHeader
        title="Form library"
        eyebrow="BUILD WITH PURPOSE"
        description="Build flexible questionnaires for different assessment areas, manage versions, and equip your team."
      >
        <NewFormButton />
      </PageHeader>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>
          {forms?.length ?? 0} {forms?.length === 1 ? "questionnaire" : "questionnaires"} in your
          library
        </span>
        <Link href="/help#forms" className="flex items-center gap-1.5 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          Form building guide
        </Link>
      </div>
      {!forms?.length ? (
        <Card>
          <EmptyState
            title={error ? "Form library couldn’t be loaded" : "Build your first questionnaire"}
            description={
              error
                ? "Refresh this page to try again."
                : "Start with a form, organise it into sections, and publish it for your field team."
            }
          >
            {!error && <NewFormButton />}
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {forms.map((form) => {
            const versions = (form.form_versions ?? []) as Array<{
              id: string;
              version: string;
              status: string;
              updated_at: string;
            }>;
            const sorted = [...versions].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
            const draft = sorted.find((version) => version.status === "draft");
            const published = sorted.find((version) => version.status === "published");
            return (
              <Card key={form.id} className="flex flex-col transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-4 p-6 pb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-primary-50 text-primary">
                    <FileText className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {published && <Badge variant="success">Published v{published.version}</Badge>}
                    {draft && <Badge variant="warning">Draft available</Badge>}
                  </div>
                </div>
                <div className="flex-1 px-6 pb-6">
                  <h2 className="text-lg font-semibold tracking-tight">
                    <Link href={`/forms/${form.id}`} className="hover:text-primary">
                      {t(form.title as Record<string, string>)}
                    </Link>
                  </h2>
                  <p className="mt-2 break-all font-mono text-[11px] text-muted">{form.key}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <Layers3 className="h-3.5 w-3.5" />
                      {versions.length} {versions.length === 1 ? "version" : "versions"}
                    </span>
                    <span>Created {fmtDate(form.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
                  <Link
                    href={`/forms/${form.id}`}
                    className="flex items-center gap-2 text-xs font-medium text-primary"
                  >
                    View versions
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {draft && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/forms/${draft.id}/builder`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit draft
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
