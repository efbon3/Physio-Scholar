"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { loadAllPrepgCardStates } from "@/lib/srs/prepg-local";
import { cn } from "@/lib/utils";

type Props = {
  /** Card ids of every Pre-PG MCQ. Used to scope the due count to the active bank. */
  cardIds: readonly string[];
  profileId: string;
  hasContent: boolean;
};

/**
 * Lightweight Dexie-backed banner shown above the Pre-PG chapter
 * list. Surfaces the daily-review entry point when there's anything
 * due. SSR-safe — renders nothing until the client mounts and reads
 * IndexedDB.
 */
export function PrepgDueBanner({ cardIds, profileId, hasContent }: Props) {
  // When there's no content yet, initial state is 0 — no need to
  // touch IndexedDB. Otherwise null is the "loading" sentinel; the
  // effect below resolves it on mount.
  const [dueCount, setDueCount] = useState<number | null>(hasContent ? null : 0);

  useEffect(() => {
    if (!hasContent) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllPrepgCardStates(profileId);
        const ids = new Set(cardIds);
        const now = Date.now();
        let due = 0;
        for (const row of rows) {
          if (!ids.has(row.card_id)) continue;
          if (!row.due_at) continue;
          if (new Date(row.due_at).getTime() <= now) due += 1;
        }
        if (!cancelled) setDueCount(due);
      } catch {
        if (!cancelled) setDueCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardIds, profileId, hasContent]);

  if (dueCount === null || dueCount === 0) return null;

  return (
    <div className="border-input bg-muted/30 flex items-center justify-between gap-3 rounded-md border p-3">
      <p className="text-sm">
        <strong className="font-medium">{dueCount}</strong> Pre-PG card
        {dueCount === 1 ? "" : "s"} due for revision.
      </p>
      <Link href="/prepg/review" className={cn(buttonVariants({ size: "default" }), "shrink-0")}>
        Start review
      </Link>
    </div>
  );
}
