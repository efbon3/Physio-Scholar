import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import { buildCohortHeatmap, type CohortCardAggregate, type MechanismMeta } from "./heatmap";

function card(id: string, mechanismId: string): Card {
  return {
    id,
    mechanism_id: mechanismId,
    index: Number.parseInt(id.split(":")[1] ?? "1", 10),
    type: "prediction",
    blooms_level: "apply",
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

function agg(
  card_id: string,
  reviews_total: number,
  reviews_last_30d: number,
  retention_pct_30d: number | null,
  unique_learners: number,
): CohortCardAggregate {
  return { card_id, reviews_total, reviews_last_30d, retention_pct_30d, unique_learners };
}

const meta = (mechanismId: string, organSystem: string, title?: string): MechanismMeta => ({
  mechanismId,
  title: title ?? mechanismId,
  organSystem,
});

describe("buildCohortHeatmap", () => {
  it("returns an empty heatmap when no aggregates exist", () => {
    const result = buildCohortHeatmap({
      aggregates: [],
      cards: [card("frank-starling:1", "frank-starling")],
      mechanismMeta: new Map([["frank-starling", meta("frank-starling", "cardiovascular")]]),
    });
    expect(result.hasAnyReviews).toBe(false);
    expect(result.totalReviews).toBe(0);
    // Mechanism with no aggregates still groups under its system
    expect(result.systems).toHaveLength(1);
    expect(result.systems[0].organSystem).toBe("cardiovascular");
    expect(result.systems[0].mechanisms[0].reviewsTotal).toBe(0);
  });

  it("groups cards into mechanisms and mechanisms into organ systems", () => {
    const cards = [
      card("frank-starling:1", "frank-starling"),
      card("frank-starling:2", "frank-starling"),
      card("nephron-filtration:1", "nephron-filtration"),
    ];
    const aggregates = [
      agg("frank-starling:1", 10, 8, 75, 5),
      agg("frank-starling:2", 6, 6, 50, 5),
      agg("nephron-filtration:1", 4, 4, 100, 3),
    ];
    const mechanismMeta = new Map<string, MechanismMeta>([
      ["frank-starling", meta("frank-starling", "cardiovascular", "Frank-Starling")],
      ["nephron-filtration", meta("nephron-filtration", "renal", "Nephron filtration")],
    ]);

    const result = buildCohortHeatmap({ aggregates, cards, mechanismMeta });
    expect(result.totalReviews).toBe(20);
    expect(result.systems).toHaveLength(2);
    // Sorted by retention ascending — cardio's weighted retention should
    // be lower than renal's (75*8 + 50*6) / 14 ≈ 64
    expect(result.systems[0].organSystem).toBe("cardiovascular");
    expect(result.systems[1].organSystem).toBe("renal");
    const cardio = result.systems[0];
    expect(cardio.retentionPct30d).toBe(64);
    expect(cardio.mechanisms).toHaveLength(1);
    const fs = cardio.mechanisms[0];
    expect(fs.title).toBe("Frank-Starling");
    expect(fs.reviewsTotal).toBe(16);
    expect(fs.reviewsLast30d).toBe(14);
    expect(fs.cardCount).toBe(2);
  });

  it("orders mechanisms inside a system by retention ascending (weakest first)", () => {
    const cards = [card("strong:1", "strong"), card("weak:1", "weak")];
    const aggregates = [agg("strong:1", 10, 10, 90, 4), agg("weak:1", 10, 10, 40, 4)];
    const mechanismMeta = new Map<string, MechanismMeta>([
      ["strong", meta("strong", "cardiovascular", "Strong topic")],
      ["weak", meta("weak", "cardiovascular", "Weak topic")],
    ]);
    const result = buildCohortHeatmap({ aggregates, cards, mechanismMeta });
    expect(result.systems).toHaveLength(1);
    expect(result.systems[0].mechanisms.map((m) => m.title)).toEqual([
      "Weak topic",
      "Strong topic",
    ]);
  });

  it("ignores aggregates for cards not in the authored universe", () => {
    const cards = [card("frank-starling:1", "frank-starling")];
    const aggregates = [agg("frank-starling:1", 5, 5, 80, 3), agg("ghost:1", 100, 100, 0, 100)];
    const mechanismMeta = new Map<string, MechanismMeta>([
      ["frank-starling", meta("frank-starling", "cardiovascular")],
    ]);
    const result = buildCohortHeatmap({ aggregates, cards, mechanismMeta });
    expect(result.totalReviews).toBe(5);
  });

  it("handles a mechanism with no aggregates (zero reviews)", () => {
    const cards = [card("untouched:1", "untouched")];
    const mechanismMeta = new Map<string, MechanismMeta>([
      ["untouched", meta("untouched", "cardiovascular", "Untouched")],
    ]);
    const result = buildCohortHeatmap({ aggregates: [], cards, mechanismMeta });
    expect(result.systems[0].mechanisms[0].retentionPct30d).toBeNull();
    expect(result.systems[0].mechanisms[0].reviewsTotal).toBe(0);
  });

  it("returns null retention when all cards have null retention_pct_30d", () => {
    const cards = [card("frank-starling:1", "frank-starling")];
    const aggregates = [agg("frank-starling:1", 5, 0, null, 3)];
    const mechanismMeta = new Map<string, MechanismMeta>([
      ["frank-starling", meta("frank-starling", "cardiovascular")],
    ]);
    const result = buildCohortHeatmap({ aggregates, cards, mechanismMeta });
    expect(result.systems[0].mechanisms[0].retentionPct30d).toBeNull();
  });
});
