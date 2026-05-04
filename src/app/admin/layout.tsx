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
  { label: "Attendance", href: "/admin/attendance" },
  { label: "Permissions", href: "/admin/permissions" },
  { label: "Content flags", href: "/admin/flags" },
  { label: "Calendar", href: "/admin/calendar" },
  { label: "Audit log", href: "/admin/audit" },
  { label: "Faculty hub", href: "/faculty" },
  { label: "Assignments", href: "/faculty/assignments" },
  { label: "Schedule", href: "/faculty/schedule" },
  { label: "Announcements", href: "/faculty/announcements" },
  { label: "Approvals", href: "/faculty/approvals" },
  { label: "Students", href: "/faculty/students" },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin("/admin");

  // Responsive: stacks vertically on mobile (<md) with the nav as a
  // horizontal-scroll top bar, and splits horizontally on md+ with the
  // nav as a sticky left sidebar. Mirrors the AppNav pattern in the
  // /(app) layout so admins get the same shape across both surfaces.
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        data-print="hide"
        className="border-border bg-background md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto md:border-r"
      >
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 md:flex-col md:items-start">
            <Link href="/today" className="text-sm font-medium tracking-tight hover:underline">
              Physio-Scholar · Admin
            </Link>
            <span className="text-muted-foreground hidden text-xs md:block">
              {admin.email ?? "admin"}
            </span>
          </div>
          <nav aria-label="Admin sections">
            <ul className="flex flex-wrap gap-1 md:flex-col md:gap-0.5">
              {ADMIN_TABS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="hover:bg-muted block rounded-md px-3 py-1.5 text-sm transition-colors"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span className="text-muted-foreground text-xs md:hidden">
            Signed in as {admin.email ?? "admin"}
          </span>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
