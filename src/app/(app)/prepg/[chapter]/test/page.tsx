import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { extractCards } from "@/lib/content/cards";
import { filterPublished } from "@/lib/content/card-filters";
import { buildMcqFromCard, seedFromString } from "@/lib/content/exam";
import { readPrepgChapterById } from "@/lib/content/prepg-fs";
import { createClient } from "@/lib/supabase/server";

import { PrepgMcqSession } from "./prepg-mcq-session";

type Params = { params: Promise<{ chapter: string }> };

export const metadata = { title: "Pre-PG drill" };

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

/**
 * Pre-PG drill session page. Builds the MCQ list from the chapter's
 * past-exam content, hands it to the client-side session player, and
 * redirects unauthenticated users to /login same as the curriculum
 * sessions do.
 */
export default async function PrepgTestPage({ params }: Params) {
  const { chapter: id } = await params;
  const chapter = await readPrepgChapterById(id);
  if (!chapter) notFound();

  const profileId = await getProfileId(`/prepg/${id}/test`);

  const cards = filterPublished(extractCards(chapter)).filter((c) => c.format === "mcq");
  // Same shuffle pattern as the curriculum MCQ session — Date.now +
  // crypto.randomUUID gives deterministic order per request but varies
  // across page loads so a learner doesn't memorise option positions.
  // eslint-disable-next-line react-hooks/purity
  const sessionSalt = `${id}:${profileId}:${Date.now()}-${crypto.randomUUID()}`;
  const questions = cards
    .map((card) => buildMcqFromCard(card, seedFromString(`${card.id}:${sessionSalt}`)))
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href={`/prepg/${id}`} className="underline-offset-2 hover:underline">
          ← Back to chapter
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Pre-PG drill</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {chapter.frontmatter.title}
        </h1>
      </header>

      {questions.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          No Pre-PG MCQs available for this chapter yet.
        </p>
      ) : (
        <PrepgMcqSession questions={questions} cards={cards} chapterId={id} profileId={profileId} />
      )}
    </main>
  );
}
