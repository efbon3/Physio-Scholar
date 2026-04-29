import type { Rating } from "@/lib/srs/types";

/**
 * Map a per-format grading outcome onto the SM-2 `Rating` the
 * scheduler consumes. Keeps the conversion logic in one place so the
 * rating gradient is consistent across formats — descriptive
 * self-rate, MCQ deterministic grade, and fill-blank deterministic
 * grade all flow through the same Green/Yellow/Red → Rating function.
 *
 * Build spec §2.6 specifies:
 *   - Green       → "good"      — correct and confident, normal interval growth.
 *   - Yellow      → "hard"      — correct but partial / hinted / near-miss.
 *   - Red         → "again"     — wrong; in-session re-queue then 1 day.
 *   - "dont_know" → "dont_know" — student admitted ignorance; same
 *                                 next-interval as Again but no ease
 *                                 drop and no lapse increment (v1.3
 *                                 third SM-2 modification, §2.7).
 *
 * "easy" intentionally never appears: the v1 grading paths can't
 * distinguish "correct" from "correct AND felt easy" — that judgment
 * lives only in the student's head and v1 has no UI to capture it.
 * v2 may add an explicit "easy" affordance.
 */

export type GradingBand = "green" | "yellow" | "red" | "dont_know";

export function bandToRating(band: GradingBand): Rating {
  switch (band) {
    case "green":
      return "good";
    case "yellow":
      return "hard";
    case "red":
      return "again";
    case "dont_know":
      return "dont_know";
  }
}

/**
 * Map an MCQ outcome onto a grading band.
 *
 *   - student picked "I don't know"        → "dont_know"
 *   - selected correct option, used 0 hints → Green (Good)
 *   - selected correct option, used ≥1 hint → Yellow (Hard)
 *   - selected wrong option                 → Red (Again)
 *
 * "Don't know" is checked first because it's a separate input
 * channel from correct/wrong — it's not "wrong with extra context."
 *
 * Hint usage is the only signal that turns a correct MCQ answer into
 * Yellow — a student who needed a nudge to converge on the right
 * option has not earned the same interval growth as a student who
 * picked it cold. Distinct from descriptive (where the student
 * judges) and fill-blank (where numeric tolerance and unit decide).
 */
export function mcqOutcomeToBand(opts: {
  correct: boolean;
  hintsUsed: number;
  dontKnow?: boolean;
}): GradingBand {
  if (opts.dontKnow) return "dont_know";
  if (!opts.correct) return "red";
  if (opts.hintsUsed > 0) return "yellow";
  return "green";
}

export function mcqOutcomeToRating(opts: {
  correct: boolean;
  hintsUsed: number;
  dontKnow?: boolean;
}): Rating {
  return bandToRating(mcqOutcomeToBand(opts));
}
