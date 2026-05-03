"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const CARD_ID_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?:\d+$/;

export type ToggleBookmarkResult =
  | { status: "ok"; bookmarked: boolean }
  | { status: "error"; message: string };

/**
 * Toggle a (profile, card) bookmark. Insert if absent, delete if
 * present — RLS scopes both to the calling profile, so a crafted POST
 * can't touch someone else's bookmarks.
 *
 * Returns the post-toggle state so the client can flip its icon
 * without re-fetching.
 */
export async function toggleBookmarkAction(cardId: string): Promise<ToggleBookmarkResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Bookmarks unavailable in this environment." };
  }
  if (typeof cardId !== "string" || !CARD_ID_RE.test(cardId)) {
    return { status: "error", message: "Unknown card." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: existing } = await supabase
    .from("card_bookmarks")
    .select("id")
    .eq("profile_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("card_bookmarks").delete().eq("id", existing.id);
    if (error) return { status: "error", message: `Could not remove bookmark: ${error.message}` };
    revalidatePath("/me/bookmarks");
    return { status: "ok", bookmarked: false };
  }

  const { error } = await supabase.from("card_bookmarks").insert({
    profile_id: user.id,
    card_id: cardId,
  });
  if (error) return { status: "error", message: `Could not bookmark: ${error.message}` };
  revalidatePath("/me/bookmarks");
  return { status: "ok", bookmarked: true };
}
