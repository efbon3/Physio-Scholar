import { describe, expect, it } from "vitest";

import type { Card } from "@/lib/content/cards";

import { assembleQueue, summariseQueue } from "./queue";
import { newCardState, type CardState } from "./types";

const NOW = new Date("2026-05-01T10:00:00Z");

function card(id: string, index = Number.parseInt(id.split(":")[1] ?? "1", 10)): Card {
  return {
    id,
    mechanism_id: id.split(":")[0],
    index,
    type: "prediction",
    blooms_level: "apply",
    stem: `stem-${id}`,
    correct_answer: "a",
    elaborative_explanation: "e",
    hints: [],
    misconceptions: [],
    exam_patterns: [],
  };
}

function stateAt(due_at: Date, overrides: Partial<CardState> = {}): CardState {
  return {
    ...newCardState(NOW),
    status: "review",
    interval_days: 3,
    due_at: due_at.toISOString(),
    ...overrides,
  };
}

describe("assembleQueue — due ordering", () => {
  it("returns only due cards sorted by due_at ascending", () => {
    const cards = [card("m:1"), card("m:2"), card("m:3")];
    const states = new Map<string, CardState>([
      // m:1 due tomorrow — not due yet
      ["m:1", stateAt(new Date("2026-05-02T10:00:00Z"))],
      // m:2 due 2 hours ago — most overdue
      ["m:2", stateAt(new Date("2026-05-01T08:00:00Z"))],
      // m:3 due right now
      ["m:3", stateAt(new Date("2026-05-01T10:00:00Z"))],
    ]);

    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 0 });
    expect(q.map((x) => x.card.id)).toEqual(["m:2", "m:3"]);
  });

  it("ties break deterministically by card id", () => {
    const cards = [card("z:2"), card("a:1")];
    const due_at = new Date("2026-05-01T09:00:00Z");
    const states = new Map<string, CardState>([
      ["z:2", stateAt(due_at)],
      ["a:1", stateAt(due_at)],
    ]);
    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 0 });
    expect(q.map((x) => x.card.id)).toEqual(["a:1", "z:2"]);
  });
});

describe("assembleQueue — new card introduction", () => {
  it("appends up to maxNewCards after the due cards", () => {
    const cards = [card("due:1"), card("new:1"), card("new:2"), card("new:3")];
    const states = new Map<string, CardState>([
      ["due:1", stateAt(new Date("2026-05-01T08:00:00Z"))],
    ]);
    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 2 });
    expect(q.map((x) => x.card.id)).toEqual(["due:1", "new:1", "new:2"]);
    expect(q[1].isNew).toBe(true);
    expect(q[2].isNew).toBe(true);
  });

  it("respects maxNewCards = 0 (no new cards)", () => {
    const cards = [card("n:1"), card("n:2")];
    const q = assembleQueue({ cards, cardStates: new Map(), now: NOW, maxNewCards: 0 });
    expect(q).toEqual([]);
  });

  it("clamps negative maxNewCards to 0", () => {
    const cards = [card("n:1")];
    const q = assembleQueue({ cards, cardStates: new Map(), now: NOW, maxNewCards: -5 });
    expect(q).toEqual([]);
  });

  it("stamps a fresh CardState on each new card", () => {
    const cards = [card("n:1")];
    const q = assembleQueue({ cards, cardStates: new Map(), now: NOW, maxNewCards: 1 });
    expect(q[0].isNew).toBe(true);
    expect(q[0].state.status).toBe("learning");
    expect(q[0].state.due_at).toBe(NOW.toISOString());
  });
});

describe("assembleQueue — status filters", () => {
  it("excludes suspended cards unconditionally", () => {
    const cards = [card("s:1"), card("ok:1")];
    const states = new Map<string, CardState>([
      ["s:1", stateAt(new Date("2026-04-01T10:00:00Z"), { status: "suspended" })],
      ["ok:1", stateAt(new Date("2026-04-01T10:00:00Z"))],
    ]);
    const q = assembleQueue({
      cards,
      cardStates: states,
      now: NOW,
      maxNewCards: 0,
      includeLeeches: true,
    });
    expect(q.map((x) => x.card.id)).toEqual(["ok:1"]);
  });

  it("includes leech cards by default", () => {
    const cards = [card("leech:1"), card("ok:1")];
    const states = new Map<string, CardState>([
      ["leech:1", stateAt(new Date("2026-04-01T10:00:00Z"), { status: "leech" })],
      ["ok:1", stateAt(new Date("2026-04-01T10:00:00Z"))],
    ]);
    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 0 });
    expect(q.map((x) => x.card.id).sort()).toEqual(["leech:1", "ok:1"]);
  });

  it("excludes leeches when includeLeeches=false", () => {
    const cards = [card("leech:1"), card("ok:1")];
    const states = new Map<string, CardState>([
      ["leech:1", stateAt(new Date("2026-04-01T10:00:00Z"), { status: "leech" })],
      ["ok:1", stateAt(new Date("2026-04-01T10:00:00Z"))],
    ]);
    const q = assembleQueue({
      cards,
      cardStates: states,
      now: NOW,
      maxNewCards: 0,
      includeLeeches: false,
    });
    expect(q.map((x) => x.card.id)).toEqual(["ok:1"]);
  });

  it("includes due learning cards", () => {
    const cards = [card("l:1")];
    const states = new Map<string, CardState>([
      [
        "l:1",
        stateAt(new Date("2026-05-01T09:00:00Z"), {
          status: "learning",
          interval_days: 0.0007, // ~1 minute
        }),
      ],
    ]);
    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 0 });
    expect(q.map((x) => x.card.id)).toEqual(["l:1"]);
  });
});

describe("assembleQueue — empty inputs", () => {
  it("returns an empty queue for zero cards", () => {
    expect(assembleQueue({ cards: [], cardStates: new Map(), now: NOW, maxNewCards: 10 })).toEqual(
      [],
    );
  });
});

describe("summariseQueue", () => {
  it("counts due vs new cards separately", () => {
    const cards = [card("due:1"), card("new:1"), card("new:2")];
    const states = new Map<string, CardState>([
      ["due:1", stateAt(new Date("2026-04-01T10:00:00Z"))],
    ]);
    const q = assembleQueue({ cards, cardStates: states, now: NOW, maxNewCards: 5 });
    expect(summariseQueue(q)).toEqual({ due: 1, new: 2, total: 3 });
  });
});
