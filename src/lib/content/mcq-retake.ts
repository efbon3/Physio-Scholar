import type { McqOption, McqQuestion } from "./exam";

/**
 * Helpers for the "Retake mistakes" flow on the exam complete screen.
 * Pure functions so the UI layer stays small and the behaviour is
 * unit-testable without mounting React.
 *
 * Why option shuffling: a learner who guessed correctly the first time
 * on a tricky stem isn't tested again — that's a known limitation.
 * Among the questions they actually missed, shuffling defeats positional
 * memory ("the answer was the third option") so the retake reads as a
 * fresh attempt rather than a do-over of the same screen.
 */

/**
 * Fisher-Yates shuffle (in-place on a copy). Plain Math.random — we
 * don't need cryptographic randomness here, and a deterministic seed
 * would be visible to the learner across retakes anyway.
 */
export function shuffleOptions(options: readonly McqOption[]): McqOption[] {
  const copy = options.map((o) => ({ ...o }));
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export type RetakeAnswerLike = {
  cardId: string;
  selectedIndex: number | null;
  correctIndex: number;
  stem: string;
  options: McqOption[];
  elaborativeExplanation: string;
};

/**
 * From a completed drill, return a fresh set of questions covering only
 * the cards the learner missed (incorrect or skipped). Each question's
 * options are independently shuffled. Mechanism id is carried through
 * by way of the `mechanismIdByCardId` lookup the caller supplies — the
 * Answer type doesn't store it directly, so we re-attach from the
 * source-of-truth list the page already has.
 */
export function buildRetakeQuestions({
  answers,
  mechanismIdByCardId,
}: {
  answers: readonly RetakeAnswerLike[];
  mechanismIdByCardId: ReadonlyMap<string, string>;
}): McqQuestion[] {
  const out: McqQuestion[] = [];
  for (const a of answers) {
    if (a.selectedIndex === a.correctIndex) continue;
    out.push({
      cardId: a.cardId,
      mechanismId: mechanismIdByCardId.get(a.cardId) ?? "",
      stem: a.stem,
      options: shuffleOptions(a.options),
      elaborativeExplanation: a.elaborativeExplanation,
    });
  }
  return out;
}
