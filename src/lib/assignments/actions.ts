"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Server actions for faculty-assigned homework (the
 * faculty_assignments table). RLS is the source of truth — these
 * actions just call .insert / .update / .delete and surface whatever
 * the policy stack returns. We do an explicit caller-is-faculty check
 * before insert because the failure-mode otherwise is a silent RLS
 * filter to zero rows, which presents to the user as a generic
 * "Couldn't save" rather than the actionable "you're not faculty".
 */
export type AssignmentResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const TITLE_SCHEMA = z.string().trim().min(1, "Title is required").max(200, "Title is too long");
const DESCRIPTION_SCHEMA = z
  .union([z.literal(""), z.string().max(2000, "Description is too long")])
  .transform((v) => (v === "" ? null : v));
const DUE_AT_SCHEMA = z
  .union([z.literal(""), z.string().datetime({ offset: true })])
  .transform((v) => (v === "" ? null : v));
const UUID_RE = /^[0-9a-f-]{36}$/i;
const TARGET_BATCH_IDS_SCHEMA = z
  .array(z.string().regex(UUID_RE, "Invalid batch id"))
  .max(50, "Too many target batches");
const MAX_MARKS_SCHEMA = z
  .union([z.literal(""), z.string()])
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(
    z.union([
      z.null(),
      z.number().positive("Max marks must be > 0").max(10000, "Max marks too large"),
    ]),
  );
