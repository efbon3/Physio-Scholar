"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { bandToRating, type GradingBand } from "@/lib/grading/rating-mapping";
import { recordReviewLocally } from "@/lib/srs/local";
import { cn } from "@/lib/utils";

type Props = {
  cards: readonly Card[];
  chapterId: string;
  mechanismSystem: string;
  profileId: string;
};

type SessionStatus = "answering" | "revealed" | "method" | "complete";

type Outcome = {
  cardId: string;
  band: GradingBand;
};

type EngagementMethod = "written_peer" | "written_self" | "mental";

const REVEAL_DELAY_SECONDS = 5;
const ENGAGEMENT_DEFAULT_KEY = "physio.descriptive.engagementMethodDefault";

/**
 * Lazy initializer for the engagement-method default. Reads
 * localStorage on first render so a returning learner sees their
 * habitual method pre-selected. SSR-safe — returns null when window
 * is unavailable (server render); the client-side render runs again
 * and may resolve to a stored value. The defaultMethod only affects
 * the method-prompt UI which is never on initial render, so no
 * hydration mismatch.
 */
function readEngagementDefault(): EngagementMethod | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(ENGAGEMENT_DEFAULT_KEY);
  if (stored === "written_peer" || stored === "written_self" || stored === "mental") {
    return stored;
  }
  return null;
}

/**
 * Chapter-centric descriptive session.
 *
 * Per build spec §2.6, descriptive grading is student-self-rated:
 *   1. Stem displayed, student types a free-text answer.
 *   2. Submit reveals the canonical answer + elaborative explanation.
 *   3. A 5-second forced delay disables the Green/Yellow/Red rating
 *      buttons, ensuring the student spends at least that long
 *      reading the model answer before rating themselves.
 *   4. After the timer elapses, the rating row activates. Picking a
 *      band maps to a SM-2 Rating via `bandToRating` and persists
 *      via `recordReviewLocally` (or, in practice mode, just the
 *      review row without a schedule update).
 *   5. Continue → next card. Summary at the end.
 *
 * The 5-second delay is a forcing function, not arbitrary friction —
 * see build spec §2.6 ("the student must read the model answer
 * before rating").
 */
