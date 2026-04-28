import { describe, expect, it } from "vitest";

import { readMechanismById, readAllMechanisms } from "./fs";

/**
 * Smoke tests against whatever mechanism files are currently shipped
 * in `content/mechanisms/`. The two-zone redesign emptied the
 * directory in 84b05ea; the chapter-format adapter (chapter-parser.ts)
 * loaded the first chapter back. Both states are valid — these tests
 * just confirm the loader doesn't crash and returns a sensible result.
 */
describe("readAllMechanisms", () => {
  it("returns an array of parsed mechanisms (possibly empty)", async () => {
    const mechanisms = await readAllMechanisms();
    expect(Array.isArray(mechanisms)).toBe(true);
    // Every returned row must be a fully validated Mechanism.
    for (const m of mechanisms) {
      expect(m.frontmatter.id).toMatch(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
      expect(m.frontmatter.title.length).toBeGreaterThan(0);
    }
  });
});

describe("readMechanismById", () => {
  it("returns null for a non-existent id (no throw)", async () => {
    expect(await readMechanismById("does-not-exist-yet")).toBeNull();
  });

  it("rejects path-traversal attempts without touching the filesystem", async () => {
    // All of these must return null because the id pattern check trips
    // before any filesystem access happens.
    expect(await readMechanismById("../secret")).toBeNull();
    expect(await readMechanismById("..")).toBeNull();
    expect(await readMechanismById("/etc/passwd")).toBeNull();
    expect(await readMechanismById("foo/bar")).toBeNull();
    expect(await readMechanismById("foo\\bar")).toBeNull();
    expect(await readMechanismById("")).toBeNull();
    expect(await readMechanismById("-starts-with-hyphen")).toBeNull();
    expect(await readMechanismById("ends-with-hyphen-")).toBeNull();
    expect(await readMechanismById("UPPERCASE")).toBeNull();
  });
});
