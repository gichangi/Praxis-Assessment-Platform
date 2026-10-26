import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: { page?: string } }) {
  const sb = createClient();
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 50;

  const {
    data: rows,
    count,
    error,
  } = await sb
    .from("audit_log")
    .select("id, at, action, entity, entity_id, profiles(full_name)", { count: "exact" })
    .order("at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

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
                    {(r.profiles as { full_name?: string })?.full_name ?? "system"}
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
      {(page > 1 || (count ?? 0) > pageSize) && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Page {page} of {Math.max(1, Math.ceil((count ?? 0) / pageSize))}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/audit?page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page * pageSize < (count ?? 0) && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/audit?page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
