import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import {
  pageCount,
  pageHref,
  parsePage,
  parsePageSize,
  rangeFor,
  sizeParam,
} from "@/lib/pagination";

const AUDIT_PAGE_SIZE = 50;
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { page?: string; size?: string };
}) {
  const sb = createClient();
  const page = parsePage(searchParams.page);
  const pageSize = parsePageSize(searchParams.size, AUDIT_PAGE_SIZE);

  const {
    data: rows,
    count,
    error,
  } = await sb
    .from("audit_log")
    .select("id, at, action, entity, entity_id, actor", { count: "exact" })
    .order("at", { ascending: false })
    .range(...rangeFor(page, pageSize));

  // A page past the end goes to the last page. The database refuses such a range, so the total
  // has to be asked for separately.
  if (error?.code === "PGRST103") {
    const { count: all } = await sb.from("audit_log").select("*", { count: "exact", head: true });
    redirect(
      pageHref(
        "/audit",
        { size: sizeParam(pageSize, AUDIT_PAGE_SIZE) },
        pageCount(all ?? 0, pageSize)
      )
    );
  }

  // The log stores who acted as a plain id, so look the names up separately.
  const actorIds = [
    ...new Set((rows ?? []).map((r) => r.actor).filter((id): id is string => !!id)),
  ];
  const { data: people } = actorIds.length
    ? await sb.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const actorName = new Map((people ?? []).map((p) => [p.id, p.full_name]));

  const ACTION_VARIANT: Record<string, "default" | "warning" | "destructive" | "outline"> = {
    insert: "default",
    update: "warning",
    delete: "destructive",
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Activity log"
        eyebrow="A CLEAR RECORD"
        description="A chronological view of changes made across your workspace."
      />
      <Card className="overflow-hidden">
        <div className="p-6">
          <h2 className="text-[15px] font-semibold">Workspace activity</h2>
          <p className="mt-1 text-xs text-muted">{count ?? 0} recorded events</p>
        </div>
        <CardContent className="table-scroll p-0">
          <table className="data-table">
            <thead>
              <tr className="border-b border-border bg-bg text-muted text-left">
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-4 py-2.5 font-medium">Actor</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Entity</th>
                <th className="px-4 py-2.5 font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {!rows?.length && (
                <tr>
                  <td colSpan={5} className="!p-0">
                    <EmptyState
                      title={error ? "Activity couldn’t be loaded" : "A fresh start"}
                      description={
                        error
                          ? "Refresh this page to try again."
                          : "Changes to your workspace will be recorded here as your team gets to work."
                      }
                    />
                  </td>
                </tr>
              )}
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-4 py-2 text-muted text-xs whitespace-nowrap">
                    {new Date(r.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {(r.actor && actorName.get(r.actor)) || "system"}
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={ACTION_VARIANT[r.action] ?? "outline"}
                      className="uppercase tracking-wide text-[10px]"
                    >
                      {r.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{r.entity}</td>
                  <td
                    title={r.entity_id ?? undefined}
                    className="px-4 py-2 font-mono text-xs text-muted truncate max-w-[120px]"
                  >
                    {r.entity_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Pagination
        page={page}
        total={count ?? 0}
        pageSize={pageSize}
        defaultPageSize={AUDIT_PAGE_SIZE}
        noun="events"
        basePath="/audit"
      />
    </div>
  );
}
