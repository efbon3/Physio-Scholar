import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Audit log · Admin",
};

const PAGE_SIZE = 100;

/**
 * Admin → audit log viewer. Read-only list of admin/faculty actions
 * captured in `admin_audit_log`. The admin guard runs in
 * src/app/admin/layout.tsx; by the time this renders the caller is
 * already an admin.
 *
 * Writes to this table happen from server actions via
 * src/lib/admin/audit.ts. Wiring of those writes into the existing
 * admin actions (faculty toggle, event delete, flag resolve, etc.)
 * lands incrementally as each action is touched — this PR ships the
 * read surface first so the viewer is in place when entries start
 * arriving.
 *
 * Filter by actor or target via the URL: `?actor=<uuid>` or
 * `?target_type=profiles`. Both are optional.
 */
type SearchParams = {
  actor?: string;
  target_type?: string;
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (params.actor && /^[0-9a-f-]{36}$/i.test(params.actor)) {
    query = query.eq("actor_id", params.actor);
  }
  if (params.target_type) {
    query = query.eq("target_type", params.target_type);
  }

  const { data, error } = await query;

  // Best-effort actor name lookup — read profiles for the actor ids
  // referenced in the page so the table can show "Alice Adams" instead
  // of a raw uuid. Empty page → skip the query.
  const actorIds = Array.from(
    new Set((data ?? []).map((r) => r.actor_id).filter((v): v is string => Boolean(v))),
  );
  const profileMap = new Map<string, { full_name: string | null }>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { full_name: p.full_name });
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-muted-foreground text-sm">
          Append-only record of admin and faculty actions. Most recent {PAGE_SIZE} entries.
        </p>
      </header>

      {error ? (
        <p className="text-destructive text-sm">Failed to load audit log: {error.message}</p>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No audit entries yet. Server actions write here as they mutate state — the table fills in
          as admin operations happen.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs tracking-widest uppercase">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Target</th>
              <th className="py-2 pr-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const actor = row.actor_id ? profileMap.get(row.actor_id) : null;
              const detailsJson = row.details === null ? "" : JSON.stringify(row.details);
              return (
                <tr key={row.id} className="border-border/50 border-b align-top">
                  <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="py-2 pr-4">
                    <div>{actor?.full_name ?? "(unknown)"}</div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {row.actor_id ?? "—"}
                    </div>
                  </td>
                  <td className="py-2 pr-4 font-medium">{row.action}</td>
                  <td className="py-2 pr-4 text-xs">
                    <div>{row.target_type ?? "—"}</div>
                    <div className="text-muted-foreground font-mono">{row.target_id ?? ""}</div>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    <pre className="break-all whitespace-pre-wrap">{detailsJson}</pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 19);
}
