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

  // Only allow relative redirects so a malicious `next` param can't send
  // the user to an external site after login. See src/lib/auth/redirects.ts
  // for the guarded criteria and its unit tests.
  const target = isSafeRelativePath(next) ? next : "/";
  return NextResponse.redirect(new URL(target, url.origin));
}
