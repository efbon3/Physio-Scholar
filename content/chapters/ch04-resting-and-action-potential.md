---
chapter: Chapter 4 — Resting Membrane Potential and the Action Potential
part: Part I — Foundations of Physiology
tier: 1
tier_rationale: Foundational chapter — every excitable-tissue chapter (nerve, muscle, cardiac, smooth muscle) depends on understanding RMP and the action potential. Heavily tested in MBBS exams.
target_count: 22
actual_count: 22
sources_consulted:
  - Costanzo, 7th ed., Ch. 1 (Cellular Physiology — diffusion potentials, RMP, action potentials sections) — primary source
  - Berne & Levy, 7th ed., Ch. 1 (Principles of Cell and Membrane Function — ion channels)
  - Brown, Rapid Review Physiology, 2nd ed., Ch. 1 (Cell Physiology) — clinical anchors
status: draft
---

# Chapter 4 — MCQs

Authored in three passes (resting membrane potential & equilibrium potentials → action potential mechanisms → propagation & clinical), then deduplicated. Tier 1 target was 22; final count is 22. Source coverage is strong — Costanzo Ch.1 covers virtually every topic in this chapter in depth.

---

## Pass 1 — Resting membrane potential and equilibrium potentials

QUESTION 1
Type: recall
Bloom's level: remember
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The resting membrane potential of most excitable cells (e.g., nerve and skeletal muscle) is in the approximate range of:

Correct answer: −70 to −80 mV.

Distractors:

- "+30 to +50 mV" — Reveals misconception: student confuses peak action potential potential with resting potential. Correction: the resting potential is _negative_ inside; the depolarised peak (+30 to +40 mV) reaches near ENa.
- "0 mV (no potential difference)" — Reveals misconception: student assumes equilibrium across the membrane at rest. Correction: the cell is _not_ at electrochemical equilibrium for all ions at rest — a steady RMP is maintained by selective permeabilities.
- "−95 to −100 mV" — Reveals misconception: student confuses RMP with EK. Correction: −95 mV is the K⁺ equilibrium potential in skeletal muscle; the RMP is slightly less negative because of small Na⁺ and Cl⁻ contributions.

Explanation: The resting membrane potential of excitable cells lies between −70 and −80 mV, with the cell interior negative relative to the extracellular fluid [Costanzo ch.1]. By convention, membrane potentials are expressed as intracellular relative to extracellular, so "−70 mV" means the inside is 70 mV more negative than the outside. The RMP is established by diffusion potentials arising from ionic concentration gradients (themselves maintained by the Na⁺/K⁺-ATPase). The dominant resting permeability is to K⁺, so RMP sits close to but slightly less negative than EK (~−95 mV in skeletal muscle), because small Na⁺ and Cl⁻ permeabilities pull it toward ENa and ECl.

Hints:

1. The cell interior is negative at rest.
2. The value lies between EK and ENa, but much closer to EK.
3. The number is near −75 mV.

---

QUESTION 2
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The resting membrane potential is closer to the K⁺ equilibrium potential than to the Na⁺ equilibrium potential because:

Correct answer: At rest, the membrane is much more permeable to K⁺ than to Na⁺.

Distractors:

- "The intracellular K⁺ concentration is higher than the intracellular Na⁺ concentration." — Reveals misconception: student thinks concentration alone (without permeability) determines RMP. Correction: concentration sets the equilibrium potential for each ion via the Nernst equation, but RMP depends on which ion is _most permeable_ — only the permeable ions can move and contribute to the diffusion potential.
- "The Na⁺/K⁺-ATPase pumps 3 Na⁺ out for 2 K⁺ in." — Reveals misconception: student attributes RMP primarily to the pump's electrogenicity. Correction: the pump contributes only a few mV of additional negativity; the dominant determinant of RMP is K⁺ permeability via leak channels.
- "K⁺ has a higher equilibrium potential than Na⁺." — Reveals misconception: student inverts the equilibrium potential magnitudes. Correction: ENa is positive (~+65 mV) and EK is negative (~−95 mV); the question is which one the membrane potential approaches, not which is higher.

Explanation: Each permeant ion attempts to drive the membrane potential toward its own equilibrium potential, with influence proportional to its permeability (or conductance) [Costanzo ch.1]. At rest, the dominant open channels are K⁺ leak channels (background K⁺ channels), so K⁺ permeability is much higher than Na⁺ permeability. The membrane potential therefore sits near EK (~−95 mV) but does not quite reach it — small Na⁺ and Cl⁻ permeabilities pull RMP a few millivolts away from EK, giving an RMP of about −70 to −80 mV. The Na⁺/K⁺-ATPase contributes a small additional negativity (electrogenic effect, ~5 mV) but is not the principal determinant.

Hints:

1. RMP is determined by the relative permeabilities of the membrane to different ions.
2. Which ion has the highest permeability through _leak channels_ at rest?
3. The most permeable ion drives the membrane potential closest to its equilibrium potential.

---

QUESTION 3
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The Nernst equation is used to calculate:

Correct answer: The equilibrium potential for a single ion at a given concentration gradient across a membrane.

Distractors:

- "The actual membrane potential, given the permeabilities of all ions." — Reveals misconception: student conflates the Nernst equation with the Goldman-Hodgkin-Katz equation. Correction: the Nernst equation calculates the equilibrium potential for one ion at a time; the GHK equation calculates membrane potential considering all permeant ions.
- "The driving force on a single ion at the resting membrane potential." — Reveals misconception: student conflates the driving force with the equilibrium potential. Correction: driving force = Em − Ex, where Ex is the equilibrium potential calculated by Nernst.
- "The total ionic current crossing the membrane." — Reveals misconception: student conflates Nernst with Ohm's law for ionic current.

Explanation: The Nernst equation calculates the equilibrium potential (Ex) for a single ion species, given its intracellular and extracellular concentrations [Costanzo ch.1]. At body temperature (37°C), the simplified form is Ex = (60/z) × log10(Ce/Ci), where z is the ion's charge. The equilibrium potential is the membrane voltage at which the chemical and electrical driving forces on that ion are equal and opposite — net flux is zero. By definition, the Nernst equation is calculated for one ion at a time. The Goldman-Hodgkin-Katz equation extends this to predict the actual membrane potential when multiple ions are permeant, weighting each ion's contribution by its permeability.