export function DescriptiveSession({ cards, chapterId, mechanismSystem, profileId }: Props) {
  const [index, setIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [dontKnow, setDontKnow] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("answering");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [revealTime, setRevealTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [practiceMode, setPracticeMode] = useState(false);
  // Practice-missed sub-session: see McqSession for the rationale.
  // Forced practice mode shields a tired second pass from disturbing
  // the SM-2 schedule.
  const [practiceMissedActive, setPracticeMissedActive] = useState(false);
  const [activeCards, setActiveCards] = useState<readonly Card[]>(cards);
  const effectivePracticeMode = practiceMode || practiceMissedActive;
  const practiceLocked = outcomes.length > 0;
  // Engagement-method prompt state. The pending band is the rating the
  // student just picked; the prompt UI renders next, asking how they
  // engaged. The student's last pick is remembered in localStorage so
  // it pre-selects on the next card. Skip is silent — no method
  // recorded for that card.
  const [pendingBand, setPendingBand] = useState<GradingBand | null>(null);
  const [defaultMethod, setDefaultMethod] = useState<EngagementMethod | null>(
    readEngagementDefault,
  );

  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const card = activeCards[index];
  const isLastCard = index === activeCards.length - 1;

  function handlePracticeMissed() {
    const missedIds = new Set(
      outcomes
        .filter((o) => o.band === "red" || o.band === "yellow" || o.band === "dont_know")
        .map((o) => o.cardId),
    );
    if (missedIds.size === 0) return;
    const missed = activeCards.filter((c) => missedIds.has(c.id));
    const shuffled = [...missed].sort(() => Math.random() - 0.5);
    setActiveCards(shuffled);
    setPracticeMissedActive(true);
    setIndex(0);
    setStudentAnswer("");
    setDontKnow(false);
    setRevealTime(null);
    setPendingBand(null);
    setOutcomes([]);
    setStartTime(Date.now());
    setStatus("answering");
  }

  // Tick once a second while the rating buttons are locked so the
  // countdown indicator stays accurate. Stops as soon as the timer
  // elapses to avoid burning render cycles for nothing.
  useEffect(() => {
    if (status !== "revealed" || revealTime === null) return;
    const elapsedMs = Date.now() - revealTime;
    if (elapsedMs >= REVEAL_DELAY_SECONDS * 1000) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [status, revealTime]);

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

  if (!card) return null;

  const secondsUntilUnlock =
    revealTime !== null
      ? Math.max(0, REVEAL_DELAY_SECONDS - Math.floor((now - revealTime) / 1000))
      : REVEAL_DELAY_SECONDS;
  const ratingUnlocked = status === "revealed" && secondsUntilUnlock === 0;

  /**
   * Submit advances to the reveal screen. Empty textarea is permitted
   * — that path means the learner answered mentally or on paper and
   * just wants to check themselves against the model answer. The
   * engagement-method prompt (after self-rating) captures whether the
   * answer was written on screen, written on paper, or worked
   * mentally. This is distinct from "I don't know" (no engagement,
   * auto-rated dont_know without self-rating).
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "answering") return;
    setStatus("revealed");
    const t = Date.now();
    setRevealTime(t);
    setNow(t);
  }

  /**
   * "I don't know" path — student opts out of writing, jumps straight
   * to the model answer, and the card auto-rates as `dont_know`. Same
   * pattern as MCQ/fill-blank: same next-interval as Again but no ease
   * drop, no lapse increment. The 5s reading delay still applies so
   * the learner spends time with the model answer.
   */
  function handleDontKnow() {
    if (status !== "answering") return;
    setDontKnow(true);
    setStudentAnswer("");
    setStatus("revealed");
    const t = Date.now();
    setRevealTime(t);
    setNow(t);
  }

  async function recordAndAdvance(band: GradingBand, method: EngagementMethod | null) {
    if (!card) return;
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
        selfExplanation: studentAnswer,
        practiceMode: effectivePracticeMode,
        engagementMethod: method,
      });
    } catch (err) {
      console.error("Failed to record descriptive review locally", err);
    }
    setOutcomes((prior) => [...prior, { cardId: card.id, band }]);

    if (isLastCard) {
      setStatus("complete");
    } else {
      setIndex((i) => i + 1);
      setStudentAnswer("");
      setDontKnow(false);
      setRevealTime(null);
      setPendingBand(null);
      setStatus("answering");
      setStartTime(Date.now());
    }
  }

  function handleRate(band: GradingBand) {
    if (!card || !ratingUnlocked) return;
    // Stage the rating and transition to the method-prompt step. The
    // review row is recorded once the prompt is answered or skipped
    // (one IndexedDB write per card, including the engagement_method
    // metadata).
    setPendingBand(band);
    setStatus("method");
  }

  async function handleMethodPick(method: EngagementMethod) {
    if (!card || !pendingBand) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ENGAGEMENT_DEFAULT_KEY, method);
    }
    setDefaultMethod(method);
    await recordAndAdvance(pendingBand, method);
  }

  async function handleMethodSkip() {
    if (!card || !pendingBand) return;
    await recordAndAdvance(pendingBand, null);
  }

  async function handleDontKnowContinue() {
    if (!card || !ratingUnlocked) return;
    // Don't-know skips the engagement-method prompt — the student
    // didn't engage at all, so the prompt is meaningless. Record
    // directly with no method.
    await recordAndAdvance("dont_know", null);
  }

  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Question {index + 1} of {activeCards.length}
        </p>
        {practiceMissedActive ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong className="font-medium">Practice round</strong> — reviewing {activeCards.length}{" "}
            missed card{activeCards.length === 1 ? "" : "s"}. Your SRS schedule won&apos;t be
            touched.
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

      <p className="text-base leading-relaxed">{card.stem}</p>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Your answer</span>
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            disabled={status !== "answering"}
            rows={5}
            placeholder="Write your answer in your own words…"
            className="border-input bg-background rounded-md border px-3 py-2 text-base disabled:opacity-70"
          />
        </label>
        {status === "answering" ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDontKnow}
              className="border-input text-muted-foreground hover:bg-muted self-start rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors"
            >
              I don&apos;t know
            </button>
            <button type="submit" className={cn(buttonVariants({ size: "default" }))}>
              Submit
            </button>
          </div>
        ) : null}
      </form>

      {status === "revealed" || status === "method" ? (
        <div className="border-border bg-muted/40 flex flex-col gap-4 rounded-md border p-4 text-sm leading-relaxed">
          {dontKnow ? (
            <p className="text-muted-foreground text-xs">
              You opted out — read the model answer carefully. The card returns tomorrow without an
              ease change.
            </p>
          ) : null}
          <div>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Model answer</p>
            <p className="whitespace-pre-wrap">{card.correct_answer}</p>
          </div>
          {card.elaborative_explanation ? (
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Why</p>
              <p className="whitespace-pre-wrap">{card.elaborative_explanation}</p>
            </div>
          ) : null}
          {card.self_grading_checklist ? (
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Self-grading checklist
              </p>
              <p className="whitespace-pre-wrap">{card.self_grading_checklist}</p>
            </div>
          ) : null}
          {card.common_misconceptions ? (
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Common misconceptions
              </p>
              <p className="whitespace-pre-wrap">{card.common_misconceptions}</p>
            </div>
          ) : null}
          {status === "revealed" ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">
                {ratingUnlocked
                  ? dontKnow
                    ? "Continue when you've read the model answer."
                    : "Rate yourself against the model answer:"
                  : `Reading time… ${secondsUntilUnlock}s remaining before ${dontKnow ? "Continue" : "rating"} unlocks.`}
              </p>
              {dontKnow ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDontKnowContinue}
                    disabled={!ratingUnlocked}
                    className={cn(
                      buttonVariants({ size: "default" }),
                      !ratingUnlocked && "opacity-50",
                    )}
                  >
                    {isLastCard ? "Finish" : "Continue"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <RatingButton
                    band="green"
                    label="Green — got it"
                    disabled={!ratingUnlocked}
                    onClick={() => handleRate("green")}
                  />
                  <RatingButton
                    band="yellow"
                    label="Yellow — partially"
                    disabled={!ratingUnlocked}
                    onClick={() => handleRate("yellow")}
                  />
                  <RatingButton
                    band="red"
                    label="Red — missed it"
                    disabled={!ratingUnlocked}
                    onClick={() => handleRate("red")}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">
                How did you engage with this question?{" "}
                <span className="text-muted-foreground/70">(optional — analytics only)</span>
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <MethodButton
                  label="Wrote & self-checked"
                  highlighted={defaultMethod === "written_self"}
                  onClick={() => handleMethodPick("written_self")}
                />
                <MethodButton
                  label="Wrote & peer-checked"
                  highlighted={defaultMethod === "written_peer"}
                  onClick={() => handleMethodPick("written_peer")}
                />
                <MethodButton
                  label="Worked it mentally"
                  highlighted={defaultMethod === "mental"}
                  onClick={() => handleMethodPick("mental")}
                />
              </div>
              <button
                type="button"
                onClick={handleMethodSkip}
                className="text-muted-foreground hover:bg-muted self-end rounded-md px-3 py-1.5 text-xs underline-offset-2 hover:underline"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

/**
 * Engagement-method picker button. The student's last pick is
 * highlighted (a thin primary border) so a returning learner sees their
 * habitual choice pre-suggested without it being auto-committed.
 */
function MethodButton({
  label,
  highlighted,
  onClick,
}: {
  label: string;
  highlighted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-input rounded-md border px-3 py-2 text-xs font-medium transition-colors",
        highlighted ? "border-primary bg-primary/5 text-foreground" : "hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function RatingButton({
  band,
  label,
  disabled,
  onClick,
}: {
  band: GradingBand;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const cls =
    band === "green"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : band === "yellow"
        ? "bg-amber-500 hover:bg-amber-600 text-white"
        : "bg-red-600 hover:bg-red-700 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : cls,
      )}
    >
      {label}
    </button>
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
  // Descriptive doesn't surface a "Don't know" affordance — the
  // empty-submission + Red rating already covers that case — but
  // GradingBand's union now includes "dont_know" so we initialise
  // the record with all four keys to satisfy the type. The
  // dont_know slot stays zero in practice for this format.
  const counts = outcomes.reduce<Record<GradingBand, number>>(
    (acc, o) => {
      acc[o.band] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0, dont_know: 0 },
  );
  const missedCount = counts.yellow + counts.red;
  return (
    <article className="border-border flex flex-col gap-5 rounded-md border p-5">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">
          {practiceMissedActive ? "Practice round complete" : "Session complete"}
        </h2>
        <p className="text-muted-foreground text-sm">
          You answered {outcomes.length} descriptive question{outcomes.length === 1 ? "" : "s"}.
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <SummaryStat label="Green" count={counts.green} band="green" />
        <SummaryStat label="Yellow" count={counts.yellow} band="yellow" />
        <SummaryStat label="Red" count={counts.red} band="red" />
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
        : "bg-red-50 text-red-900";
  return (
    <div className={cn("flex flex-col rounded-md py-3", cls)}>
      <dt className="text-[11px] tracking-widest uppercase">{label}</dt>
      <dd className="text-2xl font-semibold">{count}</dd>
    </div>
  );
}
