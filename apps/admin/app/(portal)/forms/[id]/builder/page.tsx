import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { FormDefinition } from "@assessment/core";
import { collectLibrary } from "@/lib/builder-ops";
import { t } from "@/lib/utils";
import { BuilderClient } from "./BuilderClient";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: fv } = await sb
    .from("form_versions")
    .select("id, version, status, definition, form_id, updated_at, forms(key, title)")
    .eq("id", params.id)
    .single();

  if (!fv) notFound();

  // Questions from your other forms (their newest version each), offered for reuse.
  const { data: others } = await sb
    .from("form_versions")
    .select("form_id, updated_at, definition, forms(title)")
    .neq("form_id", fv.form_id)
    .order("updated_at", { ascending: false });
  const newestPerForm = new Map<string, NonNullable<typeof others>[number]>();
  for (const v of others ?? []) if (!newestPerForm.has(v.form_id)) newestPerForm.set(v.form_id, v);
  const library = collectLibrary(
    [...newestPerForm.values()].map((v) => ({
      form: t((v.forms as { title?: Record<string, string> } | null)?.title),
      updatedAt: v.updated_at,
      def: v.definition as unknown as FormDefinition,
    }))
  );

  return (
    <BuilderClient
      formVersion={fv as unknown as Parameters<typeof BuilderClient>[0]["formVersion"]}
      library={library}
    />
  );
}
