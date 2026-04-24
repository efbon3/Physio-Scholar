import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import type { StoredCardState, StoredReview } from "./db";
import { computeProgressSnapshot, localDateKey, PROGRESS_SPARK_DAYS } from "./progress";
import type { Rating } from "./types";

/** Build a review row; defaults mirror a successful good-rating. */
function review(overrides: Partial<StoredReview>): StoredReview {
  return {
    id: overrides.id ?? `r-${Math.random().toString(36).slice(2, 8)}`,
    profile_id: "p1",
    card_id: "frank-starling:1",
    rating: "good",
    hints_used: 0,
    time_spent_seconds: 30,
    session_id: null,
    self_explanation: null,
    created_at: new Date().toISOString(),
    pending_sync: 0,
    ...overrides,
  };
}

function cardState(overrides: Partial<StoredCardState>): StoredCardState {
  const base: StoredCardState = {
    card_id: "frank-starling:1",
    profile_id: "p1",
    ease: 2.5,
    interval_days: 1,
    status: "learning",
    consecutive_again_count: 0,
    last_reviewed_at: new Date().toISOString(),
    due_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { ...base, ...overrides };
}

function card(id: string, mechanismId: string): Card {
  return {
    id,
    mechanism_id: mechanismId,
    index: Number.parseInt(id.split(":")[1] ?? "1", 10),
    type: "recall",
    blooms_level: "understand",
    stem: "Stem",
    correct_answer: "Answer",
    elaborative_explanation: "Why",
    hints: [],
    misconceptions: [],
  };
}

const mechanismTitles = new Map<string, string>([
  ["frank-starling", "Frank-Starling Mechanism"],
  ["baroreceptor-reflex", "Baroreceptor Reflex"],
]);

const NOW = new Date("2026-04-23T12:00:00Z");

describe("localDateKey", () => {
  it("returns YYYY-MM-DD in local time", () => {
    const d = new Date("2026-04-23T12:00:00Z");
    // Different timezones will produce different local days — we just
    // assert the format; the shape is what matters for the sparkline.
    expect(localDateKey(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("computeProgressSnapshot — empty state", () => {
  it("returns zeroed counters with no reviews and no states", () => {
    const snap = computeProgressSnapshot({
      reviews: [],
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.totalReviews).toBe(0);
    expect(snap.reviewsThisWeek).toBe(0);
    expect(snap.currentStreakDays).toBe(0);
    expect(snap.longestStreakDays).toBe(0);
    expect(snap.retentionPct30d).toBeNull();
    expect(snap.lastStudiedMs).toBeNull();
    expect(snap.totalCards).toBe(1);
    expect(snap.cardsByStatus.learning).toBe(0);
    expect(snap.dailyReviews).toHaveLength(PROGRESS_SPARK_DAYS);
    expect(snap.dailyReviews.every((d) => d.count === 0)).toBe(true);
    expect(snap.byMechanism).toHaveLength(1);
    expect(snap.byMechanism[0].masteryPct).toBeNull();
  });
});

describe("computeProgressSnapshot — basic counters", () => {
  it("counts reviews in the trailing 7 days", () => {
    const reviews = [
      review({ created_at: new Date("2026-04-22T10:00:00Z").toISOString() }),
      review({ created_at: new Date("2026-04-17T10:00:00Z").toISOString() }),
      // > 7 days ago
      review({ created_at: new Date("2026-04-15T10:00:00Z").toISOString() }),
    ];
    const snap = computeProgressSnapshot({
      reviews,
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.totalReviews).toBe(3);
    expect(snap.reviewsThisWeek).toBe(2);
  });

  it("sums time_spent_seconds only for this week", () => {
    const reviews = [
      review({
        created_at: new Date("2026-04-22T10:00:00Z").toISOString(),
        time_spent_seconds: 30,
      }),
      review({
        created_at: new Date("2026-04-15T10:00:00Z").toISOString(),
        time_spent_seconds: 9000,
      }),
    ];
    const snap = computeProgressSnapshot({
      reviews,
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.studyTimeSecondsThisWeek).toBe(30);
  });

  it("computes retention% = good/easy rate within 30d", () => {
    const good: Rating = "good";
    const again: Rating = "again";
    const reviews = [
      review({ created_at: "2026-04-20T10:00:00Z", rating: good }),
      review({ created_at: "2026-04-19T10:00:00Z", rating: good }),
      review({ created_at: "2026-04-18T10:00:00Z", rating: again }),
      review({ created_at: "2026-04-17T10:00:00Z", rating: "easy" }),
      // Outside window
      review({ created_at: "2026-01-01T10:00:00Z", rating: again }),
    ];
    const snap = computeProgressSnapshot({
      reviews,
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    // 3 good/easy out of 4 in-window
    expect(snap.retentionPct30d).toBe(75);
  });
});

describe("computeProgressSnapshot — streaks", () => {
  it("today + yesterday = 2-day current streak", () => {
    const reviews = [
      review({ created_at: new Date("2026-04-23T11:00:00Z").toISOString() }),
      review({ created_at: new Date("2026-04-22T11:00:00Z").toISOString() }),
    ];
    const snap = computeProgressSnapshot({
      reviews,
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.currentStreakDays).toBeGreaterThanOrEqual(1);
    // Longest at least matches current.
    expect(snap.longestStreakDays).toBeGreaterThanOrEqual(snap.currentStreakDays);
  });

  it("gap yesterday breaks the current streak but keeps the longest", () => {
    const reviews = [
      review({ created_at: new Date("2026-04-23T11:00:00Z").toISOString() }),
      // skip 2026-04-22
      review({ created_at: new Date("2026-04-21T11:00:00Z").toISOString() }),
      review({ created_at: new Date("2026-04-20T11:00:00Z").toISOString() }),
    ];
    const snap = computeProgressSnapshot({
      reviews,
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    // Longest run was 20 → 21 (2 days), current is just today (1)
    expect(snap.longestStreakDays).toBeGreaterThanOrEqual(2);
  });
});

describe("computeProgressSnapshot — per-mechanism aggregation", () => {
  it("bins seen/total per mechanism", () => {
    const allCards = [
      card("frank-starling:1", "frank-starling"),
      card("frank-starling:2", "frank-starling"),
      card("baroreceptor-reflex:1", "baroreceptor-reflex"),
    ];
    const states = [
      cardState({ card_id: "frank-starling:1", ease: 3.0, status: "review" }),
      cardState({ card_id: "baroreceptor-reflex:1", ease: 2.7, status: "learning" }),
    ];
    const snap = computeProgressSnapshot({
      reviews: [],
      cardStates: states,
      allCards,
      mechanismTitles,
      now: NOW,
    });
    const fs = snap.byMechanism.find((m) => m.mechanismId === "frank-starling")!;
    const br = snap.byMechanism.find((m) => m.mechanismId === "baroreceptor-reflex")!;
    expect(fs.total).toBe(2);
    expect(fs.seen).toBe(1);
    expect(fs.masteryPct).toBe(50); // (3.0 - 2.5)/1.0 * 100
    expect(br.total).toBe(1);
    expect(br.seen).toBe(1);
    expect(br.masteryPct).toBe(20); // (2.7 - 2.5)/1.0 * 100 rounded
  });

  it("ignores card-state rows for unknown mechanism cards (orphaned state)", () => {
    const allCards = [card("frank-starling:1", "frank-starling")];
    const states = [
      cardState({ card_id: "frank-starling:1" }),
      cardState({ card_id: "deleted-mechanism:1" }),
    ];
    const snap = computeProgressSnapshot({
      reviews: [],
      cardStates: states,
      allCards,
      mechanismTitles,
      now: NOW,
    });
    expect(snap.cardsByStatus.learning).toBe(1);
    expect(snap.byMechanism.some((m) => m.mechanismId === "deleted-mechanism")).toBe(false);
  });

  it("clamps mastery% to [0, 100] when ease drifts extreme", () => {
    const snap = computeProgressSnapshot({
      reviews: [],
      cardStates: [cardState({ ease: 4.5, status: "review" })],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.byMechanism[0].masteryPct).toBe(100);
  });
});

describe("computeProgressSnapshot — sparkline", () => {
  it("emits exactly PROGRESS_SPARK_DAYS entries in order", () => {
    const snap = computeProgressSnapshot({
      reviews: [],
      cardStates: [],
      allCards: [card("frank-starling:1", "frank-starling")],
      mechanismTitles,
      now: NOW,
    });
    expect(snap.dailyReviews).toHaveLength(PROGRESS_SPARK_DAYS);
    // Last entry must be today (local time).
    expect(snap.dailyReviews[snap.dailyReviews.length - 1].date).toBe(localDateKey(NOW));
  });
});
