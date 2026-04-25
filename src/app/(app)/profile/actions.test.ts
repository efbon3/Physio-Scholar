import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/lib/supabase/server";

import { saveProfileAction, setAvatarPathAction } from "./actions";

type MockSupabase = {
  auth: { getUser: ReturnType<typeof vi.fn> };
  from: ReturnType<typeof vi.fn>;
  storage: { from: ReturnType<typeof vi.fn> };
};

function buildSupabaseMock(userId: string | null, updateError: { message: string } | null = null) {
  const updateBuilder = {
    eq: vi.fn().mockResolvedValue({ error: updateError }),
  };
  const supabase: MockSupabase = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: userId ? { id: userId } : null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue(updateBuilder),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: "https://example/avatar.jpg" } }),
      }),
    },
  };
  return supabase;
}

describe("saveProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects when Supabase env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const result = await saveProfileAction(new FormData());
    expect(result.status).toBe("error");
    expect(result).toMatchObject({
      message: expect.stringContaining("unavailable"),
    });
  });

  it("rejects when no session is present", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabaseMock(null) as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await saveProfileAction(new FormData());
    expect(result.status).toBe("error");
    expect(result).toMatchObject({ message: expect.stringContaining("signed in") });
  });

  it("trims whitespace and stores empty fields as null", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const fd = new FormData();
    fd.set("full_name", "  Alice Adams  ");
    fd.set("date_of_birth", "");
    fd.set("address", "   ");
    fd.set("phone", "+91 98765 43210");
    fd.set("roll_number", "MBBS/2026/01");

    const result = await saveProfileAction(fd);
    expect(result).toEqual({ status: "ok", message: "Saved." });

    const updateMock = supabase.from.mock.results[0]!.value.update as ReturnType<typeof vi.fn>;
    expect(updateMock).toHaveBeenCalledWith({
      full_name: "Alice Adams",
      date_of_birth: null,
      address: null,
      phone: "+91 98765 43210",
      roll_number: "MBBS/2026/01",
    });
  });

  it("rejects an invalid phone format", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const fd = new FormData();
    fd.set("phone", "tel://drop-tables");
    const result = await saveProfileAction(fd);
    expect(result.status).toBe("error");
    expect(result).toMatchObject({ message: expect.stringMatching(/phone/i) });
  });

  it("rejects an unparseable date_of_birth", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const fd = new FormData();
    fd.set("date_of_birth", "not-a-date");
    const result = await saveProfileAction(fd);
    expect(result.status).toBe("error");
  });

  it("rejects pre-1900 birth years", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const fd = new FormData();
    fd.set("date_of_birth", "1850-01-01");
    const result = await saveProfileAction(fd);
    expect(result.status).toBe("error");
    expect(result).toMatchObject({ message: expect.stringMatching(/1900/) });
  });

  it("surfaces a Supabase update error", async () => {
    const supabase = buildSupabaseMock("user-1", { message: "RLS denied" });
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await saveProfileAction(new FormData());
    expect(result.status).toBe("error");
    expect(result).toMatchObject({ message: expect.stringContaining("RLS denied") });
  });
});

describe("setAvatarPathAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("rejects a path that doesn't start with the caller's user id", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await setAvatarPathAction("attacker/something.jpg");
    expect(result.status).toBe("error");
    expect(result).toMatchObject({ message: expect.stringMatching(/invalid/i) });
  });

  it("accepts a path under the caller's user id and writes the public URL", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await setAvatarPathAction("user-1/avatar-1.jpg");
    expect(result.status).toBe("ok");
    const updateMock = supabase.from.mock.results[0]!.value.update as ReturnType<typeof vi.fn>;
    expect(updateMock).toHaveBeenCalledWith({ avatar_url: "https://example/avatar.jpg" });
  });

  it("clears the avatar URL when path is null", async () => {
    const supabase = buildSupabaseMock("user-1");
    vi.mocked(createClient).mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>,
    );
    const result = await setAvatarPathAction(null);
    expect(result.status).toBe("ok");
    const updateMock = supabase.from.mock.results[0]!.value.update as ReturnType<typeof vi.fn>;
    expect(updateMock).toHaveBeenCalledWith({ avatar_url: null });
  });
});