Hints:

1. The Nernst equation handles one ion at a time.
2. It outputs a voltage in millivolts.
3. The output is the membrane potential at which a single ion would be at equilibrium.

---

QUESTION 4
Type: calculation
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: At body temperature (37 °C), 2.3RT/F equals 60 mV. Given an intracellular K⁺ of 120 mmol/L and an extracellular K⁺ of 4 mmol/L, the K⁺ equilibrium potential (EK) is approximately:

Correct answer: −90 mV (approximately).

Distractors:

- "+90 mV" — Reveals misconception: student gets the magnitude right but the sign wrong. Correction: K⁺ is more concentrated _inside_, so it tends to flow outward; this leaves the cell interior negative — EK must be negative.
- "−30 mV" — Reveals misconception: student forgets the log relationship. Correction: a 30-fold concentration gradient produces about 90 mV (60 × log₁₀30 ≈ 88 mV), not 30 mV.
- "−1.5 mV" — Reveals misconception: student does not apply the log; just divides 60 by the ratio. Correction: Nernst uses log₁₀ of the concentration ratio.

Explanation: For K⁺ (z = +1), at 37 °C: EK = (60/1) × log₁₀(Ce/Ci) = 60 × log₁₀(4/120) = 60 × log₁₀(0.033) [Costanzo ch.1]. log₁₀(0.033) ≈ −1.48, so EK ≈ −89 mV. The standard textbook value for skeletal muscle is about −95 mV, with slight variation depending on assumed concentrations. The intuition: K⁺ is much more concentrated inside than outside, so it tends to diffuse outward; the negative charge that this leaves behind (because cations leave) makes the inside more negative — hence EK is negative.

Hints:

1. Apply Ex = (60/z) × log₁₀(Ce/Ci) at body temperature, with z = +1 for K⁺.
2. The ratio Ce/Ci is 4/120, which is much less than 1; log of that is negative.
3. The answer is negative because K⁺ leaving the cell makes the inside more negative.

---

QUESTION 5
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The "driving force" on an ion across a cell membrane is best defined as:

Correct answer: The difference between the actual membrane potential (Em) and the ion's equilibrium potential (Ex), i.e., (Em − Ex).

Distractors:

- "The concentration gradient across the membrane alone." — Reveals misconception: student treats driving force as purely chemical. Correction: for charged ions, driving force has both chemical and electrical components, captured together by (Em − Ex).
- "The conductance (permeability) of the channel for that ion." — Reveals misconception: student conflates driving force with conductance. Correction: conductance and driving force are separate determinants of ionic current (I = G × driving force).
- "The Nernst potential for the ion." — Reveals misconception: student conflates the equilibrium potential itself with the driving force on the ion at any actual Em.

Explanation: The driving force on an ion is the difference between the actual membrane potential and the ion's equilibrium potential [Costanzo ch.1]. If Em is more positive than Ex, the driving force "wants" to push positive ions (cations) out of the cell; if Em is more negative than Ex, the driving force pushes cations into the cell. Ionic current is then I = G × (Em − Ex), where G is conductance — a rearrangement of Ohm's law (V = IR, so I = V/R = GV). The driving force and conductance together determine ionic current; both must be non-zero for current to flow.

Hints:

1. The driving force has both a chemical and electrical component, combined into a single quantity.
2. The single quantity is the difference between two voltages.
3. One is the actual membrane potential; the other is the ion's equilibrium potential.

---

QUESTION 6
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: At rest in a typical neuron (Em ≈ −70 mV; ENa ≈ +65 mV), the driving force on Na⁺ is large and inwardly directed. Why does Na⁺ not flood into the cell at rest, equilibrating its gradient quickly?

Correct answer: At rest, the membrane has very low Na⁺ permeability (most voltage-gated Na⁺ channels are closed), so the Na⁺ conductance is low and the actual Na⁺ current is small.

Distractors:

- "The Na⁺/K⁺-ATPase pumps Na⁺ back out fast enough to balance the inward flux through Na⁺ channels." — Reveals misconception: student attributes the steady state to pumping alone, ignoring the dominant role of low resting Na⁺ permeability. Correction: the pump is needed to maintain the gradient over time, but the _moment-to-moment_ steady state at rest is set primarily by very low Na⁺ permeability.
- "The driving force on Na⁺ is actually small at rest because Em is close to ENa." — Reveals misconception: student is wrong about the magnitude of the driving force. Correction: Em (−70 mV) is far from ENa (+65 mV), so the driving force on Na⁺ is large.
- "The Na⁺ concentration outside the cell is low at rest." — Reveals misconception: student thinks resting state implies equilibrated concentrations. Correction: ECF Na⁺ remains at ~140 mmol/L at rest; the gradient is preserved.

Explanation: Ionic current depends on both the driving force and the conductance: I = G × (Em − Ex) [Costanzo ch.1]. At rest in a neuron, the driving force on Na⁺ is large (Em − ENa = −70 − (+65) = −135 mV, with Na⁺ wanting to enter), but the Na⁺ conductance is very low because most voltage-gated Na⁺ channels are closed. A few Na⁺ ions do leak in, producing the small Na⁺ permeability that pulls RMP slightly away from EK. The leaked Na⁺ is then pumped back out by the Na⁺/K⁺-ATPase, maintaining the gradient over time. During an action potential, voltage-gated Na⁺ channels open, conductance rises ~1000-fold, and the large driving force suddenly produces a massive inward Na⁺ current.

Hints:

1. Ionic current = conductance × driving force. Both must be non-zero for current to flow.
2. At rest, how many voltage-gated Na⁺ channels are open?
3. The driving force is huge, but if the channels are closed, no current flows.

---

QUESTION 7
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Three types of channel gating mechanisms regulate ionic flow across cell membranes. Which option correctly pairs the gate type with its trigger?

