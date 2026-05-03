"use client";

import { useState, useTransition } from "react";

import { setAttendanceThresholdAction } from "./actions";

/**
 * Single-input form to set the attendance threshold. UI accepts a
 * percentage 1-100; the action stores 0..1 (the migration's check
 * constraint matches that range). The mid-form scaling keeps the
 * faculty-facing language ("75%") consistent with what admins see
 * here.
 */
export function AttendanceThresholdForm({ initial }: { initial: number }) {
  const [percent, setPercent] = useState(String(Math.round(initial * 100)));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const pct = Number.parseInt(percent, 10);
        if (Number.isNaN(pct) || pct < 1 || pct > 100) {
          setError("Threshold must be 1-100%.");
          return;
        }
        startTransition(async () => {
          const result = await setAttendanceThresholdAction(pct / 100);
          if (result.status === "error") {
            setError(result.message);
          } else {
            setSuccess("Saved.");
          }
        });
      }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <label className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={100}
          step={1}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          disabled={pending}
          className="border-input bg-background w-24 rounded-md border px-2 py-1 text-sm"
          aria-label="Attendance threshold percent"
        />
        <span className="text-muted-foreground">%</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {error ? (
        <p role="alert" className="text-destructive w-full text-xs">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-muted-foreground w-full text-xs">{success}</p> : null}
    </form>
  );
}
