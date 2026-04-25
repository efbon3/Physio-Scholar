import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side helpers for the exam_events table. Read-only in this PR;
 * write paths land with the authoring forms in the next iteration.
 *
 * RLS does the actual gating per row — these helpers don't filter by
 * audience or owner explicitly, they just SELECT and trust the policy
 * stack to return only the rows the caller is permitted to see. Test
 * coverage of the policies themselves lives in supabase/tests.
 */

export type ExamEventRow = Database["public"]["Tables"]["exam_events"]["Row"];

export type ExamEventKind = "exam" | "holiday" | "semester_boundary" | "milestone";
export type ExamEventAudience = "institution" | "personal";

/**
 * Fetch every event the caller can see, ordered by start date ascending.
 * RLS returns only:
 *   - institution events whose institution_id matches the caller's
 *     `profiles.institution_id`
 *   - personal events whose owner_id is `auth.uid()`
 * so this list is naturally scoped per learner.
 *
 * Returns [] when Supabase env vars are missing (CI / preview) or the
 * caller isn't authenticated, matching the graceful posture the rest
 * of the app uses for offline-friendly rendering.
 */
export async function readVisibleEvents(): Promise<ExamEventRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Pure helper: from a list of events, return the soonest upcoming exam
 * (audience either kind, since a student's own self-set test should
 * count). "Upcoming" means starts_at >= today, and we look forward at
 * most `windowDays` days so we don't surface an end-of-year event in
 * March.
 *
 * Returns null when nothing matches — the dashboard widget hides
 * itself in that case.
 */
export function pickNextExam(
  events: readonly ExamEventRow[],
  now: Date,
  windowDays = 60,
): ExamEventRow | null {
  const todayKey = toDateKey(now);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + windowDays);
  const horizonKey = toDateKey(horizon);

  let best: ExamEventRow | null = null;
  for (const e of events) {
    if (e.kind !== "exam") continue;
    if (e.starts_at < todayKey) continue;
    if (e.starts_at > horizonKey) continue;
    if (best === null || e.starts_at < best.starts_at) {
      best = e;
    }
  }
  return best;
}

/**
 * Calendar-day diff: number of full days between today (UTC midnight)
 * and the event's start date. 0 = today, 1 = tomorrow, negative = past.
 * Pure so the dashboard can render server-side without a "today" prop.
 */
export function daysUntil(eventStartsAt: string, now: Date): number {
  const start = new Date(`${eventStartsAt}T00:00:00Z`).getTime();
  const todayMs = new Date(`${toDateKey(now)}T00:00:00Z`).getTime();
  return Math.round((start - todayMs) / 86_400_000);
}

/**
 * Group events by month-year key (`YYYY-MM`) for the calendar list
 * view. Months with no events are simply absent from the result —
 * the UI renders them as empty headers if a continuous timeline is
 * desirable, but for a "what's coming up" list the gaps are fine.
 */
export function groupByMonth(events: readonly ExamEventRow[]): Map<string, ExamEventRow[]> {
  const out = new Map<string, ExamEventRow[]>();
  for (const e of events) {
    const key = e.starts_at.slice(0, 7); // YYYY-MM
    const bucket = out.get(key) ?? [];
    bucket.push(e);
    out.set(key, bucket);
  }
  return out;
}

function toDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
