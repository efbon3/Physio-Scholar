import type { Card } from "@/lib/content/cards";

import type { StoredCardState, StoredReview } from "./db";
import type { CardStatus, Rating } from "./types";

/**
 * Pure, testable progress-snapshot computation.
 *
 * Lives separately from `local.ts` so the UI (Progress tab) and future
 * analytics jobs can call it with any source of truth — Dexie rows
 * today, a server-side pull from Supabase tomorrow. No Dexie / browser
 * APIs here; that keeps unit tests fast and deterministic.
 *
 * Retention definition for v1: percentage of reviews rated `good` or
 * `easy` within the window. It's a rough proxy — the real retention
 * curve (build spec §2.3: "retention curves") requires tracking whether
 * a card's second encounter was still successful, which lands in the
 * Progress sub-phase that computes forgetting-curve estimates against
 * re-review outcomes. For the pilot, "correct-rate on recent attempts"
 * is an honest first pass.
 */

export type DailyReviewBucket = {
  /** ISO date string in local time — `YYYY-MM-DD`. */
  date: string;
  count: number;
};

export type ChapterProgress = {
  chapterId: string;
  title: string;
  seen: number;
  total: number;
  /** null when the learner hasn't reviewed any cards in this Chapter yet. */
  masteryPct: number | null;
  /** Milliseconds since epoch of the most recent review in this Chapter. */
  lastReviewedMs: number | null;
};

export type ProgressSnapshot = {
  totalCards: number;
  totalReviews: number;
  reviewsThisWeek: number;
  studyTimeSecondsThisWeek: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastStudiedMs: number | null;
  /** null until the learner has at least one review in the window. */
  retentionPct30d: number | null;
  cardsByStatus: Record<CardStatus, number>;
  /** Sparkline data — always returns exactly `days` entries, oldest first. */
  dailyReviews: DailyReviewBucket[];
  byChapter: ChapterProgress[];
};

/** Number of days rendered on the Progress tab's activity sparkline. */
export const PROGRESS_SPARK_DAYS = 14;
/** Retention window (days) — tracks last-30-day correct-rate. */
export const RETENTION_WINDOW_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
/** Mastery proxy: ease above default (2.5) → 0..1 → percent. */
const MASTERY_EASE_BASE = 2.5;
const MASTERY_EASE_SPAN = 1.0;

/** Format a Date as `YYYY-MM-DD` in local time (sparkline x-axis). */
export function localDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function masteryFromEase(averageEase: number | null): number | null {
  if (averageEase === null) return null;
  const raw = ((averageEase - MASTERY_EASE_BASE) / MASTERY_EASE_SPAN) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function isGradedSuccess(rating: Rating): boolean {
  return rating === "good" || rating === "easy";
}

function computeStreaks(
  reviewDates: readonly string[],
  todayKey: string,
): { current: number; longest: number } {
  if (reviewDates.length === 0) return { current: 0, longest: 0 };
  const unique = new Set(reviewDates);
  const sorted = [...unique].sort(); // ascending ISO date strings
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`);
    const curr = new Date(`${sorted[i]}T00:00:00`);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / DAY_MS);
    if (diffDays === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak = trailing consecutive days ending today or yesterday.
  let current = 0;
  if (unique.has(todayKey)) {
    current = 1;
    const cursor = new Date(`${todayKey}T00:00:00`);
    for (;;) {
      cursor.setDate(cursor.getDate() - 1);
      if (unique.has(localDateKey(cursor))) current += 1;
      else break;
    }
  } else {
    // If the learner hasn't studied today, their streak is either
    // still "alive" (ends at yesterday) or 0.
    const yesterday = new Date(`${todayKey}T00:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);
    if (unique.has(yesterdayKey)) {
      current = 1;
      const cursor = new Date(`${yesterdayKey}T00:00:00`);
      for (;;) {
        cursor.setDate(cursor.getDate() - 1);
        if (unique.has(localDateKey(cursor))) current += 1;
        else break;
      }
    }
  }

  return { current, longest };
}

function emptyStatusCounts(): Record<CardStatus, number> {
  return { learning: 0, review: 0, leech: 0, suspended: 0 };
}

export type ComputeInput = {
  reviews: readonly StoredReview[];
  cardStates: readonly StoredCardState[];
  /** Authored cards — the universe the Today + Systems surfaces see. */
  allCards: readonly Card[];
  /** Chapter title lookup, keyed by Chapter id. */
  mechanismTitles: ReadonlyMap<string, string>;
  now: Date;
};