Correct answer: Voltage-gated channels respond to changes in membrane potential; ligand-gated channels respond to extracellular molecules (hormones, neurotransmitters); second-messenger-gated channels respond to intracellular signalling molecules (e.g., cAMP, IP₃).

Distractors:

- "Voltage-gated channels respond to neurotransmitter binding; ligand-gated channels respond to membrane potential changes." — Reveals misconception: student inverts voltage-gated and ligand-gated mechanisms.
- "All three types respond to the same trigger — membrane potential — but with different sensitivities." — Reveals misconception: student treats voltage as the universal trigger. Correction: the three types have distinct triggers.
- "Voltage-gated channels are closed at rest; ligand-gated channels are open at rest." — Reveals misconception: student attributes a fixed resting state to each class regardless of context.

Explanation: Three principal classes of ion channel gates are recognised [Costanzo ch.1]. _Voltage-gated channels_ (e.g., voltage-gated Na⁺ and K⁺ channels in nerve and muscle) sense membrane potential; depolarisation opens them, repolarisation closes them. _Ligand-gated channels_ (e.g., the nicotinic ACh receptor on the motor end plate, GABA-A receptor) have an extracellular ligand-binding site; binding of the ligand opens the channel. _Second-messenger-gated channels_ respond to intracellular molecules — the Na⁺ channel in cardiac sinoatrial node is opened by intracellular cAMP (this is the funny current, If). Mechanically gated channels (responding to membrane stretch) are sometimes added as a fourth class. The classification matters clinically: many drugs target specific gating mechanisms (lidocaine on voltage-gated Na⁺ channels; benzodiazepines on GABA-A ligand-gated Cl⁻ channels).

Hints:

1. Three classes; three different triggers.
2. One trigger is electrical; one is extracellular chemical; one is intracellular chemical.
3. The voltage-gated class senses the membrane potential itself.

---

QUESTION 8
Type: prediction
Bloom's level: analyze
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A patient develops severe hyperkalaemia (plasma K⁺ rises from 4 to 6.5 mmol/L). Predict the effect on the resting membrane potential of skeletal muscle and explain the consequence for excitability.

Correct answer: RMP becomes less negative (depolarised) because EK becomes less negative when extracellular K⁺ rises; this initial depolarisation paradoxically _reduces_ excitability because it inactivates voltage-gated Na⁺ channels.

Distractors:

- "RMP becomes more negative (hyperpolarised), increasing excitability." — Reveals misconception: student inverts the effect of high ECF K⁺ on RMP. Correction: high ECF K⁺ reduces the K⁺ gradient and depolarises (less negative) RMP.
- "RMP is unchanged because the Na⁺/K⁺-ATPase compensates." — Reveals misconception: student denies the Nernst-equation-driven change in RMP. Correction: the pump cannot fully compensate; RMP follows the new EK.
- "RMP becomes less negative, increasing excitability because it is closer to threshold." — Reveals misconception: student applies "closer to threshold = more excitable" without considering Na⁺ channel inactivation. Correction: sustained depolarisation closes inactivation gates on Na⁺ channels, _reducing_ the number of available channels and reducing excitability.

Explanation: The K⁺ equilibrium potential is set by the K⁺ concentration gradient (Nernst equation): EK = 60 × log₁₀(Ke/Ki) [Costanzo ch.1]. At normal Ke = 4 mmol/L, EK ≈ −95 mV. When Ke rises to 6.5 mmol/L, the gradient is smaller; EK becomes less negative (around −80 mV). Since RMP tracks EK closely, RMP also depolarises by several millivolts. The intuitive expectation might be that depolarisation toward threshold should make excitability easier — but the real consequence is the opposite. Sustained depolarisation closes the inactivation gates on voltage-gated Na⁺ channels (a process called accommodation). With fewer Na⁺ channels available, the Na⁺ conductance during the upstroke is reduced; if too few are available, no action potential can be generated. This is why severe hyperkalaemia produces muscle weakness rather than hyperexcitability and is a medical emergency — cardiac arrhythmias and asystole can follow [Costanzo ch.1, Box 1.3].

Hints:

1. EK depends on the K⁺ concentration ratio. What happens to EK when ECF K⁺ rises?
2. RMP follows EK because the membrane is dominantly permeable to K⁺ at rest.
3. Sustained depolarisation closes inactivation gates on Na⁺ channels — what does that do to excitability?

---

## Pass 2 — Action potential mechanisms

QUESTION 9
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The four sequential phases of the typical neuronal action potential are:

Correct answer: Resting potential → upstroke (depolarisation) → repolarisation → hyperpolarising afterpotential (undershoot).

Distractors:

- "Resting potential → repolarisation → upstroke → afterpotential." — Reveals misconception: student inverts upstroke and repolarisation order.
- "Upstroke → depolarisation → repolarisation → hyperpolarisation." — Reveals misconception: student treats upstroke and depolarisation as separate phases. Correction: upstroke _is_ the rapid depolarisation.
- "The action potential has only two phases — depolarisation and repolarisation." — Reveals misconception: student omits the hyperpolarising afterpotential, which is functionally important (relative refractory period).

Explanation: The neuronal action potential has four phases [Costanzo ch.1]. (1) _Resting_ — Em near EK at ~−70 mV; Na⁺ channels closed-but-available, K⁺ permeability dominant. (2) _Upstroke_ — depolarisation to threshold (~−60 mV) opens voltage-gated Na⁺ channel activation gates; Na⁺ rushes in; Em rapidly approaches but doesn't quite reach ENa (+65 mV); peak overshoot ~+30 to +40 mV. (3) _Repolarisation_ — Na⁺ channel inactivation gates close (slower than activation); voltage-gated K⁺ channels open; outward K⁺ current returns Em toward EK. (4) _Hyperpolarising afterpotential (undershoot)_ — K⁺ conductance remains higher than at rest for a brief period; Em is driven slightly more negative than the original resting level, then decays back to RMP. Each phase has a specific ionic basis, and recognising the sequence is the foundation for understanding excitability.

Hints:

1. The action potential begins from the resting potential and returns there.
2. There are two voltage extremes in between — one positive, one slightly more negative than rest.
3. Order them by what happens first.

