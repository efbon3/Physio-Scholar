"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import type { McqQuestion } from "@/lib/content/exam";
import { bandToRating, mcqOutcomeToBand, type GradingBand } from "@/lib/grading/rating-mapping";
import { recordPrepgReviewLocally } from "@/lib/srs/prepg-local";
import { cn } from "@/lib/utils";

type Props = {
  questions: readonly McqQuestion[];
  cards: readonly Card[];
  chapterId: string;
  profileId: string;
};

type SessionStatus = "answering" | "feedback" | "complete";

type Outcome = {
  cardId: string;
  band: GradingBand;
};

type CardSnapshot = {
  selectedIndex: number;
  band: GradingBand;
  dontKnow: boolean;
};

const DONT_KNOW = -1 as const;

/**
 * Pre-PG drill session — focused MCQ player against the past-exam
 * question bank. Identical answer / submit / rate / next loop as the
 * curriculum McqSession but writes ratings to the prepg_reviews +
 * prepg_card_states Dexie tables via `recordPrepgReviewLocally`. SRS
 * state is therefore isolated: the same card_id can have totally
 * different ease/interval across the two pools, which is what the
 * "see exactly where you stand on past papers" goal requires.
 *
 * Phase 1 scope: forward through questions, rate, finish. Back-nav
 * via per-card snapshots (same pattern as the curriculum sessions).
 * No practice-mode toggle, no engagement-method prompt, no
 * practice-missed sub-session — those are curriculum-side affordances
 * that don't necessarily belong on a past-exam drill. Add later if
 * useful.
 */
