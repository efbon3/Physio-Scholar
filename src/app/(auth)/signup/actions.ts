"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SignupResult = { error: string } | undefined;

/**
 * Sign up a new user with email + password, recording DPDPA consent on
 * the auto-created profile row. The full set of identifying details
 * (name, nickname, mobile, college, roll, etc) is collected on the
 * /complete-profile page after email confirmation — that's why this
 * action is intentionally minimal.
 *
 * Returns `{ error }` on validation or Supabase errors; on success,
 * redirects to /check-email where Supabase's confirmation link is awaited.
 * Once the user clicks the confirmation link, the auth callback drops
 * them on the home page; the (app) layout's gate then sends them to
 * /complete-profile, then /pending-approval, then /today.
 */
export async function signUpAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const consentTerms = formData.get("consent_terms") === "on";
  const consentPrivacy = formData.get("consent_privacy") === "on";
  const consentAnalytics = formData.get("consent_analytics") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }
  if (!consentTerms || !consentPrivacy) {
    return { error: "You must accept the Terms and the Privacy Policy to create an account." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/` },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Signup failed for an unknown reason." };

  // Record the consent timestamps on the profile the trigger just
  // created. Done with the same just-signed-up session (RLS permits
  // self-update). approved_at + profile_completed_at both stay NULL —
  // the user is sent through /complete-profile then /pending-approval
  // before they can reach /today.
  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      consent_terms_accepted_at: now,
      consent_privacy_accepted_at: now,
      consent_analytics: consentAnalytics,
      consent_analytics_updated_at: now,
    })
    .eq("id", data.user.id);

  if (profileError) return { error: `Consent could not be recorded: ${profileError.message}` };

  redirect("/check-email");
}
