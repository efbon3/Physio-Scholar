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
 *   - md: and up — permanent left sidebar with a vertical link list.
 *     Same shape as the smartphone drawer, just always on screen.
 *   - below md: — slim top bar with a hamburger button. Tapping it
 *     opens the same vertical link list as a drawer overlay.
 *
 * The desktop sidebar and the mobile drawer share the same
 * `<NavList>` rendering so adding / removing tabs only needs one
 * source of truth.
 *
 * The drawer auto-closes when the path changes (link tap) or when the
 * backdrop / Escape is hit. Body scroll is locked while it's open so
 * the page underneath doesn't drift behind the overlay.
 */

// Two-zone redesign retired Topics / Facts / Values / Self-test / Exam
// as standalone surfaces; per-Chapter format-picker covers the test
// affordances and Review handles the daily SRS queue. "Dashboard" is
// the brand link.
const STUDENT_TABS = [
  { label: "Assessment", href: "/systems" },
  { label: "Review", href: "/review" },
  { label: "Pre-PG", href: "/prepg" },
  { label: "Calendar", href: "/calendar" },
  { label: "Progress", href: "/progress" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
] as const;

// Faculty / admin tabs render below a divider in the sidebar so the
// elevated affordances are visibly distinct from the everyday learner
// surfaces. A faculty profile (is_faculty = true) sees the Faculty
// tab; an admin profile (is_admin = true) sees the Admin tab; a
// faculty-and-admin combo sees both. Plain students see neither.
const FACULTY_TAB = { label: "Faculty", href: "/faculty" } as const;
const ADMIN_TAB = { label: "Admin", href: "/admin" } as const;

function matches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({
  profileId,
  isAdmin = false,
  isFaculty = false,
}: {
  profileId: string;
  isAdmin?: boolean;
  isFaculty?: boolean;
}) {
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

  // Elevated tabs surface only when the caller has the matching
  // role flag. Empty array on plain student profiles → NavList skips
  // the divider rendering entirely.
  const elevatedTabs = [...(isFaculty ? [FACULTY_TAB] : []), ...(isAdmin ? [ADMIN_TAB] : [])];

  return (
    <>
      {/* Mobile-only top bar — hamburger + brand + sync indicator. */}
      <nav
        aria-label="App sections"
        className="border-border bg-background sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-2 md:hidden"
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls="app-nav-drawer"
          className="hover:bg-muted rounded-md p-2"
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
        <SyncIndicator profileId={profileId} />
      </nav>

      {/* Desktop permanent left sidebar — same vertical layout as the
          mobile drawer, just always rendered. */}
      <aside
        aria-label="App sections"
        className="bg-background border-border sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r p-4 md:flex"
      >
        <header className="mb-2 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium tracking-tight hover:underline">
            Physio-Scholar
          </Link>
          <SyncIndicator profileId={profileId} />
        </header>

        <NavList
          tabs={STUDENT_TABS}
          elevatedTabs={elevatedTabs}
          pathname={pathname}
          onLinkClick={undefined}
          activeBgClass="bg-secondary text-secondary-foreground font-medium"
        />

        <div className="border-border mt-auto border-t pt-3">
          <SignOutButton />
        </div>
      </aside>

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

            <NavList
              tabs={STUDENT_TABS}
              elevatedTabs={elevatedTabs}
              pathname={pathname}
              onLinkClick={closeDrawer}
              activeBgClass="bg-secondary text-secondary-foreground font-medium"
            />

            <div className="border-border mt-auto border-t pt-3">
              <SignOutButton />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

/**
 * Shared vertical link list used by both the desktop sidebar and the
 * mobile drawer. Single source of truth for the active-state styling
 * so a tab change touches one place.
 *
 * `elevatedTabs` (faculty + admin) render in their own list below a
 * thin divider so the role-gated affordances are visibly separate
 * from the everyday learner tabs. The list is empty for plain
 * students, in which case the divider is omitted entirely.
 */
function NavList({
  tabs,
  elevatedTabs = [],
  pathname,
  onLinkClick,
  activeBgClass,
}: {
  tabs: ReadonlyArray<{ label: string; href: string }>;
  elevatedTabs?: ReadonlyArray<{ label: string; href: string }>;
  pathname: string;
  onLinkClick: (() => void) | undefined;
  activeBgClass: string;
}) {
  return (
    <>
      <ul className="flex flex-col gap-0.5">
        {tabs.map((t) => (
          <NavLinkItem
            key={t.href}
            tab={t}
            active={matches(pathname, t.href)}
            onLinkClick={onLinkClick}
            activeBgClass={activeBgClass}
          />
        ))}
      </ul>
      {elevatedTabs.length > 0 ? (
        <>
          <div className="border-border my-2 border-t" aria-hidden />
          <p className="text-muted-foreground px-3 pb-1 text-[11px] tracking-widest uppercase">
            Staff
          </p>
          <ul className="flex flex-col gap-0.5">
            {elevatedTabs.map((t) => (
              <NavLinkItem
                key={t.href}
                tab={t}
                active={matches(pathname, t.href)}
                onLinkClick={onLinkClick}
                activeBgClass={activeBgClass}
              />
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function NavLinkItem({
  tab,
  active,
  onLinkClick,
  activeBgClass,
}: {
  tab: { label: string; href: string };
  active: boolean;
  onLinkClick: (() => void) | undefined;
  activeBgClass: string;
}) {
  return (
    <li>
      <Link
        href={tab.href}
        aria-current={active ? "page" : undefined}
        onClick={onLinkClick}
        className={cn(
          "block rounded-md px-3 py-2.5 text-sm transition-colors",
          active ? activeBgClass : "hover:bg-muted",
        )}
      >
        {tab.label}
      </Link>
    </li>
  );
}
