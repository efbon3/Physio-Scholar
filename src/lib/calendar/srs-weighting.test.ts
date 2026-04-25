import { describe, expect, it } from "vitest";

import type { ExamEventRow } from "./events";
import { buildBoostCardIds, findActiveExamWindow } from "./srs-weighting";

function event(overrides: Partial<ExamEventRow> & { starts_at: string }): ExamEventRow {
  return {
    id: overrides.id ?? "e1",
    audience: overrides.audience ?? "institution",
    institution_id: overrides.institution_id ?? null,
    owner_id: overrides.owner_id ?? null,
    title: overrides.title ?? "Mock exam",
    kind: overrides.kind ?? "exam",
    organ_systems: overrides.organ_systems ?? [],
    starts_at: overrides.starts_at,
    ends_at: overrides.ends_at ?? null,
    notes: overrides.notes ?? null,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  };
}

describe("findActiveExamWindow", () => {
  const now = new Date("2026-05-01T12:00:00Z");

  it("returns null with no events", () => {
    expect(findActiveExamWindow([], now)).toBeNull();
  });

  it("ignores non-exam events", () => {
    const events = [event({ id: "h", kind: "holiday", starts_at: "2026-05-05" })];
    expect(findActiveExamWindow(events, now)).toBeNull();
  });

  it("returns the soonest exam inside the window", () => {
    const events = [
      event({ id: "later", starts_at: "2026-05-10" }),
      event({ id: "soon", starts_at: "2026-05-06" }),
    ];
    expect(findActiveExamWindow(events, now)?.id).toBe("soon");
  });

  it("excludes exams beyond the default 14-day window", () => {
    const events = [event({ starts_at: "2026-05-20" })];
    expect(findActiveExamWindow(events, now)).toBeNull();
  });

  it("includes today's exam (today within window)", () => {
    const events = [event({ id: "today", starts_at: "2026-05-01" })];
    expect(findActiveExamWindow(events, now)?.id).toBe("today");
  });

  it("excludes past exams (post-window asymmetry — boost stops after the test)", () => {
    const events = [event({ id: "past", starts_at: "2026-04-25" })];
    expect(findActiveExamWindow(events, now)).toBeNull();
  });

  it("includes personal-audience exams (a student's mock test counts)", () => {
    const events = [event({ id: "personal", audience: "personal", starts_at: "2026-05-05" })];
    expect(findActiveExamWindow(events, now)?.id).toBe("personal");
  });

  it("respects a custom daysBefore window", () => {
    const events = [event({ id: "soon", starts_at: "2026-05-08" })];
    expect(findActiveExamWindow(events, now, 5)).toBeNull();
    expect(findActiveExamWindow(events, now, 10)?.id).toBe("soon");
  });
});

describe("buildBoostCardIds", () => {
  // Minimal mechanism + card stand-ins. The helper only reads
  // frontmatter.organ_system / frontmatter.id from mechanisms and
  // id / mechanism_id from cards.
  const mechanisms = [
    { frontmatter: { id: "frank-starling", organ_system: "cardiovascular" } },
    { frontmatter: { id: "baroreceptor-reflex", organ_system: "cardiovascular" } },
    { frontmatter: { id: "renal-clearance", organ_system: "renal" } },
  ] as never;
  const cards = [
    { id: "frank-starling:1", mechanism_id: "frank-starling" },
    { id: "frank-starling:2", mechanism_id: "frank-starling" },
    { id: "baroreceptor-reflex:1", mechanism_id: "baroreceptor-reflex" },
    { id: "renal-clearance:1", mechanism_id: "renal-clearance" },
  ];

  it("returns the cards belonging to mechanisms in the exam's organ_systems", () => {
    const exam = event({ starts_at: "2026-05-05", organ_systems: ["cardiovascular"] });
    const boost = buildBoostCardIds(exam, mechanisms, cards);
    expect(Array.from(boost).sort()).toEqual([
      "baroreceptor-reflex:1",
      "frank-starling:1",
      "frank-starling:2",
    ]);
  });

  it("returns an empty set when the exam declares no topics", () => {
    const exam = event({ starts_at: "2026-05-05", organ_systems: [] });
    expect(buildBoostCardIds(exam, mechanisms, cards).size).toBe(0);
  });

  it("supports multi-system exams (OR across systems)", () => {
    const exam = event({
      starts_at: "2026-05-05",
      organ_systems: ["cardiovascular", "renal"],
    });
    const boost = buildBoostCardIds(exam, mechanisms, cards);
    expect(boost.size).toBe(4);
  });
});
