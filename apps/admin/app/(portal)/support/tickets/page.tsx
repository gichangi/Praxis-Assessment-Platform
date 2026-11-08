import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/Pagination";
import {
  PAGE_SIZE,
  pageCount,
  pageHref,
  parsePage,
  parsePageSize,
  rangeFor,
  sizeParam,
} from "@/lib/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const TICKET_VARIANT: Record<string, "default" | "warning" | "outline"> = {
  open: "default",
  pending: "warning",
  closed: "outline",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { page?: string; size?: string };
}) {
  const sb = createClient();
  const page = parsePage(searchParams.page);
  const pageSize = parsePageSize(searchParams.size, PAGE_SIZE);
  const {
    data: tickets,
    count,
    error,
  } = (await sb
    .from("support_tickets")
    .select(
      "id, status, subject, created_at, user:profiles!support_tickets_user_id_fkey(full_name), assignee:profiles!support_tickets_assigned_to_fkey(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(...rangeFor(page, pageSize))) as unknown as {
    error: unknown;
    count: number | null;
    data: Array<{
      id: string;
      status: string;
      subject: string;
      created_at: string;
      user?: { full_name: string | null } | null;
      assignee?: { full_name: string | null } | null;
    }> | null;
  };

  // A page past the end goes to the last page. The database refuses such a range, so the total
  // has to be asked for separately.
  if ((error as { code?: string } | null)?.code === "PGRST103") {
    const { count: all } = await sb
      .from("support_tickets")
      .select("*", { count: "exact", head: true });
    redirect(
      pageHref(
        "/support/tickets",
        { size: sizeParam(pageSize, PAGE_SIZE) },
        pageCount(all ?? 0, pageSize)
      )
    );
  }
  const total = count ?? 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Support tickets"
        eyebrow="KEEP YOUR TEAM MOVING"
        description="Track requests from the field and see who needs a hand."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-[15px] font-semibold">Recent requests</h2>
          <span className="text-xs text-muted">{total} tickets · newest first</span>
        </div>
        <CardContent className="table-scroll p-0">
          <table className="data-table">
            <thead>
              <tr className="border-b border-border bg-bg text-muted text-left">
                <th className="px-4 py-2.5 font-medium">Subject</th>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Assigned to</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(tickets ?? []).map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-4 py-2.5 font-medium max-w-xs truncate">{t.subject}</td>
                  <td className="px-4 py-2.5 text-muted">{t.user?.full_name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={TICKET_VARIANT[t.status] ?? "outline"}>{t.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {t.assignee?.full_name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{fmtDate(t.created_at)}</td>
                </tr>
              ))}
              {(tickets ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="!p-0">
                    <EmptyState
                      title={error ? "Requests couldn’t be loaded" : "No requests to follow up"}
                      description={
                        error
                          ? "Refresh this page to try again."
                          : "Support requests submitted by your team will appear here."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        defaultPageSize={PAGE_SIZE}
        noun="tickets"
        basePath="/support/tickets"
      />
    </div>
  );
}
