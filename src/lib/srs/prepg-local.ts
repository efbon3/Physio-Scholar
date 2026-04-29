import Dexie from "dexie";

import { getLearningDB, type StoredPrepgCardState, type StoredPrepgReview } from "./db";
import { scheduleNext } from "./scheduler";
import type { CardState, Rating } from "./types";

/**
 * Pre-PG SRS operations — parallel API to the curriculum recorder in
 * `local.ts`, but writing to the `prepg_card_states` / `prepg_reviews`
 * tables instead. The scheduler is shared (pure SM-2 function); the
 * row pool is isolated so a learner's calibration on past exam
 * questions stays distinct from their curriculum calibration.
 *
 * Why a separate module: the field-by-field copy of `local.ts` keeps
 * each domain's table-name choices explicit at the call site. Parsing
 * the table name from a parameter would obscure where Pre-PG state
 * lands and make accidental cross-pool writes harder to spot in code
 * review.
 */

function newReviewId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getLocalPrepgCardState(
  profileId: string,
  cardId: string,
): Promise<StoredPrepgCardState | null> {
  const db = getLearningDB();
  const row = await db.prepg_card_states.get(cardId);
  if (!row || row.profile_id !== profileId) return null;
  return row;
}

export async function loadAllPrepgCardStates(profileId: string): Promise<StoredPrepgCardState[]> {
  const db = getLearningDB();
  return db.prepg_card_states.where("profile_id").equals(profileId).toArray();
}

export type RecordPrepgReviewInput = {
  profileId: string;
  cardId: string;
  rating: Rating;
  hintsUsed: number;
  timeSpentSeconds: number;
  sessionId?: string | null;
  /**
   * When true, record the review row but skip the card_state update.
   * Mirrors the curriculum recorder's practiceMode for symmetry; the
   * Pre-PG drill UI may want practice rounds in the future.
   */
  practiceMode?: boolean;
  /** Optional clock override for tests. Defaults to `new Date()`. */
  now?: Date;
};

export type RecordPrepgReviewResult = {
  review: StoredPrepgReview;
  cardState: StoredPrepgCardState;
  scheduleUpdated: boolean;
};

export async function recordPrepgReviewLocally(
  input: RecordPrepgReviewInput,
): Promise<RecordPrepgReviewResult> {
  const db = getLearningDB();
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();

  const existing = await db.prepg_card_states.get(input.cardId);
  const priorState: CardState = existing ?? {
    ease: 2.5,
    interval_days: 0,
    status: "learning",
    consecutive_again_count: 0,
    last_reviewed_at: null,
    due_at: nowIso,
  };
  const practiceMode = input.practiceMode === true;
  const nextState = practiceMode ? priorState : scheduleNext(priorState, input.rating, now);

  const storedState: StoredPrepgCardState = {
    ...nextState,
    card_id: input.cardId,
    profile_id: input.profileId,
    updated_at: practiceMode
      ? (existing?.updated_at ?? priorState.last_reviewed_at ?? nowIso)
      : nowIso,
  };

  const review: StoredPrepgReview = {
    id: newReviewId(),
    profile_id: input.profileId,
    card_id: input.cardId,
    rating: input.rating,
    hints_used: input.hintsUsed,
    time_spent_seconds: input.timeSpentSeconds,
    session_id: input.sessionId ?? null,
    self_explanation: null,
    engagement_method: null,
    created_at: nowIso,
    pending_sync: 1,
  };

  await db.transaction(
    "rw",
    db.prepg_card_states,
    db.prepg_reviews,
    db.pending_prepg_state_pushes,
    async () => {
      await db.prepg_reviews.put(review);
      if (!practiceMode) {
        await db.prepg_card_states.put(storedState);
        await db.pending_prepg_state_pushes.put({
          card_id: input.cardId,
          profile_id: input.profileId,
          state: storedState,
          requested_at: nowIso,
        });
      }
    },
  );

  return { review, cardState: storedState, scheduleUpdated: !practiceMode };
}

/**
 * Load every Pre-PG review row for a profile. Used by Pre-PG progress
 * surfaces (Phase 2). Sorted descending by created_at so callers can
 * paginate if the history grows unwieldy.
 */
export async function loadAllPrepgReviews(profileId: string): Promise<StoredPrepgReview[]> {
  const db = getLearningDB();
  const rows = await db.prepg_reviews
    .where("[profile_id+created_at]")
    .between([profileId, Dexie.minKey], [profileId, Dexie.maxKey])
    .toArray();
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
