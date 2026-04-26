import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import type { StoredCardState } from "./db";
import { classifyTopics, type TopicsOverview } from "./topic-overview";
import type { CardState } from "./types";

const NOW = new Date("2026-05-01T10:00:00Z");

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

function state(card_id: string, overrides: Partial<CardState> = {}): StoredCardState {
  return {
    card_id,
    profile_id: "p1",
    ease: 2.5,
    interval_days: 0,
    status: "learning",
    consecutive_again_count: 0,
    last_reviewed_at: null,
    due_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

const meta = (id: string, organSystem = "cardiovascular", title = id) =>
  new Map([[id, { title, organSystem }]]);

describe("classifyTopics", () => {
  it("buckets a mechanism with zero card_states as not-started", () => {
    const result: TopicsOverview = classifyTopics({
      cards: [card("frank-starling:1", "frank-starling")],
      cardStates: [],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.notStarted).toHaveLength(1);
    expect(result.notStarted[0].mechanismId).toBe("frank-starling");
    expect(result.notStarted[0].seenCards).toBe(0);
    expect(result.inProgress).toHaveLength(0);
    expect(result.completed).toHaveLength(0);
  });

  it("buckets a partially-rated mechanism as in-progress", () => {
    const result = classifyTopics({
      cards: [
        card("frank-starling:1", "frank-starling"),
        card("frank-starling:2", "frank-starling"),
      ],
      cardStates: [
        state("frank-starling:1", { status: "review", interval_days: 7 }),
        // card :2 has no state
      ],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.inProgress).toHaveLength(1);
    expect(result.inProgress[0].seenCards).toBe(1);
    expect(result.inProgress[0].totalCards).toBe(2);
    expect(result.inProgress[0].masteredCards).toBe(0);
  });

  it("buckets a fully-mastered mechanism as completed (every card review-status, interval ≥ 21d)", () => {
    const result = classifyTopics({
      cards: [
        card("frank-starling:1", "frank-starling"),
        card("frank-starling:2", "frank-starling"),
      ],
      cardStates: [
        state("frank-starling:1", {
          status: "review",
          interval_days: 30,
          due_at: "2027-01-01T00:00:00Z",
        }),
        state("frank-starling:2", {
          status: "review",
          interval_days: 21,
          due_at: "2027-01-01T00:00:00Z",
        }),
      ],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.completed).toHaveLength(1);
    expect(result.completed[0].masteredCards).toBe(2);
    expect(result.inProgress).toHaveLength(0);
  });

  it("does NOT mark completed when interval is below the 21d threshold", () => {
    const result = classifyTopics({
      cards: [card("frank-starling:1", "frank-starling")],
      cardStates: [state("frank-starling:1", { status: "review", interval_days: 14 })],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.completed).toHaveLength(0);
    expect(result.inProgress).toHaveLength(1);
  });

  it("counts due cards correctly (due_at ≤ now)", () => {
    const result = classifyTopics({
      cards: [
        card("frank-starling:1", "frank-starling"),
        card("frank-starling:2", "frank-starling"),
      ],
      cardStates: [
        state("frank-starling:1", { due_at: "2026-04-01T00:00:00Z", status: "review" }),
        state("frank-starling:2", { due_at: "2026-06-01T00:00:00Z", status: "review" }),
      ],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.inProgress[0].dueCards).toBe(1);
  });

  it("excludes suspended cards from the due count", () => {
    const result = classifyTopics({
      cards: [card("frank-starling:1", "frank-starling")],
      cardStates: [
        state("frank-starling:1", { due_at: "2026-04-01T00:00:00Z", status: "suspended" }),
      ],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.inProgress[0].dueCards).toBe(0);
  });

  it("counts leech cards", () => {
    const result = classifyTopics({
      cards: [card("frank-starling:1", "frank-starling")],
      cardStates: [state("frank-starling:1", { status: "leech" })],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    expect(result.inProgress[0].leechCards).toBe(1);
  });

  it("orders in-progress mechanisms by due-cards desc, title asc tiebreak", () => {
    const mm = new Map([
      ["a-topic", { title: "A topic", organSystem: "cardiovascular" }],
      ["b-topic", { title: "B topic", organSystem: "cardiovascular" }],
      ["c-topic", { title: "C topic", organSystem: "cardiovascular" }],
    ]);
    const result = classifyTopics({
      cards: [
        card("a-topic:1", "a-topic"),
        card("b-topic:1", "b-topic"),
        card("c-topic:1", "c-topic"),
      ],
      cardStates: [
        state("a-topic:1", { due_at: "2026-04-01T00:00:00Z", status: "review" }), // due
        state("c-topic:1", { due_at: "2026-04-01T00:00:00Z", status: "review" }), // due
        state("b-topic:1", { due_at: "2026-06-01T00:00:00Z", status: "review" }), // not due
      ],
      now: NOW,
      mechanismMeta: mm,
    });
    expect(result.inProgress.map((s) => s.title)).toEqual(["A topic", "C topic", "B topic"]);
  });

  it("ignores card_states for mechanisms not in the meta map (orphans)", () => {
    const result = classifyTopics({
      cards: [card("frank-starling:1", "frank-starling")],
      cardStates: [
        state("frank-starling:1"),
        state("retired-mechanism:1", { status: "review", interval_days: 30 }),
      ],
      now: NOW,
      mechanismMeta: meta("frank-starling"),
    });
    const all = [...result.notStarted, ...result.inProgress, ...result.completed];
    expect(all.find((s) => s.mechanismId === "retired-mechanism")).toBeUndefined();
  });
});
