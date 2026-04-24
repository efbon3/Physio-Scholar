"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { syncNow, type SyncResult } from "./sync";

export type AutoSyncStatus = "idle" | "syncing" | "error";

export type UseAutoSync = {
  status: AutoSyncStatus;
  lastSyncedAt: Date | null;
  lastResult: SyncResult | null;
  lastError: string | null;
  /** Manually trigger a sync — useful for a "Sync now" button or post-review hook. */
  runSync: () => Promise<void>;
};

type Options = {
  /** Current learner id. Null/"preview" disables the hook. */
  profileId: string | null;
  /**
   * Feature flag — set to false for environments without Supabase so
   * the component tree doesn't attempt network calls. Defaults to the
   * presence of `NEXT_PUBLIC_SUPABASE_URL` in the client bundle.
   */
  enabled?: boolean;
  /**
   * Minimum ms between automatic syncs. Rapid tab-switching shouldn't
   * fire a new request every time — this debounces the listeners.
   */
  cooldownMs?: number;
};

const DEFAULT_COOLDOWN_MS = 10_000;

/**
 * Keeps Dexie and Supabase converged without user action. Runs a sync:
 *   - once on mount
 *   - every time the tab becomes visible after being hidden
 *   - every time the device comes back online
 * with a 10s cooldown so tab-flips don't hammer the API.
 *
 * The hook is no-op when `profileId` is null or the fallback
 * `"preview"` (CI / unconfigured envs). It's safe to mount
 * unconditionally in the app shell.
 */
export function useAutoSync({
  profileId,
  enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  cooldownMs = DEFAULT_COOLDOWN_MS,
}: Options): UseAutoSync {
  const [status, setStatus] = useState<AutoSyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const lastRunAt = useRef<number>(0);

  const active = enabled && profileId !== null && profileId !== "preview";

  const runSync = useCallback(async () => {
    if (!active || !profileId) return;
    const nowMs = Date.now();
    if (nowMs - lastRunAt.current < cooldownMs) return;
    if (inFlight.current) return;
    inFlight.current = true;
    lastRunAt.current = nowMs;
    setStatus("syncing");
    setLastError(null);
    try {
      const supabase = createClient();
      const result = await syncNow({ supabase, profileId });
      setLastResult(result);
      if (result.error) {
        setStatus("error");
        setLastError(result.error);
      } else {
        setStatus("idle");
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      setStatus("error");
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      inFlight.current = false;
    }
  }, [active, profileId, cooldownMs]);

  useEffect(() => {
    if (!active) return;
    // Defer the initial sync by a microtask so we don't trigger a
    // setState synchronously inside the effect body (React 19's
    // set-state-in-effect lint). The side effects (listeners) still
    // register immediately.
    const initialId = setTimeout(() => {
      void runSync();
    }, 0);

    function onVisibility() {
      if (document.visibilityState === "visible") void runSync();
    }
    function onOnline() {
      void runSync();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    return () => {
      clearTimeout(initialId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [active, runSync]);

  return { status, lastSyncedAt, lastResult, lastError, runSync };
}
