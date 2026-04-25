import { describe, expect, it } from "vitest";

import type { Card, DifficultyLevel, PriorityLevel } from "./cards";
import {
  applyCardFilters,
  encodeFilterParam,
  parseDifficultyFilter,
  parsePriorityFilter,
} from "./card-filters";

function card(id: string, priority: PriorityLevel, difficulty: DifficultyLevel): Card {
  return {
    id,
    mechanism_id: id.split(":")[0] ?? "mech",
    index: Number.parseInt(id.split(":")[1] ?? "1", 10),
    type: "recall",
    blooms_level: "understand",
    priority,
    difficulty,
    stem: "stem",
    correct_answer: "a",
    elaborative_explanation: "e",
    hints: [],
    misconceptions: [],
    exam_patterns: ["mbbs"],
  };
}

describe("parsePriorityFilter", () => {
  it("returns null when the param is undefined or empty", () => {
    expect(parsePriorityFilter(undefined)).toBeNull();
    expect(parsePriorityFilter("")).toBeNull();
    expect(parsePriorityFilter([])).toBeNull();
  });

  it("parses a single canonical token", () => {
    expect(parsePriorityFilter("must")).toEqual(["must"]);
  });

  it("parses a CSV of canonical tokens, lowercased and deduped", () => {
    expect(parsePriorityFilter("must,should,Must")).toEqual(["must", "should"]);
  });

  it("accepts an array form (Next.js searchParams shape)", () => {
    expect(parsePriorityFilter(["must", "good"])).toEqual(["must", "good"]);
  });

  it("silently drops unknown tokens", () => {
    expect(parsePriorityFilter("must,critical,xyz")).toEqual(["must"]);
  });

  it("returns null when every token is unknown", () => {
    expect(parsePriorityFilter("nope,zzz")).toBeNull();
  });
});

describe("parseDifficultyFilter", () => {
  it("returns null on empty input", () => {
    expect(parseDifficultyFilter(undefined)).toBeNull();
    expect(parseDifficultyFilter("")).toBeNull();
  });

  it("parses canonical difficulty tokens", () => {
    expect(parseDifficultyFilter("foundational,advanced")).toEqual(["foundational", "advanced"]);
  });

  it("does not coerce synonyms (only canonical values pass at the URL boundary)", () => {
    // The parser inside `cards.ts` accepts synonyms during authoring;
    // URL params come from our own UI, so we keep them strict to avoid
    // a confusingly broad surface.
    expect(parseDifficultyFilter("intermediate")).toBeNull();
  });
});

describe("applyCardFilters", () => {
  const cards = [
    card("a:1", "must", "foundational"),
    card("a:2", "must", "advanced"),
    card("a:3", "should", "standard"),
    card("a:4", "good", "advanced"),
    card("a:5", "should", "foundational"),
  ];

  it("returns every card when both filters are absent", () => {
    expect(applyCardFilters(cards, {}).map((c) => c.id)).toEqual([
      "a:1",
      "a:2",
      "a:3",
      "a:4",
      "a:5",
    ]);
  });

  it("filters by priority only", () => {
    const out = applyCardFilters(cards, { priority: ["must"] });
    expect(out.map((c) => c.id)).toEqual(["a:1", "a:2"]);
  });

  it("filters by difficulty only", () => {
    const out = applyCardFilters(cards, { difficulty: ["foundational"] });
    expect(out.map((c) => c.id)).toEqual(["a:1", "a:5"]);
  });

  it("composes priority AND difficulty (not OR)", () => {
    const out = applyCardFilters(cards, {
      priority: ["must"],
      difficulty: ["advanced"],
    });
    expect(out.map((c) => c.id)).toEqual(["a:2"]);
  });

  it("multi-select inside a single axis is OR within that axis", () => {
    const out = applyCardFilters(cards, { priority: ["must", "good"] });
    expect(out.map((c) => c.id)).toEqual(["a:1", "a:2", "a:4"]);
  });

  it("treats an empty array on either axis as 'no filter on this axis'", () => {
    const out = applyCardFilters(cards, { priority: [], difficulty: ["foundational"] });
    expect(out.map((c) => c.id)).toEqual(["a:1", "a:5"]);
  });

  it("does not mutate the input array", () => {
    const before = cards.map((c) => c.id);
    applyCardFilters(cards, { priority: ["must"] });
    expect(cards.map((c) => c.id)).toEqual(before);
  });
});

describe("encodeFilterParam", () => {
  it("returns null for empty selection (caller omits the param)", () => {
    expect(encodeFilterParam(null)).toBeNull();
    expect(encodeFilterParam(undefined)).toBeNull();
    expect(encodeFilterParam([])).toBeNull();
  });

  it("joins values with commas", () => {
    expect(encodeFilterParam(["must", "should"])).toBe("must,should");
  });
});
