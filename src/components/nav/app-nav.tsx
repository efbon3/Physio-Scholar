"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { SignOutButton } from "./sign-out-button";
import { SyncIndicator } from "./sync-indicator";

/**
 * Global app nav.
 *
 * Two layouts behind the same data:
 *   - md: and up — horizontal tab strip across the top, the way it
 *     used to be. The screen is wide enough for ten-ish links.
 *   - below md: — hamburger button toggles a left-side vertical
 *     drawer. The horizontal tab list collapses out of the bar so a
 *     phone screen doesn't wrap into multiple lines of pill buttons.
 *
 * The drawer auto-closes when the path changes (link tap) or when the
 * backdrop / Escape is hit. Body scroll is locked while it's open so
 * the page underneath doesn't drift behind the overlay.
 */

const TABS = [
  { label: "Dashboard", href: "/today" },
  { label: "Topics", href: "/topics" },
  { label: "Systems", href: "/systems" },
  { label: "Facts", href: "/facts" },
  { label: "Values", href: "/values" },
  { label: "Self-test", href: "/self-test" },
  { label: "Exam", href: "/exam" },
  { label: "Calendar", href: "/calendar" },
  { label: "Progress", href: "/progress" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
] as const;

function matches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ profileId }: { profileId: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer when the user taps a link inside it. We attach
  // this to each drawer Link's onClick rather than reacting to
  // pathname changes in an effect, which keeps renders pure under
  // React 19's purity rules.
  const closeDrawer = () => setDrawerOpen(false);

  // Lock body scroll while the drawer is open so the page underneath
  // doesn't drift. Restored on close / unmount.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  // Close on Escape — standard expectation for an overlay.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Tabs split for the desktop layout: primary tabs in the center
  // group, account tabs (Profile / Settings) flush to the right. On
  // mobile the drawer renders all of them as one vertical list.
  const primaryTabs = TABS.filter((t) => t.href !== "/profile" && t.href !== "/settings");
  const accountTabs = TABS.filter((t) => t.href === "/profile" || t.href === "/settings");

  return (
    <>
      <nav
        aria-label="App sections"
        className="border-border bg-background sticky top-0 z-10 border-b"
      >
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2">
          {/* Mobile-only hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="app-nav-drawer"
            className="hover:bg-muted rounded-md p-2 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <Link href="/" className="mr-auto text-sm font-medium tracking-tight hover:underline">
            Physio-Scholar
          </Link>

          {/* Desktop horizontal tabs (hidden on mobile) */}
          <ul className="hidden items-center gap-1 md:flex">
            {primaryTabs.map((t) => {
              const active = matches(pathname, t.href);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right cluster — sync indicator always visible; account tabs
              and sign-out only on desktop (drawer covers them on mobile). */}
          <SyncIndicator profileId={profileId} />
          <div className="hidden items-center gap-1 md:flex">
            {accountTabs.map((t) => {
              const active = matches(pathname, t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen ? (
        <div
          id="app-nav-drawer"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer panel */}
          <aside className="bg-background border-border absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 border-r p-4 shadow-xl">
            <header className="mb-2 flex items-center justify-between">
              <span className="font-medium">Physio-Scholar</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="hover:bg-muted rounded-md p-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <ul className="flex flex-col gap-0.5">
              {TABS.map((t) => {
                const active = matches(pathname, t.href);
                return (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeDrawer}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-secondary text-secondary-foreground font-medium"
                          : "hover:bg-muted",
                      )}
                    >
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-border mt-auto border-t pt-3">
              <SignOutButton />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
