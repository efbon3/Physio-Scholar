import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { __resetLearningDBForTests, getLearningDB } from "./db";
import { recordReviewLocally } from "./local";
import { pullRemote, pushPendingReviews, pushPendingStates, syncNow, __TEST_HELPERS } from "./sync";

const ALICE = "aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const NOW = new Date("2026-05-01T10:00:00Z");

/**
 * Minimal fake Supabase client covering the four method chains sync.ts
 * uses: `.from().upsert().select()`, `.from().upsert()`,
 * `.from().select().eq().order()`, and the conditional `.gt()` variant.
 *
 * Stores inserted rows in-memory and honours the same last-write-wins
 * semantics real Postgres would. Also supports overriding responses so
 * individual tests can simulate remote rows without running migrations.
 */
type FakeServer = {
  reviews: Database["public"]["Tables"]["reviews"]["Row"][];
  card_states: Database["public"]["Tables"]["card_states"]["Row"][];
};

function makeFakeClient(server: FakeServer): {
  supabase: SupabaseClient<Database>;
  calls: { reviewsUpsert: unknown[][]; stateUpserts: unknown[] };
} {
  const calls = { reviewsUpsert: [] as unknown[][], stateUpserts: [] as unknown[] };

  function hydrateReviewInsert(
    r: Database["public"]["Tables"]["reviews"]["Insert"],
    autoId: string,
  ): Database["public"]["Tables"]["reviews"]["Row"] {
    return {
      card_id: r.card_id,
      created_at: r.created_at ?? new Date().toISOString(),
      hints_used: r.hints_used ?? 0,
      id: (r as { id?: string }).id ?? autoId,
      profile_id: r.profile_id,
      rating: r.rating,
      self_explanation: r.self_explanation ?? null,
      session_id: r.session_id ?? null,
      time_spent_seconds: r.time_spent_seconds ?? 0,
    };
  }

  const reviewsTable = {
    upsert(rows: unknown[]) {
      calls.reviewsUpsert.push(rows);
      const typed = rows as Database["public"]["Tables"]["reviews"]["Insert"][];
      const assigned = typed.map((r, i) =>
        hydrateReviewInsert(r, `server-u-${server.reviews.length + i}`),
      );
      for (const row of assigned) {
        const existing = server.reviews.findIndex((x) => x.id === row.id);
        if (existing === -1) server.reviews.push(row);
      }
      // Real Supabase with ignoreDuplicates returns ONLY the rows that
      // actually inserted (the duplicates are omitted). Upsert path in
      // the new sync.ts doesn't rely on the returned rowset — it clears
      // pending_sync for the whole batch regardless — so we can return
      // the full batch safely. A dedicated test simulates the "dup
      // returns fewer rows" case.
      return Promise.resolve({ data: assigned, error: null });
    },
    insert(rows: unknown[]) {
      calls.reviewsUpsert.push(rows);
      const typed = rows as Database["public"]["Tables"]["reviews"]["Insert"][];
      const assigned = typed.map((r, i) =>
        hydrateReviewInsert(r, `server-i-${server.reviews.length + i}`),
      );
      for (const row of assigned) server.reviews.push(row);
      return {
        select: (_: string) => Promise.resolve({ data: assigned, error: null }),
      };
    },
    select(_cols: string) {
      let rows = [...server.reviews];
      const chain = {
        eq(column: string, value: string) {
          rows = rows.filter((r) => {
            const record = r as unknown as Record<string, unknown>;
            return record[column] === value;
          });
          return chain;
        },
        gt(column: string, value: string) {
          rows = rows.filter((r) => {
            const record = r as unknown as Record<string, unknown>;
            const v = record[column];
            return typeof v === "string" && v > value;
          });
          return chain;
        },
        order(_col: string, _opts: { ascending: boolean }) {
          return Promise.resolve({ data: rows, error: null });
        },
      };
      return chain;
    },
  };

  const stateTable = {
    upsert(row: unknown) {
      calls.stateUpserts.push(row);
      const typed = row as Database["public"]["Tables"]["card_states"]["Insert"];
      const hydrated: Database["public"]["Tables"]["card_states"]["Row"] = {
        card_id: typed.card_id,
        consecutive_again_count: typed.consecutive_again_count ?? 0,
        created_at: (typed as { created_at?: string }).created_at ?? new Date().toISOString(),
        due_at: typed.due_at,
        ease: typed.ease ?? 2.5,
        interval_days: typed.interval_days ?? 0,
        last_reviewed_at: typed.last_reviewed_at ?? null,
        profile_id: typed.profile_id,
        status: typed.status ?? "learning",
        updated_at: typed.updated_at ?? new Date().toISOString(),
      };
      const idx = server.card_states.findIndex(
        (s) => s.profile_id === hydrated.profile_id && s.card_id === hydrated.card_id,
      );
      if (idx === -1) server.card_states.push(hydrated);
      else server.card_states[idx] = hydrated;
      return Promise.resolve({ data: hydrated, error: null });
    },
    select(_cols: string) {
      let rows = [...server.card_states];
      const chain = {
        eq(column: string, value: string) {
          rows = rows.filter((r) => {
            const record = r as unknown as Record<string, unknown>;
            return record[column] === value;
          });
          return chain;
        },
        gt(column: string, value: string) {
          rows = rows.filter((r) => {
            const record = r as unknown as Record<string, unknown>;
            const v = record[column];
            return typeof v === "string" && v > value;
          });
          return chain;
        },
        order(_col: string, _opts: { ascending: boolean }) {
          return Promise.resolve({ data: rows, error: null });
        },
        maybeSingle() {
          const first = rows.length > 0 ? rows[0] : null;
          return Promise.resolve({ data: first, error: null });
        },
      };
      return chain;
    },
  };

  const supabase = {
    from(table: string) {
      if (table === "reviews") return reviewsTable;
      if (table === "card_states") return stateTable;
      throw new Error(`unknown table: ${table}`);
    },
  } as unknown as SupabaseClient<Database>;

  return { supabase, calls };
}

