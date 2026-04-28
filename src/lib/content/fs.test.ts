import { describe, expect, it } from "vitest";

import { readChapterById, readAllChapters } from "./fs";

/**
 * Smoke tests against whatever Chapter files are currently shipped
 * in `content/mechanisms/`. The two-zone redesign emptied the
 * directory in 84b05ea; the chapter-format adapter (chapter-parser.ts)
 * loaded the first chapter back. Both states are valid — these tests
 * just confirm the loader doesn't crash and returns a sensible result.
 */
describe("readAllChapters", () => {
  it("returns an array of parsed mechanisms (possibly empty)", async () => {
    const mechanisms = await readAllChapters();
    expect(Array.isArray(mechanisms)).toBe(true);
    // Every returned row must be a fully validated Chapter.
    for (const m of mechanisms) {
      expect(m.frontmatter.id).toMatch(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
      expect(m.frontmatter.title.length).toBeGreaterThan(0);
    }
  });
});

describe("readChapterById", () => {
  it("returns null for a non-existent id (no throw)", async () => {
    expect(await readChapterById("does-not-exist-yet")).toBeNull();
  });

  it("rejects path-traversal attempts without touching the filesystem", async () => {
    // All of these must return null because the id pattern check trips
    // before any filesystem access happens.
    expect(await readChapterById("../secret")).toBeNull();
    expect(await readChapterById("..")).toBeNull();
    expect(await readChapterById("/etc/passwd")).toBeNull();
    expect(await readChapterById("foo/bar")).toBeNull();
    expect(await readChapterById("foo\\bar")).toBeNull();
    expect(await readChapterById("")).toBeNull();
    expect(await readChapterById("-starts-with-hyphen")).toBeNull();
    expect(await readChapterById("ends-with-hyphen-")).toBeNull();
    expect(await readChapterById("UPPERCASE")).toBeNull();
  });
});
