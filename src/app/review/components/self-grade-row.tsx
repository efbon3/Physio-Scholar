"use client";

import { useEffect, useRef, useState } from "react";

import {
  computeFinalScore,
  formatScoreOutOfTen,
  hintPenaltyFor,
  selfTestRating,
  SELF_GRADE_LABELS,
  SELF_GRADE_VALUES,
  type SelfGrade,
} from "@/lib/self-test/grading";
import type { Rating } from "@/lib/srs/types";
import { cn } from "@/lib/utils";

/**
 * Self-grading row for review sessions. Same 4-grade scale as
 * /self-test (Correct / Partially wrong / Partially correct /
 * Wrong), with hint usage applied as a points penalty before the
 * final score → SM-2 rating mapping.
 *
 * Display is on a 0–10 scale ("8.5 / 10") for readability; internally
 * computeFinalScore + scoreToSrsRating still operate on the 0–100
 * tested model so existing helpers don't change.
 *
 * Timing semantics match RatingRow:
 *   - Hidden / disabled until `delayMs` elapses since `revealedAt`.
 *     Build-spec §2.4: a 2s mandatory pause forces the learner to read
 *     the explanation rather than blindly clicking through.
 *   - 24h auto-grade watchdog (item 345). If the learner reveals an
 *     answer and walks away, after 24h we auto-fire `wrong + 0 hints`,
 *     mapping to SRS `again` so the card re-enters the queue.
 */
const DEFAULT_AUTO_RATE_AFTER_MS = 24 * 60 * 60 * 1000;

export function SelfGradeRow({
  hintsUsed,
  revealedAt,
  delayMs,
  onRate,
  autoRateAfterMs = DEFAULT_AUTO_RATE_AFTER_MS,
  autoRateGrade = "wrong",
}: {
  hintsUsed: number;
  revealedAt: number | null;
  delayMs: number;
  onRate: (rating: Rating, finalScore: number, grade: SelfGrade) => void;
  autoRateAfterMs?: number;
  autoRateGrade?: SelfGrade;
}) {
  const [active, setActive] = useState(
    () => revealedAt !== null && Date.now() >= revealedAt + delayMs,
  );

  useEffect(() => {
    if (revealedAt === null) return;
    const remaining = revealedAt + delayMs - Date.now();
    if (remaining <= 0) return;
    const t = setTimeout(() => setActive(true), remaining);
    return () => clearTimeout(t);
  }, [revealedAt, delayMs]);

  // Hold latest onRate in a ref so the auto-grade timer doesn't
  // capture a stale closure across parent re-renders.
  const onRateRef = useRef(onRate);
  useEffect(() => {
    onRateRef.current = onRate;
  }, [onRate]);

  // Auto-grade watchdog. Wall-clock from revealedAt; fires once.
  useEffect(() => {
    if (revealedAt === null) return;
    if (autoRateAfterMs <= 0) return;
    const fireAuto = () => {
      const { rating, finalScore } = selfTestRating(autoRateGrade, hintsUsed);
      onRateRef.current(rating, finalScore, autoRateGrade);
    };
    const remaining = revealedAt + autoRateAfterMs - Date.now();
    if (remaining <= 0) {
      fireAuto();
      return;
    }
    const t = setTimeout(fireAuto, remaining);
    return () => clearTimeout(t);
  }, [revealedAt, autoRateAfterMs, autoRateGrade, hintsUsed]);

  const penalty = hintPenaltyFor(hintsUsed);

  return (
    <div
      role="group"
      aria-label="Grade your answer"
      aria-hidden={!active}
      className={cn(
        "sticky bottom-4 mt-auto flex flex-col gap-2 transition-opacity duration-200",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SELF_GRADE_VALUES.map((g) => {
          const final = computeFinalScore(g, hintsUsed);
          const display = formatScoreOutOfTen(final);
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                const { rating } = selfTestRating(g, hintsUsed);
                onRate(rating, final, g);
              }}
              disabled={!active}
              data-testid={`self-grade-${g}`}
              className="border-input bg-background hover:bg-muted flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border px-3 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              <span>{SELF_GRADE_LABELS[g]}</span>
              <span className="text-muted-foreground text-[10px] font-normal">{display} / 10</span>
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {hintsUsed === 0
          ? "No hints used — full score available."
          : `Hint deduction: -${penalty / 10} points (${hintsUsed} hint${hintsUsed === 1 ? "" : "s"} used). Minimum 0.`}
      </p>
    </div>
  );
}
