---
id: cell-membrane-transport
title: Cell Membrane Transport
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - body-fluid-compartments
related_mechanisms:
  - resting-membrane-potential
  - action-potential
blooms_distribution:
  remember: 30
  understand: 30
  apply: 25
  analyze: 15
author: claude-draft
reviewer: pending
status: draft
version: "0.1-claude-draft"
published_date: 2026-04-26
last_reviewed: 2026-04-26
---

# Layer 1 — Core

**Solutes cross the membrane along three axes: with their gradient, against
it, or coupled to a different solute that does the work.** Simple diffusion
needs no protein, just lipid solubility. Facilitated diffusion uses a
channel or carrier but still flows downhill. Active transport — primary
(direct ATP) or secondary (gradient-coupled) — pushes solutes uphill.
Every clinical electrolyte disturbance is a perturbation of one of these
three modes.

## Clinical Hook

Digoxin inhibits Na⁺/K⁺-ATPase. The immediate consequence is that the
Na⁺ gradient — which the Na⁺/Ca²⁺ exchanger relies on for secondary
active export of calcium — collapses partially. Intracellular Ca²⁺
rises, contractility increases (the therapeutic effect), but at toxic
doses the same mechanism produces arrhythmias because every ion
gradient downstream of Na⁺ also fails.

# Questions

## Question 1

**Type:** classification
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** Which of the following is an example of secondary active transport?
**Correct answer:** The Na⁺/glucose co-transporter (SGLT1) in the small intestine, which couples downhill Na⁺ entry to uphill glucose entry.
**Elaborative explanation:** Secondary active transport doesn't hydrolyse ATP itself; it borrows the energy stored in another ion's gradient (here, the Na⁺ gradient maintained by the Na⁺/K⁺-ATPase elsewhere on the cell). It's "active" because one of the solutes is moving uphill, but "secondary" because the ATP cost is paid indirectly.

### Hint Ladder

1. Does the transporter directly hydrolyse ATP?
2. Is at least one solute moving against its concentration gradient?
3. Is another solute moving down its gradient to power the move?

### Misconception Mappings

- Wrong answer: "Na⁺/K⁺-ATPase" → Misconception: confusing primary (ATP-direct) with secondary (gradient-coupled) active transport.
- Wrong answer: "Glucose uptake by GLUT2 in hepatocytes" → Misconception: this is facilitated diffusion (downhill, no coupling); no transport against a gradient occurs.
- Wrong answer: "O₂ entering the alveolus" → Misconception: confusing simple diffusion with active transport; O₂ requires no protein.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** What is the stoichiometry and electrogenicity of the Na⁺/K⁺-ATPase, and why does it matter?
**Correct answer:** It pumps 3 Na⁺ out and 2 K⁺ in per ATP, producing a net export of one positive charge per cycle. This electrogenicity contributes a small (~5–10 mV) hyperpolarising component to the resting membrane potential, beyond the ionic gradient component.
**Elaborative explanation:** Beyond establishing the Na⁺ and K⁺ gradients (which are themselves the dominant determinants of resting potential), the pump's 3:2 stoichiometry directly hyperpolarises the cell because more positive charge leaves than enters. Inhibiting the pump therefore depolarises slightly even before gradient changes have time to develop.

### Hint Ladder

1. Per ATP, how many Na⁺ ions leave and how many K⁺ ions enter?
2. Are equal numbers of positive charges moving in each direction?
3. The net flux is one charge per ATP — outward.

### Misconception Mappings

- Wrong answer: "2 Na⁺ out, 3 K⁺ in" → Misconception: inverting the stoichiometry; the pump favours net efflux, not influx.
- Wrong answer: "The pump is electroneutral" → Misconception: forgetting the 3:2 ratio is unequal.
- Wrong answer: "1 Na⁺ out, 1 K⁺ in" → Misconception: oversimplifying to a 1:1 antiporter.

## Question 3

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient is given ouabain, an inhibitor of Na⁺/K⁺-ATPase. Predict the immediate consequences for intracellular Na⁺, K⁺, Ca²⁺, and resting membrane potential.
**Correct answer:** Intracellular Na⁺ rises (less efflux); intracellular K⁺ falls (less influx); intracellular Ca²⁺ rises (Na⁺/Ca²⁺ exchanger reverses or slows because the Na⁺ gradient collapses); resting potential depolarises (loss of pump electrogenicity plus rising K⁺ outside / falling K⁺ inside narrows the K⁺ gradient).
**Elaborative explanation:** This is the cascade behind digitalis pharmacology and digitalis toxicity. The therapeutic gain is increased Ca²⁺ → enhanced contraction; the toxic risk is depolarisation-driven afterdepolarisations and arrhythmias. Every secondary active transporter that uses the Na⁺ gradient (Na⁺/H⁺, Na⁺/Ca²⁺, Na⁺/glucose, Na⁺/amino acid) is also affected.

