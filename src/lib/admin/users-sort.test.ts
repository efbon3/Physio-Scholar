import { describe, expect, it } from "vitest";

import { makeComparator, parseDir, parseSort, type SortableProfileRow } from "./users-sort";

function row(overrides: Partial<SortableProfileRow> = {}): SortableProfileRow {
  return {
    full_name: null,
    college_name: null,
    roll_number: null,
    is_admin: false,
    approved_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("parseSort / parseDir", () => {
  it("falls back to defaults for unknown values", () => {
    expect(parseSort("xyz")).toBe("status");
    expect(parseSort(undefined)).toBe("status");
    expect(parseDir("up")).toBe("asc");
    expect(parseDir(undefined)).toBe("asc");
  });

  it("accepts the known keys verbatim", () => {
    expect(parseSort("name")).toBe("name");
    expect(parseSort("college")).toBe("college");
    expect(parseSort("roll")).toBe("roll");
    expect(parseSort("joined")).toBe("joined");
    expect(parseDir("desc")).toBe("desc");
    expect(parseDir("asc")).toBe("asc");
  });
});

describe("makeComparator", () => {
  it("sorts by full name asc, case-insensitive, with nulls last", () => {
    const rows = [
      row({ full_name: "charlie" }),
      row({ full_name: null }),
      row({ full_name: "Alice" }),
      row({ full_name: "bob" }),
    ];
    rows.sort(makeComparator("name", "asc"));
    expect(rows.map((r) => r.full_name)).toEqual(["Alice", "bob", "charlie", null]);
  });

  it("sorts by full name desc, with nulls still last", () => {
    const rows = [
      row({ full_name: "charlie" }),
      row({ full_name: null }),
      row({ full_name: "Alice" }),
      row({ full_name: "bob" }),
    ];
    rows.sort(makeComparator("name", "desc"));
    // Nulls were last on asc (rank +1); flip makes them first on desc.
    expect(rows.map((r) => r.full_name)).toEqual([null, "charlie", "bob", "Alice"]);
  });

  it("sorts by college name", () => {
    const rows = [
      row({ college_name: "Zeta Med" }),
      row({ college_name: "Alpha Med" }),
      row({ college_name: "Mu Med" }),
    ];
    rows.sort(makeComparator("college", "asc"));
    expect(rows.map((r) => r.college_name)).toEqual(["Alpha Med", "Mu Med", "Zeta Med"]);
  });

  it("sorts by roll number lexically", () => {
    const rows = [
      row({ roll_number: "MBBS/03" }),
      row({ roll_number: "MBBS/01" }),
      row({ roll_number: "MBBS/02" }),
    ];
    rows.sort(makeComparator("roll", "asc"));
    expect(rows.map((r) => r.roll_number)).toEqual(["MBBS/01", "MBBS/02", "MBBS/03"]);
  });

  it("sorts by joined timestamp", () => {
    const rows = [
      row({ created_at: "2026-03-01T00:00:00.000Z" }),
      row({ created_at: "2026-01-01T00:00:00.000Z" }),
      row({ created_at: "2026-02-01T00:00:00.000Z" }),
    ];
    rows.sort(makeComparator("joined", "asc"));
    expect(rows.map((r) => r.created_at)).toEqual([
      "2026-01-01T00:00:00.000Z",
      "2026-02-01T00:00:00.000Z",
      "2026-03-01T00:00:00.000Z",
    ]);
  });

  it("status sort floats pending to the top, approved to the bottom, admins in between", () => {
    const pending = row({ full_name: "p", created_at: "2026-02-01T00:00:00.000Z" });
    const approved = row({
      full_name: "a",
      approved_at: "2026-01-15T00:00:00.000Z",
      created_at: "2026-01-15T00:00:00.000Z",
    });
    const admin = row({ full_name: "ad", is_admin: true, created_at: "2026-01-10T00:00:00.000Z" });
    const rows = [approved, admin, pending];
    rows.sort(makeComparator("status", "asc"));
    expect(rows.map((r) => r.full_name)).toEqual(["p", "ad", "a"]);
  });

  it("status sort breaks ties within a tier by most-recently-joined first", () => {
    const older = row({
      full_name: "older",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    const newer = row({
      full_name: "newer",
      created_at: "2026-04-01T00:00:00.000Z",
    });
    const rows = [older, newer];
    rows.sort(makeComparator("status", "asc"));
    expect(rows.map((r) => r.full_name)).toEqual(["newer", "older"]);
  });
});
