---
chapter: Chapter 6 — The Neuron and Synaptic Transmission
part: Part I — Foundations of Physiology
tier: 1
tier_rationale: Foundational chapter — synaptic delay, vesicle release, EPSP/IPSP, summation, safety factor, and the named drugs that act on synapses (botulinum, tetanus, curare, strychnine, benzodiazepines, SSRIs) underpin every subsequent neurophysiology, pharmacology, and clinical neurology chapter.
target_count: 45
actual_count: 45
sources_consulted:
  - Berne & Levy Physiology, 7th ed., Ch. 6 (Synaptic Transmission) — primary source
  - Boron & Boulpaep, 2nd ed. Update, Ch. 12 and Ch. 13
  - Costanzo Physiology, 7th ed. (Synaptic and Neuromuscular Transmission section)
  - Guyton & Hall, 14th ed., Ch. 46 (Synapses and Neurotransmitters)
  - Ganong's Review of Medical Physiology, 26th ed.
status: draft
---

# Chapter 6 — Fill-in-the-Blank Questions

Authored in three passes (numerical-value anchors — delays, durations, channel diameters, mEPP amplitudes, vesicle contents, dendritic geometry → named entities and concepts — SNAREs, synaptotagmin, EPSP, IPSP, quantum, safety factor, summation, autoreceptor, ionotropic vs metabotropic → relational items — cause-effect chains, transporter routes, drug-target pairings, ionic logic), then deduplicated. Tier 1 target was 45; final count is 45. Questions are single-blank only — concepts that need two values were split into separate questions per the prompt convention.

---

## Pass 1 — Values (numerical anchors)

QUESTION 1
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The synaptic delay at a typical chemical synapse — the interval between arrival of the presynaptic action potential and onset of the postsynaptic potential — is approximately \_\_\_ ms.

Canonical answer: 0.5 ms

Accepted variants:

- 0.5 ms
- 0.5
- ~0.5
- 0.5–1
- half a millisecond

Tolerance: ±0.3 ms (0.2–0.8 ms graded Green)

Yellow conditions:

- "0.2" → "That is the time taken by the vesicle-fusion step alone; the total synaptic delay (including Ca²⁺ entry, transmitter diffusion, and channel opening) is ~0.5 ms."
- "1" → "Close — typical chemical synapses cluster around 0.5 ms, though some slower transmission can approach 1 ms; aim for ~0.5 ms as the canonical value."

Explanation: Synaptic delay reflects the rate-limiting steps of chemical transmission — Ca²⁺ entry through voltage-gated channels at the active zone, vesicle fusion (~0.2 ms alone), transmitter diffusion across the cleft, receptor binding, and postsynaptic channel opening [Guyton & Hall ch.46; Berne & Levy ch.6]. The delay is what distinguishes chemical from electrical synapses (which transmit virtually instantaneously through gap junctions). It is also why a chain of many chemical synapses imposes a real conduction-delay cost compared with a single long axon.

Hints:

1. The delay reflects multiple sequential steps, not just one.
2. It is on the order of half a millisecond — fast, but not instantaneous.
3. Most of the delay is taken up by Ca²⁺ entry and vesicle fusion at the active zone.

---

QUESTION 2
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The synaptic cleft at a typical chemical synapse is about \_\_\_ nm wide.

Canonical answer: ~20 nm

Accepted variants:

- 20 nm
- 20
- ~20 nm
- 20–30 nm
- 200–300 Å

Tolerance: ±10 nm (10–30 nm graded Green)

Yellow conditions:

- "3" → "That is the _electrical_ synapse (gap junction) inter-membrane gap, not the chemical synaptic cleft."
- "50" → "That is the wider neuromuscular junction cleft; a typical CNS chemical synaptic cleft is ~20 nm."

Explanation: A typical chemical synaptic cleft is ~20 nm wide [Berne & Levy ch.6; Guyton & Hall ch.46]. Berne & Levy quote ~20 nm; Guyton & Hall give 200–300 Å (i.e., 20–30 nm). The cleft is wide enough to ensure cytoplasmic separation of pre- and postsynaptic neurons, but narrow enough that diffusion of transmitter across it is essentially instantaneous (sub-millisecond at this distance). The neuromuscular junction is an exception with a wider ~50 nm cleft and a basal lamina containing acetylcholinesterase.

Hints:

1. Distinct from gap junctions, which leave only a few nanometres between membranes.
2. Diffusion across this distance is essentially instantaneous.
3. Quoted in nanometres, not micrometres.

---

QUESTION 3
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: At an electrical synapse, the apposed plasma membranes are separated by an intercellular gap of only about \_\_\_ nm.

Canonical answer: ~3 nm (≈3.5 nm)

Accepted variants:

- 3 nm
- 3
- ~3
- 3–3.5 nm
- 3.5 nm

Tolerance: ±1 nm

Yellow conditions:

- "20" → "That is the _chemical_ synaptic cleft, not the electrical synapse gap; gap junctions narrow the gap to ~3 nm."
- "0.3" → "Wrong order of magnitude — gap junctions narrow the membrane-to-membrane gap to ~3 nm, not ~0.3 nm."

Explanation: Gap junctions narrow the intercellular space to ~3–3.5 nm, in striking contrast to the ~20 nm of a chemical synaptic cleft [Berne & Levy ch.6]. This narrow gap allows the connexon channels of the two cells to align and form continuous cytoplasmic conduits. The minimal separation is what permits virtually instantaneous electrical and small-molecule communication between coupled cells — a defining feature of electrical synapses.

Hints:

1. Much narrower than a chemical synaptic cleft.
2. Allows alignment of connexon hemichannels.
3. Single-digit nanometres.

---

QUESTION 4
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The pore diameter of a gap junction channel is approximately \_\_\_ nm, large enough to permit passage of ions and small molecules up to ~1 kDa.

Canonical answer: 1–2 nm

Accepted variants:

- 1–2 nm
- 1.5 nm
- 1 nm
- 2 nm
- ~1.5 nm

Tolerance: ±0.5 nm

Yellow conditions:

- "0.5" → "Slightly small — gap junction pores are 1–2 nm, large enough to permit second messengers (cAMP, IP₃) to pass."
- "5" → "Too large — gap junction pores are 1–2 nm, restricting passage to molecules up to ~1 kDa."

Explanation: Gap junction channels have a pore of 1–2 nm; their permeability to second messengers and metabolites (cAMP, IP₃, ATP) — not just ions — distinguishes them from any voltage- or ligand-gated channel [Berne & Levy ch.6]. This property allows electrically coupled cells to share intracellular signalling messengers as well as electrical activity, and explains why some tissues (cardiac muscle, smooth muscle, glia) can coordinate metabolic and signalling responses across large distances.

Hints:

1. Larger than any voltage-gated channel pore.
2. Permits passage of small messengers, not just ions.
3. Single-digit nanometres.

---

QUESTION 5
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Each connexon (gap junction hemichannel) is built from \_\_\_ connexin subunits.

Canonical answer: 6 (a hexamer)

Accepted variants:

- 6
- six
- hexamer
- hexameric

Tolerance: not applicable (categorical)

Yellow conditions:

- "4" → "That is the subunit count of many ionotropic receptors (e.g., AMPA), not connexons; connexons are hexamers."
- "12" → "That is the count for two paired connexons (one whole gap junction channel); each connexon alone is a hexamer."

Explanation: Two connexons (one from each cell), each a hexamer of connexin protein, form one complete gap junction channel [Berne & Levy ch.6; Boron & Boulpaep ch.12]. Connexin 36 (Cx36) is the major neuronal connexin in the adult mammalian CNS; Cx43 is the dominant cardiac connexin. Different connexin isoforms confer different gating, conductance, and permeability properties.

Hints:

1. The hemichannel is a small symmetric oligomer.
2. Like many channels, the count matches the number of subunits arrayed around a central pore.
3. Six subunits per hemichannel.

---

QUESTION 6
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Each ACh-containing synaptic vesicle at the neuromuscular junction holds approximately \_\_\_ molecules of acetylcholine.

Canonical answer: 2,000–10,000

Accepted variants:

