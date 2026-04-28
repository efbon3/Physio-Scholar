import { describe, expect, it } from "vitest";

import { extractCards } from "./cards";
import {
  chapterToMechanism,
  deriveChapterId,
  isChapterFrontmatter,
  mapPartToOrganSystem,
  parseDistractorLine,
} from "./chapter-parser";
import { parseMechanism } from "./loader";

describe("isChapterFrontmatter", () => {
  it("returns true for chapter-shaped frontmatter", () => {
    expect(
      isChapterFrontmatter({
        chapter: "Chapter 1 — Introduction",
        part: "Part I — Foundations of Physiology",
        status: "draft",
      }),
    ).toBe(true);
  });

  it("returns false when `id` is present (canonical mechanism format)", () => {
    expect(
      isChapterFrontmatter({
        id: "frank-starling",
        chapter: "anything",
        part: "anything",
      }),
    ).toBe(false);
  });

  it("returns false when chapter or part is missing", () => {
    expect(isChapterFrontmatter({ chapter: "x" })).toBe(false);
    expect(isChapterFrontmatter({ part: "x" })).toBe(false);
    expect(isChapterFrontmatter({})).toBe(false);
    expect(isChapterFrontmatter(null)).toBe(false);
    expect(isChapterFrontmatter("string")).toBe(false);
  });
});

describe("deriveChapterId", () => {
  it("turns `Chapter 1 — Introduction` into `ch01-introduction`", () => {
    expect(deriveChapterId("Chapter 1 — Introduction to Physiology and Homeostasis")).toBe(
      "ch01-introduction-to-physiology-and-homeostasis",
    );
  });

  it("zero-pads single-digit chapter numbers", () => {
    expect(deriveChapterId("Chapter 7 — Skeletal Muscle Physiology")).toBe(
      "ch07-skeletal-muscle-physiology",
    );
  });

  it("handles two-digit chapter numbers", () => {
    expect(deriveChapterId("Chapter 22 — The Heart as a Pump")).toBe("ch22-the-heart-as-a-pump");
  });

  it("accepts en-dash and ASCII hyphen as separators", () => {
    expect(deriveChapterId("Chapter 5 – Cell Signalling")).toBe("ch05-cell-signalling");
    expect(deriveChapterId("Chapter 5 - Cell Signalling")).toBe("ch05-cell-signalling");
  });

  it("falls back to a slugified title when the format doesn't match", () => {
    expect(deriveChapterId("Some Random Document Title")).toBe("some-random-document-title");
  });
});

describe("mapPartToOrganSystem", () => {
  it("maps each Roman-numeral part to the documented organ_system token", () => {
    expect(mapPartToOrganSystem("Part I — Foundations of Physiology")).toBe("foundations");
    expect(mapPartToOrganSystem("Part II — Excitable Tissues — Nerve and Muscle")).toBe(
      "musculoskeletal",
    );
    expect(mapPartToOrganSystem("Part III — The Nervous System")).toBe("nervous");
    expect(mapPartToOrganSystem("Part IV — Blood and Immunity")).toBe("blood");
    expect(mapPartToOrganSystem("Part V — The Cardiovascular System")).toBe("cardiovascular");
    expect(mapPartToOrganSystem("Part VI — The Respiratory System")).toBe("respiratory");
    expect(mapPartToOrganSystem("Part VII — The Renal System and Body Fluids")).toBe("renal");
    expect(mapPartToOrganSystem("Part VIII — The Gastrointestinal and Hepatobiliary System")).toBe(
      "gastrointestinal",
    );
    expect(mapPartToOrganSystem("Part IX — The Endocrine System")).toBe("endocrine");
    expect(mapPartToOrganSystem("Part X — Reproductive Physiology")).toBe("reproductive");
    expect(mapPartToOrganSystem("Part XI — Integrative and Environmental Physiology")).toBe(
      "integrated",
    );
  });

  it("throws on an unknown part rather than silently mis-tagging", () => {
    expect(() => mapPartToOrganSystem("Part XII — Future Section")).toThrow();
  });
});

describe("parseDistractorLine", () => {
  it("parses the canonical Reveals-misconception shape", () => {
    const line =
      '"Claude Bernard" — Reveals misconception: student conflates concept with name. Correction: Bernard introduced the concept; Cannon coined the word.';
    expect(parseDistractorLine(line)).toEqual({
      wrong: "Claude Bernard",
      description:
        "Reveals misconception: student conflates concept with name. Correction: Bernard introduced the concept; Cannon coined the word.",
    });
  });

  it("parses the Plausible-but-no-misconception shape", () => {
    const line =
      '"Andreas Vesalius" — Plausible but does not reveal a specific misconception (associated with anatomy).';
    expect(parseDistractorLine(line)).toEqual({
      wrong: "Andreas Vesalius",
      description:
        "Plausible but does not reveal a specific misconception (associated with anatomy).",
    });
  });

  it("accepts curly quotes as well as straight quotes", () => {
    const line = "“Walter Cannon” — Reveals misconception: student inverts the attribution.";
    expect(parseDistractorLine(line)).toEqual({
      wrong: "Walter Cannon",
      description: "Reveals misconception: student inverts the attribution.",
    });
  });

  it("returns null for a line that doesn't match the expected shape", () => {
    expect(parseDistractorLine("- some narrative text")).toBeNull();
    expect(parseDistractorLine("")).toBeNull();
  });
});

