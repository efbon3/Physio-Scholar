import Dexie, { type Table } from "dexie";

import type { CardStatus, Rating, CardState } from "./types";

/**
 * Local Dexie store for SRS scheduling state + review history. Separate
 * database from `physio-scholar-content` so:
 *   - content can be wiped + re-synced without touching review history
 *   - review history can be wiped on logout without re-downloading content
 *   - the two domains can evolve their schemas on independent cadences
 *
 * Schema is intentionally aligned with the Supabase tables (see
 * `supabase/migrations/20260424200000_srs_persistence.sql`): same field
 * names, same value domains. The sync layer (lands when Phase 6's
 * offline-sync gate needs it) will move rows between this DB and Supabase
 * via straight mapping — no transformation required.
 */

/**
 * Per-card SRS state row. Mirrors the `public.card_states` row in the
 * Supabase migration, with one addition: `updated_at` is stored as an
 * ISO string so it's directly comparable with Supabase's timestamptz
 * output in last-write-wins conflict resolution.
 */
export type StoredCardState = CardState & {
  card_id: string;
  profile_id: string;
  /** ISO timestamp of the local write. Drives sync-direction + conflict. */
  updated_at: string;
};

/**
 * One row per rating submission. Mirrors `public.reviews`. `pending_sync`
 * is a boolean flag (stored as 1/0 because Dexie's index values must be
 * primitives and booleans don't index reliably across browsers).
 */
export type StoredReview = {
  id: string;
  profile_id: string;
  card_id: string;
  rating: Rating;
  hints_used: number;
  time_spent_seconds: number;
  session_id: string | null;
  /**
   * Self-explanation the learner typed after reveal (build spec §2.6).
   * `null` means they skipped it (optional in Review mode). Graded
   * asynchronously by the grader — C5 uses StubGrader; Phase 4 swaps
   * in the real Claude-backed implementation.
   */
  self_explanation: string | null;
  /**
   * How the learner engaged with this descriptive question (build
   * spec §2.3). One of:
   *   - "written_peer" — wrote and checked with a peer
   *   - "written_self" — wrote and self-checked against the model
   *   - "mental"        — worked it out mentally without writing
   * `null` for non-descriptive cards or when the learner skipped the
   * prompt. Logged as analytics metadata only — does not affect SRS
   * scheduling. Sync to Supabase ships in Phase 6 alongside an
   * `engagement_method` column added in a follow-up migration.
   */
  engagement_method: "written_peer" | "written_self" | "mental" | null;
  created_at: string;
  /** 1 = waiting to push to Supabase; 0 = already pushed. */
  pending_sync: 0 | 1;
};

/**
 * Local pending-push queue for card_state updates (reviews are their own
 * natural queue via the `pending_sync` column).
 */
export type PendingStatePush = {
  card_id: string;
  profile_id: string;
  /** Snapshot of the state at push-request time. */
  state: StoredCardState;
  /** When the push was requested locally. */
  requested_at: string;
};

export class PhysioLearningDB extends Dexie {
  card_states!: Table<StoredCardState, string>;
  reviews!: Table<StoredReview, string>;
  pending_state_pushes!: Table<PendingStatePush, string>;

  constructor(databaseName = "physio-scholar-learning") {
    super(databaseName);

    this.version(1).stores({
      // Primary key: card_id. Secondary indexes for the common queries:
      //   - all of a profile's cards (profile_id)
      //   - "what's due now?" (due_at ascending, within profile)
      //   - leech/suspended filters (status)
      card_states: "card_id, profile_id, [profile_id+due_at], status, updated_at",
      // Reviews — primary key is the UUID id. Indexed by profile_id +
      // created_at desc for history reads, by pending_sync for the push
      // queue, by card_id for per-card retention analytics.
      reviews: "id, [profile_id+created_at], pending_sync, card_id",
      // Push queue for card_states. Keyed by card_id (one pending push
      // per card at a time; the latest state wins).
      pending_state_pushes: "card_id, profile_id, requested_at",
    });
  }
}

let instance: PhysioLearningDB | null = null;

/**
 * Accessor. Same SSR-safety guard as content/db.ts — IndexedDB doesn't
 * exist on the server, so early-fail with a readable message rather than
 * leak Dexie internals.
 */
export function getLearningDB(): PhysioLearningDB {
  if (typeof window === "undefined") {
    throw new Error(
      "getLearningDB() must be called from client-side code (browser or test). " +
        "IndexedDB is not available in server components, route handlers, " +
        "or the Node runtime.",
    );
  }
  if (!instance) instance = new PhysioLearningDB();
  return instance;
}

/** Test helper — reset the cached singleton so the next call opens fresh. */
export function __resetLearningDBForTests(): void {
  instance = null;
}

/** Type-export convenience for downstream modules. */
export type { CardStatus };
