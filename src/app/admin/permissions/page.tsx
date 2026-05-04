import Link from "next/link";

import {
  ROLE_CAPABILITIES,
  ROLE_LABEL,
  ROLE_ORDER,
  rowHas,
  type Capability,
  type RolePermissionsRow,
  type Role,
} from "@/lib/admin/role-permissions";
import { createClient } from "@/lib/supabase/server";

import { PermissionToggle } from "./permission-toggle";

export const metadata = {
  title: "Permissions · Admin",
};

/**
 * Admin → role × capability matrix editor. Rows = capabilities (grouped
 * by area: Authoring / Approval / Records / Roster / Audit), columns =
 * roles (Student, Faculty, HOD, Admin). Each cell is a checkbox bound to
 * the corresponding flag column on `role_permissions`.
 *
 * Admin row is disabled and rendered as ✓ — admins always pass every
 * capability check at request time, so toggling those cells would be
 * misleading. The row exists in the DB for matrix completeness; this
 * page just doesn't expose its toggles.
 *
 * Every flip writes an audit-log entry via the server action.
 */
export default async function AdminPermissionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .order("role", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Permissions</h1>
        <p className="text-destructive mt-4 text-sm">
          Failed to load permission matrix: {error.message}
        </p>
      </main>
    );
  }

  const rowsByRole = new Map<Role, RolePermissionsRow>();
  for (const r of (data ?? []) as RolePermissionsRow[]) {
    if (ROLE_ORDER.includes(r.role as Role)) {
      rowsByRole.set(r.role as Role, r);
    }
  }

  const grouped = groupCapabilities(ROLE_CAPABILITIES);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground text-sm">
          Decide what each role can do platform-wide. Changes take effect on the next page load — no
          caching beyond Supabase&apos;s natural query layer. Admins always pass every flag, so
          their column is read-only.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="py-2 pr-4 text-left font-medium">Capability</th>
              {ROLE_ORDER.map((role) => (
                <th key={role} className="px-3 py-2 text-center font-medium tracking-wide">
                  {ROLE_LABEL[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map((g) => (
              <CapabilityGroup
                key={g.label}
                label={g.label}
                capabilities={g.capabilities}
                rowsByRole={rowsByRole}
              />
            ))}
          </tbody>
        </table>
      </div>

      <footer data-print="hide" className="border-border mt-8 border-t pt-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          ← Back to admin
        </Link>
      </footer>
    </main>
  );
}

function CapabilityGroup({
  label,
  capabilities,
  rowsByRole,
}: {
  label: string;
  capabilities: readonly Capability[];
  rowsByRole: Map<Role, RolePermissionsRow>;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={ROLE_ORDER.length + 1}
          className="text-muted-foreground bg-muted/40 pt-4 pb-1 text-xs font-semibold tracking-widest uppercase"
        >
          {label}
        </td>
      </tr>
      {capabilities.map((cap) => (
        <tr key={cap.key} className="border-border/60 border-b last:border-b-0">
          <td className="py-2 pr-4">
            <div className="flex flex-col">
              <span className="font-medium">{cap.label}</span>
              <span className="text-muted-foreground text-xs">{cap.description}</span>
            </div>
          </td>
          {ROLE_ORDER.map((role) => {
            const row = rowsByRole.get(role);
            const checked = row ? rowHas(row, cap.key) : false;
            return (
              <td key={role} className="px-3 py-2 text-center">
                <PermissionToggle
                  role={role}
                  capability={cap}
                  initial={checked}
                  disabled={role === "admin"}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

function groupCapabilities(
  caps: readonly Capability[],
): Array<{ label: Capability["group"]; capabilities: Capability[] }> {
  const order: Capability["group"][] = ["Authoring", "Approval", "Records", "Roster", "Audit"];
  return order.map((label) => ({
    label,
    capabilities: caps.filter((c) => c.group === label),
  }));
}
