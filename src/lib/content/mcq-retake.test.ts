import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { McqOption } from "./exam";
import { buildRetakeQuestions, shuffleOptions } from "./mcq-retake";

function opt(text: string, isCorrect: boolean): McqOption {
  return { text, isCorrect };
}

describe("shuffleOptions", () => {
  it("returns the same set of options", () => {
    const input: McqOption[] = [opt("a", false), opt("b", true), opt("c", false), opt("d", false)];
    const out = shuffleOptions(input);
    expect(out).toHaveLength(input.length);
    expect(out.map((o) => o.text).sort()).toEqual(["a", "b", "c", "d"]);
    expect(out.filter((o) => o.isCorrect)).toHaveLength(1);
  });

  it("does not mutate the input", () => {
    const input: McqOption[] = [opt("a", true), opt("b", false)];
    const copy = input.map((o) => ({ ...o }));
    shuffleOptions(input);
    expect(input).toEqual(copy);
  });

  it("can produce a different ordering", () => {
    // With Math.random mocked to push the swap, the shuffle should
    // reverse a 2-element array (i=1, j=0).
    const original = Math.random;
    Math.random = () => 0;
    try {
      const out = shuffleOptions([opt("a", true), opt("b", false)]);
      expect(out[0]!.text).toBe("b");
      expect(out[1]!.text).toBe("a");
    } finally {
      Math.random = original;
    }
  });
});

describe("buildRetakeQuestions", () => {
  beforeEach(() => {
    // Lock shuffles so option ordering stays predictable for these tests.
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mechMap = new Map([
    ["mech-a:1", "mech-a"],
    ["mech-a:2", "mech-a"],
    ["mech-b:1", "mech-b"],
  ]);

  it("includes only incorrect answers", () => {
    const answers = [
      {
        cardId: "mech-a:1",
        selectedIndex: 0,
        correctIndex: 0,
        stem: "Q1",
        options: [opt("right", true), opt("wrong", false)],
        elaborativeExplanation: "...",
      },
      {
        cardId: "mech-a:2",
        selectedIndex: 1,
        correctIndex: 0,
        stem: "Q2",
        options: [opt("right", true), opt("wrong", false)],
        elaborativeExplanation: "...",
      },
    ];
    const out = buildRetakeQuestions({ answers, mechanismIdByCardId: mechMap });
    expect(out).toHaveLength(1);
    expect(out[0]!.cardId).toBe("mech-a:2");
  });

  it("includes skipped answers (selectedIndex === null)", () => {
    const answers = [
      {
        cardId: "mech-a:1",
        selectedIndex: null,
        correctIndex: 0,
        stem: "Q1",
        options: [opt("right", true), opt("wrong", false)],
        elaborativeExplanation: "...",
      },
    ];
    const out = buildRetakeQuestions({ answers, mechanismIdByCardId: mechMap });
    expect(out).toHaveLength(1);
    expect(out[0]!.cardId).toBe("mech-a:1");
  });

  it("attaches the mechanism id from the lookup", () => {
    const answers = [
      {
        cardId: "mech-b:1",
        selectedIndex: 0,
        correctIndex: 1,
        stem: "Q",
        options: [opt("a", false), opt("b", true)],
        elaborativeExplanation: "...",
      },
    ];
    const out = buildRetakeQuestions({ answers, mechanismIdByCardId: mechMap });
    expect(out[0]!.mechanismId).toBe("mech-b");
  });

  it("returns an empty list when all answers were correct", () => {
    const answers = [
      {
        cardId: "mech-a:1",
        selectedIndex: 0,
        correctIndex: 0,
        stem: "Q",
        options: [opt("right", true)],
        elaborativeExplanation: "...",
      },
    ];
    const out = buildRetakeQuestions({ answers, mechanismIdByCardId: mechMap });
    expect(out).toEqual([]);
  });

  it("preserves the correct option in the shuffled output", () => {
    vi.restoreAllMocks();
    const answers = [
      {
        cardId: "mech-a:1",
        selectedIndex: 1,
        correctIndex: 0,
        stem: "Q",
        options: [
          opt("right", true),
          opt("wrong-1", false),
          opt("wrong-2", false),
          opt("wrong-3", false),
        ],
        elaborativeExplanation: "...",
      },
    ];
    const out = buildRetakeQuestions({ answers, mechanismIdByCardId: mechMap });
    expect(out).toHaveLength(1);
    expect(out[0]!.options.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(out[0]!.options.map((o) => o.text).sort()).toEqual([
      "right",
      "wrong-1",
      "wrong-2",
      "wrong-3",
    ]);
  });
});
