import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import type { ChapterProgress } from "./progress";
import { pickDailyChallenge, pickWeakestMechanism, uniqueMechanisms } from "./today-widgets";

function ChapterProgress(
  chapterId: string,
  masteryPct: number | null,
  seen: number,
): ChapterProgress {
  return {
    chapterId,
    title: chapterId.replace(/-/g, " "),
    seen,
    total: seen + 1,
    masteryPct,
    lastReviewedMs: seen > 0 ? Date.now() : null,
  };
}

describe("pickWeakestMechanism", () => {
  it("returns null when nothing has been reviewed", () => {
    const result = pickWeakestMechanism([
      ChapterProgress("frank-starling", null, 0),
      ChapterProgress("baroreceptor-reflex", null, 0),
    ]);
    expect(result).toBeNull();
  });

  it("ignores mechanisms with no reviewed cards", () => {
    const result = pickWeakestMechanism([
      ChapterProgress("frank-starling", 80, 5),
      ChapterProgress("baroreceptor-reflex", null, 0),
    ]);
    expect(result?.chapterId).toBe("frank-starling");
  });

  it("picks the Chapter with lowest mastery", () => {
    const result = pickWeakestMechanism([
      ChapterProgress("frank-starling", 75, 5),
      ChapterProgress("baroreceptor-reflex", 30, 4),
      ChapterProgress("renal-clearance", 60, 6),
    ]);
    expect(result?.chapterId).toBe("baroreceptor-reflex");
    expect(result?.masteryPct).toBe(30);
  });

  it("returns the first match when several share the lowest mastery", () => {
    const result = pickWeakestMechanism([ChapterProgress("a", 40, 3), ChapterProgress("b", 40, 3)]);
    // Stable: first wins. Either is "fine" but tests should be deterministic.
    expect(result?.chapterId).toBe("a");
  });
});

describe("pickDailyChallenge", () => {
  const mechanisms = [
    { id: "frank-starling", title: "Frank-Starling" },
    { id: "baroreceptor-reflex", title: "Baroreceptor reflex" },
    { id: "renal-clearance", title: "Renal clearance" },
  ];

  it("returns null when the candidate list is empty", () => {
    expect(pickDailyChallenge(new Date("2026-04-25"), [])).toBeNull();
  });

  it("returns the same pick for the same day", () => {
    const a = pickDailyChallenge(new Date("2026-04-25T03:00:00Z"), mechanisms);
    const b = pickDailyChallenge(new Date("2026-04-25T22:00:00Z"), mechanisms);
    expect(a?.chapterId).toBe(b?.chapterId);
  });

  it("rolls over the day to a different pick", () => {
    const day1 = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), mechanisms);
    const day2 = pickDailyChallenge(new Date("2026-04-26T12:00:00Z"), mechanisms);
    expect(day1?.chapterId).not.toBe(day2?.chapterId);
  });

  it("is order-insensitive on input (sorts internally)", () => {
    const reversed = [...mechanisms].reverse();
    const a = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), mechanisms);
    const b = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), reversed);
    expect(a?.chapterId).toBe(b?.chapterId);
  });
});

describe("uniqueMechanisms", () => {
  function card(Chapter: string, index: number): Card {
    return {
      id: `${Chapter}:${index}`,
      chapter_id: Chapter,
      index,
      format: "descriptive",
      status: "published",
      type: "free-recall",
      blooms_level: "understand",
      priority: "should",
      difficulty: "standard",
      stem: "stem",
      correct_answer: "ans",
      elaborative_explanation: "why",
      hints: [],
      misconceptions: [],
      exam_patterns: ["mbbs"],
    };
  }

  it("deduplicates by chapter_id and resolves titles", () => {
    const cards = [card("a", 1), card("a", 2), card("b", 1)];
    const titles = new Map([
      ["a", "Alpha"],
      ["b", "Beta"],
    ]);
    expect(uniqueMechanisms(cards, titles)).toEqual([
      { id: "a", title: "Alpha" },
      { id: "b", title: "Beta" },
    ]);
  });

  it("falls back to the id when no title is registered", () => {
    const cards = [card("orphan", 1)];
    const titles = new Map<string, string>();
    expect(uniqueMechanisms(cards, titles)).toEqual([{ id: "orphan", title: "orphan" }]);
  });
});
