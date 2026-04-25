/**
 * Baroreceptor-reflex time-course model.
 *
 * Goal: convey the **dynamics** of the reflex, not reproduce
 * individual patient traces. Four simultaneous signals animate after a
 * pressure stimulus:
 *
 *   MAP — pressure recovers toward baseline when the reflex is intact
 *   Firing — sigmoidal function of MAP; falls when MAP falls
 *   HR — rises when firing falls (sympathetic dominance)
 *   Sympathetic — inverse of firing
 *
 * Reflex failure modes toggle the correction:
 *   "intact"   — full recovery with ~2–3 s time constant
 *   "blocked"  — no neural correction; MAP stays at the new level
 *   "partial"  — reduced gain, slower + incomplete recovery (e.g.,
 *                elderly with stiffened carotids)
 *
 * Pure functions only — the UI renders whatever sampleTrace() returns.
 */

export type ReflexMode = "intact" | "partial" | "blocked";
export type StimulusKind = "drop-30" | "drop-50" | "rise-30" | "rise-50";

export type TracePoint = {
  /** Seconds since stimulus. */
  t: number;
  /** Mean arterial pressure (mmHg). */
  map: number;
  /** Baroreceptor firing rate (impulses/second). */
  firing: number;
  /** Heart rate (bpm). */
  hr: number;
  /** Sympathetic activity (0..1 normalised). */
  sympathetic: number;
};

export const BASELINE_MAP = 100; // mmHg
export const BASELINE_HR = 72; // bpm
/** Firing-rate sigmoid parameters — threshold 60, saturation 180, steep near 100. */
const FIRING_MAX = 150;
const FIRING_STEEPNESS = 0.08;
const FIRING_MIDPOINT = 100;

/** Sigmoid: MAP → firing rate (impulses/s). */
export function firingRateForMap(map: number): number {
  if (map <= 60) return 0;
  if (map >= 180) return FIRING_MAX;
  // Logistic centred at 100 mmHg.
  const x = map - FIRING_MIDPOINT;
  return FIRING_MAX / (1 + Math.exp(-FIRING_STEEPNESS * x));
}

/** Stimulus delta in mmHg (positive = pressure rise, negative = drop). */
export function deltaForStimulus(kind: StimulusKind): number {
  switch (kind) {
    case "drop-30":
      return -30;
    case "drop-50":
      return -50;
    case "rise-30":
      return 30;
    case "rise-50":
      return 50;
  }
}

/** Reflex gain + time constant per mode. */
function reflexParams(mode: ReflexMode): { gain: number; tauSec: number } {
  switch (mode) {
    case "intact":
      return { gain: 0.95, tauSec: 2.5 };
    case "partial":
      return { gain: 0.5, tauSec: 5.0 };
    case "blocked":
      return { gain: 0.0, tauSec: 10.0 };
  }
}

/**
 * Sample the full 20-second trace at 10 Hz (200 points).
 * Stimulus is applied at t=0. For 0 ≤ t < 1 s the pressure snaps to
 * the perturbed value (the insult happens fast). After that, MAP
 * exponentially recovers toward baseline at rate proportional to
 * reflex gain.
 */
export function sampleTrace({
  stimulus,
  mode,
  durationSec = 20,
  hz = 10,
}: {
  stimulus: StimulusKind;
  mode: ReflexMode;
  durationSec?: number;
  hz?: number;
}): TracePoint[] {
  const delta = deltaForStimulus(stimulus);
  const { gain, tauSec } = reflexParams(mode);

  // Target MAP after the reflex has settled. `gain=1.0` → back to baseline.
  // `gain=0.5` → halfway recovered; `gain=0` → stays at perturbed level.
  const perturbed = BASELINE_MAP + delta;
  const asymptote = perturbed + gain * (BASELINE_MAP - perturbed);

  const totalSamples = durationSec * hz;
  const out: TracePoint[] = [];
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / hz;
    // 0–1 s: pressure event ramps linearly from baseline to perturbed.
    // >1 s: exponential recovery toward the asymptote.
    let map: number;
    if (t < 1) {
      map = BASELINE_MAP + t * delta;
    } else {
      const elapsed = t - 1;
      const decayed = (perturbed - asymptote) * Math.exp(-elapsed / tauSec);
      map = asymptote + decayed;
    }
    const firing = firingRateForMap(map);
    // HR inversely tracks firing — standardise sym to [0,1], then scale.
    const sympathetic = Math.min(1, Math.max(0, (FIRING_MAX - firing) / FIRING_MAX));
    // When MAP rises, firing rises, sympathetic drops, HR falls.
    const hrDelta = (sympathetic - 0.5) * 80; // ±40 bpm max swing
    const hr = BASELINE_HR + hrDelta;
    out.push({ t, map, firing, hr, sympathetic });
  }
  return out;
}

/**
 * Quick one-line summary the UI shows next to the play button — gives
 * the student something to read before the traces start moving.
 */
export function describeScenario(stimulus: StimulusKind, mode: ReflexMode): string {
  const delta = deltaForStimulus(stimulus);
  const verb = delta < 0 ? "drops" : "rises";
  const magnitude = Math.abs(delta);
  const modeText = {
    intact: "an intact baroreflex",
    partial: "a partially impaired reflex (e.g., elderly with stiff vessels)",
    blocked: "a blocked reflex (e.g., baroreceptor denervation)",
  }[mode];
  return `Mean arterial pressure ${verb} by ${magnitude} mmHg. The learner watches ${modeText} respond.`;
}