- 2,000–10,000
- 5,000
- ~5,000
- 2000–10000
- ~10,000

Tolerance: order of magnitude (10³–10⁴)

Yellow conditions:

- "100" → "Too few — a single ACh vesicle holds ~5,000 molecules (range 2,000–10,000), not just hundreds."
- "1,000,000" → "Too many — a single vesicle holds thousands of ACh molecules, not millions."

Explanation: Guyton & Hall quote 2,000–10,000 ACh molecules per vesicle [Guyton & Hall ch.46]. The presynaptic terminal contains thousands to >10,000 vesicles, enough to support several thousand action potentials before the readily releasable pool is exhausted (the basis of the "fatigue" seen with intense rapid stimulation). Each vesicle's content defines the _quantum_ — the smallest unit of release — and the integer-multiple amplitudes of evoked end-plate potentials.

Hints:

1. Each vesicle is a "quantum" of transmitter.
2. The number is in the thousands, not the hundreds or millions.
3. Combined with thousands of vesicles per terminal, this gives substantial reserve.

---

QUESTION 7
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: A single miniature end-plate potential (MEPP) at the human motor end-plate produces a depolarisation of approximately \_\_\_ mV.

Canonical answer: ~0.4 mV

Accepted variants:

- 0.4 mV
- 0.4
- ~0.4
- 0.5 mV
- <1 mV

Tolerance: ±0.3 mV

Yellow conditions:

- "0.04" → "Wrong order of magnitude — single MEPPs are ~0.4 mV (sub-millivolt), not tens of microvolts."
- "5" → "Too large — that is closer to a full evoked EPP; single MEPPs are ~0.4 mV."

Explanation: Costanzo gives ~0.4 mV per MEPP; Berne & Levy classically quote ≤1 mV at the frog NMJ [Costanzo — NMJ; Berne & Levy ch.6]. The full evoked EPP is an integer multiple of this quantum (typically ~50–100 quanta released by a single AP), and the integer relationship is the cellular basis of Katz's quantal hypothesis. MEPPs occur spontaneously even without nerve stimulation, reflecting random vesicle fusion at low rate.

Hints:

1. Sub-millivolt single-vesicle response.
2. Integer multiples of this build up the full EPP.
3. Less than 1 mV — distinct from the ~50 mV full evoked EPP.

---

QUESTION 8
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The minimal EPSP that depolarises the axon initial segment to threshold for spike initiation is approximately \_\_\_ mV above the resting potential.

Canonical answer: 10–20 mV

Accepted variants:

- 10–20 mV
- 10 mV
- 20 mV
- ~15 mV
- 10 to 20

Tolerance: ±5 mV (5–25 mV graded Green)

Yellow conditions:

- "30–40" → "That is the threshold at the _soma_, where Na⁺ channel density is lower; the _initial segment_ fires at only +10–20 mV."
- "1–2" → "Too small — a single EPSP is ~0.5–1 mV, but firing the cell requires summed depolarisation of +10–20 mV at the initial segment."

Explanation: Because of its high density of voltage-gated Na⁺ channels (~7× the somal density), the axon initial segment can be triggered by an EPSP of only +10 to +20 mV; the soma itself would need +30–40 mV [Guyton & Hall ch.46]. This makes the initial segment the spike trigger zone for the cell. Spatial and temporal summation across many synapses build up to this threshold; firing one motor neuron typically requires near-simultaneous activation of dozens of excitatory inputs.

Hints:

1. Determined by the channel density at the spike trigger zone.
2. Smaller than the threshold at the soma.
3. ~10–20 mV above rest.

---

QUESTION 9
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: A typical fast EPSP at a central neuron lasts about \_\_\_ ms before decaying to baseline, even though the underlying EPSC lasts only 1–2 ms.

Canonical answer: ~15 ms

Accepted variants:

- 15 ms
- 15
- ~15
- 10–20 ms
- 20 ms

Tolerance: ±5 ms

Yellow conditions:

- "1" → "That is the underlying _current_ (EPSC) duration; the _voltage_ response (EPSP) lasts much longer due to the membrane RC time constant."
- "100" → "Too long — typical fast EPSPs decay over ~15 ms; 100 ms is more characteristic of slow metabotropic responses."

Explanation: Channel kinetics determine the brief rising phase (the EPSC); the long decay reflects the postsynaptic membrane's RC time constant — capacitance discharges through membrane resistance over ~15 ms [Guyton & Hall ch.46; Berne & Levy ch.6]. This long voltage tail is functionally important: it enables temporal summation, allowing successive EPSPs from the same synapse (arriving every 5–10 ms) to add up before each has decayed. CNS computation depends on this temporal integration window.

Hints:

1. The current is brief but the voltage response is much longer.
2. The timescale is set by the membrane's capacitance and resistance.
3. Temporal summation depends on this.

---

QUESTION 10
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: A single excitatory presynaptic terminal on a spinal motor neuron produces an EPSP of only about \_\_\_ mV at the soma.

Canonical answer: 0.5–1 mV

Accepted variants:

- 0.5–1 mV
- 0.5 mV
- 1 mV
- ~1 mV
- <1 mV

Tolerance: ±0.5 mV

Yellow conditions:

- "10" → "Too large — a single terminal produces ~0.5–1 mV at the soma; reaching threshold requires summation of dozens of synapses."
- "0.05" → "Too small — single EPSPs are sub-millivolt but ~0.5–1 mV, not tens of microvolts."

Explanation: Guyton & Hall quote 0.5–1.0 mV per terminal at the soma; reaching the ~10–20 mV needed at the initial segment therefore requires near-simultaneous (spatial) summation of about 40–80 synapses on a typical anterior horn motor neuron [Guyton & Hall ch.46]. The small per-synapse contribution is the architectural basis of _integration_: each cell becomes a coincidence detector for many converging inputs.

Hints:

1. Each synapse contributes a small fraction of the firing threshold.
2. Many synapses must summate for a spike to fire.
3. Sub-millivolt — but combined input can drive a spike.

---

QUESTION 11
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: A spinal motor neuron carries roughly \_\_\_ presynaptic terminals on its surface (soma plus dendrites).

Canonical answer: 10,000–200,000

Accepted variants:

- 10,000–200,000
- ~100,000
- 100,000
- tens to hundreds of thousands
- ~10⁵

Tolerance: order of magnitude (10⁴–10⁵)

Yellow conditions:

- "100" → "Too few — a motor neuron carries 10,000 to 200,000 presynaptic terminals, with most on its dendrites."
- "10,000,000" → "Too many — even the most heavily connected motor neurons carry up to ~200,000 terminals, not millions."

Explanation: Guyton & Hall give the classic figure of 10,000 to 200,000 presynaptic terminals on the soma and dendrites of an anterior horn motor neuron, with 80–95% of them on dendrites [Guyton & Hall ch.46]. The dendritic tree maximises surface area and allows the cell to receive convergent input from many premotor sources (other motor neurons, descending motor pathways, sensory afferents, interneurons). This convergence is what makes integration possible.

Hints:

1. Most terminals contact dendrites, not the soma.
2. The number is in the tens of thousands to ~200,000.
3. Convergent input is what allows integration.

---

QUESTION 12
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The resting membrane potential of a typical spinal motor neuron soma is approximately \_\_\_ mV.

Canonical answer: −65 mV

Accepted variants:

- −65 mV
- −65
- −70 mV
- ~−65
- −60 to −70 mV

Tolerance: ±10 mV

Yellow conditions:

- "−90" → "That is closer to skeletal muscle resting potential; motor neurons rest at ~−65 mV, less negative because of leak conductances and chloride permeability."
- "0" → "That is closer to a fully depolarised cell, not a resting one; the resting potential is negative inside, around −65 mV."

Explanation: A spinal motor neuron rests at ~−65 mV — less negative than skeletal muscle (~−90 mV) [Guyton & Hall ch.46]. The less-negative resting potential matters functionally: it lies between the threshold for spike initiation and the Nernst equilibria for K⁺ and Cl⁻, allowing both EPSPs (depolarising) and IPSPs (hyperpolarising or shunting) to act effectively. This places motor neurons in a sensitive operating range where small voltage changes can shift firing probability substantially.

