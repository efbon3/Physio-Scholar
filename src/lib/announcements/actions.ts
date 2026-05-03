"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

/**
 * Faculty-side server actions for announcements (the announcements
 * table from migration 20260516). Mirrors the shape of
 * lib/assignments/actions.ts so faculty surfaces feel consistent
 * across the two publishables.
 *
 * Approval workflow: new rows from a non-admin caller default to
 * status='draft'. Faculty submit explicitly via
 * submitAnnouncementForReviewAction; HOD acts on the queue at
 * /faculty/approvals. Admins skip the queue (admin work doesn't need
 * HOD sign-off, same posture as assignments).
 */

export type AnnouncementResult =
  | { status: "ok"; id?: string }
  | { status: "error"; message: string };

const TITLE_SCHEMA = z.string().trim().min(1, "Title is required").max(200, "Title is too long");
const BODY_SCHEMA = z
  .union([z.literal(""), z.string().max(4000, "Body is too long")])
  .transform((v) => (v === "" ? null : v));
const UUID_RE = /^[0-9a-f-]{36}$/i;

const TARGET_BATCH_IDS_SCHEMA = z
  .array(z.string().regex(UUID_RE, "Invalid batch id"))
  .max(50, "Too many target batches");

const createSchema = z.object({
  title: TITLE_SCHEMA,
  body: BODY_SCHEMA,
  target_batch_ids: TARGET_BATCH_IDS_SCHEMA,
});

const updateSchema = createSchema.extend({
  id: z.string().regex(UUID_RE, "Invalid announcement id"),
});

/**
 * Parse the multi-select batch picker out of FormData. The form
 * sends one `target_batch_ids` entry per selected batch (HTML's
 * native multi-select shape); flatten + dedupe + filter empty
 * strings before passing through Zod.
 */
function pickTargetBatchIds(formData: FormData): string[] {
  const raw = formData.getAll("target_batch_ids").map((v) => String(v));
  return Array.from(new Set(raw.filter((v) => v.length > 0)));
}

/** Faculty creates a new announcement. */
export async function createAnnouncementAction(formData: FormData): Promise<AnnouncementResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Announcements are unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id, role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "student";
  const canAuthor = Boolean(
    profile?.is_faculty || profile?.is_admin || role === "hod" || role === "deo",
  );
  if (!canAuthor) {
    return {
      status: "error",
      message: "Only faculty, HODs, DEOs, or admins can create announcements.",
    };
  }
  if (!profile?.institution_id) {
    return { status: "error", message: "Your profile is not linked to an institution." };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    target_batch_ids: pickTargetBatchIds(formData),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  // Admin authors skip the workflow; non-admin authors land in draft.
  const initialStatus = profile.is_admin ? "approved" : "draft";

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      faculty_id: user.id,
      institution_id: profile.institution_id,
      title: parsed.data.title,
      body: parsed.data.body,
      target_batch_ids: parsed.data.target_batch_ids,
      status: initialStatus,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: `Could not create: ${error.message}` };

  revalidatePath("/faculty/announcements");
  revalidatePath("/today");
  return { status: "ok", id: data.id };
}

/** Edit an existing announcement (own draft / pending / etc). */
export async function updateAnnouncementAction(formData: FormData): Promise<AnnouncementResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Announcements are unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const parsed = updateSchema.safeParse({
    id: formData.get("id")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    target_batch_ids: pickTargetBatchIds(formData),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  // The DB-level re-review trigger snaps approved rows back to
  // pending_hod when title / body / target_batch_ids change for a
  // non-admin caller, so we don't need to manage that here.
  const { error } = await supabase
    .from("announcements")
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      target_batch_ids: parsed.data.target_batch_ids,
    })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: `Could not update: ${error.message}` };

  revalidatePath("/faculty/announcements");
  revalidatePath("/today");
  return { status: "ok", id: parsed.data.id };
}

/** Submit a draft (or changes_requested) row into the HOD queue. */
export async function submitAnnouncementForReviewAction(
  announcementId: string,
): Promise<AnnouncementResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Announcements are unavailable in this environment." };
  }
  if (!UUID_RE.test(announcementId)) {
    return { status: "error", message: "Invalid id." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: row } = await supabase
    .from("announcements")
    .select("status, faculty_id")
    .eq("id", announcementId)
    .single();
  if (!row || row.faculty_id !== user.id) {
    return { status: "error", message: "Not found, or not yours to submit." };
  }
  if (row.status !== "draft" && row.status !== "changes_requested") {
    return { status: "error", message: `Can't submit from status "${row.status}".` };
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      status: "pending_hod",
      submitted_at: new Date().toISOString(),
      decided_at: null,
      decided_by: null,
      decision_comment: null,
    })
    .eq("id", announcementId);
  if (error) return { status: "error", message: `Could not submit: ${error.message}` };

  revalidatePath("/faculty/announcements");
  revalidatePath("/faculty/approvals");
  return { status: "ok", id: announcementId };
}

/** Delete an announcement. RLS limits this to the owner or admin. */
export async function deleteAnnouncementAction(
  announcementId: string,
): Promise<AnnouncementResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Announcements are unavailable in this environment." };
  }
  if (!UUID_RE.test(announcementId)) {
    return { status: "error", message: "Invalid id." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  void writeAuditEntry({
    action: "announcement.delete",
    target_type: "announcement",
    target_id: announcementId,
    details: {},
  });

  revalidatePath("/faculty/announcements");
  revalidatePath("/today");
  return { status: "ok" };
}
