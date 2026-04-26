"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  DIFFICULTY_FILTER_OPTIONS,
  FilterChips,
  PRIORITY_FILTER_OPTIONS,
} from "@/components/filter-chips";
import { buttonVariants } from "@/components/ui/button";
import { encodeFilterParam } from "@/lib/content/card-filters";
import type { Card } from "@/lib/content/cards";
import { loadAllCardStates, loadAllReviews } from "@/lib/srs/local";
import {
  computeProgressSnapshot,
  type MechanismProgress,
  type ProgressSnapshot,
} from "@/lib/srs/progress";
import { assembleQueue, summariseQueue } from "@/lib/srs/queue";
import {
  pickDailyChallenge,
  pickWeakestMechanism,
  uniqueMechanisms,
  type DailyChallenge,
  type WeakArea,
} from "@/lib/srs/today-widgets";
import type { CardState } from "@/lib/srs/types";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_NEW_CARDS = 10;

type QueueSummary = {
  due: number;
  new: number;
  total: number;
};

type DashboardData = {
  queue: QueueSummary;
  streakDays: number;
  longestStreakDays: number;
  weakArea: WeakArea | null;
  challenge: DailyChallenge | null;
};

/**
 * Today tab — the post-login landing dashboard. Reads card_states and
 * the review history out of Dexie, computes a single
 * `ProgressSnapshot`, and renders three follow-on widgets atop the
 * queue summary:
 *   - Streak (current day count + longest as a subtitle)
 *   - Weak-area callout (lowest mastery mechanism, with a Drill CTA)
 *   - Daily clinical challenge (deterministic per-day pick)
 *
 * The widgets degrade gracefully:
 *   - No reviews yet → streak 0, weak-area "review some cards first"
 *   - No cards in scope → challenge hidden
 * so a brand-new account never sees a broken-looking surface.
 */
export type ExamWidget = {
  title: string;
  startsAt: string;
  daysAway: number;
  topics: string[];
  audience: string;
};