Hints:

1. Less negative than skeletal muscle resting potential.
2. Sits between threshold and the K⁺/Cl⁻ Nernst potentials.
3. Around −65 mV.

---

QUESTION 13
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Brief loss of cerebral blood flow produces unconsciousness within about \_\_\_ seconds.

Canonical answer: 3–7 seconds

Accepted variants:

- 3–7 seconds
- 5 seconds
- ~5 s
- 5–10 seconds
- a few seconds

Tolerance: ±3 seconds (a few to several seconds graded Green)

Yellow conditions:

- "30" → "Too long — unconsciousness develops within a few to ~10 seconds of CBF loss; irreversible neuronal damage takes minutes."
- "60+" → "Too long — synaptic transmission depends on continuous oxidative metabolism and fails within seconds of CBF loss."

Explanation: Synaptic transmission depends critically on oxidative metabolism — failure of the Na⁺/K⁺-ATPase and rundown of ionic gradients within seconds of metabolic interruption [Guyton & Hall ch.46]. This is the basis of vasovagal syncope (transient global hypoperfusion → unconsciousness), the immediate post-cardiac-arrest unconsciousness, and the seconds-scale time-pressure of resuscitation. Beyond ~5 minutes of complete ischaemia at normothermia, neuronal damage becomes irreversible.

Hints:

1. Synapses fail within seconds of metabolic interruption.
2. Faster than the timescale of irreversible cell death.
3. The basis of vasovagal syncope.

---

QUESTION 14
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Maximal paired-pulse facilitation at most chemical synapses is observed when the two stimuli are separated by an interstimulus interval of about \_\_\_ ms.

Canonical answer: ~20 ms

Accepted variants:

- 20 ms
- 20
- ~20
- 10–30 ms
- 25 ms

Tolerance: ±10 ms

Yellow conditions:

- "1" → "Too short — at very short intervals (<5 ms) the second response can actually be smaller (paired-pulse depression at some synapses); maximal facilitation is around ~20 ms."
- "1000" → "Too long — at intervals of several hundred milliseconds the two responses are equal in size; maximal facilitation peaks around ~20 ms."

Explanation: Maximal facilitation peaks around 20 ms, then declines back to a 1:1 ratio over several hundred milliseconds [Berne & Levy ch.6]. The mechanism is residual presynaptic Ca²⁺ from the first action potential — the second pulse arrives while [Ca²⁺]\_i is still elevated, augmenting release. Some synapses show paired-pulse _depression_ instead, depending on release probability (high-probability synapses tend to deplete and depress; low-probability synapses tend to facilitate).

Hints:

1. Reflects residual presynaptic Ca²⁺ from the first stimulus.
2. Tens of milliseconds — not microseconds and not seconds.
3. Some synapses show depression instead of facilitation.

---

QUESTION 15
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Excitatory neurotransmitter stores in many central synapses can sustain only about \_\_\_ action potentials of rapid stimulation before fatigue from depletion of releasable vesicles.

Canonical answer: ~10,000

Accepted variants:

- 10,000
- ~10,000
- 10⁴
- ten thousand

Tolerance: order of magnitude (10³–10⁴)

Yellow conditions:

- "100" → "Too few — typical excitatory synapses sustain ~10,000 APs at high frequency before fatigue; 100 would imply fatigue within seconds at any firing rate."
- "10,000,000" → "Too many — synaptic fatigue at intense rapid stimulation occurs after thousands of APs, not millions."

Explanation: Guyton & Hall give ~10,000 as a representative figure for synaptic fatigue [Guyton & Hall ch.46 — Fatigue]. Fatigue is a normal protective mechanism that contributes to terminating epileptic seizures and to short-term synaptic depression. Mechanistically, it reflects depletion of the readily releasable vesicle pool, partial replenishment by reserve vesicles, and post-tetanic adaptations. The number is finite but generous enough that ordinary use does not approach it.

Hints:

1. Reflects depletion of the readily releasable vesicle pool.
2. Represents intense rapid stimulation, not normal use.
3. Order of ~10,000.

---

QUESTION 16
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The dendrites of an anterior horn motor neuron extend up to about \_\_\_ µm from the soma in all directions.

Canonical answer: 500–1000 µm

Accepted variants:

- 500–1000 µm
- ~1 mm
- 1000 µm
- ~500 µm
- 0.5–1 mm

Tolerance: order of magnitude (~10² to ~10³ µm)

Yellow conditions:

- "10" → "Too short — motor neuron dendrites extend hundreds to ~1000 µm, providing the surface area for tens of thousands of synapses."
- "10,000" → "Too long — typical anterior horn dendrites extend up to ~1000 µm (1 mm), not 1 cm."

Explanation: The expanded surface area of the dendritic tree (up to ~1 mm from the soma) provides the spatial domain for the cell's vast synaptic input, and explains why most presynaptic terminals (80–95%) contact dendrites rather than the soma [Guyton & Hall ch.46]. Dendritic length matters functionally: distal synapses are electrotonically distant from the trigger zone, so they contribute less to firing decisions than proximal ones — except where local active currents (dendritic spikes) amplify them.

Hints:

1. Hundreds of micrometres to ~1 mm.
2. Provides the surface area for ~10⁴–10⁵ synapses.
3. Distal synapses are electrotonically distant from the spike trigger zone.

---

## Pass 2 — Definitions (named entities and concepts)

QUESTION 17
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The proteins that physically zipper synaptic vesicle and plasma membranes together to drive fusion are collectively called the \_\_\_ complex.

Canonical answer: SNARE

Accepted variants:

- SNARE
- SNARE complex
- SNAREs

Tolerance: not applicable (categorical)

Yellow conditions:

- "synaptotagmin" → "Synaptotagmin is the _Ca²⁺ sensor_; the fusion-driving zipper itself is the SNARE complex (synaptobrevin + syntaxin + SNAP-25)."
- "complexin" → "Complexin is a regulatory protein that clamps SNARE assembly; the core fusion complex itself is the SNARE complex."

Explanation: SNARE = soluble N-ethylmaleimide-sensitive factor attachment protein receptor [Berne & Levy ch.6]. The minimal complex is synaptobrevin (v-SNARE on the vesicle) plus syntaxin and SNAP-25 (t-SNAREs on the plasma membrane); their parallel coiled-coil zippering pulls the two membranes together and drives fusion. SM proteins (Munc18) and complexin regulate assembly. Botulinum and tetanus toxins are zinc metalloproteases that cleave specific SNARE proteins, abolishing fusion — confirming the indispensability of the complex.

Hints:

1. The acronym names a protein family central to membrane fusion.
2. Three core proteins zipper into a four-helix bundle.
3. The same complex is targeted by botulinum and tetanus toxins.

---

QUESTION 18
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The vesicle-membrane protein on which botulinum and tetanus toxins act to abolish neurotransmitter release is \_\_\_.

Canonical answer: synaptobrevin (also called VAMP)

Accepted variants:

- synaptobrevin
- VAMP
- VAMP2
- vesicle-associated membrane protein

Tolerance: not applicable (categorical)

Yellow conditions:

- "syntaxin" → "Syntaxin is the _target-membrane_ (plasma membrane) SNARE; synaptobrevin/VAMP is the _vesicle-membrane_ SNARE cleaved by tetanus and several botulinum toxin serotypes."
- "SNAP-25" → "SNAP-25 is a target-membrane SNARE — also cleaved by some BoNT serotypes (A and E) — but the _vesicle_-membrane protein in this question is synaptobrevin/VAMP."

Explanation: Synaptobrevin/VAMP is the vesicular SNARE; it is cleaved by tetanus toxin and by several botulinum toxin serotypes (B, D, F, G) [Berne & Levy ch.6; Boron & Boulpaep ch.13]. BoNT/A and /E cleave SNAP-25 instead; BoNT/C cleaves syntaxin. The selective cleavage explains why each toxin abolishes transmission with characteristic kinetics, and why botulinum and tetanus produce different clinical pictures despite sharing the same protease mechanism — BoNT acts at peripheral cholinergic terminals (flaccid paralysis), TeNT acts on spinal inhibitory interneurons (spastic paralysis).

