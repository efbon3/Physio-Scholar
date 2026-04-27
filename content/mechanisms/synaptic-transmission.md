---
id: synaptic-transmission
title: Synaptic Transmission
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - action-potential
related_mechanisms:
  - cell-signaling-second-messengers
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

**The presynaptic AP triggers Ca²⁺-dependent vesicle release; the
postsynaptic neurotransmitter receptors decide whether the signal is
excitatory, inhibitory, fast, or slow.** Ionotropic receptors open ion
channels in milliseconds (fast). Metabotropic receptors trigger
G-protein signalling cascades that work over seconds to minutes
(slow). Most CNS synapses are unreliable individually (release
probability often <0.5); it's the convergence of many synapses that
produces reliable computation.

## Clinical Hook

Selective serotonin reuptake inhibitors (SSRIs) block the serotonin
transporter (SERT) on the presynaptic terminal, prolonging the action
of released 5-HT in the cleft. Therapeutic benefit develops over
weeks — not because the drug needs time to bind, but because
downstream changes in receptor expression and gene transcription take
time. The lag between drug onset and clinical benefit is a recurring
theme in CNS pharmacology.

# Questions

## Question 1

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Compare ionotropic and metabotropic neurotransmitter receptors.
**Correct answer:** Ionotropic: ligand-gated ion channels; the receptor itself is the channel; response in milliseconds; mediates fast synaptic transmission (e.g., AMPA, NMDA, GABA-A, nicotinic). Metabotropic: G-protein-coupled; ligand binding activates an intracellular signalling cascade (cAMP, IP₃/DAG, etc.); response in seconds to minutes; mediates slow modulatory transmission (e.g., muscarinic, β-adrenergic, mGluR, GABA-B, dopamine, opioid).
**Elaborative explanation:** Most fast synaptic transmission in the CNS is glutamate (excitatory, ionotropic AMPA/NMDA) or GABA (inhibitory, ionotropic GABA-A). Modulatory systems (dopamine, serotonin, ACh, NE) are mostly metabotropic — they tune the gain of fast transmission rather than carry signals directly.

### Hint Ladder

1. Two classes of receptor.
2. One opens a channel directly; one starts a cascade.
3. Speed of effect differs by orders of magnitude.

### Misconception Mappings

- Wrong answer: "Ionotropic receptors only respond to ions, not neurotransmitters" → Misconception: ionotropic = ligand-gated ion channel.
- Wrong answer: "Metabotropic receptors are slower because the neurotransmitter binds slowly" → Misconception: the binding is fast; the cascade takes time.
- Wrong answer: "All receptors are either purely fast or purely slow" → Misconception: many neurotransmitters have both ionotropic and metabotropic receptor subtypes (e.g., glutamate, GABA, ACh).

## Question 2

**Type:** classification
**Bloom's level:** remember
**Priority:** must
**Difficulty:** standard
**Stem:** Name the major CNS neurotransmitters and classify each as primarily excitatory or inhibitory.
**Correct answer:** Excitatory: glutamate (~80% of fast excitation), aspartate. Inhibitory: GABA (most CNS inhibition above the spinal cord), glycine (most inhibition in spinal cord and brainstem). Modulatory (effect depends on receptor): dopamine, serotonin, noradrenaline, acetylcholine, histamine. Peptides: substance P, opioids, neuropeptide Y, oxytocin, etc. — also modulatory.
**Elaborative explanation:** This excitatory/inhibitory dichotomy maps cleanly onto disease: excessive excitation = seizure; deficit = stupor/sedation. GABA-A enhancers (benzodiazepines, barbiturates, alcohol) are the classic anticonvulsants and anxiolytics; glutamate antagonists (ketamine, memantine) have niche roles.

### Hint Ladder

1. Two amino acids dominate fast transmission.
2. One is excitatory, one is inhibitory.
3. Modulators tune the system but rarely drive it.

### Misconception Mappings

- Wrong answer: "Acetylcholine is the major excitatory neurotransmitter in the CNS" → Misconception: ACh is modulatory in CNS; glutamate is the major excitor.
- Wrong answer: "Dopamine is purely inhibitory" → Misconception: dopamine is modulatory; D1 is excitatory, D2 is inhibitory.
- Wrong answer: "Glycine is the major inhibitor in cortex" → Misconception: GABA is the cortical inhibitor; glycine dominates spinal cord.

