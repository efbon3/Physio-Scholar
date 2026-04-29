import type { Card } from "@/lib/content/cards";

/**
 * Deterministic grader for `format: fill_blank` questions.
 *
 * Build spec §2.6 specifies three bands:
 *   - Green:  exact match against an `Acceptable answers` variant, OR
 *             numeric value within `Tolerance` AND correct `Unit`.
 *   - Yellow: right value but wrong unit, OR numerically close but
 *             just outside tolerance (still on the right order of
 *             magnitude — "almost right" rather than "wildly wrong").
 *   - Red:    everything else.
 *
 * Pure function. No I/O, no randomness — same input always produces
 * the same output, so the grader is fully deterministic and easy to
 * test against a tabular fixture set. The student's typed string is
 * the only volatile input.
 */

export type FillBlankGrade = "green" | "yellow" | "red";

export type FillBlankResult = {
  grade: FillBlankGrade;
  /**
   * One-line feedback surfaced to the student alongside the grade.
   * The session UI pairs this with the canonical `correct_answer`
   * and the question's `elaborative_explanation` on the reveal
   * screen — `feedback` only needs to explain the *grade*, not
   * teach the answer.
   */
  feedback: string;
};

export type GradableCard = Pick<
  Card,
  "correct_answer" | "acceptable_answers" | "unit" | "tolerance_pct"
>;

/**
 * How far outside the Green tolerance counts as "close" (Yellow) vs.
 * "wrong" (Red). Expressed as a fraction of the correct value:
 * `valueDelta <= correct * (YELLOW_OUTER_BAND + tolerance)` → Yellow.
 *
 * 0.5 means a student who answers 8.4 against a correct of 5.6 with
 * ±5% tolerance lands Yellow (within 50% of correct, outside the 5%
 * Green band). A student who answers 100 against 5.6 lands Red.
 *
 * The author can tighten the Green band per question via Tolerance,
 * but the Yellow boundary is a v1 platform-wide default. v2 may make
 * this configurable per question once we have data on how tightly
 * authors want to police "close enough to be useful feedback."
 */
const YELLOW_OUTER_BAND = 0.5;

export function gradeFillBlank(studentAnswer: string, card: GradableCard): FillBlankResult {
  const trimmed = studentAnswer.trim();
  if (!trimmed) {
    return { grade: "red", feedback: "No answer entered." };
  }

  // Step 1 — exact (case + whitespace insensitive) match against the
  // author's acceptable variants. This covers term-recall (the answer
  // "acetylcholine") and pre-author-approved numeric forms (the answer
  // "5.6 L/min" vs "5.6 l/min" vs "5.6 liters per minute").
  const variants = collectVariants(card);
  const studentNorm = normaliseString(trimmed);
  for (const variant of variants) {
    if (normaliseString(variant) === studentNorm) {
      return { grade: "green", feedback: "Correct." };
    }
  }

  // Step 2 — numeric matching. Only kicks in if both the student's
  // answer AND the canonical correct answer parse as a number with
  // an optional unit. Pure-text answers fall through to Red.
  const studentParsed = parseValueAndUnit(trimmed);
  const correctParsed = parseValueAndUnit(card.correct_answer);
  if (!studentParsed || !correctParsed) {
    return { grade: "red", feedback: "That's not the answer we were looking for." };
  }

  const expectedUnit = (card.unit ?? correctParsed.unit).trim();
  const unitMatches = compareUnits(studentParsed.unit, expectedUnit);
  const valueDelta = Math.abs(studentParsed.value - correctParsed.value);
  const tolerance = card.tolerance_pct ?? 0;
  const tolerableDelta = Math.abs(correctParsed.value) * tolerance;

  // Within numeric tolerance:
  //   - same unit → Green
  //   - different unit → Yellow (right value, wrong unit)
  if (tolerance > 0 && valueDelta <= tolerableDelta) {
    if (unitMatches) {
      return { grade: "green", feedback: "Correct (within tolerance)." };
    }
    return {
      grade: "yellow",
      feedback: "Right value, wrong unit.",
    };
  }

  // Outside tolerance but inside the Yellow band — likely a close
  // miss (rounded too hard, used a slightly different reference
  // value, etc.). Still pedagogically useful, so surface Yellow
  // rather than Red.
  if (
    correctParsed.value !== 0 &&
    valueDelta <= Math.abs(correctParsed.value) * (YELLOW_OUTER_BAND + tolerance)
  ) {
    if (unitMatches) {
      return {
        grade: "yellow",
        feedback: "Close, but outside the accepted tolerance.",
      };
    }
    return {
      grade: "yellow",
      feedback: "Close, but the unit doesn't match either.",
    };
  }

  return { grade: "red", feedback: "Not the value we were looking for." };
}

/**
 * Build the list of strings the grader treats as Green-grade. Always
 * includes `correct_answer` so authors who omit `acceptable_answers`
 * still get the canonical form matched.
 */
function collectVariants(card: GradableCard): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (s: string | undefined) => {
    if (!s) return;
    const norm = normaliseString(s);
    if (norm.length === 0 || seen.has(norm)) return;
    seen.add(norm);
    out.push(s);
  };
  push(card.correct_answer);
  for (const v of card.acceptable_answers ?? []) push(v);
  return out;
}

/**
 * Case-insensitive, whitespace-collapsed comparison key. Removes the
 * surface differences ("5.6 L/min" vs "5.6  l/min" vs "5.6L/min")
 * that don't change meaning.
 */
function normaliseString(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s/g, "");
}

/**
 * Parse a "value + optional unit" string. Accepts:
 *   "5.6"          → { value: 5.6, unit: "" }
 *   "5.6 L/min"    → { value: 5.6, unit: "L/min" }
 *   "5,6 L/min"    → { value: 5.6, unit: "L/min" }   (European decimal)
 *   "+5.6 mmHg"    → { value: 5.6, unit: "mmHg" }
 *   "-1.2 mEq/L"   → { value: -1.2, unit: "mEq/L" }
 *
 * Does NOT handle thousands-separators (so "5,600 mL/min" parses as
 * { 5.6, "00 mL/min" }). Authors should use `Acceptable answers` to
 * spell out the no-thousands form explicitly when this matters.
 *
 * Returns null when the input doesn't begin with a number.
 */
const VALUE_UNIT_RE = /^([+-]?\d+(?:[.,]\d+)?)\s*(.*)$/;
function parseValueAndUnit(raw: string): { value: number; unit: string } | null {
  const match = raw.trim().match(VALUE_UNIT_RE);
  if (!match) return null;
  const numStr = match[1].replace(",", ".");
  const value = Number.parseFloat(numStr);
  if (!Number.isFinite(value)) return null;
  return { value, unit: match[2].trim() };
}

/**
 * Compare two unit strings tolerantly. The student's unit string is
 * "matching" if:
 *   - both are empty (numeric-only answer, no unit anywhere), OR
 *   - both compare equal after lowercasing and removing all whitespace.
 *
 * Empty student unit against a non-empty expected unit is NOT a
 * match — we don't infer the unit from the stem.
 */
function compareUnits(studentUnit: string, expectedUnit: string): boolean {
  const s = studentUnit.toLowerCase().replace(/\s+/g, "");
  const e = expectedUnit.toLowerCase().replace(/\s+/g, "");
  if (s.length === 0 && e.length === 0) return true;
  return s === e;
}