Hints:

1. The "v" in v-SNARE.
2. Also abbreviated VAMP.
3. Cleaved by tetanus and several botulinum toxins.

---

QUESTION 19
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The presynaptic Ca²⁺ sensor whose binding triggers fast vesicle fusion is named \_\_\_.

Canonical answer: synaptotagmin

Accepted variants:

- synaptotagmin
- synaptotagmin-1
- syt
- syt1

Tolerance: not applicable (categorical)

Yellow conditions:

- "calmodulin" → "Calmodulin is a general-purpose Ca²⁺ sensor in many cellular contexts; the _fast-vesicle-fusion_ Ca²⁺ sensor at the synapse is synaptotagmin."
- "synaptophysin" → "Synaptophysin is an abundant vesicle-membrane protein but does not act as the Ca²⁺ trigger; synaptotagmin (with its C2 domains) is the fast Ca²⁺ sensor."

Explanation: Synaptotagmin's two cytoplasmic C2 domains bind Ca²⁺ cooperatively and trigger the final fusion step within the SNARE machinery [Berne & Levy ch.6]. Different synaptotagmin isoforms with different Ca²⁺ kinetics are expressed at different synapses, tuning release properties (fast versus slow, synchronous versus asynchronous). The cooperativity of Ca²⁺ binding (Hill coefficient ~3–4) explains the steep ~fourth-power dependence of release on presynaptic [Ca²⁺]ᵢ.

Hints:

1. Has two C2 domains that bind Ca²⁺.
2. Acts within the SNARE complex to trigger the final fusion step.
3. Steep Ca²⁺ dependence.

---

QUESTION 20
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The smallest unit of neurotransmitter release — corresponding to the contents of one synaptic vesicle — is called a \_\_\_.

Canonical answer: quantum

Accepted variants:

- quantum
- quantal unit
- a quantum of transmitter

Tolerance: not applicable (categorical)

Yellow conditions:

- "vesicle" → "A vesicle is the _physical container_; the term used for the _unit of release_ (the contents released in a single fusion event) is the quantum."
- "MEPP" → "The MEPP is the _postsynaptic response_ to one quantum (at the NMJ); the term for the unit of release itself is the quantum."

Explanation: The quantal hypothesis (Katz, Nobel 1970) states that transmitter is released in discrete packets equal to the contents of single vesicles [Berne & Levy ch.6; Costanzo — NMJ]. The amplitudes of evoked postsynaptic responses are integer multiples of the miniature (single-quantum) response — directly observable as MEPPs at the NMJ. Quantal analysis (counting how many quanta a stimulus releases) became a foundational technique in synaptic physiology and underpins how we quantify changes in release at any synapse.

Hints:

1. The unit corresponds to one vesicle's contents.
2. The Katz hypothesis introduced this concept.
3. MEPPs at the NMJ are postsynaptic responses to single units of this kind.

---

QUESTION 21
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The local depolarisation of the postsynaptic membrane produced by an excitatory transmitter is called the \_\_\_.

Canonical answer: EPSP (excitatory postsynaptic potential)

Accepted variants:

- EPSP
- excitatory postsynaptic potential
- excitatory post-synaptic potential

Tolerance: not applicable (categorical)

Yellow conditions:

- "IPSP" → "That is the inhibitory counterpart; an _excitatory_ transmitter produces an EPSP."
- "EPP" → "EPP (end-plate potential) is the term used at the _neuromuscular junction_; in CNS synapses the equivalent depolarisation is called the EPSP."

Explanation: EPSPs depolarise the cell and increase its probability of firing [Berne & Levy ch.6]. At the neuromuscular junction the equivalent depolarisation is termed the end-plate potential (EPP) and is supra-threshold (the high-safety-factor design of the NMJ); CNS EPSPs are typically sub-threshold and require summation. The EPSP arises from opening of cation-permeable channels (typically AMPA or nicotinic) that allow Na⁺ in (and K⁺ out), with reversal potential near 0 mV.

Hints:

1. The acronym for the depolarising postsynaptic event.
2. The CNS counterpart of the NMJ's EPP.
3. Driven by cation flux through ligand-gated channels.

---

QUESTION 22
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A change in membrane potential produced by a transmitter that decreases the probability of postsynaptic firing — usually by hyperpolarising the membrane — is called the \_\_\_.

Canonical answer: IPSP (inhibitory postsynaptic potential)

Accepted variants:

- IPSP
- inhibitory postsynaptic potential
- inhibitory post-synaptic potential

Tolerance: not applicable (categorical)

Yellow conditions:

- "EPSP" → "That is the excitatory counterpart; an _inhibitory_ transmitter (GABA, glycine) produces an IPSP."
- "EPP" → "EPP is the depolarisation at the NMJ; the question asks about the _inhibitory_ equivalent in CNS — the IPSP."

Explanation: IPSPs typically open Cl⁻ or K⁺ channels [Berne & Levy ch.6]. Even when ECl equals Vrest (no actual hyperpolarisation), the IPSP can still inhibit by _shunting_ — increased membrane conductance reduces the voltage change produced by simultaneous EPSCs. The two main inhibitory transmitters are GABA (CNS, principally GABA-A ionotropic Cl⁻ channels) and glycine (spinal cord and brainstem; targeted by strychnine).

Hints:

1. The hyperpolarising or shunting postsynaptic event.
2. Driven by Cl⁻ or K⁺ channels.
3. GABA and glycine are the principal inhibitory transmitters.

---

QUESTION 23
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A presynaptic receptor activated by the cell's own released neurotransmitter is called an \_\_\_.

Canonical answer: autoreceptor

Accepted variants:

- autoreceptor
- presynaptic autoreceptor

Tolerance: not applicable (categorical)

Yellow conditions:

- "heteroreceptor" → "A heteroreceptor is presynaptic but responds to a _different_ transmitter than the one the cell releases; an autoreceptor responds to the cell's _own_ transmitter."
- "ionotropic receptor" → "Ionotropic refers to the receptor _mechanism_ (ligand-gated ion channel), not its location; the question asks about the _self-feedback_ role, which is an autoreceptor."

Explanation: Autoreceptors typically inhibit further release (negative feedback) [Berne & Levy ch.6 — Presynaptic Receptors]. Examples include 5-HT₁A receptors on raphe neurons and α₂-adrenoceptors on noradrenergic terminals. Some clinical drugs work through them — clonidine (α₂ agonist) reduces sympathetic outflow partly by activating central α₂ autoreceptors. SSRIs work in part through autoreceptor desensitisation over weeks of treatment.

Hints:

1. Presynaptic and responsive to the cell's own transmitter.
2. Typically negative feedback on further release.
3. Examples include 5-HT₁A on raphe neurons.

---

QUESTION 24
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The reduction in transmitter release produced by activation of presynaptic receptors that decrease invasion of the action potential into the active zone is termed presynaptic \_\_\_.

Canonical answer: inhibition

Accepted variants:

- inhibition
- presynaptic inhibition

Tolerance: not applicable (categorical)

Yellow conditions:

- "facilitation" → "That would be the opposite — an _increase_ in release; the question describes a _decrease_, which is presynaptic inhibition."
- "depression" → "Depression usually refers to _use-dependent_ decline in release with repetitive stimulation; the question describes inhibition mediated by axoaxonic synapses or G-protein-coupled receptors — presynaptic inhibition."

Explanation: Presynaptic inhibition is mediated by axoaxonic synapses and G-protein-coupled receptors [Berne & Levy ch.6]. Mechanisms include shunting of the action potential, partial Na⁺-channel inactivation by depolarisation, and direct G-protein modulation of presynaptic Ca²⁺ channels (closing) and K⁺ channels (opening). It is functionally important in the dorsal horn, where GABAergic axoaxonic synapses on primary afferent terminals reduce transmitter release in nociceptive pathways — one mechanism of gate-control modulation.

Hints:

1. Reduction of release at the _presynaptic_ level.
2. Mediated by axoaxonic synapses or GPCRs.
3. Operates by reducing AP invasion or Ca²⁺ entry at the active zone.

---

