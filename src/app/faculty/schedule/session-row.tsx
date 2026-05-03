"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  deleteClassSessionAction,
  setClassSessionStatusAction,
  submitClassSessionForReviewAction,
} from "@/lib/schedule/actions";

import type { ScheduleBatchOption } from "./session-form";

export type SessionRecord = {
  id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "held" | "cancelled";
  approval_status: "draft" | "pending_hod" | "approved" | "rejected" | "changes_requested";
  decision_comment: string | null;
  created_at: string;
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

const APPROVAL_LABEL: Record<SessionRecord["approval_status"], string> = {
  draft: "Draft",
  pending_hod: "Pending HOD",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

const APPROVAL_TONE: Record<SessionRecord["approval_status"], string> = {
  draft: "border-input bg-muted text-muted-foreground",
  pending_hod: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-rose-300 bg-rose-50 text-rose-900",
  changes_requested: "border-amber-300 bg-amber-50 text-amber-900",
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
          className={`rounded-full border px-2 py-0.5 text-xs ${APPROVAL_TONE[session.approval_status]}`}
          aria-label={`Approval: ${APPROVAL_LABEL[session.approval_status]}`}
        >
          {APPROVAL_LABEL[session.approval_status]}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[session.status]}`}
          aria-label={`Lifecycle: ${STATUS_LABEL[session.status]}`}
        >
          {STATUS_LABEL[session.status]}
        </span>
      </div>
      <p className="text-muted-foreground text-[10px]">
        Posted {new Date(session.created_at).toLocaleString()}
      </p>
      {session.decision_comment &&
      (session.approval_status === "rejected" ||
        session.approval_status === "changes_requested") ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">HOD note</p>
          <p className="mt-1 whitespace-pre-wrap">{session.decision_comment}</p>
        </div>
      ) : null}
      {session.notes ? <p className="text-sm whitespace-pre-wrap">{session.notes}</p> : null}

      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        <Link
          href={`/faculty/schedule/${session.id}/attendance`}
          className="text-primary underline-offset-2 hover:underline"
        >
          Take attendance →
        </Link>

        {isOwner &&
        (session.approval_status === "draft" || session.approval_status === "changes_requested") ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await submitClassSessionForReviewAction(session.id);
                if (result.status === "error") setError(result.message);
              });
            }}
            className="hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
          >
            Submit for review
          </button>
        ) : null}

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
