"use client";

import { useState, useTransition } from "react";

import { deleteBatchAction, renameBatchAction, setBatchYearAction } from "./actions";

/**
 * One row in the batches list. Three editable affordances:
 *   - Rename inline (text input + Save)
 *   - Year of study dropdown (— / 1 / 2 / 3 / 4 / 5)
 *   - Delete (with confirmation)
 *
 * Each action is its own server-action call so a mistake in one
 * field doesn't cascade.
 */
export function BatchRow({
  id,
  name,
  yearOfStudy,
  memberCount,
}: {
  id: string;
  name: string;
  yearOfStudy: number | null;
  memberCount: number;
}) {
  const [draftName, setDraftName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li className="border-input flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          disabled={pending}
          className="border-input bg-background min-w-[200px] flex-1 rounded-md border px-2 py-1 text-sm"
          aria-label={`${name} name`}
        />
        <button
          type="button"
          disabled={pending || draftName.trim() === name}
          onClick={() => {
            const next = draftName.trim();
            setError(null);
            startTransition(async () => {
              const result = await renameBatchAction(id, next);
              if (result.status === "error") {
                setError(result.message);
                setDraftName(name);
              }
            });
          }}
          className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-1 text-xs disabled:opacity-50"
        >
          Rename
        </button>

        <label className="text-muted-foreground flex items-center gap-1 text-xs">
          Year
          <select
            defaultValue={yearOfStudy ?? ""}
            disabled={pending}
            onChange={(e) => {
              const value = e.target.value === "" ? null : Number.parseInt(e.target.value, 10);
              setError(null);
              startTransition(async () => {
                const result = await setBatchYearAction(id, value);
                if (result.status === "error") setError(result.message);
              });
            }}
            className="border-input bg-background ml-1 rounded-md border px-2 py-1 text-sm"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <span className="text-muted-foreground text-xs">
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </span>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              `Delete batch "${name}"? Affiliated students will be unlinked; assignments / announcements that targeted this batch keep the dead id in their target list (harmless, just stops matching).`,
            )
          )
            return;
          setError(null);
          startTransition(async () => {
            const result = await deleteBatchAction(id);
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
