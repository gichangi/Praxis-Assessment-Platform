"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { NAV_GROUPS } from "@/components/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

export function Sidebar({
  organisation,
  onNavigate,
}: {
  organisation: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-stone text-text-main">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-[84px] shrink-0 items-center gap-3 px-6"
      >
        <BrandMark className="h-9 w-9 rounded border border-primary/30 bg-surface text-primary" />
        <div>
          <span className="font-serif text-[22px] tracking-tight">{BRAND.name}</span>
          <p className="mt-0.5 text-[8px] uppercase tracking-[0.14em] text-muted">{BRAND.tagline}</p>
        </div>
      </Link>
      <div className="mx-4 mb-5 rounded border border-border bg-surface/50 px-3.5 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          Your workspace
        </p>
        <p className="mt-1.5 truncate text-xs font-medium text-text-main" title={organisation}>
          {organisation}
        </p>
      </div>
      <nav
        aria-label="Main navigation"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 pb-5"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded border-l-2 px-3 py-2.5 text-[13px] transition-colors",
                      active
                        ? "border-primary bg-surface font-semibold text-primary shadow-sm"
                        : "border-transparent text-muted hover:bg-surface/60 hover:text-text-main"
                    )}
                  >
                    <Icon
                      className="h-[17px] w-[17px] shrink-0"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    {label}
                    {active && <ChevronRight className="ms-auto h-3.5 w-3.5" aria-hidden="true" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="sidebar-help mx-4 mb-4 hidden rounded border border-border bg-surface/40 p-3.5 xl:block">
        <p className="text-xs font-medium text-text-main">{BRAND.tagline}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          A little guidance goes a long way.
        </p>
        <Link
          href="/help"
          onClick={onNavigate}
          className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium text-primary"
        >
          Explore the guide <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="shrink-0 border-t border-border p-3">
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-xs text-muted transition-colors hover:bg-surface/60 hover:text-text-main disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
