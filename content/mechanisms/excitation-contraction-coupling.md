---
id: excitation-contraction-coupling
title: Excitation-Contraction Coupling
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - skeletal-muscle-contraction
related_mechanisms:
  - smooth-muscle-physiology
blooms_distribution:
  remember: 25
  understand: 35
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

**Surface AP → T-tubule depolarisation → DHP receptor (DHPR) →
Ryanodine receptor (RyR) → SR Ca²⁺ release → cross-bridge cycle.** In
skeletal muscle, the DHPR-RyR coupling is mechanical (direct protein-
protein); the AP itself is the signal. In cardiac muscle, the coupling
is chemical (Ca²⁺ entering via L-type DHPR triggers RyR — Ca²⁺-induced
Ca²⁺ release, CICR). In smooth muscle, IP₃ provides a second SR-release
pathway alongside CICR.

## Clinical Hook

Malignant hyperthermia: a mutation in RyR1 causes uncontrolled SR Ca²⁺
release when triggered by volatile anaesthetics or succinylcholine.
Sustained intracellular Ca²⁺ → continuous contraction, ATP depletion,
hyperthermia, rhabdomyolysis, acidosis. Treatment is dantrolene, which
blocks RyR1. The genetic test is the same as for central core disease,
which is the chronic, lower-penetrance manifestation of the same
mutations.

# Questions

## Question 1

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Trace the events from a muscle action potential at the surface membrane to the rise in intracellular Ca²⁺ in skeletal muscle.
**Correct answer:** (1) AP propagates along the sarcolemma. (2) AP enters T-tubules via passive spread (T-tubule = invagination of sarcolemma). (3) T-tubule depolarisation triggers conformational change in DHP receptors (voltage sensors). (4) DHPRs mechanically pull on RyRs (RyR1) in the SR membrane, opening them. (5) Ca²⁺ flows from SR to cytosol down its gradient.
**Elaborative explanation:** The DHPR-RyR coupling in skeletal muscle is direct mechanical — DHPRs and RyRs are physically aligned at "junctions" or "triads" (one T-tubule + two SR cisternae). No external Ca²⁺ entry is required for skeletal ECC, which is why it survives in Ca²⁺-free solution (briefly).

### Hint Ladder

1. Five steps; the AP must reach deep into the fibre.
2. Two protein partners — voltage sensor and SR channel.
3. The skeletal coupling is mechanical, not chemical.

### Misconception Mappings

- Wrong answer: "Ca²⁺ entry from outside the cell triggers SR release in skeletal muscle" → Misconception: that's cardiac CICR; skeletal coupling doesn't need extracellular Ca²⁺.
- Wrong answer: "DHPRs are on the SR; RyRs are on T-tubules" → Misconception: the locations are inverted; DHPRs are T-tubular, RyRs are SR.
- Wrong answer: "T-tubules are passive only and don't conduct APs" → Misconception: T-tubules carry AP into the fibre interior.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** How does cardiac excitation-contraction coupling differ from skeletal ECC?
**Correct answer:** Cardiac ECC uses Ca²⁺-induced Ca²⁺ release (CICR): the L-type Ca²⁺ channel (DHPR) opens during the AP plateau, allowing extracellular Ca²⁺ to enter; this Ca²⁺ binds RyR2 directly (not via mechanical coupling), triggering SR Ca²⁺ release. Skeletal ECC is mechanical coupling between DHPR and RyR1, requiring no extracellular Ca²⁺.
**Elaborative explanation:** This explains why cardiac contraction depends on extracellular Ca²⁺ (calcium channel blockers reduce contractility; hypocalcaemia weakens the heart) but skeletal contraction does not. Cardiac muscle also has a longer plateau because L-type Ca²⁺ channels stay open during it.

### Hint Ladder

1. Look at the role of extracellular Ca²⁺ in each.
2. Skeletal coupling is direct; cardiac is indirect.
3. The receptor isoforms are also different (RyR1 vs RyR2).

### Misconception Mappings

- Wrong answer: "Both use mechanical coupling" → Misconception: only skeletal does.
- Wrong answer: "Cardiac uses IP₃, not Ca²⁺" → Misconception: IP₃ has minor cardiac role; the dominant trigger is Ca²⁺.
- Wrong answer: "Skeletal needs extracellular Ca²⁺ for contraction" → Misconception: skeletal contracts even in Ca²⁺-free solution (briefly).

