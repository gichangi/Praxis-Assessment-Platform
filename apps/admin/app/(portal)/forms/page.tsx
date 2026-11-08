import Link from "next/link";
import { BookOpen, Eye, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBanner } from "@/components/StatusBanner";
import { t } from "@/lib/utils";
import { FORM_MANAGER_ROLES, myMembership } from "@/lib/org";
import { formReadiness } from "@/lib/forms";
import { Pagination } from "@/components/Pagination";
import { PAGE_SIZE, pageSlice, parsePage, parsePageSize } from "@/lib/pagination";
import { NewFormButton } from "./NewFormButton";

export const dynamic = "force-dynamic";

type VersionRow = { id: string; version: string; status: string; updated_at: string };

export default async function FormsPage({
  searchParams,
}: {
  searchParams: { page?: string; size?: string };
}) {
  const sb = createClient();
  const [{ data: forms, error }, manager] = await Promise.all([
    sb
      .from("forms")
      .select(
        "id, key, title, active, created_at, form_versions(id, version, status, updated_at), form_assignments(id)"
      )
      .order("created_at", { ascending: false }),
    myMembership(sb, FORM_MANAGER_ROLES),
  ]);
  const canManage = !!manager;

  const rows = (forms ?? []).map((form) => {
    const versions = ((form.form_versions ?? []) as VersionRow[]).sort((a, b) =>
      b.updated_at.localeCompare(a.updated_at)
    );
    const active = versions.find((v) => v.status === "published");
    const draft = versions.find((v) => v.status === "draft");
    const assignmentCount = (form.form_assignments ?? []).length;
    return {
      form,
      active,
      draft,
      assignmentCount,
      updatedAt: versions[0]?.updated_at ?? form.created_at,
      readiness: formReadiness({
        activeVersion: active?.version,
        draftVersion: draft?.version,
        assignmentCount,
        enabled: form.active,
      }),
    };
  });

  // The summary above counts every form; the table shows one page of them.
  const pageSize = parsePageSize(searchParams.size, PAGE_SIZE);
  const paged = pageSlice(rows, parsePage(searchParams.page), pageSize);

  // Assignment counts are only complete for people who manage forms, so only they get a verdict.
  const needAttention = canManage ? rows.filter((r) => r.readiness.tone === "warning").length : 0;
  const liveCount = canManage ? rows.filter((r) => r.readiness.tone === "success").length : 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Form library"
        eyebrow="BUILD WITH PURPOSE"
        description="Create a form, publish it, then assign it to the people and places that will use it."
      >
        {canManage && <NewFormButton />}
      </PageHeader>

      {!rows.length ? (
        <Card>
          <EmptyState
            title={error ? "Forms couldn’t be loaded" : "No forms yet"}
            description={
              error
                ? "Refresh this page to try again."
                : canManage
                  ? "Create your first form, build its questions, then publish it."
                  : "A super admin or form editor will publish forms for your team here."
            }
          >
            {!error && canManage && <NewFormButton />}
          </EmptyState>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="table-scroll">
              <table className="data-table">
                <caption className="sr-only">Forms in your library</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Form code</th>
                    <th scope="col">Current version</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map(({ form, active, draft, readiness }) => {
                    const name = t(form.title as Record<string, string>);
                    const editHref = `/forms/${form.id}?tab=details`;
                    return (
                      <tr key={form.id}>
                        <td>
                          <Link
                            href={`/forms/${form.id}`}
                            className="block font-medium hover:text-primary"
                          >
                            {name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap font-mono text-xs text-muted">
                          {form.key}
                        </td>
                        <td>
                          {active ? (
                            <span className="font-medium tabular-nums">v{active.version}</span>
                          ) : (
                            <span className="text-muted">None active</span>
                          )}
                          {canManage && draft && (
                            <span className="mt-0.5 block text-xs text-muted">
                              Draft v{draft.version} in progress
                            </span>
                          )}
                        </td>
                        <td>
                          {canManage ? (
                            <Badge
                              variant={
                                readiness.tone === "success"
                                  ? "success"
                                  : readiness.tone === "warning"
                                    ? "warning"
                                    : "outline"
                              }
                            >
                              {readiness.label}
                            </Badge>
                          ) : (
                            <Badge variant={active && form.active ? "success" : "outline"}>
                              {active && form.active ? "Active" : "Not available"}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <Button asChild variant="ghost" size="icon">
                              <Link
                                href={canManage ? editHref : `/forms/${form.id}`}
                                aria-label={`${canManage ? "Edit" : "View"} ${name}`}
                                title={canManage ? "Edit form" : "View"}
                              >
                                {canManage ? (
                                  <Pencil className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={paged.page}
            total={paged.total}
            pageSize={pageSize}
            defaultPageSize={PAGE_SIZE}
            noun="forms"
            basePath="/forms"
          />
        </>
      )}

      <div className="flex justify-end text-xs text-muted">
        <Link href="/help#forms" className="flex items-center gap-1.5 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          Form building guide
        </Link>
      </div>
    </div>
  );
}
