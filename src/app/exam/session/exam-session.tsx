"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { estimateExamMinutes, PreflightModal } from "@/components/preflight-modal";
import type { ExamPattern, McqQuestion } from "@/lib/content/exam";
import { buildRetakeQuestions } from "@/lib/content/mcq-retake";
import { cn } from "@/lib/utils";

type Status = "preflight" | "drilling" | "complete";

type Answer = {
  cardId: string;
  selectedIndex: number | null;
  correctIndex: number;
  stem: string;
  options: { text: string; isCorrect: boolean }[];
  elaborativeExplanation: string;
};

const SECONDS_PER_QUESTION = 60;

/**
 * Timed MCQ drill. One question at a time with a running total timer
 * (`count × 60s`). The student can skip forward without answering; a
 * skipped question counts as unanswered, not wrong.
 *
 * End-of-drill screen shows score + a review list where every
 * incorrect / skipped question surfaces the correct answer and the
 * elaborative explanation. Same text the regular review loop shows
 * after reveal — this is the "teaching" half of the drill.
 */
export function ExamSession({
  pattern,
  questions,
}: {
  pattern: ExamPattern;
  questions: McqQuestion[];
}) {
  // Pre-flight gate (J1/J2): start on the disclaimer modal, transition
  // to "drilling" only after the learner accepts. The 60s/question
  // timer is bound to the "drilling" state, so the clock doesn't run
  // while the disclaimer is visible.
  const [status, setStatus] = useState<Status>("preflight");
  const [index, setIndex] = useState(0);
  // `activeQuestions` is the deck currently being drilled. Initially
  // equal to the `questions` prop; when the learner taps "Retake
  // mistakes" we replace it with the filtered + option-shuffled subset
  // and reset the per-question state. Lookups in render code
  // (`activeQuestions[index].stem`, etc.) stay correct on retake
  // without touching the parent's prop.
  const [activeQuestions, setActiveQuestions] = useState<McqQuestion[]>(questions);
  const [answers, setAnswers] = useState<Answer[]>(() => buildAnswers(questions));
  const totalSeconds = activeQuestions.length * SECONDS_PER_QUESTION;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (status !== "drilling") return;
    const id = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(id);
          setStatus("complete");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Hooks must run unconditionally — keep all useMemo/useState/useEffect
  // calls above the conditional render branches below.
  const current = activeQuestions[index];
  const progress = useMemo(
    () => ({ index, total: activeQuestions.length }),
    [index, activeQuestions.length],
  );

  if (status === "preflight") {
    return (
      <PreflightModal
        open
        kind={`Exam drill · ${pattern === "mbbs" ? "MBBS" : "Pre-PG"}`}
        questionCount={activeQuestions.length}
        estimatedMinutes={estimateExamMinutes(activeQuestions.length)}
        context="One minute per question. Skipped questions do not count against you."
        cancelHref="/exam"
        onAccept={() => setStatus("drilling")}
      />
    );
  }

  function selectOption(optionIndex: number) {
    if (status !== "drilling") return;
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, selectedIndex: optionIndex } : a)),
    );
  }

  function advance() {
    if (index + 1 >= activeQuestions.length) {
      setStatus("complete");
      return;
    }
    setIndex(index + 1);
  }

  function handleRetakeMistakes() {
    // Build a lookup of mechanism ids from the original deck so the
    // retake subset can carry the correct mechanism label per question.
    const mechMap = new Map(activeQuestions.map((q) => [q.cardId, q.mechanismId] as const));
    const retake = buildRetakeQuestions({
      answers,
      mechanismIdByCardId: mechMap,
    });
    if (retake.length === 0) return;
    setActiveQuestions(retake);
    setAnswers(buildAnswers(retake));
    setIndex(0);
    setSecondsRemaining(retake.length * SECONDS_PER_QUESTION);
    // Skip the pre-flight modal — the learner already opted in to the
    // focused-study session; this is a continuation, not a fresh start.
    setStatus("drilling");
  }

  if (status === "complete") {
    const correct = answers.filter((a) => a.selectedIndex === a.correctIndex).length;
    const incorrect = answers.filter(
      (a) => a.selectedIndex !== null && a.selectedIndex !== a.correctIndex,
    );
    const skipped = answers.filter((a) => a.selectedIndex === null);
    const pct = Math.round((correct / answers.length) * 100);
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Exam · {pattern === "mbbs" ? "MBBS" : "Pre-PG"}
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Drill complete — {pct}%
          </h1>
          <p className="text-sm">
            {correct} correct · {incorrect.length} incorrect · {skipped.length} skipped out of{" "}
            {answers.length}.
          </p>
        </header>

        {incorrect.length + skipped.length > 0 ? (
          <section aria-label="Review mistakes" className="flex flex-col gap-4">
            <h2 className="font-heading text-xl font-medium">Review</h2>
            <ul className="flex flex-col gap-4">
              {[...incorrect, ...skipped].map((a, i) => {
                const correctOption = a.options[a.correctIndex];
                const selectedOption = a.selectedIndex === null ? null : a.options[a.selectedIndex];
                return (
                  <li key={`${a.cardId}-${i}`} className="border-border rounded-md border p-4">
                    <p className="text-sm leading-7">
                      <span className="text-muted-foreground text-xs">Q:</span> {a.stem}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground text-xs">Correct answer:</span>{" "}
                      <span className="font-medium">{correctOption.text}</span>
                    </p>
                    {selectedOption ? (
                      <p className="mt-1 text-sm">
                        <span className="text-muted-foreground text-xs">You chose:</span>{" "}
                        <span className="line-through opacity-70">{selectedOption.text}</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-1 text-xs">Skipped.</p>
                    )}
                    <p className="text-muted-foreground mt-2 text-sm leading-7">
                      {a.elaborativeExplanation}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <p className="text-sm">Perfect score. Nothing to review.</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {incorrect.length + skipped.length > 0 ? (
            <button
              type="button"
              onClick={handleRetakeMistakes}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
              data-testid="retake-mistakes"
            >
              Retake mistakes ({incorrect.length + skipped.length})
            </button>
          ) : null}
          <Link
            href="/exam"
            className={cn(
              incorrect.length + skipped.length > 0
                ? "hover:bg-muted rounded-md border px-4 py-2 text-sm"
                : "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium",
            )}
          >
            Start another drill
          </Link>
          <Link href="/today" className="text-muted-foreground rounded-md border px-4 py-2 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          Question {progress.index + 1} / {progress.total}
        </span>
        <span
          className={cn(
            "font-mono",
            secondsRemaining < 60 ? "text-destructive font-medium" : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {formatTime(secondsRemaining)}
        </span>
      </header>

      {current ? (
        <>
          <section aria-label="Stem" className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              {current.mechanismId.replace(/-/g, " ")}
            </p>
            <h1 className="font-heading text-xl leading-snug font-medium">{current.stem}</h1>
          </section>

          <section aria-label="Options" className="flex flex-col gap-2">
            {current.options.map((option, optionIdx) => {
              const selected = answers[index].selectedIndex === optionIdx;
              return (
                <button
                  key={optionIdx}
                  type="button"
                  onClick={() => selectOption(optionIdx)}
                  aria-pressed={selected}
                  className={cn(
                    "border-input w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted",
                  )}
                >
                  {option.text}
                </button>
              );
            })}
          </section>

          <div className="sticky bottom-4 mt-auto flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              Pick one answer. You can also skip.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={advance}
                className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={advance}
                disabled={answers[index].selectedIndex === null}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm disabled:opacity-50"
              >
                {index + 1 === activeQuestions.length ? "Submit drill" : "Next"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Map a deck of MCQs into the per-question Answer rows the drill UI
 * mutates. Pulled out as a helper because both the initial mount and
 * the "Retake mistakes" handler need to build it the same way.
 */
function buildAnswers(deck: readonly McqQuestion[]): Answer[] {
  return deck.map((q) => ({
    cardId: q.cardId,
    selectedIndex: null,
    correctIndex: q.options.findIndex((o) => o.isCorrect),
    stem: q.stem,
    options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    elaborativeExplanation: q.elaborativeExplanation,
  }));
}
