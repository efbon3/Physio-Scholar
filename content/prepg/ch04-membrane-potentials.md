---
chapter: Chapter 4 — Membrane Potentials
part: Part I — Foundations of Physiology
status: draft
---

---

QUESTION 1

Stem: Which of the following equations is used to calculate the equilibrium potential for an ion?

Correct answer: Nernst equation

Explanation: The **Nernst equation** calculates the equilibrium (or "Nernst") potential — the membrane potential at which the chemical (concentration) gradient driving an ion across a membrane is exactly balanced by the electrical gradient, so the net flux of that ion is zero [Guyton ch.5] [Costanzo ch.1]. At 37°C for a univalent ion: E = (61/z) × log₁₀([X]\_o / [X]\_i) mV, where z is the ion's valence. The **Goldman (Goldman-Hodgkin-Katz) equation** generalises this for _multiple_ permeable ions weighted by their relative permeabilities and is used to calculate the resting membrane potential [Guyton ch.5]. The **Gibbs-Donnan equilibrium** describes the asymmetric distribution of permeant ions when a non-permeant charged species (e.g. plasma protein) is present on one side of a semi-permeable membrane. The **Bernoulli equation** is a fluid-dynamics relation, irrelevant to electrochemistry.

Hints:

1. Recall the four named equations and what each describes.
2. The equation that balances chemical and electrical gradients for a single ion is the answer.
3. The eponymous physical chemist who derived this single-ion equilibrium relation in the 19th century gives his name to it.

Distractors:

- "Gibbs-Donnan equation" — Reveals the misconception that any equilibrium-related equation can be used for ion equilibrium potentials. Gibbs-Donnan describes ion redistribution in the presence of a non-diffusible charged species, not single-ion equilibrium.
- "Goldmann equation" — Reveals the misconception that Goldman and Nernst are interchangeable. Goldman extends Nernst to multiple permeable ions and calculates the _resting membrane potential_, not single-ion equilibrium [Guyton ch.5].
- "Bernoulli equation" — Plausible but does not reveal a specific misconception worth naming.

---

QUESTION 2

Stem: Which of the following is used to calculate the equilibrium potential for diffusion of multiple ions?

Correct answer: Goldmann equation

Explanation: The **Goldman-Hodgkin-Katz (GHK) equation**, often shortened to "Goldman equation", calculates the membrane potential when _multiple_ permeable ions contribute simultaneously, weighted by their relative permeabilities [Guyton ch.5] [Costanzo ch.1] [Boron ch.5]: V_m = (RT/F) × ln{(P_K[K]\_o + P_Na[Na]\_o + P_Cl[Cl]\_i) / (P_K[K]\_i + P_Na[Na]\_i + P_Cl[Cl]\_o)}. Note that Cl⁻ (an anion) has its inside and outside concentrations swapped compared with the cations. In a typical neurone, P_K >> P_Na and P_Cl, so V_m sits near (but not exactly at) E_K. The **Nernst equation** handles only one ion at a time. **Gibbs-Donnan** and **Henderson** equations apply to other contexts (Donnan equilibrium and pH/buffer calculations respectively).

Hints:

1. The equation needs to weight the contribution of each permeable ion by its relative permeability.
2. The equation is a generalisation of Nernst for the realistic case of multiple ions.
3. It bears the names of the three physiologists who derived it; the most commonly used short form names only the first.

Distractors:

- "Gibbs-Donnan equation" — Plausible but does not reveal a specific misconception worth naming.
- "Nernst equation" — Reveals the misconception that Nernst can handle multiple ions. Nernst is single-ion only; Goldman extends it.
- "Henderson equation" — Reveals the misconception that the Henderson(-Hasselbalch) equation pertains to membrane potentials. It describes pH of weak-acid buffer systems.

---

QUESTION 3

Stem: Gibbs-Donnan equilibrium explains the **\_\_**

Correct answer: Effect of a non-diffusible ion on the distribution of permeant ions

