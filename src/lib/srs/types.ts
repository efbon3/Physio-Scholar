/**
 * Domain types for the SRS (spaced-repetition system).
 *
 * This module is a contract, not an implementation. The scheduler
 * (`scheduleNext`) operates only on these types; persistence layers
 * (Dexie, Supabase) build rows matching the same shapes.
 */

/**
 * Rating a learner submits at the end of a card review.
 *
 * Five values per build spec §2.7's third modification: the standard
 * SM-2 four (again / hard / good / easy) plus "dont_know" — used on
 * MCQ and fill-blank to distinguish honest acknowledgment of
 * ignorance from a confident-wrong attempt.
 */
export type Rating = "again" | "hard" | "good" | "easy" | "dont_know";

/**
 * Per-card scheduling state.
 *
 * `ease` is the SM-2 difficulty multiplier (floor 1.5 per build spec §2.7;
 * standard SM-2 uses 1.3, we raise it so struggling cards don't get stuck
 * on 1-day intervals forever).
 *
 * `interval_days` is the gap until the next scheduled review. Values below
 * 1 encode sub-day "learning steps"; after Again we requeue in-session
 * (~1 minute, encoded as `interval_days: 1/1440`), after Good/Easy on a
 * new card we jump to 1 day, then ease × interval from there.
 *
 * `status` distinguishes:
 *   - "learning": brand new, still in the initial 1-min → 1-day ladder
 *   - "review": graduated; normal SM-2 applies
 *   - "leech": failed 5 consecutive times → surfaced for remediation
 *   - "suspended": student chose to pause this card (via leech prompt)
 *
 * `consecutive_again_count` drives leech detection; resets to 0 on any
 * non-again rating.
 */
export type CardStatus = "learning" | "review" | "leech" | "suspended";

export type CardState = {
  ease: number;
  interval_days: number;
  status: CardStatus;
  consecutive_again_count: number;
  /** ISO string. Null for brand-new cards that have never been reviewed. */
  last_reviewed_at: string | null;
  /** ISO string. When the card is due next. Set by the scheduler. */
  due_at: string;
};

/** Initial SM-2 parameters (build spec §2.7). */
export const SRS_DEFAULTS = {
  ease: 2.5,
  /** Build spec raises SM-2's 1.3 floor to 1.5 to prevent stuck-card spirals. */
  ease_floor: 1.5,
  /** Again in-session: ~1 minute re-show. */
  again_interval_minutes: 1,
  /** After the learning-step Again, next Good/Easy graduates to 1 day. */
  first_good_interval_days: 1,
  /** Ease multipliers per rating. Good uses `ease` as-is. */
  hard_multiplier: 1.2,
  easy_multiplier: 1.3,
  /** Ease adjustments per rating. */
  again_ease_delta: -0.2,
  hard_ease_delta: -0.15,
  good_ease_delta: 0,
  easy_ease_delta: 0.15,
  /** Leech threshold — consecutive Agains on the same card. */
  leech_threshold: 5,
} as const;

/**
 * Build the CardState for a brand-new card. Helper so callers don't
 * have to remember the defaults.
 */
export function newCardState(now: Date = new Date()): CardState {
  return {
    ease: SRS_DEFAULTS.ease,
    interval_days: 0,
    status: "learning",
    consecutive_again_count: 0,
    last_reviewed_at: null,
    due_at: now.toISOString(),
  };
}