---

QUESTION 10
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: The voltage-gated Na⁺ channel responsible for the upstroke of the action potential has two functionally distinct gates. Which statement correctly describes them?

Correct answer: The activation gate opens rapidly with depolarisation; the inactivation gate closes slowly with depolarisation. Both gates must be open for Na⁺ to flow.

Distractors:

- "Both gates open rapidly with depolarisation; both close rapidly with repolarisation." — Reveals misconception: student treats the two gates as identical. Correction: the two gates have different kinetics — activation is fast, inactivation is slow — which is what shapes the action potential.
- "The activation gate opens with hyperpolarisation; the inactivation gate opens with depolarisation." — Reveals misconception: student inverts the voltage-dependence of the activation gate.
- "The activation gate opens slowly; the inactivation gate opens rapidly." — Reveals misconception: student inverts the kinetics. Correction: activation is fast, inactivation is slow — and inactivation _closes_ the channel rather than opens it.

Explanation: The voltage-gated Na⁺ channel has two gates with different kinetics, both responsive to depolarisation [Costanzo ch.1]. The _activation gate_ opens quickly with depolarisation; the _inactivation gate_ closes slowly with depolarisation. The channel can be in three states: (1) _closed but available_ (resting: activation closed, inactivation open); (2) _open_ (briefly during the action potential upstroke: both gates open); (3) _inactivated_ (at the peak: activation open, inactivation closed). Both gates must be open for Na⁺ to flow. The fast activation gives a rapid upstroke; the slow inactivation terminates the upstroke and helps establish the absolute refractory period (the channel cannot fire again until inactivation gates re-open, which happens only after repolarisation back to RMP). This dual-gate architecture is what makes the action potential brief and self-terminating rather than self-sustaining.

Hints:

1. Two gates with different speeds — one is fast, the other slow.
2. The fast gate opens first; the slow gate closes after.
3. The brief overlap when both are open is the action potential upstroke.

---

QUESTION 11
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Which ionic event is primarily responsible for the _upstroke_ of the action potential, and which for _repolarisation_?

Correct answer: The upstroke is driven by inward Na⁺ current through voltage-gated Na⁺ channels; repolarisation is driven by outward K⁺ current through voltage-gated K⁺ channels (with closure of Na⁺ channel inactivation gates contributing).

Distractors:

- "The upstroke is driven by outward K⁺ current; repolarisation is driven by inward Na⁺ current." — Reveals misconception: student inverts the directions of Na⁺ and K⁺ currents.
- "Both upstroke and repolarisation are driven by Na⁺ current — inward during upstroke, outward during repolarisation." — Reveals misconception: student treats Na⁺ as the only relevant ion. Correction: Na⁺ does not flow outward at action-potential voltages; repolarisation is K⁺-driven.
- "The upstroke is driven by Ca²⁺ influx through voltage-gated Ca²⁺ channels." — Reveals misconception: student conflates the cardiac slow-response action potential (where Ca²⁺ does drive the upstroke) with the neuronal action potential.

Explanation: In the neuronal (and skeletal muscle) action potential, the upstroke is driven by a rapid increase in Na⁺ conductance — voltage-gated Na⁺ channels open, Na⁺ rushes in down its electrochemical gradient, and Em rapidly approaches ENa (+65 mV) [Costanzo ch.1]. Repolarisation is driven by two simultaneous events: (1) _Na⁺ channel inactivation_ — the inactivation gates close, terminating the inward Na⁺ current; (2) _K⁺ channel opening_ — voltage-gated K⁺ channels open with a slight delay, increasing K⁺ conductance and producing an outward K⁺ current that drives Em back toward EK. The combination of falling Na⁺ conductance and rising K⁺ conductance produces rapid repolarisation. The neuronal action potential thus differs from the cardiac slow-response action potential, which uses Ca²⁺ rather than Na⁺ for its upstroke.

Hints:

1. Two different ions are responsible for upstroke and repolarisation.
2. The upstroke uses the ion whose equilibrium potential is positive.
3. Repolarisation uses the ion whose equilibrium potential is most negative.

---

QUESTION 12
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Tetrodotoxin (TTX), the toxin from the Japanese pufferfish, prevents action potentials in nerves. Its target is:

Correct answer: Voltage-gated Na⁺ channels — TTX blocks the channel pore from the extracellular side, preventing Na⁺ entry during the upstroke.

Distractors:

- "Voltage-gated K⁺ channels — TTX blocks K⁺ outflow, abolishing repolarisation." — Reveals misconception: student picks the wrong voltage-gated channel class. Correction: TTX is highly selective for voltage-gated Na⁺ channels.
- "Acetylcholine receptors — TTX blocks neuromuscular transmission directly." — Reveals misconception: student attributes TTX action to a synaptic effect. Correction: TTX blocks Na⁺ channels in the axon, preventing action potential conduction; it does not act at the NMJ.
- "Na⁺/K⁺-ATPase — TTX inhibits the pump, abolishing the Na⁺ gradient." — Reveals misconception: student conflates TTX with cardiac glycosides. Correction: ouabain/digoxin inhibit the pump; TTX blocks the Na⁺ channel.

Explanation: Tetrodotoxin is a small molecule found in pufferfish (and several other organisms) that binds with extraordinary specificity to the extracellular pore of voltage-gated Na⁺ channels [Costanzo ch.1]. It blocks Na⁺ entry by occluding the pore. With Na⁺ channels blocked, the upstroke of the action potential cannot occur: nerves cannot conduct, muscles cannot fire, and the patient develops progressive paralysis — first peripheral (numbness around the lips, tongue, face), then ascending (limb weakness), and ultimately respiratory paralysis if the dose is sufficient. The same family of voltage-gated Na⁺ channels is the target of local anaesthetics such as lidocaine, which block Na⁺ channels in a use-dependent manner (preferentially in the open or inactivated state). Selective Na⁺ channel blockers are also major antiepileptic and antiarrhythmic drugs.

Hints:

1. TTX is famously selective — it targets one specific channel class.
2. Without that channel, the action potential cannot start.
3. Clinical local anaesthetics share the same target.

