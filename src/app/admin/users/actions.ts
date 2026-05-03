"use server";

import { revalidatePath } from "next/cache";

import { writeAuditEntry } from "@/lib/admin/audit";
import { type RequestedRole } from "@/lib/auth/requested-role";
import { createClient } from "@/lib/supabase/server";

export type ApprovalResult = { status: "ok" } | { status: "error"; message: string };

/**
 * Admin: approve a user, optionally granting them the role they
 * requested at signup. Sets approved_at, approved_by, and (when
 * `grantRole` is "faculty" or "admin") the matching is_faculty /
 * is_admin flag. Idempotent — re-approving is a no-op on approved_at,
 * but the role flag is always updated so an admin can promote a
 * learner who was approved as student earlier.
 *
 * Authorisation: the caller's session has to belong to an admin. We
 * check is_admin explicitly here rather than relying on RLS alone
 * because the column-lock trigger from 20260506 requires an admin
 * session for is_admin / is_faculty writes. Non-admins reaching this
 * code path would have their is_faculty/is_admin write silently
 * snapped back to OLD by the trigger — better to fail loudly.
 */
export async function approveUserAction(
  targetProfileId: string,
  grantRole: RequestedRole = "student",
): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Approval is unavailable in this environment." };
  }
  if (!targetProfileId) {
    return { status: "error", message: "Missing target profile." };
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
    return { status: "error", message: "Only admins can approve users." };
  }

  const now = new Date().toISOString();
  // Approving also clears any prior rejection — the two states are
  // mutually exclusive. If an admin approves a previously-rejected
  // user, the rejection record is cleared from the row (audit log
  // still has it) so the gate stops sending them to /access-denied.
  const updates: {
    approved_at: string;
    approved_by: string;
    rejected_at: null;
    rejected_by: null;
    rejection_reason: null;
    is_faculty?: boolean;
    is_admin?: boolean;
  } = {
    approved_at: now,
    approved_by: user.id,
    rejected_at: null,
    rejected_by: null,
    rejection_reason: null,
  };
  if (grantRole === "faculty") {
    updates.is_faculty = true;
  } else if (grantRole === "admin") {
    // Granting admin needs an explicit, separate decision — we set both
    // flags so admins can also do faculty things by default.
    updates.is_admin = true;
    updates.is_faculty = true;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Failed to approve: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.approve",
    target_type: "profile",
    target_id: targetProfileId,
    details: { approved_at: now, granted_role: grantRole },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}

/**
 * Admin: reject a sign-up request. Stamps rejected_at, rejected_by,
 * the optional reason, and clears approved_at + role flags so a user
 * who was approved earlier and is now being rejected drops back out
 * of admin / faculty surfaces.
 *
 * The rejected user keeps their session but the (app) layout's gate
 * routes them to /access-denied (the terminal page) on every request.
 *
 * `reason` is optional; if provided, it's shown to the user on
 * /access-denied. Passing null clears any previous reason.
 */
export async function rejectUserAction(
  targetProfileId: string,
  reason?: string | null,
): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Rejection is unavailable in this environment." };
  }
  if (!targetProfileId) {
    return { status: "error", message: "Missing target profile." };
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
    return { status: "error", message: "Only admins can reject users." };
  }

  if (targetProfileId === user.id) {
    return { status: "error", message: "You cannot reject your own account." };
  }

  const trimmedReason = typeof reason === "string" ? reason.trim().slice(0, 500) : null;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      rejected_at: now,
      rejected_by: user.id,
      rejection_reason: trimmedReason && trimmedReason.length > 0 ? trimmedReason : null,
      // Mutually exclusive with approval — clear any prior approval
      // state so a previously-approved admin can't bypass the gate
      // via is_admin while their row also says rejected_at.
      approved_at: null,
      approved_by: null,
      is_admin: false,
      is_faculty: false,
    })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Failed to reject: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.reject",
    target_type: "profile",
    target_id: targetProfileId,
    details: { rejected_at: now, reason: trimmedReason },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}

/**
 * Admin: undo a rejection. Clears rejected_at / rejected_by /
 * rejection_reason so the user drops back into the pending queue.
 * They DON'T get auto-approved — the admin still has to click
 * Approve. This is intentional: unrejecting and approving are two
 * separate decisions.
 */
export async function unrejectUserAction(targetProfileId: string): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Unreject is unavailable in this environment." };
  }
  if (!targetProfileId) {
    return { status: "error", message: "Missing target profile." };
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
    return { status: "error", message: "Only admins can unreject users." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
    })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Failed to unreject: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.unreject",
    target_type: "profile",
    target_id: targetProfileId,
    details: {},
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}

/**
 * Admin: revoke approval. Clears approved_at, approved_by, and any
 * granted role flags. Done together so a previously-approved admin
 * doesn't keep their is_admin bypass after revocation — the admin
 * gate trusts is_admin, so leaving it set would defeat the revoke.
 *
 * Authorisation: caller must be an admin. The column-lock trigger
 * also blocks non-admin writes to these flags, but failing here gives
 * a clean error message instead of a silent no-op.
 */
