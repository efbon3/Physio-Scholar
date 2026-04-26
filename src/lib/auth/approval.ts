import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Approval gate. Used by the (app) layout to enforce the rule that
 * only admin-approved learners can reach learner surfaces (/today,
 * /review, /facts, /values, etc).
 *
 * Posture:
 *   - Anonymous user → middleware already redirects to /login.
 *   - Signed-in but profile.approved_at is null → redirect to
 *     /pending-approval. Their session stays valid; they can sign
 *     out from there.
 *   - Signed-in admin (is_admin = true) → always pass. Admins need
 *     access to /admin even if their own approval timestamp is
 *     somehow missing (initial seeding, dropped data).
 *   - Signed-in approved learner → returns silently.
 *
 * Skipped entirely when Supabase env vars are absent — CI / preview
 * envs run with no auth at all and shouldn't trip the gate.
 */
export async function requireApprovedUser(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // Middleware handles unauthenticated; nothing for us to do.

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved_at, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile) return; // Trigger may not have written the profile yet — let it through.
  if (profile.is_admin) return; // Admins bypass.
  if (profile.approved_at) return; // Approved.

  redirect("/pending-approval");
}