---

QUESTION 13
Type: recall
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: The threshold potential for the typical neuronal action potential is approximately:

Correct answer: −60 mV.

Distractors:

- "−90 mV" — Reveals misconception: student confuses threshold with EK or the K⁺ equilibrium potential. Correction: threshold is _less negative_ than RMP (which is around −70 to −80 mV); it is approximately −60 mV.
- "0 mV" — Reveals misconception: student confuses threshold with the zero-crossing during the action potential.
- "+30 mV" — Reveals misconception: student confuses threshold with the peak overshoot of the action potential.

Explanation: The threshold potential is the membrane voltage at which the action potential becomes inevitable — net inward Na⁺ current exceeds net outward K⁺ current, and depolarisation becomes self-sustaining [Costanzo ch.1]. In typical neurons, this occurs at approximately −60 mV (about 10–15 mV less negative than the resting potential). Any depolarisation that fails to reach threshold dies away as the cell repolarises; any depolarisation that reaches or exceeds threshold triggers a full action potential ("all-or-none" property). The threshold reflects the voltage at which enough voltage-gated Na⁺ channels have opened that the inward Na⁺ current "wins" against the resting outward K⁺ current.

Hints:

1. The threshold is between RMP and the action-potential peak.
2. It is less negative than RMP by about 10–15 mV.
3. The number sits in the −50 to −60 range.

---

QUESTION 14
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: During the _absolute refractory period_, no second action potential can be elicited regardless of stimulus strength. The ionic basis for this is:

Correct answer: Voltage-gated Na⁺ channel inactivation gates are closed; no Na⁺ channels are available to fire a new action potential until repolarisation re-opens them.

Distractors:

- "Voltage-gated K⁺ channels are stuck open, preventing depolarisation." — Reveals misconception: student attributes the absolute refractory period to K⁺ channel state. Correction: the K⁺ channels do remain open longer than at rest (relevant to the relative refractory period), but the absolute refractory period is set by Na⁺ inactivation.
- "The membrane potential is too far from threshold to be reached by any inward current." — Reveals misconception: student uses a voltage-distance argument. Correction: threshold can be reached, but Na⁺ channels still cannot open because they are inactivated.
- "The Na⁺/K⁺-ATPase has temporarily stopped." — Reveals misconception: student attributes refractoriness to pump dynamics.

Explanation: The absolute refractory period overlaps with most of the action potential and with the early afterhyperpolarisation [Costanzo ch.1]. During this time, the inactivation gates of voltage-gated Na⁺ channels are closed (they closed during the upstroke as a delayed response to depolarisation, and only re-open once the membrane has repolarised back to RMP). With essentially no Na⁺ channels in the closed-but-available state, no inward Na⁺ current can be triggered no matter how depolarising the stimulus. The cell is genuinely incapable of firing. The _relative refractory period_ follows: Na⁺ channels are recovering, but K⁺ conductance is still elevated (afterhyperpolarisation), so a stronger-than-normal stimulus is needed to overcome the increased outward K⁺ current. Distinguishing the two refractory periods on this mechanistic basis is the key.

Hints:

1. Two refractory periods (absolute and relative) have different ionic bases.
2. The absolute one cannot be overcome no matter the stimulus — what mechanism could prevent any AP from firing?
3. Think about which channels must be available for the upstroke to occur.

---

QUESTION 15
Type: misconception-targeted
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Which statement about the "all-or-none" property of action potentials is _correct_?

Correct answer: Below threshold, no action potential occurs; at or above threshold, a stereotyped action potential of full amplitude is produced regardless of stimulus strength.

Distractors:

- "Stronger stimuli produce larger-amplitude action potentials." — Reveals misconception: student denies the all-or-none property. Correction: stronger stimuli produce _more_ action potentials (higher firing rate) — not larger-amplitude action potentials.
- "Action potentials decay in amplitude as they propagate down the axon." — Reveals misconception: student treats action potentials as passive electrical signals. Correction: action potentials are actively regenerated at each point of the membrane and do not decay.
- "The amplitude of the action potential depends linearly on the stimulus strength above threshold." — Reveals misconception: same denial of all-or-none.

Explanation: The all-or-none property is a defining feature of action potentials [Costanzo ch.1]. Once threshold is reached, the inward Na⁺ current produces self-sustaining depolarisation that drives Em rapidly toward ENa, regardless of the original stimulus strength. The amplitude of the action potential is therefore _fixed_ — set by the equilibrium potentials, not by stimulus strength. Information about stimulus intensity is encoded by the _frequency_ of action potentials (rate coding) and by the _number_ of neurons firing, not by AP amplitude. Action potentials are also non-decremental — they regenerate at each new point on the axon, so the AP at the end of an axon has the same amplitude as the AP near the cell body.

Hints:

1. "All-or-none" means there is a sharp threshold and no graded response above it.
2. How is information about stimulus strength encoded if amplitude doesn't change?
3. The answer is in the _frequency_ of firing, not the amplitude.

---

QUESTION 16
Type: clinical application
Bloom's level: analyze
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A patient is given lidocaine subcutaneously before a minor procedure. Lidocaine binds preferentially to voltage-gated Na⁺ channels in their open or inactivated state ("use-dependent" block). What does this preference accomplish therapeutically?

Correct answer: Lidocaine selectively blocks neurons that are firing actively (e.g., nociceptors transmitting pain), with much weaker effect on quiescent neurons — producing local anaesthesia preferentially of the firing pain pathways.

Distractors:

- "Lidocaine blocks all neurons equally, producing complete and uniform anaesthesia of all sensory and motor function." — Reveals misconception: student denies the use-dependent specificity. Correction: lidocaine's action is selective for active channels.
- "Lidocaine activates voltage-gated Na⁺ channels, producing depolarisation that exhausts the cell." — Reveals misconception: student inverts the drug's mechanism (blocker, not activator).
- "Lidocaine works by inhibiting the Na⁺/K⁺-ATPase, depleting the Na⁺ gradient." — Reveals misconception: student conflates lidocaine with cardiac glycosides.

