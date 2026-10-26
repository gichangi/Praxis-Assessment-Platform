import { SlidersHorizontal, Smartphone, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const { data: mem } = await sb
    .from("memberships")
    .select("organisation_id")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .maybeSingle();
  const orgId = mem?.organisation_id;
  const { data: configs, error } = orgId
    ? await sb.from("app_config").select("key,value").eq("organisation_id", orgId)
    : { data: [], error: null };
  const cfg = Object.fromEntries((configs ?? []).map((row) => [row.key, row.value]));
  return (
    <div className="page-container">
      <PageHeader
        title="Workspace settings"
        eyebrow="MAKE IT WORK FOR YOUR TEAM"
        description="Keep your mobile app requirements and export integrations in one place."
      />
      {error && (
        <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Settings couldn’t be loaded. Refresh before making changes.
        </p>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-primary-50 p-2.5 text-primary">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Application preferences</CardTitle>
                <p className="mt-1 text-xs text-muted">These settings apply to your workspace.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <SettingsForm orgId={error ? "" : (orgId ?? "")} initialConfig={cfg} />
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <Smartphone className="mb-3 h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Keep your field team up to date</h2>
            <p className="mt-2 text-xs leading-6 text-muted">
              The minimum app version lets your team know when they need to update before continuing
              their work.
            </p>
          </Card>
          <Card className="p-5">
            <FileSpreadsheet className="mb-3 h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Connect your reporting workflow</h2>
            <p className="mt-2 text-xs leading-6 text-muted">
              Use a shared Google Sheet as your export destination. Your service account needs
              permission to edit the spreadsheet.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