## Question 3

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** How is intracellular Ca²⁺ removed after a muscle twitch, and what determines the relaxation rate?
**Correct answer:** Two main routes: (1) SERCA (SR Ca²⁺-ATPase) pumps Ca²⁺ back into the SR, and (2) sarcolemmal Ca²⁺-ATPase (PMCA) and Na⁺/Ca²⁺ exchanger (NCX) export Ca²⁺ from the cytosol. SERCA dominates skeletal muscle relaxation; in cardiac muscle, both SERCA and NCX contribute. Relaxation rate is set by SERCA activity, which is regulated by phospholamban (cardiac).
**Elaborative explanation:** β-adrenergic stimulation phosphorylates phospholamban, releasing inhibition of SERCA, speeding cardiac relaxation (lusitropy) — that's how sympathetic stimulation enhances both contraction and relaxation. Failing hearts have reduced SERCA expression; gene therapy targeting SERCA is an active research area.

### Hint Ladder

1. Ca²⁺ has to leave the cytosol; two destinations are possible.
2. SR is the dominant store.
3. The pump rate determines relaxation speed.

### Misconception Mappings

- Wrong answer: "Ca²⁺ diffuses away passively after release" → Misconception: active pumping is essential.
- Wrong answer: "NCX operates only forward, importing Na⁺ and exporting Ca²⁺" → Misconception: NCX is reversible and direction depends on gradients (e.g., during digoxin toxicity it can run forward → exporting Na⁺ and importing Ca²⁺).
- Wrong answer: "Relaxation is purely passive in skeletal muscle" → Misconception: it requires SERCA activity, which is ATP-dependent.

## Question 4

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient on volatile anaesthetic develops sudden tachycardia, muscle rigidity, hyperthermia, and rising end-tidal CO₂. What is the diagnosis and the molecular mechanism?
**Correct answer:** Malignant hyperthermia. RyR1 mutation makes the SR Ca²⁺ release channel hypersensitive to triggers (volatile anaesthetics, succinylcholine). Sustained Ca²⁺ release → continuous cross-bridge cycling → ATP depletion → glycogen breakdown → heat and CO₂ production → muscle damage and rhabdomyolysis. Treatment: stop the trigger, dantrolene IV (RyR1 blocker), aggressive cooling and supportive care.
**Elaborative explanation:** Mortality without treatment >70%; with dantrolene <5%. Family history may include sudden anaesthetic deaths. Caffeine-halothane contracture testing on a muscle biopsy is the diagnostic gold standard. Same RYR1 mutations in lower penetrance produce central core disease.

### Hint Ladder

1. Persistent contraction means Ca²⁺ keeps coming.
2. The SR Ca²⁺ channel is the molecular target.
3. Dantrolene is the rescue drug.

### Misconception Mappings

- Wrong answer: "It's an allergic reaction to anaesthetic" → Misconception: it's a pharmacogenetic SR channel disorder.
- Wrong answer: "Treatment is more anaesthetic to stop muscle contraction" → Misconception: the trigger must be stopped, not increased.
- Wrong answer: "MH affects only smooth muscle" → Misconception: skeletal muscle is the target.

## Question 5

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** Describe the structure of the triad and dyad in skeletal vs cardiac muscle, and explain the functional consequence.
**Correct answer:** Skeletal muscle has _triads_: one T-tubule flanked by two SR terminal cisternae, located at the A-I junction in mammals. Cardiac muscle has _dyads_: one T-tubule with one SR cisterna, often at the Z-line. The wider spacing and CICR mechanism in cardiac muscle means signal transmission from T-tubule to SR is slightly slower than in skeletal — but this matches the slower cardiac AP and longer twitch.
**Elaborative explanation:** The triad/dyad nomenclature is from electron micrographs. Junctional proteins (junctophilin, junctin, calsequestrin, triadin) hold the structure together and modulate Ca²⁺ release. In cardiac dyads, the diffusion path for Ca²⁺ from L-type channel to RyR2 is just ~10 nm — that proximity is what makes CICR feasible.

### Hint Ladder

1. Skeletal has three components; cardiac has two.
2. Location along the sarcomere differs slightly.
3. Geometry constrains the speed of the response.

### Misconception Mappings

- Wrong answer: "Cardiac muscle has triads; skeletal has dyads" → Misconception: inverted.
- Wrong answer: "Both have triads; the only difference is the protein partners" → Misconception: cardiac has fewer SR cisternae per T-tubule contact.
- Wrong answer: "The location of triads/dyads is the same in both muscles" → Misconception: skeletal triads at A-I junction; cardiac dyads at Z-line in mammals.

## Question 6

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** advanced
**Stem:** A patient takes verapamil (a non-dihydropyridine calcium channel blocker). Predict the effect on cardiac contractility and skeletal muscle strength.
**Correct answer:** Cardiac contractility falls (negative inotropy) — L-type Ca²⁺ channels are blocked, reducing the trigger Ca²⁺ for CICR. Skeletal strength is unaffected because skeletal ECC doesn't depend on extracellular Ca²⁺ entry; the DHPR-RyR1 coupling is mechanical, not Ca²⁺-mediated.
**Elaborative explanation:** This is the molecular reason calcium channel blockers don't cause skeletal weakness even when cardiac contractility falls measurably. The same logic explains why hypocalcaemia primarily produces tetany (lowered Na⁺ channel threshold) rather than skeletal weakness.

