"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseMechanism } from "@/lib/content/loader";
import { createClient } from "@/lib/supabase/server";

type Result = { status: "ok"; id: string } | { status: "error"; message: string };

const STATUS_VALUES = new Set(["draft", "review", "published", "retired"]);

/**
 * Validates + writes the markdown as a CMS row. Used by both the
 * new-mechanism page (insert) and the edit page (upsert).
 *
 * The validation pass calls the same parser the renderer uses, so a
 * misformatted frontmatter or malformed question shape is caught at
 * save time rather than at render time. The error message is human-
 * readable enough to surface to the admin.
 */
async function saveMechanism({
  markdown,
  status,
  mode,
  expectedId,
}: {
  markdown: string;
  status: string;
  mode: "create" | "update";
  expectedId?: string;
}): Promise<Result> {
  if (!STATUS_VALUES.has(status)) {
    return { status: "error", message: "Invalid status." };
  }

  let parsed;
  try {
    parsed = parseMechanism(markdown);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Markdown failed to parse — check the frontmatter.";
    return { status: "error", message };
  }

  if (mode === "update") {
    if (!expectedId) {
      // Defence against a form submission missing the hidden `expected_id`
      // input — without it we could UPDATE against a renamed id and
      // silently hit zero rows (Supabase returns no error on no-match).
      return {
        status: "error",
        message: "Missing expected_id — reopen the editor and try again.",
      };
    }
    if (parsed.frontmatter.id !== expectedId) {
      return {
        status: "error",
        message: `Frontmatter id "${parsed.frontmatter.id}" doesn't match the URL "${expectedId}". Either update the URL, revert the frontmatter id, or use "Save As" to create a new row.`,
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/content");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/today");

  if (mode === "create") {
    // Prevent accidental overwrite — INSERT fails on duplicate primary
    // key, which is what we want. If the admin really meant to edit an
    // existing row, the UI routes them through /admin/content/[id]/edit.
    const { error } = await supabase.from("content_mechanisms").insert({
      id: parsed.frontmatter.id,
      markdown,
      status: status as "draft" | "review" | "published" | "retired",
      updated_by: user.id,
    });
    if (error) {
      if (error.code === "23505") {
        return {
          status: "error",
          message: `A mechanism with id "${parsed.frontmatter.id}" already exists. Edit it instead, or change the id.`,
        };
      }
      return { status: "error", message: `Failed to save: ${error.message}` };
    }
  } else {
    const { data: updated, error } = await supabase
      .from("content_mechanisms")
      .update({
        markdown,
        status: status as "draft" | "review" | "published" | "retired",
        updated_by: user.id,
      })
      .eq("id", parsed.frontmatter.id)
      .select("id");
    if (error) return { status: "error", message: `Failed to save: ${error.message}` };
    if (!updated || updated.length === 0) {
      // Zero affected rows — either the id no longer exists, or the
      // admin's RLS UPDATE policy didn't match. Surface loudly rather
      // than saying "Saved" when nothing happened.
      return {
        status: "error",
        message: `No row matched id "${parsed.frontmatter.id}". Did the id change? Try creating a new mechanism instead.`,
      };
    }
  }

  revalidatePath("/admin/content");
  revalidatePath(`/systems/${parsed.frontmatter.organ_system}/${parsed.frontmatter.id}`);
  revalidatePath("/systems");
  return { status: "ok", id: parsed.frontmatter.id };
}

export async function createMechanismAction(formData: FormData): Promise<Result> {
  const markdown = String(formData.get("markdown") ?? "");
  const status = String(formData.get("status") ?? "draft");
  return saveMechanism({ markdown, status, mode: "create" });
}

export async function updateMechanismAction(formData: FormData): Promise<Result> {
  const markdown = String(formData.get("markdown") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const expectedId = String(formData.get("expected_id") ?? "");
  return saveMechanism({ markdown, status, mode: "update", expectedId });
}
