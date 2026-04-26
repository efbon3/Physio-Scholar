import { describe, expect, it } from "vitest";

import { extractFacts, FACT_INDEX_OFFSET } from "./facts";
import { parseMechanism } from "./loader";

const FRONTMATTER = `---
id: test-mech
title: Test Mechanism
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.1
exam_patterns:
  - mbbs
prerequisites: []
related_mechanisms: []
blooms_distribution:
  remember: 25
  understand: 25
  apply: 25
  analyze: 25
author: test
reviewer: pending
status: draft
version: "0.1"
published_date: 2026-04-26
last_reviewed: 2026-04-26
---

`;

describe("extractFacts", () => {
  it("returns [] when there is no Facts section", () => {
    const m = parseMechanism(`${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n`);
    expect(extractFacts(m)).toEqual([]);
  });

  it("extracts a single fact under each canonical category", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Facts\n\n## Definitions\n\n- **Preload**: end-diastolic volume.\n\n## Normal values\n\n- **Cardiac output**: 5 L/min.\n\n## Functions\n\n- **SA node**: sets heart rate.\n\n## Relations\n\n- **Stroke volume formula**: SV = EDV − ESV.\n\n## Associations\n\n- **S3**: rapid filling.\n\n## Classifications\n\n- **Types of shock**: distributive, hypovolemic, cardiogenic, obstructive.\n`,
    );
    const facts = extractFacts(m);
    expect(facts).toHaveLength(6);
    expect(facts.map((f) => f.category)).toEqual([
      "definition",
      "normal-value",
      "function",
      "relation",
      "association",
      "classification",
    ]);
    expect(facts[0].prompt).toBe("Preload");
    expect(facts[0].answer).toBe("end-diastolic volume.");
    expect(facts[1].prompt).toBe("Cardiac output");
    expect(facts[1].answer).toBe("5 L/min.");
  });

  it("assigns ids in the FACT_INDEX_OFFSET range so they don't collide with question ids", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Facts\n\n## Definitions\n\n- **First**: first answer.\n- **Second**: second answer.\n`,
    );
    const facts = extractFacts(m);
    expect(facts[0].index).toBe(FACT_INDEX_OFFSET + 1);
    expect(facts[1].index).toBe(FACT_INDEX_OFFSET + 2);
    expect(facts[0].id).toBe(`test-mech:${FACT_INDEX_OFFSET + 1}`);
  });

  it("ignores unrecognised category headings", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Facts\n\n## Random Heading\n\n- **Skipped**: should not parse.\n\n## Definitions\n\n- **Counted**: this one is parsed.\n`,
    );
    const facts = extractFacts(m);
    expect(facts).toHaveLength(1);
    expect(facts[0].prompt).toBe("Counted");
  });

  it("ignores malformed bullets (no bold prompt or no colon)", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Facts\n\n## Definitions\n\n- A plain bullet without prompt-bold.\n- **Has bold but no colon**\n- **Valid**: this one passes.\n`,
    );
    const facts = extractFacts(m);
    expect(facts).toHaveLength(1);
    expect(facts[0].prompt).toBe("Valid");
  });

  it("works on the real cardiac-cycle-phases mechanism (smoke test)", async () => {
    const { readMechanismById } = await import("./fs");
    const m = await readMechanismById("cardiac-cycle-phases");
    expect(m).not.toBeNull();
    if (!m) return;
    const facts = extractFacts(m);
    // The authored content has > 20 facts across all six categories.
    expect(facts.length).toBeGreaterThan(20);
    const categories = new Set(facts.map((f) => f.category));
    expect(categories).toContain("definition");
    expect(categories).toContain("normal-value");
    expect(categories).toContain("function");
    expect(categories).toContain("relation");
    expect(categories).toContain("association");
    expect(categories).toContain("classification");
  });
});
