"use client";

import type { QueuedCard } from "@/lib/srs/queue";
import type { SelfGrade } from "@/lib/self-test/grading";
import type { Rating } from "@/lib/srs/types";

import { FlagCard } from "./flag-card";
import { HintLadder } from "./hint-ladder";
import { SelfGradeRow } from "./self-grade-row";

/**
 * Stateless presentation of one card in its current interaction step.
 * All state — attempt text, hints visible, submitted, revealed — is
 * driven by the parent (SessionPlayer).
 *
 * Layout per build spec §2.3, refined by the author's submit-then-grade
 * flow (2026-04-26 conversation):
 *   1. Stem at top
 *   2. Free-recall textarea (locks once submitted)
 *   3. Hint ladder + Submit button
 *   4. After submit: Show answer button + locked attempt
 *   5. After reveal: correct answer + explanation + misconception
 *      correction + optional self-explanation
 *   6. Self-grade row (4 buttons, hint deduction applied) replaces the
 *      old SM-2 rating row — the chosen grade is mapped to an SM-2
 *      rating internally so the scheduler is unchanged.
 */
export function CardView({
  queued,
  active,
  onAttemptChange,
  onShowHint,
  onSubmit,
  onReveal,
  onToggleAnswer,
  onSelfExplanationChange,
  onRate,
  ratingDelayMs,
  progress,
}: {
  queued: QueuedCard;
  active: {
    attempt: string;
    hintsShown: number;
    submitted: boolean;
    revealed: boolean;
    answerVisible: boolean;
    selfExplanation: string;
    revealedAt: number | null;
  };
  onAttemptChange: (value: string) => void;
  onShowHint: () => void;
  onSubmit: () => void;
  onReveal: () => void;
  onToggleAnswer: () => void;
  onSelfExplanationChange: (value: string) => void;
  /** Final score on 0-100 scale; grade is the user's self-classification. */
  onRate: (rating: Rating, finalScore: number, grade: SelfGrade) => void;
  ratingDelayMs: number;
  progress: { index: number; total: number };
}) {
  const { card } = queued;
  const totalHints = card.hints.length;
  const canShowMoreHints = active.hintsShown < totalHints;
  const submitDisabled = active.attempt.trim().length === 0 || active.submitted;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Card {progress.index + 1} / {progress.total}
        </span>
        {queued.isNew ? (
          <span className="rounded-full border px-2 py-0.5" aria-label="New card">
            New
          </span>
        ) : null}
      </header>

      <section aria-label="Question" className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          {card.mechanism_id.replace(/-/g, " ")}
        </p>
        <h1 className="font-heading text-2xl leading-snug font-medium">{card.stem}</h1>
      </section>

      <section aria-label="Your attempt" className="flex flex-col gap-2">
        <label htmlFor="attempt" className="text-sm font-medium">
          Your attempt
        </label>
        <textarea
          id="attempt"
          className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm leading-7 outline-none focus:ring-2 disabled:opacity-70"
          placeholder="Write your answer before submitting. Free recall is the point."
          value={active.attempt}
          onChange={(e) => onAttemptChange(e.target.value)}
          disabled={active.submitted || active.revealed}
        />
      </section>

      {!active.submitted ? (
        // Pre-submit: hint ladder + Submit button. The textarea above
        // is editable. Show hint costs points but doesn't lock the
        // attempt.
        <section aria-label="Submit controls" className="flex flex-wrap gap-2">
          {totalHints > 0 ? (
            <button
              type="button"
              onClick={onShowHint}
              disabled={!canShowMoreHints}
              className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {active.hintsShown === 0
                ? "Show hint (-2 points)"
                : canShowMoreHints
                  ? `Next hint (${active.hintsShown}/${totalHints})`
                  : `All hints shown (${totalHints}/${totalHints})`}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Submit attempt
          </button>
        </section>
      ) : !active.revealed ? (
        // Post-submit, pre-reveal. The attempt is locked. Hints can
        // still be peeked at (they cost the same since the deduction
        // is keyed on hintsShown at grade time), and "Show answer"
        // becomes the explicit reveal action.
        <section aria-label="Reveal controls" className="flex flex-wrap gap-2">
          {totalHints > 0 && canShowMoreHints ? (
            <button
              type="button"
              onClick={onShowHint}
              className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
            >
              Next hint ({active.hintsShown}/{totalHints})
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReveal}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-sm font-medium"
          >
            Show answer
          </button>
        </section>
      ) : (
        // Post-reveal: the answer pane can be toggled hidden (e.g. to
        // re-read the stem) but the attempt stays locked and the
        // self-grade row stays available.
        <section aria-label="Reveal controls" className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleAnswer}
            className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
            aria-pressed={active.answerVisible}
          >
            {active.answerVisible ? "Hide answer" : "Show answer again"}
          </button>
        </section>
      )}

      {active.hintsShown > 0 ? (
        <HintLadder hints={card.hints} shownCount={active.hintsShown} />
      ) : null}

      {active.answerVisible ? (
        <section aria-label="Answer reveal" className="flex flex-col gap-4 border-t pt-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-medium">Correct answer</h2>
            <p className="text-sm leading-7">{card.correct_answer}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-medium">Why</h2>
            <p className="text-sm leading-7">{card.elaborative_explanation}</p>
          </div>

          {card.misconceptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-medium">Common wrong paths</h2>
              <ul className="text-sm leading-7 [&_li]:mt-1">
                {card.misconceptions.map((m, i) => (
                  <li key={i}>
                    <strong className="font-medium">&ldquo;{m.wrong_answer}&rdquo;</strong> —{" "}
                    {m.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {active.answerVisible ? (
        <section aria-label="Self-explanation" className="flex flex-col gap-2">
          <label htmlFor="self-explanation" className="text-sm font-medium">
            In your own words — why?
          </label>
          <p className="text-muted-foreground text-xs leading-5">
            Optional. A sentence or two explaining the mechanism in your own words. Doesn&apos;t
            affect your grade.
          </p>
          <textarea
            id="self-explanation"
            className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm leading-7 outline-none focus:ring-2"
            placeholder="Skip to grade, or type a short explanation…"
            value={active.selfExplanation}
            onChange={(e) => onSelfExplanationChange(e.target.value)}
          />
        </section>
      ) : null}

      {active.revealed ? (
        <SelfGradeRow
          // Key remount ties the row's initial state to this reveal.
          // When a new card reveals, the component re-initialises
          // cleanly rather than carrying state across cards.
          key={active.revealedAt ?? "idle"}
          revealedAt={active.revealedAt}
          delayMs={ratingDelayMs}
          hintsUsed={active.hintsShown}
          onRate={onRate}
        />
      ) : null}

      {active.revealed ? <FlagCard cardId={card.id} /> : null}
    </main>
  );
}