QUESTION 25
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The simultaneous summation at the axon hillock of EPSPs generated by different synapses active at the same time is termed \_\_\_ summation.

Canonical answer: spatial

Accepted variants:

- spatial
- spatial summation

Tolerance: not applicable (categorical)

Yellow conditions:

- "temporal" → "That is the addition of _successive_ EPSPs from the _same_ synapse before each decays; the question describes _simultaneous_ inputs at _different_ synapses — spatial summation."
- "synaptic" → "All EPSP summation is synaptic; the term that distinguishes simultaneous _cross-synapse_ summation from successive same-synapse summation is _spatial_."

Explanation: Spatial summation is the simultaneous addition of EPSPs from many synapses; temporal summation is the addition of successive EPSPs from the same synapse before each has decayed [Guyton & Hall ch.46]. Both contribute to integration. Spatial summation underpins the ability of a motor neuron with thousands of inputs to integrate convergent signals; temporal summation matters when a few inputs fire repetitively. The long EPSP decay (~15 ms) provides the time window for temporal summation.

Hints:

1. The opposite of temporal summation.
2. "Simultaneous" inputs from multiple synapses.
3. Spatially across the cell body and dendrites at the same time.

---

QUESTION 26
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The ratio of evoked EPSP amplitude to the depolarisation needed to fire an action potential is termed the \_\_\_ of a synapse.

Canonical answer: safety factor

Accepted variants:

- safety factor
- safety margin

Tolerance: not applicable (categorical)

Yellow conditions:

- "reliability" → "Close in spirit, but the precise term used in synaptic physiology is _safety factor_ — the ratio of evoked EPP amplitude to firing threshold."
- "fidelity" → "Fidelity describes accurate signal transmission generally; the specific ratio asked about is the safety factor."

Explanation: The neuromuscular junction has a high safety factor (>1) and normally always fires the muscle fibre; most CNS synapses have low safety factors (<1) and rely on summation of many inputs to reach threshold [Berne & Levy ch.6]. Myasthenia gravis lowers the NMJ safety factor toward 1 by autoantibody-mediated AChR loss, producing fatigable weakness; pyridostigmine raises it again by prolonging cleft ACh dwell time. Lambert-Eaton lowers the safety factor presynaptically (autoantibodies against P/Q-type Ca²⁺ channels reduce release).

Hints:

1. A ratio comparing evoked amplitude to firing threshold.
2. Greater than 1 at the NMJ (1:1 reliable transmission).
3. Lowered by myasthenia gravis and Lambert-Eaton.

---

QUESTION 27
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The receptor type that is itself an ion channel and produces fast (millisecond-scale) postsynaptic responses is called \_\_\_.

Canonical answer: ionotropic

Accepted variants:

- ionotropic
- ionotropic receptor
- ligand-gated ion channel

Tolerance: not applicable (categorical)

Yellow conditions:

- "metabotropic" → "Metabotropic receptors are _G-protein-coupled_ and produce slower second-messenger responses; the _fast, channel-itself_ class is ionotropic."
- "GPCR" → "GPCR is the family of metabotropic receptors; the question asks about the _channel-itself_ class, which is ionotropic."

Explanation: Ionotropic receptors include the nicotinic ACh receptor, GABA-A, glycine, AMPA, NMDA, kainate, and 5-HT₃ receptors [Boron & Boulpaep ch.13]. They are typically pentameric or tetrameric ligand-gated channels. Their key distinguishing feature is that the receptor _is_ the channel — opening time and conductance are determined by a single protein complex. This produces fast (millisecond) postsynaptic currents, in contrast to metabotropic G-protein-coupled receptors which act through second messengers and produce slower (tens to hundreds of milliseconds) responses.

Hints:

1. The receptor and ion channel are the same molecule.
2. Examples include nicotinic ACh, GABA-A, glycine, AMPA, NMDA.
3. Fast millisecond responses.

---

QUESTION 28
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The receptor type that is coupled to a G protein and activates intracellular second-messenger cascades — producing slower, longer-lasting effects — is called \_\_\_.

Canonical answer: metabotropic

Accepted variants:

- metabotropic
- metabotropic receptor
- G-protein-coupled receptor
- GPCR

Tolerance: not applicable (categorical)

Yellow conditions:

- "ionotropic" → "Ionotropic receptors are the _channel-itself_ class; the question asks about the _G-protein-coupled_ class, which is metabotropic."
- "tyrosine kinase" → "RTKs are a different superfamily (growth factor receptors); the _fast neurotransmitter_ metabotropic class are GPCRs."

Explanation: Examples include muscarinic ACh receptors, GABA-B, mGluRs, dopamine, adrenergic, and most peptide receptors [Berne & Levy ch.6]. Metabotropic receptors couple to heterotrimeric G proteins (Gs, Gi/o, Gq) which then modulate second messengers (cAMP, IP₃/DAG, Ca²⁺) and effector channels (GIRK, M-current). Their slower kinetics make them well-suited for modulatory functions: changing the responsiveness of a circuit over hundreds of milliseconds to seconds, in contrast to ionotropic receptors which carry the fast point-to-point signal.

Hints:

1. Coupled to heterotrimeric G proteins.
2. Slower than ionotropic, modulatory rather than fast-signalling.
3. Includes muscarinic, GABA-B, mGluR, adrenergic.

---

QUESTION 29
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A transient increase in postsynaptic response after a brief train of high-frequency presynaptic stimulation, lasting tens of seconds to several minutes, is called \_\_\_ potentiation.

Canonical answer: posttetanic (PTP)

Accepted variants:

- posttetanic
- posttetanic potentiation
- post-tetanic
- PTP

Tolerance: not applicable (categorical)

Yellow conditions:

- "long-term" → "Long-term potentiation (LTP) lasts hours to days and involves both pre- and postsynaptic changes; _post-tetanic_ potentiation lasts tens of seconds to minutes and is presynaptic."
- "short-term" → "PTP is one form of short-term plasticity, but the _specific_ term for the post-tetanic increase is posttetanic potentiation (PTP)."

Explanation: Posttetanic potentiation (PTP) is presynaptic, reflecting residual Ca²⁺ in the terminal after a tetanic train [Berne & Levy ch.6]. It is distinct from long-term potentiation (LTP), which lasts hours to days and involves both pre- and postsynaptic changes (NMDA-mediated postsynaptic Ca²⁺ entry, AMPA receptor insertion, structural spine changes). The two phenomena together span the timescale of plasticity from seconds (paired-pulse facilitation) through minutes (PTP) to hours-days (LTP).

Hints:

1. Reflects residual Ca²⁺ in the presynaptic terminal.
2. Tens of seconds to minutes — shorter than LTP.
3. Follows tetanic stimulation.

---

QUESTION 30
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The persistent (hours to days) activity-dependent strengthening of synapses thought to underlie certain forms of learning and memory is called \_\_\_.

Canonical answer: long-term potentiation (LTP)

Accepted variants:

- long-term potentiation
- LTP
- long term potentiation

Tolerance: not applicable (categorical)

Yellow conditions:

- "PTP" → "Posttetanic potentiation lasts only tens of seconds to minutes; the _hours-to-days_ form thought to underlie memory is LTP."
- "long-term depression" → "LTD is the _opposite_ (persistent weakening) — also a form of long-term plasticity but not the _strengthening_ form asked about; that is LTP."

Explanation: LTP at hippocampal CA3–CA1 synapses is NMDA-receptor-dependent and Ca²⁺/CaMKII-driven, with both presynaptic (release) and postsynaptic (AMPA receptor insertion, structural spine remodelling) components [Boron & Boulpaep ch.13; Berne & Levy ch.6]. Late-phase LTP requires protein synthesis (CREB → gene transcription → growth factors). It is the most studied molecular model of memory and follows Hebbian rules — cooperativity, associativity, specificity, and long duration. Long-term depression (LTD) is the opposite phenomenon, induced by low-frequency stimulation.

Hints:

1. Persistent strengthening — not weakening.
2. NMDA-receptor-dependent in the hippocampus.
3. Hours to days, longer than PTP.

---

