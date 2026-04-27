---
# Required frontmatter — every field below is enforced at load time.
# Field order is informational; YAML keys can appear in any order.

# id: kebab-case (lowercase, digits, hyphens). Must equal the filename
# without `.md`. This is the slug, the inter-mechanism reference, and
# the prefix of every card id. Do not change after publishing.
id: example-mechanism

# title: human-readable, used in the UI everywhere.
title: Example Mechanism — Replace With Real Title

# organ_system: one of these eleven exact tokens. Anything else fails
# validation. Pick the most central system; cross-system topics go
# under whichever chapter you teach them in.
#   cardiovascular | respiratory | renal | gastrointestinal | endocrine
#   nervous | musculoskeletal | reproductive | blood | immune | integumentary
organ_system: cardiovascular

# nmc_competencies: one or more codes shaped XX-YY-N or XX-YY-N.N.
# The middle segment is the system code (CV, RS, etc.) — not the
# topic number alone. Examples: PY-CV-1.5, PY-RS-2, PY-NS-1.1.
nmc_competencies:
  - PY-CV-1.1

# exam_patterns: at least one of `mbbs` or `pre-pg`. These drive the
# exam-mode filters; cards inherit unless overridden per-question.
exam_patterns:
  - mbbs
  - pre-pg

# prerequisites: list of mechanism ids the learner should already have
# completed. Empty array is fine for foundational topics.
prerequisites: []

# related_mechanisms: cross-links shown on the mechanism page. Each
# entry must be the id of an actual mechanism file that exists today
# (not a placeholder for future content). Empty array if none.
related_mechanisms: []

# blooms_distribution: percentages per Bloom's level. All four keys
# are required and the four values must sum to exactly 100.
blooms_distribution:
  remember: 10
  understand: 30
  apply: 40
  analyze: 20

# author + reviewer: free-text strings. Use your name for author;
# reviewer can be `pending` until assigned.
author: Your Name
reviewer: pending

# status: draft | review | published | retired.
# A draft is fine to commit; only `published` ships to learners.
status: draft

# version: must be quoted so YAML treats it as a string.
version: "0.1"

# Dates: ISO format YYYY-MM-DD.
published_date: 2026-04-25
last_reviewed: 2026-04-25
---

# Layer 1 — Core (30 seconds)

One short paragraph: the irreducible take-home. A learner who reads only
this should walk away with the single sentence that makes the rest of the
mechanism click. **Bold** the load-bearing terms.

# Layer 2 — Working Explanation

The full mental model — typically 200–500 words. Use sub-paragraphs,
**bold for key terms**, and inline emphasis. Mention the canonical
control loop, the regulated variable, the sensor / integrator /
effector, and the feedback architecture. End with what changes when the
mechanism fails (clinical relevance).

You can have additional layers (Layer 3, Layer 4) if the topic genuinely
needs them; the parser doesn't require them. Layers above 2 are extra.

---

# Questions

Each question must use the exact heading shape `## Question N` with N
starting at 1 and incrementing by 1. The required labels are **Type**,
**Bloom's level**, **Stem**, **Correct answer**, and **Elaborative
explanation**. Every other label is optional and has a documented
default (see below).

The two-zone redesign introduces three new per-question fields:

- **Format** — how the question is rendered and graded.
  - `mcq` — four-option multiple choice; the system grades against the
    correct answer; misconception mappings drive distractor feedback.
  - `descriptive` — free-text answer; student self-rates Green / Yellow /
    Red against the model answer after a 5-second reveal delay.
  - `fill_blank` — short answer (value, term, or phrase); the system
    grades against `Acceptable answers` plus `Tolerance` and `Unit` for
    Green / Yellow / Red.
  Default when omitted: `descriptive`. Authors should declare format
  explicitly on every published question — implicit defaults are a
  legacy concession to pre-redesign content.

- **Status** — published or retired.
  - `published` — live in test sessions and contributing to SRS state.
  - `retired` — tombstoned. Stays in the file (with the heading and
    body intact) for audit and review history; excluded from new test
    sessions. See `content_production_sop.md` §6.3 for the cosmetic-vs-
    material edit ruleset that drives retirement.
  Default when omitted: `published`.

- **ID** — a stable per-question UUID intended to survive renumbering,
  mechanism file renames, and retire-and-replace flows. Optional during
  the transition from `{mechanism}:{index}` ids; once the SRS keys
  migrate to UUID this becomes the canonical id. When present, must be
  a valid UUID v4 (e.g. generated via `crypto.randomUUID()` or any
  UUID generator).

The six axes that always apply:

- **Priority** = how essential to mastery (`must` / `should` / `good`).
  Default: `should`.
