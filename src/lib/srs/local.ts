import Dexie from "dexie";

import { getLearningDB, type StoredCardState, type StoredReview } from "./db";
import { scheduleNext } from "./scheduler";
import type { CardState, Rating } from "./types";

/**
 * Local-first SRS operations.
 *
 * Every learner action (rating submission) writes to Dexie first and only
 * then queues a push to Supabase. This is what gives the PWA its offline
 * property: a rating in Bengaluru's train tunnel still lands in the local
 * store, still updates the due-date on the card, still shows the learner
 * the next card in the queue. Sync to Supabase happens whenever the
 * network is available again.
 *
 * The Supabase push + pull live in a separate module (lands with the
 * offline-sync gate in Phase 6) — this file deliberately has no
 * knowledge of the network. Tests run against fake-indexeddb with no
 * mocks needed.
 */

/** Generate a UUID suitable for the reviews.id column. */
function newReviewId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback — fake-indexeddb environments sometimes lack crypto.randomUUID.
  // Not cryptographic, but the review id only needs to be unique per device
  // before it lands on the server, which assigns its own UUID during push.
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fetch the current stored state for a card, or null if it's brand-new. */
export async function getLocalCardState(
  profileId: string,
  cardId: string,
): Promise<StoredCardState | null> {
  const db = getLearningDB();
  const row = await db.card_states.get(cardId);
  if (!row || row.profile_id !== profileId) return null;
  return row;
}

/**
 * Load every card_state for a learner. Used by `assembleQueue` callers
 * and by the Today tab's "due count" indicator.
 */
export async function loadAllCardStates(profileId: string): Promise<StoredCardState[]> {
  const db = getLearningDB();
  return db.card_states.where("profile_id").equals(profileId).toArray();
}

/**
 * Record a rating submission locally. This is the core transaction: in
 * one IndexedDB write we
 *   (1) persist the review row as the canonical "what happened"
 *   (2) update the card's scheduled state via the pure SM-2 scheduler
 *   (3) mark both for sync to Supabase later
 *
 * Returns the resulting card state so the UI can display the next
 * due-at, new ease, etc. without a follow-up read.
 */
export type RecordReviewInput = {
  profileId: string;
  cardId: string;
  rating: Rating;
  hintsUsed: number;
  timeSpentSeconds: number;
  sessionId?: string | null;
  /**
   * Free-text explanation the learner typed after the answer reveal
   * (build spec §2.6). Null / undefined means they skipped it. Stored
   * on the review row; the grader consumes it asynchronously.
   */
  selfExplanation?: string | null;
  /** Optional clock override for tests. Defaults to `new Date()`. */
  now?: Date;
};

export type RecordReviewResult = {
  review: StoredReview;
  cardState: StoredCardState;
};

export async function recordReviewLocally(input: RecordReviewInput): Promise<RecordReviewResult> {
  const db = getLearningDB();
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();

  const existing = await db.card_states.get(input.cardId);
  // Start from existing state (if any) or the default "new card" state.
  const priorState: CardState = existing ?? {
    ease: 2.5,
    interval_days: 0,
    status: "learning",
    consecutive_again_count: 0,
    last_reviewed_at: null,
    due_at: nowIso,
  };
  const nextState = scheduleNext(priorState, input.rating, now);

  const storedState: StoredCardState = {
    ...nextState,
    card_id: input.cardId,
    profile_id: input.profileId,
    updated_at: nowIso,
  };

  // Normalise self_explanation: empty strings are "skipped", not empty
  // strings in the DB. Keeps grader input predictable.
  const trimmedExplanation = (input.selfExplanation ?? "").trim();
  const selfExplanation = trimmedExplanation.length > 0 ? trimmedExplanation : null;

  const review: StoredReview = {
    id: newReviewId(),
    profile_id: input.profileId,
    card_id: input.cardId,
    rating: input.rating,
    hints_used: input.hintsUsed,
    time_spent_seconds: input.timeSpentSeconds,
    session_id: input.sessionId ?? null,
    self_explanation: selfExplanation,
    created_at: nowIso,
    pending_sync: 1,
  };

  await db.transaction("rw", db.card_states, db.reviews, db.pending_state_pushes, async () => {
    await db.card_states.put(storedState);
    await db.reviews.put(review);
    await db.pending_state_pushes.put({
      card_id: input.cardId,
      profile_id: input.profileId,
      state: storedState,
      requested_at: nowIso,
    });
  });

  return { review, cardState: storedState };
}

/** Count unsynced reviews — surfaces "queued for sync" counters in UI. */
export async function countPendingReviews(profileId: string): Promise<number> {
  const db = getLearningDB();
  const all = await db.reviews.where("pending_sync").equals(1).toArray();
  return all.filter((r) => r.profile_id === profileId).length;
}

/** Mark a list of review ids as synced. Called by the remote-sync module. */
export async function markReviewsSynced(ids: readonly string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getLearningDB();
  await db.transaction("rw", db.reviews, async () => {
    for (const id of ids) {
      const row = await db.reviews.get(id);
      if (row) await db.reviews.put({ ...row, pending_sync: 0 });
    }
  });
}

/** Remove a pending state-push entry once it's successfully synced. */
export async function clearPendingStatePush(cardId: string): Promise<void> {
  const db = getLearningDB();
  await db.pending_state_pushes.delete(cardId);
}

/**
 * Load every review row for a profile. Used by the Progress dashboard to
 * compute streak / retention / study-time aggregates. The returned rows
 * are sorted descending by created_at so callers can paginate if the
 * history ever grows unwieldy.
 */
export async function loadAllReviews(profileId: string): Promise<StoredReview[]> {
  const db = getLearningDB();
  const rows = await db.reviews
    .where("[profile_id+created_at]")
    .between([profileId, Dexie.minKey], [profileId, Dexie.maxKey])
    .toArray();
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Wipe all SRS local state. Used on logout and in tests. */
export async function clearAllLocalState(): Promise<void> {
  const db = getLearningDB();
  await db.transaction("rw", db.card_states, db.reviews, db.pending_state_pushes, async () => {
    await db.card_states.clear();
    await db.reviews.clear();
    await db.pending_state_pushes.clear();
  });
}
