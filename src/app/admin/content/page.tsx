import Link from "next/link";

import { readAllMechanisms as readFromFs } from "@/lib/content/fs";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Content · Admin",
};

type Row = {
  id: string;
  title: string;
  status: string;
  source: "db" | "fs";
  updated_at: string | null;
};

/**
 * Admin → content list.
 *
 * Shows every mechanism visible to the app — both DB rows (CMS-authored)
 * and filesystem `.md` files. DB rows take precedence per id (the
 * dual-source loader in src/lib/content/source.ts works the same way).
 *
 * FS rows are read-only here: editing them means editing the file in
 * the repo + committing. The "Clone to CMS" button copies the file's
 * markdown into a new DB row (status: draft) so the team can iterate
 * in the UI without touching git.
 */
export default async function AdminContentPage() {
  const supabase = await createClient();

  const [dbResult, fsMechanisms] = await Promise.all([
    supabase
      .from("content_mechanisms")
      .select("id, markdown, status, updated_at")
      .order("updated_at", { ascending: false }),
    readFromFs(),
  ]);

  const dbRows = dbResult.data ?? [];
  const dbIds = new Set(dbRows.map((r) => r.id));

  // Build the merged list: DB rows first (with status from DB), then
  // fs rows whose ids don't already exist in the DB.
  const rows: Row[] = [];
  for (const r of dbRows) {
    // Pull title out of the markdown frontmatter without fully parsing
    // the file — a cheap regex is fine for the list view, and a bad
    // row here shouldn't stall the page.
    const titleMatch = r.markdown.match(/^title:\s*(.+)$/m);
    rows.push({
      id: r.id,
      title: titleMatch?.[1]?.trim().replace(/^['"]|['"]$/g, "") ?? r.id,
      status: r.status,
      source: "db",
      updated_at: r.updated_at,
    });
  }
  for (const m of fsMechanisms) {
    if (dbIds.has(m.frontmatter.id)) continue;
    rows.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      status: m.frontmatter.status,
      source: "fs",
      updated_at: null,
    });
  }
  rows.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Content</h1>
          <p className="text-muted-foreground text-sm">
            CMS-authored chapters and filesystem fallbacks, in one place.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          New chapter
        </Link>
      </header>

      {dbResult.error ? (
        <p className="text-destructive text-sm">
          Failed to load CMS rows: {dbResult.error.message}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No chapters yet. Click &ldquo;New chapter&rdquo; to start.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs tracking-widest uppercase">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Updated</th>
              <th className="py-2 pr-4" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.source}-${r.id}`} className="border-border/50 border-b">
                <td className="py-2 pr-4">
                  <span className="font-medium">{r.title}</span>
                </td>
                <td className="py-2 pr-4 font-mono text-xs">{r.id}</td>
                <td className="py-2 pr-4 capitalize">{r.status}</td>
                <td className="py-2 pr-4 text-xs">
                  {r.source === "db" ? (
                    <span className="text-foreground">CMS</span>
                  ) : (
                    <span className="text-muted-foreground">Filesystem (read-only)</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-xs">
                  {r.updated_at ? r.updated_at.slice(0, 10) : "—"}
                </td>
                <td className="py-2 pr-4">
                  {r.source === "db" ? (
                    <Link
                      href={`/admin/content/${encodeURIComponent(r.id)}/edit`}
                      className="text-xs underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/content/new?clone=${encodeURIComponent(r.id)}`}
                      className="text-xs underline-offset-2 hover:underline"
                    >
                      Clone to CMS
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-muted-foreground border-t pt-4 text-xs">
        Filesystem fallbacks come from <code>content/mechanisms/*.md</code>. Any DB row with the
        same id overrides the file for rendering.
      </p>
    </main>
  );
}
