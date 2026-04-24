"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { loadAllCardStates } from "@/lib/srs/local";
import { assembleQueue, summariseQueue } from "@/lib/srs/queue";
import type { CardState } from "@/lib/srs/types";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_NEW_CARDS = 10;

type QueueSummary = {
  due: number;
  new: number;
  total: number;
};

/**
 * Client-side half of the Today tab. Reads card_states out of Dexie
 * and assembles the same queue the review session would use, so the
 * "N due / M new" counter reflects the actual next session.
 *
 * Phase 5 will grow this with streak / weak-area / clinical-challenge
 * callouts per build spec §2.3; D1 ships just the essentials.
 */
export function TodayDashboard({ cards, email }: { cards: readonly Card[]; email: string | null }) {
  const [summary, setSummary] = useState<QueueSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // Profile-scoped load — we don't know the profile id client-side
        // without another server round-trip, but loadAllCardStates
        // filters via `where("profile_id").equals(...)`. For the Dexie
        // guarantee to hold, we use the placeholder / signed-in id the
        // review page also uses. Phase 6's sync work replaces this
        // with a proper auth-scoped read.
        const rows = await loadAllCardStates("preview");
        const stateMap = new Map<string, CardState>();
        for (const row of rows) stateMap.set(row.card_id, row);
        const queue = assembleQueue({
          cards,
          cardStates: stateMap,
          now: new Date(),
          maxNewCards: DEFAULT_MAX_NEW_CARDS,
        });
        if (!cancelled) setSummary(summariseQueue(queue));
      } catch {
        if (!cancelled) setSummary({ due: 0, new: 0, total: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards]);

  const greetingName = email?.split("@")[0] ?? "there";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Today</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Hi, {greetingName}.</h1>
      </header>

      <section aria-label="Review queue" className="flex flex-col gap-4">
        {summary === null ? (
          <p className="text-muted-foreground text-sm">Loading queue…</p>
        ) : summary.total === 0 ? (
          <p className="text-sm">
            Nothing due right now. You&apos;re all caught up — come back tomorrow.
          </p>
        ) : (
          <>
            <p className="text-base leading-7">
              <strong className="font-medium">{summary.total}</strong> card
              {summary.total === 1 ? "" : "s"} waiting
              {summary.due > 0 ? (
                <>
                  {" "}
                  ({summary.due} due
                  {summary.new > 0 ? `, ${summary.new} new` : ""})
                </>
              ) : summary.new > 0 ? (
                <> ({summary.new} new)</>
              ) : null}
              .
            </p>
            <div>
              <Link href="/review" className={cn(buttonVariants({ size: "lg" }))}>
                Start review
              </Link>
            </div>
          </>
        )}
      </section>

      <section
        aria-label="Placeholders for Phase 5 widgets"
        className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs"
      >
        <p>
          Coming soon on this dashboard: streak indicator, weak-area callout, and a clinical
          challenge link (build spec §2.3).
        </p>
      </section>
    </main>
  );
}
