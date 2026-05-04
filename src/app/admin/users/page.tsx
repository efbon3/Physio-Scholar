import Link from "next/link";

import {
  makeComparator,
  parseDir,
  parseSort,
  type SortDir,
  type SortKey,
} from "@/lib/admin/users-sort";
import {
  parseRequestedRole,
  requestedRoleLabel,
  type RequestedRole,
} from "@/lib/auth/requested-role";
import { createClient } from "@/lib/supabase/server";

import { approveUserAction, rejectUserAction, revokeApprovalAction } from "./actions";

export const metadata = {
  title: "Users · Admin",
};

/**
 * Admin → users list. Shows every profile + a roll-up of their review
 * activity. The guard runs in src/app/admin/layout.tsx so by the time
 * this renders we know the caller is an admin.
 *
 * J6 search: `?q=<text>` filters by full_name, college_name, or
 * roll_number (case-insensitive substring). Empty query returns
 * everyone.
 *
 * Sort: `?sort=name|college|roll|joined|status` and `?dir=asc|desc`.
 * Click a column header to toggle. The clickable header is a `<form>`
 * GET with hidden inputs preserving the other params, so sort state
 * round-trips through the URL and is bookmarkable / sharable. We do
 * the ordering server-side so deep cohorts don't bloat the client.
 *
 * Click the user's name to open their full profile at /admin/users/[id].
 */

type ProfileRow = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  roll_number: string | null;
  college_name: string | null;
  phone: string | null;
  institution_id: string | null;
  year_of_study: number | null;
  is_admin: boolean;
  is_faculty: boolean;
  approved_at: string | null;
  profile_completed_at: string | null;
  requested_role: string;
  rejected_at: string | null;
  created_at: string;
};

type ReviewAgg = {
  count: number;
  latest: string | null;
};

