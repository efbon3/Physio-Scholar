"use client";

import { useEffect, useState } from "react";

import { loadAllCardStates } from "@/lib/srs/local";
import type { CardState } from "@/lib/srs/types";

type Props = {
  /** Card ids that belong to this Chapter — `${chapterId}:1`, `…:2`, … */
  cardIds: readonly string[];
  /** Current learner. Falls back to "preview" in non-Supabase envs. */
  profileId: string;
};

type Stats = {
  total: number;
  seen: number;
  dueNow: number;
  /** Oldest `due_at` among the cards that are currently due. Null when nothing is due. */
  oldestDueAt: Date | null;
  /** Count of cards due in the (now, now+24h] window. */
  nextDue24h: number;
  learned: number;
  averageEase: number | null;
  lastReviewedAt: Date | null;
  nextDueAt: Date | null;
};

function formatRelative(target: Date | null, now: Date): string {
  if (!target) return "—";
  const deltaMs = target.getTime() - now.getTime();
  const past = deltaMs < 0;
  const abs = Math.abs(deltaMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const suffix = past ? "ago" : "from now";
  if (abs < minute) return past ? "just now" : "in a moment";
  if (abs < hour) {
    const n = Math.round(abs / minute);
    return `${n} min ${suffix}`;
  }
  if (abs < day) {
    const n = Math.round(abs / hour);
    return `${n} hr ${suffix}`;
  }
  const n = Math.round(abs / day);
  return `${n} day${n === 1 ? "" : "s"} ${suffix}`;
}

/**
 * One-line subtitle under the "Due now" count, summarising *when*
 * cards became due and *when* more are coming. Returns null when
 * there's nothing useful to say (no due, no upcoming, never studied)
 * so the caller can render-or-skip without an empty string lingering.
 *
 * Branches:
 *   - currently due → "oldest 3 hr ago" plus "· +5 in next 24h" when applicable
 *   - none due, but a next-due exists → "next 4 hr from now"
 *   - else → null (caller renders nothing)
 */
export function formatDueSubtitle(args: {
  dueNow: number;
  oldestDueAt: Date | null;
  nextDue24h: number;
  nextDueAt: Date | null;
  now: Date;
}): string | null {
  const { dueNow, oldestDueAt, nextDue24h, nextDueAt, now } = args;
  if (dueNow > 0) {
    const parts: string[] = [];
    if (oldestDueAt) parts.push(`oldest ${formatRelative(oldestDueAt, now)}`);
    if (nextDue24h > 0) parts.push(`+${nextDue24h} in next 24h`);
    return parts.length > 0 ? parts.join(" · ") : null;
  }
  if (nextDueAt && nextDueAt.getTime() > now.getTime()) {
    return `next ${formatRelative(nextDueAt, now)}`;
  }
  return null;
}

/**
 * Per-Chapter study stats — shown on the Chapter detail page so the
 * learner has a concrete sense of "how well have I learned this?" before
 * they click "Study this Chapter."
 *
 * Mastery proxy: average ease across seen cards. A card with ease 2.5
 * (the SM-2 default) counts as 0%; ease 3.5 maps to 100%. This is an
 * approximation; Phase 5's Progress tab will replace it with real
 * retention curves.
 */
export function ChapterStats({ cardIds, profileId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllCardStates(profileId);
        const ids = new Set(cardIds);
        const relevant = rows.filter((row: CardState & { card_id: string }) =>
          ids.has(row.card_id),
        );
        const now = new Date();

        let dueNow = 0;
        let nextDue24h = 0;
        let learned = 0;
        let easeSum = 0;
        let lastReviewedAt: Date | null = null;
        let nextDueAt: Date | null = null;
        let oldestDueAt: Date | null = null;
        const nowMs = now.getTime();
        const in24hMs = nowMs + 24 * 60 * 60 * 1000;

        for (const row of relevant) {
          const dueAt = row.due_at ? new Date(row.due_at) : null;
          if (dueAt) {
            const t = dueAt.getTime();
            if (t <= nowMs) {
              dueNow += 1;
              if (!oldestDueAt || t < oldestDueAt.getTime()) oldestDueAt = dueAt;
            } else if (t <= in24hMs) {
              nextDue24h += 1;
            }
            if (!nextDueAt || t < nextDueAt.getTime()) nextDueAt = dueAt;
          }
          if (row.status === "review" || row.interval_days >= 21) learned += 1;
          easeSum += row.ease;
          const reviewed = row.last_reviewed_at ? new Date(row.last_reviewed_at) : null;
          if (reviewed) {
            if (!lastReviewedAt || reviewed.getTime() > lastReviewedAt.getTime())
              lastReviewedAt = reviewed;
          }
        }

        const averageEase = relevant.length > 0 ? easeSum / relevant.length : null;

        if (!cancelled) {
          setStats({
            total: cardIds.length,
            seen: relevant.length,
            dueNow,
            oldestDueAt,
            nextDue24h,
            learned,
            averageEase,
            lastReviewedAt,
            nextDueAt,
          });
        }
      } catch {
        if (!cancelled)
          setStats({
            total: cardIds.length,
            seen: 0,
            dueNow: 0,
            oldestDueAt: null,
            nextDue24h: 0,
            learned: 0,
            averageEase: null,
            lastReviewedAt: null,
            nextDueAt: null,
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardIds, profileId]);

  if (stats === null) {
    return (
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Loading stats…
      </p>
    );
  }

  if (stats.total === 0) {
    return <p className="text-muted-foreground text-sm">No cards authored for this chapter yet.</p>;
  }

  const now = new Date();
  const masteryPct =
    stats.averageEase !== null ? Math.round(((stats.averageEase - 2.5) / 1.0) * 100) : null;
  const masteryLabel = masteryPct === null ? "—" : `${Math.max(0, Math.min(100, masteryPct))}%`;
  const dueSubtitle = formatDueSubtitle({
    dueNow: stats.dueNow,
    oldestDueAt: stats.oldestDueAt,
    nextDue24h: stats.nextDue24h,
    nextDueAt: stats.nextDueAt,
    now,
  });

  return (
    <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-widest uppercase">Cards</dt>
        <dd className="text-base font-medium">
          {stats.seen} / {stats.total}
        </dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-widest uppercase">Due now</dt>
        <dd className="text-base font-medium">{stats.dueNow}</dd>
        {dueSubtitle ? (
          <p className="text-muted-foreground text-xs leading-tight">{dueSubtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-widest uppercase">Mastery</dt>
        <dd className="text-base font-medium">{masteryLabel}</dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-widest uppercase">Last studied</dt>
        <dd className="text-base font-medium">{formatRelative(stats.lastReviewedAt, now)}</dd>
      </div>
    </dl>
  );
}