## Question 3

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Describe the mechanism of inhibitory postsynaptic potentials (IPSPs) at GABAergic synapses, and how this maps to the action of benzodiazepines.
**Correct answer:** GABA binds GABA-A receptors (ionotropic Cl⁻ channels). Cl⁻ flows into the cell down its electrochemical gradient (E*Cl ~ −70 mV), holding membrane potential near rest. This makes the cell harder to depolarise to threshold — inhibition. Benzodiazepines bind a separate site on GABA-A and increase the \_frequency* of channel opening when GABA is also bound; they don't open the channel without GABA. Net effect: enhanced inhibition.
**Elaborative explanation:** Barbiturates bind a third site on the same receptor and increase channel _open duration_. Both classes potentiate GABA but via different molecular mechanisms — explaining why benzodiazepines have a higher therapeutic index. Alcohol acts at multiple sites including GABA-A, partly via a similar pathway.

### Hint Ladder

1. GABA-A is an ion channel — for which ion?
2. Cl⁻ entry hyperpolarises (or stabilises) the cell.
3. Benzos and barbiturates enhance the channel's response.

### Misconception Mappings

- Wrong answer: "GABA-A is a Ca²⁺ channel" → Misconception: it's a Cl⁻ channel.
- Wrong answer: "Benzodiazepines open the channel without GABA" → Misconception: they require GABA presence; that's why they're safer.
- Wrong answer: "Cl⁻ entry depolarises the cell" → Misconception: Cl⁻ entry usually hyperpolarises or stabilises (depends on E_Cl).

## Question 4

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** What is long-term potentiation (LTP), and what's the molecular basis at glutamatergic synapses?
**Correct answer:** LTP is a long-lasting (hours to weeks) increase in synaptic strength following high-frequency stimulation. At excitatory synapses: simultaneous presynaptic glutamate release and postsynaptic depolarisation activates NMDA receptors (which require both glutamate binding and depolarisation to expel a Mg²⁺ block). Ca²⁺ enters through NMDA, activates CaMKII and PKA, which phosphorylates AMPA receptors and inserts new ones — the synapse is now stronger.
**Elaborative explanation:** LTP is a candidate mechanism for memory at the synaptic level. The "Hebbian" requirement (pre and postsynaptic activity together) is the molecular basis of "neurons that fire together, wire together." NMDA antagonists (ketamine, MK-801) block LTP and impair learning in animal models.

### Hint Ladder

1. NMDA has two requirements for activation.
2. Ca²⁺ entry triggers downstream changes.
3. Long-term changes involve receptor trafficking.

### Misconception Mappings

- Wrong answer: "LTP requires only presynaptic activity" → Misconception: post-synaptic depolarisation is essential for NMDA Mg²⁺ unblock.
- Wrong answer: "LTP is mediated entirely by AMPA without NMDA" → Misconception: NMDA is the trigger; AMPA is the maintenance.
- Wrong answer: "LTP lasts only seconds" → Misconception: it persists for hours-weeks; long-term potentiation requires gene expression changes for the longest forms.

## Question 5

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A patient overdoses on heroin (an opioid agonist). Explain the mechanism of respiratory depression and the basis of naloxone treatment.
**Correct answer:** Heroin (a μ-opioid agonist) acts on μ-receptors in brainstem respiratory centres. μ-receptors are Gi-coupled — they hyperpolarise the cell (through K⁺ channel opening) and inhibit Ca²⁺ entry, reducing the drive to fire respiratory neurons. Naloxone is a competitive μ-receptor antagonist with higher affinity than heroin; it displaces heroin from receptors, restoring respiratory drive within seconds.
**Elaborative explanation:** Naloxone duration (~30 min) is shorter than heroin's, so re-narcotisation can occur — patients need observation. Newer opioids (fentanyl, carfentanil) are more potent and may need higher / repeated naloxone doses.

### Hint Ladder

1. Opioids inhibit neuronal firing.
2. The mechanism is via Gi-coupled receptors and K⁺/Ca²⁺ channels.
3. Naloxone is a competitive antagonist.

### Misconception Mappings

- Wrong answer: "μ-receptors are excitatory G-protein-coupled" → Misconception: they're inhibitory (Gi).
- Wrong answer: "Naloxone is an opioid receptor agonist" → Misconception: it's an antagonist.
- Wrong answer: "Naloxone lasts longer than fentanyl, so single-dose treatment is sufficient" → Misconception: re-narcotisation is a real risk.

