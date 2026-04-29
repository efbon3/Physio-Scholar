import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { readAllLearningChapters } from "@/lib/content/learning-fs";

export const metadata = {
  title: "Learning",
};

type SystemGroup = {
  system: string;
  chapters: { id: string; title: string }[];
};

/**
 * Learning list — chapters drawn from `content/learning/` grouped by
 * organ system. Read-only notes structured like a review book; no
 * SRS, no test sessions, no question extraction. The chapter detail
 * page renders the four reading layers (Core / Working / Deep Dive /
 * Clinical Integration) as tabs.
 *
 * Empty-state copy explains how to author content so a fresh install
 * doesn't surface a blank screen with no diagnostic.
 */
export default async function LearningPage() {
  const chapters = await readAllLearningChapters();
  const grouped = new Map<string, SystemGroup>();
  for (const c of chapters) {
    const key = c.frontmatter.organ_system;
    if (!grouped.has(key)) grouped.set(key, { system: key, chapters: [] });
    grouped.get(key)!.chapters.push({ id: c.frontmatter.id, title: c.frontmatter.title });
  }
  const groups = [...grouped.values()].sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Learning</h1>
        <p className="text-sm">
          Notes for each chapter, organised the way a review book would: a quick Core summary, a
          deeper Working explanation, a Deep Dive into nuance, and the Clinical Integration that
          ties it back to bedside reasoning. Pure reading — no SRS, no quizzing.
        </p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon="📖"
          title="No Learning chapters yet"
          description="Drop a chapter-format markdown file into content/learning/ to add notes for a chapter. Use the four-layer structure: # Layer 1 — Core, # Layer 2 — Working, # Layer 3 — Deep Dive, # Layer 4 — Clinical Integration."
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
                    <li key={c.id}>
                      <Link className="underline underline-offset-2" href={`/learn/${c.id}`}>
                        {c.title}
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
