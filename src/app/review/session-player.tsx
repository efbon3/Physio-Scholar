"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Card } from "@/lib/content/cards";
import { incrementSessionCount } from "@/lib/pwa/install-state";
import { loadAllCardStates, recordReviewLocally } from "@/lib/srs/local";
import { assembleQueue, type QueuedCard } from "@/lib/srs/queue";
import type { CardState, Rating } from "@/lib/srs/types";
import { useAutoSync } from "@/lib/srs/useAutoSync";
import { cn } from "@/lib/utils";

import { CardView } from "./components/card-view";

type Status = "loading" | "empty" | "reviewing" | "complete";

/**
 * Session state machine. One browser mount = one session.
 *
 *   loading   → Dexie queried, queue assembled
 *   empty     → no cards + no new cards to introduce today
 *   reviewing → walking through queue[index]
 *   complete  → end-of-session summary
 *
 * All card-level interaction state (attempt text, hints shown, revealed,
 * rating-start timestamp) lives on the ActiveCardState inside this
 * component — intentionally not persisted because a mid-card refresh is
 * a recoverable situation, not a state we need to remember.
 */
type ActiveCardState = {
  attempt: string;
  hintsShown: number;
  /**
   * Has the answer been revealed at least once for this card. Drives:
   *   - textarea-disabled state (one-way commit, no editing the
   *     attempt after the first reveal — that would game the recall)
   *   - rating row visibility (you can't rate before seeing the answer)
   *   - flag-card affordance availability
   *
   * Once true, stays true for the rest of this card's display.
   */
  revealed: boolean;
  /**
   * Is the answer pane currently visible. Toggled by the Show / Hide
   * answer button. Independent of `revealed` so the learner can collapse
   * the pane (e.g., to re-read the stem without the answer in their
   * peripheral) but the textarea stays disabled and the rating row
   * stays available.
   */
  answerVisible: boolean;
  /** Post-reveal self-explanation (build spec §2.6). Optional in Review mode. */
  selfExplanation: string;
  /** ms epoch when the reveal happened — drives the 2s rating delay + timing telemetry. */
  revealedAt: number | null;
  /** ms epoch when the card was first shown — drives time_spent_seconds. */
  startedAt: number;
};

function freshCardState(): ActiveCardState {
  return {
    attempt: "",
    hintsShown: 0,
    revealed: false,
    answerVisible: false,
    selfExplanation: "",
    revealedAt: null,
    startedAt: Date.now(),
  };
}

const RATING_DELAY_MS = 2000;
const DEFAULT_MAX_NEW_CARDS = 10;

type Props = {
  cards: readonly Card[];
  profileId: string;
  /**
   * When the learner entered via `/review?mechanism=<id>` the page passes
   * in the matched mechanism here. The session renders a header strip
   * that confirms which topic is being drilled and offers a "Back to
   * mechanism" escape hatch — without this, a filtered session looks
   * identical to a general one.
   */
  focusMechanism?: { id: string; title: string } | null;
  /**
   * Map of mechanism_id → { title, organSystem } so the always-on
   * ReviewHeader can show the proper title of the current card's
   * mechanism. Earlier we only showed the kebab-case slug, which
   * looked like "FRANK STARLING" — fine for one-mechanism pilots,
   * confusing for general queues.
   */
  mechanismTitles?: Record<string, { title: string; organSystem: string }>;
};

