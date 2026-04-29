"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { BloomsLevel, Card } from "@/lib/content/cards";
import { buildActivityCalendar, type ActivityCell } from "@/lib/srs/activity";
import { computeBloomBreakdown, type BloomBreakdown } from "@/lib/srs/bloom-breakdown";
import type { StoredReview } from "@/lib/srs/db";
import { computeForgettingCurve, type ForgettingCurveEstimate } from "@/lib/srs/forgetting-curve";
import { loadAllCardStates, loadAllReviews } from "@/lib/srs/local";
import {
  computeProgressSnapshot,
  PROGRESS_SPARK_DAYS,
  type ProgressSnapshot,
} from "@/lib/srs/progress";
import { computeTimePatterns, DAY_LABELS, type TimePatternGrid } from "@/lib/srs/time-patterns";

import { ActivityTimeline } from "./activity-timeline";

type Props = {
  cards: readonly Card[];
  mechanismTitles: Record<string, string>;
  profileId: string;
};

const BLOOM_LABELS: Record<BloomsLevel, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyze: "Analyze",
};

const BLOOM_DESCRIPTIONS: Record<BloomsLevel, string> = {
  remember: "Recall facts and definitions",
  understand: "Explain concepts in your own words",
  apply: "Use the concept to solve a new problem",
  analyze: "Break a scenario down and weigh competing factors",
};

function formatHour(h: number): string {
  if (h === 0) return "12 am";
  if (h === 12) return "12 pm";
  if (h < 12) return `${h} am`;
  return `${h - 12} pm`;
}

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
 *   - per-Chapter mastery table linking back to the detail page
 *
 * Build spec §2.3 also asks for a weekly metacognitive-calibration
 * report; that depends on the Phase 4 grader scoring self-explanations,
 * which isn't landed yet, so a "coming soon" stub replaces it.
 */