export function PrepgMcqSession({ questions, cards, chapterId: _chapterId, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [viewIndex, setViewIndex] = useState(0);
  const [snapshots, setSnapshots] = useState<Record<string, CardSnapshot>>({});

  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const cardsById = useMemo(() => {
    const m = new Map<string, Card>();
    for (const c of cards) m.set(c.id, c);
    return m;
  }, [cards]);

  const question = questions[index];
  const card = question ? cardsById.get(question.cardId) : undefined;
  const isLastQuestion = index === questions.length - 1;
  const inHistory = viewIndex < index && status !== "complete";
  const viewedQuestion = inHistory ? questions[viewIndex] : null;
  const viewedCard = viewedQuestion ? cardsById.get(viewedQuestion.cardId) : undefined;
  const viewedSnapshot = viewedQuestion ? snapshots[viewedQuestion.cardId] : undefined;

  function handleViewPrevious() {
    if (viewIndex > 0) setViewIndex((v) => v - 1);
  }

  function handleViewForward() {
    if (viewIndex < index) setViewIndex((v) => v + 1);
  }

  if (inHistory && viewedQuestion && viewedCard && viewedSnapshot) {
    return (
      <PrepgHistoryView
        question={viewedQuestion}
        card={viewedCard}
        snapshot={viewedSnapshot}
        viewIndex={viewIndex}
        totalQuestions={questions.length}
        liveIndex={index}
        onPrevious={handleViewPrevious}
        onForward={handleViewForward}
      />
    );
  }

  if (status === "complete") {
    return <PrepgSummaryScreen outcomes={outcomes} />;
  }

  if (!question || !card) return null;

  const correctIndex = question.options.findIndex((o) => o.isCorrect);
  const isDontKnow = selectedIndex === DONT_KNOW;
  const isCorrect = selectedIndex !== null && !isDontKnow && selectedIndex === correctIndex;
  const selectedOptionText =
    selectedIndex !== null && selectedIndex !== DONT_KNOW
      ? question.options[selectedIndex].text
      : null;
  const matchingMisconception =
    !isDontKnow && selectedOptionText !== null && !isCorrect
      ? card.misconceptions.find((m) => m.wrong_answer === selectedOptionText)
      : undefined;

  function handleSelect(i: number) {
    if (status !== "answering") return;
    setSelectedIndex(i);
  }

  function handleDontKnow() {
    if (status !== "answering") return;
    setSelectedIndex(DONT_KNOW);
  }

  async function handleSubmit() {
    if (status !== "answering" || selectedIndex === null) return;
    const dontKnow = selectedIndex === DONT_KNOW;
    const correct = !dontKnow && selectedIndex === correctIndex;
    const band = mcqOutcomeToBand({ correct, hintsUsed: 0, dontKnow });
    const rating = bandToRating(band);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    try {
      await recordPrepgReviewLocally({
        profileId,
        cardId: question.cardId,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsedSeconds,
        sessionId,
      });
    } catch (err) {
      console.error("Failed to record Pre-PG review locally", err);
    }
    setSnapshots((prior) => ({
      ...prior,
      [question.cardId]: { selectedIndex, band, dontKnow },
    }));
    setOutcomes((prior) => [...prior, { cardId: question.cardId, band }]);
    setStatus("feedback");
  }

  function handleContinue() {
    if (isLastQuestion) {
      setStatus("complete");
      return;
    }
    setIndex((i) => i + 1);
    setViewIndex((v) => v + 1);
    setSelectedIndex(null);
    setStatus("answering");
    setStartTime(Date.now());
  }

  const submitDisabled = status !== "answering" || selectedIndex === null;

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex items-baseline justify-between text-xs">
        <p className="text-muted-foreground tracking-widest uppercase">
          Question {index + 1} of {questions.length}
        </p>
        {status === "feedback" ? (
          <BandPill band={isDontKnow ? "dont_know" : isCorrect ? "green" : "red"} />
        ) : null}
      </header>

      {card.year || card.exam ? (
        <p className="text-muted-foreground text-xs">
          {card.exam ?? "Past exam"}
          {card.year ? ` · ${card.year}` : ""}
        </p>
      ) : null}

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
                aria-pressed={isSelected}
                className={cn(
                  "border-input bg-background flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                  status === "answering" && "hover:bg-muted",
                  status === "answering" && isSelected && "border-primary bg-primary/5",
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

      <button
        type="button"
        onClick={handleDontKnow}
        disabled={status !== "answering"}
        aria-pressed={isDontKnow}
        className={cn(
          "border-input text-muted-foreground self-start rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors",
          status === "answering" && "hover:bg-muted",
          status === "answering" && isDontKnow && "border-primary text-primary bg-primary/5",
          status !== "answering" && isDontKnow && "border-amber-500 bg-amber-50 text-amber-900",
          status !== "answering" && !isDontKnow && "opacity-50",
        )}
      >
        I don&apos;t know
      </button>

      {status === "answering" ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={cn(buttonVariants({ size: "default" }))}
          >
            Submit answer
          </button>
        </div>
      ) : null}

      {status === "feedback" ? (
        <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm leading-relaxed">
          {isDontKnow ? (
            <p className="text-muted-foreground text-xs">
              You opted out — the card returns tomorrow without an ease change.
            </p>
          ) : null}
          {!isCorrect && !isDontKnow && matchingMisconception ? (
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
          <div className="flex items-center justify-between">
            {index > 0 ? (
              <button
                type="button"
                onClick={handleViewPrevious}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs underline-offset-2 hover:underline"
              >
                ← Previous question
              </button>
            ) : (
              <span />
            )}
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
  const label =
    band === "green"
      ? "Correct"
      : band === "yellow"
        ? "Partial"
        : band === "red"
          ? "Incorrect"
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

function PrepgSummaryScreen({ outcomes }: { outcomes: readonly Outcome[] }) {
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
        <h2 className="font-heading text-xl font-semibold">Drill complete</h2>
        <p className="text-muted-foreground text-sm">
          You answered {outcomes.length} past-exam MCQ{outcomes.length === 1 ? "" : "s"}. Pre-PG
          ratings are tracked separately from your curriculum SRS.
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
        <SummaryStat label="Correct" count={counts.green} band="green" />
        <SummaryStat label="Partial" count={counts.yellow} band="yellow" />
        <SummaryStat label="Incorrect" count={counts.red} band="red" />
        <SummaryStat label="Don't know" count={counts.dont_know} band="dont_know" />
      </dl>
      <div className="flex flex-wrap gap-3">
        <Link href="/prepg" className={cn(buttonVariants({ size: "default", variant: "outline" }))}>
          Back to Pre-PG list
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

function PrepgHistoryView({
  question,
  card,
  snapshot,
  viewIndex,
  totalQuestions,
  liveIndex,
  onPrevious,
  onForward,
}: {
  question: McqQuestion;
  card: Card;
  snapshot: CardSnapshot;
  viewIndex: number;
  totalQuestions: number;
  liveIndex: number;
  onPrevious: () => void;
  onForward: () => void;
}) {
  const correctIndex = question.options.findIndex((o) => o.isCorrect);
  const onLastHistory = viewIndex === liveIndex - 1;
  const bandLabel: Record<GradingBand, string> = {
    green: "Correct",
    yellow: "Partial",
    red: "Incorrect",
    dont_know: "Don't know",
  };
  const bandClass: Record<GradingBand, string> = {
    green: "bg-emerald-100 text-emerald-900",
    yellow: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-900",
    dont_know: "bg-slate-100 text-slate-700",
  };
  const selectedOptionText =
    !snapshot.dontKnow && snapshot.selectedIndex >= 0
      ? question.options[snapshot.selectedIndex]?.text
      : null;
  const matchingMisconception =
    selectedOptionText !== null
      ? card.misconceptions.find((m) => m.wrong_answer === selectedOptionText)
      : undefined;
  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Reviewing question {viewIndex + 1} of {totalQuestions}
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            bandClass[snapshot.band],
          )}
        >
          {bandLabel[snapshot.band]}
        </span>
      </header>

      {card.year || card.exam ? (
        <p className="text-muted-foreground text-xs">
          {card.exam ?? "Past exam"}
          {card.year ? ` · ${card.year}` : ""}
        </p>
      ) : null}

      <p className="text-base leading-relaxed">{question.stem}</p>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isStudentPick = !snapshot.dontKnow && snapshot.selectedIndex === i;
          const isCorrectOpt = i === correctIndex;
          return (
            <li
              key={`${question.cardId}-${i}`}
              className={cn(
                "border-input flex items-start gap-3 rounded-md border p-3 text-sm",
                isCorrectOpt && "border-emerald-500 bg-emerald-50 text-emerald-900",
                isStudentPick && !isCorrectOpt && "border-red-500 bg-red-50 text-red-900",
                !isStudentPick && !isCorrectOpt && "opacity-70",
              )}
            >
              <span className="text-muted-foreground font-mono text-xs">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="flex-1">{option.text}</span>
              {isStudentPick ? (
                <span className="text-[10px] tracking-widest uppercase">Your pick</span>
              ) : isCorrectOpt ? (
                <span className="text-[10px] tracking-widest uppercase">Correct</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {snapshot.dontKnow ? (
        <p className="text-muted-foreground text-xs">
          You opted out — &ldquo;I don&apos;t know.&rdquo;
        </p>
      ) : null}

      <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm leading-relaxed">
        {!snapshot.dontKnow && matchingMisconception ? (
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
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={onPrevious}
          disabled={viewIndex === 0}
          className="border-input hover:bg-muted text-foreground rounded-md border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onForward}
          className="border-input hover:bg-muted text-foreground rounded-md border px-3 py-1.5"
        >
          {onLastHistory ? "Back to current →" : "Forward →"}
        </button>
      </div>
    </article>
  );
}
