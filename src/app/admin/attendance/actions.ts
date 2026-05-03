"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

type AdminGuard =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; institutionId: string }
  | { ok: false; error: string };

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
  if (!profile?.is_admin) return { ok: false, error: "Only admins can edit attendance settings." };
  if (!profile.institution_id) {
    return { ok: false, error: "Your admin profile is not linked to an institution." };
  }
  return { ok: true, supabase, institutionId: profile.institution_id };
}

// ───────────────────────────── attendance_codes ─────────────────────────────

const codeSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(8, "Code is too long"),
  label: z.string().trim().min(1, "Label is required").max(100, "Label is too long"),
  counts_toward_total: z.boolean(),
});

export async function createAttendanceCodeAction(
  code: string,
  label: string,
  countsTowardTotal: boolean,
): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Settings unavailable in this environment." };
  }
  const parsed = codeSchema.safeParse({ code, label, counts_toward_total: countsTowardTotal });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { data, error } = await guard.supabase
    .from("attendance_codes")
    .insert({
      institution_id: guard.institutionId,
      code: parsed.data.code,
      label: parsed.data.label,
      counts_toward_total: parsed.data.counts_toward_total,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: `Could not create: ${error.message}` };

  await writeAuditEntry({
    action: "attendance_code_create",
    target_type: "attendance_codes",
    target_id: data.id,
    details: { ...parsed.data },
  });
  revalidatePath("/admin/attendance");
  return { status: "ok", id: data.id };
}

export async function updateAttendanceCodeAction(
  codeId: string,
  label: string,
  countsTowardTotal: boolean,
): Promise<ActionResult> {
  if (!UUID_RE.test(codeId)) return { status: "error", message: "Invalid id." };
  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };
  const labelTrimmed = label.trim();
  if (labelTrimmed.length < 1 || labelTrimmed.length > 100) {
    return { status: "error", message: "Label must be 1-100 characters." };
  }

  const { error } = await guard.supabase
    .from("attendance_codes")
    .update({ label: labelTrimmed, counts_toward_total: countsTowardTotal })
    .eq("id", codeId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "attendance_code_update",
    target_type: "attendance_codes",
    target_id: codeId,
    details: { label: labelTrimmed, counts_toward_total: countsTowardTotal },
  });
  revalidatePath("/admin/attendance");
  return { status: "ok" };
}

export async function deleteAttendanceCodeAction(codeId: string): Promise<ActionResult> {
  if (!UUID_RE.test(codeId)) return { status: "error", message: "Invalid id." };
  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase.from("attendance_codes").delete().eq("id", codeId);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  await writeAuditEntry({
    action: "attendance_code_delete",
    target_type: "attendance_codes",
    target_id: codeId,
    details: null,
  });
  revalidatePath("/admin/attendance");
  return { status: "ok" };
}

// ───────────────────────────── institution settings ─────────────────────────────

const thresholdSchema = z
  .number()
  .min(0.01, "Threshold must be > 0")
  .max(1, "Threshold can't exceed 1.0");

export async function setAttendanceThresholdAction(threshold: number): Promise<ActionResult> {
  const parsed = thresholdSchema.safeParse(threshold);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid threshold." };
  }
  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase
    .from("institutions")
    .update({ attendance_threshold: parsed.data })
    .eq("id", guard.institutionId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "attendance_threshold_set",
    target_type: "institutions",
    target_id: guard.institutionId,
    details: { threshold: parsed.data },
  });
  revalidatePath("/admin/attendance");
  return { status: "ok" };
}

const gradeSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(8),
      min: z.number().min(0).max(100),
    }),
  )
  .min(1, "At least one grade is required")
  .max(10, "Too many grades");

export async function setGradeThresholdsAction(
  thresholds: Array<{ label: string; min: number }>,
): Promise<ActionResult> {
  const parsed = gradeSchema.safeParse(thresholds);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid grades." };
  }
  // Sort descending by min for readability + correct lookup later.
  const sorted = [...parsed.data].sort((a, b) => b.min - a.min);

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase
    .from("institutions")
    .update({ grade_thresholds: sorted })
    .eq("id", guard.institutionId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "grade_thresholds_set",
    target_type: "institutions",
    target_id: guard.institutionId,
    details: { thresholds: sorted },
  });
  revalidatePath("/admin/attendance");
  return { status: "ok" };
}
