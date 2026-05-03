import Link from "next/link";
import { redirect } from "next/navigation";

import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { extractCards, type Card } from "@/lib/content/cards";
import { readAllChapters } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { RemoveBookmarkButton } from "./remove-bookmark";

export const metadata = {
  title: "Bookmarks · Saved cards",
};

type BookmarkRow = {
  cardId: string;
  createdAt: string;
  card: Card | null;
  chapterTitle: string | null;
  chapterId: string | null;
  organSystem: string | null;
};

/**
 * Student "study later" list. Reads card_bookmarks for the caller
 * (RLS scopes the SELECT to their own rows), parses each card_id
 * back to its chapter, and renders a stem-snippet preview with a
 * link to the chapter and a Remove button.
 *
 * Bookmarks survive chapter file renames as long as the chapter slug
 * stays put — the card_id format is `{chapter-slug}:{index}`. If the
 * underlying card is no longer in the chapter (renumbered, retired)
 * the row still renders with a "(card not found)" placeholder so the
 * student can clean it up.
 */
export default async function MyBookmarksPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect("/today");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/me/bookmarks");

  const { data: bookmarks, error } = await supabase
    .from("card_bookmarks")
    .select("card_id, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  // Build a lookup of every card we have on disk, keyed by card.id.
  // For the pilot's content size (~2k cards) this is fine; if the
  // catalogue grows we'll move this to a per-chapter targeted read.
  const chapters = await readAllChapters();
  const cardById = new Map<
    string,
    { card: Card; chapterId: string; chapterTitle: string; organSystem: string }
  >();
  for (const ch of chapters) {
    for (const card of extractCards(ch)) {
      cardById.set(card.id, {
        card,
        chapterId: ch.frontmatter.id,
        chapterTitle: ch.frontmatter.title,
        organSystem: ch.frontmatter.organ_system,
      });
    }
  }

  const rows: BookmarkRow[] = (bookmarks ?? []).map((b) => {
    const meta = cardById.get(b.card_id);
    return {
      cardId: b.card_id,
      createdAt: b.created_at,
      card: meta?.card ?? null,
      chapterId: meta?.chapterId ?? null,
      chapterTitle: meta?.chapterTitle ?? null,
      organSystem: meta?.organSystem ?? null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Saved cards</p>
          <PrintButton label="Download PDF" />
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground text-sm">
          Cards you tagged for revisit. Independent of your daily SRS queue — these stay until you
          remove them.
        </p>
      </header>

      {error ? (
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No bookmarks yet. Tap the ☆ next to a question stem during a test session to save it here.
        </p>
      ) : (
        <ul className="border-input flex flex-col rounded-md border">
          {rows.map((r, idx) => (
            <li
              key={r.cardId}
              className={`flex flex-wrap items-start justify-between gap-3 p-4 text-sm ${
                idx === rows.length - 1 ? "" : "border-border/60 border-b"
              }`}
            >
              <div className="flex flex-1 flex-col gap-1">
                {r.card ? (
                  <>
                    <p className="text-foreground/90 line-clamp-3">{r.card.stem}</p>
                    {r.chapterTitle && r.chapterId && r.organSystem ? (
                      <Link
                        href={`/systems/${r.organSystem}/${r.chapterId}`}
                        className="text-muted-foreground text-xs underline-offset-2 hover:underline"
                      >
                        {r.chapterTitle}
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <p className="text-muted-foreground italic">
                    (Card not found — may have been retired.)
                  </p>
                )}
                <p className="text-muted-foreground text-[10px]">
                  Saved {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <RemoveBookmarkButton cardId={r.cardId} />
            </li>
          ))}
        </ul>
      )}

      <footer data-print="hide" className="border-border border-t pt-4">
        <Link href="/today">
          <Button variant="ghost" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </footer>
    </main>
  );
}
