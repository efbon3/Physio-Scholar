"use client";

import { useState, useTransition } from "react";

import { deleteEventAction } from "@/lib/calendar/actions";
import type { ExamEventRow } from "@/lib/calendar/events";

/**
 * Read-only table of existing institution events with a delete
 * affordance per row. Faculty / admin can delete any row; learners
 * who reach this page (somehow) get the table without the button
 * because RLS will refuse the delete anyway.
 */
export function InstitutionEventList({
  events,
  canDelete,
}: {
  events: ExamEventRow[];
  canDelete: boolean;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No institution events authored yet. Add one above.
      </p>
    );
  }

  return (
    <>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="border-input flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{e.title}</span>
              <span className="text-muted-foreground text-xs">
                <span className="capitalize">{e.kind.replace(/_/g, " ")}</span> · {e.starts_at}
                {e.ends_at && e.ends_at !== e.starts_at ? ` → ${e.ends_at}` : ""}
                {e.organ_systems.length > 0 ? <> · {e.organ_systems.join(", ")}</> : null}
              </span>
            </div>
            {canDelete ? (
              <button
                type="button"
                disabled={pendingId === e.id}
                onClick={() => {
                  if (!confirm(`Delete "${e.title}"?`)) return;
                  setPendingId(e.id);
                  setError(null);
                  startTransition(async () => {
                    const result = await deleteEventAction(e.id);
                    if (result.status === "error") setError(result.message);
                    setPendingId(null);
                  });
                }}
                className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
              >
                {pendingId === e.id ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
