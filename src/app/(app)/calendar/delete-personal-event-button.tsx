"use client";

import { useState, useTransition } from "react";

import { deleteEventAction } from "@/lib/calendar/actions";

/**
 * Per-event delete affordance on the learner-facing calendar. Mirrors
 * the admin/calendar pattern: native confirm() dialog, optimistic
 * pending state, surface any RLS / network error inline.
 *
 * Rendered only for personal events (the calendar page gates on
 * audience === "personal" before mounting this); RLS would refuse the
 * delete on an institution event anyway, but the UI treats deletes as
 * an owner-only affordance regardless.
 */
export function DeletePersonalEventButton({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteEventAction(id);
            if (result.status === "error") setError(result.message);
          });
        }}
        className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md border px-2 py-1 text-xs disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
