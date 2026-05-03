"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Server actions for the teaching schedule + attendance recording.
 *
 * Two surfaces share class_sessions: the faculty schedule (upcoming
 * rows) and the attendance grid (held rows). RLS already constrains
 * who can write — only the session owner faculty / HOD / admin in the
 * same institution. We do an explicit role check before insert so the
 * failure-mode for non-faculty is "you're not faculty" rather than a
 * silent zero-rows RLS filter that surfaces as "Couldn't save".
 */
export type ScheduleResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

const TOPIC_SCHEMA = z.string().trim().min(1, "Topic is required").max(200, "Topic is too long");
const DURATION_SCHEMA = z.coerce
  .number()
  .int()
  .min(5, "Duration must be at least 5 minutes")
  .max(600, "Duration can't exceed 600 minutes");
const SCHEDULED_AT_SCHEMA = z.string().datetime({ offset: true });
const LOCATION_SCHEMA = z
  .union([z.literal(""), z.string().max(100, "Location is too long")])
  .transform((v) => (v === "" ? null : v));
const NOTES_SCHEMA = z
  .union([z.literal(""), z.string().max(2000, "Notes are too long")])
  .transform((v) => (v === "" ? null : v));
const BATCH_SCHEMA = z
  .union([z.literal(""), z.string().regex(UUID_RE, "Invalid batch id")])
  .transform((v) => (v === "" ? null : v));

const createSchema = z.object({
  topic: TOPIC_SCHEMA,
  scheduled_at: SCHEDULED_AT_SCHEMA,
  duration_minutes: DURATION_SCHEMA,
  batch_id: BATCH_SCHEMA,
  location: LOCATION_SCHEMA,
  notes: NOTES_SCHEMA,
});

const updateSchema = createSchema.extend({
  id: z.string().uuid("Invalid session id"),
});

const STATUS_SCHEMA = z.enum(["scheduled", "held", "cancelled"]);

/**
 * Faculty creates a new teaching session for their institution.
 */
export async function createClassSessionAction(formData: FormData): Promise<ScheduleResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Schedule unavailable in this environment." };
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
  if (!profile?.is_faculty && !profile?.is_admin && profile?.role !== "hod") {
    return { status: "error", message: "Only faculty, HODs, or admins can schedule classes." };
  }
  if (!profile.institution_id) {
    return { status: "error", message: "Your profile is not linked to an institution." };
  }

  const parsed = createSchema.safeParse({
    topic: formData.get("topic")?.toString() ?? "",
    scheduled_at: formData.get("scheduled_at")?.toString() ?? "",
    duration_minutes: formData.get("duration_minutes")?.toString() ?? "60",
    batch_id: formData.get("batch_id")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  const { data, error } = await supabase
    .from("class_sessions")
    .insert({
      institution_id: profile.institution_id,
      faculty_id: user.id,
      batch_id: parsed.data.batch_id,
      topic: parsed.data.topic,
      scheduled_at: parsed.data.scheduled_at,
      duration_minutes: parsed.data.duration_minutes,
      location: parsed.data.location,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: `Could not create: ${error.message}` };

  revalidatePath("/faculty/schedule");
  revalidatePath("/today");
  return { status: "ok", id: data.id };
}

export async function updateClassSessionAction(formData: FormData): Promise<ScheduleResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Schedule unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const parsed = updateSchema.safeParse({
    id: formData.get("id")?.toString() ?? "",
    topic: formData.get("topic")?.toString() ?? "",
    scheduled_at: formData.get("scheduled_at")?.toString() ?? "",
    duration_minutes: formData.get("duration_minutes")?.toString() ?? "60",
    batch_id: formData.get("batch_id")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  const { error } = await supabase
    .from("class_sessions")
    .update({
      topic: parsed.data.topic,
      scheduled_at: parsed.data.scheduled_at,
      duration_minutes: parsed.data.duration_minutes,
      batch_id: parsed.data.batch_id,
      location: parsed.data.location,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  revalidatePath("/faculty/schedule");
  revalidatePath("/today");
  return { status: "ok", id: parsed.data.id };
}

export async function setClassSessionStatusAction(
  sessionId: string,
  status: "scheduled" | "held" | "cancelled",
): Promise<ScheduleResult> {
  if (!UUID_RE.test(sessionId)) return { status: "error", message: "Invalid session id." };
  const parsedStatus = STATUS_SCHEMA.safeParse(status);
  if (!parsedStatus.success) return { status: "error", message: "Invalid status." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase
    .from("class_sessions")
    .update({ status: parsedStatus.data })
    .eq("id", sessionId);
  if (error) return { status: "error", message: `Could not update: ${error.message}` };

  revalidatePath("/faculty/schedule");
  revalidatePath("/today");
  return { status: "ok", id: sessionId };
}

export async function deleteClassSessionAction(sessionId: string): Promise<ScheduleResult> {
  if (!UUID_RE.test(sessionId)) return { status: "error", message: "Invalid session id." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase.from("class_sessions").delete().eq("id", sessionId);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  revalidatePath("/faculty/schedule");
  revalidatePath("/today");
  return { status: "ok" };
}

// ───────────────────────────── attendance ─────────────────────────────

const recordSchema = z.object({
  student_id: z.string().regex(UUID_RE, "Invalid student id"),
  code: z.string().trim().min(1, "Code is required").max(8, "Code is too long"),
});

const SAVE_RECORDS_SCHEMA = z.object({
  session_id: z.string().regex(UUID_RE, "Invalid session id"),
  records: z.array(recordSchema).max(500, "Too many records"),
});

/**
 * Save attendance for one session as a single batch. Existing rows
 * for this (session, student) pair are updated in-place via upsert
 * on the unique constraint; new rows are inserted. RLS ensures only
 * faculty / HOD / admin in the session's institution can write.
 *
 * Empty `code` for a row is interpreted as "leave unmarked" — the
 * row is skipped rather than written. Faculty who want to clear an
 * existing mark should use the explicit clear path (not yet built).
 */
export async function saveAttendanceRecordsAction(
  sessionId: string,
  records: Array<{ student_id: string; code: string }>,
): Promise<ScheduleResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Attendance unavailable in this environment." };
  }
  const parsed = SAVE_RECORDS_SCHEMA.safeParse({ session_id: sessionId, records });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const filled = parsed.data.records.filter((r) => r.code.trim().length > 0);
  if (filled.length === 0) {
    return { status: "ok", id: sessionId };
  }

  // Validate all submitted codes exist in the institution. The session's
  // institution is the gate — we look it up first, then check that every
  // code is in attendance_codes for that institution.
  const { data: sessionRow, error: sessionErr } = await supabase
    .from("class_sessions")
    .select("institution_id")
    .eq("id", parsed.data.session_id)
    .single();
  if (sessionErr || !sessionRow) {
    return { status: "error", message: "Session not found." };
  }
  const { data: codeRows } = await supabase
    .from("attendance_codes")
    .select("code")
    .eq("institution_id", sessionRow.institution_id);
  const valid = new Set((codeRows ?? []).map((c) => c.code));
  for (const r of filled) {
    if (!valid.has(r.code)) {
      return { status: "error", message: `Unknown code "${r.code}".` };
    }
  }

  const payload = filled.map((r) => ({
    class_session_id: parsed.data.session_id,
    student_id: r.student_id,
    code: r.code,
    marked_by: user.id,
    marked_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("attendance_records")
    .upsert(payload, { onConflict: "class_session_id,student_id" });
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  revalidatePath(`/faculty/schedule/${parsed.data.session_id}/attendance`);
  revalidatePath("/today");
  return { status: "ok", id: parsed.data.session_id };
}