export async function revokeApprovalAction(targetProfileId: string): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Revocation is unavailable in this environment." };
  }
  if (!targetProfileId) {
    return { status: "error", message: "Missing target profile." };
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
    return { status: "error", message: "Only admins can revoke approval." };
  }

  // An admin shouldn't be able to revoke their own approval — that
  // would leave the platform without an admin if they're the only one
  // and would silently lock them out next request.
  if (targetProfileId === user.id) {
    return { status: "error", message: "You cannot revoke your own approval." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      approved_at: null,
      approved_by: null,
      is_admin: false,
      is_faculty: false,
    })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Failed to revoke: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.revoke_approval",
    target_type: "profile",
    target_id: targetProfileId,
    details: {},
  });

  revalidatePath("/admin/users");
  return { status: "ok" };
}

const FACULTY_ROLES: ReadonlyArray<"student" | "faculty" | "hod" | "admin" | "deo"> = [
  "student",
  "faculty",
  "deo",
  "hod",
  "admin",
] as const;

const UUID_RE_FACULTY = /^[0-9a-f-]{36}$/i;

/**
 * Admin: change a user's canonical role (`student | faculty | hod |
 * admin`). Also keeps the legacy boolean flags in sync so existing RLS
 * policies that gate on `is_admin` / `is_faculty` keep working:
 *
 *   role='admin'   → is_admin=true,  is_faculty=true (admins do faculty things too)
 *   role='hod'     → is_admin=false, is_faculty=true (HOD inherits faculty's RLS)
 *   role='faculty' → is_admin=false, is_faculty=true
 *   role='student' → is_admin=false, is_faculty=false
 *
 * The caller must be admin. The target can't demote themselves out of
 * admin (a self-lockout is unrecoverable from the UI; another admin
 * has to do it).
 */
export async function setUserRoleAction(
  targetProfileId: string,
  role: string,
): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Role editing is unavailable in this environment." };
  }
  if (!UUID_RE_FACULTY.test(targetProfileId)) {
    return { status: "error", message: "Invalid target id." };
  }
  if (!FACULTY_ROLES.includes(role as (typeof FACULTY_ROLES)[number])) {
    return { status: "error", message: `Unknown role: ${role}.` };
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
    return { status: "error", message: "Only admins can set user roles." };
  }

  if (targetProfileId === user.id && role !== "admin") {
    return {
      status: "error",
      message: "You can't demote your own admin role from this UI — ask another admin to do it.",
    };
  }

  const isAdmin = role === "admin";
  const isFaculty = role === "admin" || role === "faculty" || role === "hod";

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      is_admin: isAdmin,
      is_faculty: isFaculty,
    })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Could not set role: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.set_role",
    target_type: "profile",
    target_id: targetProfileId,
    details: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}

/**
 * Admin: assign or clear a user's department. Pass `null` to unlink.
 * The target department (when non-null) must belong to the same
 * institution as the target user — checked here before the write.
 */
export async function setUserDepartmentAction(
  targetProfileId: string,
  departmentId: string | null,
): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Department assignment is unavailable here." };
  }
  if (!UUID_RE_FACULTY.test(targetProfileId)) {
    return { status: "error", message: "Invalid target id." };
  }
  if (departmentId !== null && !UUID_RE_FACULTY.test(departmentId)) {
    return { status: "error", message: "Invalid department id." };
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
    return { status: "error", message: "Only admins can assign departments." };
  }

  if (departmentId !== null) {
    const { data: target } = await supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", targetProfileId)
      .single();
    const { data: dept } = await supabase
      .from("departments")
      .select("institution_id")
      .eq("id", departmentId)
      .single();
    if (!target || !dept || target.institution_id !== dept.institution_id) {
      return {
        status: "error",
        message: "Department and user must share an institution.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ department_id: departmentId })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Could not save department: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.set_department",
    target_type: "profile",
    target_id: targetProfileId,
    details: { department_id: departmentId },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}

/**
 * Admin: assign or clear a user's batch. Pass `null` to unlink. The
 * target batch (when non-null) must belong to the same institution
 * as the target user — checked here before the write.
 */
export async function setUserBatchAction(
  targetProfileId: string,
  batchId: string | null,
): Promise<ApprovalResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Batch assignment is unavailable here." };
  }
  if (!UUID_RE_FACULTY.test(targetProfileId)) {
    return { status: "error", message: "Invalid target id." };
  }
  if (batchId !== null && !UUID_RE_FACULTY.test(batchId)) {
    return { status: "error", message: "Invalid batch id." };
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
    return { status: "error", message: "Only admins can assign batches." };
  }

  if (batchId !== null) {
    const { data: target } = await supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", targetProfileId)
      .single();
    const { data: batch } = await supabase
      .from("batches")
      .select("institution_id")
      .eq("id", batchId)
      .single();
    if (!target || !batch || target.institution_id !== batch.institution_id) {
      return {
        status: "error",
        message: "Batch and user must share an institution.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ batch_id: batchId })
    .eq("id", targetProfileId);

  if (error) {
    return { status: "error", message: `Could not save batch: ${error.message}` };
  }

  void writeAuditEntry({
    action: "user.set_batch",
    target_type: "profile",
    target_id: targetProfileId,
    details: { batch_id: batchId },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetProfileId}`);
  return { status: "ok" };
}