### Hint Ladder

1. What does Na⁺/K⁺-ATPase do at baseline, and what fails when it stops?
2. Which secondary transporter handles cellular Ca²⁺ export?
3. The Na⁺ gradient is the energy source for many other transporters.

### Misconception Mappings

- Wrong answer: "Intracellular Ca²⁺ falls because the pump can no longer transport it" → Misconception: Na⁺/K⁺-ATPase doesn't transport Ca²⁺; the link is via NCX.
- Wrong answer: "Intracellular K⁺ rises because the cell can no longer expel it" → Misconception: the pump imports K⁺ — its inhibition reduces K⁺ influx.
- Wrong answer: "Resting potential hyperpolarises because the cell loses electrogenic export" → Misconception: losing the pump removes a hyperpolarising contribution; the cell depolarises slightly.

## Question 4

**Type:** classification
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** Differentiate facilitated diffusion from primary active transport.
**Correct answer:** Both use membrane proteins, but facilitated diffusion moves a solute _down_ its gradient and consumes no metabolic energy; primary active transport moves a solute _against_ its gradient by directly hydrolysing ATP.
**Elaborative explanation:** GLUT family transporters (GLUT1–4) facilitate downhill glucose entry; they saturate (Michaelis-Menten kinetics) but cannot concentrate glucose intracellularly above plasma. The Na⁺/K⁺-ATPase, by contrast, can hold cellular Na⁺ at ~12 mM despite a 140 mM extracellular concentration because it pays the energy cost directly.

### Hint Ladder

1. Can the transporter create a concentration gradient on its own?
2. Does ATP hydrolysis happen at the transporter itself?
3. The direction of net flux differs between the two.

### Misconception Mappings

- Wrong answer: "Facilitated diffusion can move solutes against their gradient if the carrier saturates" → Misconception: saturation kinetics ≠ uphill transport; a saturated carrier still only equilibrates.
- Wrong answer: "Primary active transport doesn't need a transporter protein" → Misconception: confusing active transport with simple diffusion of energetic species.
- Wrong answer: "Facilitated diffusion is faster than active transport because it has no kinetic constraints" → Misconception: facilitated diffusion still depends on transporter density and conformational rate; "facilitated" doesn't mean unrestricted.

## Question 5

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A red blood cell is placed in three solutions: (a) 0.9% NaCl, (b) distilled water, (c) 3% NaCl. What happens in each?
**Correct answer:** (a) No net change — isotonic. (b) Cell swells and lyses — hypotonic, water enters. (c) Cell crenates / shrinks — hypertonic, water exits.
**Elaborative explanation:** The RBC membrane is freely permeable to water but largely impermeable to Na⁺ and Cl⁻. Tonicity is the _effective_ osmotic gradient — it depends on solutes that don't cross the membrane. Water always moves to wherever solute is more concentrated, until the gradient (or the membrane) gives way.

### Hint Ladder

1. Is the cell membrane permeable to water? To NaCl?
2. Where does water move when the outside is hypotonic?
3. What's the structural consequence in each direction?

### Misconception Mappings

- Wrong answer: "(b) cell shrinks because there's no NaCl outside" → Misconception: misreading the direction of water flux; water moves toward higher solute concentration.
- Wrong answer: "(c) cell swells because of high outside solute" → Misconception: same reversal; water leaves a cell when outside is hypertonic.
- Wrong answer: "(a) cell shrinks because 0.9% saline is hypertonic" → Misconception: 0.9% NaCl is the canonical isotonic solution (~308 mOsm/L).

## Question 6

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** advanced
**Stem:** Why does the Donnan effect cause a small but persistent osmotic gradient across cell membranes despite the pump?
**Correct answer:** Cells contain non-diffusible, charged macromolecules (mainly proteins, organic phosphates) that hold onto counter-ions, creating an extra osmotic load inside the cell. Without continuous active transport (Na⁺/K⁺-ATPase), water would flow inward and the cell would swell.
**Elaborative explanation:** The Gibbs-Donnan equilibrium states that a non-diffusible charged species on one side of a semipermeable membrane will cause unequal distribution of diffusible ions — and an osmotic gradient. Because cells contain trapped polyanions, the pump's continuous ion export is what keeps the cell from osmotic swelling; in red cells this is sometimes called the "double-Donnan" or pump-leak balance.

### Hint Ladder

1. What's inside cells that can't leave?
2. Charged macromolecules attract which ions to maintain electroneutrality?
3. The cell is osmotically vulnerable even without external perturbation.

### Misconception Mappings

- Wrong answer: "Donnan equilibrium is irrelevant in living cells because membranes are dynamic" → Misconception: dismissing a real osmotic load that the pump must counter every second.
- Wrong answer: "The Donnan effect prevents osmotic swelling, not causes it" → Misconception: inverting cause and effect; the trapped charges are the cause.
- Wrong answer: "Donnan effects only matter in dialysis tubing experiments" → Misconception: assuming the principle is purely a teaching artefact.

