---
id: nerve-impulse-propagation
title: Nerve Impulse Propagation
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - action-potential
related_mechanisms:
  - synaptic-transmission
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

**Local current loops carry the depolarisation forward; refractoriness
keeps it from going backward.** In an unmyelinated axon, every patch
of membrane regenerates the AP, and conduction is slow but cheap. In a
myelinated axon, only the nodes of Ranvier regenerate the AP — the
internode is high-resistance and well-insulated, so current jumps
("saltates") from node to node, achieving 50–100× the conduction
velocity at a tiny fraction of the metabolic cost.

## Clinical Hook

Multiple sclerosis attacks myelin in the CNS; Guillain-Barré syndrome
attacks myelin in peripheral nerves. The result in both is dramatic
slowing of nerve conduction — measurable on nerve conduction studies as
prolonged latencies and reduced velocities. Numbness, weakness, and
visual loss (optic neuritis) are the clinical face of disrupted
saltatory conduction.

# Questions

## Question 1

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Explain how an action potential propagates along an unmyelinated axon.
**Correct answer:** A locally generated AP creates a depolarisation that spreads passively (electrotonically) to adjacent membrane via local current loops. When the adjacent patch reaches threshold, it generates its own AP; the wave continues. Refractoriness in the patch behind ensures unidirectional travel.
**Elaborative explanation:** Each patch must regenerate the AP because passive spread alone decays exponentially over a few millimetres. The continuous regeneration limits velocity to ~0.5–2 m/s in unmyelinated fibres. Conduction velocity scales roughly with the square root of axon diameter — bigger axons pass current more easily and propagate faster.

### Hint Ladder

1. Local depolarisation spreads to neighbouring membrane via what mechanism?
2. The neighbouring patch must reach threshold to fire.
3. Why doesn't the AP travel backward?

### Misconception Mappings

- Wrong answer: "Na⁺ ions themselves travel from one end of the axon to the other" → Misconception: ions move only locally; what travels is the wave.
- Wrong answer: "Bigger axons conduct more slowly because there's more membrane to depolarise" → Misconception: bigger axons conduct faster (lower internal resistance dominates).
- Wrong answer: "Myelin is required for any conduction at all" → Misconception: unmyelinated axons conduct, just more slowly.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** What is saltatory conduction, and why is it faster than continuous conduction?
**Correct answer:** Saltatory conduction is the propagation of an action potential by jumps from one node of Ranvier to the next, through internodal regions insulated by myelin. It's faster because: (1) myelin's high resistance and low capacitance let local current spread rapidly without dissipation, and (2) only the nodes (which carry concentrated voltage-gated Na⁺ channels) regenerate the AP, eliminating the rate-limiting step at every membrane patch.
**Elaborative explanation:** Conduction velocity in myelinated fibres ranges from 30 m/s (small Aδ pain fibres) to >100 m/s (large Aα motor fibres). The metabolic saving is enormous — only ~1% of the membrane needs to regenerate the AP, so total ion flux per AP is reduced by ~99%, and ATP demand falls correspondingly.

### Hint Ladder

1. Where are voltage-gated Na⁺ channels concentrated in myelinated axons?
2. What does myelin do to the cable properties of the internode?
3. The wave can travel passively where active regeneration isn't needed.

### Misconception Mappings

- Wrong answer: "Myelin actively pumps ions to speed conduction" → Misconception: myelin is passive insulation.
- Wrong answer: "Saltatory conduction means signals 'skip' over alternate axons" → Misconception: saltation is within one axon.
- Wrong answer: "All nerves conduct the same speed; myelin only protects" → Misconception: myelin is functional, not just protective.

## Question 3

**Type:** classification
**Bloom's level:** remember
**Priority:** must
**Difficulty:** standard
**Stem:** Match each fibre class with its diameter, conduction velocity, and major function: Aα, Aβ, Aγ, Aδ, B, C.
**Correct answer:** Aα (12–20 μm, 70–120 m/s) — primary motor and proprioception. Aβ (5–12 μm, 30–70 m/s) — touch, pressure. Aγ (3–6 μm, 15–30 m/s) — motor to muscle spindles. Aδ (2–5 μm, 12–30 m/s) — fast pain, cold, light touch. B (<3 μm, 3–15 m/s) — autonomic preganglionic. C (<1.5 μm, unmyelinated, 0.5–2 m/s) — slow pain, postganglionic autonomic, temperature.
**Elaborative explanation:** This Erlanger-Gasser classification is foundational. Differential block is medically useful: small fibres are blocked first by local anaesthetics (so pain goes before motor function), large fibres are blocked first by pressure (numb hand from leaning on a desk).