Explanation: The **Gibbs-Donnan equilibrium** describes the asymmetric distribution of permeant (small) ions across a semi-permeable membrane when a _non-diffusible_ charged species (typically a plasma protein anion) is restricted to one side [Costanzo ch.1]. Because the protein cannot cross the membrane, it imposes electroneutrality and water-balance constraints that force redistribution of the permeant ions: cations are pulled to the side with the impermeant anion, anions are pushed to the opposite side. The Gibbs-Donnan ratio is the same for all permeant ions of like charge: [Cl⁻]\_o/[Cl⁻]\_i = [K⁺]\_i/[K⁺]\_o (cation reciprocal of anion ratio) [Costanzo ch.1]. In capillaries this is responsible for the ~5% greater concentration of small ions on the protein-poor (interstitial) side and contributes to the colloid osmotic pressure of plasma. Hence (d): the _non-diffusible_ ion (protein anion) determines the distribution of the _permeant_ ions.

Hints:

1. Recall the physical setup: which species is trapped on one side, and which species can move?
2. The equilibrium describes how the trapped species perturbs the distribution of the moving species.
3. The "non-diffusible" partner is the impermeant plasma protein anion; the "permeant" ions are the small cations and anions that redistribute around it.

Distractors:

- "Effect of one non-diffusible ion on the distribution of other non-diffusible ions" — Reveals the misconception that Donnan equilibrium concerns interactions among impermeant species. It concerns the effect of the impermeant species _on the permeant ions_.
- "Effect of one permeant ion on the distribution of other permeant ions" — Reveals the misconception that Donnan equilibrium describes ion–ion interactions. Without an impermeant species, there is no Donnan effect.
- "Effect of a permeant ion on the distribution of nondiffusible ions" — Reverses cause and effect. The non-diffusible species is fixed; the permeant species redistribute around it.

---

QUESTION 4

Stem: Extracellular concentration of a positive ion (with valency = 1) is 100mmol/L and its intracellular concentration is 10mmol/L, the potential across the membrane using Nernst equation is (mV)**\_\_**

Correct answer: +60

Explanation: The Nernst equation at 37°C for a univalent ion is **E = (61/z) × log₁₀([X]\_o / [X]\_i)** mV, where z carries the sign of the ion [Guyton ch.5] [Costanzo ch.1]. For a univalent positive ion (z = +1) with [X]\_o = 100 mmol/L and [X]\_i = 10 mmol/L: E = (61/+1) × log₁₀(100/10) = 61 × log₁₀(10) = 61 × 1 = **+61 mV** (rounded to +60 in the option). The positive sign reflects that the ion would need a positive intracellular potential to balance its outward chemical gradient — i.e. an outside-to-inside concentration step would tend to drive the cation into the cell, raising intracellular positivity until the equilibrium is reached. This calculation matches the textbook example for sodium (E_Na ≈ +61 mV with [Na]\_o = 142 and [Na]\_i = 14 mmol/L) [Guyton ch.5].

Hints:

1. Plug into the Nernst formula at body temperature with valence and concentration ratio.
2. log₁₀(10) = 1 makes this a one-step mental calculation.
3. The sign on the answer follows the cation's tendency to enter the cell when extracellular concentration is higher.

Distractors:

- "-60" — Reveals the misconception that the sign convention in Guyton's form (negative sign before the term) applies in a way that flips the result. Plugging in [X]\_o/[X]\_i with the (61/z) form for a cation gives a positive answer when [X]\_o > [X]\_i.
- "-10" — Reveals an arithmetic error — possibly subtracting concentrations rather than taking the log of their ratio.
- "10" — Reveals the misconception that the answer is the concentration ratio itself rather than 61 × log(ratio).

---

QUESTION 5

Stem: Extracellular concentration of a negative ion (with valency = 1) is 10mmol/L and its intracellular concentration is 100mmol/L. The equilibrium potential for this ion using Nernst equation is (mV) **\_**

Correct answer: 60

