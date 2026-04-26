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
  const updates: {
    approved_at: string;
    approved_by: string;
    is_faculty?: boolean;
    is_admin?: boolean;
  } = { approved_at: now, approved_by: user.id };
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
