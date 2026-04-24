/**
 * Pure Frank-Starling model.
 *
 * A teaching-grade curve — not quantitatively accurate, but shaped like
 * the real length-tension relationship so the visual intuition is
 * right: steep rise across physiologic preloads, flattening as
 * sarcomere length approaches optimum, and a reduced/flattened curve
 * for a failing heart.
 *
 * Pure so the simulator can unit-test the math without rendering.
 */

export type Contractility = "failing" | "normal" | "enhanced";

export type Sample = {
  edvMl: number;
  svMl: number;
};

export type Params = {
  /** Maximum stroke volume the heart can eject (ml). */
  svMax: number;
  /** EDV (ml) at which stroke volume has reached ~half of svMax. */
  edvHalfSaturation: number;
  /** Steepness of the rise; higher = sharper transition. */
  hill: number;
};

/** Parameters per contractility state (approximate, teaching values). */
export const CONTRACTILITY_PARAMS: Record<Contractility, Params> = {
  failing: { svMax: 55, edvHalfSaturation: 130, hill: 2.0 },
  normal: { svMax: 95, edvHalfSaturation: 100, hill: 3.0 },
  enhanced: { svMax: 120, edvHalfSaturation: 85, hill: 3.5 },
};

/**
 * Hill-style sigmoid for stroke volume vs end-diastolic volume. Returns
 * ml. Zero below a small EDV threshold (heart can't pump no-filling).
 */
export function strokeVolume(edvMl: number, contractility: Contractility): number {
  if (edvMl <= 40) return 0;
  const { svMax, edvHalfSaturation, hill } = CONTRACTILITY_PARAMS[contractility];
  const x = edvMl - 40; // shift to give a zero-point near resting unloaded EDV
  const half = edvHalfSaturation - 40;
  const ratio = Math.pow(x, hill) / (Math.pow(x, hill) + Math.pow(half, hill));
  return svMax * ratio;
}

/** Ejection fraction as percent — clamps so UI never shows 120%. */
export function ejectionFraction(edvMl: number, svMl: number): number {
  if (edvMl <= 0) return 0;
  return Math.min(100, Math.max(0, (svMl / edvMl) * 100));
}

/** Sample the curve across [40, 250] mL at 2.5 mL resolution. */
export function sampleCurve(contractility: Contractility): Sample[] {
  const samples: Sample[] = [];
  for (let edvMl = 40; edvMl <= 250; edvMl += 2.5) {
    samples.push({ edvMl, svMl: strokeVolume(edvMl, contractility) });
  }
  return samples;
}

/** Clinical-ish summary labels for the output panel. */
export function classifyEjectionFraction(pct: number): string {
  if (pct >= 55) return "Normal";
  if (pct >= 40) return "Mildly reduced";
  if (pct >= 30) return "Moderately reduced";
  return "Severely reduced";
}
