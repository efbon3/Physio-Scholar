import { describe, expect, it } from "vitest";

import type { StoredReview } from "./db";

import {
  activityShade,
  activityShadingThresholds,
  buildActivityCalendar,
  type ActivityCell,
} from "./activity";

function review(
  overrides: Partial<StoredReview> & { card_id: string; created_at: string },
): StoredReview {
  return {
    id: overrides.id ?? `r-${overrides.card_id}-${overrides.created_at}`,
    profile_id: overrides.profile_id ?? "p1",
    card_id: overrides.card_id,
    rating: overrides.rating ?? "good",
    hints_used: overrides.hints_used ?? 0,
    time_spent_seconds: overrides.time_spent_seconds ?? 30,
    session_id: overrides.session_id ?? null,
    self_explanation: overrides.self_explanation ?? null,
    engagement_method: null,
    created_at: overrides.created_at,
    pending_sync: overrides.pending_sync ?? 0,
  };
}

describe("buildActivityCalendar", () => {
  const titles = new Map([
    ["frank-starling", "Frank-Starling Chapter"],
    ["baroreceptor-reflex", "Baroreceptor Reflex"],
  ]);

  it("returns exactly `days` cells, oldest first", () => {
    const cells = buildActivityCalendar({
      reviews: [],
      now: new Date("2026-05-15T12:00:00Z"),
      days: 7,
      mechanismTitles: titles,
    });
    expect(cells).toHaveLength(7);
    expect(cells[0]!.dateKey < cells[6]!.dateKey).toBe(true);
  });

  it("includes today as the last cell", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({ reviews: [], now, days: 5, mechanismTitles: titles });
    // Last cell should match today's local date key.
    expect(cells.at(-1)!.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns count and breakdown for a day with reviews", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({
      reviews: [
        review({ card_id: "frank-starling:1", created_at: "2026-05-14T10:00:00Z" }),
        review({ card_id: "frank-starling:2", created_at: "2026-05-14T11:00:00Z" }),
        review({ card_id: "baroreceptor-reflex:1", created_at: "2026-05-14T12:00:00Z" }),
      ],
      now,
      days: 5,
      mechanismTitles: titles,
    });
    const cell = cells.find((c) => c.dateKey.endsWith("-14"))!;
    expect(cell.count).toBe(3);
    expect(cell.byChapter).toEqual([
      { chapterId: "frank-starling", title: "Frank-Starling Chapter", count: 2 },
      { chapterId: "baroreceptor-reflex", title: "Baroreceptor Reflex", count: 1 },
    ]);
  });

  it("sorts breakdown by count desc, then title asc on ties", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({
      reviews: [
        review({ card_id: "frank-starling:1", created_at: "2026-05-15T10:00:00Z" }),
        review({ card_id: "baroreceptor-reflex:1", created_at: "2026-05-15T11:00:00Z" }),
      ],
      now,
      days: 1,
      mechanismTitles: titles,
    });
    expect(cells[0]!.byChapter.map((b) => b.title)).toEqual([
      "Baroreceptor Reflex",
      "Frank-Starling Chapter",
    ]);
  });

  it("falls back to Chapter id when title is missing from the lookup", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({
      reviews: [review({ card_id: "orphan-Chapter:1", created_at: "2026-05-15T10:00:00Z" })],
      now,
      days: 1,
      mechanismTitles: titles,
    });
    expect(cells[0]!.byChapter[0]!.title).toBe("orphan-Chapter");
  });

  it("ignores malformed card ids without crashing", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({
      reviews: [
        review({ card_id: "no-colon-here", created_at: "2026-05-15T10:00:00Z" }),
        review({ card_id: "frank-starling:1", created_at: "2026-05-15T11:00:00Z" }),
      ],
      now,
      days: 1,
      mechanismTitles: titles,
    });
    expect(cells[0]!.count).toBe(1);
  });

  it("ignores reviews with non-finite timestamps", () => {
    const now = new Date("2026-05-15T12:00:00Z");
    const cells = buildActivityCalendar({
      reviews: [review({ card_id: "frank-starling:1", created_at: "not-a-date" })],
      now,
      days: 1,
      mechanismTitles: titles,
    });
    expect(cells[0]!.count).toBe(0);
  });
});

describe("activityShadingThresholds + activityShade", () => {
  function bucket(counts: number[]): ActivityCell[] {
    return counts.map((c, i) => ({ dateKey: `2026-05-0${i + 1}`, count: c, byChapter: [] }));
  }

  it("returns all-zero thresholds when there's no activity", () => {
    const t = activityShadingThresholds(bucket([0, 0, 0]));
    expect(t).toEqual([0, 0, 0, 0]);
  });

  it("classifies 0 count as shade 0", () => {
    const t = activityShadingThresholds(bucket([1, 5, 10, 20]));
    expect(activityShade(0, t)).toBe(0);
  });

  it("classifies the highest count as shade 4 (top quartile)", () => {
    const t = activityShadingThresholds(bucket([1, 5, 10, 20]));
    expect(activityShade(20, t)).toBe(4);
  });

  it("classifies a low count as shade 1 (bottom non-zero quartile)", () => {
    const t = activityShadingThresholds(bucket([1, 5, 10, 20]));
    expect(activityShade(1, t)).toBe(1);
  });
});
