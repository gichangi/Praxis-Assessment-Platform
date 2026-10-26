"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

type Props = {
  orgId: string;
  initialConfig: Record<string, unknown>;
};

export function SettingsForm({ orgId, initialConfig }: Props) {
  const [minVersion, setMinVersion] = useState(String(initialConfig["min_app_version"] ?? "1.0.0"));
  const [sheetsId, setSheetsId] = useState(String(initialConfig["sheets_spreadsheet_id"] ?? ""));
  const [saving, setSaving] = useState(false);
  const sb = createClient();

  async function save() {
    if (!orgId) return;
    setSaving(true);
    const entries = [
      { organisation_id: orgId, key: "min_app_version", value: minVersion },
      { organisation_id: orgId, key: "sheets_spreadsheet_id", value: sheetsId.trim() },
    ];
    const { error } = await sb
      .from("app_config")
      .upsert(entries, { onConflict: "organisation_id,key" });
    setSaving(false);
    if (error) toast({ title: error.message, variant: "destructive" });
    else toast({ title: "Settings saved" });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div>
        <label htmlFor="min-version" className="field-label">
          Minimum app version
        </label>
        <Input
          id="min-version"
          aria-describedby="min-version-help"
          required
          pattern="[0-9]+\.[0-9]+\.[0-9]+"
          title="Use a version such as 1.0.0"
          value={minVersion}
          onChange={(e) => setMinVersion(e.target.value)}
          placeholder="1.0.0"
          className="max-w-xs"
        />
        <p id="min-version-help" className="field-help">
          Mobile apps below this version will prompt to update.
        </p>
      </div>
      <div>
        <label htmlFor="sheets-id" className="field-label">
          Google Sheets export ID
        </label>
        <Input
          id="sheets-id"
          aria-describedby="sheets-id-help"
          value={sheetsId}
          onChange={(e) => setSheetsId(e.target.value)}
          placeholder="Paste your spreadsheet ID"
        />
        <p id="sheets-id-help" className="field-help">
          Copy the ID between /d/ and /edit in your spreadsheet URL. The service account must have
          edit access.
        </p>
      </div>
      <div className="flex items-center gap-4 border-t border-border pt-5">
        <Button type="submit" disabled={saving || !orgId}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <span className="text-[11px] text-muted">Changes apply to this workspace.</span>
      </div>
    </form>
  );
}
