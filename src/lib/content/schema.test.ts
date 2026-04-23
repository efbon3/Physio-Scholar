import { describe, expect, it } from "vitest";

import {
  bloomsDistributionSchema,
  mechanismFrontmatterSchema,
  mechanismStatusSchema,
  organSystemSchema,
} from "./schema";

describe("organSystemSchema", () => {
  it("accepts cardiovascular (v1's focus)", () => {
    expect(organSystemSchema.parse("cardiovascular")).toBe("cardiovascular");
  });

  it("rejects unknown systems", () => {
    expect(() => organSystemSchema.parse("vestigial")).toThrow();
  });
});

describe("mechanismStatusSchema", () => {
  it("accepts the four lifecycle states", () => {
    for (const s of ["draft", "review", "published", "retired"] as const) {
      expect(mechanismStatusSchema.parse(s)).toBe(s);
    }
  });

  it("rejects anything else", () => {
    expect(() => mechanismStatusSchema.parse("archived")).toThrow();
  });
});

describe("bloomsDistributionSchema", () => {
  it("accepts a distribution that sums to 100", () => {
    expect(
      bloomsDistributionSchema.parse({ remember: 10, understand: 30, apply: 30, analyze: 30 }),
    ).toEqual({ remember: 10, understand: 30, apply: 30, analyze: 30 });
  });

  it("rejects a distribution that sums to anything else", () => {
    expect(() =>
      bloomsDistributionSchema.parse({ remember: 25, understand: 25, apply: 25, analyze: 20 }),
    ).toThrow(/sum to 100/);
  });

  it("rejects negative values", () => {
    expect(() =>
      bloomsDistributionSchema.parse({ remember: -10, understand: 40, apply: 40, analyze: 30 }),
    ).toThrow();
  });
});

const validFrontmatter = {
  id: "frank-starling",
  title: "Frank-Starling Mechanism",
  organ_system: "cardiovascular",
  nmc_competencies: ["PY-CV-1.5", "PY-CV-1.6"],
  exam_patterns: ["neet-pg", "ini-cet"],
  prerequisites: ["cardiac-cycle"],
  related_mechanisms: ["cardiac-output-regulation"],
  blooms_distribution: { remember: 10, understand: 30, apply: 30, analyze: 30 },
  author: "author-1",
  reviewer: "pending",
  status: "published",
  version: "1.0",
  published_date: "2026-05-15",
  last_reviewed: "2026-05-15",
};

describe("mechanismFrontmatterSchema", () => {
  it("accepts the canonical example from SOP Appendix A", () => {
    const result = mechanismFrontmatterSchema.parse(validFrontmatter);
    expect(result.id).toBe("frank-starling");
    expect(result.published_date).toBeInstanceOf(Date);
  });

  it("rejects an id with capital letters", () => {
    expect(() =>
      mechanismFrontmatterSchema.parse({ ...validFrontmatter, id: "Frank-Starling" }),
    ).toThrow(/kebab-case/);
  });

  it("rejects an id that starts with a hyphen", () => {
    expect(() =>
      mechanismFrontmatterSchema.parse({ ...validFrontmatter, id: "-frank-starling" }),
    ).toThrow();
  });

  it("rejects malformed NMC competency codes", () => {
    expect(() =>
      mechanismFrontmatterSchema.parse({
        ...validFrontmatter,
        nmc_competencies: ["py-cv-1.5"], // lowercase — should fail
      }),
    ).toThrow();
  });

  it("requires at least one NMC competency", () => {
    expect(() =>
      mechanismFrontmatterSchema.parse({ ...validFrontmatter, nmc_competencies: [] }),
    ).toThrow();
  });

  it("requires at least one exam pattern", () => {
    expect(() =>
      mechanismFrontmatterSchema.parse({ ...validFrontmatter, exam_patterns: [] }),
    ).toThrow();
  });

  it("accepts prerequisites as an empty array (a foundational mechanism has none)", () => {
    expect(
      mechanismFrontmatterSchema.parse({ ...validFrontmatter, prerequisites: [] }).prerequisites,
    ).toEqual([]);
  });

  it("coerces ISO date strings to Date objects", () => {
    const { published_date } = mechanismFrontmatterSchema.parse(validFrontmatter);
    expect(published_date.getUTCFullYear()).toBe(2026);
  });
});
