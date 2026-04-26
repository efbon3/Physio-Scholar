import Link from "next/link";

import {
  extractFacts,
  FACT_CATEGORIES,
  FACT_CATEGORY_LABELS,
  type FactCategory,
} from "@/lib/content/facts";
import { readAllMechanisms } from "@/lib/content/source";

export const metadata = {
  title: "Facts",
};

/**
 * Facts mode landing — pick a mechanism (or category) to flashcard.
 *
 * Distinct from /review (mechanism explanations) and /self-test
 * (mechanism explanations, batched feedback): facts are short
 * factual-recall items — definitions, normal values, functions,
 * relations, associations, classifications. The session is a rapid
 * flashcard flow (prompt → reveal → "Knew it / Didn't") rather than
 * a 4-grade self-assessment.
 *
 * Layout: per-mechanism cards listing the per-category counts plus
 * a "Mix" CTA that drills the whole mechanism's fact set in one
 * randomised pass.
 */
export default async function FactsPage() {
  const mechanisms = await readAllMechanisms();

  type MechSummary = {
    id: string;
    title: string;
    organSystem: string;
    total: number;
    byCategory: Partial<Record<FactCategory, number>>;
  };

  const summaries: MechSummary[] = [];
  for (const m of mechanisms) {
    const facts = extractFacts(m);
    if (facts.length === 0) continue;
    const byCategory: Partial<Record<FactCategory, number>> = {};
    for (const f of facts) {
      byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
    }
    summaries.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      organSystem: m.frontmatter.organ_system,
      total: facts.length,
      byCategory,
    });
  }

  const grouped = new Map<string, MechSummary[]>();
  for (const s of summaries) {
    const list = grouped.get(s.organSystem) ?? [];
    list.push(s);
    grouped.set(s.organSystem, list);
  }
  const groups = [...grouped.entries()]
    .map(([system, items]) => ({
      system,
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Facts</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Rapid factual recall</h1>
        <p className="text-muted-foreground text-sm leading-7">
          Definitions, normal values, functions, relations, associations, classifications. One
          prompt at a time — try to recall the answer, reveal, and tell yourself whether you knew
          it. Facts feed the same review schedule as your mechanism cards.
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-md border p-4 text-sm">
          No facts authored yet. Add a <code>{"# Facts"}</code> section to a mechanism markdown file
          under <code>content/mechanisms/</code> and they&apos;ll appear here.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-3">
                {g.items.map((s) => (
                  <li
                    key={s.id}
                    className="border-border flex flex-col gap-3 rounded-md border p-3"
                  >
                    <header className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{s.title}</p>
                      <Link
                        href={`/facts/session?mechanism=${encodeURIComponent(s.id)}`}
                        className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1 text-xs font-medium"
                      >
                        Mix · {s.total} facts
                      </Link>
                    </header>
                    <ul className="flex flex-wrap gap-2 text-xs">
                      {FACT_CATEGORIES.map((c) => {
                        const count = s.byCategory[c] ?? 0;
                        if (count === 0) return null;
                        return (
                          <li key={c}>
                            <Link
                              href={`/facts/session?mechanism=${encodeURIComponent(s.id)}&category=${c}`}
                              className="border-input hover:bg-muted inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                            >
                              <span>{FACT_CATEGORY_LABELS[c]}</span>
                              <span className="text-muted-foreground tabular-nums">{count}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
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
