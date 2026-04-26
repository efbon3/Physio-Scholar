import type { Rating } from "@/lib/srs/types";

/**
 * Self-test grading model (per author spec, 2026-04-26).
 *
 * The student types a free-recall answer for each card, optionally
 * uses up to three hints, submits without seeing the canonical
 * answer, and at end-of-session reviews their attempt side-by-side
 * with the canonical answer. They self-grade on a four-step scale.
 * Hints carry a points penalty applied AFTER the self-grade so
 * "I needed help to get there" is visibly cheaper than "I got it
 * unaided", while still rewarding effort over giving up.
 *
 * Base points by self-grade:
 *   correct           — 100 ("I got it; nothing wrong")
 *   partially-wrong   —  75 ("Mostly right, some wrong bits")
 *   partially-correct —  50 ("Mostly wrong, some right bits")
 *   wrong             —  20 ("Essentially wrong, but I tried")
 *
 * Hint deductions (applied after the base score, floor 0):
 *   0 hints used → 0
 *   1 hint  used → 20
 *   2 hints used → 30
 *   3 hints used → 40
 *
 * The deduction curve is intentionally non-linear: the first hint
 * is the most expensive, additional hints add smaller penalties.
 * This rewards "stop hinting early" without unduly punishing
 * "I needed all three to recall the framework."
 *
 * SRS-rating mapping (final score → Again/Hard/Good/Easy):
 *   < 30  → again — re-show in ~1 minute
 *   30-59 → hard  — short interval, ease drops
 *   60-84 → good  — normal interval, ease unchanged
 *   ≥ 85  → easy  — longer interval, ease bumped
 *
 * The mapping is deliberately conservative: a "correct" with no
 * hints (100 points) is the only path to "easy"; using even one
 * hint caps you at "good" (max 80). That matches the spaced-rep
 * intuition that hints reveal a recall weakness even when the
 * answer was eventually correct.
 */

export const SELF_GRADE_VALUES = [
  "correct",
  "partially-wrong",
  "partially-correct",
  "wrong",
] as const;
export type SelfGrade = (typeof SELF_GRADE_VALUES)[number];

export const SELF_GRADE_BASE_POINTS: Record<SelfGrade, number> = {
  correct: 100,
  "partially-wrong": 75,
  "partially-correct": 50,
  wrong: 20,
};

export const SELF_GRADE_LABELS: Record<SelfGrade, string> = {
  correct: "Correct",
  "partially-wrong": "Partially wrong",
  "partially-correct": "Partially correct",
  wrong: "Wrong",
};

export const SELF_GRADE_DESCRIPTIONS: Record<SelfGrade, string> = {
  correct: "I got the mechanism right with nothing meaningfully wrong.",
  "partially-wrong": "Mostly right but I had some wrong bits in there.",
  "partially-correct": "Mostly wrong but I caught some of the right idea.",
  wrong: "Essentially wrong — I missed the mechanism.",
};

/**
 * Hint-usage penalties. Index = number of hints used (0–3).
 * Floor is enforced at 0 in `computeFinalScore`.
 */
export const HINT_PENALTIES: readonly number[] = [0, 20, 30, 40];

export function hintPenaltyFor(hintsUsed: number): number {
  if (hintsUsed <= 0) return 0;
  if (hintsUsed >= HINT_PENALTIES.length) return HINT_PENALTIES[HINT_PENALTIES.length - 1];
  return HINT_PENALTIES[hintsUsed];
}

/**
 * Compute the final 0–100 score for a self-test card. Floored at 0
 * so a "wrong + 3 hints" doesn't go negative.
 */
export function computeFinalScore(grade: SelfGrade, hintsUsed: number): number {
  const base = SELF_GRADE_BASE_POINTS[grade];
  const penalty = hintPenaltyFor(hintsUsed);
  return Math.max(0, base - penalty);
}

/**
 * Map a final 0–100 score to the SM-2 rating the SRS scheduler
 * already understands. This is what lets the self-test plug into
 * the existing scheduler without a new code path.
 *
 * Boundaries chosen so that:
 *   - "correct, no hints" → 100 → easy (the gold path)
 *   - "correct, 1 hint" → 80 → good
 *   - "correct, 2 hints" → 70 → good
 *   - "correct, 3 hints" → 60 → good
 *   - "partially-wrong, no hints" → 75 → good
 *   - "partially-correct, no hints" → 50 → hard
 *   - "wrong, no hints" → 20 → again
 *   - "wrong, 3 hints" → 0 → again
 */
export function scoreToSrsRating(finalScore: number): Rating {
  if (finalScore >= 85) return "easy";
  if (finalScore >= 60) return "good";
  if (finalScore >= 30) return "hard";
  return "again";
}

/**
 * Convenience pipeline: grade + hints used → SRS rating.
 */
export function selfTestRating(
  grade: SelfGrade,
  hintsUsed: number,
): {
  finalScore: number;
  rating: Rating;
} {
  const finalScore = computeFinalScore(grade, hintsUsed);
  return { finalScore, rating: scoreToSrsRating(finalScore) };
}
