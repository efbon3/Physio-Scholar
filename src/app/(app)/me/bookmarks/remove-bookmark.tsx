"use client";

import { useState, useTransition } from "react";

import { toggleBookmarkAction } from "@/lib/bookmarks/actions";

/**
 * Per-row remove control on the bookmarks list. Calls the same toggle
 * action as the BookmarkButton — the action deletes the row when the
 * card is currently bookmarked. After success we hide the row locally
 * (faster than a full page revalidate) but the action also revalidates
 * /me/bookmarks so a refresh agrees.
 */
export function RemoveBookmarkButton({ cardId }: { cardId: string }) {
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (hidden) return null;

  return (
    <div data-print="hide" className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleBookmarkAction(cardId);
            if (result.status === "ok") {
              setHidden(true);
            } else {
              setError(result.message);
            }
          });
        }}
        className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md border px-2 py-1 text-xs disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error ? (
        <span role="alert" className="text-destructive text-[10px]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
