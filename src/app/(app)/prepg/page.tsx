import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { extractCards } from "@/lib/content/cards";
import { readAllPrepgChapters } from "@/lib/content/prepg-fs";

export const metadata = {
  title: "Pre-PG",
};

type SystemGroup = {
  system: string;
  chapters: { id: string; title: string; questionCount: number }[];
};

/**
 * Pre-PG list — chapters drawn from `content/prepg/` grouped by organ
 * system, mirroring the Assessment tab's structure. The bank is
 * MCQ-only; the format-picker pattern doesn't apply here, so each
 * chapter row links straight to the Pre-PG drill session.
 *
 * Empty-state copy explains how to author content (drop a chapter-
 * format `.md` file into `content/prepg/`) so a fresh install
 * doesn't surface a blank screen with no diagnostic.
 */
export default async function PrepgPage() {
  const chapters = await readAllPrepgChapters();
  const grouped = new Map<string, SystemGroup>();
  for (const m of chapters) {
    const key = m.frontmatter.organ_system;
    if (!grouped.has(key)) grouped.set(key, { system: key, chapters: [] });
    const cards = extractCards(m);
    grouped.get(key)!.chapters.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      questionCount: cards.length,
    });
  }
  const groups = [...grouped.values()].sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Pre-PG</h1>
        <p className="text-sm">
          Past-exam MCQs (NEET-PG, INI-CET, AIIMS, …) organised chapter-wise. SRS state on these
          questions is tracked separately from your curriculum cards so you can see exactly where
          you stand on past papers.
        </p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No Pre-PG chapters yet"
          description="Drop a chapter-format markdown file into content/prepg/ to add past-exam MCQs for a chapter. Same authoring shape as the curriculum chapters, MCQ-only, with optional Year and Exam labels per question."
          tone="muted"
        />
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-1">
                {g.chapters
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((c) => (
                    <li key={c.id} className="flex items-baseline justify-between gap-3">
                      <Link className="underline underline-offset-2" href={`/prepg/${c.id}`}>
                        {c.title}
                      </Link>
                      <span className="text-muted-foreground text-xs">
                        {c.questionCount} question{c.questionCount === 1 ? "" : "s"}
                      </span>
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
