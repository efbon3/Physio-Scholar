"use client";

import { useState, useTransition } from "react";

import {
  approveAnnouncementAction,
  approveAssignmentAction,
  approveClassSessionAction,
  rejectAnnouncementAction,
  rejectAssignmentAction,
  rejectClassSessionAction,
  requestAnnouncementChangesAction,
  requestAssignmentChangesAction,
  requestClassSessionChangesAction,
} from "./actions";

/**
 * Per-row HOD decision bar. Three buttons (Approve, Request changes,
 * Reject) and a free-text comment box. Approve sends comment as
 * optional context (e.g. "great structure, looks good"); Request
 * changes + Reject require a comment so the faculty knows what to
 * fix or why the work was refused.
 *
 * `kind` selects which underlying server action gets called. Same
 * decision shape across both — the only thing that differs is the
 * table the action writes to + the audit-log action label.
 */
type Kind = "assignment" | "announcement" | "class_session";

export function DecisionBar({ id, kind }: { id: string; kind: Kind }) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const approve = async (text: string) => {
    if (kind === "assignment") return approveAssignmentAction(id, text);
    if (kind === "announcement") return approveAnnouncementAction(id, text);
    return approveClassSessionAction(id, text);
  };
  const requestChanges = async (text: string) => {
    if (kind === "assignment") return requestAssignmentChangesAction(id, text);
    if (kind === "announcement") return requestAnnouncementChangesAction(id, text);
    return requestClassSessionChangesAction(id, text);
  };
  const reject = async (text: string) => {
    if (kind === "assignment") return rejectAssignmentAction(id, text);
    if (kind === "announcement") return rejectAnnouncementAction(id, text);
    return rejectClassSessionAction(id, text);
  };

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
              const result = await approve(comment);
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
              const result = await requestChanges(comment);
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
              const result = await reject(comment);
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
