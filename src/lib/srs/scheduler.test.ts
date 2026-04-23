import { describe, expect, it } from "vitest";

import { scheduleNext } from "./scheduler";
import { SRS_DEFAULTS, newCardState, type CardState } from "./types";

const NOW = new Date("2026-05-01T10:00:00Z");
const MINUTE_IN_DAYS = 1 / (60 * 24);

function stateWith(overrides: Partial<CardState> = {}): CardState {
  return { ...newCardState(NOW), ...overrides };
}

describe("scheduleNext — brand-new cards (learning phase)", () => {
  it("Again keeps the card in learning at the 1-minute step", () => {
    const next = scheduleNext(stateWith(), "again", NOW);
    expect(next.status).toBe("learning");
    expect(next.interval_days).toBeCloseTo(MINUTE_IN_DAYS, 10);
    expect(next.ease).toBeCloseTo(SRS_DEFAULTS.ease + SRS_DEFAULTS.again_ease_delta, 10);
    expect(next.consecutive_again_count).toBe(1);
  });

  it("Good graduates to 1 day", () => {
    const next = scheduleNext(stateWith(), "good", NOW);
    expect(next.status).toBe("review");
    expect(next.interval_days).toBeCloseTo(1, 10);
    expect(next.ease).toBe(SRS_DEFAULTS.ease);
  });

  it("Hard graduates to 1 day with an ease drop", () => {
    const next = scheduleNext(stateWith(), "hard", NOW);
    expect(next.status).toBe("review");
    expect(next.interval_days).toBeCloseTo(1, 10);
    expect(next.ease).toBeCloseTo(SRS_DEFAULTS.ease + SRS_DEFAULTS.hard_ease_delta, 10);
  });

  it("Easy graduates with the easy boost (1.3×)", () => {
    const next = scheduleNext(stateWith(), "easy", NOW);
    expect(next.status).toBe("review");
    expect(next.interval_days).toBeCloseTo(1 * SRS_DEFAULTS.easy_multiplier, 10);
    expect(next.ease).toBeCloseTo(SRS_DEFAULTS.ease + SRS_DEFAULTS.easy_ease_delta, 10);
  });
});

describe("scheduleNext — graduated cards (review phase)", () => {
  const graduated = stateWith({
    status: "review",
    interval_days: 4,
    ease: 2.5,
    last_reviewed_at: "2026-04-27T10:00:00Z",
  });

  it("Good multiplies by ease", () => {
    const next = scheduleNext(graduated, "good", NOW);
    expect(next.interval_days).toBeCloseTo(4 * 2.5, 10);
    expect(next.ease).toBe(2.5);
    expect(next.status).toBe("review");
  });

  it("Hard multiplies by 1.2 and drops ease", () => {
    const next = scheduleNext(graduated, "hard", NOW);
    expect(next.interval_days).toBeCloseTo(4 * SRS_DEFAULTS.hard_multiplier, 10);
    expect(next.ease).toBeCloseTo(2.5 + SRS_DEFAULTS.hard_ease_delta, 10);
  });

  it("Easy multiplies by ease × 1.3 and raises ease", () => {
    const next = scheduleNext(graduated, "easy", NOW);
    expect(next.interval_days).toBeCloseTo(4 * 2.5 * SRS_DEFAULTS.easy_multiplier, 10);
    expect(next.ease).toBeCloseTo(2.5 + SRS_DEFAULTS.easy_ease_delta, 10);
  });

  it("Again resets to the 1-minute learning step and drops ease", () => {
    const next = scheduleNext(graduated, "again", NOW);
    expect(next.status).toBe("learning");
    expect(next.interval_days).toBeCloseTo(MINUTE_IN_DAYS, 10);
    expect(next.ease).toBeCloseTo(2.5 + SRS_DEFAULTS.again_ease_delta, 10);
    expect(next.consecutive_again_count).toBe(1);
  });
});

describe("scheduleNext — ease floor (1.5)", () => {
  it("Again does not drop ease below the floor", () => {
    const atFloor = stateWith({ ease: 1.6, status: "review", interval_days: 2 });
    const next = scheduleNext(atFloor, "again", NOW);
    expect(next.ease).toBe(SRS_DEFAULTS.ease_floor);
  });

  it("Hard does not drop ease below the floor", () => {
    const nearFloor = stateWith({ ease: 1.6, status: "review", interval_days: 2 });
    const next = scheduleNext(nearFloor, "hard", NOW);
    expect(next.ease).toBe(SRS_DEFAULTS.ease_floor);
  });

  it("Good still multiplies correctly at the floor", () => {
    const atFloor = stateWith({
      ease: SRS_DEFAULTS.ease_floor,
      status: "review",
      interval_days: 3,
    });
    const next = scheduleNext(atFloor, "good", NOW);
    expect(next.interval_days).toBeCloseTo(3 * SRS_DEFAULTS.ease_floor, 10);
    expect(next.ease).toBe(SRS_DEFAULTS.ease_floor);
  });
});

