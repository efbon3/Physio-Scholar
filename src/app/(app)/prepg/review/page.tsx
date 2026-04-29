import Link from "next/link";
import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { filterPublished } from "@/lib/content/card-filters";
import { readAllPrepgChapters } from "@/lib/content/prepg-fs";
import { createClient } from "@/lib/supabase/server";

import { PrepgReviewPlayer } from "./prepg-review-player";

export const metadata = {
  title: "Pre-PG · Daily review",
};

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
 * Pre-PG daily review — pulls every published MCQ across every Pre-PG
 * chapter, hands them to the client player which assembles the SRS
 * queue from `prepg_card_states` and walks the learner through the
 * due cards. Same scheduler, isolated row pool — see
 * `src/lib/srs/prepg-local.ts` for the recorder side.
 */
export default async function PrepgReviewPage() {
  const profileId = await getProfileId("/prepg/review");
  const chapters = await readAllPrepgChapters();
  const allCards: Card[] = chapters.flatMap((c) =>
    filterPublished(extractCards(c)).filter((card) => card.format === "mcq"),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/prepg" className="underline-offset-2 hover:underline">
          ← Back to Pre-PG
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Pre-PG</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Daily review</h1>
        <p className="text-muted-foreground text-sm">
          Past-exam MCQs the SM-2 scheduler has surfaced for revision. Ratings here only affect your
          Pre-PG calibration — your curriculum SRS state is unaffected.
        </p>
      </header>

      <PrepgReviewPlayer allCards={allCards} profileId={profileId} />
    </main>
  );
}
