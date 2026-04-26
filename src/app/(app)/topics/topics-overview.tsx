"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { loadAllCardStates } from "@/lib/srs/local";
import { classifyTopics, type TopicSummary } from "@/lib/srs/topic-overview";
import { cn } from "@/lib/utils";

import type { StoredCardState } from "@/lib/srs/db";

type Props = {
  cards: readonly Card[];
  mechanismMeta: Record<string, { title: string; organSystem: string }>;
  profileId: string;
};

/**
 * Three-column-ish overview of every mechanism, grouped by progress
 * bucket. In-progress topics surface first because that's what the
 * learner most likely needs to act on.
 */
export function TopicsOverview({ cards, mechanismMeta, profileId }: Props) {
  const [states, setStates] = useState<StoredCardState[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllCardStates(profileId);
        if (!cancelled) setStates(rows);
      } catch {
        if (!cancelled) setStates([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const overview = useMemo(() => {
    if (states === null) return null;
    const meta = new Map(Object.entries(mechanismMeta));
    return classifyTopics({ cards, cardStates: states, now: new Date(), mechanismMeta: meta });
  }, [cards, mechanismMeta, states]);

  if (overview === null) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Topics</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            What you&apos;ve studied
          </h1>
        </header>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Loading your topics…
        </p>
      </main>
    );
  }

  const totalTopics =
    overview.inProgress.length + overview.completed.length + overview.notStarted.length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Topics</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          What you&apos;ve studied
        </h1>
        <p className="text-muted-foreground text-sm">
          Mechanisms grouped by progress. {totalTopics} total · {overview.inProgress.length} in
          progress · {overview.completed.length} completed · {overview.notStarted.length} not yet
          started.
        </p>
      </header>

      {totalTopics === 0 ? (
        <p className="text-muted-foreground border-border rounded-md border p-4 text-sm">
          No topics yet. Mechanisms appear here as soon as content is published. Once you start
          reviewing, they&apos;ll move between buckets.
        </p>
      ) : null}

      {overview.inProgress.length > 0 ? (
        <Section
          title="In progress"
          description="Mechanisms with at least one card rated. Due cards show first."
        >
          <ul className="flex flex-col gap-2">
            {overview.inProgress.map((s) => (
              <TopicRow key={s.mechanismId} topic={s} />
            ))}
          </ul>
        </Section>
      ) : null}

      {overview.notStarted.length > 0 ? (
        <Section
          title="Not yet started"
          description="Mechanisms with no card_states recorded — fresh territory."
        >
          <ul className="flex flex-col gap-2">
            {overview.notStarted.map((s) => (
              <TopicRow key={s.mechanismId} topic={s} />
            ))}
          </ul>
        </Section>
      ) : null}

      {overview.completed.length > 0 ? (
        <Section
          title="Completed"
          description="Every card in `review` status with interval ≥ 21 days. Long-tail review only."
        >
          <ul className="flex flex-col gap-2">
            {overview.completed.map((s) => (
              <TopicRow key={s.mechanismId} topic={s} />
            ))}
          </ul>
        </Section>
      ) : null}
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h2 className="font-heading text-xl font-medium">{title}</h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </header>
      {children}
    </section>
  );
}

function TopicRow({ topic }: { topic: TopicSummary }) {
  return (
    <li className="border-border flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link
          href={`/review?mechanism=${encodeURIComponent(topic.mechanismId)}`}
          className="font-medium underline-offset-2 hover:underline"
        >
          {topic.title}
        </Link>
        <p className="text-muted-foreground text-xs capitalize">
          {topic.organSystem} · {topic.seenCards}/{topic.totalCards} card
          {topic.totalCards === 1 ? "" : "s"} seen
          {topic.dueCards > 0 ? ` · ${topic.dueCards} due now` : ""}
          {topic.leechCards > 0 ? ` · ${topic.leechCards} leech` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/review?mechanism=${encodeURIComponent(topic.mechanismId)}`}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          Review
        </Link>
        <Link
          href={`/self-test/session?mechanism=${encodeURIComponent(topic.mechanismId)}`}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          Self-test
        </Link>
      </div>
    </li>
  );
}
