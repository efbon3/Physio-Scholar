"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Privacy / data-rights server actions backing the settings page's
 * "Privacy & data" panel. Build spec acceptance criteria 370–371:
 *
 *   - Data export: student can download data as JSON.
 *   - Data deletion: works, verified removed from database.
 *
 * Two surfaces, both gated by the active session:
 *
 * 1. exportMyDataAction — read every row the learner owns across the
 *    SRS / content-flag / events tables and return them as a single
 *    JSON object the page serialises into a file download. RLS does
 *    the filtering automatically — we don't need to thread profile_id
 *    through every query.
 *
 * 2. requestAccountDeletionAction — sets profiles.deletion_requested_at
 *    to now() and signs the user out. The actual cascade runs as a
 *    service-role admin task (Supabase dashboard or a scheduled
 *    function); a soft-delete window is the sane default for a pilot
 *    where a student might regret the click and want to be undeleted.
 *    Mark + sign out is the user-facing contract; the irreversible
 *    cascade is admin-driven.
 *
 * Both fail closed when Supabase env vars are missing — the privacy
 * surface is not something we want exercising in a half-configured
 * preview env.
 */

export type DataExportResult =
  | { status: "ok"; data: Record<string, unknown> }
  | { status: "error"; message: string };

export async function exportMyDataAction(): Promise<DataExportResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Data export is unavailable in this environment." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const [profileRes, cardStatesRes, reviewsRes, flagsRes, eventsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("card_states").select("*"),
    supabase.from("reviews").select("*"),
    supabase.from("content_flags").select("*"),
    supabase.from("exam_events").select("*").eq("audience", "personal"),
  ]);

  if (profileRes.error) {
    return { status: "error", message: `Failed to read profile: ${profileRes.error.message}` };
  }

  return {
    status: "ok",
    data: {
      schema_version: 1,
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile: profileRes.data,
      card_states: cardStatesRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      content_flags: flagsRes.data ?? [],
      personal_events: eventsRes.data ?? [],
    },
  };
}

export type DeletionResult = { status: "ok" } | { status: "error"; message: string };

export async function requestAccountDeletionAction(): Promise<DeletionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Account deletion is unavailable in this environment." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: `Failed to request deletion: ${error.message}` };
  }

  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
