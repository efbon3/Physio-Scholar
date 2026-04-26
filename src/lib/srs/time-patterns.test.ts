import { describe, expect, it } from "vitest";

import type { StoredReview } from "./db";
import { computeTimePatterns, DAY_LABELS } from "./time-patterns";

function review(created_at: string): StoredReview {
  return {
    id: `r-${created_at}`,
    profile_id: "p1",
    card_id: "m:1",
    rating: "good",
    hints_used: 0,
    time_spent_seconds: 30,
    session_id: null,
    self_explanation: null,
    created_at,
    pending_sync: 0,
  };
}

describe("computeTimePatterns", () => {
  it("returns a 7x24 zero grid when no reviews", () => {
    const result = computeTimePatterns({ reviews: [] });
    expect(result.grid).toHaveLength(7);
    for (const row of result.grid) expect(row).toHaveLength(24);
    expect(result.totalReviews).toBe(0);
    expect(result.peakDayOfWeek).toBeNull();
    expect(result.peakHour).toBeNull();
  });

  it("buckets reviews by local day-of-week and hour", () => {
    // Use ISO strings without offsets — Date interprets as UTC, then
    // .getDay()/.getHours() apply the host's local TZ. To make the test
    // deterministic across TZs, generate the timestamps from a Date
    // built locally so we know what bucket they land in.
    const review1 = new Date(2026, 3, 13, 9, 0, 0); // 2026-04-13 09:00 local — Monday
    const review2 = new Date(2026, 3, 13, 9, 30, 0); // same hour bucket
    const review3 = new Date(2026, 3, 14, 22, 0, 0); // 2026-04-14 22:00 local — Tuesday

    const result = computeTimePatterns({
      reviews: [
        review(review1.toISOString()),
        review(review2.toISOString()),
        review(review3.toISOString()),
      ],
    });

    expect(result.totalReviews).toBe(3);
    expect(result.grid[review1.getDay()][9]).toBe(2);
    expect(result.grid[review3.getDay()][22]).toBe(1);
    expect(result.peakDayOfWeek).toBe(review1.getDay());
    expect(result.peakHour).toBe(9);
  });

  it("ignores rows with unparseable timestamps", () => {
    const review1 = new Date(2026, 3, 13, 9, 0, 0);
    const result = computeTimePatterns({
      reviews: [review(review1.toISOString()), review("not-a-date")],
    });
    expect(result.totalReviews).toBe(1);
  });

  it("DAY_LABELS aligns with Date.getDay() ordering", () => {
    expect(DAY_LABELS).toHaveLength(7);
    expect(DAY_LABELS[0]).toBe("Sun");
    expect(DAY_LABELS[6]).toBe("Sat");
  });
});