export function SessionPlayer({
  cards,
  profileId,
  focusMechanism = null,
  mechanismTitles = {},
}: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [queue, setQueue] = useState<QueuedCard[]>([]);
  const [index, setIndex] = useState(0);
  const [cardState, setCardState] = useState<ActiveCardState>(freshCardState);
  const [ratedCount, setRatedCount] = useState(0);
  // Post-rating background sync. Cooldown in the hook prevents
  // hammering the API when the learner blitzes cards.
  const autoSync = useAutoSync({ profileId });

  // Must run unconditionally — hooks rule. Consumed only when reviewing.
  const progress = useMemo(() => ({ index, total: queue.length }), [index, queue.length]);

  // Load local card_states and assemble the queue once on mount. Any
  // offline-queued reviews are already in Dexie from prior sessions, so
  // this deterministically reconstructs the right queue every time.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadAllCardStates(profileId);
        const stateMap = new Map<string, CardState>();
        for (const row of rows) stateMap.set(row.card_id, row);
        const q = assembleQueue({
          cards,
          cardStates: stateMap,
          now: new Date(),
          maxNewCards: DEFAULT_MAX_NEW_CARDS,
        });
        if (cancelled) return;
        setQueue(q);
        setStatus(q.length === 0 ? "empty" : "reviewing");
        setCardState(freshCardState());
      } catch (err) {
        console.error("Failed to assemble review queue", err);
        if (!cancelled) setStatus("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, profileId]);

  const current = queue[index];

  async function handleRating(rating: Rating) {
    if (!current) return;
    const now = new Date();
    const timeSpentSeconds = Math.max(0, Math.round((now.getTime() - cardState.startedAt) / 1000));

    try {
      await recordReviewLocally({
        profileId,
        cardId: current.card.id,
        rating,
        hintsUsed: cardState.hintsShown,
        timeSpentSeconds,
        selfExplanation: cardState.selfExplanation,
        now,
      });
    } catch (err) {
      console.error("Failed to record rating locally", err);
      // Surface a toast-style error in a later iteration; for v1 we keep
      // the session moving rather than trap the learner on a broken card.
    }

    setRatedCount((n) => n + 1);
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setStatus("complete");
    } else {
      setIndex(nextIndex);
      setCardState(freshCardState());
    }
    // Fire-and-forget — the cooldown inside useAutoSync dedupes so a
    // fast learner doesn't trigger a request per card.
    void autoSync.runSync();
  }

  // Resolve the title + organ system of whichever mechanism the
  // current card belongs to, falling back to focusMechanism (filtered
  // mode) or the kebab-case id if no titles map was supplied.
  const currentMechanismInfo = (() => {
    if (focusMechanism) {
      return {
        title: focusMechanism.title,
        organSystem: mechanismTitles[focusMechanism.id]?.organSystem ?? "",
      };
    }
    if (current?.card.mechanism_id && mechanismTitles[current.card.mechanism_id]) {
      return mechanismTitles[current.card.mechanism_id];
    }
    if (current?.card.mechanism_id) {
      return {
        title: current.card.mechanism_id.replace(/-/g, " "),
        organSystem: "",
      };
    }
    return { title: "", organSystem: "" };
  })();

  if (status === "loading") {
    return (
      <>
        <ReviewHeader
          title={focusMechanism?.title ?? "Loading…"}
          organSystem={currentMechanismInfo.organSystem}
          isFiltered={Boolean(focusMechanism)}
        />
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6">
          <p className="text-muted-foreground text-sm">Loading your session…</p>
        </main>
      </>
    );
  }

  if (status === "empty") {
    return (
      <>
        <ReviewHeader
          title={focusMechanism?.title ?? "Review queue"}
          organSystem={currentMechanismInfo.organSystem}
          isFiltered={Boolean(focusMechanism)}
        />
        <EmptyState focusMechanism={focusMechanism} />
      </>
    );
  }

  if (status === "complete") {
    return (
      <>
        <ReviewHeader
          title={focusMechanism?.title ?? "Session complete"}
          organSystem={currentMechanismInfo.organSystem}
          isFiltered={Boolean(focusMechanism)}
        />
        <CompleteState ratedCount={ratedCount} focusMechanism={focusMechanism} />
      </>
    );
  }

  // reviewing
  return (
    <>
      <ReviewHeader
        title={currentMechanismInfo.title}
        organSystem={currentMechanismInfo.organSystem}
        isFiltered={Boolean(focusMechanism)}
      />
      <CardView
        queued={current!}
        active={cardState}
        onAttemptChange={(attempt) => setCardState((s) => ({ ...s, attempt }))}
        onShowHint={() =>
          setCardState((s) =>
            s.hintsShown >= current!.card.hints.length ? s : { ...s, hintsShown: s.hintsShown + 1 },
          )
        }
        onReveal={() =>
          setCardState((s) => ({
            ...s,
            revealed: true,
            answerVisible: true,
            revealedAt: s.revealedAt ?? Date.now(),
          }))
        }
        onToggleAnswer={() => setCardState((s) => ({ ...s, answerVisible: !s.answerVisible }))}
        onSelfExplanationChange={(selfExplanation) =>
          setCardState((s) => ({ ...s, selfExplanation }))
        }
        onRate={handleRating}
        ratingDelayMs={RATING_DELAY_MS}
        progress={progress}
      />
    </>
  );
}

