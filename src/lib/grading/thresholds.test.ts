import { describe, expect, it } from "vitest";

import { gradeFor, parseGradeThresholds } from "./thresholds";

describe("gradeFor", () => {
  const thresholds = [
    { label: "A", min: 85 },
    { label: "B", min: 75 },
    { label: "C", min: 65 },
    { label: "D", min: 50 },
  ];

  it("returns the highest matching label", () => {
    expect(gradeFor(92, thresholds)).toBe("A");
    expect(gradeFor(85, thresholds)).toBe("A");
    expect(gradeFor(80, thresholds)).toBe("B");
    expect(gradeFor(50, thresholds)).toBe("D");
  });

  it("returns null when percent is below the lowest cut-off", () => {
    expect(gradeFor(40, thresholds)).toBeNull();
    expect(gradeFor(0, thresholds)).toBeNull();
  });

  it("handles unsorted input by re-sorting internally", () => {
    const unsorted = [
      { label: "C", min: 65 },
      { label: "A", min: 85 },
      { label: "B", min: 75 },
      { label: "D", min: 50 },
    ];
    expect(gradeFor(80, unsorted)).toBe("B");
    expect(gradeFor(86, unsorted)).toBe("A");
  });
});

describe("parseGradeThresholds", () => {
  it("returns fallback when input is not an array", () => {
    expect(parseGradeThresholds(null).length).toBeGreaterThan(0);
    expect(parseGradeThresholds("not an array").length).toBeGreaterThan(0);
    expect(parseGradeThresholds({}).length).toBeGreaterThan(0);
  });

  it("filters out malformed entries and keeps valid ones", () => {
    const out = parseGradeThresholds([
      { label: "A", min: 85 },
      { label: 42, min: 70 },
      { foo: "bar" },
      { label: "B", min: 75 },
    ]);
    expect(out).toEqual([
      { label: "A", min: 85 },
      { label: "B", min: 75 },
    ]);
  });

  it("falls back when nothing valid survives", () => {
    expect(parseGradeThresholds([{ foo: "bar" }, null]).length).toBeGreaterThan(0);
  });
});
