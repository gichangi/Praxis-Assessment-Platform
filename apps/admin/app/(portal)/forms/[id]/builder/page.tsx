import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BuilderClient } from "./BuilderClient";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: fv } = await sb
    .from("form_versions")
    .select("id, version, status, definition, form_id, forms(key, title)")
    .eq("id", params.id)
    .single();

  if (!fv) notFound();

  return <BuilderClient formVersion={fv as Parameters<typeof BuilderClient>[0]["formVersion"]} />;
}
