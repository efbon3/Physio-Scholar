---
id: action-potential
title: Action Potential
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - resting-membrane-potential
related_mechanisms:
  - nerve-impulse-propagation
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

**Voltage-gated Na⁺ channels open, depolarise the cell explosively
toward E_Na, then inactivate; voltage-gated K⁺ channels open with a
delay and repolarise the cell back toward E_K.** That two-step dance —
fast depolarisation, delayed repolarisation — is the action potential.
Inactivation of Na⁺ channels at the peak prevents re-firing
immediately, creating the absolute refractory period that enforces
unidirectional propagation.

## Clinical Hook

Local anaesthetics (lidocaine, bupivacaine) block voltage-gated Na⁺
channels in their open or inactivated state. Because they bind
preferentially to the inactivated state, fast-firing pain fibres
(which spend more time in the inactivated state) are blocked at lower
concentrations than tonic motor fibres — this is "use-dependent block."
The same principle explains why class I antiarrhythmics work better at
high heart rates.

# Questions

## Question 1

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Describe the four phases of a typical neuronal action potential and the ionic events behind each.
**Correct answer:** (1) Depolarisation: voltage-gated Na⁺ channels open, Na⁺ enters, V_m climbs toward +30 mV. (2) Peak: Na⁺ channels inactivate, K⁺ channels begin opening. (3) Repolarisation: K⁺ efflux through delayed-rectifier K⁺ channels drives V_m back down. (4) Afterhyperpolarisation: K⁺ channels are slow to close, so V_m briefly dips below resting before settling.
**Elaborative explanation:** The four phases are best understood as Na⁺ activation, Na⁺ inactivation, K⁺ activation, and K⁺ deactivation. Hodgkin and Huxley's voltage-clamp experiments separated these currents and showed that Na⁺ has both fast activation and slower inactivation gates, while K⁺ has only an activation gate (slower).

### Hint Ladder

1. Two ions matter most: Na⁺ for going up, K⁺ for coming down.
2. Channels are gated — both open and close in response to voltage.
3. Inactivation of Na⁺ is what limits the peak.

### Misconception Mappings

- Wrong answer: "Ca²⁺ entry causes neuronal AP depolarisation" → Misconception: confusing neuron with cardiac myocyte; in neurons Na⁺ does the work.
- Wrong answer: "K⁺ efflux causes the upstroke" → Misconception: inverting which ion drives depolarisation.
- Wrong answer: "Afterhyperpolarisation is due to slow Na⁺ recovery" → Misconception: AHP comes from K⁺ channels remaining open, not Na⁺.

## Question 2

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A nerve fibre is treated with tetrodotoxin (TTX), which selectively blocks voltage-gated Na⁺ channels. What happens to the resting potential and to the action potential?
**Correct answer:** The resting potential is largely unchanged because Na⁺ contributes minimally at rest. The action potential is abolished entirely — without Na⁺ entry, the cell cannot depolarise above threshold.
**Elaborative explanation:** TTX is the classic experimental and pharmacological tool for distinguishing voltage-gated Na⁺ channel-mediated APs (TTX-sensitive) from Ca²⁺-mediated APs (TTX-resistant — seen in cardiac SA/AV node and some smooth muscle). Pufferfish poisoning cases present with weakness and paralysis as motor neurons fail to fire.

### Hint Ladder

1. What does the membrane look like at rest in terms of Na⁺ vs K⁺ permeability?
2. Without Na⁺ channels, what current is missing?
3. The resting state and the upstroke depend on different currents.

### Misconception Mappings

- Wrong answer: "Resting potential becomes much more negative" → Misconception: overweighting tiny Na⁺ leak; resting potential changes only minimally.
- Wrong answer: "Action potential is unaffected" → Misconception: forgetting that voltage-gated Na⁺ channels are the AP upstroke.
- Wrong answer: "Cell becomes spontaneously hyperexcitable" → Misconception: blocking inhibitory channels would do this; TTX blocks an excitatory channel.

## Question 3

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** What is the absolute refractory period, what is the relative refractory period, and what underlies each?
**Correct answer:** Absolute refractory period: the cell cannot fire a second AP regardless of stimulus strength because voltage-gated Na⁺ channels are inactivated. It lasts about 1 ms, covering the upstroke and most of repolarisation. Relative refractory period: the cell can fire but requires a stronger-than-normal stimulus because some Na⁺ channels remain inactivated and K⁺ permeability is still elevated. It coincides with afterhyperpolarisation.
**Elaborative explanation:** Refractoriness is what enforces unidirectional propagation along an axon — the patch behind the action potential is unable to re-fire as the wave moves forward. It also caps the maximum firing frequency: a 1 ms ARP allows up to ~1000 Hz firing, but K⁺-driven AHP usually limits real neurons to 100–500 Hz.

