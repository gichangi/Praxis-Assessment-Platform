"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, ChevronRight, Menu, Search, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { NAV_ITEMS } from "@/components/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/lib/brand";

export function PortalShell({
  children,
  organisation,
  name,
  role,
}: {
  children: React.ReactNode;
  organisation: string;
  name: string;
  role: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const mobileNavigation = useRef<HTMLDivElement>(null);
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const initials = name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const results = NAV_ITEMS.filter((item) =>
    `${item.label} ${item.description}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-text-main">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-surface px-4 py-3 text-sm text-primary shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="hidden h-full lg:block">
        <Sidebar organisation={organisation} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-5 sm:px-8 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogPrimitive.Trigger
                className="rounded-lg p-2 text-muted hover:bg-bg lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-text-main/35 backdrop-blur-sm" />
                <DialogPrimitive.Content
                  ref={mobileNavigation}
                  onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    mobileNavigation.current
                      ?.querySelector<HTMLElement>('[aria-current="page"]')
                      ?.focus();
                  }}
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 h-dvh w-[248px] focus:outline-none"
                >
                  <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
                  <Sidebar organisation={organisation} onNavigate={() => setMobileOpen(false)} />
                  <DialogPrimitive.Close
                    aria-label="Close navigation"
                    className="absolute right-2 top-1 rounded p-1 text-muted hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </DialogPrimitive.Close>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
            <span className="hidden font-serif text-base text-primary sm:inline">{BRAND.name}</span>
            <ChevronRight className="hidden h-3.5 w-3.5 text-border sm:block" />
            <span className="truncate text-xs font-medium">{current?.label ?? "Workspace"}</span>
            {pathname.endsWith("/builder") && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-border" />
                <span className="text-xs text-muted">Builder</span>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <button
              onClick={() => {
                setSearch("");
                setSearchOpen(true);
              }}
              aria-label="Search workspace pages"
              className="flex items-center gap-2 rounded-lg border border-border bg-bg/70 px-2.5 py-2 text-xs text-muted transition-colors hover:border-primary/40 sm:w-48"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Find a page…</span>
              <kbd className="ms-auto hidden rounded border border-border bg-surface px-1 text-[10px] sm:inline">
                Ctrl K
              </kbd>
            </button>
            <Link
              href="/settings"
              className="flex items-center gap-3"
              aria-label={`Account settings for ${name}`}
            >
              <span className="hidden text-right md:block">
                <span className="block max-w-40 truncate text-xs font-medium">{name}</span>
                <span className="mt-0.5 block text-[10px] capitalize text-muted">
                  {role.replace(/_/g, " ")}
                </span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary-50 text-xs font-semibold text-primary">
                {initials || "A"}
              </span>
            </Link>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto bg-bg text-text-main focus:outline-none"
        >
          {children}
        </main>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Find your way</DialogTitle>
          </DialogHeader>
          <Input
            aria-label="Search workspace pages"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pages and workflows…"
          />
          <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {results.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSearchOpen(false)}
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-primary-50"
              >
                <span className="rounded-lg bg-bg p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-0.5 text-xs text-muted">{description}</p>
                </div>
                <ArrowRight className="ms-auto h-4 w-4 text-muted group-hover:text-primary" />
              </Link>
            ))}
            {!results.length && (
              <p className="py-8 text-center text-sm text-muted">
                No pages match “{search}”. Try another term.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
