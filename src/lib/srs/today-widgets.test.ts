import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import type { MechanismProgress } from "./progress";
import { pickDailyChallenge, pickWeakestMechanism, uniqueMechanisms } from "./today-widgets";

function mechanismProgress(
  mechanismId: string,
  masteryPct: number | null,
  seen: number,
): MechanismProgress {
  return {
    mechanismId,
    title: mechanismId.replace(/-/g, " "),
    seen,
    total: seen + 1,
    masteryPct,
    lastReviewedMs: seen > 0 ? Date.now() : null,
  };
}

describe("pickWeakestMechanism", () => {
  it("returns null when nothing has been reviewed", () => {
    const result = pickWeakestMechanism([
      mechanismProgress("frank-starling", null, 0),
      mechanismProgress("baroreceptor-reflex", null, 0),
    ]);
    expect(result).toBeNull();
  });

  it("ignores mechanisms with no reviewed cards", () => {
    const result = pickWeakestMechanism([
      mechanismProgress("frank-starling", 80, 5),
      mechanismProgress("baroreceptor-reflex", null, 0),
    ]);
    expect(result?.mechanismId).toBe("frank-starling");
  });

  it("picks the mechanism with lowest mastery", () => {
    const result = pickWeakestMechanism([
      mechanismProgress("frank-starling", 75, 5),
      mechanismProgress("baroreceptor-reflex", 30, 4),
      mechanismProgress("renal-clearance", 60, 6),
    ]);
    expect(result?.mechanismId).toBe("baroreceptor-reflex");
    expect(result?.masteryPct).toBe(30);
  });

  it("returns the first match when several share the lowest mastery", () => {
    const result = pickWeakestMechanism([
      mechanismProgress("a", 40, 3),
      mechanismProgress("b", 40, 3),
    ]);
    // Stable: first wins. Either is "fine" but tests should be deterministic.
    expect(result?.mechanismId).toBe("a");
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
    expect(a?.mechanismId).toBe(b?.mechanismId);
  });

  it("rolls over the day to a different pick", () => {
    const day1 = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), mechanisms);
    const day2 = pickDailyChallenge(new Date("2026-04-26T12:00:00Z"), mechanisms);
    expect(day1?.mechanismId).not.toBe(day2?.mechanismId);
  });

  it("is order-insensitive on input (sorts internally)", () => {
    const reversed = [...mechanisms].reverse();
    const a = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), mechanisms);
    const b = pickDailyChallenge(new Date("2026-04-25T12:00:00Z"), reversed);
    expect(a?.mechanismId).toBe(b?.mechanismId);
  });
});

describe("uniqueMechanisms", () => {
  function card(mechanism: string, index: number): Card {
    return {
      id: `${mechanism}:${index}`,
      mechanism_id: mechanism,
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

  it("deduplicates by mechanism_id and resolves titles", () => {
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