Explanation: For a univalent **anion** (z = −1) with [X]\_o = 10 mmol/L and [X]\_i = 100 mmol/L [Guyton ch.5]: E = (61/z) × log₁₀([X]\_o / [X]\_i) = (61/−1) × log₁₀(10/100) = −61 × log₁₀(0.1) = −61 × (−1) = **+61 mV** (rounded to +60). Note this is the _opposite_ situation to physiological Cl⁻, which has high extracellular and low intracellular concentration and consequently a _negative_ equilibrium potential. Here the chloride-like ion would tend to leave the cell down its concentration gradient; positive intracellular potential is required to retain it at equilibrium. The sign of E_X for an anion flips relative to the same concentration step for a cation — students should track the sign of z carefully.

Hints:

1. For an anion, the valence is −1; substitute carefully.
2. The chemical gradient pushes the anion outward when intracellular concentration is higher; the electrical balance requires the cell to be positive inside.
3. The arithmetic gives +61 mV; the sign reflects that the equilibrium maintains a negative ion against an outward concentration gradient.

Distractors:

- "10" — Reveals the misconception that the answer is the concentration ratio.
- "-10" — Reveals an arithmetic error in the sign or magnitude.
- "-60" — Reveals the misconception that anion equilibrium potentials are always negative. The sign depends on the direction of the concentration gradient.

---

QUESTION 6

Stem: What is the Nernst potential for K+ in millivolt (mV)?

Correct answer: -90

Explanation: At physiological concentrations — [K⁺]\_o ≈ 4 mmol/L and [K⁺]\_i ≈ 140 mmol/L (a roughly 35:1 ratio) — the **Nernst (equilibrium) potential for K⁺** is approximately **−90 mV** (the textbook value commonly cited; Guyton gives −94 mV and rounds to −90 in many contexts) [Guyton ch.5] [Costanzo ch.1]. Calculation: E_K = (61/+1) × log₁₀(4/140) = 61 × log₁₀(0.0286) = 61 × (−1.54) ≈ −94 mV ≈ −90 mV. The negative sign reflects the strong outward chemical gradient: K⁺ tends to leave the cell, making the inside negative until the electrical pull balances the chemical push. Because the resting nerve fibre is most permeable to K⁺, its resting membrane potential lies closest to E_K but is slightly less negative due to a small Na⁺ leak.

Hints:

1. Recall the typical intracellular and extracellular concentrations of K⁺ in mammalian neurones.
2. Plug into the Nernst equation at 37°C and round to the nearest 10 mV.
3. Negative because the cation tends to leave a cell with high intracellular K⁺.

Distractors:

- "+90" — Reveals the misconception that the sign is positive for K⁺. The chemical gradient drives K⁺ outward; the equilibrium balance requires inside negativity.
- "+70" — Plausible but does not reveal a specific misconception worth naming.
- "-70" — Reveals the misconception that the resting membrane potential (around −70 mV) and E*K are the same. RMP is \_close to* but _not equal to_ E_K because the membrane has finite Na⁺ permeability.

---

QUESTION 7

Stem: Which of the following ions have the highest positive equilibrium potential?

Correct answer: Na+

Explanation: Standard equilibrium potentials in mammalian cells [Guyton ch.5] [Costanzo ch.1]: **E_Na ≈ +60 to +70 mV** (with [Na]\_o ≈ 142, [Na]\_i ≈ 14 mmol/L); **E_K ≈ −90 mV**; **E_Cl ≈ −65 to −90 mV** (varies with cell type); **E_Ca ≈ +120 to +130 mV** (the highest, but not listed here). Among the _listed_ options, **Na⁺** has the highest positive equilibrium potential (~+60 mV). The strong inward chemical gradient and positive valence of Na⁺ together require a markedly positive intracellular potential to halt net entry. K⁺ has a strongly negative E_K (driven by its inverted gradient). Cl⁻ has a negative equilibrium potential close to RMP. Mg²⁺ does not figure prominently in textbook membrane-potential calculations because its free intracellular concentration is highly buffered.