describe("scheduleNext — leech detection", () => {
  it("promotes to leech after 5 consecutive Agains", () => {
    let state = stateWith();
    for (let i = 0; i < 4; i++) state = scheduleNext(state, "again", NOW);
    expect(state.status).toBe("learning");
    expect(state.consecutive_again_count).toBe(4);

    state = scheduleNext(state, "again", NOW);
    expect(state.status).toBe("leech");
    expect(state.consecutive_again_count).toBe(SRS_DEFAULTS.leech_threshold);
  });

  it("a non-again rating on a leech promotes it back to review", () => {
    const leech = stateWith({ status: "leech", consecutive_again_count: 5, ease: 1.8 });
    const next = scheduleNext(leech, "good", NOW);
    expect(next.status).toBe("review");
    expect(next.consecutive_again_count).toBe(0);
  });

  it("a non-again rating on a learning card resets consecutive_again_count to zero", () => {
    const almost = stateWith({ consecutive_again_count: 3 });
    const next = scheduleNext(almost, "good", NOW);
    expect(next.consecutive_again_count).toBe(0);
  });
});

describe("scheduleNext — suspended cards", () => {
  it("returns the state unchanged regardless of rating", () => {
    const suspended = stateWith({ status: "suspended", interval_days: 99 });
    const ratings: readonly ("again" | "hard" | "good" | "easy")[] = [
      "again",
      "hard",
      "good",
      "easy",
    ];
    for (const r of ratings) {
      const next = scheduleNext(suspended, r, NOW);
      expect(next).toEqual(suspended);
    }
  });
});

describe("scheduleNext — long-interval Again reset (build spec §2.7)", () => {
  it("collapses a weeks-out interval back to the 1-minute learning step", () => {
    const weeksOut = stateWith({
      status: "review",
      interval_days: 30,
      ease: 2.3,
      last_reviewed_at: "2026-04-01T10:00:00Z",
    });
    const next = scheduleNext(weeksOut, "again", NOW);
    expect(next.interval_days).toBeCloseTo(MINUTE_IN_DAYS, 10);
    expect(next.status).toBe("learning");
  });
});

describe("scheduleNext — due_at and last_reviewed_at", () => {
  it("records last_reviewed_at at the supplied `now`", () => {
    const next = scheduleNext(stateWith(), "good", NOW);
    expect(next.last_reviewed_at).toBe(NOW.toISOString());
  });

  it("due_at is always at least 1 minute in the future, even for zero-interval rounding", () => {
    const next = scheduleNext(stateWith(), "again", NOW);
    expect(new Date(next.due_at).getTime()).toBeGreaterThanOrEqual(NOW.getTime() + 60_000);
  });

  it("due_at on a Good review is offset by exactly interval_days", () => {
    const next = scheduleNext(stateWith(), "good", NOW);
    const expectedDue = new Date(NOW.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(next.due_at).toBe(expectedDue);
  });
});

describe("scheduleNext — ease ratcheting across multiple reviews", () => {
  it("Easy raises ease repeatedly up past its starting value", () => {
    let state = stateWith();
    for (let i = 0; i < 5; i++) state = scheduleNext(state, "easy", NOW);
    // Base ease 2.5; each Easy adds 0.15.
    expect(state.ease).toBeCloseTo(2.5 + 5 * SRS_DEFAULTS.easy_ease_delta, 10);
  });

  it("mixed Good/Hard/Easy produces ease within sensible bounds", () => {
    let state = stateWith();
    state = scheduleNext(state, "good", NOW);
    state = scheduleNext(state, "hard", NOW);
    state = scheduleNext(state, "easy", NOW);
    state = scheduleNext(state, "good", NOW);
    expect(state.ease).toBeGreaterThanOrEqual(SRS_DEFAULTS.ease_floor);
    expect(state.ease).toBeLessThan(3);
  });
});

describe("newCardState helper", () => {
  it("builds a sensible default", () => {
    const s = newCardState(NOW);
    expect(s.ease).toBe(SRS_DEFAULTS.ease);
    expect(s.status).toBe("learning");
    expect(s.consecutive_again_count).toBe(0);
    expect(s.due_at).toBe(NOW.toISOString());
    expect(s.last_reviewed_at).toBeNull();
  });
});
