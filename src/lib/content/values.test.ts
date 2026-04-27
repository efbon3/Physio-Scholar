import { describe, expect, it } from "vitest";

import { parseMechanism } from "./loader";
import { extractValues, VALUE_INDEX_OFFSET } from "./values";

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

describe("extractValues", () => {
  it("returns [] when there is no Values section", () => {
    const m = parseMechanism(`${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n`);
    expect(extractValues(m)).toEqual([]);
  });

  it("extracts each bullet as a Value", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Values\n\n- **Cardiac output**: 5 L/min.\n- **Stroke volume (SV)**: 70 mL (range 60–100 mL).\n- **Heart rate**: 75 bpm.\n`,
    );
    const values = extractValues(m);
    expect(values).toHaveLength(3);
    expect(values[0].prompt).toBe("Cardiac output");
    expect(values[0].answer).toBe("5 L/min.");
    expect(values[1].prompt).toBe("Stroke volume (SV)");
    expect(values[1].answer).toBe("70 mL (range 60–100 mL).");
  });

  it("assigns ids in the VALUE_INDEX_OFFSET range so they don't collide with question or fact ids", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Values\n\n- **First**: 1 unit.\n- **Second**: 2 units.\n`,
    );
    const values = extractValues(m);
    expect(values[0].index).toBe(VALUE_INDEX_OFFSET + 1);
    expect(values[1].index).toBe(VALUE_INDEX_OFFSET + 2);
    expect(values[0].id).toBe(`test-mech:${VALUE_INDEX_OFFSET + 1}`);
  });

  it("ignores malformed bullets (no bold prompt or no colon)", () => {
    const m = parseMechanism(
      `${FRONTMATTER}\n# Layer 1 — Core\n\nbody.\n\n# Values\n\n- A plain bullet.\n- **No colon**\n- **Valid**: 5 L/min.\n`,
    );
    const values = extractValues(m);
    expect(values).toHaveLength(1);
    expect(values[0].prompt).toBe("Valid");
  });

  // Smoke-test against a real shipped mechanism removed during the
  // two-zone redesign content reset. Re-introduce against the new
  // template mechanism once authored.
});
