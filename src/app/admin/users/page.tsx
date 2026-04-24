import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Users · Admin",
};

/**
 * Admin → users list. Shows every profile + a roll-up of their review
 * activity. The guard runs in src/app/admin/layout.tsx so by the time
 * this renders we know the caller is an admin.
 *
 * We stick to RLS-visible columns — no auth.users lookup — because
 * Supabase profiles carry the fields the pilot actually needs
 * (created_at, institution, year_of_study) and email lives in
 * auth.users which requires service_role. If email becomes essential
 * later, add a materialised view + RLS that admins can select.
 */
type ProfileRow = {
  id: string;
  full_name: string | null;
  institution_id: string | null;
  year_of_study: number | null;
  is_admin: boolean;
  created_at: string;
};

type ReviewAgg = {
  profile_id: string;
  count: number;
  latest: string | null;
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, institution_id, year_of_study, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return (
      <Shell>
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
      <Shell>
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
    <Shell>
      {profiles && profiles.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs tracking-widest uppercase">
              <th className="py-2 pr-4">Profile</th>
              <th className="py-2 pr-4">Year</th>
              <th className="py-2 pr-4">Reviews</th>
              <th className="py-2 pr-4">Last review</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4">Role</th>
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
                  <td className="py-2 pr-4">{p.year_of_study ?? "—"}</td>
                  <td className="py-2 pr-4 font-medium">{agg?.count ?? 0}</td>
                  <td className="py-2 pr-4">{agg?.latest ? formatDate(agg.latest) : "—"}</td>
                  <td className="py-2 pr-4">{formatDate(p.created_at)}</td>
                  <td className="py-2 pr-4">{p.is_admin ? "Admin" : "Learner"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground text-sm">No profiles yet.</p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Users</h1>
      </header>
      {children}
    </main>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
