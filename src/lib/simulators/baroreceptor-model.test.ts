import { describe, expect, it } from "vitest";

import {
  BASELINE_HR,
  BASELINE_MAP,
  deltaForStimulus,
  firingRateForMap,
  sampleTrace,
} from "./baroreceptor-model";

describe("firingRateForMap", () => {
  it("is 0 below threshold and saturates above", () => {
    expect(firingRateForMap(40)).toBe(0);
    expect(firingRateForMap(60)).toBe(0);
    const atSaturation = firingRateForMap(180);
    expect(atSaturation).toBeGreaterThanOrEqual(149);
    expect(atSaturation).toBeLessThanOrEqual(150);
  });

  it("rises monotonically across the operating range", () => {
    let prev = firingRateForMap(70);
    for (const map of [80, 90, 100, 110, 120, 140]) {
      const next = firingRateForMap(map);
      expect(next).toBeGreaterThan(prev);
      prev = next;
    }
  });

  it("crosses ~half-saturation at baseline MAP", () => {
    const f = firingRateForMap(BASELINE_MAP);
    expect(f).toBeGreaterThan(60);
    expect(f).toBeLessThan(90);
  });
});

describe("deltaForStimulus", () => {
  it("maps named stimuli to signed mmHg", () => {
    expect(deltaForStimulus("drop-30")).toBe(-30);
    expect(deltaForStimulus("drop-50")).toBe(-50);
    expect(deltaForStimulus("rise-30")).toBe(30);
    expect(deltaForStimulus("rise-50")).toBe(50);
  });
});

describe("sampleTrace", () => {
  it("produces 200 points at the default sampling rate", () => {
    const trace = sampleTrace({ stimulus: "drop-30", mode: "intact" });
    expect(trace).toHaveLength(200);
  });

  it("MAP starts near baseline, drops, then recovers toward baseline with an intact reflex", () => {
    const trace = sampleTrace({ stimulus: "drop-30", mode: "intact" });
    // Very start of the stimulus event — still near baseline
    expect(trace[0].map).toBeGreaterThan(BASELINE_MAP - 1);
    // Perturbation peak (around t=1s, index 10 at 10Hz)
    expect(trace[10].map).toBeLessThan(BASELINE_MAP - 25);
    // By the end, intact reflex has recovered most of the way back
    expect(trace[199].map).toBeGreaterThan(BASELINE_MAP - 5);
  });

  it("blocked reflex leaves MAP at the perturbed level", () => {
    const trace = sampleTrace({ stimulus: "drop-30", mode: "blocked" });
    // After ~10s, MAP should still be ~70 mmHg
    expect(trace[150].map).toBeLessThan(BASELINE_MAP - 25);
  });

  it("partial reflex settles somewhere between blocked and intact", () => {
    const blocked = sampleTrace({ stimulus: "drop-30", mode: "blocked" })[199].map;
    const partial = sampleTrace({ stimulus: "drop-30", mode: "partial" })[199].map;
    const intact = sampleTrace({ stimulus: "drop-30", mode: "intact" })[199].map;
    expect(partial).toBeGreaterThan(blocked);
    expect(partial).toBeLessThan(intact);
  });

  it("HR rises when MAP drops with intact reflex", () => {
    const trace = sampleTrace({ stimulus: "drop-30", mode: "intact" });
    // At the perturbation peak, HR should be above baseline
    expect(trace[10].hr).toBeGreaterThan(BASELINE_HR);
  });

  it("HR falls when MAP rises with intact reflex", () => {
    const trace = sampleTrace({ stimulus: "rise-30", mode: "intact" });
    expect(trace[10].hr).toBeLessThan(BASELINE_HR);
  });
});
