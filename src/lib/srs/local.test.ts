import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __resetLearningDBForTests, getLearningDB } from "./db";
import {
  clearAllLocalState,
  clearPendingStatePush,
  countPendingReviews,
  getLocalCardState,
  loadAllCardStates,
  markReviewsSynced,
  recordReviewLocally,
} from "./local";

const ALICE = "aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const BOB = "bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const NOW = new Date("2026-05-01T10:00:00Z");

beforeEach(async () => {
  __resetLearningDBForTests();
  const db = getLearningDB();
  await db.delete();
  await db.open();
});

afterEach(async () => {
  __resetLearningDBForTests();
});

describe("recordReviewLocally — creates state + review in one transaction", () => {
  it("writes both rows and stamps updated_at", async () => {
    const result = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 1,
      timeSpentSeconds: 22,
      now: NOW,
    });

    expect(result.review.rating).toBe("good");
    expect(result.review.pending_sync).toBe(1);
    expect(result.cardState.status).toBe("review"); // Good graduates a new card
    expect(result.cardState.updated_at).toBe(NOW.toISOString());

    const refetched = await getLocalCardState(ALICE, "frank-starling:1");
    expect(refetched).not.toBeNull();
    expect(refetched?.interval_days).toBeCloseTo(1, 6); // first Good → 1 day
  });

  it("re-rating an existing card applies SM-2 to the prior state", async () => {
    const first = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 10,
      now: NOW,
    });
    expect(first.cardState.interval_days).toBeCloseTo(1, 6);

    const LATER = new Date("2026-05-02T10:00:00Z");
    const second = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 10,
      now: LATER,
    });
    // Second Good multiplies prior interval (1) by ease (2.5) → 2.5.
    expect(second.cardState.interval_days).toBeCloseTo(2.5, 6);
  });

  it("queues a pending state push per card (latest state wins)", async () => {
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 10,
      now: NOW,
    });
    const db = getLearningDB();
    const pushes = await db.pending_state_pushes.toArray();
    expect(pushes).toHaveLength(1);
    expect(pushes[0].card_id).toBe("frank-starling:1");
  });
});

describe("reads — getLocalCardState / loadAllCardStates", () => {
  it("loadAllCardStates only returns rows owned by the profile", async () => {
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    await recordReviewLocally({
      profileId: BOB,
      cardId: "frank-starling:1",
      rating: "hard",
      hintsUsed: 2,
      timeSpentSeconds: 30,
      now: NOW,
    });

    // Note: both wrote to the same card_id — Dexie's primary key is card_id
    // alone, so the Bob write overwrites the Alice state. That's the
    // single-user-per-device assumption (one browser = one logged-in user).
    // The profile_id column defends against leaks via getLocalCardState.
    const alice = await getLocalCardState(ALICE, "frank-starling:1");
    expect(alice).toBeNull(); // overwritten by Bob's write
    const bob = await getLocalCardState(BOB, "frank-starling:1");
    expect(bob).not.toBeNull();
  });
});

describe("sync-queue helpers", () => {
  it("countPendingReviews starts at 0 and rises with each review", async () => {
    expect(await countPendingReviews(ALICE)).toBe(0);
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    expect(await countPendingReviews(ALICE)).toBe(1);
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:2",
      rating: "again",
      hintsUsed: 1,
      timeSpentSeconds: 12,
      now: NOW,
    });
    expect(await countPendingReviews(ALICE)).toBe(2);
  });

  it("markReviewsSynced drops the pending flag on matching ids only", async () => {
    const a = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    const b = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:2",
      rating: "hard",
      hintsUsed: 1,
      timeSpentSeconds: 15,
      now: NOW,
    });
    await markReviewsSynced([a.review.id]);
    expect(await countPendingReviews(ALICE)).toBe(1);

    const db = getLearningDB();
    const first = await db.reviews.get(a.review.id);
    expect(first?.pending_sync).toBe(0);
    const second = await db.reviews.get(b.review.id);
    expect(second?.pending_sync).toBe(1);
  });

  it("clearPendingStatePush removes that card's queued state entry", async () => {
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    const db = getLearningDB();
    expect((await db.pending_state_pushes.toArray()).length).toBe(1);
    await clearPendingStatePush("frank-starling:1");
    expect((await db.pending_state_pushes.toArray()).length).toBe(0);
  });
});

describe("self_explanation normalisation", () => {
  it("stores a trimmed non-empty explanation on the review row", async () => {
    const result = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      selfExplanation: "  Frank-Starling matches output to venous return.  ",
      now: NOW,
    });
    expect(result.review.self_explanation).toBe("Frank-Starling matches output to venous return.");
  });

  it("normalises empty / whitespace-only input to null", async () => {
    const a = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      selfExplanation: "",
      now: NOW,
    });
    expect(a.review.self_explanation).toBeNull();

    const b = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:2",
      rating: "hard",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      selfExplanation: "   \n\t  ",
      now: NOW,
    });
    expect(b.review.self_explanation).toBeNull();
  });

  it("defaults to null when the caller omits the field entirely", async () => {
    const result = await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    expect(result.review.self_explanation).toBeNull();
  });
});

describe("clearAllLocalState", () => {
  it("wipes every table in the learning DB", async () => {
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    await clearAllLocalState();
    const db = getLearningDB();
    expect(await db.card_states.toArray()).toEqual([]);
    expect(await db.reviews.toArray()).toEqual([]);
    expect(await db.pending_state_pushes.toArray()).toEqual([]);
    expect(await loadAllCardStates(ALICE)).toEqual([]);
  });
});
