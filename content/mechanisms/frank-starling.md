---
id: frank-starling
title: Frank-Starling Mechanism
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.5
  - PY-CV-1.6
exam_patterns:
  - mbbs
  - pre-pg
prerequisites: []
related_mechanisms: []
blooms_distribution:
  remember: 10
  understand: 30
  apply: 30
  analyze: 30
author: placeholder
reviewer: pending
status: draft
version: "0.1-placeholder"
published_date: 2026-04-24
last_reviewed: 2026-04-24
---

# Layer 1 — Core

**Stretch the heart muscle, get a stronger contraction.** Increased
end-diastolic volume raises stroke volume, beat by beat, without any
external signal. The heart matches output to the venous return it
receives.

## Clinical Hook

A failing right ventricle still climbs its own (flatter) Frank-Starling
curve. That residual climb is the clinical reserve before decompensation
becomes symptomatic.

# Layer 2 — Working Explanation

Preload determines end-diastolic sarcomere length. Length-tension
relationship: contractile tension rises with sarcomere length up to an
optimum of ~2.0–2.2 µm. Stroke volume tracks that tension, and so tracks
preload — provided ventricular filling, afterload, and contractility stay
constant.

## Key Variables

- **Preload** — volume of blood in ventricle at end of diastole
- **Sarcomere length** — passive stretch, set by preload
- **Stroke volume** — blood ejected per beat, rises with preload

## Common Exam Framings

Questions about heart failure compensation, athletic training response,
and acute volume loading typically lean on Frank-Starling as the
explanation mechanism.

# Layer 3 — Deep Dive

## Molecular Basis

Sarcomere length determines the fraction of myosin heads that can reach
actin. At rest length (1.8 µm) overlap is incomplete; at optimum
(2.0–2.2 µm) overlap is maximal; beyond ~2.4 µm the thin filaments
barely overlap and force drops.

## Mathematical Relationships

Stroke volume rises roughly linearly with end-diastolic volume across
the physiologic range, flattening as sarcomere length approaches the
descending limb of the length-tension curve.

## Misconceptions

- "Heart rate increases to match preload" — **no**, heart rate is
  baroreflex-mediated; Frank-Starling is purely beat-by-beat on stroke
  volume.
- "Increased contractility causes Frank-Starling response" — **no**,
  contractility (inotropy) shifts the whole curve; Frank-Starling is
  the movement along one curve in response to preload.

# Layer 4 — Clinical Integration

## Vignette 1

A 55-year-old post-MI patient presents with rising filling pressures but
only modest rise in cardiac output. The Frank-Starling curve for their
failing left ventricle is shifted rightward and downward — same preload
gives less stroke volume than a healthy heart.

## Pathophysiology

In decompensated heart failure, the ventricle operates on the descending
limb or plateau of the Frank-Starling curve. Additional preload
(volume overload) no longer raises output; it only raises filling
pressures and causes pulmonary congestion.

# Questions

## Question 1

**Type:** prediction
**Bloom's level:** apply
**Stem:** A healthy subject rapidly infused with 500 mL of normal saline
will demonstrate which beat-by-beat change in the cardiac output?
**Correct answer:** Stroke volume rises at a constant heart rate.
**Elaborative explanation:** Volume loading increases preload. The
Frank-Starling mechanism translates increased end-diastolic volume into
increased stroke volume without any neural signal. Heart rate changes
only via the baroreflex, which takes seconds to minutes and is a
separate pathway.

### Hint Ladder

1. What happens to the ventricle's end-diastolic volume?
2. What does the length-tension relationship predict for contractile force when the sarcomere stretches?
3. Which cardiac variable changes first — heart rate or stroke volume?

### Misconception Mappings

- Wrong answer: "Heart rate increases" → Misconception: conflating SV and HR responses to preload changes
- Wrong answer: "No change in cardiac output" → Misconception: assuming autoregulatory mechanisms fully compensate before any beat-level change

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th edition, Chapter 9.
- Author's teaching notes, Physiology Department.

---

> **Placeholder content.** This file exists to unblock Phase 2 B4 engineering. The real gold-standard Frank-Starling mechanism is authored separately per `docs/content_production_sop.md` and will replace this file before the pilot launches. Status flag `draft` + version suffix `-placeholder` make that explicit.
