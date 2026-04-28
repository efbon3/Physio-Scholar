import type { Card } from "./cards";

/**
 * MCQ-assembly helpers used by the Chapter-page MCQ session
 * (`/test/[Chapter]/mcq`).
 *
 * Pure and deterministic given a seed. The /exam timed-drill route
 * that originally drove this module was retired in the two-zone
 * redesign; the session-assembly utilities (`assembleExamSession`,
 * `filterByExamPattern`, `EXAM_PATTERNS`) went with it. What remains
 * is the per-card `Card` → MCQ transform plus the Fisher-Yates
 * shuffle infrastructure the new MCQ session uses to randomise
 * option order without pulling in a non-deterministic RNG.
 *
 * Filename kept (`exam.ts`) only to avoid churning every import in
 * the existing test fixture set; conceptually this is "MCQ assembly".
 */

export type McqOption = {
  text: string;
  isCorrect: boolean;
};

export type McqQuestion = {
  cardId: string;
  chapterId: string;
  stem: string;
  options: McqOption[];
  /**
   * Elaborative explanation surfaces on the review screen at end of
   * session. Same text the review loop shows after reveal.
   */
  elaborativeExplanation: string;
};

/**
 * A card can be rendered as a 4-option MCQ only if we have at least
 * one misconception to use as a distractor. Zero misconceptions →
 * skip; those cards still work in descriptive / fill-blank formats
 * but won't appear in an MCQ session.
 */
export function canRenderAsMcq(card: Card): boolean {
  return card.misconceptions.length >= 1;
}

/**
 * Deterministic mulberry32 PRNG — seeded from the card id so the same
 * student retaking the same session gets the same shuffle, but
 * different cards get different shuffles. Works without a Math.random
 * dependency, which makes the transform testable.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build a 4-option MCQ from a card. Takes the correct answer plus up
 * to 3 misconception wrong_answers and shuffles them. The seed argument
 * controls the shuffle; callers typically use `seedFromString(card.id +
 * sessionSalt)` so the same card in a different session gets a
 * different option order (discourages memorising position).
 *
 * If the card has only 1 misconception, only 2 options are returned;
 * the UI still accepts that — it's better than dropping the card.
 * If fewer than 3 misconceptions exist, we don't pad with synthetic
 * wrong answers (the misconception text is the teaching signal).
 */
export function buildMcqFromCard(card: Card, seed: number): McqQuestion | null {
  if (!canRenderAsMcq(card)) return null;
  const rng = mulberry32(seed);
  const options: McqOption[] = [
    { text: card.correct_answer, isCorrect: true },
    ...card.misconceptions.slice(0, 3).map((m) => ({ text: m.wrong_answer, isCorrect: false })),
  ];
  // Fisher-Yates shuffle driven by the seeded rng.
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    cardId: card.id,
    chapterId: card.chapter_id,
    stem: card.stem,
    options,
    elaborativeExplanation: card.elaborative_explanation,
  };
}