QUESTION 31
Type: recall
Bloom's level: remember
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The soma and proximal dendrites of a typical CNS neuron are connected to the axon by a specialised low-threshold region called the axon \_\_\_.

Canonical answer: initial segment (axon hillock)

Accepted variants:

- initial segment
- axon initial segment
- AIS
- axon hillock
- hillock

Tolerance: not applicable (categorical)

Yellow conditions:

- "node of Ranvier" → "Nodes of Ranvier are gaps between myelin segments along the _length_ of an axon; the _low-threshold spike-trigger_ region right at the soma–axon transition is the axon initial segment / hillock."
- "soma" → "The soma has a higher threshold; the specialised low-threshold trigger zone is the axon initial segment, just distal to the soma."

Explanation: The axon initial segment (AIS) has the highest density of voltage-gated Na⁺ channels (~7× the somal density) and is therefore the spike trigger zone for the cell [Guyton & Hall ch.46]. EPSPs propagating from dendrites and soma reach the AIS first; if their summed voltage exceeds the AIS threshold (~10–20 mV above rest), an action potential is initiated and propagates orthodromically along the axon and (often) antidromically back into the dendrites. AIS dysfunction has been implicated in several neurological disorders.

Hints:

1. Sits between the soma and the first myelinated segment of the axon.
2. Has the highest density of voltage-gated Na⁺ channels in the cell.
3. The spike trigger zone.

---

QUESTION 32
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Acetylcholine is synthesised in the cholinergic terminal from acetyl-CoA and choline by the enzyme \_\_\_.

Canonical answer: choline acetyltransferase (ChAT)

Accepted variants:

- choline acetyltransferase
- ChAT
- choline-acetyltransferase

Tolerance: not applicable (categorical)

Yellow conditions:

- "acetylcholinesterase" → "Acetylcholinesterase _hydrolyses_ ACh in the cleft after release; the _synthetic_ enzyme is choline acetyltransferase (ChAT)."
- "VAChT" → "VAChT is the _vesicular_ acetylcholine transporter that concentrates ACh into vesicles after synthesis; the synthetic step itself is catalysed by ChAT."

Explanation: ChAT in the cytoplasm of cholinergic terminals catalyses ACh synthesis from acetyl-CoA and choline [Berne & Levy ch.6; Costanzo — NMJ]. ACh is then concentrated into vesicles by the vesicular acetylcholine transporter (VAChT). After release, acetylcholinesterase in the cleft hydrolyses ACh to acetate and choline; choline is recovered by an Na⁺-coupled high-affinity choline transporter (CHT1). Hemicholinium-3 blocks CHT1 and depletes presynaptic ACh stores — a classic experimental tool. ChAT immunohistochemistry is used to identify cholinergic neurons.

Hints:

1. The reaction acetyl-CoA + choline → ACh + CoA.
2. Cytoplasmic, not vesicular.
3. The marker enzyme for cholinergic neurons.

---

## Pass 3 — Relations (cause/effect, transporter routes, drug-target pairings)

QUESTION 33
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The amount of neurotransmitter released from a presynaptic terminal is steeply dependent on the entry of \_\_\_ ions through voltage-gated channels in the active zone.

Canonical answer: Ca²⁺ (calcium)

Accepted variants:

- Ca²⁺
- calcium
- Ca
- Ca2+

Tolerance: not applicable (categorical)

Yellow conditions:

- "Na⁺" → "Na⁺ entry depolarises the terminal, but the _trigger for release_ is Ca²⁺ entry through voltage-gated Ca²⁺ channels at the active zone."
- "K⁺" → "K⁺ efflux _terminates_ the AP; the _trigger for release_ is Ca²⁺ entry."

Explanation: Release is roughly proportional to [Ca²⁺]ᵢ raised to the fourth power, reflecting cooperative binding to synaptotagmin's C2 domains [Berne & Levy ch.6; Guyton & Hall ch.46]. Lambert-Eaton myasthenic syndrome (autoantibodies against presynaptic P/Q-type voltage-gated Ca²⁺ channels) produces failure of release on this basis — explaining why repeated nerve stimulation _augments_ the response (residual Ca²⁺ accumulates and rescues release), the diagnostic incremental EMG response. Conversely, magnesium is a competitive antagonist of presynaptic Ca²⁺ entry — clinically relevant in obstetrics (high Mg²⁺ infusion can produce flaccid weakness in neonates and mothers).

Hints:

1. The ion that triggers vesicle fusion.
2. Steep cooperative dependence (~fourth power).
3. Targeted by Lambert-Eaton autoantibodies.

---

QUESTION 34
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Glutamate released into the cleft is taken up mainly by \_\_\_ cells and converted to glutamine before being shuttled back to the neuron.

Canonical answer: astrocytes (glia)

Accepted variants:

- astrocytes
- glia
- astrocytic
- glial cells

Tolerance: not applicable (categorical)

Yellow conditions:

- "neurons" → "Glutamate is reabsorbed mainly by _astrocytes_ (not the releasing neuron); the astrocyte–neuron glutamine cycle is the principal recycling route."
- "microglia" → "Microglia are immune cells; the cells that take up cleft glutamate via EAAT1/EAAT2 are astrocytes."

Explanation: EAAT1/GLAST and EAAT2/GLT-1 on astrocytes are the dominant glutamate transporters; astrocytic glutamine synthase converts glutamate to glutamine, which is exported back to neurons for reuse — the glutamate–glutamine cycle [Berne & Levy ch.6]. This astrocytic uptake terminates synaptic glutamate signalling, prevents excitotoxicity, and regenerates substrate for re-synthesis. Failure of glutamate uptake (after stroke, in motor neuron disease, in some chronic pain states) causes glutamate accumulation and excitotoxic neuronal damage.

Hints:

1. Glia — not the releasing neuron — handle most cleft glutamate.
2. The transporters are EAAT1 and EAAT2.
3. Glutamate is converted to glutamine in these cells before being shuttled back.

---

QUESTION 35
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The choline released by cleft hydrolysis of acetylcholine is recovered into the presynaptic terminal by an Na⁺-coupled \_\_\_.

Canonical answer: high-affinity choline transporter (CHT1)

Accepted variants:

- high-affinity choline transporter
- CHT1
- CHT
- choline transporter

Tolerance: not applicable (categorical)

Yellow conditions:

- "VAChT" → "VAChT is the _vesicular_ ACh transporter (concentrates ACh into vesicles); the _plasma membrane_ transporter that recovers cleft choline is CHT1."
- "DAT" → "DAT is the dopamine transporter; the cholinergic _choline_ recovery transporter is CHT1."

Explanation: Hemicholinium-3 blocks CHT1 and depletes presynaptic ACh stores — a classic experimental tool to demonstrate that choline reuptake is rate-limiting for ACh resynthesis [Berne & Levy ch.6; Costanzo — NMJ]. The cleft AChE hydrolyses ACh to acetate and choline; choline is recovered by the Na⁺-coupled CHT1; cytoplasmic ChAT converts it back to ACh, which is then concentrated into vesicles by VAChT. The closed-loop recycling means that intense cholinergic activity does not deplete stores easily.

Hints:

1. A plasma-membrane transporter on the presynaptic terminal.
2. Coupled to the Na⁺ gradient.
3. Rate-limiting for ACh resynthesis.

---

QUESTION 36
Type: application
Bloom's level: analyse
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The effect of opening Cl⁻ channels in a mature CNS neuron is normally an inhibitory hyperpolarisation because the Nernst potential for chloride is more \_\_\_ than the resting membrane potential.

Canonical answer: negative

Accepted variants:

- negative
- more negative
- electronegative

Tolerance: not applicable (categorical)

Yellow conditions:

- "positive" → "If ECl were _positive_ to Vrest, Cl⁻ flow would _depolarise_ the cell — which happens in immature neurons with high intracellular Cl⁻ but not in mature CNS neurons."
- "equal" → "If ECl equalled Vrest, Cl⁻ flow would not change the voltage but could still _shunt_ simultaneous EPSCs; the question states the response is _hyperpolarisation_, which requires ECl more _negative_ than Vrest."

