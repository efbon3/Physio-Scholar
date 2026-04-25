import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import { computeBloomBreakdown } from "./bloom-breakdown";
import type { StoredReview } from "./db";
import type { Rating } from "./types";

function card(id: string, level: Card["blooms_level"]): Card {
  return {
    id,
    mechanism_id: id.split(":")[0],
    index: Number.parseInt(id.split(":")[1] ?? "1", 10),
    type: "prediction",
    blooms_level: level,
    priority: "should",
    difficulty: "standard",
    stem: "stem",
    correct_answer: "a",
    elaborative_explanation: "e",
    hints: [],
    misconceptions: [],
    exam_patterns: [],
  };
}

function review(card_id: string, rating: Rating, when = "2026-04-01T10:00:00Z"): StoredReview {
  return {
    id: `r-${card_id}-${rating}-${when}`,
    profile_id: "p1",
    card_id,
    rating,
    hints_used: 0,
    time_spent_seconds: 30,
    session_id: null,
    self_explanation: null,
    created_at: when,
    pending_sync: 0,
  };
}

describe("computeBloomBreakdown", () => {
  it("returns four buckets in pyramid order even with no reviews", () => {
    const result = computeBloomBreakdown({ reviews: [], allCards: [] });
    expect(result.hasAnyReviews).toBe(false);
    expect(result.buckets.map((b) => b.level)).toEqual([
      "remember",
      "understand",
      "apply",
      "analyze",
    ]);
    expect(result.buckets.every((b) => b.totalReviews === 0)).toBe(true);
    expect(result.buckets.every((b) => b.retentionPct === null)).toBe(true);
  });

  it("groups reviews by the underlying card's Bloom level", () => {
    const cards = [card("m:1", "remember"), card("m:2", "apply"), card("m:3", "apply")];
    const reviews = [
      review("m:1", "good"),
      review("m:1", "again"),
      review("m:2", "good"),
      review("m:3", "easy"),
    ];
    const result = computeBloomBreakdown({ reviews, allCards: cards });
    const remember = result.buckets.find((b) => b.level === "remember")!;
    const apply = result.buckets.find((b) => b.level === "apply")!;
    expect(remember.totalReviews).toBe(2);
    expect(remember.successfulReviews).toBe(1);
    expect(remember.retentionPct).toBe(50);
    expect(apply.totalReviews).toBe(2);
    expect(apply.successfulReviews).toBe(2);
    expect(apply.retentionPct).toBe(100);
  });

  it("ignores reviews whose card is no longer in the authored universe", () => {
    const cards = [card("m:1", "apply")];
    const reviews = [review("m:1", "good"), review("ghost:1", "good")];
    const result = computeBloomBreakdown({ reviews, allCards: cards });
    const apply = result.buckets.find((b) => b.level === "apply")!;
    expect(apply.totalReviews).toBe(1);
    expect(result.hasAnyReviews).toBe(true);
  });

  it("treats `hard` and `again` as unsuccessful, `good` and `easy` as successful", () => {
    const cards = [card("m:1", "understand")];
    const reviews = [
      review("m:1", "again"),
      review("m:1", "hard"),
      review("m:1", "good"),
      review("m:1", "easy"),
    ];
    const result = computeBloomBreakdown({ reviews, allCards: cards });
    const understand = result.buckets.find((b) => b.level === "understand")!;
    expect(understand.totalReviews).toBe(4);
    expect(understand.successfulReviews).toBe(2);
    expect(understand.retentionPct).toBe(50);
  });

  it("sets hasAnyReviews=false when only orphan reviews exist", () => {
    const cards = [card("m:1", "apply")];
    const reviews = [review("ghost:1", "good")];
    const result = computeBloomBreakdown({ reviews, allCards: cards });
    expect(result.hasAnyReviews).toBe(false);
  });
});
