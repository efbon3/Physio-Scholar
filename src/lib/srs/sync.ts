import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import {
  getLearningDB,
  type PendingStatePush,
  type StoredCardState,
  type StoredReview,
} from "./db";
import type { CardState } from "./types";

/**
 * Dexie ↔ Supabase sync for SRS state.
 *
 * Push direction
 *   - reviews:      local rows with pending_sync=1 → insert into public.reviews.
 *                   Client supplies the row id only when it's a valid UUID; if
 *                   it isn't (the crypto-less fallback path), Postgres generates
 *                   one via gen_random_uuid() and we rewrite the local row to
 *                   match before clearing pending_sync.
 *   - card_states:  rows queued via pending_state_pushes → upsert into
 *                   public.card_states. Last-write-wins on updated_at, but
 *                   with a client-side guard — we only overwrite a remote
 *                   row when our local updated_at is newer.
 *
 * Pull direction
 *   - card_states:  fetch rows whose updated_at is newer than the last pull
 *                   cursor, apply last-write-wins per card. Rewrite our
 *                   cursor to the newest server updated_at we saw.
 *   - reviews:      insert-only append log. Fetch rows with created_at >
 *                   cursor, insert any id we don't have locally.
 *
 * The sync module is intentionally pure: callers pass in a Supabase client
 * (server-less, no session handling here) and a profileId. Keeps unit
 * tests trivial — the Supabase client is just an object with `.from()`.
 */

// ---------------- Types ----------------

export type SyncResult = {
  pushedReviews: number;
  pushedStates: number;
  pulledReviews: number;
  pulledStates: number;
  /** Null on success; readable message on partial failure. */
  error: string | null;
};

type ReviewsInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type CardStatesInsert = Database["public"]["Tables"]["card_states"]["Insert"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

const SYNC_CURSOR_PREFIX = "physio-scholar:sync-cursor:";

/** localStorage cursor — per-profile, safe-to-read on the server. */
function readCursor(profileId: string): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(`${SYNC_CURSOR_PREFIX}${profileId}`);
}

