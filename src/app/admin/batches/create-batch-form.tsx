"use client";

import { useState, useTransition } from "react";

import { createBatchAction } from "./actions";

/**
 * Two-input form to create a new batch in the admin's institution.
 * Name (required) + year of study (optional, 1-5). Optimistically
 * clears both inputs on success; surfaces server-action error inline.
 */
export function CreateBatchForm() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const yearNum = year.trim() === "" ? null : Number.parseInt(year, 10);
        if (yearNum !== null && (Number.isNaN(yearNum) || yearNum < 1 || yearNum > 5)) {
          setError("Year of study must be 1-5 (or blank).");
          return;
        }
        startTransition(async () => {
          const result = await createBatchAction(name, yearNum);
          if (result.status === "error") {
            setError(result.message);
          } else {
            setName("");
            setYear("");
          }
        });
      }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Batch name (e.g. MBBS 2025-26 First-Year-A)"
        disabled={pending}
        className="border-input bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
        aria-label="New batch name"
        maxLength={100}
      />
      <input
        type="number"
        min={1}
        max={5}
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Year (1-5)"
        disabled={pending}
        className="border-input bg-background w-32 rounded-md border px-3 py-1.5 text-sm"
        aria-label="Year of study"
      />
      <button
        type="submit"
        disabled={pending || name.trim().length === 0}
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
