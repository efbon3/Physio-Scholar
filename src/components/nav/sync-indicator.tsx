"use client";

import { useEffect, useState } from "react";

import { countPendingReviews } from "@/lib/srs/local";
import { useAutoSync } from "@/lib/srs/useAutoSync";

/**
 * Tiny status badge for the nav: "Synced", "Syncing…", "N queued",
 * "Sync error". Reads countPendingReviews on every sync result so the
 * indicator reflects the truth in Dexie, not just our best-guess counter.
 *
 * No-op (returns null) when profileId is "preview" or the environment
 * has no Supabase — the hook handles that; this component simply hides
 * so learners aren't shown a stale "Synced" when no sync is possible.
 */
export function SyncIndicator({ profileId }: { profileId: string }) {
  const sync = useAutoSync({ profileId });
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (profileId === "preview") return;
      try {
        const n = await countPendingReviews(profileId);
        if (!cancelled) setPending(n);
      } catch {
        if (!cancelled) setPending(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, sync.lastResult]);

  if (profileId === "preview") return null;

  if (sync.status === "syncing") {
    return <span className="text-muted-foreground text-xs">Syncing…</span>;
  }
  if (sync.status === "error") {
    return (
      <span className="text-destructive text-xs" title={sync.lastError ?? "Sync failed"}>
        Sync failed
      </span>
    );
  }
  if (pending && pending > 0) {
    return (
      <button
        type="button"
        onClick={() => {
          void sync.runSync();
        }}
        className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        aria-label={`${pending} review${pending === 1 ? "" : "s"} queued — tap to sync`}
      >
        {pending} queued
      </button>
    );
  }
  return <span className="text-muted-foreground text-xs">Synced</span>;
}