- **Difficulty** = how hard to answer correctly (`foundational` /
  `standard` / `advanced`). Default: `standard`.
- Priority and difficulty are independent. A "must / advanced"
  question is legitimate — a foundational concept tested at high
  cognitive depth.

The two `###` subheadings (Hint Ladder, Misconception Mappings) are
optional but recommended. Misconception Mappings is the join key for
MCQ distractor coaching — every plausible wrong answer a student
might select should have a corresponding entry.

## Question 1
**ID:** 8f3c8e72-2a14-4c2c-8c8f-9e4a3b1d2c3a
**Format:** descriptive
**Status:** published
**Type:** comparison
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Write the question stem as one paragraph. It can include
numbers, units, and even Markdown like **bold** or `code` — the parser
captures everything up to the next `**Label:**` line or `###` heading.
**Correct answer:** The model answer. Same multi-line freedom as the stem.
**Elaborative explanation:** The "why" behind the answer — the
mechanism, the clinical relevance, the connection to other topics. This
is what surfaces on the post-reveal screen during a review session and
on the post-drill review screen during exam mode.

### Hint Ladder
1. First hint — gentlest. Reframes the question without giving the answer.
2. Second hint — narrower. Names the relevant mechanism or concept.
3. Third hint — most direct. Points at the load-bearing fact.

### Misconception Mappings
- Wrong answer: "literal text a learner might pick or write" -> Misconception: one-line explanation of why this is wrong and what mental model corrects it
- Wrong answer: "another plausible-sounding wrong answer" -> Misconception: the correction in one sentence

<!--
  Misconception line format is strict. The parser regex expects, on a
  single line:
    - Wrong answer: "..." -> Misconception: ...
  Either ASCII `->` or Unicode `→` is accepted as the separator.
  Both `Wrong answer:` and `Misconception:` labels are required, and
  the wrong-answer text must be wrapped in straight or curly quotes.
  Anything else and the parser silently produces zero misconceptions
  for the card — meaning learners get no distractor coaching.
-->

## Question 2
**ID:** 2c91f4d6-4f8e-4a2b-9d3a-1e8b6c5f2d4a
**Format:** mcq
**Status:** published
**Type:** prediction
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** Stem of an MCQ. Three of the misconception entries below
become the wrong-option distractors at render time, paired with the
correct answer; selecting a misconception-keyed wrong option fires the
matching feedback.
**Correct answer:** The single right option, written exactly as it
should appear.
**Elaborative explanation:** ...

### Misconception Mappings
- Wrong answer: "Distractor A" -> Misconception: ...
- Wrong answer: "Distractor B" -> Misconception: ...
- Wrong answer: "Distractor C" -> Misconception: ...

## Question 3
**ID:** a1b2c3d4-e5f6-4789-9abc-def012345678
**Format:** fill_blank
**Status:** published
**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** Stem with a blank to fill — typically a single value, term,
or short phrase. Phrasing examples: "Normal resting cardiac output is
approximately ____ L/min." or "The neurotransmitter at the
neuromuscular junction is ______."
**Correct answer:** The canonical answer — preferably the exact form a
graded student answer would match against first.
**Acceptable answers:** "primary form" | "alternative form 1" | "alternative form 2"
**Unit:** L/min
**Tolerance:** ±5%
**Elaborative explanation:** ...

<!--
  Acceptable answers, Unit, and Tolerance only apply when Format is
  fill_blank. The grader treats them like this:

    Green: student answer matches an Acceptable answer exactly (case-
           insensitive, whitespace-trimmed) OR — if numeric — falls
           within ±Tolerance of the Correct answer.
    Yellow: numerically close but on the wrong side of Tolerance, OR
            right value but wrong Unit.
    Red:    everything else.

  Quote each Acceptable answer separately with `"..."` and pipe-
  separate them. Quotes disambiguate values that themselves contain
  pipes ("|"). Bare `a | b | c` parses too, but quoting is the
  recommended form.
-->

## Question 4 [retired]
**ID:** retired-uuid-stays-the-same-here-90a
**Format:** mcq
**Status:** retired
**Type:** prediction
**Bloom's level:** apply
**Stem:** [Original stem stays in the file for audit history. The
question is no longer surfaced in test sessions because Status is
retired.]
**Correct answer:** [Original answer stays.]
**Elaborative explanation:** [Original explanation stays.]

<!--
  Retirement preserves all student review history against this UUID.
  See content_production_sop.md §6.3 — material edits (anything that
  changes what the question means) retire the existing question and
  add a new one with a fresh UUID, rather than editing in place. Never
  renumber surrounding questions to fill the gap.
-->
