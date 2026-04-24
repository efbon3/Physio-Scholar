"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Card } from "@/lib/content/cards";
import { loadAllCardStates, loadAllReviews } from "@/lib/srs/local";
import {
  computeProgressSnapshot,
  PROGRESS_SPARK_DAYS,
  type ProgressSnapshot,
} from "@/lib/srs/progress";

type Props = {
  cards: readonly Card[];
  mechanismTitles: Record<string, string>;
  profileId: string;
};

function formatMinutes(seconds: number): string {
  if (seconds <= 0) return "0 min";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

function formatRelative(ms: number | null, now: Date): string {
  if (ms === null) return "never";
  const delta = now.getTime() - ms;
  if (delta < 60_000) return "just now";
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)} min ago`;
  if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)} hr ago`;
  const days = Math.round(delta / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * Progress dashboard — Phase 5 learner-facing analytics. Reads from
 * Dexie only; Phase 6's sync work pulls the canonical history from
 * Supabase so this surface still works on shared devices.
 *
 * Widgets are intentionally a first pass:
 *   - headline counters (streak, reviews, study time, retention)
 *   - 14-day activity sparkline
 *   - per-mechanism mastery table linking back to the detail page
 *
 * Build spec §2.3 also asks for a weekly metacognitive-calibration
 * report; that depends on the Phase 4 grader scoring self-explanations,
 * which isn't landed yet, so a "coming soon" stub replaces it.
 */
export function ProgressDashboard({ cards, mechanismTitles, profileId }: Props) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [reviews, states] = await Promise.all([
          loadAllReviews(profileId),
          loadAllCardStates(profileId),
        ]);
        const titlesMap = new Map(Object.entries(mechanismTitles));
        const snap = computeProgressSnapshot({
          reviews,
          cardStates: states,
          allCards: cards,
          mechanismTitles: titlesMap,
          now: new Date(),
        });
        if (!cancelled) setSnapshot(snap);
      } catch {
        if (!cancelled) {
          setSnapshot({
            totalCards: cards.length,
            totalReviews: 0,
            reviewsThisWeek: 0,
            studyTimeSecondsThisWeek: 0,
            currentStreakDays: 0,
            longestStreakDays: 0,
            lastStudiedMs: null,
            retentionPct30d: null,
            cardsByStatus: { learning: 0, review: 0, leech: 0, suspended: 0 },
            dailyReviews: [],
            byMechanism: [],
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, mechanismTitles, profileId]);

  if (snapshot === null) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Progress</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Your progress</h1>
        </header>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Loading your history…
        </p>
      </main>
    );
  }

  const now = new Date();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Progress</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Your progress</h1>
        <p className="text-muted-foreground text-sm">
          Last studied: {formatRelative(snapshot.lastStudiedMs, now)}
        </p>
      </header>

      <section aria-label="Headline stats">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Current streak" value={`${snapshot.currentStreakDays} d`} />
          <Stat label="Longest streak" value={`${snapshot.longestStreakDays} d`} />
          <Stat label="Reviews this week" value={`${snapshot.reviewsThisWeek}`} />
          <Stat label="Time this week" value={formatMinutes(snapshot.studyTimeSecondsThisWeek)} />
        </dl>
      </section>

      <section aria-label="Retention and card pool" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Retention &amp; card pool</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat
            label="30-day retention"
            value={snapshot.retentionPct30d === null ? "—" : `${snapshot.retentionPct30d}%`}
          />
          <Stat label="Total reviews" value={`${snapshot.totalReviews}`} />
          <Stat label="Learning" value={`${snapshot.cardsByStatus.learning}`} />
          <Stat
            label="Review pool"
            value={`${snapshot.cardsByStatus.review}`}
            helpText={`of ${snapshot.totalCards} authored`}
          />
        </dl>
        {snapshot.cardsByStatus.leech > 0 ? (
          <p className="text-xs">
            <span className="font-medium">{snapshot.cardsByStatus.leech}</span> leech card
            {snapshot.cardsByStatus.leech === 1 ? "" : "s"} flagged — cards you&apos;ve Again&apos;d
            5+ times in a row. Study review-mode surfaces these for remediation.
          </p>
        ) : null}
      </section>

      <section aria-label="Daily activity" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">
          Activity — last {PROGRESS_SPARK_DAYS} days
        </h2>
        <ActivitySparkline buckets={snapshot.dailyReviews} />
      </section>

      <section aria-label="Per-mechanism mastery" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Mechanisms</h2>
        {snapshot.byMechanism.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No mechanisms yet — content lives under <code>content/mechanisms/</code>.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {snapshot.byMechanism.map((m) => (
              <li
                key={m.mechanismId}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <Link
                    className="font-medium underline-offset-2 hover:underline"
                    href={`/review?mechanism=${encodeURIComponent(m.mechanismId)}`}
                  >
                    {m.title}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {m.seen} / {m.total} card{m.total === 1 ? "" : "s"} seen
                    {m.lastReviewedMs !== null
                      ? ` · last studied ${formatRelative(m.lastReviewedMs, now)}`
                      : ""}
                  </p>
                </div>
                <div
                  className="text-base font-medium"
                  aria-label={
                    m.masteryPct === null ? "Mastery — not started" : `Mastery ${m.masteryPct}%`
                  }
                >
                  {m.masteryPct === null ? "—" : `${m.masteryPct}%`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-label="Coming next on Progress"
        className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs"
      >
        <p>
          Coming soon: weekly metacognitive calibration (predicted vs. actual accuracy) once the
          Phase 4 grader is live, plus true forgetting-curve retention.
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value, helpText }: { label: string; value: string; helpText?: string }) {
  // Wrap in a div so <dl> only contains <div>-groups with a dt+dd pair
  // each — axe's only-dlitems rule rejects loose <span> children. The
  // helpText lives inside the <dd> so we stay valid even with it.
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs tracking-widest uppercase">{label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span className="text-2xl font-medium">{value}</span>
        {helpText ? <span className="text-muted-foreground text-xs">{helpText}</span> : null}
      </dd>
    </div>
  );
}

function ActivitySparkline({ buckets }: { buckets: readonly { date: string; count: number }[] }) {
  if (buckets.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div
      role="img"
      aria-label={`Reviews per day for the last ${buckets.length} days`}
      className="flex items-end gap-1 rounded-md border p-3"
    >
      {buckets.map((bucket) => {
        const pct = Math.round((bucket.count / max) * 100);
        const height = bucket.count === 0 ? 4 : Math.max(6, pct);
        return (
          <div key={bucket.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="bg-secondary w-full rounded-sm"
              style={{ height: `${height}%`, minHeight: "4px" }}
              title={`${bucket.date}: ${bucket.count} review${bucket.count === 1 ? "" : "s"}`}
              aria-hidden
            />
            <span className="text-muted-foreground text-[10px]">{bucket.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}
