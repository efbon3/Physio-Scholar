"use server";

import { createClient } from "@/lib/supabase/server";

const CARD_ID_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?:\d+$/;

export type FlagSubmissionResult = { status: "ok" } | { status: "error"; message: string };

/**
 * Server action: learner reports a card. Inserts into content_flags
 * scoped to the caller's profile_id (RLS enforces that too, so a
 * crafted POST that tries to flag on someone else's behalf bounces).
 *
 * Falls back to a no-op when Supabase isn't configured, so the review
 * page still functions in CI / preview environments without crashing.
 */
export async function flagCardAction(formData: FormData): Promise<FlagSubmissionResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Flagging is unavailable in this environment." };
  }

  const cardId = formData.get("card_id");
  const reason = formData.get("reason");
  const notes = formData.get("notes");
  if (typeof cardId !== "string" || !CARD_ID_RE.test(cardId)) {
    return { status: "error", message: "Unknown card." };
  }
  if (typeof reason !== "string" || reason.trim().length === 0) {
    return { status: "error", message: "Please pick a reason." };
  }
  if (reason.length > 500) {
    return { status: "error", message: "Reason is too long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in before reporting." };

  const notesString = typeof notes === "string" && notes.trim().length > 0 ? notes.trim() : null;

  const { error } = await supabase.from("content_flags").insert({
    profile_id: user.id,
    card_id: cardId,
    reason: reason.trim(),
    notes: notesString,
  });
  if (error) return { status: "error", message: `Could not submit flag: ${error.message}` };

  return { status: "ok" };
}
