"use client";

import { useState, useTransition } from "react";

import { ROLE_LABEL, ROLE_ORDER } from "@/lib/admin/role-permissions";

import { setUserBatchAction, setUserDepartmentAction, setUserRoleAction } from "../actions";

export type DepartmentOption = {
  id: string;
  name: string;
};

export type BatchOption = {
  id: string;
  name: string;
  year_of_study: number | null;
};

/**
 * Inline editor for a profile's `role` and `department_id`. Two
 * independent dropdowns; each save is its own server action so a typo
 * in one doesn't roll back the other. Optimistic UI: revert if the
 * action returns an error.
 *
 * Setting role to admin/hod/faculty also keeps the legacy is_admin /
 * is_faculty boolean flags in sync (handled server-side in
 * setUserRoleAction); the existing approval-state badges on the page
 * therefore re-render correctly after a role flip.
 */
export function RoleAndDepartmentEditor({
  profileId,
  currentRole,
  currentDepartmentId,
  currentBatchId,
  departments,
  batches,
}: {
  profileId: string;
  currentRole: string;
  currentDepartmentId: string | null;
  currentBatchId: string | null;
  departments: DepartmentOption[];
  batches: BatchOption[];
}) {
  const [role, setRole] = useState(currentRole);
  const [departmentId, setDepartmentId] = useState<string | null>(currentDepartmentId);
  const [batchId, setBatchId] = useState<string | null>(currentBatchId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-label="Role and department"
      className="border-input flex flex-col gap-3 rounded-md border p-4"
    >
      <h2 className="font-heading text-lg font-medium">Role and department</h2>

      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground w-28">Role</span>
        <select
          value={role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            const prev = role;
            setRole(next);
            setError(null);
            startTransition(async () => {
              const result = await setUserRoleAction(profileId, next);
              if (result.status === "error") {
                setRole(prev);
                setError(result.message);
              }
            });
          }}
          className="border-input bg-background rounded-md border px-2 py-1 text-sm"
        >
          {ROLE_ORDER.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground w-28">Department</span>
        <select
          value={departmentId ?? ""}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value === "" ? null : e.target.value;
            const prev = departmentId;
            setDepartmentId(next);
            setError(null);
            startTransition(async () => {
              const result = await setUserDepartmentAction(profileId, next);
              if (result.status === "error") {
                setDepartmentId(prev);
                setError(result.message);
              }
            });
          }}
          className="border-input bg-background rounded-md border px-2 py-1 text-sm"
        >
          <option value="">— none —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground w-28">Batch</span>
        <select
          value={batchId ?? ""}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value === "" ? null : e.target.value;
            const prev = batchId;
            setBatchId(next);
            setError(null);
            startTransition(async () => {
              const result = await setUserBatchAction(profileId, next);
              if (result.status === "error") {
                setBatchId(prev);
                setError(result.message);
              }
            });
          }}
          className="border-input bg-background rounded-md border px-2 py-1 text-sm"
        >
          <option value="">— none —</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.year_of_study !== null ? ` (Year ${b.year_of_study})` : ""}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
      <p className="text-muted-foreground text-xs">
        Changes apply immediately. Setting role to admin / hod / faculty also flips the legacy
        is_admin / is_faculty flags so existing RLS policies stay in sync.
      </p>
    </section>
  );
}
