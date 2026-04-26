import type { Card } from "@/lib/content/cards";

import type { StoredCardState } from "./db";

/**
 * Mechanism-level overview classification for the /topics page.
 *
 * Each mechanism the learner could study lands in one of three buckets,
 * driven by what state its cards are in:
 *
 *   not-started — zero card_states for this mechanism (no card has
 *                 ever been rated). The learner hasn't touched it.
 *   in-progress — at least one card_state exists but at least one card
 *                 in the mechanism is still due, learning, or leech.
 *                 This is the "due / partially mastered" cluster.
 *   completed   — every card in the mechanism has a card_state AND
 *                 every card_state is in `review` status with an
 *                 interval ≥ 21 days. That mirrors the "learned"
 *                 threshold in mechanism-stats.tsx, so the bucket
 *                 boundary stays consistent across surfaces.
 *
 * Pure function — takes pre-loaded cards + states, returns shaped
 * data. Tested against fixtures with no DB / browser dependencies.
 */

const COMPLETED_INTERVAL_DAYS = 21;

export type TopicBucket = "not-started" | "in-progress" | "completed";

export type TopicSummary = {
  mechanismId: string;
  title: string;
  organSystem: string;
  totalCards: number;
  /** How many cards have any card_state (i.e., have been rated at least once). */
  seenCards: number;
  /** How many cards are currently in `review` status with interval ≥ 21d. */
  masteredCards: number;
  /** How many cards are currently due (due_at ≤ now). */
  dueCards: number;
  /** How many of the seen cards are leeches. */
  leechCards: number;
  bucket: TopicBucket;
};

export type TopicsOverview = {
  notStarted: TopicSummary[];
  inProgress: TopicSummary[];
  completed: TopicSummary[];
};

export function classifyTopics({
  cards,
  cardStates,
  now,
  mechanismMeta,
}: {
  cards: readonly Card[];
  cardStates: readonly StoredCardState[];
  now: Date;
  mechanismMeta: ReadonlyMap<string, { title: string; organSystem: string }>;
}): TopicsOverview {
  const stateByCard = new Map<string, StoredCardState>();
  for (const s of cardStates) stateByCard.set(s.card_id, s);

  const cardsByMechanism = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = cardsByMechanism.get(c.mechanism_id) ?? [];
    arr.push(c);
    cardsByMechanism.set(c.mechanism_id, arr);
  }

  const nowMs = now.getTime();
  const summaries: TopicSummary[] = [];

  for (const [mechanismId, mechCards] of cardsByMechanism) {
    const meta = mechanismMeta.get(mechanismId);
    if (!meta) continue;

    let seenCards = 0;
    let masteredCards = 0;
    let dueCards = 0;
    let leechCards = 0;

    for (const c of mechCards) {
      const s = stateByCard.get(c.id);
      if (!s) continue;
      seenCards += 1;
      if (s.status === "review" && Number(s.interval_days) >= COMPLETED_INTERVAL_DAYS) {
        masteredCards += 1;
      }
      if (s.status === "leech") leechCards += 1;
      const dueMs = new Date(s.due_at).getTime();
      if (Number.isFinite(dueMs) && dueMs <= nowMs && s.status !== "suspended") {
        dueCards += 1;
      }
    }

    let bucket: TopicBucket;
    if (seenCards === 0) {
      bucket = "not-started";
    } else if (masteredCards === mechCards.length && mechCards.length > 0) {
      bucket = "completed";
    } else {
      bucket = "in-progress";
    }

    summaries.push({
      mechanismId,
      title: meta.title,
      organSystem: meta.organSystem,
      totalCards: mechCards.length,
      seenCards,
      masteredCards,
      dueCards,
      leechCards,
      bucket,
    });
  }

  // Sort: in-progress first, ordered by most due cards first; completed
  // second alphabetically; not-started last alphabetically. This mirrors
  // what a learner is most likely to act on at the top of the page.
  const inProgress = summaries
    .filter((s) => s.bucket === "in-progress")
    .sort((a, b) => {
      if (a.dueCards !== b.dueCards) return b.dueCards - a.dueCards;
      return a.title.localeCompare(b.title);
    });
  const completed = summaries
    .filter((s) => s.bucket === "completed")
    .sort((a, b) => a.title.localeCompare(b.title));
  const notStarted = summaries
    .filter((s) => s.bucket === "not-started")
    .sort((a, b) => a.title.localeCompare(b.title));

  return { notStarted, inProgress, completed };
}
