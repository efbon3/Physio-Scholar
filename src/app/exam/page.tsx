import Link from "next/link";

import { parseDifficultyFilter, parsePriorityFilter } from "@/lib/content/card-filters";
import { EXAM_PATTERNS } from "@/lib/content/exam";

export const metadata = {
  title: "Exam mode",
};

const COUNT_OPTIONS = [20, 50, 100] as const;

const PRIORITY_OPTIONS = [
  { value: "must", label: "Must-know" },
  { value: "should", label: "Should-know" },
  { value: "good", label: "Good-to-know" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "foundational", label: "Foundational" },
  { value: "standard", label: "Standard" },
  { value: "advanced", label: "Advanced" },
] as const;

type SearchParams = {
  priority?: string | string[];
  difficulty?: string | string[];
};

/**
 * Exam mode landing — student picks MBBS or pre-PG + a drill size.
 * Submits via GET to /exam/session so a refresh re-seeds the session
 * without server state.
 *
 * Priority + difficulty checkboxes carry over any pre-selection from
 * the Today dashboard's filter chips (linked here with `?priority=…`
 * & `?difficulty=…`) and pass through to the session URL when the
 * learner submits the form.
 */
export default async function ExamLandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const incomingPriority = new Set(parsePriorityFilter(params.priority) ?? []);
  const incomingDifficulty = new Set(parseDifficultyFilter(params.difficulty) ?? []);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Exam</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Exam mode</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Timed MCQ drills from the same question bank as your review session, filtered by exam
          type. Your regular review schedule isn&apos;t affected — exam results are separate from
          your SRS queue.
        </p>
      </header>

      <form action="/exam/session" method="get" className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="font-heading text-lg font-medium">Which exam?</legend>
          {EXAM_PATTERNS.map((p, i) => (
            <label
              key={p.key}
              className="border-input hover:bg-muted flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm"
            >
              <input
                type="radio"
                name="type"
                value={p.key}
                defaultChecked={i === 0}
                required
                className="mt-1"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{p.label}</span>
                <span className="text-muted-foreground text-xs">
                  {p.key === "mbbs"
                    ? "Undergraduate curriculum questions — free-recall-style answers adapted into MCQs."
                    : "NEET-PG / INI-CET style MCQs with clinical framing."}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-heading text-lg font-medium">How many questions?</legend>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map((n, i) => (
              <label
                key={n}
                className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm"
              >
                <input type="radio" name="count" value={`${n}`} defaultChecked={i === 0} required />
                <span>{n}</span>
              </label>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            One minute per question. A 20-question drill is about 20 minutes.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-heading text-lg font-medium">
            Importance{" "}
            <span className="text-muted-foreground text-xs font-normal">
              (uncheck all = include every level)
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="priority"
                  value={opt.value}
                  defaultChecked={incomingPriority.has(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-heading text-lg font-medium">
            Difficulty{" "}
            <span className="text-muted-foreground text-xs font-normal">
              (uncheck all = include every level)
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="border-input hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="difficulty"
                  value={opt.value}
                  defaultChecked={incomingDifficulty.has(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            Start drill
          </button>
          <Link
            href="/today"
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </form>
    </main>
  );
}
