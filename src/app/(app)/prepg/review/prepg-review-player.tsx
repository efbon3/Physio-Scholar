"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import type { Card } from "@/lib/content/cards";
import { buildMcqFromCard, seedFromString, type McqQuestion } from "@/lib/content/exam";
import { loadAllPrepgCardStates } from "@/lib/srs/prepg-local";
import { assembleQueue } from "@/lib/srs/queue";
import type { CardState } from "@/lib/srs/types";

import { PrepgMcqSession } from "../[chapter]/test/prepg-mcq-session";

const DEFAULT_MAX_NEW_CARDS = 10;

type Props = {
  /** All Pre-PG MCQs across every Pre-PG chapter, server-side gathered. */
  allCards: readonly Card[];
  profileId: string;
};

/**
 * Pre-PG daily review player — assembles the SRS queue from
 * `prepg_card_states`, builds shuffled MCQs from the queued cards,
 * and hands them to `PrepgMcqSession` for the actual answer / submit
 * / rate / next loop. The session writes ratings via
 * `recordPrepgReviewLocally` so the row pool stays isolated from the
 * curriculum SRS state.
 *
 * Loading happens once on mount: queue assembly is deterministic
 * given the input cards + states + clock, so a re-render doesn't
 * need to rebuild it.
 */
export function PrepgReviewPlayer({ allCards, profileId }: Props) {
  const [queueQuestions, setQueueQuestions] = useState<McqQuestion[] | null>(null);
  const [dueCount, setDueCount] = useState(0);

  // Stable session salt — fixed at mount so the option-shuffle for
  // each card stays the same across re-renders during the session.
  // crypto.randomUUID alone gives us 122 bits of entropy per session;
  // no need for Date.now (which the purity-rule lint forbids in
  // render).
  const sessionSalt = useMemo(
    () => `prepg-review:${profileId}:${crypto.randomUUID()}`,
    [profileId],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllPrepgCardStates(profileId);
        const stateMap = new Map<string, CardState>();
        for (const row of rows) stateMap.set(row.card_id, row);
        const queue = assembleQueue({
          cards: allCards,
          cardStates: stateMap,
          now: new Date(),
          maxNewCards: DEFAULT_MAX_NEW_CARDS,
        });
        if (cancelled) return;
        setDueCount(queue.length);
        const questions = queue
          .map((qc) => buildMcqFromCard(qc.card, seedFromString(`${qc.card.id}:${sessionSalt}`)))
          .filter((q): q is McqQuestion => q !== null);
        setQueueQuestions(questions);
      } catch (err) {
        console.error("Failed to assemble Pre-PG review queue", err);
        if (!cancelled) setQueueQuestions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allCards, profileId, sessionSalt]);

  if (queueQuestions === null) {
    return (
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Loading queue…
      </p>
    );
  }

  if (queueQuestions.length === 0) {
    return (
      <EmptyState
        icon="✓"
        title="Nothing due right now"
        description={
          dueCount === 0 && allCards.length === 0
            ? "No Pre-PG content authored yet. Drop chapter-format markdown files into content/prepg/ to get started."
            : "The SM-2 scheduler hasn't surfaced any Pre-PG cards for revision today. Drill a chapter manually if you want to push ahead."
        }
        actions={[{ label: "Browse Pre-PG chapters", href: "/prepg", variant: "primary" }]}
      />
    );
  }

  return (
    <>
      <p className="text-muted-foreground text-sm">
        <strong className="text-foreground font-medium">{queueQuestions.length}</strong> card
        {queueQuestions.length === 1 ? "" : "s"} due for revision.
      </p>
      <PrepgMcqSession
        questions={queueQuestions}
        cards={allCards}
        chapterId="__queue__"
        profileId={profileId}
      />
      <p className="text-muted-foreground text-xs">
        Done?{" "}
        <Link href="/prepg" className="underline-offset-2 hover:underline">
          Back to Pre-PG
        </Link>
      </p>
    </>
  );
}