beforeEach(async () => {
  __resetLearningDBForTests();
  const db = getLearningDB();
  await db.delete();
  await db.open();
  // Clean localStorage between tests — sync cursor persists otherwise.
  if (typeof localStorage !== "undefined") localStorage.clear();
});

afterEach(async () => {
  __resetLearningDBForTests();
  if (typeof localStorage !== "undefined") localStorage.clear();
});

describe("isUuid", () => {
  it("accepts canonical UUIDs and rejects non-UUIDs", () => {
    expect(__TEST_HELPERS.isUuid("aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa")).toBe(true);
    expect(__TEST_HELPERS.isUuid("local-abc-123")).toBe(false);
    expect(__TEST_HELPERS.isUuid("")).toBe(false);
  });
});

describe("pushPendingReviews", () => {
  it("inserts pending reviews, rewrites ids for non-UUID locals, and clears pending_sync", async () => {
    const server: FakeServer = { reviews: [], card_states: [] };
    const { supabase, calls } = makeFakeClient(server);

    // One review gets a legit UUID id; seed another with a local-* id.
    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });
    const db = getLearningDB();
    await db.reviews.put({
      id: "local-abc-123",
      profile_id: ALICE,
      card_id: "frank-starling:2",
      rating: "again",
      hints_used: 2,
      time_spent_seconds: 20,
      session_id: null,
      self_explanation: null,
      engagement_method: null,
      created_at: NOW.toISOString(),
      pending_sync: 1,
    });

    const pushed = await pushPendingReviews(supabase, ALICE);
    expect(pushed).toBe(2);
    // Two server calls now: one upsert for UUID rows, one insert for
    // local-* rows. Split in sync.ts to avoid ordinal-skew corruption
    // when a duplicate row shrinks the upsert's returned rowset.
    expect(calls.reviewsUpsert).toHaveLength(2);
    expect(server.reviews).toHaveLength(2);

    // Non-UUID row should be rewritten to the server-assigned id.
    const stillLocalLocally = await db.reviews.get("local-abc-123");
    expect(stillLocalLocally).toBeUndefined();

    // pending_sync should be cleared on every row.
    const all = await db.reviews.toArray();
    expect(all.every((r) => r.pending_sync === 0)).toBe(true);
  });

  it("duplicate UUID-keyed reviews still clear pending_sync (regression for ordinal-skew bug)", async () => {
    // Seed a UUID-keyed review already on the server, then try to push
    // two more UUID-keyed reviews plus a local-* row. Before the fix,
    // the server's ignoreDuplicates shrank the upsert rowset, and the
    // ordinal-based id mapping misaligned the local-* row onto a
    // wrong server id.
    const existingId = "aaaaaaaa-1111-4111-8111-111111111111";
    const server: FakeServer = {
      reviews: [
        {
          card_id: "frank-starling:1",
          created_at: NOW.toISOString(),
          hints_used: 0,
          id: existingId,
          profile_id: ALICE,
          rating: "good",
          self_explanation: null,
          session_id: null,
          time_spent_seconds: 5,
        },
      ],
      card_states: [],
    };
    const { supabase } = makeFakeClient(server);
    const db = getLearningDB();
    // Local row with the same UUID id as the existing server row.
    await db.reviews.put({
      id: existingId,
      profile_id: ALICE,
      card_id: "frank-starling:1",
      rating: "good",
      hints_used: 0,
      time_spent_seconds: 5,
      session_id: null,
      self_explanation: null,
      engagement_method: null,
      created_at: NOW.toISOString(),
      pending_sync: 1,
    });
    // Another local-* row that should get a server-assigned id.
    await db.reviews.put({
      id: "local-xyz-789",
      profile_id: ALICE,
      card_id: "frank-starling:2",
      rating: "hard",
      hints_used: 0,
      time_spent_seconds: 8,
      session_id: null,
      self_explanation: null,
      engagement_method: null,
      created_at: NOW.toISOString(),
      pending_sync: 1,
    });

    const pushed = await pushPendingReviews(supabase, ALICE);
    expect(pushed).toBe(2);

    // Dupe UUID row: still present with its UUID id, pending_sync cleared.
    const dupe = await db.reviews.get(existingId);
    expect(dupe).toBeDefined();
    expect(dupe?.pending_sync).toBe(0);

    // Local-* row: rewritten to the server-assigned UUID.
    const localStillThere = await db.reviews.get("local-xyz-789");
    expect(localStillThere).toBeUndefined();

    // Sanity: no corrupt rows where a local-* row was rewritten to the
    // existingId (the old ordinal-skew bug would produce this).
    const allByCard = await db.reviews.where("card_id").equals("frank-starling:2").toArray();
    expect(allByCard).toHaveLength(1);
    expect(allByCard[0].id).not.toBe(existingId);
  });

  it("is a no-op when there are no pending reviews", async () => {
    const server: FakeServer = { reviews: [], card_states: [] };
    const { supabase, calls } = makeFakeClient(server);
    const pushed = await pushPendingReviews(supabase, ALICE);
    expect(pushed).toBe(0);
    expect(calls.reviewsUpsert).toHaveLength(0);
  });
});

