"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/(auth)/login/actions";
import { cn } from "@/lib/utils";

/**
 * Global tab nav for the authenticated app — Today / Systems / Progress
 * per build spec §2.3. Shown by `src/app/(app)/layout.tsx` above any
 * page inside that route group. Review mode lives outside the group so
 * the session remains fullscreen.
 *
 * Active tab is derived from the URL via `usePathname()`; `matches()`
 * treats `/systems/cardiovascular/frank-starling` as still inside the
 * Systems tab. A Sign-out form is rendered inline so learners have a
 * visible exit affordance from any page without needing the home page.
 */

const TABS = [
  { label: "Today", href: "/today" },
  { label: "Systems", href: "/systems" },
  { label: "Progress", href: "/progress" },
] as const;

function matches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App sections"
      className="border-border bg-background sticky top-0 z-10 border-b"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-4 py-2">
        <Link href="/" className="mr-auto text-sm font-medium tracking-tight hover:underline">
          Physio-Scholar
        </Link>
        <ul className="flex gap-1">
          {TABS.map((t) => {
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
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted-foreground hover:bg-muted rounded-md px-2 py-1 text-xs"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
