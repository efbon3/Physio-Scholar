"use server";

import { revalidatePath } from "next/cache";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export type DecisionResult = { status: "ok" } | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

type ApproverGuard =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; actorId: string }
  | { ok: false; error: string };

/**
 * HOD / admin guard. Faculty can submit but not approve their own
 * work; this server action set is the approval surface only.
 */
async function requireApprover(): Promise<ApproverGuard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  if (!profile?.is_admin && role !== "hod") {
    return { ok: false, error: "Only HOD or admin can approve publishables." };
  }
  return { ok: true, supabase, actorId: user.id };
}

/** Approve a faculty_assignments row. */
export async function approveAssignmentAction(
  assignmentId: string,
  comment?: string | null,
): Promise<DecisionResult> {
  if (!UUID_RE.test(assignmentId)) return { status: "error", message: "Invalid id." };
  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const trimmed = typeof comment === "string" ? comment.trim().slice(0, 1000) : "";
  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("faculty_assignments")
    .update({
      status: "approved",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed.length > 0 ? trimmed : null,
    })
    .eq("id", assignmentId);
  if (error) return { status: "error", message: `Could not approve: ${error.message}` };

  await writeAuditEntry({
    action: "assignment_approve",
    target_type: "faculty_assignments",
    target_id: assignmentId,
    details: { comment: trimmed || null },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/assignments");
  revalidatePath("/today");
  return { status: "ok" };
}

/** Reject a faculty_assignments row. Comment is required (the reason). */
export async function rejectAssignmentAction(
  assignmentId: string,
  comment: string,
): Promise<DecisionResult> {
  if (!UUID_RE.test(assignmentId)) return { status: "error", message: "Invalid id." };
  const trimmed = comment.trim();
  if (trimmed.length < 1) return { status: "error", message: "A reason is required." };
  if (trimmed.length > 1000) return { status: "error", message: "Reason is too long." };

  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("faculty_assignments")
    .update({
      status: "rejected",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed,
    })
    .eq("id", assignmentId);
  if (error) return { status: "error", message: `Could not reject: ${error.message}` };

  await writeAuditEntry({
    action: "assignment_reject",
    target_type: "faculty_assignments",
    target_id: assignmentId,
    details: { comment: trimmed },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/assignments");
  return { status: "ok" };
}

/** Send an assignment back to the faculty for revisions. Comment required. */
export async function requestAssignmentChangesAction(
  assignmentId: string,
  comment: string,
): Promise<DecisionResult> {
  if (!UUID_RE.test(assignmentId)) return { status: "error", message: "Invalid id." };
  const trimmed = comment.trim();
  if (trimmed.length < 1) return { status: "error", message: "Tell the faculty what to change." };
  if (trimmed.length > 1000) return { status: "error", message: "Comment is too long." };

  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("faculty_assignments")
    .update({
      status: "changes_requested",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed,
    })
    .eq("id", assignmentId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "assignment_request_changes",
    target_type: "faculty_assignments",
    target_id: assignmentId,
    details: { comment: trimmed },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/assignments");
  return { status: "ok" };
}

// ─────────────────────────── announcements ───────────────────────────

/** Approve an announcement. */
export async function approveAnnouncementAction(
  announcementId: string,
  comment?: string | null,
): Promise<DecisionResult> {
  if (!UUID_RE.test(announcementId)) return { status: "error", message: "Invalid id." };
  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const trimmed = typeof comment === "string" ? comment.trim().slice(0, 1000) : "";
  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("announcements")
    .update({
      status: "approved",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed.length > 0 ? trimmed : null,
    })
    .eq("id", announcementId);
  if (error) return { status: "error", message: `Could not approve: ${error.message}` };

  await writeAuditEntry({
    action: "announcement_approve",
    target_type: "announcements",
    target_id: announcementId,
    details: { comment: trimmed || null },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/announcements");
  revalidatePath("/today");
  return { status: "ok" };
}

/** Reject an announcement. Comment required. */
export async function rejectAnnouncementAction(
  announcementId: string,
  comment: string,
): Promise<DecisionResult> {
  if (!UUID_RE.test(announcementId)) return { status: "error", message: "Invalid id." };
  const trimmed = comment.trim();
  if (trimmed.length < 1) return { status: "error", message: "A reason is required." };
  if (trimmed.length > 1000) return { status: "error", message: "Reason is too long." };

  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("announcements")
    .update({
      status: "rejected",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed,
    })
    .eq("id", announcementId);
  if (error) return { status: "error", message: `Could not reject: ${error.message}` };

  await writeAuditEntry({
    action: "announcement_reject",
    target_type: "announcements",
    target_id: announcementId,
    details: { comment: trimmed },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/announcements");
  return { status: "ok" };
}

/** Send an announcement back to faculty for revisions. Comment required. */
export async function requestAnnouncementChangesAction(
  announcementId: string,
  comment: string,
): Promise<DecisionResult> {
  if (!UUID_RE.test(announcementId)) return { status: "error", message: "Invalid id." };
  const trimmed = comment.trim();
  if (trimmed.length < 1) return { status: "error", message: "Tell the faculty what to change." };
  if (trimmed.length > 1000) return { status: "error", message: "Comment is too long." };

  const guard = await requireApprover();
  if (!guard.ok) return { status: "error", message: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("announcements")
    .update({
      status: "changes_requested",
      decided_at: now,
      decided_by: guard.actorId,
      decision_comment: trimmed,
    })
    .eq("id", announcementId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "announcement_request_changes",
    target_type: "announcements",
    target_id: announcementId,
    details: { comment: trimmed },
  });

  revalidatePath("/faculty/approvals");
  revalidatePath("/faculty/announcements");
  return { status: "ok" };
}
