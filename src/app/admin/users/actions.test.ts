import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/admin/audit", () => ({ writeAuditEntry: vi.fn() }));

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

import { approveUserAction, revokeApprovalAction } from "./actions";

function buildSupabaseMock({
  userId,
  updateError = null,
}: {
  userId: string | null;
  updateError?: { message: string } | null;
}) {
  const eqIs = vi.fn().mockResolvedValue({ error: updateError });
  const eqIsBuilder = { is: eqIs };
  const eqOnly = vi.fn().mockResolvedValue({ error: updateError });
  const updateBuilder = {
    eq: vi.fn().mockImplementation((column: string, value: string) => {
      // approveUserAction chains .eq("id", x).is("approved_at", null);
      // revokeApprovalAction chains .eq("id", x) only.
      void column;
      void value;
      return Object.assign(eqOnly, eqIsBuilder);
    }),
  };
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email: "admin@example.com" } : null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue(updateBuilder),
    }),
  };
}

describe("approveUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects when env vars missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("error");
  });

  it("rejects when target id is missing", async () => {
    const result = await approveUserAction("");
    expect(result.status).toBe("error");
  });

  it("rejects when caller has no session", async () => {
    const supabase = buildSupabaseMock({ userId: null });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("error");
  });

  it("approves the target and writes an audit entry", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("ok");
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "user.approve", target_id: "user-1" }),
    );
  });

  it("returns the supabase error message when the update fails", async () => {
    const supabase = buildSupabaseMock({
      userId: "admin-1",
      updateError: { message: "permission denied" },
    });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/permission/i);
  });
});

describe("revokeApprovalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("revokes approval and writes an audit entry", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await revokeApprovalAction("user-1");
    expect(result.status).toBe("ok");
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "user.revoke_approval", target_id: "user-1" }),
    );
  });
});