export function ProgressDashboard({ cards, mechanismTitles, profileId }: Props) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const [activityCells, setActivityCells] = useState<ActivityCell[]>([]);
  const [reviews, setReviews] = useState<readonly StoredReview[]>([]);
  const titlesMap = useMemo(() => new Map(Object.entries(mechanismTitles)), [mechanismTitles]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [allReviews, states] = await Promise.all([
          loadAllReviews(profileId),
          loadAllCardStates(profileId),
        ]);
        const now = new Date();
        const snap = computeProgressSnapshot({
          reviews: allReviews,
          cardStates: states,
          allCards: cards,
          mechanismTitles: titlesMap,
          now,
        });
        const cells = buildActivityCalendar({
          reviews: allReviews,
          now,
          mechanismTitles: titlesMap,
        });
        if (!cancelled) {
          setReviews(allReviews);
          setSnapshot(snap);
          setActivityCells(cells);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
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
            byChapter: [],
          });
          setActivityCells([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, titlesMap, profileId]);

  const bloomBreakdown: BloomBreakdown = useMemo(
    () => computeBloomBreakdown({ reviews, allCards: cards }),
    [reviews, cards],
  );

  const timePatterns: TimePatternGrid = useMemo(() => computeTimePatterns({ reviews }), [reviews]);

  const forgettingCurve: ForgettingCurveEstimate = useMemo(
    () => computeForgettingCurve({ reviews }),
    [reviews],
  );

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

      <ActivityTimeline cells={activityCells} />

      <section aria-label="Per-chapter mastery" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Chapters</h2>
        {snapshot.byChapter.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No chapters yet — content lives under <code>content/chapters/</code>.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {snapshot.byChapter.map((m) => (
              <li
                key={m.chapterId}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <Link
                    className="font-medium underline-offset-2 hover:underline"
                    href={`/review?Chapter=${encodeURIComponent(m.chapterId)}`}
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

      <section aria-label="Bloom's level breakdown" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Cognitive depth</h2>
        <p className="text-muted-foreground text-xs">
          How you score across Bloom&apos;s pyramid. Recall-level (remember) tends to peak first;
          analyze-level lags as it requires reasoning under uncertainty.
        </p>
        <BloomBreakdownTable breakdown={bloomBreakdown} />
      </section>

      <section aria-label="Study time patterns" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">When you study</h2>
        <p className="text-muted-foreground text-xs">
          Reviews bucketed by day-of-week and hour. Spotting your peak hour helps schedule the
          hardest cards there — and protect that slot from collisions.
        </p>
        <TimePatternHeatmap patterns={timePatterns} />
      </section>

      <section aria-label="Forgetting curve" className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">Your forgetting curve</h2>
        <p className="text-muted-foreground text-xs">
          For every card you&apos;ve reviewed twice or more, we record (days since last review) and
          whether you got it right. The bars below show retention by gap — if they stay flat as the
          gap widens, your spacing is calibrated. A steep drop means the schedule&apos;s pulling
          cards too late.
        </p>
        <ForgettingCurveChart estimate={forgettingCurve} />
      </section>

      <section
        aria-label="Coming next on Progress"
        className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs"
      >
        <p>
          Coming soon: weekly metacognitive calibration (predicted vs. actual accuracy) once the
          Phase 4 grader is live.
        </p>
      </section>
    </main>
  );
}

function ForgettingCurveChart({ estimate }: { estimate: ForgettingCurveEstimate }) {
  if (!estimate.hasAnyData) {
    return (
      <p className="text-muted-foreground text-sm">
        Not enough history yet — review the same card twice to start populating this chart.
      </p>
    );
  }
  // Plot is a column chart: x = bucket label, y = retention%. Empty
  // buckets get a faint marker so the grid still reads as continuous.
  return (
    <div className="border-border flex flex-col gap-2 rounded-md border p-3">
      <div
        role="img"
        aria-label={`Forgetting curve — ${estimate.totalAttempts} review pair${estimate.totalAttempts === 1 ? "" : "s"} bucketed by gap`}
        className="flex items-end gap-2"
      >
        {estimate.buckets.map((b) => {
          const empty = b.attempts === 0;
          const height = empty ? 4 : Math.max(6, b.retentionPct ?? 0);
          return (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-muted-foreground text-[10px]">
                {empty ? "—" : `${b.retentionPct}%`}
              </div>
              <div
                className={empty ? "bg-muted w-full rounded-sm" : "bg-primary w-full rounded-sm"}
                style={{ height: `${height}%`, minHeight: "4px" }}
                title={`${b.label}: ${b.attempts} attempt${b.attempts === 1 ? "" : "s"}, ${b.retentionPct === null ? "no data" : `${b.retentionPct}% retention`}`}
                aria-hidden
              />
              <div className="text-muted-foreground text-[10px]">{b.label}</div>
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {estimate.totalAttempts} review pair{estimate.totalAttempts === 1 ? "" : "s"} analysed.
        Retention here counts good / easy as recall, hard / again as forgotten.
      </p>
    </div>
  );
}

function BloomBreakdownTable({ breakdown }: { breakdown: BloomBreakdown }) {
  if (!breakdown.hasAnyReviews) {
    return (
      <p className="text-muted-foreground text-sm">
        No reviews yet — start a session to see your accuracy by cognitive level.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {breakdown.buckets.map((b) => {
        const label = BLOOM_LABELS[b.level];
        const desc = BLOOM_DESCRIPTIONS[b.level];
        const pct = b.retentionPct;
        const barWidth = pct === null ? 0 : pct;
        return (
          <li key={b.level} className="border-border flex flex-col gap-1 rounded-md border p-3">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground text-xs">{desc}</span>
              </div>
              <div
                className="font-medium"
                aria-label={
                  pct === null
                    ? `${label} — no reviews yet`
                    : `${label} retention ${pct}% over ${b.totalReviews} reviews`
                }
              >
                {pct === null ? "—" : `${pct}%`}
              </div>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full" aria-hidden>
              <div className="bg-primary h-full" style={{ width: `${barWidth}%` }} />
            </div>
            <span className="text-muted-foreground text-xs">
              {b.totalReviews} review{b.totalReviews === 1 ? "" : "s"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function TimePatternHeatmap({ patterns }: { patterns: TimePatternGrid }) {
  if (patterns.totalReviews === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No timing data yet — once you study, this heatmap fills in.
      </p>
    );
  }
  // Compute peak cell value across the grid for shading. Single-bucket
  // edge-case: floor at 1 so we don't divide by 0.
  let max = 1;
  for (const row of patterns.grid) for (const c of row) if (c > max) max = c;

  // Render condensed: 4-hour slots (8 columns) so the grid fits a
  // 3xl page without horizontal scroll. The full 24-column matrix is
  // available in the DOM via aria-label for assistive tech that can
  // navigate it.
  const slotBoundaries = [0, 3, 6, 9, 12, 15, 18, 21];
  const slotLabels = ["12-3a", "3-6a", "6-9a", "9-12p", "12-3p", "3-6p", "6-9p", "9-12a"];
  const condensed: number[][] = patterns.grid.map((row) => {
    const out: number[] = [];
    for (let i = 0; i < slotBoundaries.length; i += 1) {
      const start = slotBoundaries[i];
      const end = slotBoundaries[i + 1] ?? 24;
      let sum = 0;
      for (let h = start; h < end; h += 1) sum += row[h] ?? 0;
      out.push(sum);
    }
    return out;
  });
  let condensedMax = 1;
  for (const row of condensed) for (const c of row) if (c > condensedMax) condensedMax = c;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Study time heatmap — ${patterns.totalReviews} review${patterns.totalReviews === 1 ? "" : "s"} bucketed by day and 3-hour slot. Peak day ${patterns.peakDayOfWeek === null ? "n/a" : DAY_LABELS[patterns.peakDayOfWeek]}, peak hour ${patterns.peakHour === null ? "n/a" : formatHour(patterns.peakHour)}.`}
        className="border-border overflow-x-auto rounded-md border p-3"
      >
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="text-muted-foreground text-left font-normal" scope="col">
                {""}
              </th>
              {slotLabels.map((s) => (
                <th key={s} scope="col" className="text-muted-foreground text-center font-normal">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAY_LABELS.map((day, dow) => (
              <tr key={day}>
                <th scope="row" className="text-muted-foreground pr-2 text-left font-normal">
                  {day}
                </th>
                {condensed[dow].map((count, slot) => {
                  const intensity = count === 0 ? 0 : Math.max(0.15, count / condensedMax);
                  return (
                    <td
                      key={slot}
                      className="bg-primary aspect-square h-6 w-6 rounded-sm"
                      style={{ opacity: intensity }}
                      title={`${day} ${slotLabels[slot]} — ${count} review${count === 1 ? "" : "s"}`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground text-xs">
        Peak: {patterns.peakDayOfWeek === null ? "—" : DAY_LABELS[patterns.peakDayOfWeek]}
        {" · "}
        {patterns.peakHour === null ? "—" : formatHour(patterns.peakHour)}
        {" · "}
        cell shading scaled to {condensedMax} review{condensedMax === 1 ? "" : "s"} max
      </p>
    </div>
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
