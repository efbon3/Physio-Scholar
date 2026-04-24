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
 * `profileId` is passed in from the server page so Dexie is scoped to
 * the real authenticated user id. In envs without Supabase (CI,
 * unconfigured previews) the server page falls back to the literal
 * "preview" — the same sentinel the review page uses — so locally
 * recorded reviews in that mode still round-trip.
 *
 * Phase 5 will grow this with streak / weak-area / clinical-challenge
 * callouts per build spec §2.3; D1 ships just the essentials.
 */
export function TodayDashboard({
  cards,
  email,
  profileId,
}: {
  cards: readonly Card[];
  email: string | null;
  profileId: string;
}) {
  const [summary, setSummary] = useState<QueueSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllCardStates(profileId);
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
  }, [cards, profileId]);

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
            <div className="flex flex-wrap gap-2">
              <Link href="/review" className={cn(buttonVariants({ size: "lg" }))}>
                Start review
              </Link>
              <Link href="/exam" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                Exam mode
              </Link>
            </div>
          </>
        )}
      </section>

      {summary && summary.total === 0 ? (
        <section aria-label="Secondary actions" className="flex flex-col gap-3">
          <p className="text-sm">
            Nothing to review? Still worth a drill — try an exam-mode MCQ run.
          </p>
          <div>
            <Link href="/exam" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Go to exam mode
            </Link>
          </div>
        </section>
      ) : null}

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
