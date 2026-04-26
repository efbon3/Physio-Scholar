"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { Value } from "@/lib/content/values";
import { recordReviewLocally } from "@/lib/srs/local";
import type { Rating } from "@/lib/srs/types";
import { cn } from "@/lib/utils";

type Status = "drilling" | "complete";
type Outcome = "knew" | "didnt";

type Recorded = {
  value: Value;
  outcome: Outcome;
};

/**
 * Values flashcard session. Mirrors /facts in shape but scoped to
 * numeric quantities only — one prompt, reveal, two-button self-grade.
 *
 *   knew  → SM-2 "good"  — schedules normal interval, ease unchanged
 *   didnt → SM-2 "again" — re-shows in ~1 minute (learning step)
 *
 * The learner types nothing — recall is internal. The reveal pane
 * is where the canonical answer (number, unit, range note) appears.
 */
export function ValuesSession({
  values,
  profileId,
  mechanism,
}: {
  values: readonly Value[];
  profileId: string;
  mechanism: { id: string; title: string };
}) {
  const [status, setStatus] = useState<Status>("drilling");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [recorded, setRecorded] = useState<Recorded[]>([]);
  const [persistError, setPersistError] = useState<string | null>(null);

  // Shuffle once on mount so successive sessions feel fresh. Lazy
  // useState keeps it stable across renders without an effect.
  const [shuffled] = useState(() => shuffle(values));
  const total = shuffled.length;
  const current = shuffled[index];

  // Per-card start; written by event handlers, read in event
  // handlers, never touched in render — keeps the render path pure.
  const cardStartRef = useRef<number | null>(null);

  const tally = useMemo(() => {
    let knew = 0;
    for (const r of recorded) if (r.outcome === "knew") knew += 1;
    return { knew, didnt: recorded.length - knew, total: recorded.length };
  }, [recorded]);

  function reveal() {
    if (cardStartRef.current === null) cardStartRef.current = Date.now();
    setRevealed(true);
  }

  async function rate(outcome: Outcome) {
    if (!current) return;
    const now = Date.now();
    const startedAt = cardStartRef.current ?? now - 1000;
    const elapsed = Math.max(1, Math.round((now - startedAt) / 1000));
    const rating: Rating = outcome === "knew" ? "good" : "again";

    setRecorded((prev) => [...prev, { value: current, outcome }]);

    try {
      await recordReviewLocally({
        profileId,
        cardId: current.id,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsed,
        sessionId: `values-${mechanism.id}-${Date.now().toString(36)}`,
        // Tag the row so analytics can split values from facts/cards
        // without needing a schema migration.
        selfExplanation: `[value, outcome=${outcome}]`,
      });
    } catch (err) {
      console.error("Failed to record value rating locally", err);
      setPersistError(err instanceof Error ? err.message : "Failed to save your rating.");
    }

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setStatus("complete");
    } else {
      setIndex(nextIndex);
      setRevealed(false);
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
            href={`/values/session?mechanism=${encodeURIComponent(mechanism.id)}`}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Run again
          </Link>
          <Link href="/values" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
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
          Values · {mechanism.title}
        </span>
        <span className="text-muted-foreground">
          Card {index + 1} of {total}
        </span>
      </header>

      <section aria-label="Prompt" className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Normal value</p>
        <h1 className="font-heading text-2xl leading-snug font-medium">{current.prompt}</h1>
      </section>

      {!revealed ? (
        <section aria-label="Reveal control" className="flex flex-col gap-2">
          <Button type="button" onClick={reveal} className="self-start">
            Show value
          </Button>
          <p className="text-muted-foreground text-xs">
            Try to recall the number and unit before revealing.
          </p>
        </section>
      ) : (
        <>
          <section aria-label="Value" className="flex flex-col gap-2 border-t pt-4">
            <h2 className="font-heading text-lg font-medium">Value</h2>
            <p className="text-base leading-7">{current.answer}</p>
          </section>

          <section aria-label="Self-grade" className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Did you have it?</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void rate("knew")}
                data-testid="value-knew"
                className="border-input bg-background hover:bg-muted flex min-h-12 items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium"
              >
                Knew it
              </button>
              <button
                type="button"
                onClick={() => void rate("didnt")}
                data-testid="value-didnt"
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

/** Fisher-Yates shuffle, client-side, runs once via lazy useState. */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