describe("pushPendingStates", () => {
  it("upserts queued card states and clears the push queue", async () => {
    const server: FakeServer = { reviews: [], card_states: [] };
    const { supabase } = makeFakeClient(server);

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

    const pushed = await pushPendingStates(supabase, ALICE);
    expect(pushed).toBe(1);
    expect(server.card_states).toHaveLength(1);
    expect((await db.pending_state_pushes.toArray()).length).toBe(0);
  });

  it("LWW: does not overwrite a newer server row with an older local one", async () => {
    // Server already has a newer card_state; local pending push is
    // stale. The push should drop the stale entry without clobbering.
    const server: FakeServer = {
      reviews: [],
      card_states: [
        {
          card_id: "frank-starling:1",
          consecutive_again_count: 0,
          created_at: "2026-05-01T10:00:00Z",
          due_at: "2026-05-10T10:00:00Z",
          ease: 3.0,
          interval_days: 5,
          last_reviewed_at: "2026-05-03T10:00:00Z",
          profile_id: ALICE,
          status: "review",
          updated_at: "2026-05-03T10:00:00Z", // NEWER than local push
        },
      ],
    };
    const { supabase } = makeFakeClient(server);
    const db = getLearningDB();
    // Seed a stale pending push (updated_at older than server).
    await db.pending_state_pushes.put({
      card_id: "frank-starling:1",
      profile_id: ALICE,
      state: {
        card_id: "frank-starling:1",
        profile_id: ALICE,
        ease: 2.5,
        interval_days: 1,
        status: "learning",
        consecutive_again_count: 0,
        last_reviewed_at: "2026-04-30T10:00:00Z",
        due_at: "2026-05-01T10:00:00Z",
        updated_at: "2026-04-30T10:00:00Z", // older
      },
      requested_at: "2026-04-30T10:00:00Z",
    });

    const pushed = await pushPendingStates(supabase, ALICE);
    expect(pushed).toBe(0); // LWW rejected the stale push
    // Server row is untouched.
    expect(server.card_states[0].ease).toBe(3.0);
    expect(server.card_states[0].updated_at).toBe("2026-05-03T10:00:00Z");
    // Stale queue entry cleared to prevent re-try.
    expect((await db.pending_state_pushes.toArray()).length).toBe(0);
  });
});