### Hint Ladder

1. CCBs block L-type Ca²⁺ channels — same as DHPR.
2. Cardiac ECC needs extracellular Ca²⁺; skeletal ECC doesn't.
3. The two muscle types respond differently.

### Misconception Mappings

- Wrong answer: "CCBs weaken skeletal muscle equally with cardiac" → Misconception: skeletal is largely spared.
- Wrong answer: "CCBs increase cardiac contractility by acting on RyR" → Misconception: they act on L-type Ca²⁺ channels (DHPRs), not RyRs.
- Wrong answer: "Cardiac contractility is unaffected by CCBs" → Misconception: it's reduced; verapamil is contraindicated in heart failure for this reason.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** Explain why a muscle "twitch" is shorter than the AP that triggered it in cardiac muscle, but the AP is shorter than the twitch in skeletal muscle. What's the functional consequence?
**Correct answer:** Cardiac AP duration ~250–300 ms, contraction ~150–200 ms (AP outlasts much of the contraction). Skeletal AP duration ~2–5 ms, twitch ~30–100 ms (twitch outlasts the AP by far). Functional consequence: cardiac muscle cannot be tetanised because the long AP keeps the cell refractory throughout most of the contraction; skeletal muscle can be tetanised because rapid APs can pile up before the twitch ends.
**Elaborative explanation:** The cardiac plateau is precisely the design feature that prevents tetanus — essential because a tetanised heart wouldn't relax to fill. Skeletal tetanisability is essential for sustained postural and movement force. The two designs are evolutionary specialisations of the same machinery.

### Hint Ladder

1. AP duration vs twitch duration: are they similar or different?
2. Refractoriness depends on AP duration.
3. Tetanus needs new APs during the contraction.

### Misconception Mappings

- Wrong answer: "Cardiac AP and twitch are both ~5 ms long" → Misconception: cardiac AP is unusually long.
- Wrong answer: "Skeletal muscle can't be tetanised" → Misconception: tetanisation is the foundation of sustained force.
- Wrong answer: "Cardiac muscle is normally tetanised in physiology" → Misconception: cardiac refractory period prevents this.

# Facts

## Definitions

- **DHPR (dihydropyridine receptor)**: voltage-gated L-type Ca²⁺ channel in T-tubule membrane.
- **RyR (ryanodine receptor)**: Ca²⁺ release channel in SR membrane; RyR1 in skeletal, RyR2 in cardiac, RyR3 widespread.
- **SERCA**: SR/ER Ca²⁺-ATPase that pumps Ca²⁺ into the SR for re-uptake.
- **NCX (Na⁺/Ca²⁺ exchanger)**: 3 Na⁺ / 1 Ca²⁺ secondary active exchanger.
- **CICR**: Ca²⁺-induced Ca²⁺ release; the cardiac ECC mechanism.
- **Triad**: one T-tubule + two SR terminal cisternae (skeletal).
- **Dyad**: one T-tubule + one SR cisterna (cardiac).

## Functions

- DHPR-RyR coupling translates AP into Ca²⁺ release.
- SERCA maintains the SR Ca²⁺ store and drives relaxation.
- NCX exports excess Ca²⁺ from cardiac cells.

## Normal values

- **Resting cytosolic Ca²⁺**: ~100 nM.
- **Peak cytosolic Ca²⁺ during contraction**: ~1–10 μM.
- **SR Ca²⁺ concentration**: ~1 mM.
- **ECF Ca²⁺ (free, ionised)**: ~1.2 mM.

## Relations

- Skeletal ECC: voltage → mechanical → SR release (no extracellular Ca²⁺ needed).
- Cardiac ECC: voltage → Ca²⁺ entry → SR release (extracellular Ca²⁺ required).
- Smooth ECC: voltage and IP₃-triggered SR release (both contribute).

# Values

- **Resting cytosolic Ca²⁺**: ~100 nM (10⁻⁷ M).
- **Activated cytosolic Ca²⁺**: ~1–10 μM.
- **Ca²⁺ gradient across SR membrane**: ~10⁴-fold.
- **SERCA stoichiometry**: 2 Ca²⁺ in / 1 ATP.
- **NCX stoichiometry**: 3 Na⁺ in / 1 Ca²⁺ out.
- **PMCA stoichiometry**: 1 Ca²⁺ out / 1 ATP.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 6.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 9.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 5.
- AK Jain, _Textbook of Physiology_, 9th ed.
- GK Pal, _Textbook of Medical Physiology_, 4th ed.
