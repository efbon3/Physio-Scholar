import { describe, expect, it } from "vitest";

import type { Card } from "./cards";
import {
  assembleExamSession,
  buildMcqFromCard,
  canRenderAsMcq,
  filterByExamPattern,
  mulberry32,
  seedFromString,
} from "./exam";

function card(overrides: Partial<Card> & { id: string }): Card {
  const base: Card = {
    id: overrides.id,
    mechanism_id: overrides.id.split(":")[0] ?? "frank-starling",
    index: Number.parseInt(overrides.id.split(":")[1] ?? "1", 10),
    format: "descriptive",
    status: "published",
    type: "mcq",
    blooms_level: "understand",
    priority: "should",
    difficulty: "standard",
    stem: "Stem",
    correct_answer: "Correct answer",
    elaborative_explanation: "Why.",
    hints: [],
    misconceptions: [],
    exam_patterns: ["mbbs", "pre-pg"],
  };
  return { ...base, ...overrides };
}

describe("seedFromString + mulberry32", () => {
  it("same input → same number", () => {
    expect(seedFromString("card:1")).toBe(seedFromString("card:1"));
  });

  it("different input → different number (usually)", () => {
    expect(seedFromString("card:1")).not.toBe(seedFromString("card:2"));
  });

  it("mulberry32 reproduces the same sequence for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("filterByExamPattern", () => {
  it("keeps cards tagged with the pattern", () => {
    const cards: Card[] = [
      card({ id: "m:1", exam_patterns: ["mbbs"] }),
      card({ id: "m:2", exam_patterns: ["pre-pg"] }),
      card({ id: "m:3", exam_patterns: ["mbbs", "pre-pg"] }),
    ];
    expect(filterByExamPattern(cards, "mbbs").map((c) => c.id)).toEqual(["m:1", "m:3"]);
    expect(filterByExamPattern(cards, "pre-pg").map((c) => c.id)).toEqual(["m:2", "m:3"]);
  });

  it("accepts pre-pg aliases: neet-pg, ini-cet, fmge, usmle", () => {
    const cards: Card[] = [
      card({ id: "m:1", exam_patterns: ["neet-pg"] }),
      card({ id: "m:2", exam_patterns: ["ini-cet"] }),
      card({ id: "m:3", exam_patterns: ["fmge"] }),
      card({ id: "m:4", exam_patterns: ["usmle"] }),
      card({ id: "m:5", exam_patterns: ["mbbs"] }),
    ];
    expect(filterByExamPattern(cards, "pre-pg").map((c) => c.id)).toEqual([
      "m:1",
      "m:2",
      "m:3",
      "m:4",
    ]);
  });

  it("accepts mbbs aliases: university, final-mbbs, ug", () => {
    const cards: Card[] = [
      card({ id: "m:1", exam_patterns: ["university"] }),
      card({ id: "m:2", exam_patterns: ["final-mbbs"] }),
      card({ id: "m:3", exam_patterns: ["ug"] }),
      card({ id: "m:4", exam_patterns: ["pre-pg"] }),
    ];
    expect(filterByExamPattern(cards, "mbbs").map((c) => c.id)).toEqual(["m:1", "m:2", "m:3"]);
  });
});

describe("canRenderAsMcq / buildMcqFromCard", () => {
  it("canRenderAsMcq requires at least one misconception", () => {
    expect(canRenderAsMcq(card({ id: "m:1" }))).toBe(false);
    expect(
      canRenderAsMcq(
        card({ id: "m:2", misconceptions: [{ wrong_answer: "w", description: "why" }] }),
      ),
    ).toBe(true);
  });

  it("returns null for cards that can't render as MCQ", () => {
    expect(buildMcqFromCard(card({ id: "m:1" }), 0)).toBeNull();
  });

  it("produces a question with the correct option + up to 3 wrong options", () => {
    const q = buildMcqFromCard(
      card({
        id: "m:1",
        correct_answer: "right",
        misconceptions: [
          { wrong_answer: "wrong-1", description: "w1" },
          { wrong_answer: "wrong-2", description: "w2" },
          { wrong_answer: "wrong-3", description: "w3" },
          { wrong_answer: "wrong-4", description: "w4" },
        ],
      }),
      1,
    );
    expect(q).not.toBeNull();
    expect(q!.options).toHaveLength(4);
    const correctCount = q!.options.filter((o) => o.isCorrect).length;
    expect(correctCount).toBe(1);
    // All option text should appear — no silent drops of the correct answer.
    const texts = new Set(q!.options.map((o) => o.text));
    expect(texts.has("right")).toBe(true);
    expect(q!.options.filter((o) => !o.isCorrect)).toHaveLength(3);
  });

  it("shuffle is deterministic for the same seed", () => {
    const c = card({
      id: "m:1",
      correct_answer: "A",
      misconceptions: [
        { wrong_answer: "B", description: "" },
        { wrong_answer: "C", description: "" },
        { wrong_answer: "D", description: "" },
      ],
    });
    const q1 = buildMcqFromCard(c, 42);
    const q2 = buildMcqFromCard(c, 42);
    expect(q1!.options.map((o) => o.text)).toEqual(q2!.options.map((o) => o.text));
  });
});

describe("assembleExamSession", () => {
  it("filters + drops MCQ-ineligible + slices to count", () => {
    const cards: Card[] = [
      card({
        id: "m:1",
        exam_patterns: ["mbbs"],
        misconceptions: [{ wrong_answer: "x", description: "" }],
      }),
      card({ id: "m:2", exam_patterns: ["mbbs"] }), // no misconceptions → skip
      card({
        id: "m:3",
        exam_patterns: ["pre-pg"],
        misconceptions: [{ wrong_answer: "y", description: "" }],
      }),
      card({
        id: "m:4",
        exam_patterns: ["mbbs", "pre-pg"],
        misconceptions: [{ wrong_answer: "z", description: "" }],
      }),
    ];
    const session = assembleExamSession({ cards, pattern: "mbbs", count: 10 });
    expect(session.map((q) => q.cardId).sort()).toEqual(["m:1", "m:4"]);
  });

  it("same salt → same session composition", () => {
    const cards: Card[] = Array.from({ length: 10 }).map((_, i) =>
      card({
        id: `m:${i + 1}`,
        exam_patterns: ["mbbs"],
        misconceptions: [{ wrong_answer: `w${i}`, description: "" }],
      }),
    );
    const a = assembleExamSession({
      cards,
      pattern: "mbbs",
      count: 5,
      sessionSalt: "fixed",
    });
    const b = assembleExamSession({
      cards,
      pattern: "mbbs",
      count: 5,
      sessionSalt: "fixed",
    });
    expect(a.map((q) => q.cardId)).toEqual(b.map((q) => q.cardId));
  });

  it("different salts produce different slices (given enough cards)", () => {
    const cards: Card[] = Array.from({ length: 20 }).map((_, i) =>
      card({
        id: `m:${i + 1}`,
        exam_patterns: ["mbbs"],
        misconceptions: [{ wrong_answer: `w${i}`, description: "" }],
      }),
    );
    const a = assembleExamSession({ cards, pattern: "mbbs", count: 5, sessionSalt: "a" });
    const b = assembleExamSession({ cards, pattern: "mbbs", count: 5, sessionSalt: "b" });
    // Some overlap is possible by chance; assert the orderings differ
    // rather than requiring disjoint sets.
    expect(a.map((q) => q.cardId)).not.toEqual(b.map((q) => q.cardId));
  });

  it("returns [] when no eligible cards", () => {
    const session = assembleExamSession({ cards: [], pattern: "mbbs", count: 10 });
    expect(session).toEqual([]);
  });
});
