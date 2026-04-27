---
id: body-fluid-compartments
title: Body Fluid Compartments
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites: []
related_mechanisms:
  - cell-membrane-transport
  - resting-membrane-potential
blooms_distribution:
  remember: 25
  understand: 30
  apply: 25
  analyze: 20
author: claude-draft
reviewer: pending
status: draft
version: "0.1-claude-draft"
published_date: 2026-04-26
last_reviewed: 2026-04-26
---

# Layer 1 — Core

**Total body water is partitioned by membranes, and each membrane is
selective for different solutes.** A 70-kg adult holds ~42 L of water:
two-thirds inside cells (intracellular fluid, ICF, ~28 L) and
one-third outside (extracellular fluid, ECF, ~14 L). The ECF splits
again by the capillary endothelium into plasma (~3 L) and interstitial
fluid (~11 L). Knowing which compartment a clinical disturbance lives
in tells you which solute is doing the work.

## Clinical Hook

Pure water loss (insensible losses, central diabetes insipidus) raises
plasma osmolality and drives water _out_ of cells — hyperosmolar
hypernatraemia is fundamentally an intracellular problem dressed up
in a serum sodium number. By contrast, isotonic saline loss (vomiting,
diarrhoea) depletes only the ECF; the cells stay full and the patient
shows volume signs (orthostasis, oliguria, tachycardia) before any
osmolality change.

# Questions

## Question 1

**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** In a healthy 70-kg adult, what fraction of body weight is total body water, and how is it divided between intracellular and extracellular compartments?
**Correct answer:** Total body water is approximately 60% of body weight (~42 L). Two-thirds (~28 L) is intracellular fluid; one-third (~14 L) is extracellular, of which ~3 L is plasma and ~11 L is interstitial fluid.
**Elaborative explanation:** The 60/40/20 rule (Guyton ch. 25): 60% of body weight is water, 40% is intracellular, 20% is extracellular — and within ECF the plasma:interstitial ratio is 1:3. Adipose tissue is ~10% water, so obesity lowers the body-water fraction; women and the elderly have lower percentages for the same reason. Newborns are 75–80% water.

### Hint Ladder

1. The "60/40/20" mnemonic in body-water physiology refers to a percentage of body weight.
2. Of total body water, the intracellular share is the larger fraction.
3. Within the ECF, plasma is the smaller of the two sub-compartments.

### Misconception Mappings

- Wrong answer: "50% of body weight, equally split between ICF and ECF" → Misconception: misremembering both the total fraction and the ICF-ECF split.
- Wrong answer: "70% of body weight, two-thirds extracellular" → Misconception: inverting the ICF:ECF ratio.
- Wrong answer: "60% of body weight, of which most is plasma" → Misconception: conflating ECF with plasma; plasma is only ~7% of total body water.

## Question 2

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient receives 1 L of 0.9% saline IV. Approximately how is this volume distributed across body fluid compartments at steady state?
**Correct answer:** All ~1 L stays in the ECF (~250 mL plasma, ~750 mL interstitial fluid). None enters the ICF, because 0.9% NaCl is iso-osmotic with ECF and Na⁺ does not freely cross the cell membrane.
**Elaborative explanation:** Distribution follows the membrane permeability of the infused solute. Isotonic saline cannot pull water into cells (no osmotic gradient) and Na⁺ is excluded from the ICF by the Na⁺/K⁺-ATPase, so the entire volume lives in the ECF and partitions between plasma and interstitium in the ECF's native 1:3 ratio.

### Hint Ladder

1. What's the tonicity of 0.9% NaCl relative to plasma?
2. Can sodium cross the cell membrane freely?
3. Within the ECF, plasma:interstitial fluid splits in what ratio?

### Misconception Mappings

- Wrong answer: "Equally distributed across ICF (~660 mL) and ECF (~330 mL)" → Misconception: assuming all infused fluid distributes by total body water proportions, regardless of solute.
- Wrong answer: "Entirely in plasma — 1 L of plasma volume expansion" → Misconception: forgetting the capillary is permeable to Na⁺ and water; only the cell membrane confines saline to the ECF.
- Wrong answer: "Entirely in the interstitium — none stays intravascular" → Misconception: ignoring Starling forces; equilibrium between plasma and interstitium is roughly 1:3, not 0:1.

## Question 3

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient receives 1 L of 5% dextrose in water (D5W) IV, which is metabolised to leave 1 L of free water. Approximately how is this volume distributed at steady state?
**Correct answer:** It distributes across total body water in proportion to compartment volumes. Roughly 670 mL enters the ICF and 330 mL enters the ECF (of which ~80 mL is plasma, ~250 mL interstitial).
**Elaborative explanation:** Once the dextrose is taken up and metabolised, what's infused is effectively water. Pure water crosses every membrane freely and equilibrates by total body water (the 2/3 : 1/3 rule). This is why D5W is a poor volume expander but useful for correcting hypernatraemia — most of it goes intracellular.

