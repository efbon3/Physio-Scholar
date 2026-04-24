"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  /**
   * Optional next-path to redirect to after the OAuth callback. The
   * auth/callback handler forwards through to this value the same way
   * the email login flow does.
   */
  next?: string;
  /** Rendered label. Defaults to "Continue with Google". */
  label?: string;
};

/**
 * Google Sign-In button.
 *
 * Uses Supabase Auth's OAuth-with-PKCE helper so no client secrets ship
 * to the browser — the PKCE verifier is generated client-side and
 * exchanged by the auth/callback handler on return.
 *
 * The button degrades gracefully when Supabase env vars are missing
 * (CI / unconfigured preview): the button is hidden entirely. This
 * keeps the E2E pages quiet and avoids "button does nothing" clicks in
 * environments where OAuth isn't set up.
 *
 * Google Cloud OAuth client must be configured with the Supabase
 * callback URL:
 *   https://<project-ref>.supabase.co/auth/v1/callback
 * Supabase's dashboard → Authentication → Providers → Google is where
 * the client id + secret land. Without that setup, the button will
 * render and click through but Supabase will return an "unsupported
 * provider" error — surfaced as a toast here rather than a crash.
 */
export function GoogleSignInButton({ next, label = "Continue with Google" }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  async function handleClick() {
    setError(null);
    setPending(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) {
        setError(oauthError.message);
        setPending(false);
      }
      // On success, the browser navigates away. No state cleanup needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="border-input bg-background hover:bg-muted inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        <GoogleGlyph />
        {pending ? "Redirecting…" : label}
      </button>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Minimal Google "G" mark as inline SVG. Keeps the bundle a few bytes
 * lighter than the branded PNG and scales crisply at any size.
 */
function GoogleGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3L37.6 9.1C34 5.7 29.3 3.6 24 3.6 12.9 3.6 3.9 12.6 3.9 23.7S12.9 43.8 24 43.8c11 0 19.7-8 19.7-20.1 0-1.1-.1-2.1-.3-3.2z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7 13 19.6c1.8-3.5 5.4-6 9.6-6 3.1 0 5.8 1.2 7.9 3L37.6 9.1C34 5.7 29.3 3.6 24 3.6 16.4 3.6 9.9 8 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.8c5.2 0 9.8-2 13.3-5.3l-6.2-5.2c-1.9 1.3-4.3 2.1-7.1 2.1-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.9 39.4 16.4 43.8 24 43.8z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.2 5.2c-.4.4 6.4-4.7 6.4-13.3 0-1.1-.1-2.1-.3-3.2z"
      />
    </svg>
  );
}