export function computeProgressSnapshot({
  reviews,
  cardStates,
  allCards,
  mechanismTitles,
  now,
}: ComputeInput): ProgressSnapshot {
  const nowMs = now.getTime();
  const weekAgoMs = nowMs - WEEK_MS;
  const retentionWindowMs = nowMs - RETENTION_WINDOW_DAYS * DAY_MS;

  const todayKey = localDateKey(now);

  let reviewsThisWeek = 0;
  let studyTimeSecondsThisWeek = 0;
  let lastStudiedMs: number | null = null;
  const reviewDateKeys: string[] = [];
  const dailyCounts = new Map<string, number>();
  let retentionHits = 0;
  let retentionTotal = 0;

  for (const r of reviews) {
    const ts = new Date(r.created_at).getTime();
    if (!Number.isFinite(ts)) continue;
    const dateKey = localDateKey(new Date(ts));
    reviewDateKeys.push(dateKey);
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) ?? 0) + 1);
    if (ts >= weekAgoMs) {
      reviewsThisWeek += 1;
      studyTimeSecondsThisWeek += Math.max(0, r.time_spent_seconds | 0);
    }
    if (ts >= retentionWindowMs) {
      retentionTotal += 1;
      if (isGradedSuccess(r.rating)) retentionHits += 1;
    }
    if (lastStudiedMs === null || ts > lastStudiedMs) lastStudiedMs = ts;
  }

  // Daily sparkline — always exactly PROGRESS_SPARK_DAYS entries, oldest first.
  const dailyReviews: DailyReviewBucket[] = [];
  for (let i = PROGRESS_SPARK_DAYS - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    dailyReviews.push({ date: key, count: dailyCounts.get(key) ?? 0 });
  }

  // Card status counts — only for cards that exist in the authored universe.
  // Filters out orphaned state rows from deleted mechanisms.
  const cardsByStatus = emptyStatusCounts();
  const knownCardIds = new Set(allCards.map((c) => c.id));
  for (const row of cardStates) {
    if (!knownCardIds.has(row.card_id)) continue;
    cardsByStatus[row.status] += 1;
  }

  // Per-Chapter progress.
  const byMechanismMap = new Map<
    string,
    { seen: number; total: number; easeSum: number; easeCount: number; lastMs: number | null }
  >();
  for (const card of allCards) {
    const entry = byMechanismMap.get(card.chapter_id) ?? {
      seen: 0,
      total: 0,
      easeSum: 0,
      easeCount: 0,
      lastMs: null,
    };
    entry.total += 1;
    byMechanismMap.set(card.chapter_id, entry);
  }
  const cardIdToMechanism = new Map<string, string>();
  for (const card of allCards) cardIdToMechanism.set(card.id, card.chapter_id);

  for (const row of cardStates) {
    const chapterId = cardIdToMechanism.get(row.card_id);
    if (!chapterId) continue;
    const entry = byMechanismMap.get(chapterId);
    if (!entry) continue;
    entry.seen += 1;
    entry.easeSum += row.ease;
    entry.easeCount += 1;
    const reviewedMs = row.last_reviewed_at ? new Date(row.last_reviewed_at).getTime() : null;
    if (reviewedMs !== null && (entry.lastMs === null || reviewedMs > entry.lastMs)) {
      entry.lastMs = reviewedMs;
    }
  }

  const byChapter: ChapterProgress[] = [];
  for (const [chapterId, entry] of byMechanismMap) {
    const avgEase = entry.easeCount > 0 ? entry.easeSum / entry.easeCount : null;
    byChapter.push({
      chapterId,
      title: mechanismTitles.get(chapterId) ?? chapterId,
      seen: entry.seen,
      total: entry.total,
      masteryPct: masteryFromEase(avgEase),
      lastReviewedMs: entry.lastMs,
    });
  }
  byChapter.sort((a, b) => {
    // Surface the mechanisms the learner touched most recently first.
    const aMs = a.lastReviewedMs ?? 0;
    const bMs = b.lastReviewedMs ?? 0;
    if (aMs !== bMs) return bMs - aMs;
    return a.title.localeCompare(b.title);
  });

  const { current: currentStreakDays, longest: longestStreakDays } = computeStreaks(
    reviewDateKeys,
    todayKey,
  );

  const retentionPct30d =
    retentionTotal === 0 ? null : Math.round((retentionHits / retentionTotal) * 100);

  return {
    totalCards: allCards.length,
    totalReviews: reviews.length,
    reviewsThisWeek,
    studyTimeSecondsThisWeek,
    currentStreakDays,
    longestStreakDays,
    lastStudiedMs,
    retentionPct30d,
    cardsByStatus,
    dailyReviews,
    byChapter,
  };
}
