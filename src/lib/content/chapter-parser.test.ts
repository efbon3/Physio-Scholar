import { describe, expect, it } from "vitest";

import { extractCards } from "./cards";
import {
  parseAuthorChapter,
  deriveChapterId,
  extractAuthorChapterTopics,
  formatToleranceForChapter,
  isAuthorChapterFrontmatter,
  mapPartToOrganSystem,
  parseDistractorLine,
} from "./chapter-parser";
import { parseChapter } from "./loader";

describe("isAuthorChapterFrontmatter", () => {
  it("returns true for chapter-shaped frontmatter", () => {
    expect(
      isAuthorChapterFrontmatter({
        chapter: "Chapter 1 — Introduction",
        part: "Part I — Foundations of Physiology",
        status: "draft",
      }),
    ).toBe(true);
  });

  it("returns false when `id` is present (canonical Chapter format)", () => {
    expect(
      isAuthorChapterFrontmatter({
        id: "frank-starling",
        chapter: "anything",
        part: "anything",
      }),
    ).toBe(false);
  });

  it("returns false when chapter or part is missing", () => {
    expect(isAuthorChapterFrontmatter({ chapter: "x" })).toBe(false);
    expect(isAuthorChapterFrontmatter({ part: "x" })).toBe(false);
    expect(isAuthorChapterFrontmatter({})).toBe(false);
    expect(isAuthorChapterFrontmatter(null)).toBe(false);
    expect(isAuthorChapterFrontmatter("string")).toBe(false);
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

describe("parseAuthorChapter — full conversion", () => {
  // Inline fixture: a 2-question chapter, exercising both distractor
  // shapes, hint ladder, and explanation. End-to-end test below
  // verifies the ch1mcq.md content/Chapter file extracts 22 cards.
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

  it("converts to a Chapter with the right id, title, and organ_system", () => {
    const out = parseAuthorChapter(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.frontmatter.id).toBe("ch01-introduction-to-physiology-and-homeostasis");
    expect(out.frontmatter.title).toBe("Chapter 1 — Introduction to Physiology and Homeostasis");
    expect(out.frontmatter.organ_system).toBe("foundations");
    expect(out.frontmatter.exam_patterns).toEqual(["mbbs"]);
    expect(out.frontmatter.status).toBe("draft");
  });

  it("body opens with `# Questions` so the layer splitter finds the cards", () => {
    const out = parseAuthorChapter(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.body).toMatch(/^#\s+Questions/m);
  });

  it("strips Pass headers, the optional preamble, and the Final Summary section", () => {
    const out = parseAuthorChapter(FIXTURE_DATA, FIXTURE_BODY);
    expect(out.body).not.toContain("Pass 1");
    expect(out.body).not.toContain("(intro paragraph");
    expect(out.body).not.toContain("Final Summary");
  });

  it("transforms each question block to the canonical `## Question N` shape", () => {
    const out = parseAuthorChapter(FIXTURE_DATA, FIXTURE_BODY);
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

describe("parseAuthorChapter — end-to-end via parseChapter + extractCards", () => {
  // Same fixture, full pipeline: gray-matter parse → chapter detect →
  // chapter-to-Chapter transform → splitLayers → extractCards.
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

  it("produces a parseable Chapter that extractCards can walk", () => {
    const m = parseChapter(RAW);
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

describe("parseAuthorChapter — shipped chapter file (merged)", () => {
  // Smoke test against the real chapter-1 content. The MCQ file
  // (ch01-introduction-and-homeostasis.md) and the fill-blank file
  // (ch01-introduction-and-homeostasis-fillblank.md) share a
  // `chapter:` frontmatter, so `readAllChapters` merges them into
  // one Chapter (see `mergeChapterFiles` in fs.ts). The primary's
  // id (`ch01-introduction-and-homeostasis`, no format suffix) anchors
  // the URL, and the merged questions section carries cards from both
  // files renumbered sequentially.
  it("merges MCQ + fill-blank + descriptive chapter files into a single Chapter", async () => {
    const { readChapterById } = await import("./fs");
    const m = await readChapterById("ch01-introduction-and-homeostasis");
    expect(m).not.toBeNull();
    if (!m) return;
    expect(m.frontmatter.id).toBe("ch01-introduction-and-homeostasis");
    expect(m.frontmatter.organ_system).toBe("foundations");
    expect(m.frontmatter.title).toMatch(/Introduction/);
    const cards = extractCards(m);
    // 22 MCQ + 18 fill-blank + 15 descriptive = 55 cards, renumbered 1..55.
    expect(cards).toHaveLength(55);
    const mcq = cards.filter((c) => c.format === "mcq");
    const fillBlank = cards.filter((c) => c.format === "fill_blank");
    const descriptive = cards.filter((c) => c.format === "descriptive");
    expect(mcq).toHaveLength(22);
    expect(fillBlank).toHaveLength(18);
    expect(descriptive).toHaveLength(15);
    // Format batches concatenate in lex-id order of the source files:
    // primary (no suffix) → -descriptive → -fillblank.
    expect(cards[0].format).toBe("mcq");
    expect(cards[22].format).toBe("descriptive");
    expect(cards[37].format).toBe("fill_blank");
    // Card ids stay unique under the primary's chapter_id.
    const ids = new Set(cards.map((c) => c.id));
    expect(ids.size).toBe(55);
    // Spot-check the first MCQ has the structured fields the platform
    // expects (Priority/Difficulty shorthand, misconceptions).
    expect(cards[0].correct_answer.length).toBeGreaterThan(0);
    expect(cards[0].misconceptions.length).toBeGreaterThanOrEqual(2);
    expect(cards[0].priority).toBe("should");
    expect(cards[0].difficulty).toBe("foundational");
    // Every card has both Priority and Difficulty populated — no
    // defaults — across all three formats.
    for (const card of cards) {
      expect(["must", "should", "good"]).toContain(card.priority);
      expect(["foundational", "standard", "advanced"]).toContain(card.difficulty);
    }
    // Descriptive cards carry the self-grading checklist where authored.
    const checklistCards = descriptive.filter((c) => c.self_grading_checklist);
    expect(checklistCards.length).toBeGreaterThanOrEqual(10);
    // The first descriptive question's checklist references the
    // Green / Yellow / Red rubric structure.
    expect(descriptive[0].self_grading_checklist).toMatch(/Green answer/);
    expect(descriptive[0].self_grading_checklist).toMatch(/Yellow answer/);
    expect(descriptive[0].self_grading_checklist).toMatch(/Red answer/);
  });

  it("does not expose the extra (fill-blank) file under its own id", async () => {
    // Once merged, the suffix file's id is no longer routable —
    // there's exactly one URL per chapter regardless of how many
    // format files contribute to it.
    const { readChapterById } = await import("./fs");
    const m = await readChapterById("ch01-introduction-and-homeostasis-fillblank");
    expect(m).toBeNull();
  });
});

describe("formatToleranceForChapter", () => {
  it("returns null for not-applicable / categorical answers", () => {
    expect(formatToleranceForChapter("homeostasis", "not applicable")).toBeNull();
    expect(formatToleranceForChapter("two-thirds", "not applicable (categorical)")).toBeNull();
    expect(formatToleranceForChapter("60%", null)).toBeNull();
    expect(formatToleranceForChapter("60%", "")).toBeNull();
  });

  it("passes percent tolerances through unchanged", () => {
    expect(formatToleranceForChapter("5.6 L/min", "±5%")).toBe("±5%");
    expect(formatToleranceForChapter("60%", "5%")).toBe("±5%");
  });

  it("converts absolute tolerance to a percent of the canonical value", () => {
    // Q1: 60% ± 10pp → 16.67% of 60
    expect(formatToleranceForChapter("60%", "±10 percentage points")).toBe("±16.67%");
    // Q7: 7.4 ± 0.05 → 0.68% of 7.4
    expect(formatToleranceForChapter("7.4", "±0.05")).toBe("±0.68%");
    // Q9: 142 mmol/L ± 5 mmol/L → 3.52% of 142
    expect(formatToleranceForChapter("142 mmol/L", "±5 mmol/L")).toBe("±3.52%");
    // Q12: 37.0 °C ± 0.5 °C → 1.35% of 37
    expect(formatToleranceForChapter("37.0 °C", "±0.5 °C")).toBe("±1.35%");
    // Q18: −2 ± 0.5 → 25% of |−2|
    expect(formatToleranceForChapter("−2", "±0.5")).toBe("±25.00%");
  });

  it("returns null when neither value carries a usable number", () => {
    expect(formatToleranceForChapter("homeostasis", "±0.5")).toBeNull();
    expect(formatToleranceForChapter("60%", "loose")).toBeNull();
  });
});

describe("parseAuthorChapter — fill-blank conversion", () => {
  // Two-question fill-blank fixture, exercising:
  //   - canonical → **Correct answer:**
  //   - accepted variants (filter out exact canonical duplicate) → **Acceptable answers:**
  //   - absolute tolerance → percent
  //   - "not applicable" → no tolerance
  //   - Yellow conditions silently dropped
  //   - hints → ### Hint Ladder
  const RAW = `---
chapter: Chapter 1 — Test
part: Part I — Foundations of Physiology
status: draft
---

# Chapter 1 — Fill-in-the-Blank Questions

QUESTION 1
Type: recall
Bloom's level: remember
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Total body water is approximately ___ % of body weight.

Canonical answer: 60%

Accepted variants:
- 60%
- 60
- 0.6

Tolerance: ±10 percentage points (range 50–70%)

Yellow conditions:
- "value missing %" → "Right value, include the percent sign."

Explanation: About 60% of body weight is water [Guyton ch.1].

Hints:
1. The body is mostly water.
2. Above half but below three-quarters.

---

QUESTION 2
Type: recall
Bloom's level: remember
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: The dominant cation in the ECF is ___ .

Canonical answer: sodium (Na⁺)

Accepted variants:
- sodium
- Na+
- Na⁺

Tolerance: not applicable

Yellow conditions:
- "potassium" → "That is the ICF cation."

Explanation: ECF is sodium-rich [Guyton ch.1].

Hints:
1. The Na⁺/K⁺-ATPase pumps it out of cells.
`;

  it("emits Format: fill_blank and a Correct answer line from Canonical answer", () => {
    const m = parseChapter(RAW);
    expect(m.body).toContain("**Format:** fill_blank");
    expect(m.body).toContain("**Correct answer:** 60%");
    expect(m.body).toContain("**Correct answer:** sodium (Na⁺)");
  });

  it("emits Acceptable answers as quoted pipe-separated, deduping the canonical", () => {
    const m = parseChapter(RAW);
    // The canonical "60%" is duplicated in the variants list — it should
    // not reappear under Acceptable answers; only "60" and "0.6" remain.
    expect(m.body).toContain('**Acceptable answers:** "60" | "0.6"');
    // Q2: canonical "sodium (Na⁺)" is not literally in the variant list,
    // so all three variants survive.
    expect(m.body).toContain('**Acceptable answers:** "sodium" | "Na+" | "Na⁺"');
  });

  it("converts absolute tolerance to percent and omits Tolerance for not-applicable", () => {
    const m = parseChapter(RAW);
    expect(m.body).toContain("**Tolerance:** ±16.67%"); // Q1: 10pp on 60
    expect(m.body).not.toMatch(/Question 2[\s\S]*?\*\*Tolerance:\*\*/); // Q2 has none
  });

  it("strips Yellow conditions silently — algorithmic grader handles that band", () => {
    const m = parseChapter(RAW);
    expect(m.body).not.toContain("Yellow conditions");
    expect(m.body).not.toContain("missing %");
    expect(m.body).not.toContain("ICF cation");
  });

  it("end-to-end: extractCards produces fill-blank cards", () => {
    const m = parseChapter(RAW);
    const cards = extractCards(m);
    expect(cards).toHaveLength(2);
    expect(cards[0].format).toBe("fill_blank");
    expect(cards[0].correct_answer).toBe("60%");
    expect(cards[0].acceptable_answers).toEqual(["60", "0.6"]);
    expect(cards[0].tolerance_pct).toBeCloseTo(0.1667, 3);
    expect(cards[1].format).toBe("fill_blank");
    expect(cards[1].correct_answer).toBe("sodium (Na⁺)");
    expect(cards[1].tolerance_pct).toBeUndefined();
  });
});

describe("parseAuthorChapter — shipped fill-blank questions (post-merge)", () => {
  // Post-merge the fill-blank file is folded into the chapter's
  // primary Chapter, so the assertions target the primary id and
  // filter cards by format. If the chapter parser regresses, this
  // catches it on every CI run.
  it("contributes 18 fill-blank cards to the merged Chapter 1 Chapter", async () => {
    const { readChapterById } = await import("./fs");
    const m = await readChapterById("ch01-introduction-and-homeostasis");
    expect(m).not.toBeNull();
    if (!m) return;
    const cards = extractCards(m);
    const fillBlank = cards.filter((c) => c.format === "fill_blank");
    expect(fillBlank).toHaveLength(18);
    for (const card of fillBlank) {
      expect(card.correct_answer.length).toBeGreaterThan(0);
    }
    // The fill-blank batch's "Cannon coined homeostasis in __" recall
    // (originally Q13 in the file, now globally renumbered) carries
    // the corrected 1926 date in its stem. Find it by stem content
    // since the global index moved during merge.
    const homeostasisQ = fillBlank.find((c) => /Cannon coined the term/.test(c.stem));
    expect(homeostasisQ).toBeDefined();
    expect(homeostasisQ?.stem).toMatch(/1926/);
    expect(homeostasisQ?.stem).not.toMatch(/1929/);
  });
});

describe("filename hint overrides chapter-derived id", () => {
  // Without a filename hint, the chapter-title slug wins. With a
  // filename hint, that wins instead — this is what fs.ts does so the
  // URL slug always matches the on-disk filename.
  const RAW = `---
chapter: Chapter 1 — Introduction to Physiology and Homeostasis
part: Part I — Foundations of Physiology
status: draft
---

# Questions

QUESTION 1
Type: recall
Bloom's level: remember

Stem: Stem.

Correct answer: Answer.

Distractors:
- "Wrong" — Reveals misconception: foo.

Explanation: Why.

Hints:
1. Hint A.
`;

  it("falls back to the chapter-derived id when no hint is provided", () => {
    const m = parseChapter(RAW);
    expect(m.frontmatter.id).toBe("ch01-introduction-to-physiology-and-homeostasis");
  });

  it("uses the filename hint as the id when one is provided", () => {
    const m = parseChapter(RAW, "ch01-introduction-and-homeostasis");
    expect(m.frontmatter.id).toBe("ch01-introduction-and-homeostasis");
  });

  it("ignores a filename hint that isn't a valid kebab-case id", () => {
    // "Foo Bar" is not kebab-case — fall back to derived id rather
    // than producing a malformed Chapter id.
    const m = parseChapter(RAW, "Foo Bar");
    expect(m.frontmatter.id).toBe("ch01-introduction-to-physiology-and-homeostasis");
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
    const m = parseChapter(RAW);
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

describe("extractAuthorChapterTopics", () => {
  it("returns one entry per `## Pass N — TITLE` heading, with question counts", () => {
    const body = `# Chapter 1 — MCQs

(preamble)

---

## Pass 1 — The internal environment

QUESTION 1
Stem: foo

---

QUESTION 2
Stem: bar

---

## Pass 2 — Feedback architecture

QUESTION 3
Stem: baz

---

QUESTION 4
Stem: qux

---

QUESTION 5
Stem: quux
`;
    const topics = extractAuthorChapterTopics(body);
    expect(topics).toEqual([
      { title: "The internal environment", questionCount: 2 },
      { title: "Feedback architecture", questionCount: 3 },
    ]);
  });

  it("returns empty when the body has no pass headings", () => {
    const body = `# Questions

QUESTION 1
Stem: foo
`;
    expect(extractAuthorChapterTopics(body)).toEqual([]);
  });

  it("strips the `# Final Summary` tail before counting", () => {
    const body = `## Pass 1 — Topic A

QUESTION 1
Stem: foo

---

# Final Summary

## Pass 999 — should be ignored

QUESTION 999
`;
    const topics = extractAuthorChapterTopics(body);
    expect(topics).toEqual([{ title: "Topic A", questionCount: 1 }]);
  });

  it("accepts en-dash and ASCII hyphen in the heading separator", () => {
    const body = `## Pass 1 – En dash topic

QUESTION 1

---

## Pass 2 - ASCII hyphen topic

QUESTION 2
`;
    const topics = extractAuthorChapterTopics(body);
    expect(topics.map((t) => t.title)).toEqual(["En dash topic", "ASCII hyphen topic"]);
  });

  it("preserves order of first appearance for duplicate titles", () => {
    const body = `## Pass 1 — Repeat

QUESTION 1

---

## Pass 2 — Other

QUESTION 2

---

## Pass 3 — Repeat

QUESTION 3
`;
    const topics = extractAuthorChapterTopics(body);
    expect(topics).toEqual([
      { title: "Repeat", questionCount: 2 },
      { title: "Other", questionCount: 1 },
    ]);
  });

  it("plumbs through parseAuthorChapter on the topics field", () => {
    const fm = {
      chapter: "Chapter 1 — Introduction",
      part: "Part I — Foundations of Physiology",
      status: "draft" as const,
    };
    const body = `## Pass 1 — Internal environment

QUESTION 1
Type: recall
Bloom's level: remember
Difficulty: f
Priority: m

Stem: x?

Correct answer: y

Distractors:

- "a" — Plausible but does not reveal a specific misconception.
- "b" — Plausible but does not reveal a specific misconception.
- "c" — Plausible but does not reveal a specific misconception.

Explanation: e
`;
    const out = parseAuthorChapter(fm, body, "ch01-introduction");
    expect(out.topics).toEqual([{ title: "Internal environment", questionCount: 1 }]);
  });
});