### Hint Ladder

1. Larger fibres are faster.
2. Myelin status matters too — C fibres are unmyelinated.
3. Modality maps somewhat predictably to size.

### Misconception Mappings

- Wrong answer: "C fibres are the fastest because they're the most modern" → Misconception: C fibres are slow because they're unmyelinated.
- Wrong answer: "All A fibres are identical in speed" → Misconception: A fibres span 12–120 m/s across subtypes.
- Wrong answer: "Pain fibres are always slow" → Misconception: Aδ fibres carry fast pain (the sharp first prickle); C fibres carry the slow burning ache.

## Question 4

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient with MS shows demyelinated lesions on MRI. Predict the effect on action potential propagation in the affected axons.
**Correct answer:** Demyelination converts saltatory conduction back toward continuous conduction in the affected segment. Conduction velocity drops dramatically (often by 50–90%); the AP may fail entirely if the bare segment is too long because passive spread alone cannot reach the next node. Conduction block produces motor and sensory deficits matching the affected pathway.
**Elaborative explanation:** The two outcomes — slowed conduction (latency prolongation) and complete conduction block (drop in amplitude) — are both visible on nerve conduction studies. In MS, optic neuritis often presents with afferent pupillary defect and central scotoma; multifocal demyelination produces relapsing-remitting weakness, sensory changes, ataxia.

### Hint Ladder

1. Without myelin, the internode behaves more like an unmyelinated axon.
2. Conduction velocity scales with what membrane property?
3. If the bare segment exceeds the space constant, the AP fails.

### Misconception Mappings

- Wrong answer: "Demyelinated axons conduct at normal speed if Na⁺ channels are intact" → Misconception: speed depends on the cable properties myelin provides, not just channels.
- Wrong answer: "Demyelination causes axon death immediately" → Misconception: axons survive demyelination for years; remyelination is possible.
- Wrong answer: "Demyelination affects only sensory nerves" → Misconception: motor function is also impacted.

## Question 5

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A pressure cuff is inflated on the upper arm, compressing the median nerve. Order the modalities lost: motor, light touch, pain, temperature.
**Correct answer:** Pressure block selectively affects large myelinated fibres first. Order of loss: light touch (Aβ) → motor (Aα/Aγ) → temperature (Aδ/C, which are smaller) → pain (Aδ/C). Recovery happens in reverse.
**Elaborative explanation:** This is the opposite of local-anaesthetic block. Pressure squeezes axons mechanically; large fibres are more vulnerable because their tightly packed myelin and sheer surface area concentrate the mechanical insult. Local anaesthetics, by contrast, diffuse from the outside and reach small fibres first because of higher surface-area-to-volume ratio.

### Hint Ladder

1. Pressure preferentially affects which fibre size?
2. Modality follows fibre size predictably.
3. The pattern is opposite to anaesthetic block.

### Misconception Mappings

- Wrong answer: "Pain is lost first because it's most sensitive" → Misconception: pain (small fibres) is the most resistant to pressure.
- Wrong answer: "Order is the same as for anaesthetic block" → Misconception: pressure and anaesthetic block produce opposite patterns.
- Wrong answer: "All fibres are blocked at once with sufficient pressure" → Misconception: blockade is graded with pressure level.

## Question 6

