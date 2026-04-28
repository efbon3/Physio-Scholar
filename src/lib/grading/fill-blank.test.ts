import { describe, expect, it } from "vitest";

import { gradeFillBlank, type GradableCard } from "./fill-blank";

function card(overrides: Partial<GradableCard>): GradableCard {
  return {
    correct_answer: "5.6 L/min",
    acceptable_answers: ["5.6 L/min", "5.6 l/min", "5.6 liters per minute"],
    unit: "L/min",
    tolerance_pct: 0.05,
    ...overrides,
  };
}

describe("gradeFillBlank — Green band", () => {
  it("exact match against correct_answer", () => {
    expect(gradeFillBlank("5.6 L/min", card({})).grade).toBe("green");
  });

  it("matches an acceptable_answers variant", () => {
    expect(gradeFillBlank("5.6 liters per minute", card({})).grade).toBe("green");
  });

  it("is case-insensitive", () => {
    expect(gradeFillBlank("5.6 L/MIN", card({})).grade).toBe("green");
  });

  it("ignores whitespace differences", () => {
    expect(gradeFillBlank("  5.6   L/min ", card({})).grade).toBe("green");
    expect(gradeFillBlank("5.6L/min", card({})).grade).toBe("green");
  });

  it("accepts numeric value within tolerance + matching unit", () => {
    // ±5% of 5.6 → 5.32 to 5.88
    expect(gradeFillBlank("5.7 L/min", card({})).grade).toBe("green");
    expect(gradeFillBlank("5.4 L/min", card({})).grade).toBe("green");
  });

  it("accepts a numeric-only acceptable variant when authored", () => {
    const c = card({
      acceptable_answers: ["5.6 L/min", "5.6"],
    });
    expect(gradeFillBlank("5.6", c).grade).toBe("green");
  });

  it("accepts a tolerance specified at zero — exact match required (degenerate case)", () => {
    const c = card({ tolerance_pct: 0 });
    expect(gradeFillBlank("5.6 L/min", c).grade).toBe("green");
    // Just-off should not pass when tolerance is 0
    expect(gradeFillBlank("5.7 L/min", c).grade).toBe("yellow");
  });
});

describe("gradeFillBlank — Yellow band", () => {
  it("right value but wrong unit", () => {
    const result = gradeFillBlank("5.6 mL/min", card({}));
    expect(result.grade).toBe("yellow");
    expect(result.feedback).toMatch(/wrong unit/i);
  });

  it("right unit but value just outside tolerance", () => {
    // 5.6 with ±5% tolerance: 5.32–5.88. 6.0 is outside.
    const result = gradeFillBlank("6.0 L/min", card({}));
    expect(result.grade).toBe("yellow");
  });

  it("close-but-no-cigar with both wrong unit AND outside tolerance", () => {
    const result = gradeFillBlank("6.5 mL/min", card({}));
    expect(result.grade).toBe("yellow");
  });

  it("treats the no-tolerance + close-numeric case as Yellow", () => {
    // No tolerance → exact match required for Green; near-match goes Yellow.
    const c = card({ tolerance_pct: undefined });
    expect(gradeFillBlank("5.5 L/min", c).grade).toBe("yellow");
  });
});

describe("gradeFillBlank — Red band", () => {
  it("rejects empty input", () => {
    expect(gradeFillBlank("", card({})).grade).toBe("red");
    expect(gradeFillBlank("   ", card({})).grade).toBe("red");
  });

  it("rejects values far outside an order of magnitude", () => {
    expect(gradeFillBlank("100 L/min", card({})).grade).toBe("red");
    expect(gradeFillBlank("0.05 L/min", card({})).grade).toBe("red");
  });

  it("rejects garbage strings that don't parse as numeric", () => {
    expect(gradeFillBlank("abc", card({})).grade).toBe("red");
    expect(gradeFillBlank("xyz units", card({})).grade).toBe("red");
  });

  it("rejects pure-text answers when the question is numeric", () => {
    expect(gradeFillBlank("seventy beats", card({})).grade).toBe("red");
  });
});

describe("gradeFillBlank — non-numeric answers (term recall)", () => {
  it("matches a term-only acceptable answer exactly (case-insensitive)", () => {
    const c: GradableCard = {
      correct_answer: "acetylcholine",
      acceptable_answers: ["acetylcholine", "ACh"],
      unit: undefined,
      tolerance_pct: undefined,
    };
    expect(gradeFillBlank("acetylcholine", c).grade).toBe("green");
    expect(gradeFillBlank("Acetylcholine", c).grade).toBe("green");
    expect(gradeFillBlank("ACh", c).grade).toBe("green");
  });

  it("rejects a misspelled term", () => {
    const c: GradableCard = {
      correct_answer: "acetylcholine",
      acceptable_answers: ["acetylcholine"],
      unit: undefined,
      tolerance_pct: undefined,
    };
    expect(gradeFillBlank("acetylcoline", c).grade).toBe("red");
  });
});

describe("gradeFillBlank — tolerance parsing edge cases", () => {
  it("handles negative numbers (e.g. cardiac axis)", () => {
    const c: GradableCard = {
      correct_answer: "-30 degrees",
      acceptable_answers: ["-30 degrees"],
      unit: "degrees",
      tolerance_pct: 0.1,
    };
    expect(gradeFillBlank("-30 degrees", c).grade).toBe("green");
    expect(gradeFillBlank("-32 degrees", c).grade).toBe("green");
  });

  it("handles decimal-comma input (European notation)", () => {
    expect(gradeFillBlank("5,6 L/min", card({})).grade).toBe("green");
  });

  it("handles a leading-plus value", () => {
    const c = card({ correct_answer: "5.6", acceptable_answers: ["5.6"], unit: "" });
    expect(gradeFillBlank("+5.6", c).grade).toBe("green");
  });
});
