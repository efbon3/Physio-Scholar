"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true };

/**
 * Kick off a password reset. Supabase emails a one-time link that lands at
 * /auth/callback?code=...&next=/update-password, which exchanges the code
 * for a short-lived session and then lets the user set a new password.
 *
 * Always returns `{ ok: true }` for non-errors — we intentionally don't
 * confirm whether an email is registered (account-enumeration defense).
 *
 * Rate limit: Supabase Auth's built-in per-email + per-IP limits on
 * `resetPasswordForEmail` (configurable in the Supabase dashboard)
 * cover build spec §2.11's "5 password resets per account per day".
 * We rely on the platform ceiling here because the caller isn't
 * authenticated yet — our `enforce_rate_limit` RPC needs `auth.uid()`,
 * so it can't apply to pre-login flows.
 */
export async function requestResetAction(formData: FormData): Promise<Result> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  return { ok: true };
}

export async function updatePasswordAction(formData: FormData): Promise<Result> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 12) return { error: "Password must be at least 12 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: true };
}