Hints:

1. Rank the listed ions by the direction of their concentration gradient and by their charge.
2. The ion with the strongest tendency to move _into_ the cell down its gradient has the most positive equilibrium potential.
3. Consider which ion is high outside and low inside, and is positively charged.

Distractors:

- "Cl-" — Reveals the misconception that any halide has a strongly positive equilibrium potential. Cl⁻'s gradient and charge yield a _negative_ E_Cl close to RMP.
- "K+" — Reveals the misconception that K⁺ has a positive equilibrium potential. K⁺ is concentrated _inside_ the cell, so E*K is strongly \_negative*.
- "Mg" — Plausible but does not reveal a specific misconception worth naming.

---

QUESTION 8

Stem: The resting membrane potential of a nerve fibre depends on **\_\_**

Correct answer: All of the above

Explanation: The resting membrane potential (RMP) of a nerve fibre is the result of _all three_ mechanisms acting in concert [Guyton ch.5] [Costanzo ch.1] [Boron ch.5]. (1) **K⁺ diffusion** through resting K⁺ leak channels is the dominant contributor — the membrane is most permeable to K⁺ at rest, drawing V*m close to E_K (~ −90 mV). (2) A small **Na⁺ leak** through resting Na⁺ permeability depolarises V_m slightly, accounting for the ~ −70 mV of nerve compared with the −90 mV expected from pure K⁺ permeability — quantitatively captured by the Goldman equation. (3) The **Na⁺-K⁺ ATPase** is electrogenic (3 Na⁺ out for 2 K⁺ in per cycle), contributing a small additional negativity (~ −4 mV) directly, and — far more importantly — \_maintaining* the Na⁺ and K⁺ gradients on which the diffusion potentials depend. Without the pump, the gradients would dissipate and the RMP would collapse. All three are therefore required.

Hints:

1. List each mechanism that contributes to RMP and ask whether each is necessary.
2. K⁺ leak determines the dominant value, Na⁺ leak shifts it, and the pump maintains the underlying gradients.
3. Removing any one of these mechanisms would alter or abolish the RMP.

Distractors:

- "Diffusion of Na+ ions" — Incomplete: Na⁺ leak alone cannot establish RMP without the K⁺ pathway.
- "Na+-K+ ATPase pump" — Incomplete: the pump alone does not generate RMP — it maintains the gradients on which K⁺ and Na⁺ diffusion depend.
- "Diffusion of K+ ions" — Incomplete: K⁺ diffusion alone explains the bulk of RMP magnitude but cannot account for the offset from E_K nor for sustained gradient maintenance.

---

QUESTION 9

Stem: Resting membrane potential of the nerve fibre is equal to equilibrium potential of **\_**

Correct answer: Cl-

Explanation: At rest, the membrane is most permeable to K⁺, and the RMP lies _close to_ but _not exactly equal to_ E*K — the small inward Na⁺ leak depolarises V_m by ~5–15 mV from E_K, so V_m (≈ −70 mV) is offset from E_K (≈ −90 mV) [Guyton ch.5] [Costanzo ch.1]. **Cl⁻**, by contrast, is not actively transported in most non-secretory neurones; its distribution across the membrane is \_passive*, set by the prevailing membrane potential. As a result, Cl⁻ redistributes until **E_Cl exactly equals V_m** — that is, the RMP equals E*Cl by definition of passive equilibration [Boron ch.5] [Costanzo ch.1]. Hence the answer is (c). This is a subtle but important point: K⁺ \_dominates* RMP magnitude, but only Cl⁻ has its equilibrium potential equal to the RMP exactly, because Cl⁻ is the only listed ion in passive electrochemical equilibrium with the resting cell.

Hints:

1. Distinguish ions whose equilibrium potential is close to V_m from ions whose equilibrium potential equals V_m exactly.
2. An ion in passive electrochemical equilibrium will have its equilibrium potential equal to the prevailing membrane potential.
3. K⁺ is actively pumped and Na⁺ is actively pumped — the listed ion that is passively distributed is the answer.