### Hint Ladder

1. ARP is about Na⁺ channel state.
2. RRP is about both residual inactivation and K⁺ permeability.
3. Total refractory period = ARP + RRP.

### Misconception Mappings

- Wrong answer: "ARP is when V_m is too negative for any stimulus to fire" → Misconception: the cell is depolarised, not hyperpolarised, during ARP.
- Wrong answer: "RRP requires an inhibitory stimulus to fire through" → Misconception: a _stronger_ normal stimulus will work; no inhibition needs to be removed.
- Wrong answer: "Refractory periods only apply to motor neurons" → Misconception: every excitable cell has them.

## Question 4

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** What is meant by "all-or-none" in the context of action potentials, and what mechanism enforces it?
**Correct answer:** Once the membrane reaches threshold (~−55 mV in neurons), the AP is generated with stereotypical amplitude and duration regardless of stimulus strength. The positive feedback between depolarisation and Na⁺ channel opening creates a regenerative loop — once the threshold is crossed, more channels open, more Na⁺ enters, more channels open. Below threshold, K⁺ leak wins and the cell returns to rest.
**Elaborative explanation:** "All-or-none" doesn't mean the size of the AP can never change — peak amplitude depends on E_Na, which depends on extracellular Na⁺. It means the AP is not graded with stimulus strength: there's a sharp threshold below which nothing happens and above which a stereotyped event occurs.

### Hint Ladder

1. The Na⁺ channel response to depolarisation is what kind of feedback?
2. There's a transition point below which the cell self-recovers.
3. Above that point, voltage drives more channels open which drives more depolarisation.

### Misconception Mappings

- Wrong answer: "AP amplitude scales with stimulus strength" → Misconception: confusing all-or-none with graded potentials (which are the synaptic story, not the AP story).
- Wrong answer: "All-or-none means APs always have the same amplitude in any condition" → Misconception: hyperkalaemia, hyponatraemia, and channel mutations all change AP shape; all-or-none is about stimulus invariance, not absolute invariance.
- Wrong answer: "The threshold is set by K⁺ channels alone" → Misconception: threshold is set by the balance of Na⁺ activation against K⁺ leak.

