import { describe, expect, it } from "vitest";

import {
  computeEligibility,
  INSTALL_DISMISS_COOLDOWN_MS,
  INSTALL_PROMPT_SESSION_THRESHOLD,
} from "./install-state";

const NOW = new Date("2026-05-01T10:00:00Z");

describe("computeEligibility", () => {
  it("rejects when already installed", () => {
    const r = computeEligibility({
      sessionCount: 100,
      dismissedAt: null,
      installed: true,
      now: NOW,
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe("installed");
  });

  it("rejects during the dismiss cooldown window", () => {
    const dismissedAt = new Date(NOW.getTime() - INSTALL_DISMISS_COOLDOWN_MS + 60_000);
    const r = computeEligibility({
      sessionCount: 10,
      dismissedAt,
      installed: false,
      now: NOW,
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe("dismissed");
  });

  it("accepts once the dismissal is older than the cooldown", () => {
    const dismissedAt = new Date(NOW.getTime() - INSTALL_DISMISS_COOLDOWN_MS - 60_000);
    const r = computeEligibility({
      sessionCount: INSTALL_PROMPT_SESSION_THRESHOLD,
      dismissedAt,
      installed: false,
      now: NOW,
    });
    expect(r.eligible).toBe(true);
    expect(r.reason).toBe("eligible");
  });

  it("rejects with fewer than the threshold sessions", () => {
    const r = computeEligibility({
      sessionCount: INSTALL_PROMPT_SESSION_THRESHOLD - 1,
      dismissedAt: null,
      installed: false,
      now: NOW,
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe("too-few-sessions");
  });

  it("accepts at exactly the threshold", () => {
    const r = computeEligibility({
      sessionCount: INSTALL_PROMPT_SESSION_THRESHOLD,
      dismissedAt: null,
      installed: false,
      now: NOW,
    });
    expect(r.eligible).toBe(true);
  });
});
