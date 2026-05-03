"use client";

import { useState, useTransition } from "react";

import { deleteAttendanceCodeAction, updateAttendanceCodeAction } from "./actions";

/**
 * One row in the attendance-codes list. Renders the immutable code,
 * an editable label, the counts-toward-total toggle, and a delete
 * button. The code itself is intentionally read-only after creation
 * because attendance_records reference it by string and a rename would
 * silently break old marks. To rename, delete the code and create a
 * new one (which will fail RLS-side delete if records reference it,
 * exactly the right behaviour).
 */
export function AttendanceCodeRow({
  id,
  code,
  label,
  countsTowardTotal,
}: {
  id: string;
  code: string;
  label: string;
  countsTowardTotal: boolean;
}) {
  const [draftLabel, setDraftLabel] = useState(label);
  const [counts, setCounts] = useState(countsTowardTotal);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(nextLabel: string, nextCounts: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await updateAttendanceCodeAction(id, nextLabel, nextCounts);
      if (result.status === "error") {
        setError(result.message);
        setDraftLabel(label);
        setCounts(countsTowardTotal);
      }
    });
  }

  return (
    <li className="border-input flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <span className="border-input bg-muted/40 inline-flex min-w-[3rem] items-center justify-center rounded-md border px-2 py-1 font-mono text-xs">
          {code}
        </span>
        <input
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          disabled={pending}
          maxLength={100}
          className="border-input bg-background min-w-[180px] flex-1 rounded-md border px-2 py-1 text-sm"
          aria-label={`${code} label`}
        />
        <button
          type="button"
          disabled={pending || draftLabel.trim() === label}
          onClick={() => save(draftLabel.trim(), counts)}
          className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
        >
          Save label
        </button>

        <label className="text-muted-foreground flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={counts}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked;
              setCounts(next);
              save(draftLabel.trim() || label, next);
            }}
          />
          counts toward total
        </label>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              `Delete code "${code}" (${label})? This will fail if any attendance records still use it. Re-mark those sessions first.`,
            )
          )
            return;
          setError(null);
          startTransition(async () => {
            const result = await deleteAttendanceCodeAction(id);
            if (result.status === "error") setError(result.message);
          });
        }}
        className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md border px-2 py-1 text-xs disabled:opacity-50"
      >
        Delete
      </button>

      {error ? (
        <p role="alert" className="text-destructive w-full text-xs">
          {error}
        </p>
      ) : null}
    </li>
  );
}
