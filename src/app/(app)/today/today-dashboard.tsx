"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import type { Card } from "@/lib/content/cards";
import type { Quote } from "@/lib/motivation/quotes";
import { loadAllCardStates, loadAllReviews } from "@/lib/srs/local";
import {
  computeProgressSnapshot,
  type ChapterProgress,
  type ProgressSnapshot,
} from "@/lib/srs/progress";
import { assembleQueue, summariseQueue } from "@/lib/srs/queue";
import { pickWeakestMechanism, type WeakArea } from "@/lib/srs/today-widgets";
import type { CardState } from "@/lib/srs/types";

const DEFAULT_MAX_NEW_CARDS = 10;

type QueueSummary = {
  due: number;
  new: number;
  total: number;
};

type DashboardData = {
  queue: QueueSummary;
  weakArea: WeakArea | null;
};

export type UpcomingGoal = {
  id: string;
  title: string;
  startsAt: string;
  audience: string;
  daysAway: number;
};

export type FacultyAssignment = {
  id: string;
  title: string;
  /** ISO timestamp or null when there's no deadline. */
  dueAt: string | null;
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  body: string | null;
  /** ISO timestamp the row was first authored. */
  createdAt: string;
};

/**
 * Today tab — post-login landing dashboard.
 *
 * Layout (top to bottom):
 *   1. Greeting + "What would you like to study today?" study scope chip
 *   2. Cards-due summary (only "due" — cards the SM-2 scheduler says
 *      it's time to revisit; new cards aren't surfaced here because
 *      the user wanted just the revision reminder)
 *   3. Random motivational quote (server-picked from the 400+ corpus)
 *   4. Three reminder cards: upcoming calendar goals, the system the
 *      learner is scoring lowest on, and a placeholder for faculty
 *      homework (the schema for that lands in a follow-up).
 *
 * Start review / Exam mode buttons used to live here; they're now in
 * the global nav (Review, Exam) so the dashboard stays read-only.
 */
export function TodayDashboard({
  cards,
  greetingName,
  mechanismTitles,
  profileId,
  studySystems,
  boostCardIds = [],
  upcomingGoals,
  quote,
  assignments,
  announcements,
}: {
  cards: readonly Card[];
  greetingName: string;
  mechanismTitles: Record<string, string>;
  profileId: string;
  /** Active organ-systems preference. Null = no preference (CI / preview). */
  studySystems: string[] | null;
  /** Card ids to boost in queue ordering — derived from the active exam window. */
  boostCardIds?: readonly string[];
  /** Up to three upcoming calendar events. */
  upcomingGoals: readonly UpcomingGoal[];
  /** Server-picked quote — refreshes on every page render. */
  quote: Quote;
  /** Up to three faculty-assigned homework items, ordered by due_at. */
  assignments: readonly FacultyAssignment[];
  /** Up to three approved announcements targeting the learner's batch. */
  announcements: readonly AnnouncementSummary[];
}) {
  const [data, setData] = useState<DashboardData | null>(null);

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
        const weakArea = pickWeakestMechanism(snapshot.byChapter as ChapterProgress[]);
        if (cancelled) return;
        setData({ queue, weakArea });
      } catch {
        if (!cancelled) {
          setData({
            queue: { due: 0, new: 0, total: 0 },
            weakArea: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, mechanismTitles, profileId, boostSet]);

  const queue = data?.queue;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Hi, {greetingName}.</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">What would you like to study today?</span>
          <span className="font-medium capitalize">
            {studySystems && studySystems.length > 0 ? studySystems.join(" · ") : "All topics"}
          </span>
          <Link
            href="/settings"
            className="text-muted-foreground hover:bg-muted text-foreground rounded-md border px-2 py-0.5 text-xs"
          >
            Change topic
          </Link>
        </div>
      </header>

      <section aria-label="Review queue" className="flex flex-col gap-3">
        {data === null ? (
          <p className="text-muted-foreground text-sm">Loading queue…</p>
        ) : queue!.due === 0 ? (
          <EmptyState
            icon="✓"
            title="Nothing due right now"
            description="The SM-2 scheduler hasn't surfaced any cards for revision today. Open a topic if you want to push ahead."
            actions={[{ label: "Browse chapters", href: "/systems", variant: "primary" }]}
          />
        ) : (
          <p className="text-base leading-7">
            <strong className="font-medium">{queue!.due}</strong> card
            {queue!.due === 1 ? "" : "s"} due for revision.
          </p>
        )}
      </section>

      <QuoteCard quote={quote} />

      <section
        aria-label="Today reminders"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <UpcomingGoalsCard goals={upcomingGoals} />
        <WeakSystemCard weakArea={data?.weakArea ?? null} />
        <FacultyHomeworkCard assignments={assignments} />
      </section>

      {announcements.length > 0 ? <AnnouncementsCard announcements={announcements} /> : null}
    </main>
  );
}

