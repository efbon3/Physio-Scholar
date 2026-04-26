import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/admin/audit", () => ({ writeAuditEntry: vi.fn() }));

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

import {
  approveUserAction,
  rejectUserAction,
  revokeApprovalAction,
  unrejectUserAction,
} from "./actions";

/**
 * Builds a Supabase mock that handles the two distinct from("profiles")
 * shapes the actions hit:
 *   1. .select("is_admin").eq("id", caller).single() — admin gate read
 *   2. .update({...}).eq("id", target)              — actual write
 *
 * The first call returns `callerIsAdmin`; the second returns `updateError`.
 */
function buildSupabaseMock({
  userId,
  callerIsAdmin = true,
  updateError = null,
}: {
  userId: string | null;
  callerIsAdmin?: boolean;
  updateError?: { message: string } | null;
}) {
  const updateEq = vi.fn().mockResolvedValue({ error: updateError });
  const updateBuilder = { eq: updateEq };

  const selectSingle = vi.fn().mockResolvedValue({
    data: { is_admin: callerIsAdmin },
    error: null,
  });
  const selectEq = vi.fn().mockReturnValue({ single: selectSingle });
  const selectBuilder = { eq: selectEq };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email: "caller@example.com" } : null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(selectBuilder),
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

  it("rejects when caller is not an admin", async () => {
    const supabase = buildSupabaseMock({ userId: "user-2", callerIsAdmin: false });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/only admins/i);
  });

  it("approves the target as student by default and writes an audit entry", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1");
    expect(result.status).toBe("ok");
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "user.approve",
        target_id: "user-1",
        details: expect.objectContaining({ granted_role: "student" }),
      }),
    );
  });

  it("includes is_faculty when granting faculty role", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1", "faculty");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg).toMatchObject({ is_faculty: true });
    expect(callArg.is_admin).toBeUndefined();
  });

  it("sets is_admin AND is_faculty when granting admin role", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await approveUserAction("user-1", "admin");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg).toMatchObject({ is_admin: true, is_faculty: true });
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

  it("revokes approval and clears role flags", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await revokeApprovalAction("user-1");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg).toMatchObject({
      approved_at: null,
      approved_by: null,
      is_admin: false,
      is_faculty: false,
    });
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "user.revoke_approval", target_id: "user-1" }),
    );
  });

  it("rejects when caller is not an admin", async () => {
    const supabase = buildSupabaseMock({ userId: "user-2", callerIsAdmin: false });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await revokeApprovalAction("user-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/only admins/i);
  });

  it("blocks an admin from revoking their own approval", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await revokeApprovalAction("admin-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/your own/i);
  });
});

describe("rejectUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects the target with an audit entry, clearing approval + role flags", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await rejectUserAction("user-1", "Roll number doesn't match the cohort.");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg).toMatchObject({
      rejected_by: "admin-1",
      rejection_reason: "Roll number doesn't match the cohort.",
      approved_at: null,
      approved_by: null,
      is_admin: false,
      is_faculty: false,
    });
    expect(callArg.rejected_at).toEqual(expect.any(String));
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "user.reject",
        target_id: "user-1",
        details: expect.objectContaining({ reason: "Roll number doesn't match the cohort." }),
      }),
    );
  });

  it("stores rejection_reason as null when an empty string is passed", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await rejectUserAction("user-1", "   ");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg.rejection_reason).toBeNull();
  });

  it("trims and caps the reason at 500 characters", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const longReason = "x".repeat(800);
    await rejectUserAction("user-1", longReason);
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg.rejection_reason).toHaveLength(500);
  });

  it("rejects when caller is not an admin", async () => {
    const supabase = buildSupabaseMock({ userId: "user-2", callerIsAdmin: false });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await rejectUserAction("user-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/only admins/i);
  });

  it("blocks an admin from rejecting their own account", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await rejectUserAction("admin-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/your own/i);
  });
});

describe("unrejectUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("clears rejection state and writes an audit entry", async () => {
    const supabase = buildSupabaseMock({ userId: "admin-1" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await unrejectUserAction("user-1");
    expect(result.status).toBe("ok");
    const updatePayload = supabase.from("profiles").update as ReturnType<typeof vi.fn>;
    const callArg = updatePayload.mock.calls.at(-1)?.[0];
    expect(callArg).toEqual({
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
    });
    expect(writeAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "user.unreject", target_id: "user-1" }),
    );
  });

  it("rejects when caller is not an admin", async () => {
    const supabase = buildSupabaseMock({ userId: "user-2", callerIsAdmin: false });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await unrejectUserAction("user-1");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toMatch(/only admins/i);
  });
});
