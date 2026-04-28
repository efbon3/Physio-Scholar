import { describe, expect, it } from "vitest";

import type { Card } from "./cards";
import { buildMcqFromCard, canRenderAsMcq, mulberry32, seedFromString } from "./exam";

function card(overrides: Partial<Card> & { id: string }): Card {
  const base: Card = {
    id: overrides.id,
    chapter_id: overrides.id.split(":")[0] ?? "frank-starling",
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
