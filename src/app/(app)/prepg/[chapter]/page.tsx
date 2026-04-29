import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { extractCards } from "@/lib/content/cards";
import { filterPublished } from "@/lib/content/card-filters";
import { readPrepgChapterById } from "@/lib/content/prepg-fs";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: Params) {
  const { chapter: id } = await params;
  const m = await readPrepgChapterById(id);
  return { title: m ? `Pre-PG — ${m.frontmatter.title}` : "Chapter not found" };
}

/**
 * Pre-PG chapter landing — shows the chapter title + a single "Start
 * drill" button that launches the MCQ session against this chapter's
 * past-exam questions. There's no format picker because Pre-PG is
 * MCQ-only by definition; there's no textbook-reading zone because
 * past-exam questions don't carry one.
 */
export default async function PrepgChapterPage({ params }: Params) {
  const { chapter: id } = await params;
  const chapter = await readPrepgChapterById(id);
  if (!chapter) notFound();

  const cards = filterPublished(extractCards(chapter));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/prepg" className="underline-offset-2 hover:underline">
          Pre-PG
        </Link>
        {" / "}
        <span className="capitalize">{chapter.frontmatter.organ_system}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          {chapter.frontmatter.organ_system}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {chapter.frontmatter.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {cards.length} past-exam MCQ{cards.length === 1 ? "" : "s"} for this chapter.
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No past-exam questions authored for this chapter yet.
        </p>
      ) : (
        <Link
          href={`/prepg/${id}/test`}
          className={cn(buttonVariants({ size: "default" }), "self-start")}
        >
          Start drill
        </Link>
      )}
    </main>
  );
}
