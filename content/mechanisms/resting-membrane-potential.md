---
id: resting-membrane-potential
title: Resting Membrane Potential
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - cell-membrane-transport
related_mechanisms:
  - action-potential
  - nerve-impulse-propagation
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

**The resting potential is dominated by the K⁺ gradient because the
membrane is mostly K⁺-permeable at rest.** Pumps create the gradient;
selective channels translate it into voltage. The Goldman-Hodgkin-Katz
equation says any ion's contribution to membrane potential equals its
permeability × distance from its equilibrium potential. At rest, K⁺
permeability dominates, so the membrane sits near E_K (~−90 mV) but
slightly less negative (~−70 to −90 mV depending on cell type) because
small Na⁺ and Cl⁻ permeabilities pull it up.

## Clinical Hook

Hyperkalaemia (raised extracellular K⁺) shrinks the K⁺ gradient and
depolarises the resting potential. Mild depolarisation (toward −60 mV)
brings the cell closer to threshold and is initially excitable; severe
depolarisation (toward −50 mV) inactivates voltage-gated Na⁺ channels
and the cell becomes inexcitable — this is the mechanism of
hyperkalaemic muscle weakness and cardiac arrest. The treatment
(IV calcium) doesn't move K⁺ at all; it raises the threshold to
restore the gap.

# Questions

## Question 1

**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** What is the typical resting membrane potential of a mammalian neuron, and which ion's equilibrium potential does it most closely approximate?
**Correct answer:** Approximately −70 mV; closest to the K⁺ equilibrium potential (E*K ≈ −90 mV).
**Elaborative explanation:** Resting potential isn't \_equal* to E_K because the membrane has small but non-zero permeability to Na⁺ and Cl⁻; those ions pull the resting potential a few mV away from E_K toward their own equilibrium values. Skeletal muscle sits a touch more negative (~−90 mV) because its K⁺ dominance is even greater; cardiac pacemaker cells sit less negative (~−60 mV) because they actively leak Na⁺ via funny channels.

### Hint Ladder

1. Resting potential is in tens of mV negative.
2. Neuronal "−70 mV" is the textbook anchor.
3. The dominant permeability at rest determines the resting potential.

### Misconception Mappings

- Wrong answer: "+70 mV, near E_Na" → Misconception: confusing resting with peak action potential.
- Wrong answer: "−90 mV exactly equals E_K" → Misconception: forgetting the small Na⁺ leak that nudges the cell off pure E_K.
- Wrong answer: "0 mV at rest, dropping to negative during AP" → Misconception: inverting the resting/active relationship.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Two mechanisms maintain the resting membrane potential. Name them and explain the relative contribution of each.
**Correct answer:** (1) Concentration gradients of Na⁺ and K⁺ across the membrane (created by the Na⁺/K⁺-ATPase) acting through K⁺-selective leak channels — this contributes the bulk (~85%). (2) The electrogenicity of the Na⁺/K⁺ pump itself (3 Na⁺ out, 2 K⁺ in per ATP) — this adds a small (~5–10 mV) hyperpolarising contribution.
**Elaborative explanation:** Most of the resting potential is "diffusion potential" — K⁺ leaving the cell down its gradient builds negativity inside until electrical force balances. The pump adds a small extra hyperpolarisation by exporting net positive charge each cycle. That's why instantly stopping the pump only depolarises by ~5–10 mV initially; the larger drift only develops as the gradient itself dissipates over minutes.

### Hint Ladder

1. The first mechanism is the gradient acting through which kind of channel?
2. The second mechanism comes from the pump itself, not the gradient.
3. Each contributes differently in magnitude.

### Misconception Mappings

- Wrong answer: "Only the Na⁺/K⁺-ATPase contributes; gradients alone wouldn't generate voltage" → Misconception: forgetting that selective permeability + concentration gradient = diffusion potential.
- Wrong answer: "Only the K⁺ gradient matters; the pump is irrelevant for voltage" → Misconception: ignoring the pump's electrogenic contribution.
- Wrong answer: "Cl⁻ leak is the dominant resting current in neurons" → Misconception: K⁺ permeability dominates resting; Cl⁻ becomes more relevant in inhibitory currents.

## Question 3

**Type:** quantitative
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** At 37°C, intracellular K⁺ is 140 mM and extracellular K⁺ is 4 mM. What is the equilibrium potential for K⁺?
**Correct answer:** E_K = (61 mV / z) × log₁₀([K⁺]\_out / [K⁺]\_in) = 61 × log₁₀(4/140) ≈ 61 × (−1.54) ≈ −94 mV.
**Elaborative explanation:** The Nernst equation gives the potential at which the electrochemical gradient for an ion is zero (no net flux). For K⁺ (z = +1) at body temperature, ~94 mV inside-negative balances the outward concentration gradient. If extracellular K⁺ rises to 7 mM (mild hyperkalaemia), E_K shifts to ~−79 mV — depolarising the cell.

