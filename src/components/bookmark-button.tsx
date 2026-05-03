"use client";

import { useState, useTransition } from "react";

import { toggleBookmarkAction } from "@/lib/bookmarks/actions";

/**
 * One-tap "save for later" toggle on a card. Renders a star icon —
 * filled when the card is bookmarked, outline otherwise. Optimistically
 * flips on click and reconciles with the server response.
 *
 * Bookmarks are independent of SRS state: tapping does not change the
 * scheduler's view of the card. The Saved list (/me/bookmarks) lets a
 * student revisit weak items outside the daily queue.
 */
export function BookmarkButton({
  cardId,
  initiallyBookmarked,
}: {
  cardId: string;
  initiallyBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this card"}
        title={bookmarked ? "Bookmarked — tap to remove" : "Save for later"}
        onClick={() => {
          setError(null);
          // Optimistic flip — the server reconciles below.
          setBookmarked((prev) => !prev);
          startTransition(async () => {
            const result = await toggleBookmarkAction(cardId);
            if (result.status === "ok") {
              setBookmarked(result.bookmarked);
            } else {
              // Roll back on error.
              setBookmarked((prev) => !prev);
              setError(result.message);
            }
          });
        }}
        className="text-muted-foreground hover:text-foreground rounded-md p-1 text-xs disabled:opacity-50"
      >
        {bookmarked ? (
          <span aria-hidden className="text-amber-500">
            ★
          </span>
        ) : (
          <span aria-hidden>☆</span>
        )}
        <span className="sr-only">{bookmarked ? "Bookmarked" : "Not bookmarked"}</span>
      </button>
      {error ? (
        <span role="alert" className="text-destructive text-[10px]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
