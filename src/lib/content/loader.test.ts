import { describe, expect, it } from "vitest";

import { parseMechanism } from "./loader";

const FIXTURE = `---
id: frank-starling
title: Frank-Starling Mechanism
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.5
  - PY-CV-1.6
exam_patterns:
  - neet-pg
  - ini-cet
prerequisites:
  - cardiac-cycle
related_mechanisms:
  - cardiac-output-regulation
blooms_distribution:
  remember: 10
  understand: 30
  apply: 30
  analyze: 30
author: author-1
reviewer: pending
status: published
version: "1.0"
published_date: 2026-05-15
last_reviewed: 2026-05-15
---

# Layer 1 — Core

Stretch of cardiac muscle leads to a stronger contraction, so increased
preload raises stroke volume.

## Diagram
![Frank-Starling curve](../diagrams/frank-starling-curve.svg)

## Clinical Hook
A failing right ventricle still climbs its own, flatter, Frank-Starling
curve — the rise is the clinical reserve before decompensation.

# Layer 2 — Working Explanation

Preload determines end-diastolic sarcomere length; length-tension says
tension rises with length up to ~2.2 µm. Stroke volume tracks.

\`\`\`
# This is inside a fenced code block
# It should NOT split the document
\`\`\`

More Layer 2 content here.

# Layer 3 — Deep Dive

Myofilament overlap optimum at 2.0–2.2 µm…

# Layer 4 — Clinical Integration

A 45-year-old with acute MI…

# Questions

## Question 1
Stem text here.

# Sources

- Guyton & Hall, 14e, Ch. 9
`;

describe("parseMechanism", () => {
  it("parses a well-formed mechanism end to end", () => {
    const m = parseMechanism(FIXTURE);
    expect(m.frontmatter.id).toBe("frank-starling");
    expect(m.frontmatter.organ_system).toBe("cardiovascular");
    expect(m.frontmatter.nmc_competencies).toContain("PY-CV-1.5");
    expect(m.frontmatter.blooms_distribution.apply).toBe(30);
  });

  it("splits the body into the canonical layer sections", () => {
    const { layers } = parseMechanism(FIXTURE);
    expect(layers.core).toMatch(/stronger contraction/);
    expect(layers.working).toMatch(/length-tension/);
    expect(layers.deepDive).toMatch(/Myofilament overlap/);
    expect(layers.clinicalIntegration).toMatch(/45-year-old/);
    expect(layers.questions).toMatch(/Question 1/);
    expect(layers.sources).toMatch(/Guyton & Hall/);
  });

  it("does not split on `#` lines inside fenced code blocks", () => {
    const { layers } = parseMechanism(FIXTURE);
    // The `# This is inside a fenced code block` line should stay inside
    // Layer 2 — otherwise it would look like a new top-level section.
    expect(layers.working).toMatch(/inside a fenced code block/);
    // And the `More Layer 2 content` after the fence must still be in working.
    expect(layers.working).toMatch(/More Layer 2 content/);
  });

  it("preserves the entire body as a fallback reading surface", () => {
    const { body } = parseMechanism(FIXTURE);
    expect(body.length).toBeGreaterThan(200);
    expect(body).toMatch(/Layer 1 — Core/);
    expect(body).toMatch(/Sources/);
  });

  it("raises a ZodError when frontmatter is missing", () => {
    const bodyOnly = "# Layer 1 — Core\n\nNo frontmatter at all.";
    expect(() => parseMechanism(bodyOnly)).toThrow();
  });

  it("raises when blooms_distribution doesn't sum to 100", () => {
    const broken = FIXTURE.replace("apply: 30", "apply: 50");
    expect(() => parseMechanism(broken)).toThrow(/sum to 100/);
  });

  it("accepts en-dash and hyphen variants in layer headings", () => {
    // Em-dash (—) is SOP canonical; en-dash (–) appears on iOS/macOS keyboards
    // via autocorrect; ASCII hyphen (-) is what some authors will literally
    // type. All three must parse cleanly.
    const enDash = FIXTURE.replace("Layer 1 —", "Layer 1 –");
    const { layers } = parseMechanism(enDash);
    expect(layers.core).toMatch(/stronger contraction/);

    const asciiHyphen = FIXTURE.replace("Layer 2 —", "Layer 2 -");
    const { layers: l2 } = parseMechanism(asciiHyphen);
    expect(l2.working).toMatch(/length-tension/);
  });

  it("tracks fence state across multiple code blocks without losing sections", () => {
    const body = `---
id: multi-fence
title: Multi Fence
organ_system: cardiovascular
nmc_competencies: [PY-CV-1.1]
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

# Layer 1 — Core

First code block:

\`\`\`
# looks like a heading but isn't
\`\`\`

Regular paragraph.

\`\`\`python
# also not a heading
def f(): pass
\`\`\`

End of Layer 1.

# Layer 2 — Working

Layer 2 body.
`;
    const { layers } = parseMechanism(body);
    expect(layers.core).toMatch(/First code block/);
    expect(layers.core).toMatch(/Regular paragraph/);
    expect(layers.core).toMatch(/End of Layer 1/);
    expect(layers.working).toMatch(/Layer 2 body/);
    // The Layer 2 body must not accidentally contain Layer 1 content —
    // that would mean we lost track of the fence and split inside it.
    expect(layers.working).not.toMatch(/First code block/);
    expect(layers.working).not.toMatch(/End of Layer 1/);
  });

  it("leaves absent layers undefined instead of throwing", () => {
    const truncated = FIXTURE.split("# Layer 3")[0];
    const withFrontmatter = FIXTURE.slice(0, FIXTURE.indexOf("---\n\n")) + truncated;
    // Partial mechanisms (drafts) are allowed; missing sections => undefined.
    const { layers } = parseMechanism(withFrontmatter);
    expect(layers.core).toBeDefined();
    expect(layers.working).toBeDefined();
    // The slice wiped Layer 3 onward.
    expect(layers.deepDive).toBeUndefined();
    expect(layers.sources).toBeUndefined();
  });
});