export function TodayDashboard({
  cards,
  email,
  mechanismTitles,
  profileId,
  studySystems,
  boostCardIds = [],
  examWidget = null,
}: {
  cards: readonly Card[];
  email: string | null;
  mechanismTitles: Record<string, string>;
  profileId: string;
  /** Active organ-systems preference. Null = no preference (CI / preview). */
  studySystems: string[] | null;
  /** Card ids to boost in queue ordering — derived from the active exam window. */
  boostCardIds?: readonly string[];
  /** Active exam window; null when no exam falls in the next 14 days. */
  examWidget?: ExamWidget | null;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  // Local state for the filter chips. Empty Set = no filter on that
  // axis (default — show everything). Toggling a chip flips its
  // membership; if all chips are off the caller treats it as "all".
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(() => new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(() => new Set());

  function toggle(set: Set<string>, value: string, options: ReadonlyArray<{ value: string }>) {
    const next = new Set(set);
    // First click on any chip when "all" is implicit: drop into single-select for that chip.
    if (next.size === 0) {
      next.add(value);
    } else if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    // If selection grew to cover every option, collapse back to "all" (empty set).
    if (next.size === options.length) next.clear();
    return next;
  }

  // Build the URL query the Start review / Exam mode buttons should use,
  // so a click respects the current chip selection.
  const filterQuery = useMemo(() => {
    const parts: string[] = [];
    const p = encodeFilterParam(Array.from(priorityFilter));
    const d = encodeFilterParam(Array.from(difficultyFilter));
    if (p) parts.push(`priority=${encodeURIComponent(p)}`);
    if (d) parts.push(`difficulty=${encodeURIComponent(d)}`);
    return parts.length === 0 ? "" : `?${parts.join("&")}`;
  }, [priorityFilter, difficultyFilter]);

  // Stable Set across renders so assembleQueue's reference comparison
  // doesn't rebuild on every keystroke. boostCardIds comes in as an
  // array prop (server-component-friendly).
  const boostSet = useMemo(() => new Set(boostCardIds), [boostCardIds]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [stateRows, reviewRows] = await Promise.all([
          loadAllCardStates(profileId),
          loadAllReviews(profileId),
        ]);
        const stateMap = new Map<string, CardState>();
        for (const row of stateRows) stateMap.set(row.card_id, row);
        const now = new Date();
        const queue = summariseQueue(
          assembleQueue({
            cards,
            cardStates: stateMap,
            now,
            maxNewCards: DEFAULT_MAX_NEW_CARDS,
            boostCardIds: boostSet,
          }),
        );
        const titlesMap = new Map(Object.entries(mechanismTitles));
        const snapshot: ProgressSnapshot = computeProgressSnapshot({
          reviews: reviewRows,
          cardStates: stateRows,
          allCards: cards,
          mechanismTitles: titlesMap,
          now,
        });
        const weakArea = pickWeakestMechanism(snapshot.byMechanism as MechanismProgress[]);
        const challenge = pickDailyChallenge(now, uniqueMechanisms(cards, titlesMap));
        if (cancelled) return;
        setData({
          queue,
          streakDays: snapshot.currentStreakDays,
          longestStreakDays: snapshot.longestStreakDays,
          weakArea,
          challenge,
        });
      } catch {
        if (!cancelled) {
          setData({
            queue: { due: 0, new: 0, total: 0 },
            streakDays: 0,
            longestStreakDays: 0,
            weakArea: null,
            challenge: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, mechanismTitles, profileId, boostSet]);

  const greetingName = email?.split("@")[0] ?? "there";
  const queue = data?.queue;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Dashboard</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Hi, {greetingName}.</h1>
        {studySystems && studySystems.length > 0 ? (
          <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span>Studying:</span>
            <span className="font-medium capitalize">{studySystems.join(" · ")}</span>
            <Link
              href="/settings"
              className="hover:bg-muted text-foreground rounded-md border px-2 py-0.5"
            >
              Change
            </Link>
          </p>
        ) : null}
      </header>

      <section aria-label="Review queue" className="flex flex-col gap-4">
        {data === null ? (
          <p className="text-muted-foreground text-sm">Loading queue…</p>
        ) : queue!.total === 0 ? (
          <EmptyState
            icon="✓"
            title="You're caught up"
            description="No cards are due, and today's new-card budget is spent. Come back tomorrow, or get ahead by exploring a mechanism."
            actions={[
              { label: "Browse mechanisms", href: "/systems", variant: "primary" },
              { label: "See your progress", href: "/progress", variant: "secondary" },
            ]}
          />
        ) : (
          <>
            <p className="text-base leading-7">
              <strong className="font-medium">{queue!.total}</strong> card
              {queue!.total === 1 ? "" : "s"} waiting
              {queue!.due > 0 ? (
                <>
                  {" "}
                  ({queue!.due} due
                  {queue!.new > 0 ? `, ${queue!.new} new` : ""})
                </>
              ) : queue!.new > 0 ? (
                <> ({queue!.new} new)</>
              ) : null}
              .
            </p>
            <section
              aria-label="Filter by importance and difficulty"
              className="border-input bg-muted/20 flex flex-col gap-3 rounded-md border p-3"
            >
              <FilterChips
                legend="Priority"
                options={PRIORITY_FILTER_OPTIONS as unknown as { value: string; label: string }[]}
                selected={priorityFilter}
                onToggle={(v) =>
                  setPriorityFilter((s) =>
                    toggle(s, v, PRIORITY_FILTER_OPTIONS as unknown as { value: string }[]),
                  )
                }
                helper={
                  priorityFilter.size === 0
                    ? "All priorities included."
                    : `Showing only ${Array.from(priorityFilter).join(", ")}.`
                }
              />
              <FilterChips
                legend="Difficulty"
                options={DIFFICULTY_FILTER_OPTIONS as unknown as { value: string; label: string }[]}
                selected={difficultyFilter}
                onToggle={(v) =>
                  setDifficultyFilter((s) =>
                    toggle(s, v, DIFFICULTY_FILTER_OPTIONS as unknown as { value: string }[]),
                  )
                }
                helper={
                  difficultyFilter.size === 0
                    ? "All levels included."
                    : `Showing only ${Array.from(difficultyFilter).join(", ")}.`
                }
              />
            </section>
            <div className="flex flex-wrap gap-2">
              <Link href={`/review${filterQuery}`} className={cn(buttonVariants({ size: "lg" }))}>
                Start review
              </Link>
              <Link
                href={`/exam${filterQuery}`}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Exam mode
              </Link>
            </div>
          </>
        )}
      </section>

      {data && queue!.total === 0 ? (
        <section aria-label="Secondary actions" className="flex flex-col gap-3">
          <p className="text-sm">
            Nothing to review? Still worth a drill — try an exam-mode MCQ run.
          </p>
          <div>
            <Link href="/exam" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Go to exam mode
            </Link>
          </div>
        </section>
      ) : null}

      {examWidget ? <ExamCountdown examWidget={examWidget} boosting={boostSet.size > 0} /> : null}

      {data ? (
        <section
          aria-label="Today widgets"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StreakCard streakDays={data.streakDays} longestStreakDays={data.longestStreakDays} />
          <WeakAreaCard weakArea={data.weakArea} />
          <ChallengeCard challenge={data.challenge} />
        </section>
      ) : null}
    </main>
  );
}

function ExamCountdown({ examWidget, boosting }: { examWidget: ExamWidget; boosting: boolean }) {
  const days = examWidget.daysAway;
  const dayLabel = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return (
    <section
      aria-label="Next exam"
      className="border-destructive/30 bg-destructive/5 flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-xs tracking-widest uppercase">
        Next exam · {examWidget.audience === "personal" ? "Personal" : "Institution"}
      </p>
      <p className="font-heading text-xl font-semibold">{examWidget.title}</p>
      <p className="text-sm">
        <span className="font-medium">{dayLabel}</span>{" "}
        <span className="text-muted-foreground">({examWidget.startsAt})</span>
      </p>
      {examWidget.topics.length > 0 ? (
        <p className="text-muted-foreground text-xs capitalize">
          Topics: {examWidget.topics.join(" · ")}
        </p>
      ) : null}
      {boosting ? (
        <p className="text-muted-foreground text-xs">
          Cards from these systems are surfacing first in your review queue.
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        <Link
          href="/calendar"
          className="hover:bg-muted text-foreground rounded-md border px-2 py-1"
        >
          See full calendar
        </Link>
      </div>
    </section>
  );
}

function StreakCard({
  streakDays,
  longestStreakDays,
}: {
  streakDays: number;
  longestStreakDays: number;
}) {
  return (
    <article
      aria-label="Study streak"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">Streak</p>
      {streakDays === 0 ? (
        <p className="font-heading text-2xl font-semibold tracking-tight">Start a streak today</p>
      ) : (
        <p className="font-heading text-2xl font-semibold tracking-tight">
          {streakDays} day{streakDays === 1 ? "" : "s"}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        {longestStreakDays > 0
          ? `Best: ${longestStreakDays} day${longestStreakDays === 1 ? "" : "s"}.`
          : "Rate at least one card to begin."}
      </p>
    </article>
  );
}

function WeakAreaCard({ weakArea }: { weakArea: WeakArea | null }) {
  if (weakArea === null) {
    return (
      <article
        aria-label="Weak area"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Weak area</p>
        <p className="font-heading text-base font-medium">Review some cards first.</p>
        <p className="text-muted-foreground text-xs">
          Once you&apos;ve rated a few cards, we&apos;ll surface where you&apos;re slipping.
        </p>
      </article>
    );
  }
  return (
    <article
      aria-label="Weak area"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">Weak area</p>
      <p className="font-heading text-base font-medium">{weakArea.title}</p>
      <p className="text-muted-foreground text-xs">
        {weakArea.masteryPct}% mastery across {weakArea.seen} reviewed card
        {weakArea.seen === 1 ? "" : "s"}.
      </p>
      <Link
        href={`/review?mechanism=${encodeURIComponent(weakArea.mechanismId)}`}
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-1 self-start")}
      >
        Drill this mechanism
      </Link>
    </article>
  );
}

function ChallengeCard({ challenge }: { challenge: DailyChallenge | null }) {
  if (challenge === null) {
    return (
      <article
        aria-label="Daily challenge"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Today&apos;s challenge
        </p>
        <p className="font-heading text-base font-medium">No mechanisms in scope.</p>
        <p className="text-muted-foreground text-xs">
          Add a study system in Settings to unlock the daily challenge.
        </p>
      </article>
    );
  }
  return (
    <article
      aria-label="Daily challenge"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">
        Today&apos;s challenge
      </p>
      <p className="font-heading text-base font-medium">{challenge.title}</p>
      <p className="text-muted-foreground text-xs">
        Stretch goal — drop in for one focused pass through this mechanism.
      </p>
      <Link
        href={`/review?mechanism=${encodeURIComponent(challenge.mechanismId)}`}
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-1 self-start")}
      >
        Try it
      </Link>
    </article>
  );
}
