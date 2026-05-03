"use server";

import { revalidatePath } from "next/cache";

import { writeAuditEntry } from "@/lib/admin/audit";
import { ROLE_CAPABILITIES, type Role } from "@/lib/admin/role-permissions";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { status: "ok" } | { status: "error"; message: string };

const ROLES: readonly Role[] = ["student", "faculty", "hod", "admin"] as const;
const FLAG_KEYS = new Set<string>(ROLE_CAPABILITIES.map((c) => c.key as string));

/**
 * Admin: flip a single capability flag for a role on the
 * `role_permissions` table. RLS additionally requires the caller's
 * profile.is_admin = true; this server action mirrors that check
 * client-side so we can return a clean error message if a non-admin
 * somehow reaches the action.
 */
export async function updateRolePermissionAction(
  role: string,
  capability: string,
  value: boolean,
): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Permissions are unavailable in this environment." };
  }
  if (!ROLES.includes(role as Role)) {
    return { status: "error", message: `Unknown role: ${role}.` };
  }
  if (!FLAG_KEYS.has(capability)) {
    return { status: "error", message: `Unknown capability: ${capability}.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!callerProfile?.is_admin) {
    return { status: "error", message: "Only admins can edit role permissions." };
  }

  // Update the single flag column on the role row. The DB-level write
  // is gated by the role_permissions_admin_write RLS policy from the
  // 20260513 migration; this is a defence-in-depth mirror.
  const updates = { [capability]: value } as TablesUpdate<"role_permissions">;
  const { error } = await supabase.from("role_permissions").update(updates).eq("role", role);
  if (error) {
    return { status: "error", message: `Could not update permission: ${error.message}` };
  }

  await writeAuditEntry({
    action: "permission_flip",
    target_type: "role_permissions",
    target_id: role,
    details: { capability, value },
  });

  revalidatePath("/admin/permissions");
  return { status: "ok" };
}
