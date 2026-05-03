"use client";

import { useState, useTransition } from "react";

import { setGradeThresholdsAction } from "./actions";

type GradeThreshold = { label: string; min: number };

/**
 * Editable list of {label, min} grade cut-offs. Admin can add a row,
 * remove a row, or edit either field of an existing row, then save the
 * whole list as one action. Server sorts descending by min before
 * persist; we render in input order and don't auto-sort while the
 * admin is typing (re-sort on focus loss would be jumpy).
 */
export function GradeThresholdsForm({ initial }: { initial: GradeThreshold[] }) {
  const [rows, setRows] = useState<GradeThreshold[]>(
    initial.length > 0 ? initial : [{ label: "A", min: 85 }],
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setLabel(i: number, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, label: value } : r)));
  }
  function setMin(i: number, value: string) {
    const n = value.trim() === "" ? 0 : Number.parseInt(value, 10);
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, min: Number.isNaN(n) ? r.min : Math.max(0, Math.min(100, n)) } : r,
      ),
    );
  }
  function addRow() {
    setRows((prev) => [...prev, { label: "", min: 0 }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const cleaned = rows.map((r) => ({ label: r.label.trim(), min: r.min }));
        for (const r of cleaned) {
          if (r.label.length === 0) {
            setError("Every grade needs a label (e.g. A, B+).");
            return;
          }
          if (r.label.length > 8) {
            setError("Labels must be 8 characters or fewer.");
            return;
          }
          if (Number.isNaN(r.min) || r.min < 0 || r.min > 100) {
            setError("Each minimum must be 0-100.");
            return;
          }
        }
        if (cleaned.length === 0) {
          setError("At least one grade is required.");
          return;
        }
        const labels = new Set<string>();
        for (const r of cleaned) {
          if (labels.has(r.label.toLowerCase())) {
            setError(`Duplicate label "${r.label}".`);
            return;
          }
          labels.add(r.label.toLowerCase());
        }
        startTransition(async () => {
          const result = await setGradeThresholdsAction(cleaned);
          if (result.status === "error") {
            setError(result.message);
          } else {
            setSuccess("Saved.");
            setRows([...cleaned].sort((a, b) => b.min - a.min));
          }
        });
      }}
      className="flex flex-col gap-3 text-sm"
    >
      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={i}
            className="border-input flex flex-wrap items-center gap-2 rounded-md border p-2"
          >
            <label className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Label</span>
              <input
                type="text"
                value={r.label}
                onChange={(e) => setLabel(i, e.target.value)}
                disabled={pending}
                maxLength={8}
                className="border-input bg-background w-20 rounded-md border px-2 py-1 text-sm"
                aria-label={`Grade label ${i + 1}`}
              />
            </label>
            <label className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Min %</span>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={r.min}
                onChange={(e) => setMin(i, e.target.value)}
                disabled={pending}
                className="border-input bg-background w-24 rounded-md border px-2 py-1 text-sm"
                aria-label={`Grade ${r.label || i + 1} minimum`}
              />
            </label>
            <button
              type="button"
              disabled={pending || rows.length <= 1}
              onClick={() => removeRow(i)}
              className="text-muted-foreground hover:bg-muted hover:text-destructive ml-auto rounded-md border px-2 py-1 text-xs disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending || rows.length >= 10}
          onClick={addRow}
          className="text-muted-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
        >
          Add grade
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save grades"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-muted-foreground text-xs">{success}</p> : null}
    </form>
  );
}