describe("chapterToMechanism — full conversion", () => {
  // Inline fixture: a 2-question chapter, exercising both distractor
  // shapes, hint ladder, and explanation. End-to-end test below
  // verifies the ch1mcq.md content/mechanism file extracts 22 cards.
  const FIXTURE_BODY = `# Chapter 1 — MCQs

(intro paragraph that should be stripped)

## Pass 1 — Pass header

QUESTION 1
Type: recall
Bloom's level: remember

Stem: Who coined the term "homeostasis"?

Correct answer: Walter Cannon (in 1929).

Distractors:
- "Claude Bernard" — Reveals misconception: confuses concept with term. Correction: Bernard described the concept; Cannon named it.
- "Andreas Vesalius" — Plausible but does not reveal a specific misconception (associated with anatomy).
- "William Harvey" — Reveals misconception: associates any historical figure with homeostasis. Correction: Harvey discovered systemic circulation.

Explanation: Walter Cannon coined the term "homeostasis" in 1929 [Guyton ch.1].

Hints:
1. The term was introduced in the 20th century.
2. The physiologist worked in the United States.
3. The paper was published in 1929.

---

QUESTION 2
Type: comparison
Bloom's level: understand

Stem: How is total body water distributed?

Correct answer: About two-thirds intracellular, one-third extracellular.

Distractors:
- "Half/half" — Reveals misconception: assumes equal distribution. Correction: ICF dominates by volume.
- "One-third intracellular, two-thirds extracellular" — Reveals misconception: inverted proportions. Correction: cells fill more total volume than the spaces around them.

Explanation: ICF is about two-thirds, ECF about one-third [Costanzo p.1].

Hints:
1. One compartment is roughly twice the other.
2. The cells take up more volume.

---

# Final Summary

(stripped)
`;

  const FIXTURE_DATA = {
    chapter: "Chapter 1 — Introduction to Physiology and Homeostasis",
    part: "Part I — Foundations of Physiology",
    tier: 1,
    target_count: 2,
    actual_count: 2,
    status: "draft" as const,
  };

  it("converts to a Mechanism with the right id, title, and organ_system", () => {
    const out = chapterToMechanism(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.frontmatter.id).toBe("ch01-introduction-to-physiology-and-homeostasis");
    expect(out.frontmatter.title).toBe("Chapter 1 — Introduction to Physiology and Homeostasis");
    expect(out.frontmatter.organ_system).toBe("foundations");
    expect(out.frontmatter.exam_patterns).toEqual(["mbbs"]);
    expect(out.frontmatter.status).toBe("draft");
  });

  it("body opens with `# Questions` so the layer splitter finds the cards", () => {
    const out = chapterToMechanism(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.body).toMatch(/^#\s+Questions/m);
  });

  it("strips Pass headers, the optional preamble, and the Final Summary section", () => {
    const out = chapterToMechanism(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.body).not.toContain("Pass 1");
    expect(out.body).not.toContain("(intro paragraph");
    expect(out.body).not.toContain("Final Summary");
  });

  it("transforms each question block to the canonical `## Question N` shape", () => {
    const out = chapterToMechanism(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.body).toContain("## Question 1");
    expect(out.body).toContain("## Question 2");
    expect(out.body).toContain("**Format:** mcq");
    expect(out.body).toContain("**Type:** recall");
    expect(out.body).toContain("**Bloom's level:** remember");
    expect(out.body).toContain("**Stem:**");
    expect(out.body).toContain("**Correct answer:**");
    expect(out.body).toContain("**Elaborative explanation:**");
    expect(out.body).toContain("### Hint Ladder");
    expect(out.body).toContain("### Misconception Mappings");
  });
});

describe("chapterToMechanism — end-to-end via parseMechanism + extractCards", () => {
  // Same fixture, full pipeline: gray-matter parse → chapter detect →
  // chapter-to-mechanism transform → splitLayers → extractCards.
  const RAW = `---
chapter: Chapter 1 — Introduction to Physiology and Homeostasis
part: Part I — Foundations of Physiology
tier: 1
target_count: 2
actual_count: 2
status: draft
---

# Chapter 1 — MCQs

## Pass 1 — pass header

QUESTION 1
Type: recall
Bloom's level: remember

Stem: Who coined the term "homeostasis"?

Correct answer: Walter Cannon (in 1929).

Distractors:
- "Claude Bernard" — Reveals misconception: confuses concept with term. Correction: Bernard described the concept; Cannon named it.
- "Andreas Vesalius" — Plausible but does not reveal a specific misconception (associated with anatomy).

Explanation: Walter Cannon coined the term in 1929.

Hints:
1. The term was introduced in the 20th century.
2. He worked in the United States.

---

QUESTION 2
Type: comparison
Bloom's level: understand

Stem: How is total body water distributed?

Correct answer: About two-thirds intracellular, one-third extracellular.

Distractors:
- "Half/half" — Reveals misconception: assumes equal distribution. Correction: ICF dominates.

Explanation: ICF is about two-thirds.

Hints:
1. One compartment is roughly twice the other.
`;

  it("produces a parseable Mechanism that extractCards can walk", () => {
    const m = parseMechanism(RAW);
    expect(m.frontmatter.id).toBe("ch01-introduction-to-physiology-and-homeostasis");
    expect(m.frontmatter.organ_system).toBe("foundations");
    const cards = extractCards(m);
    expect(cards).toHaveLength(2);
    expect(cards[0].id).toBe("ch01-introduction-to-physiology-and-homeostasis:1");
    expect(cards[0].format).toBe("mcq");
    expect(cards[0].type).toBe("recall");
    expect(cards[0].blooms_level).toBe("remember");
    expect(cards[0].stem).toMatch(/Who coined the term "homeostasis"/);
    expect(cards[0].correct_answer).toMatch(/Walter Cannon/);
    expect(cards[0].misconceptions).toHaveLength(2);
    expect(cards[0].misconceptions[0]).toEqual({
      wrong_answer: "Claude Bernard",
      description: expect.stringMatching(/Reveals misconception/),
    });
    expect(cards[0].hints).toEqual([
      "The term was introduced in the 20th century.",
      "He worked in the United States.",
    ]);
    expect(cards[1].id).toBe("ch01-introduction-to-physiology-and-homeostasis:2");
    expect(cards[1].blooms_level).toBe("understand");
  });
});

describe("chapterToMechanism — shipped chapter file", () => {
  // Smoke test against the real ch01-introduction-and-homeostasis.md
  // we ship under content/mechanisms/. If the chapter format drifts
  // and breaks the parser, this test catches it on every CI run.
  it("loads ch01-introduction-and-homeostasis.md and produces 22 cards", async () => {
    const { readMechanismById } = await import("./fs");
    const m = await readMechanismById("ch01-introduction-and-homeostasis");
    expect(m).not.toBeNull();
    if (!m) return;
    expect(m.frontmatter.organ_system).toBe("foundations");
    expect(m.frontmatter.title).toMatch(/Introduction/);
    const cards = extractCards(m);
    expect(cards.length).toBe(22);
    // Spot-check the first card has the structured fields the
    // platform expects.
    expect(cards[0].format).toBe("mcq");
    expect(cards[0].correct_answer.length).toBeGreaterThan(0);
    expect(cards[0].misconceptions.length).toBeGreaterThanOrEqual(2);
    // Priority and Difficulty come from the shorthand `Priority (M /
    // S / G):` / `Difficulty (F / I / A):` lines added in the
    // 2026-04-28 chapter revision — every authored question should
    // have both populated, no defaults.
    for (const card of cards) {
      expect(["must", "should", "good"]).toContain(card.priority);
      expect(["foundational", "standard", "advanced"]).toContain(card.difficulty);
    }
    // Q1 specifically authored as F (foundational) / S (should).
    expect(cards[0].priority).toBe("should");
    expect(cards[0].difficulty).toBe("foundational");
  });
});

describe("Priority and Difficulty shorthand mapping", () => {
  it("transforms shorthand letters to canonical tokens", () => {
    const RAW = `---
chapter: Chapter 1 — Test
part: Part I — Foundations of Physiology
status: draft
---

# Questions

QUESTION 1
Type: recall
Bloom's level: remember
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Stem.

Correct answer: Answer.

Distractors:
- "Wrong A" — Reveals misconception: foo.
- "Wrong B" — Reveals misconception: bar.

Explanation: Why.

Hints:
1. Hint A.

---

QUESTION 2
Type: recall
Bloom's level: understand
Difficulty (F / I / A): i
Priority (M / S / G): s

Stem: Stem.

Correct answer: Answer.

Distractors:
- "Wrong A" — Reveals misconception: foo.

Explanation: Why.

Hints:
1. Hint A.

---

QUESTION 3
Type: recall
Bloom's level: analyze
Difficulty (F / I / A): a
Priority (M / S / G): g

Stem: Stem.

Correct answer: Answer.

Distractors:
- "Wrong A" — Reveals misconception: foo.

Explanation: Why.

Hints:
1. Hint A.
`;
    const m = parseMechanism(RAW);
    const cards = extractCards(m);
    expect(cards).toHaveLength(3);
    expect(cards[0].priority).toBe("must");
    expect(cards[0].difficulty).toBe("foundational");
    expect(cards[1].priority).toBe("should");
    expect(cards[1].difficulty).toBe("standard");
    expect(cards[2].priority).toBe("good");
    expect(cards[2].difficulty).toBe("advanced");
  });
});
