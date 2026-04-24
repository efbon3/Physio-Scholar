import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin guard. Use at the top of every admin server
 * component. Redirects non-admins to /login (preserving the attempted
 * path) and fails closed if env vars are missing or the profile fetch
 * errors — admin routes are not something we expose in configurable-
 * preview mode.
 *
 * Returns the admin user record on success so callers can embed
 * name / email in headers without another round-trip.
 */
export type AdminUser = {
  id: string;
  email: string | null;
};

export async function requireAdmin(nextPath: string): Promise<AdminUser> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    // Not an admin → redirect to the learner's Today page rather than
    // revealing that /admin exists.
    redirect("/today");
  }

  return { id: user.id, email: user.email ?? null };
}
