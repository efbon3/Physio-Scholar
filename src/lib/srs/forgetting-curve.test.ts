import { describe, expect, it } from "vitest";

import type { StoredReview } from "./db";
import type { Rating } from "./types";

import { computeForgettingCurve } from "./forgetting-curve";

function review(card_id: string, rating: Rating, created_at: string): StoredReview {
  return {
    id: `r-${card_id}-${created_at}`,
    profile_id: "p1",
    card_id,
    rating,
    hints_used: 0,
    time_spent_seconds: 30,
    session_id: null,
    self_explanation: null,
    created_at,
    pending_sync: 0,
  };
}

describe("computeForgettingCurve", () => {
  it("returns all buckets empty when there are no reviews", () => {
    const result = computeForgettingCurve({ reviews: [] });
    expect(result.hasAnyData).toBe(false);
    expect(result.totalAttempts).toBe(0);
    expect(result.buckets.length).toBeGreaterThan(0);
    expect(result.buckets.every((b) => b.attempts === 0)).toBe(true);
    expect(result.buckets.every((b) => b.retentionPct === null)).toBe(true);
  });

  it("ignores cards with only one review (no pair to form)", () => {
    const result = computeForgettingCurve({
      reviews: [review("m:1", "good", "2026-04-01T00:00:00Z")],
    });
    expect(result.hasAnyData).toBe(false);
  });

  it("buckets a single 1d-apart pair into the 1d bucket", () => {
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2026-04-01T00:00:00Z"),
        review("m:1", "good", "2026-04-02T00:00:00Z"),
      ],
    });
    const oneDay = result.buckets.find((b) => b.label === "1d")!;
    expect(oneDay.attempts).toBe(1);
    expect(oneDay.successes).toBe(1);
    expect(oneDay.retentionPct).toBe(100);
  });

  it("treats `again` and `hard` as failures", () => {
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2026-04-01T00:00:00Z"),
        review("m:1", "again", "2026-04-02T00:00:00Z"),
        review("m:2", "good", "2026-04-01T00:00:00Z"),
        review("m:2", "hard", "2026-04-02T00:00:00Z"),
      ],
    });
    const oneDay = result.buckets.find((b) => b.label === "1d")!;
    expect(oneDay.attempts).toBe(2);
    expect(oneDay.successes).toBe(0);
    expect(oneDay.retentionPct).toBe(0);
  });

  it("buckets multi-step histories by successive gaps, not first-to-last", () => {
    // 4 reviews, 3 successive gaps: 1d, 7d, 2d
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2026-04-01T00:00:00Z"),
        review("m:1", "good", "2026-04-02T00:00:00Z"), // gap 1d
        review("m:1", "good", "2026-04-09T00:00:00Z"), // gap 7d
        review("m:1", "again", "2026-04-11T00:00:00Z"), // gap 2d
      ],
    });
    const oneDay = result.buckets.find((b) => b.label === "1d")!;
    const twoToThree = result.buckets.find((b) => b.label === "2-3d")!;
    const oneToTwoWk = result.buckets.find((b) => b.label === "1-2w")!;

    expect(oneDay.attempts).toBe(1);
    expect(oneDay.successes).toBe(1);
    expect(twoToThree.attempts).toBe(1);
    expect(twoToThree.successes).toBe(0);
    expect(oneToTwoWk.attempts).toBe(1);
    expect(oneToTwoWk.successes).toBe(1);
    expect(result.totalAttempts).toBe(3);
  });

  it("rounds retention to integer percentages", () => {
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2026-04-01T00:00:00Z"),
        review("m:1", "good", "2026-04-02T00:00:00Z"),
        review("m:2", "again", "2026-04-01T00:00:00Z"),
        review("m:2", "again", "2026-04-02T00:00:00Z"),
        review("m:3", "good", "2026-04-01T00:00:00Z"),
        review("m:3", "again", "2026-04-02T00:00:00Z"),
      ],
    });
    const oneDay = result.buckets.find((b) => b.label === "1d")!;
    // 1 success out of 3 attempts = 33%
    expect(oneDay.attempts).toBe(3);
    expect(oneDay.retentionPct).toBe(33);
  });

  it("is order-independent (sorts each card's reviews internally)", () => {
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2026-04-09T00:00:00Z"),
        review("m:1", "good", "2026-04-01T00:00:00Z"),
        review("m:1", "again", "2026-04-02T00:00:00Z"),
      ],
    });
    // Pairs after sort: (4-01 → 4-02 = 1d, good), (4-02 → 4-09 = 7d, good)
    const oneDay = result.buckets.find((b) => b.label === "1d")!;
    const oneToTwoWk = result.buckets.find((b) => b.label === "1-2w")!;
    expect(oneDay.attempts).toBe(1);
    expect(oneDay.successes).toBe(0);
    expect(oneToTwoWk.attempts).toBe(1);
    expect(oneToTwoWk.successes).toBe(1);
  });

  it("places very-long gaps in the 2mo+ tail bucket", () => {
    const result = computeForgettingCurve({
      reviews: [
        review("m:1", "good", "2025-12-01T00:00:00Z"),
        review("m:1", "good", "2026-04-01T00:00:00Z"),
      ],
    });
    const tail = result.buckets.find((b) => b.label === "2mo+")!;
    expect(tail.attempts).toBe(1);
  });
});
