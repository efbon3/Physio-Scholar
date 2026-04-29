import { describe, expect, it } from "vitest";

import { bandToRating, mcqOutcomeToBand, mcqOutcomeToRating } from "./rating-mapping";

describe("bandToRating", () => {
  it("maps each band to the spec'd SM-2 rating", () => {
    expect(bandToRating("green")).toBe("good");
    expect(bandToRating("yellow")).toBe("hard");
    expect(bandToRating("red")).toBe("again");
    expect(bandToRating("dont_know")).toBe("dont_know");
  });

  it("never returns easy — the v1 paths cannot detect easy", () => {
    const ratings = (["green", "yellow", "red", "dont_know"] as const).map(bandToRating);
    expect(ratings).not.toContain("easy");
  });
});

describe("mcqOutcomeToBand", () => {
  it("correct + no hints → green", () => {
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 0 })).toBe("green");
  });

  it("correct + one hint → yellow", () => {
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 1 })).toBe("yellow");
  });

  it("correct + multiple hints → still yellow (band has no further granularity)", () => {
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 2 })).toBe("yellow");
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 3 })).toBe("yellow");
  });

  it("wrong + no hints → red", () => {
    expect(mcqOutcomeToBand({ correct: false, hintsUsed: 0 })).toBe("red");
  });

  it("wrong + any hints → red (hint usage doesn't soften wrong)", () => {
    expect(mcqOutcomeToBand({ correct: false, hintsUsed: 3 })).toBe("red");
  });

  it("dontKnow=true → dont_know regardless of correct/hints", () => {
    // Student tapped "I don't know" — `correct` is moot.
    expect(mcqOutcomeToBand({ correct: false, hintsUsed: 0, dontKnow: true })).toBe("dont_know");
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 0, dontKnow: true })).toBe("dont_know");
    expect(mcqOutcomeToBand({ correct: true, hintsUsed: 2, dontKnow: true })).toBe("dont_know");
  });

  it("mcqOutcomeToRating(dontKnow=true) → dont_know", () => {
    expect(mcqOutcomeToRating({ correct: false, hintsUsed: 0, dontKnow: true })).toBe("dont_know");
  });
});

describe("mcqOutcomeToRating", () => {
  it("composes mcqOutcomeToBand + bandToRating", () => {
    expect(mcqOutcomeToRating({ correct: true, hintsUsed: 0 })).toBe("good");
    expect(mcqOutcomeToRating({ correct: true, hintsUsed: 1 })).toBe("hard");
    expect(mcqOutcomeToRating({ correct: false, hintsUsed: 0 })).toBe("again");
  });
});
