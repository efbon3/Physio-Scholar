import { describe, expect, it } from "vitest";

import { readMechanismById, readAllMechanisms } from "./fs";

/**
 * These tests rely on the `content/mechanisms/` directory being populated
 * with at least the placeholder Frank-Starling mechanism (shipped in B4).
 * They double as a smoke test for the schema + loader + fs integration.
 */
describe("readAllMechanisms", () => {
  it("returns the placeholder mechanism parsed and validated", async () => {
    const mechanisms = await readAllMechanisms();
    expect(mechanisms.length).toBeGreaterThan(0);
    const fs = mechanisms.find((m) => m.frontmatter.id === "frank-starling");
    expect(fs).toBeDefined();
    expect(fs?.frontmatter.organ_system).toBe("cardiovascular");
  });
});

describe("readMechanismById", () => {
  it("loads a known mechanism by id", async () => {
    const m = await readMechanismById("frank-starling");
    expect(m).not.toBeNull();
    expect(m?.frontmatter.title).toMatch(/Frank-Starling/i);
  });

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
