import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/PortalShell";
import { Toaster } from "@/components/Toaster";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("memberships")
      .select("role, organisations(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);
  const organisation =
    (membership?.organisations as { name?: string } | null)?.name ?? "Praxis workspace";

  return (
    <PortalShell
      organisation={organisation}
      name={profile?.full_name || user.email || "Team member"}
      role={membership?.role ?? "Member"}
    >
      {children}
      <Toaster />
    </PortalShell>
  );
}