### Hint Ladder

1. The Nernst equation at 37°C with z = 1 has the constant 61 mV.
2. The log term is [out]/[in] for cations; the sign of the log determines the sign of E.
3. With [out] much smaller than [in], the log is negative.

### Misconception Mappings

- Wrong answer: "+94 mV — Nernst gives the equilibrium positive for cations leaving" → Misconception: sign confusion; for K⁺ leaving the cell, the inside becomes negative, giving negative E.
- Wrong answer: "−61 mV — using log of just one concentration" → Misconception: forgetting that the Nernst equation requires the ratio.
- Wrong answer: "−94 mV regardless of temperature" → Misconception: the 61 mV factor is for 37°C; at 25°C it would be ~58 mV.

## Question 4

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient develops severe hyperkalaemia (plasma K⁺ rises from 4 to 8 mM). Predict the effect on resting membrane potential and on the cell's threshold for action potential generation.
**Correct answer:** E*K shifts from ~−94 mV to ~−76 mV (i.e., less negative); the resting potential follows partway, depolarising by perhaps 10–15 mV. Initially the cell is \_closer* to threshold (more excitable). At more severe hyperkalaemia, prolonged depolarisation inactivates voltage-gated Na⁺ channels and the cell becomes _less_ excitable — eventually unable to fire at all.
**Elaborative explanation:** The biphasic response — initial hyperexcitability, then complete loss of excitability — is the textbook hyperkalaemia narrative and the reason both bradyarrhythmias and asystole are seen. Voltage-gated Na⁺ channels can only fire from a hyperpolarised state; they're "inactivated" when the cell is held depolarised. IV calcium therapy works by raising the threshold to compensate.

### Hint Ladder

1. Use the Nernst equation to calculate the new E_K with [K⁺]\_out = 8 mM.
2. The resting potential follows the K⁺ gradient.
3. There's a sweet spot of depolarisation that's exciting; beyond it, channels inactivate.

### Misconception Mappings

- Wrong answer: "Hyperpolarises the cell" → Misconception: assuming higher external K⁺ drives more outflow; in fact the gradient narrows.
- Wrong answer: "Cells are uniformly more excitable in hyperkalaemia" → Misconception: missing the inactivation phase at severe levels.
- Wrong answer: "Treatment is restoring K⁺ gradient first; calcium plays no role" → Misconception: in acute life-threatening hyperkalaemia, IV calcium is given first to stabilise the membrane while K⁺ is being driven back into cells.

## Question 5

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** Explain why the resting membrane potential is closer to E_K than to E_Na, given that both gradients are large.
**Correct answer:** At rest, the membrane has many open K⁺ leak channels but very few open Na⁺ channels. The resting permeability ratio P_K : P_Na is roughly 100:1 (or 50:1 by some sources). The Goldman-Hodgkin-Katz equation tells us that membrane potential is a permeability-weighted average of equilibrium potentials, so K⁺ dominates.
**Elaborative explanation:** The Goldman equation makes this quantitative: V_m = (RT/F) ln[(P_K[K⁺]\_out + P_Na[Na⁺]\_out + P_Cl[Cl⁻]\_in) / (P_K[K⁺]\_in + P_Na[Na⁺]\_in + P_Cl[Cl⁻]\_out)]. With P_K dominant, the equation collapses toward the Nernst equation for K⁺. During an action potential, P_Na transiently spikes 1000-fold, so the membrane swings up toward E_Na.

### Hint Ladder

1. What's the ratio of K⁺ permeability to Na⁺ permeability at rest?
2. The Goldman equation weights each ion by its permeability.
3. The dominant permeability dominates the voltage.

### Misconception Mappings

- Wrong answer: "Both equilibrium potentials are averaged equally" → Misconception: missing the permeability weighting.
- Wrong answer: "Na⁺ doesn't contribute at all to resting potential" → Misconception: small leak currents do exist; without them, V_m would equal E_K exactly.
- Wrong answer: "Cl⁻ is the dominant ion at rest in neurons" → Misconception: Cl⁻ contributes meaningfully but K⁺ remains dominant in most neurons.

## Question 6

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** advanced
**Stem:** Compare the resting membrane potentials of a skeletal muscle fibre, a typical neuron, a cardiac ventricular myocyte, and a smooth muscle cell. Why do they differ?
**Correct answer:** Skeletal muscle ~−90 mV, neuron ~−70 mV, ventricular myocyte ~−85 to −90 mV, smooth muscle ~−50 to −60 mV. The differences reflect the resting K⁺ permeability and the relative contribution of other ion currents — neurons have more Na⁺ leak, smooth muscle has tonic inward currents (Ca²⁺, non-selective cation), and pacemaker cells have funny channels.
**Elaborative explanation:** Cell types tune their resting potential to fit their function. Skeletal muscle needs a wide gap between resting and threshold to avoid spontaneous firing. Cardiac pacemaker cells deliberately drift up toward threshold via I_f. Smooth muscle's higher resting potential supports tonic Ca²⁺ entry and the latch-bridge contraction it favours.

