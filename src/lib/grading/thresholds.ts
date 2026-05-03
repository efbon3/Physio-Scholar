export type GradeThreshold = { label: string; min: number };

/**
 * Pick the letter grade for a marks-percentage given the institution's
 * grade_thresholds array. Thresholds are expected sorted highest-min
 * first (the admin save action sorts them); we re-sort defensively in
 * case someone hand-edits the JSON. Returns null when nothing matches
 * (i.e. the percentage is below the lowest cut-off).
 */
export function gradeFor(percent: number, thresholds: readonly GradeThreshold[]): string | null {
  const sorted = [...thresholds].sort((a, b) => b.min - a.min);
  for (const t of sorted) {
    if (percent >= t.min) return t.label;
  }
  return null;
}

/**
 * Best-effort parse of the institutions.grade_thresholds jsonb column.
 * Returns the sane default if the value is malformed so the dashboard
 * still computes a grade rather than failing closed.
 */
export function parseGradeThresholds(raw: unknown): GradeThreshold[] {
  const fallback: GradeThreshold[] = [
    { label: "A", min: 85 },
    { label: "B", min: 75 },
    { label: "C", min: 65 },
    { label: "D", min: 50 },
  ];
  if (!Array.isArray(raw)) return fallback;
  const out: GradeThreshold[] = [];
  for (const v of raw) {
    if (
      typeof v === "object" &&
      v !== null &&
      "label" in v &&
      "min" in v &&
      typeof (v as { label: unknown }).label === "string"
    ) {
      const min = Number((v as { min: unknown }).min);
      if (Number.isFinite(min)) {
        out.push({ label: String((v as { label: unknown }).label), min });
      }
    }
  }
  return out.length === 0 ? fallback : out;
}
