"use client";

import { useState, useTransition } from "react";

import { createDepartmentAction } from "./actions";

/**
 * Single-input form to create a new department in the admin's
 * institution. Optimistically clears the input on success; surfaces
 * the server-action error inline if it fails.
 */
export function CreateDepartmentForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createDepartmentAction(name);
          if (result.status === "error") {
            setError(result.message);
          } else {
            setName("");
          }
        });
      }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Department name (e.g. Physiology)"
        disabled={pending}
        className="border-input bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
        aria-label="New department name"
        maxLength={100}
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