Distractors:

- "Na+" — Reveals the misconception that RMP is at E*Na. Na⁺ has a strongly \_positive* equilibrium potential and is far from RMP at rest.
- "K+" — Reveals the misconception that RMP equals E_K. Although V_m approaches E_K, a small Na⁺ leak prevents exact equality. Many students will pick this and lose the subtle distinction the question is testing.
- "Mg2+" — Plausible but does not reveal a specific misconception worth naming.

[AMBIGUITY NOTE: Many introductory texts treat RMP as approximately equal to E_K. The answer (c) Cl⁻ rests on the more rigorous distinction that *passive* equilibration of Cl⁻ makes E_Cl exactly equal to V_m, whereas K⁺ is in *near*-equilibrium because of finite Na⁺ permeability. Students answering (b) would not be wrong by the dominant-permeability framing — but the more precise answer is (c). This is a genuinely tricky pedagogical point.]

---

QUESTION 10

Stem: Driving force of a charged ion is **\_**

Correct answer: Measured membrane potential - calculated equilibrium potential

Explanation: The **electrochemical driving force** for an ion is the difference between the actual membrane potential (V*m) and the equilibrium potential of the ion (V_eq), expressed as **V_df = V_m − V_eq** [Guyton ch.5] [Boron ch.5]. The arithmetic sign of V_df predicts the direction of net ion flux: for a \_cation*, a positive V_df means V_m is more positive than V_eq, so the ion will move outward to bring V_m toward V_eq; a negative V_df means V_m is more negative than V_eq, so the cation will move inward. The greater the magnitude of |V_df|, the larger the net flux for a given conductance (Ohm's law for ion currents: I = g × V_df). When V_m = V_eq, V_df = 0 and there is no net flux of that ion. Guyton presents this exact formula [Guyton ch.5].

Hints:

1. The driving force is what V_m has to overcome to push the ion further from its equilibrium.
2. By definition the driving force is the difference between actual potential and equilibrium potential for the ion.
3. Identify the order of subtraction such that V_df = 0 when V_m = V_eq.

Distractors:

- "Measured membrane potential + calculated equilibrium potential" — Reveals the misconception that driving force is a sum. Adding the two gives a quantity with no clear physical meaning.
- "Calculated equilibrium potential - Measured membrane potential" — Reverses the order. The sign of V_df flips, which would invert the predicted direction of ion flux.
- "None of the above" — Plausible but does not reveal a specific misconception worth naming.

---

QUESTION 11

Stem: If the membrane potential of this cell is -80mV the driving force is greatest for which ion?

Stem table (reproduced verbatim from source): IonEquilibrium potential (mV)Ca²⁺+120Na⁺+60K⁺-90Cl⁻-70

Correct answer: Ca2+

Explanation: Driving force V_df = V_m − V_eq, with V_m = −80 mV [Guyton ch.5]:

- **Ca²⁺**: V_df = −80 − (+120) = **−200 mV**
- **Na⁺**: V_df = −80 − (+60) = **−140 mV**
- **K⁺**: V_df = −80 − (−90) = **+10 mV**
- **Cl⁻**: V_df = −80 − (−70) = **−10 mV**

The largest _magnitude_ of driving force is for **Ca²⁺** at |−200| = 200 mV — the ion with the equilibrium potential furthest from the resting V*m. The negative sign indicates that V_m is more negative than E_Ca, so Ca²⁺ tends to move \_inward* (down its electrochemical gradient) when channels open. This is why Ca²⁺ entry through voltage-gated Ca²⁺ channels is so strongly driven and why intracellular Ca²⁺ rises rapidly when channels open. Note that K⁺ and Cl⁻ are near electrochemical equilibrium at this V_m, so their driving forces are small.

Hints:

1. Compute V_m − V_eq for each ion and compare magnitudes.
2. The ion with the equilibrium potential furthest from V_m has the largest driving force.
3. Ca²⁺'s very positive equilibrium potential combined with a strongly negative V_m yields the largest gap.

Distractors:

- "Cl-" — Reveals the misconception that ions near equilibrium have large driving forces. Cl⁻ at this V_m has only a 10 mV driving force.
- "K+" — Reveals the same misconception as (b). K⁺ is near equilibrium at −80 mV; |V_df| = 10 mV.
- "Na+" — Reveals the misconception that any ion with a positive equilibrium potential has the largest driving force. Na⁺'s |V_df| = 140 mV is large but smaller than Ca²⁺'s 200 mV.

---

QUESTION 12

Stem: Which of the following techniques is used to study the current flow across single ion channel?

Correct answer: Patch clamp technique

Explanation: The **patch clamp technique**, developed by Erwin Neher and Bert Sakmann (Nobel Prize 1991), records ionic current through _single channels_ by sealing a small glass micropipette tip (1–2 μm) onto a tiny "patch" of cell membrane, isolating one or a few channels electrically [Guyton ch.4] [Boron ch.5]. With suitable patch configurations (cell-attached, inside-out, outside-out, whole-cell), it can measure picoampere currents through a _single_ channel, revealing all-or-none gating behaviour, single-channel conductance, and open/closed dwell times [Guyton ch.4]. The **voltage clamp** technique (Hodgkin & Huxley) measures the _macroscopic_ current across the _whole_ membrane while holding V_m fixed; it gave the first kinetic descriptions of Na⁺ and K⁺ currents during the action potential, but it does not resolve single channels. **Iontophoresis** is a delivery technique (driving charged molecules across membranes by an applied field). **Galvanometry** is a generic method of measuring electrical currents.

Hints:

1. Distinguish techniques that measure macroscopic membrane current from techniques that resolve single channels.
2. The single-channel resolution requires isolating a tiny membrane area with a glass pipette tip.
3. The technique earned a Nobel Prize for resolving picoampere currents through individual proteins.

Distractors:

- "Voltage clamp technique" — Reveals the misconception that voltage clamp resolves single channels. It measures the _summed_ current across the whole membrane while holding V_m fixed.
- "Iontophoresis" — Reveals the misconception that iontophoresis is a recording technique. It is a _delivery_ technique used to apply charged drugs locally.
- "Galvanometry" — Plausible but does not reveal a specific misconception worth naming.

---

QUESTION 13

Stem: What is the effect on the cellular membrane when the extracellular concentration of K+ is decreased?

Correct answer: Increased negativity of RMP

Explanation: Lowering extracellular K⁺ ([K⁺]\_o) — _hypokalaemia_ — _steepens_ the K⁺ concentration gradient (high inside, even lower outside), making **E_K more negative** [Guyton ch.5] [Costanzo ch.1]. By the Nernst equation, E*K = 61 × log([K]\_o/[K]\_i): if [K]\_o falls from 4 to 2 mmol/L, E_K shifts from ~−94 mV to ~−112 mV. Because RMP closely follows E_K (the membrane is most permeable to K⁺ at rest), the resting membrane **hyperpolarises** — RMP becomes more negative. Clinically, severe hypokalaemia produces increased excitability \_threshold* (greater stimulus required to depolarise to threshold), characteristic ECG changes (T-wave flattening, U waves, QT prolongation), and risk of arrhythmias. Conversely, _hyperkalaemia_ depolarises (less negative) the membrane and is potentially fatal.

Hints:

1. Apply Nernst to predict the direction in which E_K shifts when [K]\_o falls.
2. RMP follows E_K closely — track the effect on V_m.
3. A larger ratio of [K]\_i to [K]\_o gives a more negative E_K.

Distractors:

- "Increased positivity of the membrane" — Reveals the misconception that lowering [K]\_o depolarises. It hyperpolarises by steepening the K⁺ gradient.
- "Decreased fluctuations in RMP" — Plausible but does not reveal a specific misconception worth naming.
- "Decreased negativity of membrane" — Same misconception as (a).

---

QUESTION 14

Stem: X, Y, Z are three permeable ions. X = -50 and Y = -30. At RMP, if there is no net electrogenic transfer, what is the value of Z?

Correct answer: +80

Explanation: "No net electrogenic transfer" at the resting membrane potential means that the net charge flux across the membrane is zero — equivalent to V*m = 0 in the simplified case where each permeable ion contributes equal conductance and equal absolute charge [Guyton ch.5]. Under this condition the membrane potential is the simple arithmetic mean of the equilibrium potentials of the contributing ions: V_m = (E_X + E_Y + E_Z) / 3. Setting V_m = 0 (no net polarisation): 0 = (−50 + −30 + E_Z) / 3 → E_Z = +80 mV. The conceptual point is that for net transmembrane current to vanish at V_m = 0 with three ions of equilibrium potentials −50 and −30, a third ion with a strongly \_positive* equilibrium potential is required to balance the inward-driving negatives.

Hints:

1. "No net electrogenic transfer" implies the sum of ionic currents across the membrane equals zero.
2. With equal weighting, the resting potential is the simple mean of the equilibrium potentials.
3. Solve for the unknown E_Z that makes the mean equal to zero.

Distractors:

- "+20" — Reveals an arithmetic error: averaging without sign tracking would give +20.
- "-20" — Reveals a sign error or wrong equation.
- "-80" — Reveals a sign error: choosing the equal-magnitude but wrong-sign answer.

[AMBIGUITY NOTE: The question as stated assumes equal conductances for the three ions and that "no net electrogenic transfer" means V_m = 0 — neither is explicitly given. With unequal conductances the Goldman equation would apply and the answer could differ. The mean-equilibrium-potential interpretation is standard for textbook MCQs at the first-year MBBS level and yields the keyed answer (c) +80.]

---

# Final Summary

**Sources drawn on most heavily:**
Guyton & Hall 14e ch.5 (Membrane Potentials and Action Potentials — Nernst equation, Goldman equation, electrochemical driving force) and ch.4 (patch clamp); Costanzo 7e ch.1 (Nernst equation, Gibbs-Donnan, equilibrium potentials, Cl⁻ passive distribution); Boron & Boulpaep 2e ch.5 (driving force, single-channel methods).

**Source disagreements:** None encountered. Guyton uses E_K ≈ −94 mV; the MCQ option of −90 mV is the conventional rounded textbook value used in most teaching.

**`[NEEDS VERIFICATION]` flags placed:** None.

**`[ANSWER REVIEW]` flags placed:** None — all stated answers are correctly grounded.

**`[AMBIGUITY NOTE]` flags placed:** 2 — on Q9 (the subtle distinction between RMP being _close to_ E*K versus \_equal to* E_Cl by passive distribution) and Q14 (the question relies on assumptions about equal conductance and "no net electrogenic transfer" meaning V_m = 0; both are textbook conventions for this style of MCQ).

**`[INSUFFICIENT SOURCE COVERAGE]` flags placed:** None.

**Other observations for the reviewer:**

- Q1 has the spelling "Goldmann" (with double 'n'); the eponym is correctly **Goldman** (David E. Goldman, 1943). Reproduced verbatim per spec; recommend correcting to "Goldman" in the source file.
- Q2 has "Goldmann" with the same misspelling.
- Q11's table is rendered without a proper table format in the source `.txt` — the column headers and rows run together as `IonEquilibrium potential (mV)Ca²⁺+120Na⁺+60K⁺-90Cl⁻-70`. The annotation reproduces this verbatim with a parsed table for clarity. Recommend formatting this as a proper table in the published version.
- Q13 wording "decreased fluctuations in RMP" (option c) is non-standard physiology terminology — the textbook concepts are hyperpolarisation, depolarisation and altered excitability.
- Q9 is a particularly good question for distinguishing first-year students who memorise "RMP ≈ E_K" from those who understand passive Cl⁻ distribution.
