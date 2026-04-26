"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  FACT_CATEGORY_LABELS,
  FACT_CATEGORY_SINGULAR,
  type Fact,
  type FactCategory,
} from "@/lib/content/facts";
import { recordReviewLocally } from "@/lib/srs/local";
import type { Rating } from "@/lib/srs/types";
import { cn } from "@/lib/utils";

type Status = "drilling" | "complete";
type Outcome = "knew" | "didnt";

type Recorded = {
  fact: Fact;
  outcome: Outcome;
  startedAt: number;
  ratedAt: number;
};

/**
 * Facts flashcard session. Distinct from /review and /self-test:
 *
 *   1. Shows one prompt at a time.
 *   2. Learner clicks "Show answer" to reveal.
 *   3. Two-button self-grade: "Knew it" / "Didn't".
 *   4. The outcome maps to an SM-2 rating and writes a review row
 *      via recordReviewLocally — facts feed the same Dexie + sync
 *      pipeline as mechanism cards.
 *
 * Mapping:
 *   knew  → "good"  — schedules normal interval, ease unchanged
 *   didnt → "again" — re-show in ~1 minute (learning step)
 *
 * "Easy" and "Hard" don't really fit a binary recall self-grade, so
 * this mode collapses to two buttons. A learner who wants the
 * granular 4-grade scale should use /self-test or /review for full
 * mechanism cards.
 */
export function FactsSession({
  facts,
  profileId,
  mechanism,
  categoryFilter,
}: {
  facts: readonly Fact[];
  profileId: string;
  mechanism: { id: string; title: string };
  categoryFilter: FactCategory | null;
}) {
  const [status, setStatus] = useState<Status>("drilling");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [recorded, setRecorded] = useState<Recorded[]>([]);
  const [persistError, setPersistError] = useState<string | null>(null);

  // Shuffle on first mount only (client-side). Lazy-init via useState
  // means the shuffle runs once and the order stays stable across renders.
  const [shuffledFacts] = useState(() => shuffleClient(facts));
  const total = shuffledFacts.length;
  const current = shuffledFacts[index];

  // Per-card start time. Stored in a ref because we don't render it,
  // we just read it inside the rate() event handler. The ref is
  // initialised by the rate handler itself (which writes Date.now()
  // back to the ref after each card advance), so the render path
  // never touches Date.now().
  const cardStartRef = useRef<number | null>(null);
  const tally = useMemo(() => {
    let knew = 0;
    for (const r of recorded) if (r.outcome === "knew") knew += 1;
    return { knew, didnt: recorded.length - knew, total: recorded.length };
  }, [recorded]);

  function reveal() {
    // Capture the first card's start time as the user reveals (they've
    // had whatever recall pause they wanted before this click). For
    // subsequent cards the ref was already stamped at the previous
    // card's advance.
    if (cardStartRef.current === null) cardStartRef.current = Date.now();
    setRevealed(true);
  }

  async function rate(outcome: Outcome) {
    if (!current) return;
    const now = Date.now();
    // First card's start defaults to "now - 1s" if the user clicked
    // straight through without delay; otherwise it's whatever the
    // previous card's rating wrote into the ref.
    const startedAt = cardStartRef.current ?? now - 1000;
    const elapsed = Math.max(1, Math.round((now - startedAt) / 1000));
    const rating: Rating = outcome === "knew" ? "good" : "again";

    setRecorded((prev) => [...prev, { fact: current, outcome, startedAt, ratedAt: now }]);

    try {
      await recordReviewLocally({
        profileId,
        cardId: current.id,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsed,
        sessionId: `facts-${mechanism.id}-${Date.now().toString(36)}`,
        // Embed the category so analytics can filter facts vs questions
        // without needing a schema migration. Same pattern as the
        // self-grade prefix in /review.
        selfExplanation: `[fact, category=${current.category}, outcome=${outcome}]`,
      });
    } catch (err) {
      console.error("Failed to record fact rating locally", err);
      setPersistError(err instanceof Error ? err.message : "Failed to save your fact rating.");
    }

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setStatus("complete");
    } else {
      setIndex(nextIndex);
      setRevealed(false);
      // Stamp the next card's start time. Writing in an event
      // handler is fine under React 19's purity rules.
      cardStartRef.current = Date.now();
    }
  }

  if (status === "complete") {
    const pct = total > 0 ? Math.round((tally.knew / total) * 100) : 0;
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-medium">Session complete</h1>
        <p className="text-muted-foreground text-sm">
          You knew <span className="font-medium">{tally.knew}</span> of{" "}
          <span className="font-medium">{total}</span> ({pct}%).
        </p>
        {persistError ? <p className="text-destructive text-xs">{persistError}</p> : null}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Link
            href={`/facts/session?mechanism=${encodeURIComponent(mechanism.id)}${categoryFilter ? `&category=${categoryFilter}` : ""}`}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Run again
          </Link>
          <Link href="/facts" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Pick another mechanism
          </Link>
          <Link href="/today" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!current) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground tracking-widest uppercase">
          Facts · {mechanism.title}
          {categoryFilter ? ` · ${FACT_CATEGORY_LABELS[categoryFilter]}` : ""}
        </span>
        <span className="text-muted-foreground">
          Card {index + 1} of {total}
        </span>
      </header>

      <section aria-label="Prompt" className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          {FACT_CATEGORY_SINGULAR[current.category]}
        </p>
        <h1 className="font-heading text-2xl leading-snug font-medium">{current.prompt}</h1>
      </section>

      {!revealed ? (
        <section aria-label="Reveal control" className="flex flex-col gap-2">
          <Button type="button" onClick={reveal} className="self-start">
            Show answer
          </Button>
          <p className="text-muted-foreground text-xs">
            Try to recall the answer in your head before revealing.
          </p>
        </section>
      ) : (
        <>
          <section aria-label="Answer" className="flex flex-col gap-2 border-t pt-4">
            <h2 className="font-heading text-lg font-medium">Answer</h2>
            <p className="text-sm leading-7">{current.answer}</p>
          </section>

          <section aria-label="Self-grade" className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">How did you do?</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void rate("knew")}
                data-testid="fact-knew"
                className="border-input bg-background hover:bg-muted flex min-h-12 items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium"
              >
                Knew it
              </button>
              <button
                type="button"
                onClick={() => void rate("didnt")}
                data-testid="fact-didnt"
                className="border-input bg-background hover:bg-muted flex min-h-12 items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium"
              >
                Didn&apos;t
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Knew it → schedules a normal SRS interval. Didn&apos;t → re-shows in about a minute.
            </p>
          </section>
        </>
      )}

      <footer className="text-muted-foreground border-t pt-3 text-xs">
        Running tally: <span className="font-medium">{tally.knew}</span> knew ·{" "}
        <span className="font-medium">{tally.didnt}</span> didn&apos;t ·{" "}
        <span className="font-medium">{total - tally.total}</span> remaining
      </footer>
    </main>
  );
}

/**
 * Client-side Fisher-Yates shuffle. Called from a useState initialiser
 * so it only runs on first mount, not on every render. Math.random is
 * fine here because the result lives in component state — successive
 * renders see the same shuffled order.
 */
function shuffleClient<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
