import type { StoredReview } from "./db";

/**
 * Forgetting-curve estimate.
 *
 * The Ebbinghaus curve relates "days since last successful encounter
 * with a card" to "probability of recall". For every card the learner
 * has rated at least twice, each successive review contributes one
 * data point: (days_since_previous_review, success_yes_or_no).
 *
 * We bucket those into a fixed set of windows (1d, 2d, 3d, 7d, 14d,
 * 30d, 60d+) and compute retention% per bucket. The result is the
 * learner's *empirical* curve — flatter than a textbook Ebbinghaus
 * because spaced-repetition is doing its job.
 *
 * The build-spec retention summary uses last-30-day correct-rate.
 * That's a single number; this is the shape of the curve. The two
 * coexist: the headline number tells you how strong recall is right
 * now, the curve tells you whether the schedule is working.
 *
 * Pure function — no side effects, no DB calls.
 */

export type ForgettingCurveBucket = {
  /** Inclusive lower bound of the days-since-last-review window. */
  minDays: number;
  /** Exclusive upper bound. `Infinity` for the tail bucket. */
  maxDays: number;
  /** Human label for the UI. */
  label: string;
  /** How many (current,previous) review pairs landed in this bucket. */
  attempts: number;
  /** How many of those were rated good or easy. */
  successes: number;
  /** null when attempts === 0. Rounded to nearest integer percent. */
  retentionPct: number | null;
};

export type ForgettingCurveEstimate = {
  buckets: ForgettingCurveBucket[];
  /** Total (current,previous) review pairs analysed. */
  totalAttempts: number;
  /** Convenience flag for the "no data yet" empty state. */
  hasAnyData: boolean;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Default bucket boundaries. Loose at the long tail — we don't have
 * enough data per learner in the early pilot to justify finer slices
 * past two months. The label shows the inclusive lower bound for the
 * UI's x-axis position; the tooltip can show the full range.
 */
const DEFAULT_BUCKETS: readonly { minDays: number; maxDays: number; label: string }[] = [
  { minDays: 0, maxDays: 1, label: "<1d" },
  { minDays: 1, maxDays: 2, label: "1d" },
  { minDays: 2, maxDays: 3, label: "2-3d" },
  { minDays: 3, maxDays: 7, label: "3-7d" },
  { minDays: 7, maxDays: 14, label: "1-2w" },
  { minDays: 14, maxDays: 30, label: "2-4w" },
  { minDays: 30, maxDays: 60, label: "1-2mo" },
  { minDays: 60, maxDays: Number.POSITIVE_INFINITY, label: "2mo+" },
];

function isSuccess(rating: StoredReview["rating"]): boolean {
  return rating === "good" || rating === "easy";
}

export function computeForgettingCurve({
  reviews,
}: {
  reviews: readonly StoredReview[];
}): ForgettingCurveEstimate {
  // Group reviews by card_id so successive pairs share the same card.
  const byCard = new Map<string, StoredReview[]>();
  for (const r of reviews) {
    const arr = byCard.get(r.card_id) ?? [];
    arr.push(r);
    byCard.set(r.card_id, arr);
  }

  const buckets = DEFAULT_BUCKETS.map((b) => ({ ...b, attempts: 0, successes: 0 }));

  for (const arr of byCard.values()) {
    if (arr.length < 2) continue;
    // Sort ascending by created_at — we need (prev, current) pairs.
    arr.sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0));
    for (let i = 1; i < arr.length; i += 1) {
      const prevMs = Date.parse(arr[i - 1].created_at);
      const currMs = Date.parse(arr[i].created_at);
      if (!Number.isFinite(prevMs) || !Number.isFinite(currMs)) continue;
      const days = (currMs - prevMs) / DAY_MS;
      if (days < 0) continue;
      const bucket = buckets.find((b) => days >= b.minDays && days < b.maxDays);
      if (!bucket) continue;
      bucket.attempts += 1;
      if (isSuccess(arr[i].rating)) bucket.successes += 1;
    }
  }

  let totalAttempts = 0;
  for (const b of buckets) totalAttempts += b.attempts;

  return {
    buckets: buckets.map((b) => ({
      minDays: b.minDays,
      maxDays: b.maxDays,
      label: b.label,
      attempts: b.attempts,
      successes: b.successes,
      retentionPct: b.attempts === 0 ? null : Math.round((b.successes / b.attempts) * 100),
    })),
    totalAttempts,
    hasAnyData: totalAttempts > 0,
  };
}
