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
});
