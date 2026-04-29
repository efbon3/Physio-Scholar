import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { readAllChapters } from "@/lib/content/source";
import { chapterNumberFromId, readSyllabusTopics } from "@/lib/content/syllabus";

export const metadata = {
  title: "Assessment",
};

type ChapterRow = {
  id: string;
  title: string;
  topics: string[];
};

type SystemGroup = {
  system: string;
  mechanisms: ChapterRow[];
};

export default async function SystemsPage() {
  const [mechanisms, syllabus] = await Promise.all([readAllChapters(), readSyllabusTopics()]);

  // Group by organ_system; sort systems alphabetically, mechanisms alphabetically.
  const grouped = new Map<string, SystemGroup>();
  for (const m of mechanisms) {
    const key = m.frontmatter.organ_system;
    if (!grouped.has(key)) grouped.set(key, { system: key, mechanisms: [] });
    const chapterNum = chapterNumberFromId(m.frontmatter.id);
    const topics = chapterNum !== null ? (syllabus.get(chapterNum) ?? []) : [];
    grouped.get(key)!.mechanisms.push({
      id: m.frontmatter.id,
      title: m.frontmatter.title,
      topics,
    });
  }
  const groups = [...grouped.values()].sort((a, b) => a.system.localeCompare(b.system));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Assessment</h1>
        <p className="text-sm">Browse chapters by organ system.</p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No chapters yet"
          description="Chapters appear here as soon as content is published. The author edits markdown under content/chapters/ and a deploy ships them."
          tone="muted"
        />
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-4">
                {g.mechanisms
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((m) => (
                    <li key={m.id} className="flex flex-col gap-1">
                      <Link
                        className="font-medium hover:underline"
                        href={`/systems/${g.system}/${m.id}`}
                      >
                        {m.title}
                      </Link>
                      {m.topics.length > 0 ? (
                        <ul className="text-muted-foreground ml-4 list-disc text-sm">
                          {m.topics.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      ) : null}
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