Explanation: ECl ≈ −70 mV; Vrest ≈ −65 mV [Boron & Boulpaep ch.13; Guyton & Hall ch.46]. Cl⁻ flows in (down its electrochemical gradient), hyperpolarising the cell. In immature neurons with high intracellular Cl⁻ (because the developmentally early Na⁺/K⁺/Cl⁻ cotransporter NKCC1 dominates over the later-expressed K⁺/Cl⁻ cotransporter KCC2), ECl is positive to Vrest and GABA-A activation is _depolarising_ — explaining why GABA acts as an excitatory transmitter early in development. The KCC2 switch in the first weeks of postnatal life converts GABA from excitatory to inhibitory.

Hints:

1. Compare the Nernst potential for Cl⁻ to the resting membrane potential.
2. Whichever is more negative determines the direction of flow.
3. In immature neurons the relationship is inverted.

---

QUESTION 37
Type: application
Bloom's level: analyse
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The NMDA channel is blocked at resting potentials by extracellular \_\_\_, and this block is relieved only when the postsynaptic membrane is depolarised.

Canonical answer: Mg²⁺ (magnesium)

Accepted variants:

- Mg²⁺
- magnesium
- Mg2+
- Mg

Tolerance: not applicable (categorical)

Yellow conditions:

- "Ca²⁺" → "Ca²⁺ flows _through_ the NMDA channel when it is open (and is the trigger for LTP); the _voltage-dependent block_ at rest is Mg²⁺, not Ca²⁺."
- "Zn²⁺" → "Zn²⁺ does modulate NMDA receptors at certain subunits, but the canonical _voltage-dependent pore block_ relieved by depolarisation is by Mg²⁺."

