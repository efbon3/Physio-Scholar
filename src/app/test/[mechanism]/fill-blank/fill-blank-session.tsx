"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { gradeFillBlank } from "@/lib/grading/fill-blank";
import { bandToRating, type GradingBand } from "@/lib/grading/rating-mapping";
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
  band: GradingBand;
  studentAnswer: string;
};

/**
 * Per-question fill-blank session.
 *
 * Walks through the supplied cards one at a time:
 *   1. Show stem + input + a subordinate "I don't know" button. The
 *      student types an answer, or taps "I don't know" to opt out;
 *      either choice is freely changeable until they tap Submit.
 *   2. Submit — if the student typed an answer, grade with
 *      `gradeFillBlank` and reveal the model answer + elaborative
 *      explanation alongside Green/Yellow/Red feedback. If the
 *      student tapped "I don't know," skip grading and reveal the
 *      model answer with the don't-know acknowledgment.
 *   3. Continue → next card.
 *   4. After the last card → summary screen with band counts and CTAs.
 *
 * SRS rating mapping (build spec §2.6):
 *   - Green / Yellow / Red → good / hard / again per `bandToRating`.
 *   - "I don't know"        → dont_know (build spec §2.7 modification 3
 *                              — same next-interval as Again but no
 *                              ease drop, no lapse increment).
 *
 * Practice-only toggle suppresses SRS schedule writes per build spec
 * §2.3 — review row still records (analytics), card_state stays
 * untouched. Locked once the first answer is submitted.
 */
export function FillBlankSession({ cards, mechanismId, mechanismSystem, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [dontKnow, setDontKnow] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<CardOutcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
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

  // Compute the result lazily so we can show it on the reveal screen
  // without storing it in state. For dont-know submissions the grader
  // is skipped — there's no student input to grade.
  const result = status === "feedback" && !dontKnow ? gradeFillBlank(studentAnswer, card) : null;
  // The outcome's band: dont_know if that path was taken, else the
  // grader's verdict.
  const feedbackBand: GradingBand | null = !card
    ? null
    : status !== "feedback"
      ? null
      : dontKnow
        ? "dont_know"
        : (result?.grade ?? null);

  async function handleSubmit() {
    if (!card) return;
    if (status !== "answering") return;
    // Submit is only allowed when the student has either typed something
    // or tapped "I don't know."
    if (!dontKnow && studentAnswer.trim().length === 0) return;

    const band: GradingBand = dontKnow ? "dont_know" : gradeFillBlank(studentAnswer, card).grade;
    const rating = bandToRating(band);
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

    setOutcomes((prior) => [...prior, { cardId: card.id, band, studentAnswer }]);
    setStatus("feedback");
  }

  function handleContinue() {
    if (isLastCard) {
      setStatus("complete");
      return;
    }
    setIndex((i) => i + 1);
    setStudentAnswer("");
    setDontKnow(false);
    setStatus("answering");
    setStartTime(Date.now());
  }

  function handleAnswerChange(next: string) {
    if (status !== "answering") return;
    setStudentAnswer(next);
    // Typing implicitly clears the don't-know flag — the student
    // changed their mind and is attempting after all.
    if (next.length > 0 && dontKnow) setDontKnow(false);
  }

  function handleDontKnowToggle() {
    if (status !== "answering") return;
    setDontKnow((v) => !v);
  }

  const submitDisabled = status !== "answering" || (!dontKnow && studentAnswer.trim().length === 0);

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-xs">
          <p className="text-muted-foreground tracking-widest uppercase">
            Question {index + 1} of {cards.length}
          </p>
          {feedbackBand ? <BandPill band={feedbackBand} /> : null}
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

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Your answer</span>
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={status !== "answering" || dontKnow}
            autoFocus
            placeholder={card.unit ? `e.g. 5.6 ${card.unit}` : "Type your answer"}
            className={cn(
              "border-input bg-background rounded-md border px-3 py-2 text-base disabled:opacity-70",
              dontKnow && "bg-muted",
            )}
          />
        </label>

        <button
          type="button"
          onClick={handleDontKnowToggle}
          disabled={status !== "answering"}
          aria-pressed={dontKnow}
          className={cn(
            "border-input text-muted-foreground self-start rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors",
            status === "answering" && "hover:bg-muted",
            status === "answering" && dontKnow && "border-primary text-primary bg-primary/5",
            status !== "answering" && dontKnow && "border-amber-500 bg-amber-50 text-amber-900",
            status !== "answering" && !dontKnow && "opacity-50",
          )}
        >
          I don&apos;t know
        </button>

        {status === "answering" ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className={cn(buttonVariants({ size: "default" }))}
              disabled={submitDisabled}
            >
              Submit answer
            </button>
          </div>
        ) : null}
      </div>

      {status === "feedback" ? (
        <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm leading-relaxed">
          {dontKnow ? (
            <p className="text-muted-foreground text-xs">
              You opted out — the card returns tomorrow without an ease change.
            </p>
          ) : result ? (
            <p>
              <span className="font-medium">Feedback:</span> {result.feedback}
            </p>
          ) : null}
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

function BandPill({ band }: { band: GradingBand }) {
  const label =
    band === "green"
      ? "Green"
      : band === "yellow"
        ? "Yellow"
        : band === "red"
          ? "Red"
          : "Don't know";
  const cls =
    band === "green"
      ? "bg-emerald-100 text-emerald-900"
      : band === "yellow"
        ? "bg-amber-100 text-amber-900"
        : band === "red"
          ? "bg-red-100 text-red-900"
          : "bg-slate-100 text-slate-700";
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
  const counts = outcomes.reduce<Record<GradingBand, number>>(
    (acc, o) => {
      acc[o.band] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0, dont_know: 0 },
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
      <dl className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
        <SummaryStat label="Green" count={counts.green} band="green" />
        <SummaryStat label="Yellow" count={counts.yellow} band="yellow" />
        <SummaryStat label="Red" count={counts.red} band="red" />
        <SummaryStat label="Don't know" count={counts.dont_know} band="dont_know" />
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

function SummaryStat({ label, count, band }: { label: string; count: number; band: GradingBand }) {
  const cls =
    band === "green"
      ? "bg-emerald-50 text-emerald-900"
      : band === "yellow"
        ? "bg-amber-50 text-amber-900"
        : band === "red"
          ? "bg-red-50 text-red-900"
          : "bg-slate-50 text-slate-700";
  return (
    <div className={cn("flex flex-col rounded-md py-3", cls)}>
      <dt className="text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="text-2xl font-semibold">{count}</dd>
    </div>
  );
}