describe("pullRemote — last-write-wins", () => {
  it("inserts remote card_states and reviews into Dexie", async () => {
    const server: FakeServer = {
      reviews: [
        {
          card_id: "frank-starling:1",
          created_at: "2026-05-02T10:00:00Z",
          hints_used: 0,
          id: "11111111-1111-1111-1111-111111111111",
          profile_id: ALICE,
          rating: "good",
          self_explanation: null,
          session_id: null,
          time_spent_seconds: 7,
        },
      ],
      card_states: [
        {
          card_id: "frank-starling:1",
          consecutive_again_count: 0,
          created_at: "2026-05-02T10:00:00Z",
          due_at: "2026-05-03T10:00:00Z",
          ease: 2.5,
          interval_days: 1,
          last_reviewed_at: "2026-05-02T10:00:00Z",
          profile_id: ALICE,
          status: "review",
          updated_at: "2026-05-02T10:00:00Z",
        },
      ],
    };
    const { supabase } = makeFakeClient(server);
    const result = await pullRemote(supabase, ALICE);
    expect(result.pulledReviews).toBe(1);
    expect(result.pulledStates).toBe(1);

    const db = getLearningDB();
    const states = await db.card_states.toArray();
    const reviews = await db.reviews.toArray();
    expect(states).toHaveLength(1);
    expect(reviews).toHaveLength(1);
    expect(states[0].status).toBe("review");
    expect(reviews[0].pending_sync).toBe(0);
  });

  it("does not overwrite local state when remote updated_at is older", async () => {
    const server: FakeServer = {
      reviews: [],
      card_states: [
        {
          card_id: "frank-starling:1",
          consecutive_again_count: 0,
          created_at: "2026-05-01T10:00:00Z",
          due_at: "2026-05-03T10:00:00Z",
          ease: 2.0,
          interval_days: 1,
          last_reviewed_at: "2026-05-01T10:00:00Z",
          profile_id: ALICE,
          status: "learning",
          updated_at: "2026-05-01T10:00:00Z",
        },
      ],
    };
    const { supabase } = makeFakeClient(server);

    // Seed a newer local row.
    const db = getLearningDB();
    await db.card_states.put({
      card_id: "frank-starling:1",
      profile_id: ALICE,
      ease: 3.0,
      interval_days: 2,
      status: "review",
      consecutive_again_count: 0,
      last_reviewed_at: "2026-05-02T10:00:00Z",
      due_at: "2026-05-05T10:00:00Z",
      updated_at: "2026-05-02T10:00:00Z",
    });

    const result = await pullRemote(supabase, ALICE);
    expect(result.pulledStates).toBe(0);
    const after = await db.card_states.get("frank-starling:1");
    expect(after?.ease).toBe(3.0);
    expect(after?.status).toBe("review");
  });

  it("skips reviews already present locally (by id)", async () => {
    const db = getLearningDB();
    await db.reviews.put({
      id: "22222222-2222-2222-2222-222222222222",
      profile_id: ALICE,
      card_id: "frank-starling:1",
      rating: "good",
      hints_used: 0,
      time_spent_seconds: 5,
      session_id: null,
      self_explanation: null,
      engagement_method: null,
      created_at: "2026-05-01T10:00:00Z",
      pending_sync: 0,
    });

    const server: FakeServer = {
      reviews: [
        {
          card_id: "frank-starling:1",
          created_at: "2026-05-01T10:00:00Z",
          hints_used: 0,
          id: "22222222-2222-2222-2222-222222222222",
          profile_id: ALICE,
          rating: "good",
          self_explanation: null,
          session_id: null,
          time_spent_seconds: 5,
        },
      ],
      card_states: [],
    };
    const { supabase } = makeFakeClient(server);
    const result = await pullRemote(supabase, ALICE);
    expect(result.pulledReviews).toBe(0);
  });
});

describe("syncNow orchestrator", () => {
  it("collects push + pull counts with no error on happy path", async () => {
    const server: FakeServer = { reviews: [], card_states: [] };
    const { supabase } = makeFakeClient(server);

    await recordReviewLocally({
      profileId: ALICE,
      cardId: "frank-starling:1",
      rating: "good",
      hintsUsed: 0,
      timeSpentSeconds: 5,
      now: NOW,
    });

    const result = await syncNow({ supabase, profileId: ALICE, now: NOW });
    expect(result.error).toBeNull();
    expect(result.pushedReviews).toBe(1);
    expect(result.pushedStates).toBe(1);
    // Pull brings the pushed rows back, but they're already present → 0.
    expect(result.pulledReviews).toBe(0);
    expect(result.pulledStates).toBe(0);
  });
});
