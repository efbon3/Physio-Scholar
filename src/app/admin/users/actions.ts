"use server";

import { revalidatePath } from "next/cache";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export type ApprovalResult = { status: "ok" } | { status: "error"; message: string };

/**
 * Admin: approve a user. Sets profiles.approved_at = now() and
 * approved_by = current admin id. Idempotent — re-approving an
 * already-approved user is a no-op (the WHERE clause filters them out).
 *
 * RLS allows admins to update any profile via profiles_update_admin_approval
 * (added in 20260504 migration). Non-admins calling this action will
 * be blocked at the policy level even if they reach this code path.
 */
export async function approveUserAction(targetProfileId: string): Promise<ApprovalResult> {
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

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({ approved_at: now, approved_by: user.id })
    .eq("id", targetProfileId)
    .is("approved_at", null);

  if (error) {
    return { status: "error", message: `Failed to approve: ${error.message}` };
  }

  // Best-effort audit entry — never blocks the approval if logging
  // misfires (e.g. audit table not yet migrated in this env).
  void writeAuditEntry({
    action: "user.approve",
    target_type: "profile",
    target_id: targetProfileId,
    details: { approved_at: now },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/users/pending");
  return { status: "ok" };
}

/**
 * Admin: revoke approval. Sets approved_at and approved_by to NULL.
 * The user immediately drops back into the pending-approval gate on
 * their next request.
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

  const { error } = await supabase
    .from("profiles")
    .update({ approved_at: null, approved_by: null })
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
