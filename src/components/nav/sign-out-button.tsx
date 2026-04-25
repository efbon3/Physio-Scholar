"use client";

import { useRef, useTransition } from "react";

import { signOutAction } from "@/app/(auth)/login/actions";
import { clearAllLocalState } from "@/lib/srs/local";

/**
 * Sign-out button that wipes local learner state before calling the
 * server action.
 *
 * Why a client wrapper around the server action: the existing
 * signOutAction only clears the Supabase session cookie. It can't
 * reach Dexie, which stores `card_states`, `reviews`, and pending
 * push queues keyed by `profile_id`. On a shared device — one of the
 * primary deployment modes for MBBS batches, where a hostel phone
 * might be passed around — learner B signing in after learner A
 * signs out would inherit A's review history on the Today and
 * Progress dashboards until Supabase sync eventually overwrote it.
 * Worse, A's pending-push queue might upload under B's session.
 *
 * Flow on click:
 *   1. Await clearAllLocalState() — drops card_states, reviews,
 *      pending_state_pushes tables.
 *   2. Clear the per-profile sync cursor from localStorage so the
 *      next sign-in does a full pull.
 *   3. Submit the form so the server action clears the auth cookie
 *      and issues the redirect to /login.
 *
 * If step 1 throws (Dexie unavailable, private browsing, etc), we
 * still submit — the learner expects a sign-out to complete.
 */
type Props = {
  /**
   * Override the button's className so the caller controls styling.
   * Defaults to the nav-size style used in AppNav; the home-page
   * affordance uses a subtle text-underline style instead.
   */
  className?: string;
  /** Optional wrapping form className. */
  formClassName?: string;
};

const DEFAULT_BUTTON_CLASS =
  "text-muted-foreground hover:bg-muted rounded-md px-2 py-1 text-xs disabled:opacity-50";

export function SignOutButton({ className = DEFAULT_BUTTON_CLASS, formClassName }: Props = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        await clearAllLocalState();
      } catch {
        // Dexie unavailable / private mode — fall through.
      }
      // Drop any per-profile localStorage. The sync cursor is
      // scoped by profile_id; unrelated keys (install-prompt counter,
      // exam dismissals) are not learner-tied and can stay.
      if (typeof localStorage !== "undefined") {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i);
          if (k && k.startsWith("physio-scholar:sync-cursor:")) keys.push(k);
        }
        for (const k of keys) localStorage.removeItem(k);
      }
      formRef.current?.requestSubmit();
    });
  }

  return (
    <form ref={formRef} action={signOutAction} className={formClassName}>
      <button type="button" onClick={onClick} disabled={pending} className={className}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
