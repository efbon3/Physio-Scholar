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
  chapterId: string;
  mechanismSystem: string;
  profileId: string;
};

type SessionStatus = "answering" | "feedback" | "complete";

type Outcome = {
  cardId: string;
  band: GradingBand;
  selectedIndex: number | null;
};

/** A symbolic value used for `selectedIndex` when the student picks
 * "I don't know" rather than one of the four options. Distinct from
 * `null` (no selection yet) so the lock-on-Submit logic can tell
 * "didn't pick yet" from "explicitly opted out." */
const DONT_KNOW = -1 as const;

/**
 * Chapter-centric MCQ session. Walks through pre-built `McqQuestion`
 * objects (server-shuffled) one at a time:
 *   1. Show stem + four option cards + a subordinate "I don't know"
 *      button. Tapping any option (or "I don't know") highlights it;
 *      the student can change their mind freely until they tap Submit.
 *   2. Submit locks the choice and reveals the correct option, the
 *      misconception coaching string (if the wrong-answer text matches
 *      a misconception map entry; "I don't know" suppresses it), and
 *      the elaborative explanation.
 *   3. SRS rating per `mcqOutcomeToBand`: correct + no hints → Green,
 *      correct + hints → Yellow, wrong → Red, "I don't know" →
 *      dont_know (build spec §2.7 modification 3 — same next-interval
 *      as Again but no ease drop, no lapse increment). v1 has no hint
 *      ladder on this surface yet, so hintsUsed is always 0.
 *   4. Continue → next card.
 *   5. End-of-session summary with Correct / Partial / Incorrect /
 *      Don't-know counts.
 *
 * Practice-only toggle suppresses SRS schedule writes per build spec
 * §2.3 — review row still records (analytics), card_state stays
 * untouched. Locked once the first answer is committed.
 */
export function McqSession({ questions, cards, chapterId, mechanismSystem, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [practiceMode, setPracticeMode] = useState(false);
  // Practice-missed sub-session: after a Session-complete summary, the
  // student can grind just the cards they got wrong without disturbing
  // their SM-2 schedule. We force practice mode for this sub-session
  // regardless of the toggle, so a learner re-attempting their misses
  // can never accidentally tank their card states by choosing badly
  // on a tired second pass.
  const [practiceMissedActive, setPracticeMissedActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<readonly McqQuestion[]>(questions);
  const effectivePracticeMode = practiceMode || practiceMissedActive;
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

  const question = activeQuestions[index];
  const card = question ? cardsById.get(question.cardId) : undefined;
  const isLastQuestion = index === activeQuestions.length - 1;

  function handlePracticeMissed() {
    const missedIds = new Set(
      outcomes
        .filter((o) => o.band === "red" || o.band === "yellow" || o.band === "dont_know")
        .map((o) => o.cardId),
    );
    if (missedIds.size === 0) return;
    const missed = activeQuestions.filter((q) => missedIds.has(q.cardId));
    // Re-shuffle so the order isn't memorised — same defence as the
    // server-side shuffle on session start.
    const shuffled = [...missed].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled);
    setPracticeMissedActive(true);
    setIndex(0);
    setSelectedIndex(null);
    setOutcomes([]);
    setStartTime(Date.now());
    setStatus("answering");
  }

  if (status === "complete") {
    return (
      <SummaryScreen
        outcomes={outcomes}
        chapterId={chapterId}
        mechanismSystem={mechanismSystem}
        practiceMode={effectivePracticeMode}
        practiceMissedActive={practiceMissedActive}
        onPracticeMissed={handlePracticeMissed}
      />
    );
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
    if (status !== "answering") return;
    if (selectedIndex === null) return;

    const dontKnow = selectedIndex === DONT_KNOW;
    const correct = !dontKnow && selectedIndex === correctIndex;
    const band = mcqOutcomeToBand({ correct, hintsUsed: 0, dontKnow });
    const rating = bandToRating(band);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      await recordReviewLocally({
        profileId,
        cardId: question.cardId,
        rating,
        hintsUsed: 0,
        timeSpentSeconds: elapsedSeconds,
        sessionId,
        practiceMode: effectivePracticeMode,
      });
    } catch (err) {
      console.error("Failed to record MCQ review locally", err);
    }

    setOutcomes((prior) => [
      ...prior,
      {
        cardId: question.cardId,
        band,
        selectedIndex: dontKnow ? null : selectedIndex,
      },
    ]);
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

  const submitDisabled = status !== "answering" || selectedIndex === null;

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-xs">
          <p className="text-muted-foreground tracking-widest uppercase">
            Question {index + 1} of {activeQuestions.length}
          </p>
          {status === "feedback" ? (
            <BandPill band={isDontKnow ? "dont_know" : isCorrect ? "green" : "red"} />
          ) : null}
        </div>
        {practiceMissedActive ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong className="font-medium">Practice round</strong> — reviewing{" "}
            {activeQuestions.length} missed card{activeQuestions.length === 1 ? "" : "s"}. Your SRS
            schedule won&apos;t be touched.
          </p>
        ) : (
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
        )}
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

      {/* "I don't know" lives below the four options as a deliberately
          subordinate but clearly available choice — build spec §2.3
          ("visually subordinate but clearly available"). */}
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

function SummaryScreen({
  outcomes,
  chapterId,
  mechanismSystem,
  practiceMode,
  practiceMissedActive,
  onPracticeMissed,
}: {
  outcomes: readonly Outcome[];
  chapterId: string;
  mechanismSystem: string;
  practiceMode: boolean;
  practiceMissedActive: boolean;
  onPracticeMissed: () => void;
}) {
  const counts = outcomes.reduce<Record<GradingBand, number>>(
    (acc, o) => {
      acc[o.band] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0, dont_know: 0 },
  );
  const missedCount = counts.yellow + counts.red + counts.dont_know;
  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">
          {practiceMissedActive ? "Practice round complete" : "Session complete"}
        </h2>
        <p className="text-muted-foreground text-sm">
          You answered {outcomes.length} multiple-choice question
          {outcomes.length === 1 ? "" : "s"}.
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
        <SummaryStat label="Correct" count={counts.green} band="green" />
        <SummaryStat label="Partial" count={counts.yellow} band="yellow" />
        <SummaryStat label="Incorrect" count={counts.red} band="red" />
        <SummaryStat label="Don't know" count={counts.dont_know} band="dont_know" />
      </dl>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {practiceMissedActive
          ? "Practice round — analytics logged, SRS schedule untouched."
          : practiceMode
            ? "Practice mode — your answers were logged but the SRS schedule wasn't touched."
            : "These ratings have been logged to your daily review queue."}
      </p>
      <div className="flex flex-wrap gap-3">
        {missedCount > 0 ? (
          <button
            type="button"
            onClick={onPracticeMissed}
            className={cn(buttonVariants({ size: "default" }))}
          >
            Practice missed ({missedCount})
          </button>
        ) : null}
        <Link
          href={`/systems/${mechanismSystem}/${chapterId}`}
          className={cn(buttonVariants({ size: "default", variant: "outline" }))}
        >
          Back to Chapter
        </Link>
        <Link
          href="/today"
          className={cn(
            buttonVariants({ size: "default", variant: missedCount > 0 ? "outline" : "default" }),
          )}
        >
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