### Hint Ladder

1. Different cells have different non-K⁺ leaks.
2. Cells that fire spontaneously (pacemakers) sit near threshold by design.
3. Cells that need precise threshold control sit far below it.

### Misconception Mappings

- Wrong answer: "All excitable cells sit at exactly −70 mV" → Misconception: textbook neuronal value applied universally.
- Wrong answer: "Smooth muscle has the most negative resting potential" → Misconception: in fact smooth muscle is among the least negative.
- Wrong answer: "Resting potential cannot vary by cell type because it's set by K⁺ alone" → Misconception: ignoring the role of other channels and tonic currents.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** A patient with familial periodic paralysis has episodic muscle weakness when serum K⁺ drops to ~2.5 mM. Why does hypokalaemia cause weakness if the resting potential should hyperpolarise?
**Correct answer:** Paradoxically, in some forms of hypokalaemic periodic paralysis, the muscle fibre depolarises rather than hyperpolarising. This occurs because at low extracellular K⁺, certain inward-rectifier K⁺ channels close (their conductance drops), and the membrane becomes dominated by other inward currents. The depolarised muscle inactivates voltage-gated Na⁺ channels and becomes inexcitable — flaccid weakness results.
**Elaborative explanation:** Naïve Nernst reasoning predicts hyperpolarisation in hypokalaemia (more negative E*K). Real cells have inward-rectifier K⁺ channels (Kir family) whose open probability \_requires* extracellular K⁺ — at very low [K⁺]\_out they close, dropping K⁺ permeability. With P_K reduced, the GHK equation gives more weight to small inward currents and the cell paradoxically depolarises. This is the molecular explanation for hypokalaemic periodic paralysis and a useful lesson in not relying on the Nernst equation alone.

### Hint Ladder

1. Naïve calculation predicts hyperpolarisation, but the patient is weak.
2. Some K⁺ channels need extracellular K⁺ to function.
3. Membrane potential follows the most permeable ion.

### Misconception Mappings

- Wrong answer: "The membrane hyperpolarises so much that it can't reach threshold" → Misconception: assuming hyperexcitable inability to fire — the actual pathology is depolarisation-induced inactivation.
- Wrong answer: "Low K⁺ raises the K⁺ gradient and triggers excessive firing" → Misconception: confusing periodic paralysis (loss of excitability) with hyperexcitability syndromes.
- Wrong answer: "Calcium influx fails because of the K⁺ change" → Misconception: the proximate problem is Na⁺ channel inactivation, not Ca²⁺.

# Facts

## Definitions

- **Resting membrane potential**: the steady-state voltage across the cell membrane in the absence of stimulation; conventionally measured inside relative to outside.
- **Equilibrium potential (Nernst potential)**: the membrane voltage at which the electrochemical gradient for a single ion is zero (no net flux).
- **Goldman-Hodgkin-Katz equation**: weighted average of ion equilibrium potentials by their permeabilities; gives the actual resting potential.
- **Diffusion potential**: voltage generated when ions move across a selectively permeable membrane down their concentration gradient.
- **Electrogenicity**: a transporter generates a net charge transfer per cycle (Na⁺/K⁺-ATPase is electrogenic; an electroneutral exchanger is not).

## Functions

- The resting potential is the platform on which excitable cells generate action potentials.
- It also drives secondary active transport — the Na⁺ gradient (set up by the pump) is the energy source for many co-transporters.

## Normal values

- **Neuron resting potential**: −60 to −70 mV.
- **Skeletal muscle resting potential**: −80 to −90 mV.
- **Cardiac ventricular myocyte resting potential**: −85 to −90 mV.
- **Cardiac pacemaker (SA node) resting potential**: −55 to −60 mV (drifts up).
- **Smooth muscle resting potential**: −50 to −60 mV.

## Relations

- E_K ≈ −90 mV; E_Na ≈ +60 mV; E_Ca ≈ +120 mV; E_Cl ≈ −70 mV (in neurons).
- Resting membrane potential is permeability-weighted average of these.
- The Na⁺/K⁺-ATPase contributes ~5–10 mV directly via electrogenicity.

# Values

- **Nernst constant at 37°C (z=1)**: 61 mV per decade.
- **Nernst constant at 25°C (z=1)**: 58 mV per decade.
- **E_K (typical neuron)**: ~−94 mV.
- **E_Na (typical neuron)**: +60 to +65 mV.
- **E_Ca**: +120 to +140 mV.
- **Resting P_K : P_Na ratio**: ~100:1 (some sources 50:1).
- **Pump-electrogenic contribution to V_m**: ~5–10 mV hyperpolarisation.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 5.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 6.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 4.
- AK Jain, _Textbook of Physiology_, 9th ed., General Physiology.
- Indu Khurana, _Textbook of Medical Physiology_, 2nd ed.
