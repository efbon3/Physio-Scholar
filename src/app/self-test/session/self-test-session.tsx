"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { HintLadder } from "@/app/review/components/hint-ladder";
import { estimateReviewMinutes, PreflightModal } from "@/components/preflight-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import {
  computeFinalScore,
  hintPenaltyFor,
  scoreToSrsRating,
  selfTestRating,
  SELF_GRADE_BASE_POINTS,
  SELF_GRADE_DESCRIPTIONS,
  SELF_GRADE_LABELS,
  SELF_GRADE_VALUES,
  type SelfGrade,
} from "@/lib/self-test/grading";
import { recordReviewLocally } from "@/lib/srs/local";
import { cn } from "@/lib/utils";

type Status = "preflight" | "drilling" | "grading" | "complete";

type CardEntry = {
  card: Card;
  attempt: string;
  hintsShown: number;
  submitted: boolean;
  selfGrade: SelfGrade | null;
  /** ms epoch when this card was submitted. null until the student hits Submit. */
  submittedAt: number | null;
};

/**
 * Self-test session.
 *
 * Distinct from /review (per-card immediate feedback) — here the
 * student types each attempt, optionally peeks at hints, submits
 * without seeing the answer, and at the end reviews their attempt
 * side-by-side with the canonical answer to self-grade.
 *
 * Hints carry a points penalty; see src/lib/self-test/grading.ts
 * for the score model. Final per-card score is mapped to an SM-2
 * rating (Again/Hard/Good/Easy) so the existing scheduler picks
 * up the result without a new code path.
 *
 * State machine:
 *   preflight → drilling (per-card submit loop)
 *             → grading (end-of-session side-by-side review)
 *             → complete (summary)
 */
