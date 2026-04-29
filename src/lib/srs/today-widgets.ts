import type { Card } from "@/lib/content/cards";

import type { ChapterProgress } from "./progress";

/**
 * Helpers for the Today dashboard's three follow-on widgets:
 * streak, weak-area callout, daily clinical challenge. They take
 * computed inputs (a `ProgressSnapshot.byChapter` slice and a
 * Chapter universe respectively) and return pure picks. Living
 * outside the dashboard component keeps them unit-testable without
 * mounting React.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type WeakArea = {
  chapterId: string;
  title: string;
  masteryPct: number;
  seen: number;
};

/**
 * Pick the Chapter the learner is weakest at: lowest mastery
 * percentage among mechanisms with at least one reviewed card.
 *
 * Why "at least one reviewed card": surfacing a Chapter the learner
 * has never opened isn't a "weak area" — it's just unstarted content.
 * The Today dashboard's queue summary already nudges them to start
 * something new; this widget exists to flag where they're slipping
 * relative to their own track record.
 *
 * Returns null if the learner has no reviewed cards at all (handled
 * by the widget as a "review more to unlock this" empty state).
 */
export function pickWeakestMechanism(byChapter: readonly ChapterProgress[]): WeakArea | null {
  let weakest: WeakArea | null = null;
  for (const m of byChapter) {
    if (m.seen === 0) continue;
    if (m.masteryPct === null) continue;
    if (weakest === null || m.masteryPct < weakest.masteryPct) {
      weakest = {
        chapterId: m.chapterId,
        title: m.title,
        masteryPct: m.masteryPct,
        seen: m.seen,
      };
    }
  }
  return weakest;
}

export type DailyChallenge = {
  chapterId: string;
  title: string;
};

/**
 * Pick a "challenge of the day" deterministically from a list of
 * Chapter candidates. Same date + same input list → same result,
 * so a refresh in the same day doesn't shuffle the surface (which
 * would feel arbitrary).
 *
 * `mechanisms` should already be filtered by the learner's active
 * study systems before calling — the dashboard does this. Returns
 * null when the candidate list is empty.
 */
export function pickDailyChallenge(
  now: Date,
  mechanisms: readonly { id: string; title: string }[],
): DailyChallenge | null {
  if (mechanisms.length === 0) return null;
  // UTC day index — stable across timezones, rolls over once a day.
  const dayIndex = Math.floor(now.getTime() / DAY_MS);
  const sorted = [...mechanisms].sort((a, b) => a.id.localeCompare(b.id));
  const pick = sorted[dayIndex % sorted.length]!;
  return { chapterId: pick.id, title: pick.title };
}

/**
 * Convenience: derive the unique Chapter set from the card universe.
 * Cards array already carries `chapter_id` — collapse it to a
 * deduplicated list with titles. The `mechanismTitles` map is what the
 * Progress dashboard already builds, so we accept the same shape.
 */
export function uniqueMechanisms(
  cards: readonly Card[],
  titles: ReadonlyMap<string, string>,
): { id: string; title: string }[] {
  const seen = new Set<string>();
  const out: { id: string; title: string }[] = [];
  for (const card of cards) {
    if (seen.has(card.chapter_id)) continue;
    seen.add(card.chapter_id);
    out.push({ id: card.chapter_id, title: titles.get(card.chapter_id) ?? card.chapter_id });
  }
  return out;
}