const LINK_URL_SCHEMA = z
  .union([
    z.literal(""),
    z
      .string()
      .max(2000, "Link URL is too long")
      .regex(/^https?:\/\//i, "Link URL must start with http:// or https://"),
  ])
  .transform((v) => (v === "" ? null : v));

const createSchema = z.object({
  title: TITLE_SCHEMA,
  description: DESCRIPTION_SCHEMA,
  due_at: DUE_AT_SCHEMA,
  target_batch_ids: TARGET_BATCH_IDS_SCHEMA,
  max_marks: MAX_MARKS_SCHEMA,
  link_url: LINK_URL_SCHEMA,
});

const updateSchema = createSchema.extend({
  id: z.string().uuid("Invalid assignment id"),
});

function pickTargetBatchIds(formData: FormData): string[] {
  const raw = formData.getAll("target_batch_ids").map((v) => String(v));
  return Array.from(new Set(raw.filter((v) => v.length > 0)));
}

/**
 * Faculty creates a new assignment for their institution. The form
 * supplies title / description / due_at; faculty_id is pinned to the
 * caller and institution_id is read from the caller's profile so the
 * client can't mis-target.
 */
export async function createAssignmentAction(formData: FormData): Promise<AssignmentResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Assignments are unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_faculty, is_admin, institution_id")
    .eq("id", user.id)
    .single();
  if (!profile?.is_faculty && !profile?.is_admin) {
    return { status: "error", message: "Only faculty or admins can create assignments." };
  }
  if (!profile.institution_id) {
    return {
      status: "error",
      message: "Your profile is not linked to an institution.",
    };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    due_at: formData.get("due_at")?.toString() ?? "",
    target_batch_ids: pickTargetBatchIds(formData),
    max_marks: formData.get("max_marks")?.toString() ?? "",
    link_url: formData.get("link_url")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  // Phase B: new rows start as `draft`. Faculty submits explicitly via
  // submitAssignmentForReviewAction; HOD approves via the queue. Admin-
  // authored rows skip the queue (admin work doesn't need HOD sign-off,
  // and admins typically own the institution).
  const initialStatus = profile.is_admin ? "approved" : "draft";

  const { data, error } = await supabase
    .from("faculty_assignments")
    .insert({
      faculty_id: user.id,
      institution_id: profile.institution_id,
      title: parsed.data.title,
      description: parsed.data.description,
      due_at: parsed.data.due_at,
      target_batch_ids: parsed.data.target_batch_ids,
      max_marks: parsed.data.max_marks,
      link_url: parsed.data.link_url,
      status: initialStatus,
    })
    .select("id")
    .single();
  if (error) {
    return { status: "error", message: `Could not create: ${error.message}` };
  }

  revalidatePath("/faculty/assignments");
  revalidatePath("/today");
  return { status: "ok", id: data.id };
}

/**
 * Faculty action: move a draft (or changes_requested) row into the HOD
 * queue. Stamps submitted_at and clears any prior decision metadata so
 * the HOD sees a clean "fresh review" entry. Admins shouldn't reach
 * this path — their drafts skip the queue at create-time, but the
 * action is harmless if they do (RLS still gates).
 */
export async function submitAssignmentForReviewAction(
  assignmentId: string,
): Promise<AssignmentResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Assignments are unavailable in this environment." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(assignmentId)) {
    return { status: "error", message: "Invalid id." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  // Verify the row exists, belongs to caller, and is in a status the
  // workflow allows submitting from. RLS enforces ownership at write
  // time too; this read just makes the error message readable.
  const { data: row } = await supabase
    .from("faculty_assignments")
    .select("status, faculty_id")
    .eq("id", assignmentId)
    .single();
  if (!row || row.faculty_id !== user.id) {
    return { status: "error", message: "Not found, or not yours to submit." };
  }
  if (row.status !== "draft" && row.status !== "changes_requested") {
    return {
      status: "error",
      message: `Can't submit from status "${row.status}".`,
    };
  }

  const { error } = await supabase
    .from("faculty_assignments")
    .update({
      status: "pending_hod",
      submitted_at: new Date().toISOString(),
      decided_at: null,
      decided_by: null,
      decision_comment: null,
    })
    .eq("id", assignmentId);
  if (error) {
    return { status: "error", message: `Could not submit: ${error.message}` };
  }

  revalidatePath("/faculty/assignments");
  revalidatePath("/faculty/approvals");
  return { status: "ok", id: assignmentId };
}

/**
 * Update an existing assignment. RLS only lets the original faculty
 * (or admin) reach the row, so we don't need to re-check ownership
 * here — the .eq("id", id) UPDATE will simply filter to zero rows
 * for anyone else.
 */
export async function updateAssignmentAction(formData: FormData): Promise<AssignmentResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Assignments are unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const parsed = updateSchema.safeParse({
    id: formData.get("id")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    due_at: formData.get("due_at")?.toString() ?? "",
    target_batch_ids: pickTargetBatchIds(formData),
    max_marks: formData.get("max_marks")?.toString() ?? "",
    link_url: formData.get("link_url")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  const { error } = await supabase
    .from("faculty_assignments")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      due_at: parsed.data.due_at,
      target_batch_ids: parsed.data.target_batch_ids,
      max_marks: parsed.data.max_marks,
      link_url: parsed.data.link_url,
    })
    .eq("id", parsed.data.id);
  if (error) {
    return { status: "error", message: `Could not update: ${error.message}` };
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/today");
  return { status: "ok", id: parsed.data.id };
}

/**
 * Delete an assignment. Same RLS-trust posture as update: only the
 * owner faculty or admin can reach the row. A non-owner attempt
 * silently filters to zero rows.
 */
export async function deleteAssignmentAction(id: string): Promise<AssignmentResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Assignments are unavailable in this environment." };
  }
  if (!z.string().uuid().safeParse(id).success) {
    return { status: "error", message: "Invalid assignment id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase.from("faculty_assignments").delete().eq("id", id);
  if (error) {
    return { status: "error", message: `Could not delete: ${error.message}` };
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/today");
  return { status: "ok" };
}

// ───────────────────────────── marks ─────────────────────────────

const markRowSchema = z.object({
  student_id: z.string().regex(UUID_RE, "Invalid student id"),
  marks: z.union([z.literal(""), z.string()]),
});

const SAVE_MARKS_SCHEMA = z.object({
  assignment_id: z.string().regex(UUID_RE, "Invalid assignment id"),
  rows: z.array(markRowSchema).max(500, "Too many rows"),
});

/**
 * Save marks for one assignment as a batch upsert. The action checks
 * the assignment's max_marks and refuses any score that exceeds it
 * (UI also enforces this, belt-and-brace). Empty-string marks are
 * skipped — they leave existing rows untouched. Faculty who want to
 * un-score a student should delete the row, which RLS only lets
 * admins do; for now an empty string is a no-op.
 */
export async function saveAssignmentMarksAction(
  assignmentId: string,
  rows: Array<{ student_id: string; marks: string }>,
): Promise<AssignmentResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Marks unavailable in this environment." };
  }
  const parsed = SAVE_MARKS_SCHEMA.safeParse({ assignment_id: assignmentId, rows });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: assignment, error: aErr } = await supabase
    .from("faculty_assignments")
    .select("max_marks, status")
    .eq("id", parsed.data.assignment_id)
    .single();
  if (aErr || !assignment) {
    return { status: "error", message: "Assignment not found." };
  }
  if (assignment.max_marks === null) {
    return {
      status: "error",
      message: "This assignment isn't graded — set max_marks first.",
    };
  }
  const max = Number(assignment.max_marks);

  const cleaned = parsed.data.rows
    .map((r) => ({ student_id: r.student_id, marksRaw: r.marks.trim() }))
    .filter((r) => r.marksRaw.length > 0);
  for (const r of cleaned) {
    const n = Number(r.marksRaw);
    if (!Number.isFinite(n) || n < 0 || n > max) {
      return {
        status: "error",
        message: `Marks for one student is out of range (0..${max}).`,
      };
    }
  }

  if (cleaned.length === 0) {
    return { status: "ok", id: parsed.data.assignment_id };
  }

  const payload = cleaned.map((r) => ({
    assignment_id: parsed.data.assignment_id,
    student_id: r.student_id,
    marks: Number(r.marksRaw),
    graded_by: user.id,
    graded_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("assignment_marks")
    .upsert(payload, { onConflict: "assignment_id,student_id" });
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  revalidatePath(`/faculty/assignments/${parsed.data.assignment_id}/marks`);
  revalidatePath("/today");
  return { status: "ok", id: parsed.data.assignment_id };
}