## Question 5

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A patient with hypocalcaemia presents with paraesthesiae, carpopedal spasm (Trousseau's sign), and twitching. Explain mechanistically why low Ca²⁺ causes neuronal hyperexcitability.
**Correct answer:** Extracellular Ca²⁺ binds to and stabilises the closed state of voltage-gated Na⁺ channels by neutralising surface charges. Low Ca²⁺ removes this stabilisation, lowering the threshold for Na⁺ channel opening — neurons fire spontaneously and at lower stimulus strengths.
**Elaborative explanation:** This "membrane stabilisation" by Ca²⁺ is independent of Ca²⁺'s role as an intracellular signal. The clinical picture: tetany, perioral tingling, hyperreflexia in hypocalcaemia (most often from acute alkalosis, parathyroidectomy, or vitamin D deficiency). Treatment is IV calcium, which restores the surface-charge effect.

### Hint Ladder

1. Calcium does more than enter cells — it binds membrane surfaces.
2. Voltage-gated Na⁺ channels have a threshold partly set by surface charges.
3. Removing the stabilising calcium makes channels easier to open.

### Misconception Mappings

- Wrong answer: "Low Ca²⁺ blocks Na⁺ channels and causes weakness" → Misconception: it lowers threshold, not blocks the channels.
- Wrong answer: "Hyperexcitability is from intracellular Ca²⁺ excess" → Misconception: the disease is hypocalcaemia (low extracellular Ca²⁺), and the mechanism is on the outside of the channel.
- Wrong answer: "Tetany is muscular weakness" → Misconception: tetany is sustained involuntary contraction, not weakness.

## Question 6

**Type:** integration
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** Compare the action potential of a typical neuron with that of a cardiac ventricular myocyte. List three structural / functional differences and their consequences.
**Correct answer:** (1) Plateau phase: ventricular AP has a long Ca²⁺-mediated plateau (~200 ms) absent in neurons. (2) Duration: neuronal AP ~1–2 ms vs ventricular ~250–300 ms. (3) Refractory period: cardiac ARP is much longer, preventing tetanic contraction of the heart. Consequences include allowing time for excitation-contraction coupling, preventing summation, and creating opportunities for re-entrant arrhythmias.
**Elaborative explanation:** Neurons fire briefly to encode information at high temporal resolution. Cardiac myocytes fire long because they need to mechanically contract — a brief AP would not give Ca²⁺ time to drive cross-bridge cycling. The plateau is voltage-gated L-type Ca²⁺ channels (DHP-receptor) staying open while delayed-rectifier K⁺ channels are slow to activate.

### Hint Ladder

1. Cardiac myocytes have an extra ion responsible for sustained depolarisation.
2. The extra ion is the same one that enters during cardiac ECC.
3. Duration of AP and refractoriness are related.

### Misconception Mappings

- Wrong answer: "Cardiac AP has the same duration as neuronal AP" → Misconception: ignoring the plateau.
- Wrong answer: "Cardiac plateau is from prolonged Na⁺ entry" → Misconception: it's L-type Ca²⁺, not Na⁺, sustaining the plateau.
- Wrong answer: "Long refractory periods limit cardiac performance" → Misconception: long ARP is _protective_ — preventing tetanus is essential for diastolic filling.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** Lidocaine binds preferentially to inactivated voltage-gated Na⁺ channels. Why does this make it more effective against fast-firing pain fibres than tonic motor neurons, and what is this property called clinically?
**Correct answer:** Fast-firing fibres spend more time in the inactivated state per unit time, giving lidocaine more chances to bind. Tonic neurons spend most of their cycle in the resting (closed) state where lidocaine binds poorly. The clinical property is "use-dependent" or "frequency-dependent" block.
**Elaborative explanation:** Use-dependent block is a recurring theme in pharmacology: the same principle explains why class I antiarrhythmics (lidocaine, mexiletine, flecainide) preferentially silence ectopic rapid-firing arrhythmic foci while sparing the SA node, and why local anaesthesia spares motor function more than pain fibres at low doses.

### Hint Ladder

1. Drugs that bind a specific channel state see more or less of that state depending on firing pattern.
2. Pain fibres fire fast; motor neurons fire steadily but slower.
3. Inactivated state is reached only after each AP.

### Misconception Mappings

- Wrong answer: "Lidocaine binds the resting state preferentially" → Misconception: that would block everything tonically; the actual story is use-dependent.
- Wrong answer: "Use-dependent block protects fast-firing cells preferentially" → Misconception: inverting the relationship; use-dependent block hits the fast firers harder.
- Wrong answer: "Use-dependent block applies only to muscle, not neurons" → Misconception: applies across all excitable tissues with voltage-gated Na⁺ channels.

# Facts

## Definitions

- **Action potential**: a stereotyped, all-or-none, regenerative depolarisation followed by repolarisation, generated when the membrane crosses threshold.
- **Threshold**: the membrane potential at which net depolarising current first exceeds net repolarising current — typically ~−55 mV in neurons.
- **Absolute refractory period (ARP)**: the interval during which no AP can be elicited, regardless of stimulus strength; corresponds to Na⁺ channel inactivation.
- **Relative refractory period (RRP)**: the interval during which an AP can be elicited only by stronger-than-normal stimuli; corresponds to residual Na⁺ inactivation and elevated K⁺ permeability.
- **Afterhyperpolarisation**: the brief period during which V_m is more negative than resting, caused by slow K⁺ channel deactivation.

## Functions

- The AP is the unit of information transmission in excitable tissues.
- ARP enforces unidirectional propagation along axons.
- RRP allows tunable firing frequency and prevents excessive tetanic firing.

## Normal values

- **Threshold (neuron)**: −55 to −50 mV.
- **AP peak (neuron)**: +30 to +40 mV.
- **AP overshoot above 0**: ~30–40 mV.
- **AP duration (neuron)**: 1–2 ms.
- **AP duration (skeletal muscle)**: 2–5 ms.
- **AP duration (cardiac ventricle)**: 200–300 ms.
- **Maximum neuronal firing frequency**: 500–1000 Hz (limited by ARP).

## Relations

- Depolarising current ↑ → channels open ↑ → more depolarisation (positive feedback).
- Inactivation gate of Na⁺ channels closes within ~1 ms of opening.
- Threshold is approximately the voltage at which inward Na⁺ current equals outward K⁺ + leak current.

# Values

- **Threshold (neuron)**: ~−55 mV.
- **Resting membrane potential (neuron)**: ~−70 mV.
- **AP peak**: +30 to +40 mV.
- **Total AP swing (neuron)**: ~100–110 mV.
- **Na⁺ channel activation time**: ~0.1 ms.
- **Na⁺ channel inactivation time**: ~1 ms.
- **K⁺ channel activation time**: ~1 ms.
- **AHP duration (neuron)**: ~5–15 ms.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 5.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 7.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 4.
- AK Jain, _Textbook of Physiology_, 9th ed.
- GK Pal, _Textbook of Medical Physiology_, 4th ed.
- Indu Khurana, _Textbook of Medical Physiology_, 2nd ed.