export function SelfTestSession({
  cards,
  profileId,
  focusMechanism,
}: {
  cards: readonly Card[];
  profileId: string;
  focusMechanism?: { id: string; title: string } | null;
}) {
  const [status, setStatus] = useState<Status>("preflight");
  const [index, setIndex] = useState(0);
  const [entries, setEntries] = useState<CardEntry[]>(() =>
    cards.map((c) => ({
      card: c,
      attempt: "",
      hintsShown: 0,
      submitted: false,
      selfGrade: null,
      submittedAt: null,
    })),
  );
  const [persisting, setPersisting] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  // Session-start timestamp; per-card duration is derived from successive
  // submission timestamps (card N's duration = submittedAt[N] - submittedAt[N-1],
  // with submittedAt[-1] = sessionStart for the first card). Set in the
  // preflight-accept handler — a user gesture, not a render — so React 19's
  // pure-render rule is honoured.
  const sessionStartRef = useRef<number | null>(null);

  const total = entries.length;
  const current = entries[index];

  const totalScore = useMemo(() => {
    let sum = 0;
    let graded = 0;
    for (const e of entries) {
      if (e.selfGrade !== null) {
        sum += computeFinalScore(e.selfGrade, e.hintsShown);
        graded += 1;
      }
    }
    return { sum, graded, max: graded * 100 };
  }, [entries]);

  function updateEntry(i: number, patch: Partial<CardEntry>) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function showNextHint() {
    if (!current) return;
    if (current.hintsShown >= current.card.hints.length) return;
    if (current.hintsShown >= 3) return;
    updateEntry(index, { hintsShown: current.hintsShown + 1 });
  }

  function submitCurrent() {
    if (!current) return;
    updateEntry(index, { submitted: true, submittedAt: Date.now() });
    const next = index + 1;
    if (next >= total) {
      setStatus("grading");
    } else {
      setIndex(next);
    }
  }

  function setGrade(i: number, grade: SelfGrade) {
    updateEntry(i, { selfGrade: grade });
  }

  async function finalize() {
    if (entries.some((e) => e.selfGrade === null)) return;
    setPersisting(true);
    setPersistError(null);
    try {
      // Record one SRS review per card with the self-test rating.
      const sessionId = `self-test-${Date.now().toString(36)}`;
      const sessionStart = sessionStartRef.current ?? Date.now();
      let prevTs = sessionStart;
      for (const e of entries) {
        if (e.selfGrade === null) continue;
        const { rating } = selfTestRating(e.selfGrade, e.hintsShown);
        const submittedAt = e.submittedAt ?? prevTs;
        const elapsedSeconds = Math.max(1, Math.round((submittedAt - prevTs) / 1000));
        prevTs = submittedAt;
        await recordReviewLocally({
          profileId,
          cardId: e.card.id,
          rating,
          hintsUsed: e.hintsShown,
          timeSpentSeconds: elapsedSeconds,
          sessionId,
          // Embed the typed attempt as the self-explanation field so it
          // survives sync. A future schema migration can split out a
          // dedicated attempt column; for v1 the existing column does
          // the job without a migration.
          selfExplanation: e.attempt.trim() ? e.attempt.trim() : null,
        });
      }
      setStatus("complete");
    } catch (err) {
      console.error("Self-test persistence failed", err);
      setPersistError(
        err instanceof Error ? err.message : "Failed to save your self-test results.",
      );
    } finally {
      setPersisting(false);
    }
  }

  if (status === "preflight") {
    return (
      <PreflightModal
        open
        kind="Self-test"
        questionCount={total}
        estimatedMinutes={estimateReviewMinutes(total)}
        context={focusMechanism ? `Focus: ${focusMechanism.title}` : null}
        cancelHref={
          focusMechanism ? `/mechanisms/${encodeURIComponent(focusMechanism.id)}` : "/self-test"
        }
        onAccept={() => {
          if (sessionStartRef.current === null) sessionStartRef.current = Date.now();
          setStatus("drilling");
        }}
      />
    );
  }

  if (status === "drilling") {
    if (!current) {
      // Edge: no cards
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-heading text-2xl font-medium">Nothing to test</h1>
          <p className="text-muted-foreground text-sm">
            Pick a system or mechanism with at least one question.
          </p>
          <Link
            href="/self-test"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to self-test
          </Link>
        </main>
      );
    }

    const totalHints = current.card.hints.length;
    const canShowHint = current.hintsShown < totalHints && current.hintsShown < 3;
    const submitDisabled = current.attempt.trim().length === 0;

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
          <span className="text-muted-foreground tracking-widest uppercase">Self-test</span>
          <span className="text-muted-foreground">
            Card {index + 1} of {total}
          </span>
        </header>

        <section aria-label="Question" className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            {current.card.mechanism_id.replace(/-/g, " ")}
          </p>
          <h1 className="font-heading text-2xl leading-snug font-medium">{current.card.stem}</h1>
        </section>

        <section aria-label="Your attempt" className="flex flex-col gap-2">
          <label htmlFor="attempt" className="text-sm font-medium">
            Your answer
          </label>
          <textarea
            id="attempt"
            className="border-input bg-background min-h-32 w-full rounded-md border px-3 py-2 text-sm leading-7 outline-none focus:ring-2"
            placeholder="Write your answer. You will not see the correct answer until the end of the session."
            value={current.attempt}
            onChange={(e) => updateEntry(index, { attempt: e.target.value })}
            autoFocus
          />
        </section>

        <section aria-label="Hint controls" className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {totalHints > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={showNextHint}
                disabled={!canShowHint}
              >
                {current.hintsShown === 0
                  ? "Show hint (-20 points)"
                  : canShowHint
                    ? `Next hint (${current.hintsShown}/${totalHints})`
                    : `All hints shown (${totalHints}/${totalHints})`}
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={submitCurrent} disabled={submitDisabled}>
              Submit & next →
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Each hint after the first costs less: 1 hint = -20 points, 2 hints = -30 points, 3 hints
            = -40 points (deducted from your self-graded score at the end). The minimum score is 0.
          </p>
        </section>

        {current.hintsShown > 0 ? (
          <HintLadder hints={current.card.hints} shownCount={current.hintsShown} />
        ) : null}
      </main>
    );
  }

  if (status === "grading") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Self-test</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Grade your answers</h1>
          <p className="text-muted-foreground text-sm">
            Compare your attempt to the canonical answer. Pick the closest self-grade for each card.
            Hints used per card are already applied as a deduction.
          </p>
        </header>

        <ol className="flex flex-col gap-6">
          {entries.map((e, i) => (
            <li key={e.card.id} className="border-border flex flex-col gap-3 rounded-md border p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <span className="text-muted-foreground tracking-widest uppercase">
                  Card {i + 1}
                </span>
                <span className="text-muted-foreground">
                  {e.hintsShown} hint{e.hintsShown === 1 ? "" : "s"} used (-
                  {hintPenaltyFor(e.hintsShown)} points)
                </span>
              </header>

              <p className="font-heading text-base leading-snug font-medium">{e.card.stem}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-muted-foreground text-xs tracking-widest uppercase">
                    Your answer
                  </p>
                  <p className="border-input bg-muted/30 min-h-24 rounded-md border p-3 leading-6 whitespace-pre-wrap">
                    {e.attempt.trim() || "(blank)"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-muted-foreground text-xs tracking-widest uppercase">
                    Correct answer
                  </p>
                  <p className="border-input bg-background min-h-24 rounded-md border p-3 leading-6 whitespace-pre-wrap">
                    {e.card.correct_answer}
                  </p>
                </div>
              </div>

              <details className="text-muted-foreground text-xs">
                <summary className="cursor-pointer text-sm">Show explanation</summary>
                <div className="mt-2 leading-6 whitespace-pre-wrap">
                  {e.card.elaborative_explanation}
                </div>
              </details>

              <fieldset className="flex flex-col gap-2" aria-label={`Self-grade for card ${i + 1}`}>
                <legend className="text-sm font-medium">How did you do?</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SELF_GRADE_VALUES.map((g) => {
                    const finalScore = computeFinalScore(g, e.hintsShown);
                    const selected = e.selfGrade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(i, g)}
                        aria-pressed={selected}
                        className={cn(
                          "border-input flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-md border px-3 py-2 text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/10 font-medium"
                            : "bg-background hover:bg-muted",
                        )}
                      >
                        <span>{SELF_GRADE_LABELS[g]}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {SELF_GRADE_BASE_POINTS[g]} → {finalScore}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {e.selfGrade !== null ? (
                  <p className="text-muted-foreground text-xs">
                    {SELF_GRADE_DESCRIPTIONS[e.selfGrade]} Final:{" "}
                    {computeFinalScore(e.selfGrade, e.hintsShown)} / 100 → SRS{" "}
                    <code>{scoreToSrsRating(computeFinalScore(e.selfGrade, e.hintsShown))}</code>.
                  </p>
                ) : null}
              </fieldset>
            </li>
          ))}
        </ol>

        {persistError ? (
          <p className="text-destructive text-sm" role="alert">
            {persistError}
          </p>
        ) : null}

        <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm">
            <span className="font-medium">{totalScore.graded}</span> of {total} graded
            {totalScore.graded > 0 ? (
              <>
                {" "}
                · running score <span className="font-medium">{totalScore.sum}</span> /{" "}
                {totalScore.max}
              </>
            ) : null}
          </p>
          <Button
            type="button"
            onClick={finalize}
            disabled={totalScore.graded < total || persisting}
          >
            {persisting ? "Saving…" : "Finalise & schedule next reviews"}
          </Button>
        </footer>
      </main>
    );
  }

  // status === "complete"
  const totalFinal = entries.reduce(
    (sum, e) => sum + (e.selfGrade ? computeFinalScore(e.selfGrade, e.hintsShown) : 0),
    0,
  );
  const max = entries.length * 100;
  const pct = max > 0 ? Math.round((totalFinal / max) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-medium">Self-test complete</h1>
      <p className="text-muted-foreground text-sm">
        You scored <span className="font-medium">{totalFinal}</span> /{" "}
        <span className="font-medium">{max}</span> ({pct}%) across {total} card
        {total === 1 ? "" : "s"}. Each card has been added to your review schedule with the
        appropriate SRS rating.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Link href="/today" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
          Back to today
        </Link>
        <Link href="/self-test" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Self-test another mechanism
        </Link>
      </div>
    </main>
  );
}
