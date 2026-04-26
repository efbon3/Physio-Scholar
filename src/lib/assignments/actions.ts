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

const createSchema = z.object({
  title: TITLE_SCHEMA,
  description: DESCRIPTION_SCHEMA,
  due_at: DUE_AT_SCHEMA,
});

const updateSchema = createSchema.extend({
  id: z.string().uuid("Invalid assignment id"),
});

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
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  const { data, error } = await supabase
    .from("faculty_assignments")
    .insert({
      faculty_id: user.id,
      institution_id: profile.institution_id,
      title: parsed.data.title,
      description: parsed.data.description,
      due_at: parsed.data.due_at,
    })
    .select("id")
    .single();
  if (error) {
    return { status: "error", message: `Could not create: ${error.message}` };
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/today");
  return { status: "ok", id: data.id };
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