function AnnouncementsCard({ announcements }: { announcements: readonly AnnouncementSummary[] }) {
  return (
    <section
      aria-label="Announcements"
      className="border-border bg-card flex flex-col gap-3 rounded-md border p-4"
    >
      <h2 className="font-heading text-sm font-semibold tracking-wide uppercase">Announcements</h2>
      <ul className="flex flex-col gap-3">
        {announcements.map((a) => (
          <li key={a.id} className="flex flex-col gap-1">
            <p className="text-sm font-medium">{a.title}</p>
            {a.body ? (
              <p className="text-muted-foreground text-xs whitespace-pre-wrap">{a.body}</p>
            ) : null}
            <p className="text-muted-foreground text-[10px]">
              {new Date(a.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <section
      aria-label="Motivation"
      className="border-input bg-muted/20 flex flex-col gap-1 rounded-md border p-4"
    >
      <p className="font-heading text-base leading-7 italic">&ldquo;{quote.text}&rdquo;</p>
      {quote.attribution ? (
        <p className="text-muted-foreground text-xs">— {quote.attribution}</p>
      ) : null}
    </section>
  );
}

function UpcomingGoalsCard({ goals }: { goals: readonly UpcomingGoal[] }) {
  if (goals.length === 0) {
    return (
      <article
        aria-label="Upcoming goals"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Upcoming goals</p>
        <p className="font-heading text-base font-medium">Nothing scheduled.</p>
        <p className="text-muted-foreground text-xs">
          Add an exam or personal goal to keep your calendar honest.
        </p>
        <Link
          href="/calendar/new"
          className="text-foreground mt-1 self-start rounded-md border px-2 py-1 text-xs hover:underline"
        >
          Add to calendar
        </Link>
      </article>
    );
  }
  return (
    <article
      aria-label="Upcoming goals"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">Upcoming goals</p>
      <ul className="flex flex-col gap-2">
        {goals.map((g) => {
          const dayLabel =
            g.daysAway === 0 ? "today" : g.daysAway === 1 ? "tomorrow" : `in ${g.daysAway} days`;
          return (
            <li key={g.id} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{g.title}</span>
              <span className="text-muted-foreground text-xs">
                {dayLabel} · {g.audience === "personal" ? "Your goal" : "Institution"}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        href="/calendar"
        className="text-muted-foreground mt-1 self-start text-xs underline-offset-2 hover:underline"
      >
        See full calendar
      </Link>
    </article>
  );
}

function WeakSystemCard({ weakArea }: { weakArea: WeakArea | null }) {
  if (weakArea === null) {
    return (
      <article
        aria-label="Lowest-scoring system"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Where you&apos;re slipping
        </p>
        <p className="font-heading text-base font-medium">No data yet.</p>
        <p className="text-muted-foreground text-xs">
          Once you&apos;ve rated a few cards, this card will surface the system you&apos;re scoring
          lowest in.
        </p>
      </article>
    );
  }
  return (
    <article
      aria-label="Lowest-scoring system"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">
        Where you&apos;re slipping
      </p>
      <p className="font-heading text-base font-medium">{weakArea.title}</p>
      <p className="text-muted-foreground text-xs">
        {weakArea.masteryPct}% mastery across {weakArea.seen} reviewed card
        {weakArea.seen === 1 ? "" : "s"}.
      </p>
      <Link
        href={`/review?Chapter=${encodeURIComponent(weakArea.chapterId)}`}
        className="text-foreground mt-1 self-start rounded-md border px-2 py-1 text-xs hover:underline"
      >
        Drill this chapter
      </Link>
    </article>
  );
}

function FacultyHomeworkCard({ assignments }: { assignments: readonly FacultyAssignment[] }) {
  if (assignments.length === 0) {
    return (
      <article
        aria-label="Faculty homework"
        className="border-input flex flex-col gap-2 rounded-md border p-4"
      >
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Faculty homework</p>
        <p className="font-heading text-base font-medium">No homework assigned.</p>
        <p className="text-muted-foreground text-xs">
          When a faculty member assigns reading or a task, it&apos;ll show up here.
        </p>
      </article>
    );
  }
  return (
    <article
      aria-label="Faculty homework"
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">Faculty homework</p>
      <ul className="flex flex-col gap-2">
        {assignments.map((a) => (
          <li key={a.id} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{a.title}</span>
            <span className="text-muted-foreground text-xs">{formatAssignmentDue(a.dueAt)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatAssignmentDue(dueAt: string | null): string {
  if (!dueAt) return "No deadline";
  const due = new Date(dueAt);
  if (!Number.isFinite(due.getTime())) return dueAt;
  const now = Date.now();
  const diffDays = Math.ceil((due.getTime() - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return `Due today (${due.toISOString().slice(0, 10)})`;
  if (diffDays === 1) return `Due tomorrow (${due.toISOString().slice(0, 10)})`;
  return `Due in ${diffDays} days (${due.toISOString().slice(0, 10)})`;
}
