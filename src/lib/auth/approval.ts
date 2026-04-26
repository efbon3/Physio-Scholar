import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Two-stage gate that the (app) layout calls before rendering any
 * learner surface (/today, /review, /facts, /values, etc).
 *
 * Order matters — profile completion comes first, then admin approval:
 *   1. Anonymous → middleware already redirected to /login.
 *   2. Signed-in but profile_completed_at is null → /complete-profile.
 *      The learner has just signed up; they need to fill in name,
 *      nickname, mobile, college, roll number before anything else.
 *   3. Signed-in, profile complete, but approved_at is null →
 *      /pending-approval. Waiting on a human admin.
 *   4. Signed-in admin (is_admin = true) → always pass. Admins must
 *      reach /admin even if their own row is missing approval / a
 *      completed profile (initial seeding).
 *   5. Signed-in, complete, approved → returns silently.
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
    .select("approved_at, profile_completed_at, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile) return; // Trigger may not have written the profile yet — let it through.
  if (profile.is_admin) return; // Admins bypass both gates.

  if (!profile.profile_completed_at) {
    redirect("/complete-profile");
  }
  if (!profile.approved_at) {
    redirect("/pending-approval");
  }
}