type SearchParams = { q?: string; sort?: string; dir?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawQuery = (params.q ?? "").trim();
  const sort = parseSort(params.sort);
  const dir = parseDir(params.dir);
  const supabase = await createClient();

  let profilesQuery = supabase
    .from("profiles")
    .select(
      "id, full_name, nickname, roll_number, college_name, phone, institution_id, year_of_study, is_admin, is_faculty, approved_at, profile_completed_at, requested_role, rejected_at, created_at",
    );

  if (rawQuery.length > 0) {
    // PostgREST .or() is a comma-separated list of clauses; commas in
    // the search value would otherwise break out of the value and inject
    // extra clauses (or just 400 the request — bad either way for a
    // college name like "St. Stephen's College, Delhi"). Wrap each value
    // in double quotes and escape backslashes / quotes / ilike
    // wildcards. Double-quoted PostgREST values may contain commas.
    const safe = rawQuery
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/[%_]/g, (m) => `\\${m}`);
    profilesQuery = profilesQuery.or(
      `full_name.ilike."%${safe}%",roll_number.ilike."%${safe}%",college_name.ilike."%${safe}%"`,
    );
  }

  const { data: profiles, error: profilesError } = await profilesQuery;

  if (profilesError) {
    return (
      <Shell query={rawQuery} sort={sort} dir={dir}>
        <p className="text-destructive text-sm">Failed to load profiles: {profilesError.message}</p>
      </Shell>
    );
  }

  const { data: reviewRows, error: reviewsError } = await supabase
    .from("reviews")
    .select("profile_id, created_at")
    .order("created_at", { ascending: false });

  if (reviewsError) {
    return (
      <Shell query={rawQuery} sort={sort} dir={dir}>
        <p className="text-destructive text-sm">
          Failed to load review aggregates: {reviewsError.message}
        </p>
      </Shell>
    );
  }

  const byProfile = new Map<string, ReviewAgg>();
  for (const row of reviewRows ?? []) {
    const existing = byProfile.get(row.profile_id);
    if (existing) {
      existing.count += 1;
      if (!existing.latest || row.created_at > existing.latest) existing.latest = row.created_at;
    } else {
      byProfile.set(row.profile_id, { count: 1, latest: row.created_at });
    }
  }

  // Server-side sort. We sort here rather than in Postgres because we
  // want a "pending first" tier on the status column (admins have a
  // separate n/a tier) which doesn't map cleanly to a single ORDER BY.
  const sorted = [...(profiles ?? [])].sort(makeComparator(sort, dir));

  return (
    <Shell query={rawQuery} sort={sort} dir={dir}>
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-users-table">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs tracking-widest uppercase">
                <SortableHeader
                  label="Full name"
                  column="name"
                  current={sort}
                  dir={dir}
                  query={rawQuery}
                />
                <SortableHeader
                  label="College"
                  column="college"
                  current={sort}
                  dir={dir}
                  query={rawQuery}
                />
                <SortableHeader
                  label="Roll"
                  column="roll"
                  current={sort}
                  dir={dir}
                  query={rawQuery}
                />
                <th className="py-2 pr-4">Requested</th>
                <th className="py-2 pr-4">Reviews</th>
                <th className="py-2 pr-4">Last review</th>
                <SortableHeader
                  label="Joined"
                  column="joined"
                  current={sort}
                  dir={dir}
                  query={rawQuery}
                />
                <SortableHeader
                  label="Status"
                  column="status"
                  current={sort}
                  dir={dir}
                  query={rawQuery}
                />
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const agg = byProfile.get(p.id);
                return (
                  <tr key={p.id} className="border-border/50 border-b">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/users/${p.id}`}
                        className="font-medium hover:underline"
                        data-testid={`admin-user-name-${p.id}`}
                      >
                        {p.full_name ?? "(no name)"}
                      </Link>
                      {p.nickname ? (
                        <div className="text-muted-foreground text-xs">
                          &ldquo;{p.nickname}&rdquo;
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4">{p.college_name ?? "—"}</td>
                    <td className="py-2 pr-4">{p.roll_number ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <RequestedRoleBadge role={parseRequestedRole(p.requested_role)} />
                    </td>
                    <td className="py-2 pr-4 font-medium">{agg?.count ?? 0}</td>
                    <td className="py-2 pr-4">{agg?.latest ? formatDate(agg.latest) : "—"}</td>
                    <td className="py-2 pr-4">{formatDate(p.created_at)}</td>
                    <td className="py-2 pr-4">
                      <ApprovalBadge profile={p} />
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link
                          href={`/admin/users/${p.id}`}
                          className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs"
                        >
                          View
                        </Link>
                        {!p.is_admin ? <ApprovalToggle profile={p} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : rawQuery.length > 0 ? (
        <p className="text-muted-foreground text-sm">No profiles match &quot;{rawQuery}&quot;.</p>
      ) : (
        <p className="text-muted-foreground text-sm">No profiles yet.</p>
      )}
    </Shell>
  );
}

function Shell({
  query,
  sort,
  dir,
  children,
}: {
  query: string;
  sort: SortKey;
  dir: SortDir;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Users</h1>
      </header>
      <form action="/admin/users" method="get" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name, college, or roll number…"
          className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-sm"
          data-testid="admin-users-search"
        />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
        >
          Search
        </button>
        {query.length > 0 ? (
          <Link
            href={buildHref({ q: "", sort, dir })}
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </form>
      {children}
      <footer data-print="hide" className="border-border mt-8 border-t pt-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          ← Back to admin
        </Link>
      </footer>
    </main>
  );
}

/**
 * Column header that toggles the `?sort=`/`?dir=` query params. Click
 * a fresh column → asc. Click the active column → flip dir. We render
 * a real `<a>` with the precomputed href so the sort works without
 * JavaScript and the URL is shareable.
 */
function SortableHeader({
  label,
  column,
  current,
  dir,
  query,
}: {
  label: string;
  column: SortKey;
  current: SortKey;
  dir: SortDir;
  query: string;
}) {
  const active = current === column;
  const nextDir: SortDir = active ? (dir === "asc" ? "desc" : "asc") : "asc";
  const indicator = active ? (dir === "asc" ? "▲" : "▼") : "";
  return (
    <th
      className="py-2 pr-4"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link
        href={buildHref({ q: query, sort: column, dir: nextDir })}
        className="hover:text-foreground inline-flex items-center gap-1"
        data-testid={`admin-users-sort-${column}`}
      >
        {label} <span aria-hidden="true">{indicator}</span>
      </Link>
    </th>
  );
}

function buildHref({ q, sort, dir }: { q: string; sort: SortKey; dir: SortDir }): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("sort", sort);
  params.set("dir", dir);
  return `/admin/users?${params.toString()}`;
}

function ApprovalBadge({ profile }: { profile: ProfileRow }) {
  // Rejection wins over everything else — even an admin row that
  // somehow gets rejected should show "Rejected" so it's loud.
  if (profile.rejected_at) {
    return (
      <span className="inline-flex items-center rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
        Rejected
      </span>
    );
  }
  if (profile.is_admin) {
    return (
      <span className="text-muted-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs">
        n/a
      </span>
    );
  }
  if (profile.approved_at) {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Approved
      </span>
    );
  }
  if (!profile.profile_completed_at) {
    return (
      <span className="text-muted-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs">
        Profile incomplete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Pending
    </span>
  );
}

/**
 * Inline decision controls: Approve (as requested role) and Reject.
 * Detailed role switching + reason entry live on the user-detail page;
 * the list affordances are deliberately quick. A rejected user's row
 * doesn't show either button — the admin has to click into the detail
 * page to unreject (deliberate friction so it feels like a decision).
 */
function ApprovalToggle({ profile }: { profile: ProfileRow }) {
  const isApproved = profile.approved_at !== null;
  const isRejected = profile.rejected_at !== null;
  const requestedRole = parseRequestedRole(profile.requested_role);

  if (isRejected) {
    return <span className="text-muted-foreground text-[11px]">View to unreject</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <form
        action={async () => {
          "use server";
          if (isApproved) {
            await revokeApprovalAction(profile.id);
          } else {
            await approveUserAction(profile.id, requestedRole);
          }
        }}
      >
        <button
          type="submit"
          className={
            isApproved
              ? "text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs"
              : "bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-2 py-1 text-xs"
          }
        >
          {isApproved ? "Revoke" : `Approve as ${requestedRoleLabel(requestedRole).toLowerCase()}`}
        </button>
      </form>
      {!isApproved ? (
        <form
          action={async () => {
            "use server";
            await rejectUserAction(profile.id);
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
            data-testid={`admin-quick-reject-${profile.id}`}
          >
            Reject
          </button>
        </form>
      ) : null}
    </div>
  );
}

function RequestedRoleBadge({ role }: { role: RequestedRole }) {
  const tone =
    role === "admin"
      ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
      : role === "faculty"
        ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200"
        : "border-input text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${tone}`}>
      {requestedRoleLabel(role)}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
