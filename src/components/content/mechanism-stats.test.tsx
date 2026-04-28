import { describe, expect, it } from "vitest";

import { formatDueSubtitle } from "./mechanism-stats";

const NOW = new Date("2026-04-28T12:00:00Z");
const minutesAgo = (n: number) => new Date(NOW.getTime() - n * 60_000);
const minutesFromNow = (n: number) => new Date(NOW.getTime() + n * 60_000);
const hoursFromNow = (n: number) => minutesFromNow(n * 60);

describe("formatDueSubtitle", () => {
  it("returns null when nothing is due and there's no upcoming card", () => {
    expect(
      formatDueSubtitle({
        dueNow: 0,
        oldestDueAt: null,
        nextDue24h: 0,
        nextDueAt: null,
        now: NOW,
      }),
    ).toBeNull();
  });

  it("returns 'next ...' when nothing is due but a future review is scheduled", () => {
    expect(
      formatDueSubtitle({
        dueNow: 0,
        oldestDueAt: null,
        nextDue24h: 0,
        nextDueAt: hoursFromNow(4),
        now: NOW,
      }),
    ).toBe("next 4 hr from now");
  });

  it("shows the oldest-due age when at least one card is due", () => {
    expect(
      formatDueSubtitle({
        dueNow: 3,
        oldestDueAt: minutesAgo(180),
        nextDue24h: 0,
        nextDueAt: minutesAgo(180),
        now: NOW,
      }),
    ).toBe("oldest 3 hr ago");
  });

  it("appends the +N upcoming-in-24h count when there's both a backlog and a queue", () => {
    expect(
      formatDueSubtitle({
        dueNow: 5,
        oldestDueAt: minutesAgo(60 * 26), // ~1 day ago
        nextDue24h: 4,
        nextDueAt: minutesAgo(60 * 26),
        now: NOW,
      }),
    ).toBe("oldest 1 day ago · +4 in next 24h");
  });

  it("omits the +N segment when 24h queue is empty", () => {
    const out = formatDueSubtitle({
      dueNow: 2,
      oldestDueAt: minutesAgo(15),
      nextDue24h: 0,
      nextDueAt: minutesAgo(15),
      now: NOW,
    });
    expect(out).toBe("oldest 15 min ago");
    expect(out).not.toContain("+");
  });

  it("does not show 'next' when the only nextDueAt is in the past (covered by dueNow branch)", () => {
    // Sanity: if dueNow is 0 but nextDueAt is in the past, the subtitle
    // should be null rather than "next 5 min ago" — the past-date guard
    // protects against stale state where a card is due but the
    // dueNow counter wasn't bumped (shouldn't happen, but defensive).
    expect(
      formatDueSubtitle({
        dueNow: 0,
        oldestDueAt: null,
        nextDue24h: 0,
        nextDueAt: minutesAgo(5),
        now: NOW,
      }),
    ).toBeNull();
  });
});