**Type:** quantitative
**Bloom's level:** apply
**Priority:** should
**Difficulty:** advanced
**Stem:** Why does conduction velocity in unmyelinated fibres scale with the square root of axon diameter, but in myelinated fibres scale linearly?
**Correct answer:** In unmyelinated fibres, velocity is governed by cable properties — internal resistance falls with cross-sectional area (∝d²) but membrane capacitance rises with circumference (∝d), giving net dependence on √d. In myelinated fibres, internodal length scales linearly with axon diameter (so the AP "skips" longer distances per node), and the dominant rate-limiting step shifts from cable propagation to nodal regeneration time, yielding linear scaling.
**Elaborative explanation:** This explains why nature uses myelination for fast conduction rather than just making axons larger. To match a 100 m/s myelinated fibre's velocity with an unmyelinated axon, you'd need a diameter of several centimetres (the giant squid axon's 0.5 mm diameter only achieves ~25 m/s).

### Hint Ladder

1. In unmyelinated axons, what's the rate-limiting electrical property?
2. In myelinated axons, what determines internodal length?
3. The two regimes have different scaling exponents.

### Misconception Mappings

- Wrong answer: "Both unmyelinated and myelinated scale linearly with diameter" → Misconception: ignoring the cable equation for unmyelinated.
- Wrong answer: "Velocity is independent of diameter — only myelin matters" → Misconception: diameter matters in both regimes.
- Wrong answer: "Bigger axons are always slower because of higher capacitance" → Misconception: capacitance per unit length scales but the resistance term dominates.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** A nerve conduction study shows normal amplitude but markedly prolonged latency in the median nerve of a patient with progressive weakness. What does this pattern suggest about the underlying pathology?
**Correct answer:** Prolonged latency with preserved amplitude suggests demyelination (conduction is slowed but the axons themselves are intact). If amplitude were also reduced, axonal loss would be inferred; if both, mixed pathology. Demyelinating neuropathies include CIDP, Guillain-Barré, hereditary CMT type 1, and acquired demyelinating polyneuropathies.
**Elaborative explanation:** The latency vs amplitude distinction is the cornerstone of clinical electrophysiology. Demyelinating processes (where axons survive but myelin fails) preserve the count of conducting axons (amplitude) while slowing the wave (latency). Axonal processes (toxic, ischaemic, traumatic) lose axons themselves, dropping amplitude.

### Hint Ladder

1. Latency reflects what about the AP?
2. Amplitude reflects what about the axon population?
3. Demyelination affects one but not the other.

### Misconception Mappings

- Wrong answer: "Both latency and amplitude must drop together for any pathology" → Misconception: missing the demyelination/axonal distinction.
- Wrong answer: "Prolonged latency means dead axons" → Misconception: dead axons don't conduct at all, so they wouldn't appear in latency.
- Wrong answer: "This pattern means motor neuron disease" → Misconception: motor neuron disease produces axonal loss, not demyelination.

# Facts

## Definitions

- **Saltatory conduction**: jumping propagation between nodes of Ranvier in myelinated axons.
- **Continuous conduction**: regeneration of AP at every membrane patch in unmyelinated axons.
- **Node of Ranvier**: 1-μm gap between myelin segments where voltage-gated Na⁺ channels are concentrated.
- **Internode**: myelin-wrapped axon segment between two nodes; ~1 mm long; high resistance, low capacitance.
- **Space (length) constant (λ)**: distance over which a depolarisation decays to 37% of its original value; longer in myelinated axons.
- **Time constant (τ)**: how quickly the membrane potential changes in response to current; shorter in myelinated axons.

## Functions

- Saltatory conduction enables high-velocity transmission with minimal metabolic cost.
- Differential conduction velocity allows the nervous system to encode urgency (fast pain vs slow pain).

## Normal values

- **Aα motor fibre velocity**: 70–120 m/s.
- **Aβ touch fibre velocity**: 30–70 m/s.
- **Aγ spindle motor velocity**: 15–30 m/s.
- **Aδ fast pain velocity**: 12–30 m/s.
- **B autonomic pre-ganglionic velocity**: 3–15 m/s.
- **C unmyelinated fibre velocity**: 0.5–2 m/s.

## Relations

- Conduction velocity (myelinated) ∝ axon diameter.
- Conduction velocity (unmyelinated) ∝ √(axon diameter).
- Internodal length ≈ 100 × axon diameter.

# Values

- **Internodal length**: ~1 mm (varies with axon diameter).
- **Node of Ranvier length**: ~1 μm.
- **Largest myelinated axon (motor)**: 12–20 μm diameter.
- **Smallest unmyelinated (C fibre)**: <1.5 μm.
- **Median nerve motor conduction velocity (normal)**: ≥50 m/s.
- **Median nerve sensory conduction velocity (normal)**: ≥50 m/s.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 5.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 7.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 4.
- AK Jain, _Textbook of Physiology_, 9th ed.
- Indu Khurana, _Textbook of Medical Physiology_, 2nd ed.
