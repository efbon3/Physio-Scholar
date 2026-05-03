"use server";

import { revalidatePath } from "next/cache";

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
  if (!profile?.is_admin) return { ok: false, error: "Only admins can manage batches." };
  if (!profile.institution_id) {
    return {
      ok: false,
      error: "Your admin profile is not linked to an institution. Set institution_id first.",
    };
  }
  return { ok: true, supabase, institutionId: profile.institution_id };
}

/** Create a batch in the admin's institution. */
export async function createBatchAction(
  name: string,
  yearOfStudy: number | null,
): Promise<ActionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Batches are unavailable in this environment." };
  }
  const trimmed = name.trim();
  if (trimmed.length < 1) return { status: "error", message: "Name is required." };
  if (trimmed.length > 100) return { status: "error", message: "Name is too long." };
  if (yearOfStudy !== null && (yearOfStudy < 1 || yearOfStudy > 5)) {
    return { status: "error", message: "Year of study must be 1-5 (or blank)." };
  }

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { data, error } = await guard.supabase
    .from("batches")
    .insert({
      name: trimmed,
      institution_id: guard.institutionId,
      year_of_study: yearOfStudy,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: `Could not create: ${error.message}` };

  await writeAuditEntry({
    action: "batch_create",
    target_type: "batches",
    target_id: data.id,
    details: { name: trimmed, year_of_study: yearOfStudy },
  });

  revalidatePath("/admin/batches");
  return { status: "ok", id: data.id };
}

/** Rename a batch. */
export async function renameBatchAction(batchId: string, name: string): Promise<ActionResult> {
  if (!UUID_RE.test(batchId)) return { status: "error", message: "Invalid batch id." };
  const trimmed = name.trim();
  if (trimmed.length < 1) return { status: "error", message: "Name is required." };
  if (trimmed.length > 100) return { status: "error", message: "Name is too long." };

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase
    .from("batches")
    .update({ name: trimmed })
    .eq("id", batchId);
  if (error) return { status: "error", message: `Could not rename: ${error.message}` };

  await writeAuditEntry({
    action: "batch_rename",
    target_type: "batches",
    target_id: batchId,
    details: { name: trimmed },
  });

  revalidatePath("/admin/batches");
  return { status: "ok" };
}

/** Set or clear a batch's year_of_study (1-5 or null). */
export async function setBatchYearAction(
  batchId: string,
  yearOfStudy: number | null,
): Promise<ActionResult> {
  if (!UUID_RE.test(batchId)) return { status: "error", message: "Invalid batch id." };
  if (yearOfStudy !== null && (yearOfStudy < 1 || yearOfStudy > 5)) {
    return { status: "error", message: "Year of study must be 1-5 (or blank)." };
  }

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase
    .from("batches")
    .update({ year_of_study: yearOfStudy })
    .eq("id", batchId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };

  await writeAuditEntry({
    action: "batch_set_year",
    target_type: "batches",
    target_id: batchId,
    details: { year_of_study: yearOfStudy },
  });

  revalidatePath("/admin/batches");
  return { status: "ok" };
}

/**
 * Delete a batch. Affiliated profiles keep their other data;
 * profiles.batch_id is `on delete set null` from migration 20260516
 * so the unlink is automatic. Assignments and announcements that
 * targeted this batch keep the dead uuid in their target_batch_ids
 * array — students stop seeing them (no profile.batch_id matches).
 */
export async function deleteBatchAction(batchId: string): Promise<ActionResult> {
  if (!UUID_RE.test(batchId)) return { status: "error", message: "Invalid batch id." };

  const guard = await requireAdminClient();
  if (!guard.ok) return { status: "error", message: guard.error };

  const { error } = await guard.supabase.from("batches").delete().eq("id", batchId);
  if (error) return { status: "error", message: `Could not delete: ${error.message}` };

  await writeAuditEntry({
    action: "batch_delete",
    target_type: "batches",
    target_id: batchId,
    details: null,
  });

  revalidatePath("/admin/batches");
  return { status: "ok" };
}
