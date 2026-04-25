"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const VALID_SYSTEMS = new Set([
  "cardiovascular",
  "respiratory",
  "renal",
  "gastrointestinal",
  "endocrine",
  "nervous",
  "musculoskeletal",
  "reproductive",
  "blood",
  "immune",
  "integumentary",
]);

export type SaveResult = { status: "ok" } | { status: "error"; message: string };

/**
 * Persist the learner's active organ-system selection. Validates each
 * token against the canonical enum so a crafted form post can't sneak
 * an arbitrary string into the column. Empty selection is rejected
 * with a friendly message — "study nothing" is almost certainly a
 * mistake (the user clicked Save by accident); we'd rather they
 * explicitly toggle one back on than wonder why their queue is empty.
 */
export async function saveStudySystemsAction(formData: FormData): Promise<SaveResult> {
  const tokens = formData.getAll("systems").map((v) => String(v));
  const validated: string[] = [];
  for (const t of tokens) {
    if (VALID_SYSTEMS.has(t) && !validated.includes(t)) validated.push(t);
  }
  if (validated.length === 0) {
    return { status: "error", message: "Pick at least one system." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Settings can't save in this environment." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ study_systems: validated })
    .eq("id", user.id);
  if (error) return { status: "error", message: `Failed to save: ${error.message}` };

  revalidatePath("/today");
  revalidatePath("/review");
  revalidatePath("/settings");
  return { status: "ok" };
}
