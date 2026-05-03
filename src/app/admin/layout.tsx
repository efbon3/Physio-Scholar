import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/admin";

/**
 * Admin section layout. Guards every child route via requireAdmin()
 * and renders a lightweight nav shared across the admin pages.
 *
 * Build spec §7 keeps content editing out of the app surface — no
 * in-app CMS. What belongs here is operational surface area: users,
 * content flags, and the dispute queue (Phase 4). Everything else
 * is done by the author in the repo + Supabase.
 */
const ADMIN_TABS = [
  { label: "Overview", href: "/admin" },
  { label: "Content", href: "/admin/content" },
  { label: "Users", href: "/admin/users" },
  { label: "Cohort", href: "/admin/cohort" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Batches", href: "/admin/batches" },
  { label: "Permissions", href: "/admin/permissions" },
  { label: "Content flags", href: "/admin/flags" },
  { label: "Calendar", href: "/admin/calendar" },
  { label: "Audit log", href: "/admin/audit" },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
          <Link
            href="/today"
            className="mr-auto text-sm font-medium tracking-tight hover:underline"
          >
            Physio-Scholar · Admin
          </Link>
          <nav aria-label="Admin sections">
            <ul className="flex gap-1">
              {ADMIN_TABS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="hover:bg-muted rounded-md px-3 py-1.5 text-sm transition-colors"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span className="text-muted-foreground ml-3 text-xs">
            Signed in as {admin.email ?? "admin"}
          </span>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
