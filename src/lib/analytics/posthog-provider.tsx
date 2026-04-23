"use client";

import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as BasePostHogProvider } from "posthog-js/react";

/**
 * PostHog analytics provider.
 *
 * Initialization is gated on three things, in order:
 *   1. Build/runtime env provides NEXT_PUBLIC_POSTHOG_KEY. No key → no-op.
 *   2. The `consented` prop from the server (derived from the user's
 *      profile.consent_analytics value). No consent → no-op. Default off
 *      per build spec §2.10.
 *   3. The user hasn't opted out via PostHog's own cookie-based opt-out.
 *
 * If any check fails, we never call `posthog.init()` — so no events are
 * captured and no client cookies are set.
 */
type Props = {
  children: ReactNode;
  /** Distinct user id, if signed in. Sent to `posthog.identify()`. */
  userId?: string;
  /** Has the user opted in to product analytics? Drives init entirely. */
  consented: boolean;
};

export function PostHogProvider({ children, userId, consented }: Props) {
  useEffect(() => {
    if (!consented) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: "history_change",
      persistence: "localStorage+cookie",
      autocapture: false,
      disable_session_recording: true,
    });

    if (userId) posthog.identify(userId);

    return () => {
      posthog.reset();
    };
  }, [consented, userId]);

  if (!consented || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <BasePostHogProvider client={posthog}>{children}</BasePostHogProvider>;
}
