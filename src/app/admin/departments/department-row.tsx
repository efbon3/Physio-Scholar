"use client";

import { useState, useTransition } from "react";

import { deleteDepartmentAction, renameDepartmentAction, setDepartmentHeadAction } from "./actions";

export type EligibleHead = {
  id: string;
  full_name: string | null;
  role: string;
};

/**
 * One row in the departments list. Three editable affordances:
 *   - Rename inline (text input + Save)
 *   - HOD picker (dropdown of role='hod' or 'faculty' users in the same
 *     institution; "— none —" clears the head)
 *   - Delete (with confirmation)
 *
 * Each action is a separate server-action call so a mistake in one
 * field doesn't cascade.
 */
export function DepartmentRow({
  id,
  name,
  headUserId,
  eligibleHeads,
}: {
  id: string;
  name: string;
  headUserId: string | null;
  eligibleHeads: EligibleHead[];
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
          className="border-input bg-background min-w-[180px] flex-1 rounded-md border px-2 py-1 text-sm"
          aria-label={`${name} name`}
        />
        <button
          type="button"
          disabled={pending || draftName.trim() === name}
          onClick={() => {
            const next = draftName.trim();
            setError(null);
            startTransition(async () => {
              const result = await renameDepartmentAction(id, next);
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
          HOD
          <select
            defaultValue={headUserId ?? ""}
            disabled={pending}
            onChange={(e) => {
              const value = e.target.value === "" ? null : e.target.value;
              setError(null);
              startTransition(async () => {
                const result = await setDepartmentHeadAction(id, value);
                if (result.status === "error") setError(result.message);
              });
            }}
            className="border-input bg-background ml-1 rounded-md border px-2 py-1 text-sm"
          >
            <option value="">— none —</option>
            {eligibleHeads.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name ?? "(no name)"} · {u.role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete department "${name}"? Affiliated users will be unlinked.`)) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteDepartmentAction(id);
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
