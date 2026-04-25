import type { StoredReview } from "./db";

/**
 * Time-of-day study-pattern analytics.
 *
 * The Progress tab surfaces a small heatmap so a learner can see when
 * they actually study — Tuesday evenings? Saturday mornings? — and
 * tune their schedule. This is private personal analytics; no cohort
 * comparison.
 *
 * Buckets review timestamps into a 7×24 grid (day-of-week × hour) in
 * the learner's local timezone. Pure function — deterministic given
 * the rows and the `now` reference.
 *
 * `now` is unused for the grid itself but reserved here so the UI can
 * trivially extend to "last 30 days only" or similar without breaking
 * the call signature.
 */

export type TimePatternGrid = {
  /**
   * `grid[dayOfWeek][hour]` — count of reviews. dayOfWeek is 0 = Sunday
   * through 6 = Saturday (matches `Date.prototype.getDay()`); hour is
   * 0-23 (24-hour clock).
   */
  grid: number[][];
  /** Sum of grid — convenience for the UI's "showing N reviews" caption. */
  totalReviews: number;
  /** 0-6 day-of-week with the highest count. null if no reviews. */
  peakDayOfWeek: number | null;
  /** 0-23 hour-of-day with the highest count. null if no reviews. */
  peakHour: number | null;
};

const DAYS = 7;
const HOURS = 24;

function emptyGrid(): number[][] {
  return Array.from({ length: DAYS }, () => Array.from({ length: HOURS }, () => 0));
}

export function computeTimePatterns({
  reviews,
}: {
  reviews: readonly StoredReview[];
  /** Reserved for future windowing; ignored today. */
  now?: Date;
}): TimePatternGrid {
  const grid = emptyGrid();
  let total = 0;

  for (const r of reviews) {
    const ms = Date.parse(r.created_at);
    if (!Number.isFinite(ms)) continue;
    const d = new Date(ms);
    const dow = d.getDay();
    const hour = d.getHours();
    if (dow < 0 || dow >= DAYS) continue;
    if (hour < 0 || hour >= HOURS) continue;
    grid[dow][hour] += 1;
    total += 1;
  }

  let peakDayOfWeek: number | null = null;
  let peakDayCount = -1;
  for (let i = 0; i < DAYS; i += 1) {
    const sum = grid[i].reduce((a, b) => a + b, 0);
    if (sum > peakDayCount) {
      peakDayCount = sum;
      peakDayOfWeek = i;
    }
  }
  if (peakDayCount <= 0) peakDayOfWeek = null;

  let peakHour: number | null = null;
  let peakHourCount = -1;
  for (let h = 0; h < HOURS; h += 1) {
    let sum = 0;
    for (let dow = 0; dow < DAYS; dow += 1) sum += grid[dow][h];
    if (sum > peakHourCount) {
      peakHourCount = sum;
      peakHour = h;
    }
  }
  if (peakHourCount <= 0) peakHour = null;

  return {
    grid,
    totalReviews: total,
    peakDayOfWeek,
    peakHour,
  };
}

/** Day-of-week labels keyed by Date.getDay() result. */
export const DAY_LABELS: readonly string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
