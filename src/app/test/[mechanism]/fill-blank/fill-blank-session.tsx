"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { gradeFillBlank, type FillBlankGrade } from "@/lib/grading/fill-blank";
import { bandToRating } from "@/lib/grading/rating-mapping";
import { recordReviewLocally } from "@/lib/srs/local";
import { cn } from "@/lib/utils";

type Props = {
  cards: readonly Card[];
  mechanismId: string;
  mechanismSystem: string;
  profileId: string;
};

type SessionStatus = "answering" | "feedback" | "complete";

type CardOutcome = {
  cardId: string;
  band: FillBlankGrade;
  studentAnswer: string;
};

/**
 * Minimal per-question fill-blank session.
 *
 * Walks through the supplied cards one at a time:
 *   1. Show stem + textbox.
 *   2. On Submit, grade with `gradeFillBlank` and reveal the model
 *      answer + elaborative explanation alongside Green/Yellow/Red
 *      feedback.
 *   3. Continue → next card.
 *   4. After the last card → summary screen with Green/Yellow/Red
 *      counts and two CTAs.
 *
 * No hint ladder yet (build spec §2.5 leaves it optional and the
 * format-picker + grader are the priorities for this commit). No
 * practice-only toggle wired into this UI yet either — the SRS API
 * already supports it via `recordReviewLocally`'s `practiceMode` flag.
 */
export function FillBlankSession({ cards, mechanismId, mechanismSystem, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<CardOutcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  // Practice-only mode: per-session toggle that suppresses SRS schedule
  // updates. The review row is still logged so the activity counts
  // toward analytics (build spec §2.3 — "practice should also
  // contribute"). Lockable only before the first answer is submitted —
  // toggling mid-session would mix scheduled and unscheduled cards in
  // a way the summary screen can't usefully describe.
  const [practiceMode, setPracticeMode] = useState(false);
  const practiceLocked = outcomes.length > 0;

  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const card = cards[index];
  const isLastCard = index === cards.length - 1;

  if (status === "complete") {
    return (
      <SummaryScreen
        outcomes={outcomes}
        mechanismSystem={mechanismSystem}
        mechanismId={mechanismId}
        practiceMode={practiceMode}
      />
    );
  }

  if (!card) {
    // Defensive: shouldn't happen because `complete` short-circuits above.
    return null;
  }

  const result = status === "feedback" ? gradeFillBlank(studentAnswer, card) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!card || studentAnswer.trim().length === 0) return;

    const grade = gradeFillBlank(studentAnswer, card);
    const rating = bandToRating(grade.grade);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      await recordReviewLocally({
        profileId,
        cardId: card.id,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsedSeconds,
        sessionId,
        practiceMode,
      });
    } catch (err) {
      // Persisting locally is best-effort. The reveal still happens so
      // the learner sees the model answer; the missing review row is
      // recoverable via the next session if Dexie is just temporarily
      // unavailable (private-browsing quotas, full storage, etc.).
      console.error("Failed to record fill-blank review locally", err);
    }

    setOutcomes((prior) => [...prior, { cardId: card.id, band: grade.grade, studentAnswer }]);
    setStatus("feedback");
  }

  function handleContinue() {
    if (isLastCard) {
      setStatus("complete");
      return;
    }
    setIndex((i) => i + 1);
    setStudentAnswer("");
    setStatus("answering");
    setStartTime(Date.now());
  }

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-xs">
          <p className="text-muted-foreground tracking-widest uppercase">
            Question {index + 1} of {cards.length}
          </p>
          {result ? <BandPill band={result.grade} /> : null}
        </div>
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={(e) => setPracticeMode(e.target.checked)}
            disabled={practiceLocked}
            className="h-3.5 w-3.5"
          />
          <span>
            Practice only — log this session but don&apos;t change my schedule.
            {practiceLocked ? <em className="ml-1">(Locked after first answer.)</em> : null}
          </span>
        </label>
      </header>

      <div className="flex flex-col gap-2">
        <p className="text-base leading-relaxed">{card.stem}</p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Your answer</span>
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            disabled={status === "feedback"}
            autoFocus
            placeholder={card.unit ? `e.g. 5.6 ${card.unit}` : "Type your answer"}
            className="border-input bg-background rounded-md border px-3 py-2 text-base disabled:opacity-70"
          />
        </label>
        {status === "answering" ? (
          <div className="flex justify-end">
            <button
              type="submit"
              className={cn(buttonVariants({ size: "default" }))}
              disabled={studentAnswer.trim().length === 0}
            >
              Submit
            </button>
          </div>
        ) : null}
      </form>

      {status === "feedback" && result ? (
        <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm leading-relaxed">
          <p>
            <span className="font-medium">Feedback:</span> {result.feedback}
          </p>
          <div>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Correct answer
            </p>
            <p>{card.correct_answer}</p>
          </div>
          {card.elaborative_explanation ? (
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Why</p>
              <p>{card.elaborative_explanation}</p>
            </div>
          ) : null}
          <div className="flex justify-end">
            <button onClick={handleContinue} className={cn(buttonVariants({ size: "default" }))}>
              {isLastCard ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BandPill({ band }: { band: FillBlankGrade }) {
  const label = band === "green" ? "Green" : band === "yellow" ? "Yellow" : "Red";
  const cls =
    band === "green"
      ? "bg-emerald-100 text-emerald-900"
      : band === "yellow"
        ? "bg-amber-100 text-amber-900"
        : "bg-red-100 text-red-900";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", cls)}>{label}</span>
  );
}

function SummaryScreen({
  outcomes,
  mechanismId,
  mechanismSystem,
  practiceMode,
}: {
  outcomes: readonly CardOutcome[];
  mechanismId: string;
  mechanismSystem: string;
  practiceMode: boolean;
}) {
  const counts = outcomes.reduce<Record<FillBlankGrade, number>>(
    (acc, o) => {
      acc[o.band] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 },
  );
  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">Session complete</h2>
        <p className="text-muted-foreground text-sm">
          You answered {outcomes.length} fill-in-the-blank question
          {outcomes.length === 1 ? "" : "s"}.
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <SummaryStat label="Green" count={counts.green} band="green" />
        <SummaryStat label="Yellow" count={counts.yellow} band="yellow" />
        <SummaryStat label="Red" count={counts.red} band="red" />
      </dl>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {practiceMode
          ? "Practice mode — your answers were logged but the SRS schedule wasn't touched. The cards will reappear when they were already due."
          : "These ratings have been logged to your daily review queue. The cards will reappear at the intervals SM-2 calculated from your answers."}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/systems/${mechanismSystem}/${mechanismId}`}
          className={cn(buttonVariants({ size: "default", variant: "outline" }))}
        >
          Back to mechanism
        </Link>
        <Link href="/today" className={cn(buttonVariants({ size: "default" }))}>
          Open today&apos;s review
        </Link>
      </div>
    </article>
  );
}

function SummaryStat({
  label,
  count,
  band,
}: {
  label: string;
  count: number;
  band: FillBlankGrade;
}) {
  const cls =
    band === "green"
      ? "bg-emerald-50 text-emerald-900"
      : band === "yellow"
        ? "bg-amber-50 text-amber-900"
        : "bg-red-50 text-red-900";
  return (
    <div className={cn("flex flex-col rounded-md py-3", cls)}>
      <dt className="text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="text-2xl font-semibold">{count}</dd>
    </div>
  );
}
