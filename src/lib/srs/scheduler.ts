import { SRS_DEFAULTS, type CardState, type Rating } from "./types";

/**
 * Pure SM-2 scheduler — given the previous state of a card and the rating
 * the learner just submitted, return the new state (including when the
 * card is due next).
 *
 * No side effects. No persistence. Deterministic given the same inputs.
 * Build spec §2.7 requires 100% coverage on this function; every public
 * branch has a dedicated test case in scheduler.test.ts.
 *
 * Intentional design notes:
 *   - Suspended cards are inert: whatever rating comes in, status stays
 *     suspended and the due date does not move. Callers are expected to
 *     unsuspend explicitly before scheduling resumes.
 *   - Leech cards behave like normal review cards as long as Again rates
 *     don't reset the counter. A single non-again rating moves them out
 *     of leech status.
 *   - Ease never drops below the floor (1.5). Interval never inverts
 *     (we clamp to >= 1 minute of forward time).
 *   - "Long interval" Again reset (spec §2.7 "Card reset on Again after
 *     long interval"): when a card that was scheduled weeks out gets an
 *     Again, we drop the ease AND collapse the interval back to the
 *     1-minute learning step. Otherwise a single lapse would stay weeks
 *     ahead and the learner gets no recovery reps.
 *   - "Don't know" (build spec §2.7 modification 3): same next-interval
 *     as Again (1 day) but does NOT decrement ease and does NOT
 *     increment the consecutive-again counter. A student who admitted
 *     ignorance hasn't consolidated a wrong mental model, so future
 *     intervals don't tighten — only the next encounter does. This is
 *     also why Don't know never promotes a card to leech: the leech
 *     trigger is a streak of confidently-wrong attempts, not a streak
 *     of acknowledged blanks.
 */
export function scheduleNext(state: CardState, rating: Rating, now: Date = new Date()): CardState {
  // Suspended cards are inert. Caller must unsuspend explicitly.
  if (state.status === "suspended") return state;

  const nowIso = now.toISOString();

  let ease = state.ease;
  let interval_days = state.interval_days;
  let consecutive_again_count = state.consecutive_again_count;
  let status = state.status;

  if (rating === "again") {
    // Ease drop, floored.
    ease = Math.max(SRS_DEFAULTS.ease_floor, ease + SRS_DEFAULTS.again_ease_delta);
    // Reset to the 1-minute learning step regardless of prior interval.
    interval_days = SRS_DEFAULTS.again_interval_minutes / (60 * 24);
    consecutive_again_count += 1;
    // Leech promotion.
    if (consecutive_again_count >= SRS_DEFAULTS.leech_threshold) {
      status = "leech";
    } else {
      // An Again on a previously-graduated card bumps it back into
      // learning (build spec §2.7 "card reset on Again after long interval").
      status = "learning";
    }
  } else if (rating === "dont_know") {
    // Same scheduling outcome as Again — card returns next day — but
    // ease stays put and the consecutive-again counter does not advance.
    // The card drops back into the learning ladder so its next encounter
    // re-introduces the content. (Suspended cards already returned at
    // the top of the function, so we don't need to check for that here.)
    interval_days = SRS_DEFAULTS.again_interval_minutes / (60 * 24);
    // consecutive_again_count, ease left untouched.
    status = "learning";
  } else {
    consecutive_again_count = 0;
    // Any non-again rating exits leech status.
    if (status === "leech") status = "review";

    // SM-2 convention: compute the next interval using the OLD ease,
    // THEN apply the ease adjustment for this rating. Otherwise Easy's
    // +0.15 would compound into the interval and we'd drift off-spec.
    if (rating === "hard") {
      interval_days = intervalFromLearning(interval_days, SRS_DEFAULTS.hard_multiplier, ease);
      ease = Math.max(SRS_DEFAULTS.ease_floor, ease + SRS_DEFAULTS.hard_ease_delta);
      status = "review";
    } else if (rating === "good") {
      interval_days = intervalFromLearning(interval_days, undefined, ease);
      // Good has no ease delta; assignment kept explicit for symmetry.
      ease = ease + SRS_DEFAULTS.good_ease_delta;
      status = "review";
    } else {
      // easy
      interval_days = intervalFromLearning(interval_days, SRS_DEFAULTS.easy_multiplier, ease);
      ease = ease + SRS_DEFAULTS.easy_ease_delta;
      status = "review";
    }
  }

  // Compute due_at from interval_days. Never reschedule before `now`.
  const dueMs = now.getTime() + interval_days * 24 * 60 * 60 * 1000;
  const due_at = new Date(Math.max(dueMs, now.getTime() + 60_000)).toISOString();

  return {
    ease,
    interval_days,
    status,
    consecutive_again_count,
    last_reviewed_at: nowIso,
    due_at,
  };
}

/**
 * Interval calculation for non-Again ratings.
 *
 * Learning-phase cards (interval_days < 1, meaning the minute-scale
 * learning step or a brand-new card) graduate to exactly 1 day on
 * Good/Easy/Hard — this matches SM-2's "first graduation" step.
 * Subsequent reviews multiply the prior interval by rating-specific
 * factors (or by the current ease on Good).
 */
function intervalFromLearning(
  prev_interval_days: number,
  ratingMultiplier: number | undefined,
  ease: number,
): number {
  if (prev_interval_days < 1) {
    // Graduate. Easy still gets its 1.3x boost on top of the 1-day base.
    if (ratingMultiplier === SRS_DEFAULTS.easy_multiplier) {
      return SRS_DEFAULTS.first_good_interval_days * SRS_DEFAULTS.easy_multiplier;
    }
    return SRS_DEFAULTS.first_good_interval_days;
  }
  // Graduated card: Good uses ease, Hard × 1.2, Easy × ease × 1.3.
  if (ratingMultiplier === SRS_DEFAULTS.hard_multiplier) {
    return prev_interval_days * SRS_DEFAULTS.hard_multiplier;
  }
  if (ratingMultiplier === SRS_DEFAULTS.easy_multiplier) {
    return prev_interval_days * ease * SRS_DEFAULTS.easy_multiplier;
  }
  // Good.
  return prev_interval_days * ease;
}
