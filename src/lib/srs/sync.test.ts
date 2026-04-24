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

  const reviewsTable = {
    upsert(rows: unknown[]) {
      calls.reviewsUpsert.push(rows);
      // Assign server uuids if missing (simulate gen_random_uuid()).
      const typed = rows as Database["public"]["Tables"]["reviews"]["Insert"][];
      const assigned = typed.map((r, i) => {
        const id =
          (r as { id?: string }).id ??
          `server-${server.reviews.length + i}-${Math.random().toString(36).slice(2, 8)}`;
        const row: Database["public"]["Tables"]["reviews"]["Row"] = {
          card_id: r.card_id,
          created_at: r.created_at ?? new Date().toISOString(),
          hints_used: r.hints_used ?? 0,
          id,
          profile_id: r.profile_id,
          rating: r.rating,
          self_explanation: r.self_explanation ?? null,
          session_id: r.session_id ?? null,
          time_spent_seconds: r.time_spent_seconds ?? 0,
        };
        return row;
      });
      // De-dupe by id.
      for (const row of assigned) {
        const existing = server.reviews.findIndex((x) => x.id === row.id);
        if (existing === -1) server.reviews.push(row);
      }
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
      created_at: NOW.toISOString(),
      pending_sync: 1,
    });

    const pushed = await pushPendingReviews(supabase, ALICE);
    expect(pushed).toBe(2);
    expect(calls.reviewsUpsert).toHaveLength(1);
    expect(server.reviews).toHaveLength(2);

    // Non-UUID row should be rewritten to the server-assigned id.
    const stillLocalLocally = await db.reviews.get("local-abc-123");
    expect(stillLocalLocally).toBeUndefined();

    // pending_sync should be cleared on every row.
    const all = await db.reviews.toArray();
    expect(all.every((r) => r.pending_sync === 0)).toBe(true);
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
