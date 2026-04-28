import type { StoredReview } from "./db";
import { localDateKey } from "./progress";

/**
 * Per-day activity calendar for the Progress timeline. Returns one
 * cell per day in a fixed-length window (default 35 = 5 weeks of 7),
 * oldest first, so the rendering layer can lay out a grid without
 * computing dates itself.
 *
 * Each cell carries:
 *   - dateKey (YYYY-MM-DD, local time)
 *   - count: total reviews that day
 *   - byChapter: per-Chapter breakdown sorted by count desc, then
 *     by title asc for stability when counts tie
 *
 * Pure: no I/O, deterministic, fast to test.
 */

export type ActivityMechanismBreakdown = {
  chapterId: string;
  title: string;
  count: number;
};

export type ActivityCell = {
  dateKey: string;
  count: number;
  byChapter: ActivityMechanismBreakdown[];
};

/**
 * Pull chapter_id out of a card_id. Card ids have the shape
 * `{chapter_id}:{index}`. We pre-validate at parse time, so a
 * missing colon means a malformed row that the timeline silently
 * drops rather than crashing on.
 */
function mechanismIdFromCardId(cardId: string): string | null {
  const i = cardId.indexOf(":");
  return i > 0 ? cardId.slice(0, i) : null;
}

export function buildActivityCalendar({
  reviews,
  now,
  days = 35,
  mechanismTitles,
}: {
  reviews: readonly StoredReview[];
  now: Date;
  days?: number;
  mechanismTitles: ReadonlyMap<string, string>;
}): ActivityCell[] {
  // Aggregate per-day → per-Chapter counts in a single pass.
  const byDay = new Map<string, Map<string, number>>();
  for (const r of reviews) {
    const ts = new Date(r.created_at).getTime();
    if (!Number.isFinite(ts)) continue;
    const dateKey = localDateKey(new Date(ts));
    const mechId = mechanismIdFromCardId(r.card_id);
    if (mechId === null) continue;
    const dayBucket = byDay.get(dateKey) ?? new Map<string, number>();
    dayBucket.set(mechId, (dayBucket.get(mechId) ?? 0) + 1);
    byDay.set(dateKey, dayBucket);
  }

  const cells: ActivityCell[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = localDateKey(d);
    const dayBucket = byDay.get(dateKey);
    let count = 0;
    const breakdown: ActivityMechanismBreakdown[] = [];
    if (dayBucket) {
      for (const [mechId, mechCount] of dayBucket) {
        breakdown.push({
          chapterId: mechId,
          title: mechanismTitles.get(mechId) ?? mechId,
          count: mechCount,
        });
        count += mechCount;
      }
      breakdown.sort((a, b) => {
        if (a.count !== b.count) return b.count - a.count;
        return a.title.localeCompare(b.title);
      });
    }
    cells.push({ dateKey, count, byChapter: breakdown });
  }
  return cells;
}

/**
 * Quartile boundaries for heat shading. Returns 4 thresholds (>=0,
 * >q1, >q2, >q3) so the renderer can pick one of four shades. We
 * compute on non-zero counts only — a "1 review" day shouldn't be
 * the same shade as a 0-review day in a heat-map.
 *
 * When fewer than 4 distinct non-zero values exist (early-pilot
 * activity), the upper bands collapse, which is fine — the renderer
 * just uses fewer distinct colours.
 */
export function activityShadingThresholds(cells: readonly ActivityCell[]): number[] {
  const nonZero = cells.map((c) => c.count).filter((c) => c > 0);
  if (nonZero.length === 0) return [0, 0, 0, 0];
  const sorted = [...nonZero].sort((a, b) => a - b);
  function pick(p: number): number {
    const idx = Math.floor(p * sorted.length);
    return sorted[Math.min(sorted.length - 1, idx)] ?? 0;
  }
  return [0, pick(0.25), pick(0.5), pick(0.75)];
}

/**
 * Map a single cell's count to a shade index 0..4 (0 = no activity,
 * 4 = top quartile). Caller maps the index to a CSS class.
 */
export function activityShade(count: number, thresholds: readonly number[]): 0 | 1 | 2 | 3 | 4 {
  // Threshold semantics: each entry is the lower bound of its band, so
  // a count exactly equal to the top threshold lands in shade 4.
  if (count <= 0) return 0;
  if (count >= (thresholds[3] ?? Infinity)) return 4;
  if (count >= (thresholds[2] ?? Infinity)) return 3;
  if (count >= (thresholds[1] ?? Infinity)) return 2;
  return 1;
}
