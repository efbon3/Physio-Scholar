import { describe, expect, it } from "vitest";

import { isSafeRelativePath } from "./redirects";

describe("isSafeRelativePath", () => {
  it("accepts plain relative paths", () => {
    expect(isSafeRelativePath("/")).toBe(true);
    expect(isSafeRelativePath("/today")).toBe(true);
    expect(isSafeRelativePath("/app/cardiovascular")).toBe(true);
    expect(isSafeRelativePath("/update-password?ok=1")).toBe(true);
  });

  it("rejects protocol-relative URLs (the open-redirect vector)", () => {
    expect(isSafeRelativePath("//evil.com")).toBe(false);
    expect(isSafeRelativePath("//evil.com/path")).toBe(false);
    expect(isSafeRelativePath("///still-evil.com")).toBe(false);
  });

  it("rejects backslash-prefixed paths that some parsers treat as off-site", () => {
    expect(isSafeRelativePath("/\\evil.com")).toBe(false);
    expect(isSafeRelativePath("/\\\\evil.com")).toBe(false);
  });

  it("rejects absolute URLs", () => {
    expect(isSafeRelativePath("https://evil.com/path")).toBe(false);
    expect(isSafeRelativePath("http://evil.com")).toBe(false);
    expect(isSafeRelativePath("javascript:alert(1)")).toBe(false);
  });

  it("rejects paths that don't start with slash", () => {
    expect(isSafeRelativePath("today")).toBe(false);
    expect(isSafeRelativePath("")).toBe(false);
  });

  it("rejects non-string inputs defensively", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isSafeRelativePath(undefined as any)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isSafeRelativePath(null as any)).toBe(false);
  });

  it("rejects URL-encoded slash / backslash prefixes that some decoders expand", () => {
    // After a single decodeURIComponent pass these become `//evil.com`
    // and `/\evil.com` respectively — both blocked by the literal rule.
    expect(isSafeRelativePath("/%2Fevil.com")).toBe(false);
    expect(isSafeRelativePath("/%2fevil.com")).toBe(false);
    expect(isSafeRelativePath("/%5Cevil.com")).toBe(false);
    expect(isSafeRelativePath("/%5cevil.com")).toBe(false);
  });

  it("rejects values with malformed percent escapes", () => {
    // decodeURIComponent throws on bare `%` — reject rather than let
    // an odd crafted string through the guard by accident.
    expect(isSafeRelativePath("/%")).toBe(false);
    expect(isSafeRelativePath("/%ZZ")).toBe(false);
  });

  it("leaves normally-encoded legitimate paths alone", () => {
    // `%20` is the canonical encoding for a space in a URL path; decoding
    // still leaves a safe prefix.
    expect(isSafeRelativePath("/reset-password?email=a%40b.com")).toBe(true);
    expect(isSafeRelativePath("/systems/cardiovascular/frank-starling")).toBe(true);
  });
});
