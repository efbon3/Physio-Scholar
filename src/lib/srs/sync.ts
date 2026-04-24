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
/**
 * Per-table cursor keys. States are keyed on `updated_at`, reviews on
 * `created_at` — the two advance independently so we don't let a busy
 * card-state stream hide a slower review stream (or vice versa).
 */
type CursorTable = "states" | "reviews";

function cursorKey(profileId: string, table: CursorTable): string {
  return `${SYNC_CURSOR_PREFIX}${table}:${profileId}`;
}

/** localStorage cursor — per-profile, per-table. */
function readCursor(profileId: string, table: CursorTable): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(cursorKey(profileId, table));
}

function writeCursor(profileId: string, table: CursorTable, iso: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(cursorKey(profileId, table), iso);
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

  // Split into UUID-id rows (canonical path) and local-* fallback rows.
  // They go through different code paths because the id-mapping logic is
  // different:
  //   - UUID rows have a stable id already; the server returns whichever
  //     subset actually inserted, but we know every row's id up-front, so
  //     we clear pending_sync for the whole batch regardless of what the
  //     server returns.
  //   - local-* rows have no id sent; the server assigns a UUID we must
  //     capture by ordinal. We use INSERT (not UPSERT), so the returned
  //     rowset order matches the input order — no ordinal-skew risk.
  //
  // An earlier version combined both in a single upsert and mapped by
  // ordinal. A duplicate in the UUID portion shrank the returned array
  // and silently misaligned every local-* row after it, corrupting the
  // local store.
  const uuidRows = mine.filter((r) => isUuid(r.id));
  const localRows = mine.filter((r) => !isUuid(r.id));

  let pushed = 0;

  for (let i = 0; i < uuidRows.length; i += chunkSize) {
    const batch = uuidRows.slice(i, i + chunkSize);
    const payload: ReviewsInsert[] = batch.map((row) => toReviewInsert(row));
    const { error } = await supabase
      .from("reviews")
      .upsert(payload, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(`Failed to push reviews: ${error.message}`);
    // Every UUID-keyed row either (a) inserted fresh or (b) was already
    // on the server. Either way, the local copy is now synced — safe to
    // clear pending_sync for the whole batch.
    await db.transaction("rw", db.reviews, async () => {
      for (const local of batch) {
        await db.reviews.put({ ...local, pending_sync: 0 });
        pushed += 1;
      }
    });
  }

  for (let i = 0; i < localRows.length; i += chunkSize) {
    const batch = localRows.slice(i, i + chunkSize);
    const payload: ReviewsInsert[] = batch.map((row) => toReviewInsert(row));
    const { data, error } = await supabase.from("reviews").insert(payload).select("id, created_at");
    if (error) throw new Error(`Failed to push reviews: ${error.message}`);
    const returned = data ?? [];
    // INSERT returns rows in input order; map by ordinal and rewrite the
    // local-* id to the server-assigned UUID so future syncs treat it as
    // canonical.
    await db.transaction("rw", db.reviews, async () => {
      for (let j = 0; j < batch.length; j += 1) {
        const local = batch[j];
        const server = returned[j];
        if (!server) continue;
        await db.reviews.delete(local.id);
        await db.reviews.put({ ...local, id: server.id, pending_sync: 0 });
        pushed += 1;
      }
    });
  }

  return pushed;
}

/**
 * Upsert every queued card_state push with a last-write-wins guard.
 *
 * Each queue entry snapshots the state at queue time; we compare that
 * snapshot's `updated_at` against whatever's currently on the server
 * before overwriting. A device that came online with a stale snapshot
 * (remote row newer than ours) will not clobber the remote state —
 * instead we drop the stale queue entry and let the next pull bring
 * the remote state down to Dexie on last-write-wins at read-time.
 *
 * Small race window: another client could write between our SELECT and
 * UPSERT. That's tolerable for pilot scale; true transactional LWW
 * requires a dedicated RPC.
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
    // LWW guard — peek at the server row's updated_at before overwriting.
    // Absent row → ours is newer by definition; push.
    const { data: existing, error: readError } = await supabase
      .from("card_states")
      .select("updated_at")
      .eq("profile_id", profileId)
      .eq("card_id", entry.card_id)
      .maybeSingle();
    if (readError) throw new Error(`Failed to read card_state: ${readError.message}`);
    if (existing && existing.updated_at >= entry.state.updated_at) {
      // Server has an equal-or-newer row — drop the stale push rather
      // than overwriting newer data.
      await db.pending_state_pushes.delete(entry.card_id);
      continue;
    }

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
 * Fetch card_states + reviews newer than the stored cursors, merge into
 * Dexie. Uses `updated_at` on card_states and `created_at` on reviews.
 *
 * Each table has its own cursor so a busy card-state stream can't
 * accidentally hide a slower review stream. The cursors only advance
 * when the server actually returned at least one row — "no rows seen"
 * leaves the cursor at its previous value, because advancing to `now`
 * on the client would skip rows that the server wrote after the select
 * began but before the request returned (clock-skew plus request
 * latency would lose them).
 */
export async function pullRemote(
  supabase: SupabaseClient<Database>,
  profileId: string,
  _now: Date = new Date(),
): Promise<{
  pulledReviews: number;
  pulledStates: number;
  cursorUsed: { states: string | null; reviews: string | null };
}> {
  void _now; // cursor logic no longer uses client clock (intentional)
  const stateCursor = readCursor(profileId, "states");
  const reviewCursor = readCursor(profileId, "reviews");

  const [statesResult, reviewsResult] = await Promise.all([
    (stateCursor
      ? supabase
          .from("card_states")
          .select("*")
          .eq("profile_id", profileId)
          .gt("updated_at", stateCursor)
      : supabase.from("card_states").select("*").eq("profile_id", profileId)
    ).order("updated_at", { ascending: true }),
    (reviewCursor
      ? supabase
          .from("reviews")
          .select("*")
          .eq("profile_id", profileId)
          .gt("created_at", reviewCursor)
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
  let latestStateTs: string | null = null;
  let latestReviewTs: string | null = null;

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
      if (latestStateTs === null || remoteUpdated > latestStateTs) {
        latestStateTs = remoteUpdated;
      }
    }

    for (const row of remoteReviews) {
      const existing = await db.reviews.get(row.id);
      if (!existing) {
        const stored: StoredReview = toStoredReview(row);
        await db.reviews.put(stored);
        pulledReviews += 1;
      }
      if (latestReviewTs === null || row.created_at > latestReviewTs) {
        latestReviewTs = row.created_at;
      }
    }
  });

  // Only advance a cursor when we saw real server rows for that table.
  // Leaving it unchanged on an empty pull avoids the clock-skew trap:
  // writing `now` from the client could overshoot and skip rows the
  // server wrote during the request window.
  if (latestStateTs !== null) writeCursor(profileId, "states", latestStateTs);
  if (latestReviewTs !== null) writeCursor(profileId, "reviews", latestReviewTs);

  return {
    pulledReviews,
    pulledStates,
    cursorUsed: { states: stateCursor, reviews: reviewCursor },
  };
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
