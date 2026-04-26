import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { exportMyDataAction, requestAccountDeletionAction } from "./privacy-actions";

type SelectFn = ReturnType<typeof vi.fn>;

function buildSupabaseMock(
  {
    userId,
    email = "user@example.com",
    profileRow = { id: "user-1", full_name: "Alice" },
    profileError = null,
    cardStates = [],
    reviews = [],
    flags = [],
    events = [],
    updateError = null,
    signOut = vi.fn().mockResolvedValue({ error: null }),
  }: {
    userId: string | null;
    email?: string;
    profileRow?: Record<string, unknown> | null;
    profileError?: { message: string } | null;
    cardStates?: unknown[];
    reviews?: unknown[];
    flags?: unknown[];
    events?: unknown[];
    updateError?: { message: string } | null;
    signOut?: ReturnType<typeof vi.fn>;
  } = { userId: null },
) {
  const updateBuilder = {
    eq: vi.fn().mockResolvedValue({ error: updateError }),
  };

  function selectChain(rows: unknown[]) {
    const builder: Record<string, SelectFn> = {};
    builder.eq = vi.fn().mockResolvedValue({ data: rows, error: null });
    builder.single = vi.fn().mockResolvedValue({ data: profileRow, error: profileError });
    return builder;
  }

  const fromMock = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profileRow, error: profileError }),
          }),
        }),
        update: vi.fn().mockReturnValue(updateBuilder),
      };
    }
    if (table === "card_states") {
      return { select: vi.fn().mockResolvedValue({ data: cardStates, error: null }) };
    }
    if (table === "reviews") {
      return { select: vi.fn().mockResolvedValue({ data: reviews, error: null }) };
    }
    if (table === "content_flags") {
      return { select: vi.fn().mockResolvedValue({ data: flags, error: null }) };
    }
    if (table === "exam_events") {
      return {
        select: vi.fn().mockReturnValue(selectChain(events)),
      };
    }
    return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email } : null },
        error: null,
      }),
      signOut,
    },
    from: fromMock,
    _updateBuilder: updateBuilder,
  };
}

describe("exportMyDataAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects when Supabase env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const result = await exportMyDataAction();
    expect(result.status).toBe("error");
  });

  it("rejects when no session is present", async () => {
    const supabase = buildSupabaseMock({ userId: null });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await exportMyDataAction();
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/sign in/i);
    }
  });

  it("returns a JSON-serialisable bundle of the learner's data", async () => {
    const supabase = buildSupabaseMock({
      userId: "user-1",
      email: "alice@example.com",
      profileRow: { id: "user-1", full_name: "Alice", roll_number: "MBBS/2026/01" },
      cardStates: [{ card_id: "frank-starling:1", profile_id: "user-1" }],
      reviews: [{ id: "r1", profile_id: "user-1", rating: "good" }],
      flags: [{ id: "f1", profile_id: "user-1" }],
      events: [{ id: "e1", audience: "personal", owner_id: "user-1" }],
    });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await exportMyDataAction();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.data.user).toEqual({ id: "user-1", email: "alice@example.com" });
    expect(result.data.profile).toMatchObject({ full_name: "Alice" });
    expect(result.data.card_states).toHaveLength(1);
    expect(result.data.reviews).toHaveLength(1);
    expect(result.data.content_flags).toHaveLength(1);
    expect(result.data.personal_events).toHaveLength(1);
    expect(typeof result.data.exported_at).toBe("string");
    expect(JSON.stringify(result.data)).toContain("user-1");
  });

  it("surfaces a friendly error if the profile read fails", async () => {
    const supabase = buildSupabaseMock({
      userId: "user-1",
      profileError: { message: "boom" },
      profileRow: null,
    });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await exportMyDataAction();
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/profile/i);
    }
  });
});

describe("requestAccountDeletionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects when Supabase env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const result = await requestAccountDeletionAction();
    expect(result.status).toBe("error");
  });

  it("rejects when no session is present", async () => {
    const supabase = buildSupabaseMock({ userId: null });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await requestAccountDeletionAction();
    expect(result.status).toBe("error");
  });

  it("sets deletion_requested_at, signs out, and redirects on success", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const supabase = buildSupabaseMock({ userId: "user-1", signOut });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    await requestAccountDeletionAction();

    // Update was called with deletion_requested_at as a non-null ISO timestamp
    const updateCall = (supabase.from as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === "profiles",
    );
    expect(updateCall).toBeTruthy();
    expect(signOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login?deleted=1");
  });

  it("returns an error when the update fails", async () => {
    const supabase = buildSupabaseMock({
      userId: "user-1",
      updateError: { message: "constraint" },
    });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await requestAccountDeletionAction();
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/constraint/i);
    }
  });
});
