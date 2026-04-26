import { describe, expect, it, vi } from "vitest";

import { pickRandomQuote, QUOTES } from "./quotes";

describe("motivational quotes", () => {
  it("ships at least 400 distinct quotes", () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(400);
    const seen = new Set(QUOTES.map((q) => q.text));
    expect(seen.size).toBe(QUOTES.length);
  });

  it("each quote stays under the single-line cap (140 chars)", () => {
    for (const q of QUOTES) {
      expect(q.text.length).toBeLessThanOrEqual(140);
    }
  });

  it("covers all four categories", () => {
    const categories = new Set(QUOTES.map((q) => q.category));
    expect(categories).toEqual(new Set(["hardwork", "discipline", "success", "rest"]));
  });

  it("picks a quote from the corpus", () => {
    const q = pickRandomQuote();
    expect(QUOTES).toContain(q);
  });

  it("pickRandomQuote uses the full index range", () => {
    // Drive Math.random to the edges so we know the floor isn't off.
    const spy = vi.spyOn(Math, "random");
    spy.mockReturnValue(0);
    expect(pickRandomQuote()).toBe(QUOTES[0]);
    spy.mockReturnValue(0.999999);
    expect(pickRandomQuote()).toBe(QUOTES[QUOTES.length - 1]);
    spy.mockRestore();
  });
});
