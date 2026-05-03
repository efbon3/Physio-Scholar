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
import { readChapterById } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { FillBlankSession } from "./fill-blank-session";

export const metadata = {
  title: "Fill in the blank",
};

type Params = { params: Promise<{ mechanism: string }> };
type SearchParams = Promise<{ priority?: string | string[]; difficulty?: string | string[] }>;

/** Same graceful posture as the rest of the app: skip Supabase in unconfigured envs. */
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

async function getBookmarkedCardIds(profileId: string): Promise<string[]> {
  if (profileId === "preview" || !process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("card_bookmarks")
      .select("card_id")
      .eq("profile_id", profileId);
    return (data ?? []).map((r) => r.card_id);
  } catch {
    return [];
  }
}

export default async function FillBlankSessionPage({
  params,
  searchParams,
}: Params & { searchParams: SearchParams }) {
  const { mechanism: id } = await params;
  const resolvedSearch = await searchParams;
  const chapter = await readChapterById(id);
  if (!chapter) notFound();

  const profileId = await getProfileId(`/test/${id}/fill-blank`);
  const bookmarkedCardIds = await getBookmarkedCardIds(profileId);

  const allCards = extractCards(chapter);
  const formatCards = filterByFormat(filterPublished(allCards), "fill_blank");

  // Apply priority + difficulty filters from URL params (set by the
  // Chapter page format-picker). Empty / unrecognised → null →
  // unfiltered. If the filter combination wipes the deck we keep the
  // unfiltered list rather than trapping the learner on an empty
  // state — same fallback pattern as /review and /exam used to use.
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
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Fill in the blank</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {chapter.frontmatter.title}
        </h1>
      </header>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          No fill-in-the-blank questions have been authored for this Chapter yet. Once a question
          with <code>**Format:** fill_blank</code> lands in the markdown, it&apos;ll appear here.
        </p>
      ) : (
        <FillBlankSession
          cards={cards}
          chapterId={id}
          mechanismSystem={chapter.frontmatter.organ_system}
          profileId={profileId}
          bookmarkedCardIds={bookmarkedCardIds}
        />
      )}
    </main>
  );
}
