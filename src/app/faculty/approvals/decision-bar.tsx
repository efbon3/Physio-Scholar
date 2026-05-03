"use client";

import { useState, useTransition } from "react";

import {
  approveAssignmentAction,
  rejectAssignmentAction,
  requestAssignmentChangesAction,
} from "./actions";

/**
 * Per-row HOD decision bar. Three buttons (Approve, Request changes,
 * Reject) and a free-text comment box. Approve sends comment as
 * optional context (e.g. "great structure, looks good"); Request
 * changes + Reject require a comment so the faculty knows what to
 * fix or why the work was refused.
 *
 * The buttons disable while the action is in flight; errors render
 * inline. On success the page revalidates server-side, so the row
 * disappears from the queue on its own.
 */
export function DecisionBar({ assignmentId }: { assignmentId: string }) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={pending}
        placeholder="Comment (required to reject or request changes)"
        rows={2}
        maxLength={1000}
        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        aria-label="HOD decision comment"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await approveAssignmentAction(assignmentId, comment);
              if (result.status === "error") setError(result.message);
            });
          }}
          className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await requestAssignmentChangesAction(assignmentId, comment);
              if (result.status === "error") setError(result.message);
            });
          }}
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          Request changes
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await rejectAssignmentAction(assignmentId, comment);
              if (result.status === "error") setError(result.message);
            });
          }}
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-900 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
        >
          Reject
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
