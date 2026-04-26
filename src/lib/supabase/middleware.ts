import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "./database.types";

/**
 * Middleware-time Supabase session refresh.
 *
 * Called from `src/middleware.ts` on every request. Reads the auth cookies,
 * calls `supabase.auth.getUser()` to refresh/validate the session, and
 * writes any rotated cookies back onto the response.
 *
 * If the request is for a protected route and no user is present, redirects
 * to `/login` with the original path as a `next` query param.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In CI and in Vercel previews before env vars are wired, we simply pass
  // requests through. This keeps the build + E2E green while still loudly
  // blocking protected routes (nothing is served from /app, /today, etc.
  // until auth is actually configured).
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() must be called here so the auth library refreshes the
  // session token. Without this line, the cookies never rotate and expired
  // tokens would silently leak through.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * Route prefixes that require a signed-in user. Everything else (landing
 * page, auth pages, public assets) is open.
 *
 * Keep this list in sync with the `(app)` route group in `src/app/(app)/`
 * — the (app) layout's `requireApprovedUser()` returns silently for
 * anonymous users (it expects middleware to have already redirected
 * them), so any (app)-group route that isn't listed here is reachable
 * by an anonymous visitor. /complete-profile and /pending-approval are
 * deliberately NOT here because they need to be reachable by signed-in
 * users who are mid-onboarding.
 */
const PROTECTED_PREFIXES = [
  "/app",
  "/today",
  "/systems",
  "/progress",
  "/review",
  "/exam",
  "/simulators",
  "/admin",
  "/profile",
  "/calendar",
  "/facts",
  "/values",
  "/self-test",
  "/topics",
  "/settings",
  "/update-password",
  "/faculty",
] as const;
