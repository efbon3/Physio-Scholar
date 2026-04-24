import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Mechanism } from "./loader";

const fromDbMock = vi.hoisted(() => ({
  readPublishedMechanismsFromDb: vi.fn<() => Promise<Mechanism[]>>(),
  readPublishedMechanismByIdFromDb: vi.fn<(id: string) => Promise<Mechanism | null>>(),
}));
const fromFsMock = vi.hoisted(() => ({
  readAllMechanisms: vi.fn<() => Promise<Mechanism[]>>(),
  readMechanismById: vi.fn<(id: string) => Promise<Mechanism | null>>(),
}));

vi.mock("./db-source", () => fromDbMock);
vi.mock("./fs", () => fromFsMock);

// Dynamically import after mocks are set so vi.mock takes effect.
const { readAllMechanisms, readMechanismById } = await import("./source");

function fakeMechanism(id: string, title = id): Mechanism {
  return {
    frontmatter: {
      id,
      title,
      organ_system: "cardiovascular",
      nmc_competencies: ["PY-CV-1.1"],
      exam_patterns: ["neet-pg"],
      prerequisites: [],
      related_mechanisms: [],
      blooms_distribution: { remember: 25, understand: 25, apply: 25, analyze: 25 },
      author: "test",
      reviewer: "pending",
      status: "draft",
      version: "0.1",
      published_date: new Date("2026-01-01"),
      last_reviewed: new Date("2026-01-01"),
    },
    body: "# body",
    layers: { core: "core text" },
  };
}

beforeEach(() => {
  fromDbMock.readPublishedMechanismsFromDb.mockReset();
  fromDbMock.readPublishedMechanismByIdFromDb.mockReset();
  fromFsMock.readAllMechanisms.mockReset();
  fromFsMock.readMechanismById.mockReset();
});

describe("readAllMechanisms — merge semantics", () => {
  it("returns the union when DB and fs sets are disjoint", async () => {
    fromDbMock.readPublishedMechanismsFromDb.mockResolvedValue([
      fakeMechanism("baroreceptor-reflex", "Baroreceptor Reflex"),
    ]);
    fromFsMock.readAllMechanisms.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling Mechanism"),
    ]);
    const result = await readAllMechanisms();
    expect(result.map((m) => m.frontmatter.id).sort()).toEqual([
      "baroreceptor-reflex",
      "frank-starling",
    ]);
  });

  it("DB row wins when both sources have the same id", async () => {
    fromDbMock.readPublishedMechanismsFromDb.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling (DB)"),
    ]);
    fromFsMock.readAllMechanisms.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling (FS)"),
    ]);
    const result = await readAllMechanisms();
    expect(result).toHaveLength(1);
    expect(result[0].frontmatter.title).toBe("Frank-Starling (DB)");
  });

  it("sorts the merged result by title", async () => {
    fromDbMock.readPublishedMechanismsFromDb.mockResolvedValue([
      fakeMechanism("zzz-last", "Zebra"),
    ]);
    fromFsMock.readAllMechanisms.mockResolvedValue([
      fakeMechanism("aaa-first", "Apple"),
      fakeMechanism("mmm-middle", "Mango"),
    ]);
    const result = await readAllMechanisms();
    expect(result.map((m) => m.frontmatter.title)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("returns fs-only when DB is empty", async () => {
    fromDbMock.readPublishedMechanismsFromDb.mockResolvedValue([]);
    fromFsMock.readAllMechanisms.mockResolvedValue([fakeMechanism("frank-starling")]);
    const result = await readAllMechanisms();
    expect(result).toHaveLength(1);
  });

  it("returns DB-only when fs is empty", async () => {
    fromDbMock.readPublishedMechanismsFromDb.mockResolvedValue([
      fakeMechanism("baroreceptor-reflex"),
    ]);
    fromFsMock.readAllMechanisms.mockResolvedValue([]);
    const result = await readAllMechanisms();
    expect(result).toHaveLength(1);
  });
});

describe("readMechanismById — DB-first lookup", () => {
  it("returns the DB row when published", async () => {
    fromDbMock.readPublishedMechanismByIdFromDb.mockResolvedValue(
      fakeMechanism("frank-starling", "DB version"),
    );
    fromFsMock.readMechanismById.mockResolvedValue(fakeMechanism("frank-starling", "FS version"));
    const result = await readMechanismById("frank-starling");
    expect(result?.frontmatter.title).toBe("DB version");
    expect(fromFsMock.readMechanismById).not.toHaveBeenCalled();
  });

  it("falls back to fs when DB has no published row", async () => {
    fromDbMock.readPublishedMechanismByIdFromDb.mockResolvedValue(null);
    fromFsMock.readMechanismById.mockResolvedValue(fakeMechanism("frank-starling", "FS version"));
    const result = await readMechanismById("frank-starling");
    expect(result?.frontmatter.title).toBe("FS version");
  });

  it("returns null when neither source has the id", async () => {
    fromDbMock.readPublishedMechanismByIdFromDb.mockResolvedValue(null);
    fromFsMock.readMechanismById.mockResolvedValue(null);
    const result = await readMechanismById("does-not-exist");
    expect(result).toBeNull();
  });
});
