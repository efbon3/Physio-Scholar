import { describe, expect, it } from "vitest";

import { normaliseMechanismId } from "./filters";

describe("normaliseMechanismId", () => {
  it("returns the trimmed kebab-case id for a valid string", () => {
    expect(normaliseMechanismId("frank-starling")).toBe("frank-starling");
    expect(normaliseMechanismId("  baroreceptor-reflex  ")).toBe("baroreceptor-reflex");
  });

  it("accepts the first element when an array is passed", () => {
    expect(normaliseMechanismId(["frank-starling", "other"])).toBe("frank-starling");
  });

  it("returns null for missing values", () => {
    expect(normaliseMechanismId(undefined)).toBeNull();
    expect(normaliseMechanismId(null)).toBeNull();
    expect(normaliseMechanismId("")).toBeNull();
    expect(normaliseMechanismId("   ")).toBeNull();
    expect(normaliseMechanismId([])).toBeNull();
  });

  it("rejects traversal and path-shaped values", () => {
    expect(normaliseMechanismId("../secret")).toBeNull();
    expect(normaliseMechanismId("frank/starling")).toBeNull();
    expect(normaliseMechanismId("frank\\starling")).toBeNull();
    expect(normaliseMechanismId("frank.starling")).toBeNull();
    expect(normaliseMechanismId("frank starling")).toBeNull();
  });

  it("rejects uppercase / non-kebab characters", () => {
    expect(normaliseMechanismId("FrankStarling")).toBeNull();
    expect(normaliseMechanismId("frank_starling")).toBeNull();
    expect(normaliseMechanismId("frank$tarling")).toBeNull();
    expect(normaliseMechanismId("frank+starling")).toBeNull();
  });

  it("accepts numeric and hyphenated ids", () => {
    expect(normaliseMechanismId("cardiac-cycle-1")).toBe("cardiac-cycle-1");
    expect(normaliseMechanismId("v1")).toBe("v1");
  });
});