### Hint Ladder

1. What's left after dextrose is metabolised?
2. Free water distributes across which compartments?
3. The ICF holds what fraction of total body water?

### Misconception Mappings

- Wrong answer: "All ~1 L stays in the ECF" → Misconception: confusing D5W with normal saline; only saline (because of Na⁺ exclusion) confines to the ECF.
- Wrong answer: "All ~1 L enters the ICF" → Misconception: ignoring the ECF's share of total body water.
- Wrong answer: "Distributes equally — 500 mL each" → Misconception: forgetting that the ICF is twice as large as the ECF.

## Question 4

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** What is the principal cation and the principal anion of intracellular fluid, and what maintains the gradient between ICF and ECF?
**Correct answer:** The principal intracellular cation is K⁺ (~140 mEq/L) and the principal intracellular anion is organic phosphate / protein. The Na⁺/K⁺-ATPase, pumping 3 Na⁺ out and 2 K⁺ in per ATP, maintains the gradient against passive leak.
**Elaborative explanation:** The ECF is an Na⁺-rich, Cl⁻-rich solution; the ICF is a K⁺-rich, organic-anion-rich solution. This compositional asymmetry — created and sustained by the Na⁺/K⁺ pump — is the foundation of the resting membrane potential, secondary active transport, and the cell's osmotic stability.

### Hint Ladder

1. Which cation is concentrated inside cells?
2. The 3:2 stoichiometry of which membrane pump determines this distribution?
3. Inside the cell, the major anion is not chloride.

### Misconception Mappings

- Wrong answer: "Na⁺ and Cl⁻ are the major intracellular ions" → Misconception: confusing ECF composition with ICF composition.
- Wrong answer: "K⁺ and Cl⁻ are the major intracellular ions" → Misconception: correct cation, wrong anion; intracellular Cl⁻ is low (~4 mEq/L) because of its negative-inside electrical equilibrium.
- Wrong answer: "K⁺ and HCO₃⁻ are the major intracellular ions" → Misconception: bicarbonate exists intracellularly but is a buffer, not the principal anion; phosphate / protein dominates.

## Question 5

**Type:** quantitative
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** Plasma osmolality is reported as 295 mOsm/kg. Estimate it from a metabolic panel showing Na⁺ 140 mEq/L, glucose 90 mg/dL, BUN 14 mg/dL.
**Correct answer:** Calculated osmolality ≈ 2 × Na + glucose/18 + BUN/2.8 = 280 + 5 + 5 = 290 mOsm/kg. The osmolar gap (measured – calculated = 5) is within the normal ≤10 mOsm/kg.
**Elaborative explanation:** Plasma osmolality is dominated by sodium and its accompanying anions (×2 for the doublet), with smaller contributions from glucose and urea. The osmolar gap detects unmeasured osmoles — relevant in toxic alcohol ingestion (methanol, ethylene glycol), where the gap widens before any acid-base abnormality.

### Hint Ladder

1. The Na⁺ contribution is doubled — why?
2. Glucose is divided by 18 because mg/dL → mmol/L conversion needs the molecular weight.
3. BUN is divided by 2.8 because urea is reported as nitrogen, not whole molecule.

### Misconception Mappings

- Wrong answer: "Just 2 × Na = 280 mOsm/kg" → Misconception: forgetting glucose and urea contributions.
- Wrong answer: "Na + glucose/18 + BUN/2.8 = 150 mOsm/kg" → Misconception: not doubling sodium to account for paired anions.
- Wrong answer: "Calculated osmolality is always exactly the measured value" → Misconception: dismissing the diagnostic value of the osmolar gap.

## Question 6

**Type:** integration
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** A marathon runner finishes the race and presents with confusion. Plasma sodium is 122 mEq/L, plasma osmolality is 250 mOsm/kg. They drank water freely throughout. What is the underlying disturbance, which compartment expanded, and which compartment shrank?
**Correct answer:** Hypotonic hyponatraemia from excess free water intake (exercise-associated hyponatraemia). The hypotonic ECF drove water osmotically into the ICF, expanding cells — including brain — and producing cerebral oedema. The ECF compartment is variably affected (depends on losses), but the dangerous effect is ICF expansion.
**Elaborative explanation:** Sweat is hypotonic relative to plasma; replacing sodium-poor sweat losses with sodium-free water ends up diluting the ECF. Because the cell membrane is freely permeable to water but not to sodium, the gradient drives water into cells. Brain cells inside the rigid skull cannot accommodate the volume, producing the characteristic confusion → seizure → herniation cascade.

### Hint Ladder

1. What is the tonicity of sweat relative to plasma?
2. Drinking water without electrolytes corrects volume but not what?
3. When ECF is hypotonic, water moves which way across the cell membrane?

### Misconception Mappings

