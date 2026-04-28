import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Students · Faculty",
};

type RosterRow = {
  profile_id: string;
  full_name: string | null;
  year_of_study: number | null;
  reviews_total: number;
  reviews_last_7d: number;
  retention_pct_30d: number | null;
  last_review_at: string | null;
};

const STRUGGLE_THRESHOLD_PCT = 70;
const INACTIVE_DAYS_THRESHOLD = 7;

/**
 * Faculty per-student list — the entry point for "find the strugglers
 * and help them." Defaults to a struggler-first sort so the people who
 * need attention surface above students who are doing fine.
 *
 * Data shape: same `cohort_class_roster` RPC the /admin/cohort page
 * already uses, scoped to the caller's institution. The RPC is
 * SECURITY DEFINER + can_view_cohort()-gated, so a faculty member at
 * institution A literally cannot see students at institution B —
 * regardless of what they pass on the URL.
 *
 * Each row links to /faculty/students/[id] for the deep dive.
 */
export default async function FacultyStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; filter?: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/faculty/students");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id")
    .eq("id", user.id)
    .single();
  if (!profile?.is_faculty && !profile?.is_admin) redirect("/today");
  if (!profile.institution_id) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Students</h1>
        </header>
        <p className="text-destructive text-sm">
          Your profile isn&apos;t linked to an institution yet — ask an admin to set
          <code> institution_id</code> before you can see your cohort.
        </p>
      </main>
    );
  }

  const params = await searchParams;
  const sort = params.sort === "name" || params.sort === "active" ? params.sort : "needs_help";
  const filter = params.filter === "needs_help" ? "needs_help" : "all";

  const { data, error } = await supabase.rpc("cohort_class_roster", {
    p_institution_id: profile.institution_id,
  });
  const roster: RosterRow[] = (data ?? []) as RosterRow[];

  // Apply filter, then sort. "needs_help" surfaces students who either
  // (a) have a 30-day retention below STRUGGLE_THRESHOLD_PCT, or
  // (b) have not reviewed at all in INACTIVE_DAYS_THRESHOLD days.
  const filtered = filter === "needs_help" ? roster.filter(needsHelp) : [...roster];
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
    if (sort === "active") return (b.reviews_last_7d ?? 0) - (a.reviews_last_7d ?? 0);
    // needs_help (default): rank by struggle signal — null retention
    // (no recent activity) sinks to the top alongside low retention.
    return strugglePriority(a) - strugglePriority(b);
  });

  const totalLearners = roster.length;
  const needsHelpCount = roster.filter(needsHelp).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Faculty</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Students</h1>
        <p className="text-muted-foreground text-sm">
          Drill into one student to see their mechanism-by-mechanism mastery and recent activity.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3 text-sm">
        <FilterPill
          href="/faculty/students"
          current={filter === "all"}
          label={`All (${totalLearners})`}
        />
        <FilterPill
          href="/faculty/students?filter=needs_help"
          current={filter === "needs_help"}
          label={`Needs help (${needsHelpCount})`}
        />
        <span className="text-muted-foreground ml-auto text-xs">
          Sort:{" "}
          <SortLink
            href={appendSort("/faculty/students", filter, "needs_help")}
            active={sort === "needs_help"}
          >
            Strugglers first
          </SortLink>
          {" · "}
          <SortLink
            href={appendSort("/faculty/students", filter, "active")}
            active={sort === "active"}
          >
            Most active
          </SortLink>
          {" · "}
          <SortLink href={appendSort("/faculty/students", filter, "name")} active={sort === "name"}>
            Name
          </SortLink>
        </span>
      </section>

      {error ? (
        <p className="text-destructive text-sm">Roster failed to load: {error.message}</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {filter === "needs_help"
            ? "No strugglers right now — every active student has retention above 70% and recent activity. Switch the filter back to 'All' to see the full roster."
            : "No students enrolled in this institution yet. Once accounts are created and reviews flow in, the table populates here."}
        </p>
      ) : (
        <div className="border-border overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-muted-foreground text-left text-xs tracking-widest uppercase">
                <th className="px-3 py-2">Learner</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2 text-right">Reviews · 7d</th>
                <th className="px-3 py-2 text-right">Reviews</th>
                <th className="px-3 py-2 text-right">Retention 30d</th>
                <th className="px-3 py-2">Last review</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const flagged = needsHelp(row);
                return (
                  <tr
                    key={row.profile_id}
                    className={`border-border/40 border-t ${flagged ? "bg-amber-50/50" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/faculty/students/${row.profile_id}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {row.full_name ?? "(no name)"}
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-3 py-2">{row.year_of_study ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{row.reviews_last_7d}</td>
                    <td className="px-3 py-2 text-right">{row.reviews_total}</td>
                    <td className="px-3 py-2 text-right">
                      {row.retention_pct_30d === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={
                            row.retention_pct_30d < STRUGGLE_THRESHOLD_PCT ? "text-amber-700" : ""
                          }
                        >
                          {row.retention_pct_30d}%
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {row.last_review_at ? formatRelative(row.last_review_at) : "Never"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/faculty/students/${row.profile_id}`}
                        className="text-primary text-xs underline-offset-2 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function needsHelp(row: RosterRow): boolean {
  if (row.retention_pct_30d !== null && row.retention_pct_30d < STRUGGLE_THRESHOLD_PCT) {
    return true;
  }
  if (!row.last_review_at) return true;
  const lastMs = Date.parse(row.last_review_at);
  const cutoffMs = Date.now() - INACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000;
  return lastMs < cutoffMs;
}

/**
 * Lower number = higher priority (sorts first). The compose:
 *   - never reviewed (no last_review_at) → 0
 *   - low retention                       → 100 + retention_pct (so 35% → 135)
 *   - inactive but no retention data      → 200 + (days inactive)
 *   - everything else (the OK column)     → 1000 + (100 - retention_pct)
 *
 * The exact numbers are a tiebreaker scheme; the goal is "students
 * who need attention float to the top, the rest are roughly ordered
 * by best retention last."
 */
function strugglePriority(row: RosterRow): number {
  if (!row.last_review_at && row.reviews_total === 0) return 0;
  if (row.retention_pct_30d !== null && row.retention_pct_30d < STRUGGLE_THRESHOLD_PCT) {
    return 100 + row.retention_pct_30d;
  }
  if (row.last_review_at) {
    const days = Math.floor((Date.now() - Date.parse(row.last_review_at)) / (24 * 60 * 60 * 1000));
    if (days >= INACTIVE_DAYS_THRESHOLD) return 200 + days;
  } else {
    return 200 + INACTIVE_DAYS_THRESHOLD;
  }
  return 1000 + (100 - (row.retention_pct_30d ?? 100));
}

function formatRelative(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function appendSort(base: string, filter: string, sort: string): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (sort !== "needs_help") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function FilterPill({ href, current, label }: { href: string; current: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        current
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}
