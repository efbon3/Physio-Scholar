"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteClassSessionAction, setClassSessionStatusAction } from "@/lib/schedule/actions";

import type { ScheduleBatchOption } from "./session-form";

export type SessionRecord = {
  id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "held" | "cancelled";
  location: string | null;
  notes: string | null;
  batch_id: string | null;
  faculty_id: string;
};

const STATUS_LABEL: Record<SessionRecord["status"], string> = {
  scheduled: "Scheduled",
  held: "Held",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<SessionRecord["status"], string> = {
  scheduled: "border-input bg-muted text-muted-foreground",
  held: "border-emerald-300 bg-emerald-50 text-emerald-900",
  cancelled: "border-rose-300 bg-rose-50 text-rose-900",
};

/**
 * One session row. Renders the session metadata, the status pill, and
 * the action affordances:
 *   - "Take attendance" (always allowed for scheduled / held — useful
 *     for advance pre-marking and post-hoc edits).
 *   - "Mark held" → flips status, signals that attendance is final.
 *   - "Cancel" / "Re-open" → toggles between scheduled and cancelled.
 *   - "Delete" (owner only, with confirmation; cascades the records).
 *
 * The owner gate is intentional: faculty can mark any session's
 * attendance (per RLS), but only the owner can delete the row.
 */
export function SessionRow({
  session,
  isOwner,
  batchName,
}: {
  session: SessionRecord;
  isOwner: boolean;
  batchName: string | null;
  batches: ScheduleBatchOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const startsAt = new Date(session.scheduled_at);
  const startLabel = Number.isFinite(startsAt.getTime())
    ? startsAt.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : session.scheduled_at;

  function setStatus(next: SessionRecord["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await setClassSessionStatusAction(session.id, next);
      if (result.status === "error") setError(result.message);
    });
  }

  return (
    <li className="border-input flex flex-col gap-2 rounded-md border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-base font-medium">{session.topic}</h3>
        <p className="text-muted-foreground text-xs">
          {startLabel} · {session.duration_minutes} min
        </p>
      </div>
      <p className="text-muted-foreground text-xs">
        {batchName ? `Batch: ${batchName}` : "Whole institution"}
        {session.location ? ` · ${session.location}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[session.status]}`}
          aria-label={`Status: ${STATUS_LABEL[session.status]}`}
        >
          {STATUS_LABEL[session.status]}
        </span>
      </div>
      {session.notes ? <p className="text-sm whitespace-pre-wrap">{session.notes}</p> : null}

      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        <Link
          href={`/faculty/schedule/${session.id}/attendance`}
          className="text-primary underline-offset-2 hover:underline"
        >
          Take attendance →
        </Link>

        {session.status === "scheduled" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("held")}
            className="hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Mark held
          </button>
        ) : null}

        {session.status === "scheduled" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("cancelled")}
            className="hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}

        {session.status === "cancelled" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("scheduled")}
            className="hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Re-open
          </button>
        ) : null}

        {session.status === "held" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("scheduled")}
            className="hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Re-open
          </button>
        ) : null}

        {isOwner ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  `Delete session "${session.topic}"? This permanently removes the row and any attendance records on it.`,
                )
              )
                return;
              setError(null);
              startTransition(async () => {
                const result = await deleteClassSessionAction(session.id);
                if (result.status === "error") setError(result.message);
              });
            }}
            className="hover:bg-muted hover:text-destructive rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Delete
          </button>
        ) : (
          <span>Authored by another faculty member.</span>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </li>
  );
}