/**
 * Sticky header bar for every review-session state. Always shows a
 * "← Today" escape hatch (so the learner is never trapped) plus the
 * proper title of the mechanism the current card belongs to.
 *
 * `isFiltered=true` dims the title to "Studying: X" framing so the
 * learner knows they're inside a `/review?mechanism=<id>` filtered
 * session, not a general queue.
 */
function ReviewHeader({
  title,
  organSystem,
  isFiltered,
}: {
  title: string;
  organSystem: string;
  isFiltered: boolean;
}) {
  return (
    <div
      role="banner"
      className="border-border bg-background/95 sticky top-0 z-10 w-full border-b backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 px-6 py-2 text-xs">
        <Link
          href="/today"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
          aria-label="Back to Today"
        >
          ← Today
        </Link>
        <p className="flex flex-wrap items-center gap-1.5 text-right">
          {isFiltered ? (
            <span className="text-muted-foreground">Studying:</span>
          ) : (
            <span className="text-muted-foreground">Reviewing:</span>
          )}
          <span className="font-medium">{title}</span>
          {organSystem ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground capitalize">{organSystem}</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}

/**
 * Navigation options on the end-of-session states. Without these the
 * learner is marooned on "Session complete" with no way out except the
 * browser URL bar — which isn't a real product UX. Phase 5's global nav
 * will replace this; for now the two link buttons cover the obvious
 * next actions.
 */
function SessionExitLinks({
  focusMechanism = null,
}: {
  focusMechanism?: { id: string; title: string } | null;
}) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-2">
      <Link href="/today" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        Back to Today
      </Link>
      {focusMechanism ? (
        <Link href={`/systems`} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Browse mechanisms
        </Link>
      ) : (
        <Link href="/systems" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Browse mechanisms
        </Link>
      )}
    </div>
  );
}

function EmptyState({ focusMechanism }: { focusMechanism: { id: string; title: string } | null }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-medium">Nothing due right now</h1>
      <p className="text-muted-foreground text-sm">
        {focusMechanism
          ? `You're caught up on ${focusMechanism.title}. Come back when the next card is due.`
          : "You're caught up on reviews, and today's new-card budget is spent. Come back tomorrow, or browse mechanisms from the Systems tab."}
      </p>
      <SessionExitLinks focusMechanism={focusMechanism} />
    </main>
  );
}

function CompleteState({
  ratedCount,
  focusMechanism,
}: {
  ratedCount: number;
  focusMechanism: { id: string; title: string } | null;
}) {
  // Bump the PWA install-prompt eligibility counter. Only counts
  // sessions with at least one rated card so a "launched and bailed"
  // interaction doesn't accidentally arm the banner.
  useEffect(() => {
    if (ratedCount > 0) incrementSessionCount();
  }, [ratedCount]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-medium">Session complete</h1>
      <p className="text-sm">
        {ratedCount} card{ratedCount === 1 ? "" : "s"} reviewed
        {focusMechanism ? ` on ${focusMechanism.title}` : ""}.
      </p>
      <p className="text-muted-foreground text-sm">
        See you tomorrow — or sooner, if more cards come due.
      </p>
      <SessionExitLinks focusMechanism={focusMechanism} />
    </main>
  );
}
