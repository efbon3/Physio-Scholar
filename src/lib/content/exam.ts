import type { Card } from "./cards";

/**
 * Exam-mode helpers.
 *
 * The question bank is the same `Card[]` the review loop consumes;
 * exam mode just adds two things on top:
 *
 *   1. A filter by `exam_patterns` (cards authored as `mbbs` vs `pre-pg`).
 *   2. A transform from Card → MCQ with four options, where the wrong
 *      answers come from the card's `misconceptions` array. Cards
 *      without at least one misconception can't become MCQs and are
 *      skipped.
 *
 * Everything here is pure and deterministic (given a seed), so it's
 * unit-testable without jsdom and reproducible across a student's
 * retake of the same exam session.
 */

export type McqOption = {
  text: string;
  isCorrect: boolean;
};

export type McqQuestion = {
  cardId: string;
  mechanismId: string;
  stem: string;
  options: McqOption[];
  /**
   * Elaborative explanation surfaces on the review screen at end of
   * session. Same text the review loop shows after reveal.
   */
  elaborativeExplanation: string;
};

export type ExamPattern = "mbbs" | "pre-pg";

export const EXAM_PATTERNS: ReadonlyArray<{ key: ExamPattern; label: string }> = [
  { key: "mbbs", label: "MBBS Exams" },
  { key: "pre-pg", label: "Pre-PG (NEET-PG / INI-CET)" },
];

/** Filter a deck to cards tagged for the requested exam pattern. */
export function filterByExamPattern(cards: readonly Card[], pattern: ExamPattern): Card[] {
  return cards.filter((c) => c.exam_patterns.includes(pattern));
}

/**
 * A card can be rendered as a 4-option MCQ only if we have at least
 * one misconception to use as a distractor. Zero misconceptions → skip
 * for exam mode; those cards still work in regular review.
 */
export function canRenderAsMcq(card: Card): boolean {
  return card.misconceptions.length >= 1;
}

/**
 * Deterministic mulberry32 PRNG — seeded from the card id so the same
 * student retaking the same exam gets the same shuffle, but different
 * cards get different shuffles. Works without a Math.random dependency,
 * which makes the transform testable.
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
    mechanismId: card.mechanism_id,
    stem: card.stem,
    options,
    elaborativeExplanation: card.elaborative_explanation,
  };
}

/**
 * Build an exam session: filter by pattern, drop cards that can't be
 * rendered as MCQs, deterministically shuffle, slice to `count`.
 *
 * The `sessionSalt` argument lets the /exam/session page mix in a
 * per-load value so a student who retakes a 20-question drill gets a
 * different subset (not the same 20 cards they saw last time). Default
 * is an empty string — tests use fixed salts to verify determinism.
 */
export function assembleExamSession({
  cards,
  pattern,
  count,
  sessionSalt = "",
}: {
  cards: readonly Card[];
  pattern: ExamPattern;
  count: number;
  sessionSalt?: string;
}): McqQuestion[] {
  const eligible = filterByExamPattern(cards, pattern).filter(canRenderAsMcq);
  if (eligible.length === 0) return [];

  const deck = [...eligible];
  const rng = mulberry32(seedFromString(`session:${pattern}:${sessionSalt}`));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const slice = deck.slice(0, Math.max(1, count));
  const questions: McqQuestion[] = [];
  for (const card of slice) {
    const q = buildMcqFromCard(card, seedFromString(`${card.id}:${sessionSalt}`));
    if (q) questions.push(q);
  }
  return questions;
}
