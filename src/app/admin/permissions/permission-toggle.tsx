"use client";

import { useState, useTransition } from "react";

import type { Capability, Role } from "@/lib/admin/role-permissions";

import { updateRolePermissionAction } from "./actions";

/**
 * Per-cell toggle in the role-permissions matrix. Optimistic UI: we
 * flip the local state on click and only revert if the server action
 * rejects (RLS refusal, network error). Admin-row cells are rendered
 * disabled — admins always pass every flag — so the click handler
 * is never wired for them.
 */
export function PermissionToggle({
  role,
  capability,
  initial,
  disabled,
}: {
  role: Role;
  capability: Capability;
  initial: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (disabled) {
    return (
      <span
        aria-label={`${capability.label} for ${role}: always on (admin)`}
        className="text-muted-foreground text-xs"
        title="Admins always pass every capability"
      >
        ✓
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          const prev = checked;
          setChecked(next);
          setError(null);
          startTransition(async () => {
            const result = await updateRolePermissionAction(role, capability.key, next);
            if (result.status === "error") {
              setChecked(prev);
              setError(result.message);
            }
          });
        }}
        aria-label={`${capability.label} for ${role}`}
        className="h-4 w-4 cursor-pointer disabled:opacity-50"
      />
      {error ? (
        <span role="alert" className="text-destructive text-[10px]">
          err
        </span>
      ) : null}
    </span>
  );
}
