import Link from "next/link";

import { parseDifficultyFilter, parsePriorityFilter } from "@/lib/content/card-filters";
import { extractCards } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";

import { SelfTestPicker, type SelfTestGroup } from "./self-test-picker";

export const metadata = {
  title: "Self-test",
};

type SearchParams = {
  priority?: string | string[];
  difficulty?: string | string[];
};

/**
 * Self-test mode landing — pick a mechanism (or whole system) to drill.
 *
 * Distinct from /review (per-card immediate feedback) — self-test
 * defers feedback to end-of-session and asks the student to grade
 * each card themselves. Hint usage costs points; see
 * src/lib/self-test/grading.ts for the full score model.
 *
 * Priority + difficulty filters live on this page so the learner can
 * scope a drill before they start. The selection flows into the
 * session URL as `?priority=…&difficulty=…`; the session entry trims
 * the card universe before SM-2 begins.
 */
export default async function SelfTestPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const priority = parsePriorityFilter(resolved.priority) ?? [];
  const difficulty = parseDifficultyFilter(resolved.difficulty) ?? [];

  const mechanisms = await readAllMechanisms();
  const grouped = new Map<string, { id: string; title: string; cardCount: number }[]>();
  for (const m of mechanisms) {
    const cards = extractCards(m);
    if (cards.length === 0) continue;
    const list = grouped.get(m.frontmatter.organ_system) ?? [];
    list.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      cardCount: cards.length,
    });
    grouped.set(m.frontmatter.organ_system, list);
  }
  const groups: SelfTestGroup[] = [...grouped.entries()]
    .map(([system, items]) => ({
      system,
      mechanisms: items.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Self-test</p>
          <Link
            href="/today"
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Pick a mechanism to test yourself on
        </h1>
        <p className="text-muted-foreground text-sm leading-7">
          Type your answer for each card, optionally peek at hints (with a points penalty), submit
          without seeing the answer. At the end, review side-by-side and self-grade. Your scores
          feed back into the SRS schedule.
        </p>
      </header>

      <SelfTestPicker groups={groups} initialPriority={priority} initialDifficulty={difficulty} />
    </main>
  );
}