- Wrong answer: "Hypotonic ECF, ICF unchanged" → Misconception: forgetting that the cell membrane permits water flux; ICF must change when ECF tonicity changes.
- Wrong answer: "ICF and ECF both shrink" → Misconception: imagining dehydration; the patient over-drank water, so ICF actually expands.
- Wrong answer: "Sodium loss is the primary mechanism" → Misconception: free-water excess (gain) explains this case better than salt loss alone — the patient drank too much water, not necessarily lost too much salt.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** A 60-year-old with cirrhosis has total body water 50 L, ECF 25 L, plasma volume 4 L, BP 90/60, urine output 200 mL/day. Decode the paradox: total body water is high, yet the patient is "intravascularly depleted."
**Correct answer:** Cirrhosis splanchnic vasodilation lowers effective circulating volume despite expanded total body water. Reduced renal perfusion triggers RAAS and ADH, retaining Na⁺ and water — but most of the retained fluid leaks into the interstitium (ascites, oedema) rather than refilling the intravascular compartment. ECF is expanded; plasma volume is functionally low.
**Elaborative explanation:** Body fluid compartments are not directly measurable — what the kidney senses is "effective" arterial blood volume, which depends on cardiac output and vascular tone, not just absolute plasma volume. In cirrhosis (and cardiac failure, nephrotic syndrome), the effective volume is sensed as low even when total ECF is expanded, driving relentless Na⁺ retention. The treatment paradox follows: diuresis can correct the oedema but worsen the renal perfusion if pushed too hard.

### Hint Ladder

1. What is "effective" circulating volume, and how does it differ from absolute volume?
2. Where does the retained fluid actually accumulate in cirrhosis?
3. Why is the kidney sensing low-flow despite an expanded ECF?

### Misconception Mappings

- Wrong answer: "Total body water and effective volume always move together" → Misconception: assuming a single number captures volume status.
- Wrong answer: "Plasma volume must be high if ECF is high" → Misconception: ignoring third-spacing into ascites/oedema.
- Wrong answer: "Diuretics will fix this immediately and safely" → Misconception: under-appreciating the risk of pushing effective volume even lower.

# Facts

## Definitions

- **Intracellular fluid (ICF)**: fluid contained within cell membranes; ~28 L in a 70-kg adult, ~2/3 of total body water.
- **Extracellular fluid (ECF)**: fluid outside cell membranes; ~14 L, comprising plasma + interstitial fluid + transcellular fluid.
- **Plasma**: the intravascular component of ECF; ~3 L in adults; bounded by capillary endothelium.
- **Interstitial fluid**: fluid in tissue spaces between cells, outside the vasculature; ~11 L.
- **Transcellular fluid**: a small specialised ECF subset (CSF, intraocular, synovial, peritoneal, GI lumen) — ~1 L total, often grouped with interstitial.
- **Osmolality**: solute concentration per kg of solvent (mOsm/kg H₂O); the property cells sense.
- **Tonicity**: the _effective_ osmolality — only solutes that don't cross the cell membrane count (Na⁺ does, urea and glucose at steady state largely don't).

## Normal values

- **Total body water (adult)**: 50–60% of body weight (lower in females, obese, elderly).
- **Plasma osmolality**: 280–295 mOsm/kg.
- **Plasma Na⁺**: 135–145 mEq/L; intracellular Na⁺: ~10–14 mEq/L.
- **Plasma K⁺**: 3.5–5.0 mEq/L; intracellular K⁺: ~140 mEq/L.
- **Plasma volume in a 70-kg adult**: ~3 L; total blood volume: ~5 L.

## Functions

- The ICF holds the substrates and machinery of metabolism (enzymes, ribosomes, organelles).
- The ECF delivers oxygen, nutrients, and signals to cells and removes waste.
- Plasma is the transport medium connecting capillary beds across organs.
- Transcellular fluid serves specialised mechanical / lubrication / sensory roles.

## Relations

- **ICF : ECF ratio**: ~2:1 of total body water.
- **Plasma : interstitial ratio (ECF)**: ~1:3, set by Starling forces.
- **Osmolality is equal across all compartments** at steady state — water moves until the gradient is gone.

# Values

- **Total body water in a 70-kg adult**: 42 L (60% of body weight).
- **ICF volume**: 28 L (~40% of body weight).
- **ECF volume**: 14 L (~20% of body weight).
- **Plasma volume**: ~3 L.
- **Interstitial volume**: ~11 L.
- **Total blood volume**: ~5 L (plasma + cellular elements).
- **Normal plasma osmolality**: 280–295 mOsm/kg.
- **Normal osmolar gap**: ≤10 mOsm/kg.
- **Plasma Na⁺**: 135–145 mEq/L.
- **Plasma K⁺**: 3.5–5.0 mEq/L.
- **Intracellular K⁺**: ~140 mEq/L.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 25.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 5.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 1.
- AK Jain, _Textbook of Physiology_, 9th ed., Section I.
- Indu Khurana, _Textbook of Medical Physiology_, 2nd ed., General Physiology.
