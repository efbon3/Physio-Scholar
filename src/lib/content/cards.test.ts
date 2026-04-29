import { describe, expect, it } from "vitest";

import { extractCards } from "./cards";
import { parseChapter } from "./loader";

const BASE_FRONTMATTER = `---
id: frank-starling
title: Frank-Starling Chapter
organ_system: cardiovascular
nmc_competencies: [PY-CV-1.5]
exam_patterns: [neet-pg]
prerequisites: []
related_chapters: []
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
  it("extracts the single card from the placeholder Frank-Starling Chapter", () => {
    const Chapter = parseChapter(
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

    const cards = extractCards(Chapter);
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
    const Chapter = parseChapter(
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

    const cards = extractCards(Chapter);
    expect(cards.map((c) => c.id)).toEqual(["frank-starling:1", "frank-starling:2"]);
    expect(cards[0].blooms_level).toBe("remember");
    expect(cards[1].blooms_level).toBe("analyze");
    expect(cards[0].hints).toEqual(["Hint A", "Hint B"]);
    expect(cards[1].hints).toEqual(["Only one hint here."]);
    expect(cards[0].misconceptions).toEqual([]);
  });

  it("returns [] for a Chapter with no Questions section (draft)", () => {
    const Chapter = parseChapter(
      withBody(`# Layer 1 — Core

