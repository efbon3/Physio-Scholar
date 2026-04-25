import { NextResponse } from "next/server";

import { isSafeRelativePath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback handler.
 *
 * Supabase sends email-confirmation and password-reset links of the shape
 *   https://<site>/auth/callback?code=<one-time-code>&next=<redirect-path>
 *
 * We exchange the code for a session, then redirect to the `next` target
 * (or a sensible default). Errors bounce to /login with a short reason.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // DPDPA compliance: email signup captures consent via explicit
  // checkboxes that write `consent_terms_accepted_at` /
  // `consent_privacy_accepted_at` on the profile row. OAuth callbacks
  // (Google) don't go through that form, so without this block a
  // Google-signed-in learner would have NULL consent timestamps
  // forever — an evidence gap if DPDPA enforcement asks. We stamp
  // consent on the first successful callback only (the AND IS NULL
  // guards make this idempotent for subsequent sign-ins). The signup
  // page copy informs Google users that signing in = accepting Terms
  // + Privacy, which is the legal basis for this implicit capture.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const nowIso = new Date().toISOString();
      await supabase
        .from("profiles")
        .update({
          consent_terms_accepted_at: nowIso,
          consent_privacy_accepted_at: nowIso,
        })
        .eq("id", user.id)
        .is("consent_terms_accepted_at", null);
    }
  } catch {
    // Best-effort: a failure here is logged by Supabase but we don't
    // block the learner from reaching /today. The next sign-in retries.
  }

  // Only allow relative redirects so a malicious `next` param can't send
  // the user to an external site after login. See src/lib/auth/redirects.ts
  // for the guarded criteria and its unit tests.
  const target = isSafeRelativePath(next) ? next : "/";
  return NextResponse.redirect(new URL(target, url.origin));
}
