import { MapPin, Network } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/utils";
import { NewLocationButton } from "./NewLocationButton";
import { LocationTree } from "./LocationTree";

export const dynamic = "force-dynamic";

export type LocationRow = {
  id: string;
  parent_id: string | null;
  code: string;
  name: Record<string, string>;
  level: number;
  active: boolean;
};

export default async function LocationsPage() {
  const sb = createClient();
  const { data: locations, error } = await sb
    .from("locations")
    .select("id, parent_id, code, name, level, active")
    .order("level")
    .order("code");

  const rows = (locations ?? []) as LocationRow[];
  const rootCount = rows.filter((l) => l.parent_id === null).length;
  const totalCount = rows.length;

  return (
    <div className="page-container">
      <PageHeader
        title="Locations"
        eyebrow="YOUR GEOGRAPHIC TREE"
        description="Organise the places your team serves. Add any number of levels — regions, districts, sub-districts — to match your structure."
      >
        <NewLocationButton locations={rows} />
      </PageHeader>
      <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-surface px-5 py-4 text-xs">
        <span className="flex items-center gap-2 text-muted">
          <Network className="h-4 w-4 text-primary" />
          <strong className="font-semibold text-text-main">{rootCount}</strong>
          top-level
        </span>
        <span className="flex items-center gap-2 text-muted">
          <MapPin className="h-4 w-4 text-primary" />
          <strong className="font-semibold text-text-main">{totalCount}</strong>
          total locations
        </span>
      </div>
      {!rows.length && (
        <Card>
          <EmptyState
            title={error ? "Locations couldn't be loaded" : "Your coverage starts here"}
            description={
              error
                ? "Refresh this page to try again."
                : "Add your first location to start building your geographic tree."
            }
          />
        </Card>
      )}
      {rows.length > 0 && <LocationTree locations={rows} />}
    </div>
  );
}
