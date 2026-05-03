"use server";

import { revalidatePath } from "next/cache";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

type AdminGuard =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; institutionId: string }
  | { ok: false; error: string };

/**
 * Admin-only: confirm the caller's session is bound to an admin profile
 * and return the Supabase server client + the caller's institution_id
 * (required for new department rows). Returns an error result for any
 * non-admin caller — defence in depth on top of the
 * departments_admin_write RLS policy.
 */
async function requireAdminClient(): Promise<AdminGuard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, institution_id")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { ok: false, error: "Only admins can manage departments." };
  if (!profile.institution_id) {
    return {
      ok: false,
      error: "Your admin profile is not linked to an institution. Set institution_id first.",
    };
  }
  return { ok: true, supabase, institutionId: profile.institution_id };
}

/** Create a department in the admin's institution. */
export async function createDepartmentAction(name: string): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Departments are unavailable in this environment." };
  }
  const trimmed = name.trim();
  if (trimmed.length < 1) return { status: "error", message: "Name is required." };
  if (trimmed.length > 100) return { status: "error", message: "Name is too long." };

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { data, error } = await guard.supabase
    .from("departments")
    .insert({ name: trimmed, institution_id: guard.institutionId })
    .select("id")
    .single();
  if (error) {
    return { status: "error", message: `Could not create: ${error.message}` };
  }

  await writeAuditEntry({
    action: "department_create",
    target_type: "departments",
    target_id: data.id,
    details: { name: trimmed },
  });

  revalidatePath("/admin/departments");
  return { status: "ok", id: data.id };
}

/** Re-name a department. */
export async function renameDepartmentAction(
  departmentId: string,
  name: string,
): Promise<ActionResult> {
  if (!UUID_RE.test(departmentId)) return { status: "error", message: "Invalid department id." };
  const trimmed = name.trim();
  if (trimmed.length < 1) return { status: "error", message: "Name is required." };
  if (trimmed.length > 100) return { status: "error", message: "Name is too long." };

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase
    .from("departments")
    .update({ name: trimmed })
    .eq("id", departmentId);
  if (error) return { status: "error", message: `Could not rename: ${error.message}` };

  await writeAuditEntry({
    action: "department_rename",
    target_type: "departments",
    target_id: departmentId,
    details: { name: trimmed },
  });

  revalidatePath("/admin/departments");
  return { status: "ok" };
}

/**
 * Set or clear a department's HOD. Caller must be admin. The target
 * user (if non-null) must be an existing profile in the same
 * institution — we let RLS enforce the institution match implicitly
 * by joining through institution_id, but check it explicitly here so
 * we can return a clean error.
 */
export async function setDepartmentHeadAction(
  departmentId: string,
  userId: string | null,
): Promise<ActionResult> {
  if (!UUID_RE.test(departmentId)) return { status: "error", message: "Invalid department id." };
  if (userId !== null && !UUID_RE.test(userId)) {
    return { status: "error", message: "Invalid user id." };
  }

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  if (userId !== null) {
    const { data: target } = await guard.supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", userId)
      .single();
    if (!target || target.institution_id !== guard.institutionId) {
      return {
        status: "error",
        message: "Selected user does not belong to your institution.",
      };
    }
  }

  const { error } = await guard.supabase
    .from("departments")
    .update({ head_user_id: userId })
    .eq("id", departmentId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "department_set_head",
    target_type: "departments",
    target_id: departmentId,
    details: { user_id: userId },
  });

  revalidatePath("/admin/departments");
  return { status: "ok" };
}

/**
 * Delete a department. Affiliated users keep their other profile data;
 * profiles.department_id is `on delete set null` from migration 20260513
 * so the unlink is automatic.
 */
export async function deleteDepartmentAction(departmentId: string): Promise<ActionResult> {
  if (!UUID_RE.test(departmentId)) return { status: "error", message: "Invalid department id." };

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase.from("departments").delete().eq("id", departmentId);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  await writeAuditEntry({
    action: "department_delete",
    target_type: "departments",
    target_id: departmentId,
    details: null,
  });

  revalidatePath("/admin/departments");
  return { status: "ok" };
}
