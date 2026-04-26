"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SignupResult = { error: string } | undefined;

/**
 * Sign up a new user with email + password, recording DPDPA consent on the
 * auto-created profile row (the `handle_new_user` trigger creates the row;
 * we update it here to capture when consent was given).
 *
 * Returns `{ error }` on validation or Supabase errors; on success, redirects
 * to /check-email where Supabase's confirmation link is awaited.
 */
export async function signUpAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const rollNumber = String(formData.get("roll_number") ?? "").trim();
  const consentTerms = formData.get("consent_terms") === "on";
  const consentPrivacy = formData.get("consent_privacy") === "on";
  const consentAnalytics = formData.get("consent_analytics") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (!fullName) {
    return { error: "Full name is required for admin verification." };
  }
  if (!rollNumber) {
    return { error: "Roll number is required for admin verification." };
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

  // Record the consent + verification details on the profile the
  // trigger just created. Done with the same just-signed-up session
  // (RLS permits self-update). approved_at stays NULL — admin must
  // approve before the learner can reach /today.
  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      roll_number: rollNumber,
      consent_terms_accepted_at: now,
      consent_privacy_accepted_at: now,
      consent_analytics: consentAnalytics,
      consent_analytics_updated_at: now,
    })
    .eq("id", data.user.id);

  if (profileError) return { error: `Consent could not be recorded: ${profileError.message}` };

  redirect("/check-email");
}
