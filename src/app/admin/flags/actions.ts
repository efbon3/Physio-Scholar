"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Resolution = "resolved" | "rejected";

/**
 * Server action: resolve or reject a content flag.
 *
 * RLS enforces that only admins can UPDATE content_flags (see
 * `supabase/migrations/20260426000000_admin_and_content_flags.sql`), so
 * this action is safe to expose from a form — a non-admin POST is
 * rejected by Postgres even before the handler's own guard runs.
 * We still re-check the admin flag here so the error message is
 * friendly instead of "permission denied on table …".
 */
export async function resolveFlagAction(formData: FormData) {
  const id = formData.get("id");
  const resolution = formData.get("resolution");
  if (typeof id !== "string" || !id) throw new Error("Missing flag id");
  if (resolution !== "resolved" && resolution !== "rejected") {
    throw new Error("Invalid resolution");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/flags");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/today");

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("content_flags")
    .update({
      status: resolution as Resolution,
      resolved_at: nowIso,
      resolved_by: user.id,
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to resolve flag: ${error.message}`);

  revalidatePath("/admin/flags");
  revalidatePath("/admin");
}
