import { describe, expect, it } from "vitest";

import {
  classifyEjectionFraction,
  ejectionFraction,
  sampleCurve,
  strokeVolume,
  type Contractility,
} from "./frank-starling-model";

describe("strokeVolume", () => {
  it("returns 0 below the unloaded EDV threshold", () => {
    expect(strokeVolume(10, "normal")).toBe(0);
    expect(strokeVolume(40, "normal")).toBe(0);
  });

  it("rises monotonically across the physiologic range", () => {
    let prev = strokeVolume(60, "normal");
    for (const edv of [80, 100, 120, 150, 180, 220]) {
      const next = strokeVolume(edv, "normal");
      expect(next).toBeGreaterThanOrEqual(prev);
      prev = next;
    }
  });

  it("asymptotes toward the per-contractility ceiling", () => {
    const ceilingNormal = strokeVolume(250, "normal");
    // Should be near, but not exceed, the svMax for normal.
    expect(ceilingNormal).toBeGreaterThan(90);
    expect(ceilingNormal).toBeLessThanOrEqual(95);
  });

  it("failing heart gives less SV than normal at the same EDV", () => {
    expect(strokeVolume(120, "failing")).toBeLessThan(strokeVolume(120, "normal"));
  });

  it("enhanced contractility gives more SV than normal at the same EDV", () => {
    expect(strokeVolume(120, "enhanced")).toBeGreaterThan(strokeVolume(120, "normal"));
  });
});

describe("ejectionFraction", () => {
  it("computes percent and clamps to [0, 100]", () => {
    // Floating-point: 55/100*100 can return 55.00000000000001. toBeCloseTo
    // absorbs the noise without blunting the test.
    expect(ejectionFraction(100, 55)).toBeCloseTo(55, 5);
    expect(ejectionFraction(100, 0)).toBe(0);
    expect(ejectionFraction(100, 120)).toBe(100);
    expect(ejectionFraction(0, 20)).toBe(0);
  });
});

describe("sampleCurve", () => {
  it("produces an ascending series of samples", () => {
    const samples = sampleCurve("normal");
    expect(samples.length).toBeGreaterThan(50);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i].edvMl).toBeGreaterThan(samples[i - 1].edvMl);
      expect(samples[i].svMl).toBeGreaterThanOrEqual(samples[i - 1].svMl);
    }
  });

  it("samples all three contractility states without throwing", () => {
    const states: Contractility[] = ["failing", "normal", "enhanced"];
    for (const s of states) expect(sampleCurve(s).length).toBeGreaterThan(0);
  });
});

describe("classifyEjectionFraction", () => {
  it("labels the standard clinical tiers", () => {
    expect(classifyEjectionFraction(60)).toBe("Normal");
    expect(classifyEjectionFraction(45)).toBe("Mildly reduced");
    expect(classifyEjectionFraction(35)).toBe("Moderately reduced");
    expect(classifyEjectionFraction(20)).toBe("Severely reduced");
  });
});