## Question 6

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** advanced
**Stem:** What are temporal and spatial summation, and why are they essential for CNS computation?
**Correct answer:** Temporal summation: postsynaptic potentials from successive APs at one synapse add together if they overlap in time. Spatial summation: postsynaptic potentials from simultaneous APs at different synapses add together at the same neuron. Most central synapses are individually too weak (EPSP ~0.5–2 mV) to drive a postsynaptic AP alone; many synapses must converge in time and space to reach threshold (~15 mV).
**Elaborative explanation:** The neuron acts as a coincidence detector and integrator. Inhibitory inputs (IPSPs) subtract; excitatory inputs add; the net at the axon hillock determines whether an AP fires. Different cell types have different time constants, dendritic structures, and channel distributions — turning the same synaptic inputs into different computational outputs.

### Hint Ladder

1. One synapse is usually too weak; how do neurons fire?
2. Both time and location of inputs matter.
3. The integration happens at the axon hillock.

### Misconception Mappings

- Wrong answer: "A single EPSP normally fires the postsynaptic neuron in the CNS" → Misconception: most CNS synapses are weak; summation is needed.
- Wrong answer: "Spatial summation requires the inputs to be from the same source" → Misconception: it's location-based, not source-based.
- Wrong answer: "Temporal summation only occurs when APs are simultaneous" → Misconception: temporal summation works on overlapping but not simultaneous events.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** Explain why benzodiazepines have a much wider therapeutic index than barbiturates, in terms of how each acts at GABA-A receptors.
**Correct answer:** Benzodiazepines bind a regulatory site on GABA-A and increase the _frequency_ of channel opening when GABA is bound — they cannot open the channel without GABA. Barbiturates bind a different site and increase _channel open duration_, and at high doses can open the channel directly without GABA (acting like an agonist at the GABA site itself). Because benzos require endogenous GABA, their effect saturates at the natural GABA tone; barbiturates can drive overwhelming inhibition leading to coma and respiratory depression.
**Elaborative explanation:** This is why benzodiazepine overdose alone (without other CNS depressants) is rarely fatal but barbiturate overdose is. Flumazenil reverses benzodiazepines; there is no specific reversal for barbiturates.

### Hint Ladder

1. The two drug classes both potentiate GABA but differently.
2. One requires GABA presence; one can act alone.
3. The dose-response saturation differs.

### Misconception Mappings

- Wrong answer: "Both drugs open the channel directly without GABA" → Misconception: only barbiturates can.
- Wrong answer: "Benzos and barbiturates have the same therapeutic index" → Misconception: significantly different.
- Wrong answer: "Barbiturates are safer than benzos because they're older" → Misconception: older doesn't mean safer; benzos are safer.

# Facts

## Definitions

- **Synapse**: junction between two neurons (or neuron and effector) for information transfer.
- **Ionotropic receptor**: ligand-gated ion channel; fast.
- **Metabotropic receptor**: G-protein-coupled receptor; slow modulator.
- **EPSP / IPSP**: excitatory / inhibitory postsynaptic potential.
- **Quantal release**: release of one vesicle's worth of neurotransmitter.
- **LTP / LTD**: long-term potentiation / depression — synaptic plasticity.

## Functions

- Synaptic transmission converts the digital AP into a graded postsynaptic response.
- Modulatory transmitters tune the gain of fast transmission.
- LTP / LTD are candidate mechanisms for memory.

## Normal values

- **EPSP amplitude (CNS)**: 0.5–2 mV (each).
- **EPSP decay time constant**: 5–20 ms.
- **NMDA receptor decay**: 50–200 ms (longer than AMPA).
- **Quantal content per vesicle**: ~5,000 glutamate molecules.
- **Synaptic delay (chemical synapse)**: 0.5–1 ms.

## Relations

- Most fast excitation = glutamate (AMPA, NMDA).
- Most fast inhibition = GABA (GABA-A in cortex), glycine (spinal cord).
- Modulatory transmission = monoamines (DA, NE, 5-HT, ACh, histamine).

# Values

- **Synaptic cleft width (chemical synapse)**: 20–50 nm.
- **Vesicle diameter**: 30–50 nm.
- **NMDA Mg²⁺ block IC₅₀**: ~10 μM (relieved by depolarisation).
- **Quantal size (single EPSC at glutamatergic synapse)**: ~10 pA.
- **Resting GABA tonic current**: 1–10 pA.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 46.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 12.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 6.
- AK Jain, _Textbook of Physiology_, 9th ed.
- GK Pal, _Textbook of Medical Physiology_, 4th ed.
