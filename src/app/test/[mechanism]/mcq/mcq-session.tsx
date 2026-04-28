"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import type { McqQuestion } from "@/lib/content/exam";
import { bandToRating, mcqOutcomeToBand, type GradingBand } from "@/lib/grading/rating-mapping";
import { recordReviewLocally } from "@/lib/srs/local";
import { cn } from "@/lib/utils";

type Props = {
  questions: readonly McqQuestion[];
  cards: readonly Card[];
  mechanismId: string;
  mechanismSystem: string;
  profileId: string;
};

type SessionStatus = "answering" | "feedback" | "complete";

type Outcome = {
  cardId: string;
  band: GradingBand;
  selectedIndex: number;
};

/**
 * Mechanism-centric MCQ session. Walks through pre-built `McqQuestion`
 * objects (server-shuffled) one at a time:
 *   1. Show stem + four option buttons.
 *   2. On select, lock the choice, reveal correct/wrong + the
 *      misconception coaching string (if the wrong-answer text matches
 *      a misconception map entry) + the elaborative explanation.
 *   3. SRS rating per `mcqOutcomeToBand`: correct + no hints → Green,
 *      correct + hints → Yellow, wrong → Red. v1 has no hint ladder
 *      on this surface yet, so hintsUsed is always 0 — every correct
 *      answer goes Green. (Build spec §2.5 leaves hints optional;
 *      threading them in is a future commit.)
 *   4. Continue → next card.
 *   5. End-of-session summary with Green/Yellow/Red counts.
 *
 * Practice-only toggle suppresses SRS schedule writes per build spec
 * §2.3 — review row still records (analytics), card_state stays
 * untouched. Locked once the first answer is committed.
 */
export function McqSession({ questions, cards, mechanismId, mechanismSystem, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [practiceMode, setPracticeMode] = useState(false);
  const practiceLocked = outcomes.length > 0;

  const sessionId = useMemo(() => crypto.randomUUID(), []);
  // Index cards by id for O(1) misconception lookup. Same Card object
  // we render the MCQ from also carries the misconception list keyed
  // to wrong-answer text.
  const cardsById = useMemo(() => {
    const m = new Map<string, Card>();
    for (const c of cards) m.set(c.id, c);
    return m;
  }, [cards]);

  const question = questions[index];
  const card = question ? cardsById.get(question.cardId) : undefined;
  const isLastQuestion = index === questions.length - 1;

  if (status === "complete") {
    return (
      <SummaryScreen
        outcomes={outcomes}
        mechanismId={mechanismId}
        mechanismSystem={mechanismSystem}
        practiceMode={practiceMode}
      />
    );
  }

  if (!question || !card) return null;

  const correctIndex = question.options.findIndex((o) => o.isCorrect);
  const isCorrect = selectedIndex !== null && selectedIndex === correctIndex;
  const selectedOptionText = selectedIndex !== null ? question.options[selectedIndex].text : null;
  const matchingMisconception =
    selectedOptionText !== null && !isCorrect
      ? card.misconceptions.find((m) => m.wrong_answer === selectedOptionText)
      : undefined;

  async function handleSelect(i: number) {
    if (status !== "answering") return;
    setSelectedIndex(i);

    const correct = i === correctIndex;
    const band = mcqOutcomeToBand({ correct, hintsUsed: 0 });
    const rating = bandToRating(band);
    // Date.now() in an event handler is fine — React's purity rule
    // applies to render code, not handlers. The lint rule occasionally
    // misclassifies an arrow-wrapped onClick callee as render context.
    // eslint-disable-next-line react-hooks/purity
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      await recordReviewLocally({
        profileId,
        cardId: question.cardId,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsedSeconds,
        sessionId,
        practiceMode,
      });
    } catch (err) {
      console.error("Failed to record MCQ review locally", err);
    }

    setOutcomes((prior) => [...prior, { cardId: question.cardId, band, selectedIndex: i }]);
    setStatus("feedback");
  }

  function handleContinue() {
    if (isLastQuestion) {
      setStatus("complete");
      return;
    }
    setIndex((i) => i + 1);
    setSelectedIndex(null);
    setStatus("answering");
    setStartTime(Date.now());
  }

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-xs">
          <p className="text-muted-foreground tracking-widest uppercase">
            Question {index + 1} of {questions.length}
          </p>
          {selectedIndex !== null ? <BandPill band={isCorrect ? "green" : "red"} /> : null}
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

      <p className="text-base leading-relaxed">{question.stem}</p>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const showCorrect = status === "feedback" && i === correctIndex;
          const showWrong = status === "feedback" && isSelected && i !== correctIndex;
          return (
            <li key={`${question.cardId}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(i)}
                disabled={status !== "answering"}
                className={cn(
                  "border-input bg-background flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                  status === "answering" && "hover:bg-muted",
                  showCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                  showWrong && "border-red-500 bg-red-50 text-red-900",
                  status !== "answering" && !showCorrect && !showWrong && "opacity-70",
                )}
              >
                <span className="text-muted-foreground font-mono text-xs">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1">{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {status === "feedback" ? (
        <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm leading-relaxed">
          {!isCorrect && matchingMisconception ? (
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                What went wrong
              </p>
              <p>{matchingMisconception.description}</p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Why</p>
            <p>{question.elaborativeExplanation}</p>
          </div>
          <div className="flex justify-end">
            <button onClick={handleContinue} className={cn(buttonVariants({ size: "default" }))}>
              {isLastQuestion ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BandPill({ band }: { band: GradingBand }) {
  const label = band === "green" ? "Correct" : band === "yellow" ? "Partial" : "Incorrect";
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
  outcomes: readonly Outcome[];
  mechanismId: string;
  mechanismSystem: string;
  practiceMode: boolean;
}) {
  const counts = outcomes.reduce<Record<GradingBand, number>>(
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
          You answered {outcomes.length} multiple-choice question
          {outcomes.length === 1 ? "" : "s"}.
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <SummaryStat label="Correct" count={counts.green} band="green" />
        <SummaryStat label="Partial" count={counts.yellow} band="yellow" />
        <SummaryStat label="Incorrect" count={counts.red} band="red" />
      </dl>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {practiceMode
          ? "Practice mode — your answers were logged but the SRS schedule wasn't touched."
          : "These ratings have been logged to your daily review queue."}
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
        : "bg-red-50 text-red-900";
  return (
    <div className={cn("flex flex-col rounded-md py-3", cls)}>
      <dt className="text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="text-2xl font-semibold">{count}</dd>
    </div>
  );
}