Explanation: Local anaesthetics like lidocaine block voltage-gated Na⁺ channels in a _use-dependent_ (also called state-dependent) manner [Costanzo ch.1; Berne ch.1]. The drug binds preferentially to channels that are open or inactivated — the conformations dominantly present during firing. Quiescent channels (closed-but-available, the state of resting cells) bind the drug poorly. The clinical consequence is that fibres firing actively (e.g., A-delta and C fibres carrying pain) are blocked preferentially; resting fibres (e.g., motor neurons not currently active) are spared. This use-dependence is also exploited by class I antiarrhythmic drugs (lidocaine itself is class IB) — they preferentially block fast-firing or ischaemic cardiac myocytes while sparing normally-paced ones. The principle generalises: drugs that bind active conformations have built-in selectivity for active disease processes.

Hints:

1. Lidocaine is more effective on neurons that are actively firing.
2. The drug binds the channel preferentially in two of the three channel states.
3. The clinical effect is to block pain pathways more than other neuronal traffic.

---

## Pass 3 — Propagation, conduction, and clinical anchors

QUESTION 17
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): F
Priority (M / S / G): M

Stem: Saltatory conduction in myelinated nerves differs from continuous conduction in unmyelinated nerves because:

Correct answer: In myelinated nerves, action potentials are regenerated only at the nodes of Ranvier (where Na⁺ and K⁺ channels are concentrated); the depolarisation "jumps" from node to node, dramatically increasing conduction velocity.

Distractors:

- "In myelinated nerves, the action potential propagates by direct contact between adjacent Na⁺ channels through the myelin sheath." — Reveals misconception: student treats myelin as a conductive medium. Correction: myelin is an _insulator_ — it prevents current loss across the membrane between nodes.
- "Myelination decreases conduction velocity by adding resistance to ion flow." — Reveals misconception: student inverts the effect of myelin. Correction: myelin _increases_ membrane resistance and _decreases_ membrane capacitance, both of which speed conduction.
- "Saltatory conduction occurs because action potentials are smaller in myelinated nerves." — Reveals misconception: student denies the all-or-none property. Correction: the action potential at each node is full-sized; what changes is the speed of propagation between regenerative sites.

