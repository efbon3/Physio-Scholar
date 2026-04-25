import { describe, expect, it } from "vitest";

import { daysUntil, groupByMonth, pickNextExam, type ExamEventRow } from "./events";

function event(overrides: Partial<ExamEventRow> & { starts_at: string }): ExamEventRow {
  return {
    id: overrides.id ?? "e1",
    audience: overrides.audience ?? "institution",
    institution_id: overrides.institution_id ?? null,
    owner_id: overrides.owner_id ?? null,
    title: overrides.title ?? "Mock event",
    kind: overrides.kind ?? "exam",
    organ_systems: overrides.organ_systems ?? [],
    starts_at: overrides.starts_at,
    ends_at: overrides.ends_at ?? null,
    notes: overrides.notes ?? null,
    created_at: overrides.created_at ?? "2026-04-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2026-04-01T00:00:00Z",
  };
}

describe("pickNextExam", () => {
  const now = new Date("2026-05-01T12:00:00Z");

  it("returns null when there are no events", () => {
    expect(pickNextExam([], now)).toBeNull();
  });

  it("returns null when no events are upcoming exams", () => {
    const events = [
      event({ id: "1", kind: "holiday", starts_at: "2026-05-10" }),
      event({ id: "2", kind: "milestone", starts_at: "2026-05-15" }),
    ];
    expect(pickNextExam(events, now)).toBeNull();
  });

  it("returns the soonest exam in the window", () => {
    const events = [
      event({ id: "far", kind: "exam", starts_at: "2026-06-15" }),
      event({ id: "soon", kind: "exam", starts_at: "2026-05-10" }),
      event({ id: "later", kind: "exam", starts_at: "2026-05-20" }),
    ];
    expect(pickNextExam(events, now)?.id).toBe("soon");
  });

  it("ignores past exams", () => {
    const events = [
      event({ id: "past", kind: "exam", starts_at: "2026-04-15" }),
      event({ id: "future", kind: "exam", starts_at: "2026-05-15" }),
    ];
    expect(pickNextExam(events, now)?.id).toBe("future");
  });

  it("includes today's exam (today >= today)", () => {
    const events = [event({ id: "today", kind: "exam", starts_at: "2026-05-01" })];
    expect(pickNextExam(events, now)?.id).toBe("today");
  });

  it("skips exams beyond the window", () => {
    const events = [event({ id: "later", kind: "exam", starts_at: "2026-08-01" })];
    expect(pickNextExam(events, now, 60)).toBeNull();
  });

  it("considers personal-audience events too (a student's own mock test counts)", () => {
    const events = [
      event({ id: "personal", audience: "personal", kind: "exam", starts_at: "2026-05-05" }),
    ];
    expect(pickNextExam(events, now)?.id).toBe("personal");
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    const now = new Date("2026-05-01T12:00:00Z");
    expect(daysUntil("2026-05-01", now)).toBe(0);
  });

  it("returns positive integers for future dates", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    expect(daysUntil("2026-05-12", now)).toBe(11);
  });

  it("returns negative integers for past dates", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    expect(daysUntil("2026-04-25", now)).toBe(-6);
  });
});

describe("groupByMonth", () => {
  it("buckets events by YYYY-MM key", () => {
    const events = [
      event({ id: "a", starts_at: "2026-05-03" }),
      event({ id: "b", starts_at: "2026-05-20" }),
      event({ id: "c", starts_at: "2026-06-02" }),
    ];
    const groups = groupByMonth(events);
    expect(groups.get("2026-05")?.map((e) => e.id)).toEqual(["a", "b"]);
    expect(groups.get("2026-06")?.map((e) => e.id)).toEqual(["c"]);
  });

  it("returns an empty map for empty input", () => {
    expect(groupByMonth([]).size).toBe(0);
  });
});