Explanation: This voltage-dependent Mg²⁺ block makes the NMDA receptor a coincidence detector — it opens only when glutamate is bound _and_ the membrane is depolarised (typically by AMPA-mediated current first) [Boron & Boulpaep ch.13]. Ca²⁺ entry through NMDA receptors is the proximal trigger for LTP induction. Pharmacologically, NMDA antagonists include ketamine (used for anaesthesia, depression, and analgesia), memantine (Alzheimer's), dextromethorphan (analgesic effects), and phencyclidine (PCP — produces psychotomimetic effects, illuminating glutamatergic contributions to schizophrenia).

Hints:

1. A divalent cation that physically plugs the channel pore at resting potential.
2. The block is relieved by depolarisation.
3. Makes the NMDA receptor a coincidence detector.

---

QUESTION 38
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Botulinum toxin and tetanus toxin both inhibit synaptic transmission by cleaving \_\_\_ proteins of the vesicle-fusion machinery.

Canonical answer: SNARE

Accepted variants:

- SNARE
- SNARE proteins
- v-SNARE / t-SNARE

Tolerance: not applicable (categorical)

Yellow conditions:

- "AChR" → "Curare blocks AChR; _tetanus and botulinum toxins_ are presynaptic Zn-dependent metalloproteases that cleave SNARE proteins."
- "GABA receptor" → "Strychnine blocks glycine receptors and benzodiazepines modulate GABA-A; tetanus and botulinum toxins act _presynaptically_ by cleaving SNARE proteins."

Explanation: Both are zinc-dependent metalloproteases that cleave SNARE proteins (synaptobrevin, syntaxin, or SNAP-25 depending on serotype) [Berne & Levy ch.6; Boron & Boulpaep ch.13]. BoNT acts at peripheral cholinergic terminals → flaccid paralysis; TeNT is taken up at the NMJ but transported retrogradely to spinal inhibitory interneurons, where it abolishes glycine and GABA release → spastic paralysis (lockjaw, opisthotonus). The same molecular mechanism produces opposite clinical syndromes because of where each toxin acts. Therapeutic botulinum toxin is now used widely (cervical dystonia, blepharospasm, cosmetic, hyperhidrosis, migraine, spasticity).

Hints:

1. The same protein family is the target of both toxins.
2. The fusion-machinery zipper is what they cleave.
3. SNARE complex.

---

QUESTION 39
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The mechanism of action of a non-depolarising muscle relaxant such as d-tubocurarine is competitive antagonism at the postsynaptic \_\_\_ receptor at the motor end-plate.

Canonical answer: nicotinic acetylcholine

Accepted variants:

- nicotinic acetylcholine receptor
- nicotinic AChR
- nAChR
- nicotinic
- nicotinic ACh receptor
- muscle nicotinic receptor

Tolerance: not applicable (categorical)

Yellow conditions:

- "muscarinic" → "Muscarinic ACh receptors are autonomic-end-organ; the _NMJ_ receptor blocked by curare is the _nicotinic_ ACh receptor."
- "GABA-A" → "GABA-A is a CNS Cl⁻ channel; the NMJ receptor blocked by curare is the nicotinic ACh receptor."

Explanation: Curare reduces EPP amplitude by occupying ACh-binding sites without opening the channel [Costanzo — NMJ; Berne & Levy ch.6]. α-Bungarotoxin binds the same receptor irreversibly and is used experimentally to label it. Anticholinesterases (neostigmine, edrophonium) reverse curare-induced block by raising cleft ACh — competing the curare off and restoring transmission. Modern non-depolarising blockers (rocuronium, vecuronium, atracurium) work the same way with different durations and metabolic profiles. Sugammadex selectively encapsulates rocuronium (a γ-cyclodextrin-based reversal agent), allowing rapid reversal of deep blockade.

Hints:

1. The NMJ receptor — muscle type.
2. Five subunits in the adult: 2α + β + δ + ε.
3. Same receptor family that is bound by α-bungarotoxin.

---

QUESTION 40
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The convulsant strychnine produces unopposed motor neuron excitation in the spinal cord by competitively blocking the postsynaptic \_\_\_ receptor.

Canonical answer: glycine

Accepted variants:

- glycine
- glycine receptor
- glycinergic
- GlyR

Tolerance: not applicable (categorical)

Yellow conditions:

- "GABA-A" → "GABA-A is the dominant inhibitory receptor in cortex; in the _spinal cord and brainstem_, the inhibitory receptor blocked by strychnine is the glycine receptor."
- "nicotinic ACh" → "That is the NMJ excitatory receptor; strychnine blocks the _glycinergic_ inhibitory receptor in the cord."

Explanation: Glycine is the principal inhibitory transmitter in the spinal cord and brainstem, acting on a Cl⁻-permeable ionotropic receptor [Guyton & Hall ch.46]. Loss of glycinergic inhibition leaves motor neurons in unopposed excitatory drive, producing tonic spasms — the clinical picture of strychnine poisoning. The same outcome (motor disinhibition) is produced by tetanus toxin, which abolishes presynaptic glycine release rather than blocking the receptor; both produce spastic paralysis with risus sardonicus and opisthotonus, but via different molecular mechanisms.

Hints:

1. The principal inhibitory receptor in spinal cord and brainstem.
2. A Cl⁻-permeable ionotropic receptor.
3. Same downstream consequence as tetanus toxin (loss of glycine action).

---

QUESTION 41
Type: application
Bloom's level: analyse
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The therapeutic effect of pyridostigmine in myasthenia gravis is to inhibit cleft \_\_\_, thereby prolonging ACh action at the partially depleted postsynaptic receptor pool.

Canonical answer: acetylcholinesterase

Accepted variants:

- acetylcholinesterase
- AChE
- cholinesterase

Tolerance: not applicable (categorical)

Yellow conditions:

- "VAChT" → "VAChT is the _vesicular_ ACh transporter inside the terminal; the _cleft_ enzyme inhibited therapeutically by pyridostigmine is acetylcholinesterase."
- "AChR" → "Pyridostigmine does _not_ bind the ACh receptor; it inhibits the _enzyme_ that hydrolyses ACh in the cleft (AChE)."

Explanation: With fewer functional postsynaptic AChRs (autoantibody-mediated), the safety factor is reduced and EPPs may fall below threshold [Berne & Levy ch.6 — In the Clinic; Costanzo — Box 1.5]. Slowing ACh hydrolysis raises cleft ACh and lengthens its dwell time, restoring suprathreshold EPPs at the residual receptors. Other AChE inhibitors (neostigmine, edrophonium, donepezil for Alzheimer's, rivastigmine, galantamine, organophosphates as poisons) act on the same enzyme with different penetration and selectivity profiles. Excessive AChE inhibition produces cholinergic crisis with muscarinic excess (DUMBELS / SLUDGE).

Hints:

1. The enzyme that hydrolyses ACh in the cleft.
2. Inhibition prolongs ACh action.
3. Pyridostigmine is its first-line inhibitor in myasthenia.

---

QUESTION 42
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Benzodiazepines such as diazepam exert their anxiolytic, sedative, and anticonvulsant effects by binding an allosteric site on the \_\_\_ receptor and increasing the frequency of Cl⁻-channel opening in the presence of GABA.

Canonical answer: GABA-A

Accepted variants:

- GABA-A
- GABAA
- GABA-A receptor
- GABA(A)

Tolerance: not applicable (categorical)

Yellow conditions:

- "GABA-B" → "GABA-B is the _metabotropic_ GPCR-coupled GABA receptor (targeted by baclofen); benzodiazepines act on the _ionotropic Cl⁻-channel_ GABA-A receptor."
- "glycine" → "Glycine receptors are blocked by strychnine; benzodiazepines modulate GABA-A receptors."

Explanation: Benzodiazepines are positive allosteric modulators (not direct agonists) — they increase channel-opening _frequency_ in the presence of GABA [Boron & Boulpaep ch.13; Ganong]. Barbiturates bind a different site and prolong channel-open _time_; both drug classes amplify GABAergic inhibition and depress neuronal excitability. Z-drugs (zolpidem, zopiclone) are non-benzodiazepine GABA-A modulators with greater α1-subunit selectivity. The benzodiazepine antagonist flumazenil reverses BDZ overdose. Alcohol also potentiates GABA-A signalling — explaining cross-tolerance and the use of long-acting BDZs (chlordiazepoxide, diazepam) for alcohol withdrawal.

Hints:

1. The _ionotropic_ GABA receptor — a Cl⁻ channel.
2. BDZs increase channel-opening frequency, not duration.
3. Same receptor amplified by alcohol, barbiturates, and Z-drugs.

---

QUESTION 43
Type: application
Bloom's level: analyse
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Selective serotonin-reuptake inhibitors block the \_\_\_, raising synaptic 5-HT, but their full antidepressant effect requires weeks because of slow desensitisation of inhibitory presynaptic 5-HT₁A autoreceptors.

Canonical answer: serotonin transporter (SERT, SLC6A4)

Accepted variants:

- serotonin transporter
- SERT
- SLC6A4
- 5-HT transporter

Tolerance: not applicable (categorical)

Yellow conditions:

- "5-HT receptor" → "SSRIs do _not_ block postsynaptic 5-HT receptors; they block the _transporter_ that recycles 5-HT into the presynaptic terminal — SERT."
- "MAO" → "MAO inhibitors raise 5-HT by blocking degradation; SSRIs raise it by blocking _reuptake_ via SERT."

Explanation: SSRIs raise extracellular 5-HT within hours, but the clinical benefit takes 2–6 weeks — paralleling autoreceptor desensitisation, postsynaptic receptor adaptation, BDNF up-regulation, and downstream gene-expression changes [Boron & Boulpaep ch.13; Ganong]. The mismatch between rapid biochemical effect and delayed clinical response illustrates that depression is not simply a "low-serotonin" state. Examples include fluoxetine, sertraline, escitalopram, paroxetine, citalopram. Side effects include initial GI symptoms, sexual dysfunction, weight changes, hyponatraemia (especially in elderly via SIADH), QT prolongation (citalopram at high doses), and discontinuation symptoms with abrupt cessation.

Hints:

1. The plasma-membrane reuptake transporter for 5-HT.
2. Same transporter blocked by cocaine (with DAT and NET).
3. Belongs to the SLC6 family.

---

QUESTION 44
Type: recall
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The major source of widely projecting noradrenergic axons in the brain is the small brainstem nucleus called the \_\_\_.

Canonical answer: locus coeruleus

Accepted variants:

- locus coeruleus
- locus ceruleus
- LC
- nucleus locus coeruleus

Tolerance: not applicable (categorical)

Yellow conditions:

- "raphe nuclei" → "Raphe nuclei are the _serotonergic_ source; the _noradrenergic_ source is the locus coeruleus."
- "substantia nigra" → "Substantia nigra is the dopaminergic source for the nigrostriatal pathway; the _noradrenergic_ source is the locus coeruleus."

Explanation: The locus coeruleus is in the dorsolateral pons; its diffuse projections regulate arousal, attention, and mood [Boron & Boulpaep ch.13; Guyton & Hall ch.46]. Similar widely projecting modulatory systems include raphe nuclei (serotonin), substantia nigra and VTA (dopamine), and basal forebrain nuclei (acetylcholine). Together these systems coordinate state-dependent regulation of cortical excitability — the LC fires more during arousal, novelty, and stress; reduced LC activity is a feature of NREM sleep. Many psychiatric drugs act on these monoaminergic modulatory systems.

Hints:

1. Located in the pons.
2. Produces the cell's characteristic blue colour (cooperinaeus → coeruleus).
3. Diffuse projections to cortex regulate arousal.

---

QUESTION 45
Type: application
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Dopaminergic neurons whose loss produces the motor features of Parkinson's disease project from the substantia nigra (pars compacta) to the \_\_\_.

Canonical answer: striatum (caudate and putamen)

Accepted variants:

- striatum
- caudate and putamen
- caudate-putamen
- dorsal striatum
- neostriatum

Tolerance: not applicable (categorical)

Yellow conditions:

- "nucleus accumbens" → "Nucleus accumbens (ventral striatum) is the _mesolimbic_ target of VTA dopaminergic neurons (reward); the _Parkinson's_ projection is from SNc to _dorsal_ striatum (caudate and putamen)."
- "thalamus" → "The dopaminergic projection is from SNc to _striatum_; the thalamus receives basal-ganglia output via GPi."

Explanation: The nigrostriatal projection is the system whose degeneration underlies the bradykinesia, rigidity, and tremor of Parkinson's disease [Guyton & Hall ch.46; Boron & Boulpaep ch.13]. Loss of dopaminergic input shifts the basal ganglia output toward the indirect pathway (D2 receptors normally inhibit indirect pathway striatal neurons), causing excessive thalamo-cortical inhibition and reduced movement. By the time motor symptoms appear, ~60–80% of nigrostriatal neurons are lost. Levodopa replacement and (later) deep brain stimulation of subthalamic nucleus or GPi remain the mainstays of treatment.

Hints:

1. The dorsal striatum — caudate and putamen.
2. Distinct from the mesolimbic projection (VTA → nucleus accumbens).
3. Loss of this system underlies Parkinson's bradykinesia and rigidity.

---

## Summary

This 45-question fill-in-the-blank set covers neurons and synaptic transmission across three passes. Pass 1 (Q1–16) anchors numerical values: synaptic delay, cleft width, gap junction geometry, vesicle ACh content, MEPP and EPSP amplitudes, axon initial segment threshold, EPSP duration, motor neuron resting potential, dendritic length, and the timescales of paired-pulse facilitation, fatigue, and synaptic dependence on cerebral perfusion. Pass 2 (Q17–32) defines named entities and concepts: SNARE complex, synaptobrevin/VAMP, synaptotagmin, quantum, EPSP and IPSP, autoreceptor, presynaptic inhibition, spatial summation, safety factor, ionotropic vs metabotropic, post-tetanic potentiation, long-term potentiation, axon initial segment, and choline acetyltransferase. Pass 3 (Q33–45) develops relational logic: Ca²⁺ as the release trigger, astrocytic glutamate–glutamine cycling, CHT1 choline recovery, Cl⁻ Nernst and the developmental switch in GABA action, NMDA Mg²⁺ block, SNARE-cleaving toxins (botulinum and tetanus), curare at the nicotinic AChR, strychnine at the glycine receptor, pyridostigmine in myasthenia, benzodiazepines at GABA-A, SSRIs at SERT, the locus coeruleus as noradrenergic source, and the SNc → striatum projection lost in Parkinson's disease.
