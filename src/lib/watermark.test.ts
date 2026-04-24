import { describe, expect, it } from "vitest";

import { watermarkId, watermarkIdSync } from "./watermark";

describe("watermarkId (Web Crypto path)", () => {
  it("produces a stable short hex string", async () => {
    const a = await watermarkId("aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(a).toMatch(/^[0-9a-f]+$/);
    expect(a.length).toBe(8);
    const b = await watermarkId("aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    expect(b).toBe(a);
  });

  it("different ids produce different watermarks", async () => {
    const a = await watermarkId("aaaa");
    const b = await watermarkId("bbbb");
    expect(a).not.toBe(b);
  });

  it("clamps length into [4, 24]", async () => {
    const short = await watermarkId("x", 2);
    expect(short.length).toBe(4);
    const long = await watermarkId("x", 99);
    expect(long.length).toBe(24);
  });

  it("returns 'anon' for empty input", async () => {
    expect(await watermarkId("")).toBe("anon");
  });
});

describe("watermarkIdSync (FNV fallback)", () => {
  it("is deterministic", () => {
    const a = watermarkIdSync("aaaa");
    const b = watermarkIdSync("aaaa");
    expect(a).toBe(b);
  });

  it("differs across inputs", () => {
    expect(watermarkIdSync("aaaa")).not.toBe(watermarkIdSync("bbbb"));
  });
});
