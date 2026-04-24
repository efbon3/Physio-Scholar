import Link from "next/link";

import { EXAM_PATTERNS } from "@/lib/content/exam";

export const metadata = {
  title: "Exam mode",
};

const COUNT_OPTIONS = [20, 50, 100] as const;

/**
 * Exam mode landing — student picks MBBS or pre-PG + a drill size.
 * Submits via GET to /exam/session so a refresh re-seeds the session
 * without server state.
 */
export default function ExamLandingPage() {
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
            Back to Today
          </Link>
        </div>
      </form>
    </main>
  );
}
