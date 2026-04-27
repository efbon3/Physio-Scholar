import { describe, expect, it } from "vitest";

import { readMechanismById, readAllMechanisms } from "./fs";

/**
 * Content was reset for the two-zone redesign (no mechanism .md files
 * currently shipped). These tests cover the loader's empty-state and
 * defensive-id-validation behaviour. Re-introduce a fixture-loading test
 * once the new schema lands and a template mechanism is authored.
 */
describe("readAllMechanisms", () => {
  it("returns an empty array when no mechanism files exist", async () => {
    const mechanisms = await readAllMechanisms();
    expect(mechanisms).toEqual([]);
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
