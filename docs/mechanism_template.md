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
starting at 1 and incrementing by 1. The four bold labels (Type,
Bloom's level, Stem, Correct answer) and the **Elaborative
explanation:** label are required. The two `###` subheadings (Hint
Ladder, Misconception Mappings) are optional but recommended.

## Question 1
**Type:** comparison
**Bloom's level:** understand
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
**Type:** prediction
**Bloom's level:** apply
**Stem:** ...
**Correct answer:** ...
**Elaborative explanation:** ...

### Hint Ladder
1. ...
2. ...
3. ...

### Misconception Mappings
- Wrong answer: "..." -> Misconception: ...
- Wrong answer: "..." -> Misconception: ...
