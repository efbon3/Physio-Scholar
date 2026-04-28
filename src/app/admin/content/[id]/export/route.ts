import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /admin/content/[id]/export — returns the CMS row's markdown as a
 * downloadable `.md` file. Used by the edit page's "Export" button so
 * the author can commit CMS-authored content back to the repo for git
 * review / backup without hand-copying the textarea.
 *
 * Admin-gated: even though RLS blocks non-admin SELECT of draft rows,
 * we 404 rather than 403 on non-admin callers to avoid leaking the
 * existence of specific admin-only IDs to learners.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("content_mechanisms")
    .select("markdown")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Force a download with the canonical filename so the admin can drop
  // the file straight into `content/chapters/` and commit.
  return new NextResponse(data.markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
