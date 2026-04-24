import type { Card } from "@/lib/content/cards";

import { newCardState, type CardState } from "./types";

/**
 * Queue-assembly for a review session.
 *
 * Given the universe of cards, the learner's existing card_states, and
 * "now", produce the ordered list of cards the session UI should walk
 * through. Pure function — no I/O, no randomness.
 *
 * Ordering rules (build spec §2.3):
 *   1. Due cards first, sorted by `due_at` ascending (most overdue first).
 *   2. Up to `maxNewCards` brand-new cards (no existing state), in the
 *      order they appear in the input cards array.
 *   3. Suspended cards are never queued.
 *   4. Leech cards are queued by default; callers opt out via
 *      `includeLeeches: false` (the Today tab will likely opt them out
 *      and surface a separate "you have leeches" affordance).
 *
 * The `maxNewCards` cap mirrors build spec §2.7's "new card introduction
 * rate" (default 10/day, configurable 5–20). This function does not
 * enforce the daily window — the caller is expected to have already
 * subtracted "new cards introduced today" from the cap.
 */
export type QueuedCard = {
  card: Card;
  state: CardState;
  /** True for cards that had no prior state (brand-new to this learner). */
  isNew: boolean;
};

export type AssembleQueueOptions = {
  cards: readonly Card[];
  /** Map keyed by `card.id`. Cards without an entry here are "new". */
  cardStates: ReadonlyMap<string, CardState>;
  now: Date;
  maxNewCards: number;
  includeLeeches?: boolean;
};

export function assembleQueue(opts: AssembleQueueOptions): QueuedCard[] {
  const { cards, cardStates, now, maxNewCards, includeLeeches = true } = opts;

  const due: QueuedCard[] = [];
  const newOnes: QueuedCard[] = [];

  for (const card of cards) {
    const state = cardStates.get(card.id);

    if (state) {
      if (state.status === "suspended") continue;
      if (state.status === "leech" && !includeLeeches) continue;

      // Due: due_at has passed. learning + review + leech cards can all
      // be due; suspended already skipped above.
      if (new Date(state.due_at).getTime() <= now.getTime()) {
        due.push({ card, state, isNew: false });
      }
    } else {
      newOnes.push({ card, state: newCardState(now), isNew: true });
    }
  }

  due.sort((a, b) => {
    const at = new Date(a.state.due_at).getTime();
    const bt = new Date(b.state.due_at).getTime();
    if (at !== bt) return at - bt;
    // Deterministic tiebreak: by card id, so tests (and learners' eyes)
    // see a stable order across rebuilds.
    return a.card.id.localeCompare(b.card.id);
  });

  // Take up to maxNewCards in input order (i.e. the order authored cards
  // appear, which mirrors SOP Appendix A's Question 1, 2, 3 ordering).
  const limitedNew = newOnes.slice(0, Math.max(0, maxNewCards));

  return [...due, ...limitedNew];
}

/** Convenience helper: count cards in each bucket (used by Today dashboard). */
export function summariseQueue(queue: readonly QueuedCard[]) {
  let due = 0;
  let newCount = 0;
  for (const q of queue) {
    if (q.isNew) newCount += 1;
    else due += 1;
  }
  return { due, new: newCount, total: queue.length };
}
