import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { extractCards } from "@/lib/content/cards";
import {
  applyCardFilters,
  filterByFormat,
  filterPublished,
  parseDifficultyFilter,
  parsePriorityFilter,
} from "@/lib/content/card-filters";
import { buildMcqFromCard, seedFromString, type McqQuestion } from "@/lib/content/exam";
import { readChapterById } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { McqSession } from "./mcq-session";

export const metadata = {
  title: "Multiple choice",
};

type Params = { params: Promise<{ mechanism: string }> };
type SearchParams = Promise<{ priority?: string | string[]; difficulty?: string | string[] }>;

async function getProfileId(nextPath: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "preview";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    return data.user.id;
  } catch {
    return "preview";
  }
}

export default async function McqSessionPage({
  params,
  searchParams,
}: Params & { searchParams: SearchParams }) {
  const { mechanism: id } = await params;
  const resolvedSearch = await searchParams;
  const chapter = await readChapterById(id);
  if (!chapter) notFound();

  const profileId = await getProfileId(`/test/${id}/mcq`);

  const allCards = extractCards(chapter);
  const formatCards = filterByFormat(filterPublished(allCards), "mcq");

  const priorityFilter = parsePriorityFilter(resolvedSearch.priority);
  const difficultyFilter = parseDifficultyFilter(resolvedSearch.difficulty);
  const filtered =
    priorityFilter || difficultyFilter
      ? applyCardFilters(formatCards, {
          priority: priorityFilter,
          difficulty: difficultyFilter,
        })
      : formatCards;
  const cards = filtered.length > 0 ? filtered : formatCards;

  // Build MCQs server-side so the client component receives the
  // already-shuffled options. Time + crypto entropy keeps the order
  // deterministic per request but different across page loads.
  // eslint-disable-next-line react-hooks/purity
  const sessionSalt = `${Date.now()}-${crypto.randomUUID()}`;
  const questions: McqQuestion[] = [];
  for (const card of cards) {
    const q = buildMcqFromCard(card, seedFromString(`${card.id}:${sessionSalt}`));
    if (q) questions.push(q);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link
          href={`/systems/${chapter.frontmatter.organ_system}/${id}`}
          className="underline-offset-2 hover:underline"
        >
          ← Back to chapter
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Multiple choice</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {chapter.frontmatter.title}
        </h1>
      </header>

      {questions.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          No multiple-choice questions available for this Chapter yet. MCQs need at least one
          misconception entry per question — once a question is authored with{" "}
          <code>**Format:** mcq</code> and at least one Misconception Mapping, it&apos;ll appear
          here.
        </p>
      ) : (
        <McqSession
          questions={questions}
          cards={cards}
          chapterId={id}
          mechanismSystem={chapter.frontmatter.organ_system}
          profileId={profileId}
        />
      )}
    </main>
  );
}
