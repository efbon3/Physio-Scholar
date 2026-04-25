"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { organSystemSchema } from "@/lib/content/schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Server actions for creating and deleting exam_events rows.
 *
 * Authorisation is delegated to the RLS policies added in the J7
 * migration:
 *   - Personal events: an authenticated user can insert/update/delete
 *     rows where owner_id = auth.uid().
 *   - Institution events: only faculty (is_faculty = true) of that
 *     institution, or app-admins, can write.
 *
 * These actions just call .insert / .delete and surface the RLS
 * outcome — they don't pre-flight check permissions, because the
 * policy stack is the source of truth.
 */

export type ActionResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const KIND_VALUES = ["exam", "holiday", "semester_boundary", "milestone"] as const;
const PERSONAL_KIND_VALUES = ["exam", "milestone"] as const;

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), "Invalid date");

const baseEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  starts_at: dateSchema,
  ends_at: z.union([z.literal(""), dateSchema]).transform((v) => (v === "" ? null : v)),
  organ_systems: z.array(organSystemSchema).default([]),
  notes: z
    .union([z.literal(""), z.string().max(2000, "Notes too long")])
    .transform((v) => (v === "" ? null : v)),
});

const personalEventSchema = baseEventSchema.extend({
  kind: z.enum(PERSONAL_KIND_VALUES),
});

const institutionEventSchema = baseEventSchema.extend({
  kind: z.enum(KIND_VALUES),
});

function rangeOK(starts_at: string, ends_at: string | null): boolean {
  if (!ends_at) return true;
  return ends_at >= starts_at;
}

function pickOrganSystems(formData: FormData): string[] {
  const out = formData.getAll("organ_systems").map((v) => String(v));
  return Array.from(new Set(out.filter((v) => v.length > 0)));
}

/**
 * Create a personal calendar event. Audience is forced to 'personal'
 * and owner_id is forced to auth.uid() — the form never gets to set
 * those fields directly. RLS enforces the same constraint server-side
 * even if a malicious client bypassed the action.
 */
export async function createPersonalEventAction(formData: FormData): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Calendar is unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const parsed = personalEventSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    starts_at: formData.get("starts_at")?.toString() ?? "",
    ends_at: formData.get("ends_at")?.toString() ?? "",
    organ_systems: pickOrganSystems(formData),
    notes: formData.get("notes")?.toString() ?? "",
    kind: formData.get("kind")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }
  if (!rangeOK(parsed.data.starts_at, parsed.data.ends_at)) {
    return { status: "error", message: "End date must be on or after start date." };
  }

  const { error } = await supabase.from("exam_events").insert({
    audience: "personal",
    owner_id: user.id,
    institution_id: null,
    title: parsed.data.title,
    kind: parsed.data.kind,
    starts_at: parsed.data.starts_at,
    ends_at: parsed.data.ends_at,
    organ_systems: parsed.data.organ_systems,
    notes: parsed.data.notes,
  });
  if (error) return { status: "error", message: `Could not save event: ${error.message}` };

  revalidatePath("/calendar");
  revalidatePath("/today");
  redirect("/calendar");
}

/**
 * Create an institution calendar event. Caller must be faculty of the
 * resolved institution_id, or an app-admin. RLS rejects writes from
 * unauthorised callers.
 *
 * institution_id is resolved from the caller's profile — faculty can
 * only write events for their own institution. Admins can override
 * via a hidden form field if needed (cross-institution setup), but
 * the UI doesn't expose that today.
 */
export async function createInstitutionEventAction(formData: FormData): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Calendar is unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("institution_id, is_faculty, is_admin")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) {
    return { status: "error", message: "Could not load your profile." };
  }
  if (!profile.is_faculty && !profile.is_admin) {
    return {
      status: "error",
      message: "Only faculty or admins can author institution events.",
    };
  }
  if (!profile.institution_id) {
    return {
      status: "error",
      message: "Your profile is not linked to an institution. Ask an admin to assign one.",
    };
  }

  const parsed = institutionEventSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    starts_at: formData.get("starts_at")?.toString() ?? "",
    ends_at: formData.get("ends_at")?.toString() ?? "",
    organ_systems: pickOrganSystems(formData),
    notes: formData.get("notes")?.toString() ?? "",
    kind: formData.get("kind")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }
  if (!rangeOK(parsed.data.starts_at, parsed.data.ends_at)) {
    return { status: "error", message: "End date must be on or after start date." };
  }

  const { error } = await supabase.from("exam_events").insert({
    audience: "institution",
    institution_id: profile.institution_id,
    owner_id: null,
    title: parsed.data.title,
    kind: parsed.data.kind,
    starts_at: parsed.data.starts_at,
    ends_at: parsed.data.ends_at,
    organ_systems: parsed.data.organ_systems,
    notes: parsed.data.notes,
  });
  if (error) return { status: "error", message: `Could not save event: ${error.message}` };

  revalidatePath("/calendar");
  revalidatePath("/admin/calendar");
  revalidatePath("/today");
  redirect("/admin/calendar");
}

/**
 * Delete an event by id. RLS gates which rows the caller can delete:
 *   - own personal events
 *   - institution events of the caller's institution (faculty / admin)
 * No additional pre-check needed in the action itself.
 */
export async function deleteEventAction(id: string): Promise<ActionResult> {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { status: "error", message: "Invalid event id." };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Calendar is unavailable in this environment." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const { error } = await supabase.from("exam_events").delete().eq("id", id);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  revalidatePath("/calendar");
  revalidatePath("/admin/calendar");
  revalidatePath("/today");
  return { status: "ok" };
}
