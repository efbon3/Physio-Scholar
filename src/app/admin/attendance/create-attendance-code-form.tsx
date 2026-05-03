"use client";

import { useState, useTransition } from "react";

import { createAttendanceCodeAction } from "./actions";

/**
 * Form to create a new attendance code. Three inputs: code (1-8 chars,
 * unique within institution), label (1-100 chars), counts toward total
 * (boolean). Clears on success and surfaces server error inline.
 */
export function CreateAttendanceCodeForm() {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [counts, setCounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createAttendanceCodeAction(code.trim(), label.trim(), counts);
          if (result.status === "error") {
            setError(result.message);
          } else {
            setCode("");
            setLabel("");
            setCounts(true);
          }
        });
      }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code (e.g. P)"
        disabled={pending}
        maxLength={8}
        className="border-input bg-background w-28 rounded-md border px-3 py-1.5 text-sm"
        aria-label="New code"
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (e.g. Present)"
        disabled={pending}
        maxLength={100}
        className="border-input bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
        aria-label="New code label"
      />
      <label className="text-muted-foreground flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={counts}
          onChange={(e) => setCounts(e.target.checked)}
          disabled={pending}
        />
        counts toward total
      </label>
      <button
        type="submit"
        disabled={pending || code.trim().length === 0 || label.trim().length === 0}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {error ? (
        <p role="alert" className="text-destructive w-full text-xs">
          {error}
        </p>
      ) : null}
    </form>
  );
}