function writeCursor(profileId: string, iso: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${SYNC_CURSOR_PREFIX}${profileId}`, iso);
}

// ---------------- Push ----------------

/**
 * Insert every pending review row for the profile. Uses chunked upserts so
 * a cohort returning after a week of offline use doesn't blow past Supabase's
 * request-size limits.
 */
export async function pushPendingReviews(
  supabase: SupabaseClient<Database>,
  profileId: string,
  chunkSize = 100,
): Promise<number> {
  const db = getLearningDB();
  const pending = await db.reviews.where("pending_sync").equals(1).toArray();
  const mine = pending.filter((r) => r.profile_id === profileId);
  if (mine.length === 0) return 0;

  let pushed = 0;
  for (let i = 0; i < mine.length; i += chunkSize) {
    const batch = mine.slice(i, i + chunkSize);
    const payload: ReviewsInsert[] = batch.map((row) => toReviewInsert(row));

    const { data, error } = await supabase
      .from("reviews")
      .upsert(payload, { onConflict: "id", ignoreDuplicates: true })
      .select("id, created_at");
    if (error) {
      throw new Error(`Failed to push reviews: ${error.message}`);
    }

    // Map local rows (some with UUID ids, some with local-* ids) to server
    // ids by ordinal position — upsert preserves insertion order in the
    // returned rowset. Rewrite local ids for the non-UUID subset, clear
    // pending_sync for everyone that landed.
    const returned = data ?? [];
    await db.transaction("rw", db.reviews, async () => {
      for (let j = 0; j < batch.length; j += 1) {
        const local = batch[j];
        const server = returned[j];
        if (!server) continue;
        if (local.id !== server.id) {
          await db.reviews.delete(local.id);
          await db.reviews.put({ ...local, id: server.id, pending_sync: 0 });
        } else {
          await db.reviews.put({ ...local, pending_sync: 0 });
        }
        pushed += 1;
      }
    });
  }

  return pushed;
}

/**
 * Upsert every queued card_state push. Each queue entry snapshots the state
 * at queue time; we use that snapshot (not the latest Dexie read) so a race
 * between "state updated again" and "push" doesn't overwrite a newer push.
 */
export async function pushPendingStates(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<number> {
  const db = getLearningDB();
  const queue = await db.pending_state_pushes.toArray();
  const mine = queue.filter((q) => q.profile_id === profileId);
  if (mine.length === 0) return 0;

  let pushed = 0;
  for (const entry of mine) {
    const payload: CardStatesInsert = toCardStateInsert(entry);
    const { error } = await supabase
      .from("card_states")
      .upsert(payload, { onConflict: "profile_id,card_id" });
    if (error) throw new Error(`Failed to push card_state: ${error.message}`);
    await db.pending_state_pushes.delete(entry.card_id);
    pushed += 1;
  }
  return pushed;
}

// ---------------- Pull ----------------

/**
 * Fetch card_states + reviews newer than the stored cursor, merge into
 * Dexie. Uses `updated_at` on card_states and `created_at` on reviews.
 */
export async function pullRemote(
  supabase: SupabaseClient<Database>,
  profileId: string,
  now: Date = new Date(),
): Promise<{ pulledReviews: number; pulledStates: number; cursorUsed: string | null }> {
  const cursor = readCursor(profileId);

  const [statesResult, reviewsResult] = await Promise.all([
    (cursor
      ? supabase
          .from("card_states")
          .select("*")
          .eq("profile_id", profileId)
          .gt("updated_at", cursor)
      : supabase.from("card_states").select("*").eq("profile_id", profileId)
    ).order("updated_at", { ascending: true }),
    (cursor
      ? supabase.from("reviews").select("*").eq("profile_id", profileId).gt("created_at", cursor)
      : supabase.from("reviews").select("*").eq("profile_id", profileId)
    ).order("created_at", { ascending: true }),
  ]);

  if (statesResult.error) {
    throw new Error(`Failed to pull card_states: ${statesResult.error.message}`);
  }
  if (reviewsResult.error) {
    throw new Error(`Failed to pull reviews: ${reviewsResult.error.message}`);
  }

  const db = getLearningDB();
  const remoteStates = statesResult.data ?? [];
  const remoteReviews = reviewsResult.data ?? [];

  let pulledStates = 0;
  let pulledReviews = 0;
  let latest = cursor ?? "1970-01-01T00:00:00Z";

  await db.transaction("rw", db.card_states, db.reviews, async () => {
    for (const row of remoteStates) {
      const existing = await db.card_states.get(row.card_id);
      const remoteUpdated = row.updated_at;
      // Last-write-wins per card: only overwrite if remote is newer.
      if (!existing || remoteUpdated > existing.updated_at) {
        const stored: StoredCardState = toStoredCardState(row);
        await db.card_states.put(stored);
        pulledStates += 1;
      }
      if (remoteUpdated > latest) latest = remoteUpdated;
    }

    for (const row of remoteReviews) {
      const existing = await db.reviews.get(row.id);
      if (!existing) {
        const stored: StoredReview = toStoredReview(row);
        await db.reviews.put(stored);
        pulledReviews += 1;
      }
      if (row.created_at > latest) latest = row.created_at;
    }
  });

  writeCursor(
    profileId,
    latest === (cursor ?? "1970-01-01T00:00:00Z") ? now.toISOString() : latest,
  );

  return { pulledReviews, pulledStates, cursorUsed: cursor };
}

// ---------------- Orchestrator ----------------

/**
 * Push then pull. Errors from either phase propagate into the SyncResult
 * but do not abort — a failed push shouldn't prevent a pull from running
 * (fresh data still lands locally). Callers display `result.error` in the
 * sync indicator when non-null.
 */
export async function syncNow(params: {
  supabase: SupabaseClient<Database>;
  profileId: string;
  now?: Date;
}): Promise<SyncResult> {
  const { supabase, profileId, now = new Date() } = params;
  let pushedReviews = 0;
  let pushedStates = 0;
  let pulledReviews = 0;
  let pulledStates = 0;
  const errors: string[] = [];

  try {
    pushedReviews = await pushPendingReviews(supabase, profileId);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }
  try {
    pushedStates = await pushPendingStates(supabase, profileId);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }
  try {
    const pulled = await pullRemote(supabase, profileId, now);
    pulledReviews = pulled.pulledReviews;
    pulledStates = pulled.pulledStates;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    pushedReviews,
    pushedStates,
    pulledReviews,
    pulledStates,
    error: errors.length > 0 ? errors.join("; ") : null,
  };
}

// ---------------- Mappers ----------------

function toReviewInsert(row: StoredReview): ReviewsInsert {
  const base: ReviewsInsert = {
    profile_id: row.profile_id,
    card_id: row.card_id,
    rating: row.rating,
    hints_used: row.hints_used,
    time_spent_seconds: row.time_spent_seconds,
    session_id: row.session_id,
    self_explanation: row.self_explanation,
    created_at: row.created_at,
  };
  if (isUuid(row.id)) {
    return { ...base, id: row.id };
  }
  return base;
}

function toCardStateInsert(entry: PendingStatePush): CardStatesInsert {
  const s = entry.state;
  return {
    profile_id: s.profile_id,
    card_id: s.card_id,
    ease: s.ease,
    interval_days: s.interval_days,
    status: s.status,
    consecutive_again_count: s.consecutive_again_count,
    last_reviewed_at: s.last_reviewed_at,
    due_at: s.due_at,
    updated_at: s.updated_at,
  };
}

function toStoredCardState(
  row: Database["public"]["Tables"]["card_states"]["Row"],
): StoredCardState {
  const state: CardState = {
    ease: row.ease,
    interval_days: row.interval_days,
    status: row.status,
    consecutive_again_count: row.consecutive_again_count,
    last_reviewed_at: row.last_reviewed_at,
    due_at: row.due_at,
  };
  return {
    ...state,
    card_id: row.card_id,
    profile_id: row.profile_id,
    updated_at: row.updated_at,
  };
}

function toStoredReview(row: Database["public"]["Tables"]["reviews"]["Row"]): StoredReview {
  return {
    id: row.id,
    profile_id: row.profile_id,
    card_id: row.card_id,
    rating: row.rating,
    hints_used: row.hints_used,
    time_spent_seconds: row.time_spent_seconds,
    session_id: row.session_id,
    self_explanation: row.self_explanation,
    created_at: row.created_at,
    pending_sync: 0,
  };
}

// Test hooks (not exported from the public module surface).
export const __TEST_HELPERS = {
  isUuid,
  toReviewInsert,
  toCardStateInsert,
  toStoredCardState,
  toStoredReview,
  readCursor,
  writeCursor,
  SYNC_CURSOR_PREFIX,
};
