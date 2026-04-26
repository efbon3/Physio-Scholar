"use client";

import { useState, useTransition } from "react";

import { deleteAssignmentAction } from "@/lib/assignments/actions";

/**
 * Delete control for an assignment row. Confirms once, calls the
 * server action, then leans on the page's revalidatePath to refresh
 * the list. Shown only on rows the caller authored — the page-level
 * `faculty_id === user.id` check decides whether to render this.
 */
export function DeleteAssignmentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (typeof window !== "undefined") {
            const ok = window.confirm("Delete this assignment? Students will no longer see it.");
            if (!ok) return;
          }
          setError(null);
          startTransition(async () => {
            const result = await deleteAssignmentAction(id);
            if (result.status === "error") setError(result.message);
          });
        }}
        className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-900 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
        data-testid={`delete-assignment-${id}`}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </span>
  );
}
