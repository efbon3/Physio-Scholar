import type { BloomsLevel, Card } from "@/lib/content/cards";

import type { StoredReview } from "./db";

/**
 * Per-Bloom's-level review breakdown — how the learner is performing
 * across the four cognitive levels v1 supports (remember, understand,
 * apply, analyze).
 *
 * The shape mirrors `ChapterProgress` deliberately: the Progress tab
 * renders a small four-row table next to the per-Chapter list, so a
 * learner can see "you're 92% on remember-level questions but 51% on
 * analyze-level — that's the gap to close before the exam."
 *
 * Pure function; takes pre-loaded reviews + cards. Tests live alongside.
 */

export type BloomBucket = {
  level: BloomsLevel;
  /** Total reviews of cards at this level. */
  totalReviews: number;
  /** Reviews graded `good` or `easy` (same definition as overall retention). */
  successfulReviews: number;
  /** null when totalReviews === 0. */
  retentionPct: number | null;
};

export type BloomBreakdown = {
  buckets: BloomBucket[];
  /** Convenience flag for the UI's "no data yet" empty state. */
  hasAnyReviews: boolean;
};

/**
 * Stable order — the four levels go from lowest to highest cognitive
 * depth so the table reads top-to-bottom in the same direction as
 * Bloom's pyramid. Levels with zero reviews are still returned with
 * count=0 so the shape is predictable for the UI.
 */
const LEVEL_ORDER: readonly BloomsLevel[] = ["remember", "understand", "apply", "analyze"];

export function computeBloomBreakdown({
  reviews,
  allCards,
}: {
  reviews: readonly StoredReview[];
  allCards: readonly Card[];
}): BloomBreakdown {
  const cardLevel = new Map<string, BloomsLevel>();
  for (const c of allCards) cardLevel.set(c.id, c.blooms_level);

  const counts = new Map<BloomsLevel, { total: number; success: number }>();
  for (const level of LEVEL_ORDER) counts.set(level, { total: 0, success: 0 });

  let any = false;
  for (const r of reviews) {
    const level = cardLevel.get(r.card_id);
    if (!level) continue;
    const entry = counts.get(level);
    if (!entry) continue;
    entry.total += 1;
    if (r.rating === "good" || r.rating === "easy") entry.success += 1;
    any = true;
  }

  const buckets: BloomBucket[] = LEVEL_ORDER.map((level) => {
    const entry = counts.get(level) ?? { total: 0, success: 0 };
    return {
      level,
      totalReviews: entry.total,
      successfulReviews: entry.success,
      retentionPct: entry.total === 0 ? null : Math.round((entry.success / entry.total) * 100),
    };
  });

  return { buckets, hasAnyReviews: any };
}
