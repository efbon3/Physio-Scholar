"use client";

import { useState, useTransition } from "react";

import { submitAssignmentForReviewAction } from "@/lib/assignments/actions";

/**
 * Inline "Submit for review" button. Used on a draft or
 * changes_requested row to flip it into the HOD queue. Optimistic
 * pending state; surfaces a server-action error inline.
 */
export function SubmitForReviewButton({ assignmentId }: { assignmentId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await submitAssignmentForReviewAction(assignmentId);
            if (result.status === "error") setError(result.message);
          });
        }}
        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
      {error ? (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      ) : null}
    </div>
  );
}
