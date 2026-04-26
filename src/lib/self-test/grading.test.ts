import { describe, expect, it } from "vitest";

import {
  computeFinalScore,
  formatScoreOutOfTen,
  hintPenaltyFor,
  scoreToSrsRating,
  selfTestRating,
  SELF_GRADE_BASE_POINTS,
} from "./grading";

describe("hintPenaltyFor", () => {
  it("returns 0 for no hints used", () => {
    expect(hintPenaltyFor(0)).toBe(0);
  });

  it("matches the author's published deduction table", () => {
    expect(hintPenaltyFor(1)).toBe(20);
    expect(hintPenaltyFor(2)).toBe(30);
    expect(hintPenaltyFor(3)).toBe(40);
  });

  it("clamps above 3 hints to the max penalty", () => {
    expect(hintPenaltyFor(4)).toBe(40);
    expect(hintPenaltyFor(99)).toBe(40);
  });

  it("treats negative hints as zero", () => {
    expect(hintPenaltyFor(-1)).toBe(0);
  });
});

describe("computeFinalScore", () => {
  it("matches base points when no hints used", () => {
    expect(computeFinalScore("correct", 0)).toBe(100);
    expect(computeFinalScore("partially-wrong", 0)).toBe(75);
    expect(computeFinalScore("partially-correct", 0)).toBe(50);
    expect(computeFinalScore("wrong", 0)).toBe(20);
  });

  it("subtracts the hint penalty from the base points", () => {
    expect(computeFinalScore("correct", 1)).toBe(80);
    expect(computeFinalScore("correct", 2)).toBe(70);
    expect(computeFinalScore("correct", 3)).toBe(60);
    expect(computeFinalScore("partially-wrong", 1)).toBe(55);
    expect(computeFinalScore("partially-correct", 2)).toBe(20);
  });

  it("floors at 0 when penalty exceeds base points", () => {
    expect(computeFinalScore("wrong", 3)).toBe(0); // 20 - 40 → -20, clamped to 0
    expect(computeFinalScore("wrong", 99)).toBe(0);
  });
});

describe("scoreToSrsRating", () => {
  it("maps 100 to easy", () => {
    expect(scoreToSrsRating(100)).toBe("easy");
  });

  it("maps 85 (boundary) to easy", () => {
    expect(scoreToSrsRating(85)).toBe("easy");
  });

  it("maps 84 to good", () => {
    expect(scoreToSrsRating(84)).toBe("good");
  });

  it("maps 60 (boundary) to good", () => {
    expect(scoreToSrsRating(60)).toBe("good");
  });

  it("maps 59 to hard", () => {
    expect(scoreToSrsRating(59)).toBe("hard");
  });

  it("maps 30 (boundary) to hard", () => {
    expect(scoreToSrsRating(30)).toBe("hard");
  });

  it("maps 29 to again", () => {
    expect(scoreToSrsRating(29)).toBe("again");
  });

  it("maps 0 to again", () => {
    expect(scoreToSrsRating(0)).toBe("again");
  });
});

describe("selfTestRating — end-to-end pipeline", () => {
  it("rewards correct + no hints with easy", () => {
    expect(selfTestRating("correct", 0)).toEqual({ finalScore: 100, rating: "easy" });
  });

  it("hint usage caps at good even when the grade is correct", () => {
    expect(selfTestRating("correct", 1).rating).toBe("good");
    expect(selfTestRating("correct", 2).rating).toBe("good");
    expect(selfTestRating("correct", 3).rating).toBe("good");
  });

  it("partially-correct with no hints lands in hard territory", () => {
    expect(selfTestRating("partially-correct", 0).rating).toBe("hard");
  });

  it("wrong always rates again, regardless of hint count", () => {
    expect(selfTestRating("wrong", 0).rating).toBe("again");
    expect(selfTestRating("wrong", 3).rating).toBe("again");
  });

  it("partially-wrong + 3 hints drops to hard", () => {
    expect(selfTestRating("partially-wrong", 3)).toEqual({ finalScore: 35, rating: "hard" });
  });

  it("partially-correct + 3 hints drops to again", () => {
    expect(selfTestRating("partially-correct", 3)).toEqual({ finalScore: 10, rating: "again" });
  });
});

describe("SELF_GRADE_BASE_POINTS — published values", () => {
  it("match the author's spec exactly", () => {
    expect(SELF_GRADE_BASE_POINTS.correct).toBe(100);
    expect(SELF_GRADE_BASE_POINTS["partially-wrong"]).toBe(75);
    expect(SELF_GRADE_BASE_POINTS["partially-correct"]).toBe(50);
    expect(SELF_GRADE_BASE_POINTS.wrong).toBe(20);
  });
});

describe("formatScoreOutOfTen", () => {
  it("renders whole tenths without a decimal point", () => {
    expect(formatScoreOutOfTen(100)).toBe("10");
    expect(formatScoreOutOfTen(80)).toBe("8");
    expect(formatScoreOutOfTen(50)).toBe("5");
    expect(formatScoreOutOfTen(0)).toBe("0");
  });

  it("renders fractional tenths with one decimal place", () => {
    expect(formatScoreOutOfTen(75)).toBe("7.5");
    expect(formatScoreOutOfTen(55)).toBe("5.5");
    expect(formatScoreOutOfTen(35)).toBe("3.5");
  });
});
