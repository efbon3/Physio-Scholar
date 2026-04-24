/**
 * Starter templates for the CMS editor.
 *
 * Gives authors a scaffolded markdown file to fill in rather than a
 * blank textarea. Values match the Zod schema in ./schema.ts exactly
 * so a freshly-templated file parses without modification.
 */

export const MECHANISM_TEMPLATE = `---
id: new-mechanism-id
title: New Mechanism
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.1
exam_patterns:
  - neet-pg
prerequisites: []
related_mechanisms: []
blooms_distribution:
  remember: 20
  understand: 30
  apply: 30
  analyze: 20
author: placeholder
reviewer: pending
status: draft
version: "0.1-draft"
published_date: 2026-04-24
last_reviewed: 2026-04-24
---

# Layer 1 — Core

Write one paragraph explaining the mechanism at its simplest. What it
is, and why it matters.

## Clinical Hook

One-sentence clinical resonance — why the student cares.

# Layer 2 — Working Explanation

Step-by-step breakdown. The mechanism as a sequence or system.

# Layer 3 — Deep Dive

Quantitative detail, curves, numbers, molecular basis, edge cases.

# Layer 4 — Clinical Integration

Vignettes, pathophysiology, common pitfalls, diagnostic implications.

# Questions

## Question 1

**Type:** recall
**Bloom's level:** understand
**Exam patterns:** mbbs, pre-pg
**Stem:** The question goes here.
**Correct answer:** The correct answer.
**Elaborative explanation:** Why this is correct, with mechanism detail.

### Hint Ladder

1. First hint (least revealing).
2. Second hint.
3. Third hint (most revealing).

### Misconception Mappings

- Wrong answer: "typical wrong answer" → Misconception: explanation of why this is a misunderstanding.

# Sources

- Guyton & Hall, 14th edition, Chapter X.
- Ganong's Review, 26th edition, Chapter Y.
`;