## Question 7

**Type:** application
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** A 70-kg adult ingests a litre of pure water rapidly. Trace the osmotic effects on (a) gastric content, (b) plasma, (c) RBC volume, (d) brain cells over the next hour.
**Correct answer:** (a) Gastric content briefly hypotonic until rapid water absorption equilibrates with plasma. (b) Plasma osmolality drops slightly (~3–5 mOsm/kg). (c) RBC volume rises slightly as water enters; (d) Brain cells swell similarly — not enough to cause symptoms in a healthy person, but in a marathon runner or post-operative patient, the cumulative effect of free water excess can cause cerebral oedema.
**Elaborative explanation:** This is the principle behind exercise-associated hyponatraemia. Net free water gain dilutes the ECF; water then flows into the ICF along the osmotic gradient. Brain cells, encased in the rigid skull, suffer first when ICF expansion has nowhere to go.

### Hint Ladder

1. Pure water adds free water — to which compartment first?
2. Plasma osmolality dropping pushes water across cell membranes — which way?
3. Which organ is most osmotically vulnerable due to its container?

### Misconception Mappings

- Wrong answer: "Plasma osmolality rises because water dilutes Na⁺" → Misconception: misreading dilution; lower Na⁺ means lower osmolality.
- Wrong answer: "RBCs shrink because water is absorbed into plasma first" → Misconception: forgetting that plasma osmotic dilution drives water _into_ cells.
- Wrong answer: "Brain cells are protected because the BBB excludes water" → Misconception: water crosses the BBB freely; what's excluded is most large molecules and many ions.

# Facts

## Definitions

- **Simple diffusion**: solute movement across the lipid bilayer requiring no transporter protein, driven solely by the concentration gradient (and for charged solutes, the electrical gradient).
- **Facilitated diffusion**: solute movement through a transporter or channel, downhill along its gradient, no ATP needed.
- **Primary active transport**: solute movement against its gradient using direct ATP hydrolysis at the transporter (e.g., Na⁺/K⁺-ATPase, Ca²⁺-ATPase, H⁺/K⁺-ATPase).
- **Secondary active transport**: solute movement against its gradient powered by another solute's downhill gradient (e.g., SGLT, NCX, NHE).
- **Symport / co-transport**: secondary active transport where the two solutes move in the same direction.
- **Antiport / exchanger**: secondary active transport where the two solutes move in opposite directions.
- **Tonicity**: effective osmotic gradient — counts only solutes that cannot cross the membrane.

## Functions

- The Na⁺/K⁺-ATPase consumes ~25–30% of resting cellular ATP.
- Facilitated diffusion governs glucose entry into most cells (GLUT1–4) and urea movement (UT family).
- Secondary active transport handles glucose / amino-acid absorption in the gut and renal tubule (SGLT, B⁰AT family).
- Primary Ca²⁺-ATPase (PMCA, SERCA) and the Na⁺/Ca²⁺ exchanger together set cytosolic Ca²⁺ at ~100 nM despite ECF Ca²⁺ of ~1.2 mM.

## Normal values

- **Cellular ATP turnover for ion pumping**: ~25–30% of basal metabolic rate.
- **GLUT transporter Km values**: GLUT1 ~1 mM, GLUT2 ~17 mM, GLUT3 ~1.5 mM, GLUT4 ~5 mM.
- **Na⁺/K⁺-ATPase turnover**: ~100 cycles/sec per pump.

## Relations

- The Na⁺ gradient powers most secondary active transport in animal cells.
- The H⁺ gradient powers nutrient transport in plant and bacterial cells (a useful contrast).

## Classification

- **By energy source**: passive (simple, facilitated) vs active (primary, secondary).
- **By direction**: uniport, symport, antiport.
- **By substrate**: ion channels (Na⁺, K⁺, Ca²⁺, Cl⁻), aquaporins, GLUT family, ATPase pumps.

# Values

- **Na⁺/K⁺-ATPase stoichiometry**: 3 Na⁺ out / 2 K⁺ in / 1 ATP.
- **Cellular ATP cost of ion pumping**: ~25–30% basal metabolic rate.
- **Cytosolic Ca²⁺ at rest**: ~100 nM.
- **ECF Ca²⁺**: ~1.2 mM (free, ionised).
- **Pump-to-leak ratio for Na⁺ in resting neuron**: ~1 (pump rate matches passive leak).
- **Aquaporin water permeability**: ~3 × 10⁹ molecules/sec per channel.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 4.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 5.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 2.
- AK Jain, _Textbook of Physiology_, 9th ed., General Physiology section.
- GK Pal, _Textbook of Medical Physiology_, 4th ed., General Physiology.
