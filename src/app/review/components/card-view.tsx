"use client";

import type { QueuedCard } from "@/lib/srs/queue";
import type { Rating } from "@/lib/srs/types";

import { HintLadder } from "./hint-ladder";
import { RatingRow } from "./rating-row";

/**
 * Stateless presentation of one card in its current interaction step.
 * All state — attempt text, hints visible, revealed — is driven by the
 * parent (SessionPlayer).
 *
 * Layout per build spec §2.3:
 *   - fullscreen card
 *   - stem at top
 *   - attempt textarea (free-recall)
 *   - "Show hint" / "Show answer" actions below the attempt
 *   - answer reveal surfaces elaborative explanation + misconception
 *     correction when applicable
 *   - rating row fixed at the bottom; activates 2s after reveal
 */
export function CardView({
  queued,
  active,
  onAttemptChange,
  onShowHint,
  onReveal,
  onRate,
  ratingDelayMs,
  progress,
}: {
  queued: QueuedCard;
  active: {
    attempt: string;
    hintsShown: number;
    revealed: boolean;
    revealedAt: number | null;
  };
  onAttemptChange: (value: string) => void;
  onShowHint: () => void;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  ratingDelayMs: number;
  progress: { index: number; total: number };
}) {
  const { card } = queued;
  const totalHints = card.hints.length;
  const canShowMoreHints = active.hintsShown < totalHints;

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
          className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm leading-7 outline-none focus:ring-2"
          placeholder="Write your answer before revealing. Free recall is the point."
          value={active.attempt}
          onChange={(e) => onAttemptChange(e.target.value)}
          disabled={active.revealed}
        />
      </section>

      {!active.revealed ? (
        <section aria-label="Reveal controls" className="flex flex-wrap gap-2">
          {totalHints > 0 ? (
            <button
              type="button"
              onClick={onShowHint}
              disabled={!canShowMoreHints}
              className="hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {active.hintsShown === 0
                ? "Show hint"
                : canShowMoreHints
                  ? `Next hint (${active.hintsShown}/${totalHints})`
                  : `All hints shown (${totalHints}/${totalHints})`}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReveal}
            className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-sm"
          >
            Show answer
          </button>
        </section>
      ) : null}

      {active.hintsShown > 0 ? (
        <HintLadder hints={card.hints} shownCount={active.hintsShown} />
      ) : null}

      {active.revealed ? (
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

      {active.revealed ? (
        <RatingRow
          // Key remount ties RatingRow's initial state to this reveal.
          // When a new card reveals, the component re-initialises cleanly
          // rather than carrying state across cards.
          key={active.revealedAt ?? "idle"}
          revealedAt={active.revealedAt}
          delayMs={ratingDelayMs}
          onRate={onRate}
        />
      ) : null}
    </main>
  );
}