core only — no questions yet
`),
    );
    expect(extractCards(Chapter)).toEqual([]);
  });
});

describe("extractCards — field edge cases", () => {
  it("accepts ASCII `->` and Unicode `→` in misconception mappings", () => {
    const Chapter = parseChapter(
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
    const cards = extractCards(Chapter);
    expect(cards[0].misconceptions).toEqual([
      { wrong_answer: "ASCII arrow", description: "ascii test" },
      { wrong_answer: "Unicode arrow", description: "unicode test" },
    ]);
  });

  it("caps hints at 3 even if the author provides more", () => {
    const Chapter = parseChapter(
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
    expect(extractCards(Chapter)[0].hints).toEqual(["one", "two", "three"]);
  });

  it("coerces unsupported Bloom's levels to the closest v1 bucket", () => {
    const Chapter = parseChapter(
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
    expect(extractCards(Chapter)[0].blooms_level).toBe("analyze");
  });

  it("defaults Bloom's level to apply when the label is missing", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** x
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0].blooms_level).toBe("apply");
  });

  it("throws when a required field is missing entirely", () => {
    // No Stem at all — schema requires it non-empty.
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** x
**Bloom's level:** apply
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(() => extractCards(Chapter)).toThrow();
  });
});

describe("extractCards — exam_patterns (Option Y)", () => {
  it("inherits the Chapter-level list when the card has no line", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0].exam_patterns).toEqual(["neet-pg"]);
  });

  it("per-card line overrides the Chapter fallback", () => {
    const Chapter = parseChapter(
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
    expect(extractCards(Chapter)[0].exam_patterns).toEqual(["mbbs", "pre-pg"]);
  });

  it("normalises case, whitespace, and duplicates", () => {
    const Chapter = parseChapter(
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
    expect(extractCards(Chapter)[0].exam_patterns).toEqual(["mbbs", "pre-pg"]);
  });

  it("different cards in the same Chapter can carry different patterns", () => {
    const Chapter = parseChapter(
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
    const cards = extractCards(Chapter);
    expect(cards[0].exam_patterns).toEqual(["mbbs"]);
    expect(cards[1].exam_patterns).toEqual(["pre-pg"]);
  });
});

describe("extractCards — priority + difficulty classification", () => {
  it("defaults to should/standard when both labels are omitted", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const card = extractCards(Chapter)[0]!;
    expect(card.priority).toBe("should");
    expect(card.difficulty).toBe("standard");
  });

  it("reads explicit priority and difficulty labels", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Type:** analysis
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.priority).toBe("must");
    expect(cards[0]!.difficulty).toBe("foundational");
    expect(cards[1]!.priority).toBe("good");
    expect(cards[1]!.difficulty).toBe("advanced");
  });

  it("accepts known priority synonyms (essential/core/optional/bonus/expected)", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Priority:** essential
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Type:** recall
**Bloom's level:** remember
**Priority:** bonus
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 3
**Type:** recall
**Bloom's level:** remember
**Priority:** expected
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.priority).toBe("must");
    expect(cards[1]!.priority).toBe("good");
    expect(cards[2]!.priority).toBe("should");
  });

  it("accepts known difficulty synonyms (intermediate/easy/hard)", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Difficulty:** easy
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Type:** recall
**Bloom's level:** remember
**Difficulty:** intermediate
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 3
**Type:** recall
**Bloom's level:** remember
**Difficulty:** hard
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.difficulty).toBe("foundational");
    expect(cards[1]!.difficulty).toBe("standard");
    expect(cards[2]!.difficulty).toBe("advanced");
  });

  it("falls back to should/standard for unrecognised values rather than failing", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Priority:** crucial
**Difficulty:** brutal
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const card = extractCards(Chapter)[0]!;
    expect(card.priority).toBe("should");
    expect(card.difficulty).toBe("standard");
  });

  it("priority and difficulty are independent — must/advanced is legitimate", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** analysis
**Bloom's level:** analyze
**Priority:** must
**Difficulty:** advanced
**Stem:** A foundational concept tested at high cognitive depth
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const card = extractCards(Chapter)[0]!;
    expect(card.priority).toBe("must");
    expect(card.difficulty).toBe("advanced");
  });
});

describe("extractCards — format classification", () => {
  it("defaults to descriptive when no Format label is given", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.format).toBe("descriptive");
  });

  it("reads explicit format labels", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** mcq
**Type:** prediction
**Bloom's level:** apply
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 3
**Format:** descriptive
**Type:** comparison
**Bloom's level:** analyze
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.format).toBe("mcq");
    expect(cards[1]!.format).toBe("fill_blank");
    expect(cards[2]!.format).toBe("descriptive");
  });

  it("accepts known format synonyms (multiple choice / fill in the blank / free text)", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** Multiple Choice
**Type:** prediction
**Bloom's level:** apply
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Format:** fill in the blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 3
**Format:** free text
**Type:** comparison
**Bloom's level:** analyze
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.format).toBe("mcq");
    expect(cards[1]!.format).toBe("fill_blank");
    expect(cards[2]!.format).toBe("descriptive");
  });

  it("falls back to descriptive for unrecognised values rather than failing", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** drag-and-drop
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.format).toBe("descriptive");
  });
});

describe("extractCards — status lifecycle", () => {
  it("defaults to published when no Status label is given", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.status).toBe("published");
  });

  it("reads an explicit Status: retired label", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Status:** retired
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.status).toBe("retired");
  });

  it("retired questions still parse — they're tombstones, not errors", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Status:** retired
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e

## Question 2
**Type:** prediction
**Bloom's level:** apply
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards).toHaveLength(2);
    expect(cards[0]!.status).toBe("retired");
    expect(cards[1]!.status).toBe("published");
  });
});

describe("extractCards — uuid identity", () => {
  it("is undefined when no ID label is given", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.uuid).toBeUndefined();
  });

  it("reads a valid UUID from the ID label", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**ID:** 8f3c8e72-2a14-4c2c-8c8f-9e4a3b1d2c3a
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.uuid).toBe("8f3c8e72-2a14-4c2c-8c8f-9e4a3b1d2c3a");
  });

  it("normalises uppercase UUIDs to lowercase", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**ID:** 8F3C8E72-2A14-4C2C-8C8F-9E4A3B1D2C3A
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.uuid).toBe("8f3c8e72-2a14-4c2c-8c8f-9e4a3b1d2c3a");
  });

  it("ignores malformed IDs and leaves uuid undefined", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**ID:** not-a-uuid
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.uuid).toBeUndefined();
  });
});

describe("extractCards — fill-blank fields", () => {
  it("reads quoted, pipe-separated acceptable_answers", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** Normal cardiac output is approximately ____
**Correct answer:** 5.6 L/min
**Acceptable answers:** "5.6 L/min" | "5.6 liters per minute" | "5.6 l/min"
**Unit:** L/min
**Tolerance:** ±5%
**Elaborative explanation:** e
`),
    );
    const c = extractCards(Chapter)[0]!;
    expect(c.acceptable_answers).toEqual(["5.6 L/min", "5.6 liters per minute", "5.6 l/min"]);
    expect(c.unit).toBe("L/min");
    expect(c.tolerance_pct).toBeCloseTo(0.05);
  });

  it("falls back to bare-pipe parsing when answers are unquoted", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** Resting heart rate is ____ bpm
**Correct answer:** 72
**Acceptable answers:** 72 | 70 | 75
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.acceptable_answers).toEqual(["72", "70", "75"]);
  });

  it("parses tolerance from percent (with or without ±)", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Tolerance:** 10%
**Elaborative explanation:** e

## Question 2
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Tolerance:** ±2.5%
**Elaborative explanation:** e
`),
    );
    const cards = extractCards(Chapter);
    expect(cards[0]!.tolerance_pct).toBeCloseTo(0.1);
    expect(cards[1]!.tolerance_pct).toBeCloseTo(0.025);
  });

  it("parses tolerance from a decimal fraction", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Tolerance:** 0.05
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.tolerance_pct).toBeCloseTo(0.05);
  });

  it("acceptable_answers, unit, tolerance are all undefined when not authored", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Elaborative explanation:** e
`),
    );
    const c = extractCards(Chapter)[0]!;
    expect(c.acceptable_answers).toBeUndefined();
    expect(c.unit).toBeUndefined();
    expect(c.tolerance_pct).toBeUndefined();
  });

  it("ignores garbage tolerance strings rather than throwing", () => {
    const Chapter = parseChapter(
      withBody(`# Questions

## Question 1
**Format:** fill_blank
**Type:** recall
**Bloom's level:** remember
**Stem:** s
**Correct answer:** a
**Tolerance:** unknown
**Elaborative explanation:** e
`),
    );
    expect(extractCards(Chapter)[0]!.tolerance_pct).toBeUndefined();
  });
});
