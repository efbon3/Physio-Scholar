import type { Mechanism } from "@/lib/content/loader";

import type { ExamEventRow } from "./events";

/**
 * SRS exam-aware weighting helpers.
 *
 * The build-spec idea (J7): in the ±14 days before an institutional or
 * personal exam, cards from the topics that exam covers should surface
 * first in the review queue — without changing membership, just order.
 *
 * "+/- 14d" is asymmetric in practice. Before an exam, the learner
 * benefits from earlier surfacing; after the exam, the boost stops
 * (the test already happened). We implement that asymmetry by
 * checking only the pre-exam window (`startsAt - daysBefore <= today
 * <= startsAt`).
 *
 * Pure functions; no DB / network. The page composes them: fetch
 * events → find the active window → derive a boost-set of card ids
 * → pass to assembleQueue.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BOOST_DAYS = 14;

/**
 * Of the events visible to the caller, return the soonest exam whose
 * pre-window contains today. Returns null when no exam matches.
 *
 * Both audiences (institution + personal) participate — a student's
 * own self-set mock test counts as a real exam for the purposes of
 * scheduling.
 */
export function findActiveExamWindow(
  events: readonly ExamEventRow[],
  now: Date,
  daysBefore: number = DEFAULT_BOOST_DAYS,
): ExamEventRow | null {
  const todayMs = startOfUtcDay(now).getTime();
  const horizonMs = todayMs + daysBefore * DAY_MS;
  let best: ExamEventRow | null = null;
  for (const e of events) {
    if (e.kind !== "exam") continue;
    const startMs = startOfUtcDay(new Date(`${e.starts_at}T00:00:00Z`)).getTime();
    // Only future-or-today exams matter — the boost stops after the
    // test happens.
    if (startMs < todayMs) continue;
    if (startMs > horizonMs) continue;
    if (best === null) {
      best = e;
      continue;
    }
    const bestMs = startOfUtcDay(new Date(`${best.starts_at}T00:00:00Z`)).getTime();
    if (startMs < bestMs) best = e;
  }
  return best;
}

/**
 * Build the set of card ids whose mechanism falls inside any of the
 * exam's listed `organ_systems`. The page passes this set to
 * `assembleQueue` so the queue assembler can reorder cards without
 * understanding organ systems itself.
 *
 * If the exam has an empty `organ_systems` array (faculty marked the
 * event without specifying topics), we return an empty set —
 * weighting only kicks in when the exam declares scope.
 */
export function buildBoostCardIds(
  exam: ExamEventRow,
  mechanisms: readonly Mechanism[],
  cards: readonly { id: string; mechanism_id: string }[],
): Set<string> {
  const out = new Set<string>();
  if (exam.organ_systems.length === 0) return out;
  const systems = new Set(exam.organ_systems);
  const inScopeMechanisms = new Set<string>();
  for (const m of mechanisms) {
    if (systems.has(m.frontmatter.organ_system)) {
      inScopeMechanisms.add(m.frontmatter.id);
    }
  }
  for (const card of cards) {
    if (inScopeMechanisms.has(card.mechanism_id)) out.add(card.id);
  }
  return out;
}

function startOfUtcDay(d: Date): Date {
  return new Date(`${d.toISOString().slice(0, 10)}T00:00:00Z`);
}
