import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __resetContentDBForTests, getContentDB } from "./db";
import type { Chapter } from "./loader";
import {
  clearMechanisms,
  getMechanism,
  listAllMechanisms,
  listMechanismsBySystem,
  syncMechanisms,
} from "./sync";

function makeMechanism(overrides: Partial<Chapter["frontmatter"]> = {}): Chapter {
  return {
    frontmatter: {
      id: "frank-starling",
      title: "Frank-Starling Chapter",
      organ_system: "cardiovascular",
      nmc_competencies: ["PY-CV-1.5"],
      exam_patterns: ["neet-pg"],
      prerequisites: [],
      related_chapters: [],
      blooms_distribution: { remember: 10, understand: 30, apply: 30, analyze: 30 },
      author: "a",
      reviewer: "pending",
      status: "published",
      version: "1.0",
      published_date: new Date("2026-05-15"),
      last_reviewed: new Date("2026-05-15"),
      ...overrides,
    },
    body: "# Layer 1 — Core\n\ncore text",
    layers: { core: "core text" },
  };
}

beforeEach(async () => {
  __resetContentDBForTests();
  const db = getContentDB();
  await db.delete(); // fresh database per test — guarantees isolation
  await db.open();
});

afterEach(async () => {
  __resetContentDBForTests();
});

describe("syncMechanisms", () => {
  it("writes new rows and reports their ids", async () => {
    const result = await syncMechanisms([makeMechanism()]);
    expect(result.written).toEqual(["frank-starling"]);
    expect(result.skipped).toEqual([]);
    expect(await getMechanism("frank-starling")).toMatchObject({
      frontmatter: { id: "frank-starling", version: "1.0" },
    });
  });

  it("stamps indexed_at on each write", async () => {
    await syncMechanisms([makeMechanism()]);
    const row = await getMechanism("frank-starling");
    expect(row?.indexed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("skips rows whose version already matches", async () => {
    await syncMechanisms([makeMechanism()]);
    const second = await syncMechanisms([makeMechanism()]);
    expect(second.written).toEqual([]);
    expect(second.skipped).toEqual(["frank-starling"]);
  });

  it("rewrites rows when version changes", async () => {
    await syncMechanisms([makeMechanism({ version: "1.0" })]);
    const bumped = await syncMechanisms([makeMechanism({ version: "1.1" })]);
    expect(bumped.written).toEqual(["frank-starling"]);
    expect((await getMechanism("frank-starling"))?.frontmatter.version).toBe("1.1");
  });

  it("returns empty arrays when given no mechanisms without opening the DB pointlessly", async () => {
    const result = await syncMechanisms([]);
    expect(result).toEqual({ written: [], skipped: [] });
  });

  it("handles a mixed batch (some new, some up-to-date)", async () => {
    await syncMechanisms([makeMechanism({ id: "a", title: "A" })]);
    const result = await syncMechanisms([
      makeMechanism({ id: "a", title: "A" }), // up-to-date
      makeMechanism({ id: "b", title: "B" }), // new
    ]);
    expect(result.written).toEqual(["b"]);
    expect(result.skipped).toEqual(["a"]);
  });
});

describe("listMechanismsBySystem", () => {
  it("returns only mechanisms for the requested system, sorted by title", async () => {
    await syncMechanisms([
      makeMechanism({ id: "b-cv", title: "B cardiovascular", organ_system: "cardiovascular" }),
      makeMechanism({ id: "a-cv", title: "A cardiovascular", organ_system: "cardiovascular" }),
      makeMechanism({ id: "a-resp", title: "A respiratory", organ_system: "respiratory" }),
    ]);
    const cv = await listMechanismsBySystem("cardiovascular");
    expect(cv.map((m) => m.frontmatter.id)).toEqual(["a-cv", "b-cv"]);

    const resp = await listMechanismsBySystem("respiratory");
    expect(resp.map((m) => m.frontmatter.id)).toEqual(["a-resp"]);

    const renal = await listMechanismsBySystem("renal");
    expect(renal).toEqual([]);
  });
});

describe("listAllMechanisms / clearMechanisms", () => {
  it("returns everything; clearing empties the store", async () => {
    await syncMechanisms([makeMechanism({ id: "a" }), makeMechanism({ id: "b" })]);
    expect((await listAllMechanisms()).length).toBe(2);
    await clearMechanisms();
    expect(await listAllMechanisms()).toEqual([]);
  });
});
