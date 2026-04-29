import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Chapter } from "./loader";

const fromDbMock = vi.hoisted(() => ({
  readPublishedChaptersFromDb: vi.fn<() => Promise<Chapter[]>>(),
  readPublishedChapterByIdFromDb: vi.fn<(id: string) => Promise<Chapter | null>>(),
}));
const fromFsMock = vi.hoisted(() => ({
  readAllChapters: vi.fn<() => Promise<Chapter[]>>(),
  readChapterById: vi.fn<(id: string) => Promise<Chapter | null>>(),
}));

vi.mock("./db-source", () => fromDbMock);
vi.mock("./fs", () => fromFsMock);

// Dynamically import after mocks are set so vi.mock takes effect.
const { readAllChapters, readChapterById } = await import("./source");

function fakeMechanism(id: string, title = id): Chapter {
  return {
    frontmatter: {
      id,
      title,
      organ_system: "cardiovascular",
      nmc_competencies: ["PY-CV-1.1"],
      exam_patterns: ["neet-pg"],
      prerequisites: [],
      related_chapters: [],
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
  fromDbMock.readPublishedChaptersFromDb.mockReset();
  fromDbMock.readPublishedChapterByIdFromDb.mockReset();
  fromFsMock.readAllChapters.mockReset();
  fromFsMock.readChapterById.mockReset();
});

describe("readAllChapters — merge semantics", () => {
  it("returns the union when DB and fs sets are disjoint", async () => {
    fromDbMock.readPublishedChaptersFromDb.mockResolvedValue([
      fakeMechanism("baroreceptor-reflex", "Baroreceptor Reflex"),
    ]);
    fromFsMock.readAllChapters.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling Chapter"),
    ]);
    const result = await readAllChapters();
    expect(result.map((m) => m.frontmatter.id).sort()).toEqual([
      "baroreceptor-reflex",
      "frank-starling",
    ]);
  });

  it("DB row wins when both sources have the same id", async () => {
    fromDbMock.readPublishedChaptersFromDb.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling (DB)"),
    ]);
    fromFsMock.readAllChapters.mockResolvedValue([
      fakeMechanism("frank-starling", "Frank-Starling (FS)"),
    ]);
    const result = await readAllChapters();
    expect(result).toHaveLength(1);
    expect(result[0].frontmatter.title).toBe("Frank-Starling (DB)");
  });

  it("sorts the merged result by title", async () => {
    fromDbMock.readPublishedChaptersFromDb.mockResolvedValue([fakeMechanism("zzz-last", "Zebra")]);
    fromFsMock.readAllChapters.mockResolvedValue([
      fakeMechanism("aaa-first", "Apple"),
      fakeMechanism("mmm-middle", "Mango"),
    ]);
    const result = await readAllChapters();
    expect(result.map((m) => m.frontmatter.title)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("returns fs-only when DB is empty", async () => {
    fromDbMock.readPublishedChaptersFromDb.mockResolvedValue([]);
    fromFsMock.readAllChapters.mockResolvedValue([fakeMechanism("frank-starling")]);
    const result = await readAllChapters();
    expect(result).toHaveLength(1);
  });

  it("returns DB-only when fs is empty", async () => {
    fromDbMock.readPublishedChaptersFromDb.mockResolvedValue([
      fakeMechanism("baroreceptor-reflex"),
    ]);
    fromFsMock.readAllChapters.mockResolvedValue([]);
    const result = await readAllChapters();
    expect(result).toHaveLength(1);
  });
});

describe("readChapterById — DB-first lookup", () => {
  it("returns the DB row when published", async () => {
    fromDbMock.readPublishedChapterByIdFromDb.mockResolvedValue(
      fakeMechanism("frank-starling", "DB version"),
    );
    fromFsMock.readChapterById.mockResolvedValue(fakeMechanism("frank-starling", "FS version"));
    const result = await readChapterById("frank-starling");
    expect(result?.frontmatter.title).toBe("DB version");
    expect(fromFsMock.readChapterById).not.toHaveBeenCalled();
  });

  it("falls back to fs when DB has no published row", async () => {
    fromDbMock.readPublishedChapterByIdFromDb.mockResolvedValue(null);
    fromFsMock.readChapterById.mockResolvedValue(fakeMechanism("frank-starling", "FS version"));
    const result = await readChapterById("frank-starling");
    expect(result?.frontmatter.title).toBe("FS version");
  });

  it("returns null when neither source has the id", async () => {
    fromDbMock.readPublishedChapterByIdFromDb.mockResolvedValue(null);
    fromFsMock.readChapterById.mockResolvedValue(null);
    const result = await readChapterById("does-not-exist");
    expect(result).toBeNull();
  });
});