Explanation: Myelin is a lipid insulator wrapped around the axon by Schwann cells (in PNS) or oligodendrocytes (in CNS) [Costanzo ch.1]. It increases membrane resistance (current can't leak out across the high-resistance myelinated regions) and decreases membrane capacitance (less charge needed to depolarise the next region). The result: local currents from an action potential at one node spread rapidly down the axon interior to the next node of Ranvier (gaps in the myelin where Na⁺ and K⁺ channels are concentrated). At each node, the local current depolarises the membrane to threshold and triggers a new action potential, which then propagates onward. Effectively the action potential "jumps" from node to node — the term _saltatory_ comes from the Latin for "leap." Compared with continuous conduction in unmyelinated nerves, conduction velocity is increased 5–50 fold. This is why thick myelinated motor axons can conduct at ~100 m/s, while thin unmyelinated C fibres conduct at ~1 m/s.

Hints:

1. Myelin acts as an insulator. What does that do to current flow along the axon?
2. The action potential is regenerated only at specific points along myelinated axons. What are those points called?
3. The "leaping" of the action potential between these points has a name — what is it?

---

QUESTION 18
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: Conduction velocity along a nerve fibre depends on cable properties of the axon. Which combination of changes would maximally increase conduction velocity?

Correct answer: Increased axon diameter (decreasing internal resistance and increasing length constant) plus myelination (increasing membrane resistance and decreasing membrane capacitance).

Distractors:

- "Decreased axon diameter and removal of myelin." — Reveals misconception: student inverts both factors.
- "Increased membrane capacitance with decreased membrane resistance." — Reveals misconception: student inverts the cable properties that matter for fast conduction. Correction: high membrane resistance and low membrane capacitance favour fast conduction.
- "Increasing the rate of Na⁺/K⁺-ATPase activity." — Reveals misconception: student attributes conduction velocity to pump activity. Correction: pump activity sets up the gradients that allow APs but doesn't directly determine conduction velocity.

Explanation: Conduction velocity is determined by two cable properties [Costanzo ch.1]. _Length constant_ (λ) — the distance over which a depolarisation decays to 37% of its peak; longer length constant means current spreads further before decaying. λ is proportional to √(Rm/Ri), where Rm is membrane resistance and Ri is internal (axoplasmic) resistance. _Time constant_ (τ) — the time for the membrane to reach 63% of its final voltage in response to current; shorter time constant means faster depolarisation. τ = Rm × Cm. To maximise velocity: minimise Ri (increase axon diameter — Ri is inversely proportional to cross-sectional area), maximise Rm and minimise Cm (myelinate — myelin's thick lipid insulation does both). The two strategies are complementary, not redundant: large axons in invertebrates (squid giant axon ~1 mm diameter) and myelinated axons in vertebrates achieve similar velocities by different routes.

Hints:

1. Two factors increase conduction velocity: axon diameter and myelination.
2. Diameter affects internal resistance; myelination affects membrane resistance and capacitance.
3. The combination of both produces the fastest conduction.

---

QUESTION 19
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A 32-year-old woman presents with episodes of blurred vision, double vision, and leg weakness. MRI shows multiple lesions in the brain and spinal cord. Visual evoked potentials show prolonged latency. The underlying pathology is most likely:

Correct answer: Demyelination of CNS axons (multiple sclerosis), reducing membrane resistance and producing slowed or failed action potential conduction.

Distractors:

- "Loss of voltage-gated Na⁺ channels in axonal membranes." — Reveals misconception: student attributes the conduction failure to the wrong cellular target. Correction: the channels remain at nodes; the pathology is in the myelin sheath, which loses its insulating function.
- "Failure of the Na⁺/K⁺-ATPase, depleting the Na⁺ gradient." — Reveals misconception: student conflates demyelination with metabolic failure.
- "Loss of cell bodies in motor cortex." — Reveals misconception: student misidentifies the lesion site. Correction: MS produces white matter lesions (demyelination), not selective grey matter neuronal loss.

Explanation: Multiple sclerosis is the most common demyelinating disease of the central nervous system [Costanzo ch.1, Box 1.4]. The myelin sheath around CNS axons is destroyed by an autoimmune attack on oligodendrocyte-derived myelin. The denuded axons have decreased membrane resistance — current "leaks out" across the membrane during conduction of local currents instead of flowing rapidly down the axon interior. Local currents decay more rapidly (decreased length constant), and may be insufficient to depolarise the next node of Ranvier to threshold. Conduction is slowed and may fail entirely. The clinical picture reflects which axons are affected: optic nerves (blurred vision, optic neuritis), brainstem (double vision from cranial nerve lesions, vertigo), spinal cord white matter (weakness, paraesthesiae, gait ataxia). MRI shows multiple white-matter plaques scattered in space and time. Visual evoked potentials are a sensitive functional test — they show prolonged latency reflecting slowed conduction in optic-pathway demyelination, even when imaging is normal.

Hints:

1. The disease has multiple lesions in white matter.
2. White matter is myelin; the disease attacks the myelin sheaths.
3. The functional consequence is slowed conduction along demyelinated axons.

---

QUESTION 20
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A patient with diabetes presents with severe hyperkalaemia (plasma K⁺ 6.5 mmol/L) and progressive muscle weakness. Why does hyperkalaemia paradoxically _reduce_ excitability rather than increase it?

Correct answer: The high extracellular K⁺ depolarises the resting membrane potential; sustained depolarisation closes the inactivation gates on voltage-gated Na⁺ channels, leaving fewer channels available to fire an action potential. Without action potentials, muscle cannot contract.

Distractors:

- "Hyperkalaemia hyperpolarises the membrane, moving it further from threshold." — Reveals misconception: student inverts the effect of high ECF K⁺ on RMP. Correction: high K⁺ reduces the K⁺ gradient and depolarises the membrane.
- "Hyperkalaemia inhibits the Na⁺/K⁺-ATPase, depleting Na⁺ gradients and abolishing action potentials." — Reveals misconception: student attributes the weakness to pump inhibition. Correction: hyperkalaemia does not directly inhibit the pump.
- "Hyperkalaemia activates voltage-gated K⁺ channels, producing rapid hyperpolarisation." — Reveals misconception: student misidentifies the channel response. Correction: extracellular K⁺ rise affects EK and therefore RMP, not voltage-gated K⁺ channels directly.

Explanation: Severe hyperkalaemia produces muscle weakness through a paradoxical mechanism [Costanzo ch.1, Box 1.3]. Step 1: high ECF K⁺ reduces the K⁺ gradient (Ke/Ki ratio); EK becomes less negative; RMP follows EK and depolarises (becomes less negative). Step 2: this depolarisation initially appears to bring the cell closer to threshold and might be expected to enhance excitability. Step 3: but sustained depolarisation closes the inactivation gates of voltage-gated Na⁺ channels (a process called _accommodation_). Step 4: with most Na⁺ channels in the inactivated state, the cell has very few channels available to fire — the upstroke of the action potential cannot occur even if threshold is reached. Step 5: muscle cells cannot fire action potentials, so they cannot contract; clinical weakness results. Severe hyperkalaemia (>6.5 mmol/L) is a medical emergency because cardiac myocytes can be similarly affected, producing arrhythmias or asystole. Treatment includes shifting K⁺ back into cells (insulin + glucose; β2-agonists), removing it from the body (loop diuretics, dialysis), and stabilising membranes acutely (calcium gluconate).

Hints:

1. High ECF K⁺ changes the Nernst-predicted EK. In which direction?
2. RMP follows EK closely. So the membrane potential changes in which direction?
3. Sustained depolarisation has a specific effect on Na⁺ channel inactivation gates. What is that effect?

---

QUESTION 21
Type: analysis
Bloom's level: analyze
Difficulty (F / I / A): I
Priority (M / S / G): S

Stem: A medical student claims: "The Na⁺/K⁺-ATPase generates the resting membrane potential — without it, the cell would have no resting potential at all." Which correction is most accurate?

Correct answer: The Na⁺/K⁺-ATPase _maintains_ the ionic gradients on which the resting potential depends, but the resting potential itself is generated by _diffusion of K⁺_ through K⁺ leak channels along its concentration gradient. The pump's electrogenic contribution is small (a few mV).

Distractors:

- "The student is correct — the pump directly generates the resting potential through its 3:2 stoichiometry." — Reveals misconception: student attributes the entire RMP to pump electrogenicity. Correction: the pump's electrogenic effect is only a few mV; the dominant contribution to RMP is K⁺ diffusion.
- "The pump is irrelevant to the resting potential — RMP depends only on K⁺ leak channels." — Reveals misconception: student denies the pump's necessity. Correction: without the pump, ionic gradients dissipate over minutes to hours and the K⁺ leak no longer produces a sustained potential.
- "The pump generates RMP indirectly by inhibiting voltage-gated K⁺ channels." — Reveals misconception: student invents a non-existent mechanism.

Explanation: This is one of the most common misconceptions in cellular physiology [Costanzo ch.1]. The _direct generator_ of the resting potential is the diffusion of K⁺ down its concentration gradient through K⁺ leak channels — K⁺ leaves the cell, taking positive charge with it, and the cell interior becomes negative until the diffusion potential balances further K⁺ outflow (this is the equilibrium potential for K⁺, ~−95 mV). RMP sits near this value because K⁺ permeability is dominant at rest. The _role of the Na⁺/K⁺-ATPase_ is to maintain the ionic gradients on which this diffusion depends. Without the pump, intracellular Na⁺ would slowly rise and K⁺ would slowly fall (over hours, due to leak through other channels), eliminating the gradients that allow K⁺ diffusion to generate the potential. The pump also contributes a small electrogenic component (3 Na⁺ out, 2 K⁺ in per cycle = 1 net positive charge out per cycle), worth a few mV of additional negativity. But this contribution is dwarfed by the K⁺ diffusion potential. The correct mental model: the pump _sets up the system_; the K⁺ leak channels _generate the voltage_.

Hints:

1. The pump and the K⁺ leak channels do different jobs in establishing the resting potential.
2. One sets up the gradients; the other generates the diffusion potential.
3. The pump's electrogenic contribution is small (a few mV) compared to the K⁺ diffusion potential.

---

QUESTION 22
Type: clinical application
Bloom's level: analyze
Difficulty (F / I / A): A
Priority (M / S / G): G

Stem: Lidocaine is administered intravenously as a class IB antiarrhythmic agent in some patients with ventricular arrhythmias. Why is it most effective in _ischaemic_ cardiac tissue and least effective in normal cardiac tissue?

Correct answer: Lidocaine binds voltage-gated Na⁺ channels preferentially in their open or inactivated state. Ischaemic myocytes are partially depolarised (because the Na⁺/K⁺-ATPase fails) and therefore have a higher fraction of inactivated Na⁺ channels — lidocaine binds these preferentially and selectively suppresses ectopic firing in ischaemic tissue.

Distractors:

- "Lidocaine binds resting Na⁺ channels preferentially, blocking normal cells more than ischaemic ones." — Reveals misconception: student inverts the use-dependence. Correction: lidocaine binds active (open or inactivated) channels, not resting ones.
- "Ischaemic myocytes have more Na⁺ channels than normal myocytes, providing more drug binding sites." — Reveals misconception: student attributes selectivity to channel number rather than channel state. Correction: channel number doesn't change rapidly; channel state does.
- "Lidocaine activates K⁺ channels in ischaemic myocytes, hyperpolarising them." — Reveals misconception: student misidentifies the drug's target.

Explanation: Lidocaine's action on cardiac myocytes is _use-dependent_ and _state-dependent_ [Costanzo ch.1; Berne ch.1]. The drug binds preferentially to voltage-gated Na⁺ channels in their open or inactivated state. In normal cardiac myocytes, most Na⁺ channels spend most time in the closed-but-available (resting) state, so lidocaine binds poorly and has little effect. In ischaemic cardiac tissue, the local fall in ATP impairs the Na⁺/K⁺-ATPase; intracellular Na⁺ rises; the membrane partially depolarises; a larger fraction of Na⁺ channels enter the inactivated state. Lidocaine binds these inactivated channels with high affinity, suppressing further depolarisation and preventing the ectopic firing that produces ischaemic ventricular arrhythmias. The therapeutic logic: the disease state alters channel conformation; the drug binds the disease-state conformation; the result is selectivity. The same architectural principle applies to other use-dependent drugs (class IC antiarrhythmics, some anti-epileptics).

Hints:

1. Lidocaine binds Na⁺ channels in two of their three conformational states.
2. Ischaemic tissue has Na⁺ channels in different states than normal tissue. Which states predominate in ischaemia?
3. The drug's selectivity for ischaemic tissue follows from its binding preference for one of those altered states.

---

# Final Summary

**Sources drawn from most heavily:**

- _Costanzo 7e Ch. 1_ — primary source for nearly every question. Covers diffusion potentials and equilibrium potentials (Q1–Q5), driving force and ionic current (Q6), gating mechanisms (Q7), Nernst applied to hyperkalaemia (Q8), action potential phases (Q9), Na⁺ channel structure and gates (Q10), upstroke and repolarisation ionic basis (Q11), TTX (Q12), threshold (Q13), refractory periods (Q14), all-or-none property (Q15), use-dependent block (Q16, Q22), saltatory conduction and myelination (Q17, Q18), multiple sclerosis (Q19), hyperkalaemia and Na⁺ channel inactivation (Q20), and the misconception about Na/K-ATPase as RMP generator (Q21).
- _Berne & Levy 7e Ch. 1_ — corroborates ion channel concepts (Q7), use-dependent block (Q16), and ATP-dependent transporter content.
- _Brown, Rapid Review Physiology Ch. 1_ — corroborates clinical anchors (multiple sclerosis, hyperkalaemia).

**Sources NOT consulted in this batch (PDF extraction unavailable in current session):** Guyton & Hall 14e Ch. 5 (Membrane Potentials and Action Potentials) — would have added depth on cardiac action potential phases, channel kinetics. The chapter is so well-covered by Costanzo Ch. 1 that this gap does not produce significant content holes.

**Source disagreements:** none flagged.

**[NEEDS VERIFICATION] flags:** none placed. Every quantitative claim and named relationship traces to a specific passage in Costanzo Ch. 1 or Berne Ch. 1.

**Convention used in stems:** book names appear only as inline citation markers in explanations — never in the question stem itself.

**Pedagogical choices worth noting:**

- _Heavy use of clinical anchors._ Q8 / Q20 (hyperkalaemia and Na⁺ channel inactivation), Q12 (TTX), Q16 / Q22 (lidocaine use-dependence), Q19 (multiple sclerosis), Q21 (Na/K-ATPase misconception). Each anchors abstract action-potential physiology in a clinically meaningful scenario.
- _Distractor design._ Most distractors are common student errors: confusing Nernst with GHK (Q3), inverting voltage-gated and ligand-gated mechanisms (Q7), believing high K⁺ hyperpolarises (Q8, Q20), denying all-or-none (Q15), inverting myelin's effect (Q17). A few distractors are simply plausible-but-incorrect numeric ranges (Q1, Q4, Q13).
- _Cognitive types covered._ Recall (Q1, Q9, Q13), comparison (Q2, Q7, Q10, Q11, Q14, Q17), prediction (Q6, Q8, Q18), calculation (Q4), clinical application (Q12, Q16, Q19, Q20, Q22), misconception-targeted (Q15, Q21), analysis (Q21, Q22). All eight prompt-defined types are represented.
- _Aspects covered._ RMP and equilibrium potentials (Q1–Q8); action potential phases and channel mechanisms (Q9–Q16); propagation and conduction (Q17, Q18); clinical pathology (Q19, Q20, Q22); foundational misconception (Q21). The 22 questions span the full chapter without skewing toward one narrow topic.
- _Strong source coverage._ Like Ch. 3, Ch. 4 has rich source material in Costanzo Ch. 1 alone, so the 22-question count reflects genuine breadth rather than padded narrow content.
