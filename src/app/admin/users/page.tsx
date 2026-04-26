import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { approveUserAction, revokeApprovalAction } from "./actions";

export const metadata = {
  title: "Users · Admin",
};

/**
 * Admin → users list. Shows every profile + a roll-up of their review
 * activity. The guard runs in src/app/admin/layout.tsx so by the time
 * this renders we know the caller is an admin.
 *
 * J6 search: `?q=<text>` filters by full_name or roll_number
 * (case-insensitive substring). Empty query returns everyone, sorted
 * by most-recently-joined.
 *
 * We stick to RLS-visible columns — no auth.users lookup — because
 * profiles carries the fields the pilot actually needs. If email
 * becomes essential later, add a materialised view + RLS that admins
 * can select.
 */
type ProfileRow = {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  institution_id: string | null;
  year_of_study: number | null;
  is_admin: boolean;
  is_faculty: boolean;
  approved_at: string | null;
  created_at: string;
};

type ReviewAgg = {
  profile_id: string;
  count: number;
  latest: string | null;
};

type SearchParams = { q?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawQuery = (params.q ?? "").trim();
  const supabase = await createClient();

  let profilesQuery = supabase
    .from("profiles")
    .select(
      "id, full_name, roll_number, institution_id, year_of_study, is_admin, is_faculty, approved_at, created_at",
    )
    // Pending users first (approved_at = null), then by joined-desc.
    .order("approved_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (rawQuery.length > 0) {
    // Postgres `or` filter supports comma-separated `column.op.value`
    // clauses; ilike is case-insensitive substring match. We escape
    // wildcards to avoid `%` injecting outside our intent.
    const safe = rawQuery.replace(/[%_]/g, (m) => `\\${m}`);
    profilesQuery = profilesQuery.or(`full_name.ilike.%${safe}%,roll_number.ilike.%${safe}%`);
  }

  const { data: profiles, error: profilesError } = await profilesQuery;

  if (profilesError) {
    return (
      <Shell query={rawQuery}>
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
      <Shell query={rawQuery}>
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
      byProfile.set(row.profile_id, {
        profile_id: row.profile_id,
        count: 1,
        latest: row.created_at,
      });
    }
  }

  return (
    <Shell query={rawQuery}>
      {profiles && profiles.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs tracking-widest uppercase">
              <th className="py-2 pr-4">Profile</th>
              <th className="py-2 pr-4">Roll</th>
              <th className="py-2 pr-4">Year</th>
              <th className="py-2 pr-4">Reviews</th>
              <th className="py-2 pr-4">Last review</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {profiles.map((p: ProfileRow) => {
              const agg = byProfile.get(p.id);
              return (
                <tr key={p.id} className="border-border/50 border-b">
                  <td className="py-2 pr-4">
                    <span className="font-medium">{p.full_name ?? "(no name)"}</span>
                    <div className="text-muted-foreground font-mono text-xs">{p.id}</div>
                  </td>
                  <td className="py-2 pr-4">{p.roll_number ?? "—"}</td>
                  <td className="py-2 pr-4">{p.year_of_study ?? "—"}</td>
                  <td className="py-2 pr-4 font-medium">{agg?.count ?? 0}</td>
                  <td className="py-2 pr-4">{agg?.latest ? formatDate(agg.latest) : "—"}</td>
                  <td className="py-2 pr-4">{formatDate(p.created_at)}</td>
                  <td className="py-2 pr-4">{roleLabel(p)}</td>
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
      ) : rawQuery.length > 0 ? (
        <p className="text-muted-foreground text-sm">No profiles match &quot;{rawQuery}&quot;.</p>
      ) : (
        <p className="text-muted-foreground text-sm">No profiles yet.</p>
      )}
    </Shell>
  );
}

function Shell({ query, children }: { query: string; children: React.ReactNode }) {
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
          placeholder="Search by name or roll number…"
          className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-sm"
          data-testid="admin-users-search"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
        >
          Search
        </button>
        {query.length > 0 ? (
          <Link
            href="/admin/users"
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </form>
      {children}
    </main>
  );
}

function roleLabel(p: ProfileRow): string {
  if (p.is_admin) return "Admin";
  if (p.is_faculty) return "Faculty";
  return "Learner";
}

function ApprovalBadge({ profile }: { profile: ProfileRow }) {
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
  return (
    <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Pending
    </span>
  );
}

function ApprovalToggle({ profile }: { profile: ProfileRow }) {
  const isApproved = profile.approved_at !== null;
  return (
    <form
      action={async () => {
        "use server";
        if (isApproved) {
          await revokeApprovalAction(profile.id);
        } else {
          await approveUserAction(profile.id);
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
        {isApproved ? "Revoke" : "Approve"}
      </button>
    </form>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
