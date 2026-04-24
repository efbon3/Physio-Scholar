import { describe, expect, it } from "vitest";

import { extractCards } from "./cards";
import { parseMechanism } from "./loader";

const BASE_FRONTMATTER = `---
id: frank-starling
title: Frank-Starling Mechanism
organ_system: cardiovascular
nmc_competencies: [PY-CV-1.5]
exam_patterns: [neet-pg]
prerequisites: []
related_mechanisms: []
blooms_distribution: { remember: 25, understand: 25, apply: 25, analyze: 25 }
author: a
reviewer: pending
status: draft
version: "0.1"
published_date: 2026-01-01
last_reviewed: 2026-01-01
---
`;

function withBody(body: string): string {
  return `${BASE_FRONTMATTER}\n${body}\n`;
}

describe("extractCards — happy path", () => {
  it("extracts the single card from the placeholder Frank-Starling mechanism", () => {
    const mechanism = parseMechanism(
      withBody(`# Layer 1 — Core

core text

# Questions

## Question 1
**Type:** prediction
**Bloom's level:** apply
**Stem:** A healthy subject rapidly infused with 500 mL saline shows which beat-by-beat change?
**Correct answer:** Stroke volume rises at a constant heart rate.
**Elaborative explanation:** Volume loading raises preload; Frank-Starling translates that into stroke volume. HR is baroreflex-mediated, separate loop.

### Hint Ladder
1. What happens to end-diastolic volume?
2. What does length-tension predict?
3. Which variable moves first — HR or SV?

### Misconception Mappings
- Wrong answer: "Heart rate increases" → Misconception: conflating SV and HR responses to preload changes
- Wrong answer: "No change in CO" → Misconception: assuming autoregulatory mechanisms fully compensate first
`),
    );

    const cards = extractCards(mechanism);
    expect(cards).toHaveLength(1);
    const c = cards[0];
    expect(c.id).toBe("frank-starling:1");
    expect(c.index).toBe(1);
    expect(c.type).toBe("prediction");
    expect(c.blooms_level).toBe("apply");
    expect(c.stem).toMatch(/500 mL saline/);
    expect(c.correct_answer).toMatch(/Stroke volume rises/);
    expect(c.elaborative_explanation).toMatch(/Frank-Starling/);
    expect(c.hints).toHaveLength(3);
    expect(c.hints[0]).toMatch(/end-diastolic volume/);
    expect(c.misconceptions).toHaveLength(2);
    expect(c.misconceptions[0]).toMatchObject({
      wrong_answer: "Heart rate increases",
      description: expect.stringMatching(/conflating SV and HR/),
    });
  });

  it("extracts multiple cards in order", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** What does the Frank-Starling law state?
**Correct answer:** Stretch → stronger contraction.
**Elaborative explanation:** Length-tension relationship at the sarcomere level.

### Hint Ladder
1. Hint A
2. Hint B

### Misconception Mappings

## Question 2
**Type:** prediction
**Bloom's level:** analyze
**Stem:** Second stem.
**Correct answer:** Second answer.
**Elaborative explanation:** Second explanation.

### Hint Ladder
1. Only one hint here.
`),
    );

    const cards = extractCards(mechanism);
    expect(cards.map((c) => c.id)).toEqual(["frank-starling:1", "frank-starling:2"]);
    expect(cards[0].blooms_level).toBe("remember");
    expect(cards[1].blooms_level).toBe("analyze");
    expect(cards[0].hints).toEqual(["Hint A", "Hint B"]);
    expect(cards[1].hints).toEqual(["Only one hint here."]);
    expect(cards[0].misconceptions).toEqual([]);
  });

  it("returns [] for a mechanism with no Questions section (draft)", () => {
    const mechanism = parseMechanism(
      withBody(`# Layer 1 — Core

core only — no questions yet
`),
    );
    expect(extractCards(mechanism)).toEqual([]);
  });
});

describe("extractCards — field edge cases", () => {
  it("accepts ASCII `->` and Unicode `→` in misconception mappings", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** prediction
**Bloom's level:** apply
**Stem:** Test
**Correct answer:** Answer
**Elaborative explanation:** Explanation

### Misconception Mappings
- Wrong answer: "ASCII arrow" -> Misconception: ascii test
- Wrong answer: "Unicode arrow" → Misconception: unicode test
`),
    );
    const cards = extractCards(mechanism);
    expect(cards[0].misconceptions).toEqual([
      { wrong_answer: "ASCII arrow", description: "ascii test" },
      { wrong_answer: "Unicode arrow", description: "unicode test" },
    ]);
  });

  it("caps hints at 3 even if the author provides more", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** x
**Bloom's level:** apply
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

### Hint Ladder
1. one
2. two
3. three
4. four (should be dropped)
5. five (should be dropped)
`),
    );
    expect(extractCards(mechanism)[0].hints).toEqual(["one", "two", "three"]);
  });

  it("coerces unsupported Bloom's levels to the closest v1 bucket", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** x
**Bloom's level:** evaluate
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    // v1 supports remember/understand/apply/analyze; evaluate coerces to analyze.
    expect(extractCards(mechanism)[0].blooms_level).toBe("analyze");
  });

  it("defaults Bloom's level to apply when the label is missing", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** x
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(mechanism)[0].blooms_level).toBe("apply");
  });

  it("throws when a required field is missing entirely", () => {
    // No Stem at all — schema requires it non-empty.
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** x
**Bloom's level:** apply
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(() => extractCards(mechanism)).toThrow();
  });
});

describe("extractCards — parses the shipped placeholder", () => {
  it("returns at least one valid Card from the real content/mechanisms/frank-starling.md via the file loader", async () => {
    // Imports that touch fs are normally server-only; ok in tests.
    const { readMechanismById } = await import("./fs");
    const fs = await readMechanismById("frank-starling");
    expect(fs).not.toBeNull();
    const cards = extractCards(fs!);
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards[0].id).toBe("frank-starling:1");
    expect(cards[0].stem.length).toBeGreaterThan(20);
  });
});

describe("extractCards — exam_patterns (Option Y)", () => {
  it("inherits the mechanism-level list when the card has no line", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(mechanism)[0].exam_patterns).toEqual(["neet-pg"]);
  });

  it("per-card line overrides the mechanism fallback", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Exam patterns:** mbbs, pre-pg
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(mechanism)[0].exam_patterns).toEqual(["mbbs", "pre-pg"]);
  });

  it("normalises case, whitespace, and duplicates", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Exam patterns:**   MBBS ,  pre-pg ,  MBBS
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(mechanism)[0].exam_patterns).toEqual(["mbbs", "pre-pg"]);
  });

  it("different cards in the same mechanism can carry different patterns", () => {
    const mechanism = parseMechanism(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Exam patterns:** mbbs
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Type:** recall
**Bloom's level:** apply
**Exam patterns:** pre-pg
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(mechanism);
    expect(cards[0].exam_patterns).toEqual(["mbbs"]);
    expect(cards[1].exam_patterns).toEqual(["pre-pg"]);
  });
});
