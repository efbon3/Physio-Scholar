import Link from "next/link";

import { extractCards } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";

export const metadata = {
  title: "Self-test",
};

/**
 * Self-test mode landing — pick a mechanism (or whole system) to drill.
 *
 * Distinct from /review (per-card immediate feedback) — self-test
 * defers feedback to end-of-session and asks the student to grade
 * each card themselves. Hint usage costs points; see
 * src/lib/self-test/grading.ts for the full score model.
 *
 * The page lists organ systems → mechanisms within each → a
 * "Start self-test" link per mechanism. A future iteration may add
 * "test the whole system" as a single CTA per system; for now,
 * mechanism-scoped sessions match the spec ("they should be able to
 * choose specific mechanism etc they want to assess").
 */
export default async function SelfTestPage() {
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
  const groups = [...grouped.entries()]
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

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No mechanisms with questions yet. Authored content lives under{" "}
          <code>content/mechanisms/</code>.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-2">
                {g.mechanisms.map((m) => (
                  <li
                    key={m.id}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/mechanisms/${encodeURIComponent(m.id)}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {m.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {m.cardCount} question{m.cardCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/self-test/session?mechanism=${encodeURIComponent(m.id)}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-sm font-medium"
                    >
                      Start self-test
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
