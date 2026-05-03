"use client";

import { useState, useTransition } from "react";

import {
  deleteAnnouncementAction,
  submitAnnouncementForReviewAction,
} from "@/lib/announcements/actions";

/**
 * Per-row actions on the faculty announcements list. Two affordances:
 *   - "Submit for review" (only when status=draft|changes_requested)
 *   - "Delete" (with confirmation)
 *
 * Errors render inline; on success the page revalidates server-side
 * via the action.
 */
export function AnnouncementRowActions({
  id,
  title,
  canSubmit,
}: {
  id: string;
  title: string;
  canSubmit: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await submitAnnouncementForReviewAction(id);
              if (result.status === "error") setError(result.message);
            });
          }}
          className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          {pending ? "Submitting…" : "Submit for review"}
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete announcement "${title}"? This can't be undone.`)) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteAnnouncementAction(id);
            if (result.status === "error") setError(result.message);
          });
        }}
        className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md border px-2 py-1 text-xs disabled:opacity-50"
      >
        Delete
      </button>
      {error ? (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      ) : null}
    </div>
  );
}
