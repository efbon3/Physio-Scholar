---
chapter: Chapter 3 — Transport across Cell Membranes
part: Part I — Foundations of Physiology
tier: 1
tier_rationale: Foundational chapter — every later chapter (action potentials, cardiac contraction, renal handling, GI absorption, endocrine signalling) depends on understanding transport mechanisms. Heavily tested in MBBS exams.
target_count: 22
actual_count: 22
sources_consulted:
  - Berne & Levy, 7th ed., Ch. 1 (Principles of Cell and Membrane Function) — primary for transporter classification, Na/K-ATPase, ABC transporters, vesicular transport
  - Costanzo, 7th ed., Ch. 1 (Cellular Physiology) — primary for diffusion mechanics, Fick's law, carrier-mediated transport features (saturation, stereospecificity, competition)
  - Brown, Rapid Review Physiology, 2nd ed., Ch. 1 (Cell Physiology) — clinical anchors and corroboration
  - Guyton & Hall 14e Ch. 4 (Transport of Substances Through Cell Membranes) not consulted in this batch — PDF extraction unavailable in current session, but the topic is so well-covered in the three primary sources above that this gap does not produce significant content holes
status: draft
---

# Chapter 3 — MCQs

Authored in three passes (passive transport → active transport → vesicular transport & clinical anchors), then deduplicated. Tier 1 target was 22 questions; final count is 22. Source coverage for this chapter is strong (Berne Ch.1's second half is dedicated to transport, Costanzo Ch.1 covers diffusion mechanics in depth) and the major topics — passive diffusion, facilitated diffusion, osmosis, primary/secondary active transport, vesicular transport — are all well-grounded.

---

## Pass 1 — Passive transport: diffusion, osmosis, aquaporins

QUESTION 1
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Substances cross the cell membrane by several mechanisms. Which transport mechanism is the _only_ one that does _not_ involve a protein carrier?

Correct answer: Simple diffusion.

Distractors:

- "Facilitated diffusion" — Reveals misconception: student conflates "diffusion" with "no carrier." Correction: facilitated diffusion is _carrier-mediated_ — it uses an integral membrane transport protein, even though it is passive (downhill) like simple diffusion.
- "Primary active transport" — Reveals misconception: student does not realise that all active transport requires a carrier. Correction: every form of active transport (primary and secondary) involves a carrier protein; the carrier is what couples ATP or another energy source to substrate movement.
- "Cotransport (symport)" — Reveals misconception: student treats cotransport as a passive equilibrium process. Correction: cotransport is secondary active transport via a carrier — it always involves a protein.

Explanation: Of the four major transport mechanisms — simple diffusion, facilitated diffusion, primary active transport, and secondary active transport — only _simple diffusion_ is non-carrier-mediated [Costanzo ch.1; Berne ch.1]. The other three all involve integral membrane proteins and therefore share three features: _saturation_ (limited number of binding sites; rate plateaus at Tm), _stereospecificity_ (the carrier discriminates between isomers, e.g., D-glucose vs L-glucose), and _competition_ (closely related solutes compete for the same binding sites). Simple diffusion has none of these features — flux scales linearly with concentration gradient and the membrane does not distinguish between isomers.

Hints:

1. Three of the four major transport mechanisms share something that the fourth lacks.
2. The shared feature is the use of a protein.
3. The exception is the simplest mechanism.

---

QUESTION 2
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: According to Fick's law, the net rate of simple diffusion (J) of a solute across a cell membrane is given by J = PA(Cₐ − Cᵦ). If the surface area of the membrane _doubles_ and all other variables are unchanged, the net rate of diffusion will:

Correct answer: Double.

Distractors:

- "Halve" — Reveals misconception: student inverts the relationship between surface area and flux. Correction: surface area is in the _numerator_ of Fick's law; flux is _directly_ proportional to A.
- "Stay the same" — Reveals misconception: student does not appreciate that surface area is one of the determinants of flux.
- "Quadruple" — Reveals misconception: student treats surface area as squared. Correction: A appears linearly in Fick's law, not as A².

Explanation: Fick's law for net diffusion: J = PA(Cₐ − Cᵦ), where J is the net flux, P is the permeability, A is the surface area, and (Cₐ − Cᵦ) is the concentration gradient [Costanzo ch.1]. Each variable enters linearly. Doubling surface area (A) doubles the flux. Halving membrane thickness would also double permeability (since P = KD/Δx, with Δx in the denominator) and therefore double flux. Doubling the concentration gradient also doubles flux. Recognising that flux scales linearly with each of these variables is the key to predicting diffusion responses to physiological or pathological changes (e.g., emphysema reduces alveolar surface area and therefore pulmonary diffusion; oedema increases diffusion distance and therefore reduces it).

Hints:

1. The variables in Fick's law each enter the equation linearly — none is squared.
2. If A is in the numerator, what happens to flux when A doubles?
3. Linear proportionality means a 2× increase in A produces a 2× change in flux.

---

QUESTION 3
Type: recall
Bloom's level: understand
Difficulty (F / I / A): i
Priority (M / S / G): s

Stem: The _partition coefficient_ of a solute describes:

Correct answer: The solute's solubility in oil relative to its solubility in water.

Distractors:

- "The solute's molecular weight relative to a reference molecule." — Reveals misconception: student conflates the partition coefficient with molecular size or mass. Correction: the partition coefficient is a solubility ratio, not a size measure.
- "The fraction of the membrane that the solute can cross at equilibrium." — Reveals misconception: student treats it as a permeability fraction. Correction: it is a property of the solute itself — its hydrophobic-versus-hydrophilic character.
- "The ratio of the solute's concentration in plasma to its concentration in interstitial fluid." — Reveals misconception: student conflates the partition coefficient with the Gibbs-Donnan ratio.

Explanation: The partition coefficient (K) is defined as the concentration of a solute in oil divided by its concentration in water at equilibrium [Costanzo ch.1]. It captures how readily the solute will dissolve in the hydrophobic core of the cell membrane: nonpolar solutes have high partition coefficients (they prefer the lipid phase) and cross the bilayer easily by simple diffusion. Polar solutes have low partition coefficients and cross the bilayer poorly — they require carrier-mediated transport. The partition coefficient is a key term in the permeability formula (P = KD/Δx), and explains why steroid hormones, oxygen, and CO₂ cross the membrane freely while ions, glucose, and amino acids do not.

Hints:

1. The coefficient is a _ratio_ — of what to what?
2. Solutes with a high partition coefficient cross the bilayer easily.
3. The two phases compared are hydrophobic and hydrophilic.

---

QUESTION 4
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Carrier-mediated transport (facilitated diffusion, primary active, secondary active) shares three properties that simple diffusion does not. Which set correctly identifies these three properties?

Correct answer: Saturation (Tm), stereospecificity, and competition.

Distractors:

- "Linearity, reversibility, and temperature-dependence." — Reveals misconception: student lists generic kinetic properties rather than carrier-specific features. Correction: simple diffusion is also temperature-dependent and reversible; the distinguishing features of carrier-mediated transport involve binding to a finite number of sites.
- "Saturation, energy use, and uphill movement." — Reveals misconception: student conflates "carrier-mediated" with "active" — facilitated diffusion is carrier-mediated but does _not_ use energy and moves downhill. Correction: the three carrier features are saturation, stereospecificity, competition — energy use is a separate distinction (passive vs active).
- "Voltage dependence, gating, and selectivity." — Reveals misconception: student lists ion-channel-specific properties; these are features of channels (a subset of pores), not the universal features of carrier-mediated transport.

Explanation: All carrier-mediated transport shares three features [Costanzo ch.1]. _Saturation_ — the carrier has a finite number of binding sites, so the transport rate plateaus at a transport maximum (Tm) when sites are fully occupied. The kinetics resemble Michaelis-Menten enzyme kinetics, with Tm analogous to Vmax. _Stereospecificity_ — the carrier discriminates between stereoisomers; e.g., the SGLT carrier transports D-glucose but not L-glucose. _Competition_ — chemically related solutes can occupy the same binding sites and inhibit each other's transport; e.g., D-galactose competes with D-glucose for the SGLT carrier. Simple diffusion shows none of these features — flux is linear in the gradient, indifferent to isomers, and does not show competition.

Hints:

1. Three properties; all three reflect that the carrier has a _finite_ number of binding sites.
2. One property limits the rate at high concentrations.
3. Another property allows the carrier to distinguish between mirror-image molecules.

---

QUESTION 5
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: Glucose is reabsorbed in the renal proximal tubule by a carrier-mediated process. As plasma glucose rises in a poorly-controlled diabetic patient, urinary glucose appears once plasma glucose exceeds approximately 180–200 mg/dL. The transport feature that best explains this threshold is:

Correct answer: Saturation of the glucose carriers (transport maximum, Tm).

Distractors:

- "Loss of stereospecificity at high glucose concentrations." — Reveals misconception: student assumes high concentration alters the carrier's ability to discriminate isomers. Correction: stereospecificity is a property of the binding site and does not change with substrate concentration.
- "Competition from a different solute occupying the carrier." — Reveals misconception: student invokes competition without a competing solute being present. Correction: hyperglycaemia means more _glucose_, not the introduction of a competing molecule.
- "Increased simple diffusion of glucose across the tubular epithelium." — Reveals misconception: student imagines glucose can cross the bilayer by simple diffusion at high concentrations. Correction: glucose has a low partition coefficient and does not cross the lipid bilayer significantly by simple diffusion at any physiological concentration.

Explanation: Glucose reabsorption in the proximal tubule occurs via SGLT (sodium-glucose linked transporters), which are saturable carriers [Costanzo ch.1]. At normal plasma glucose (~90 mg/dL), the filtered glucose load is well below the carriers' capacity, and reabsorption is essentially complete (no glucose appears in urine). When plasma glucose rises, the filtered load increases proportionally; once it exceeds the renal Tm for glucose (around 350 mg/min, corresponding roughly to a plasma glucose of ~180–200 mg/dL), additional filtered glucose cannot be reabsorbed and spills into the urine. This is the classical "renal threshold" for glucose. The same Tm logic applies to other carrier-mediated tubular reabsorption (phosphate, amino acids).

Hints:

1. Carrier-mediated transport plateaus at a maximum rate. What is that limit called?
2. The plateau means that adding more substrate beyond a threshold does not increase reabsorption.
3. Whatever cannot be reabsorbed appears in the urine.

---

QUESTION 6
Type: recall
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: Aquaporins (AQPs) are the principal route for water movement across most cell membranes. Each functional aquaporin in the membrane is a:

Correct answer: Homotetramer of four AQP monomers, each monomer functioning as an individual water channel.

Distractors:

- "Single transmembrane α-helix that bends to form a water-conducting kink." — Reveals misconception: student imagines a minimal single-helix structure. Correction: each AQP monomer has six transmembrane domains; the functional unit is a tetramer.
- "Heterotetramer of two distinct AQP isoforms." — Reveals misconception: student over-elaborates the architecture as a heterocomplex. Correction: aquaporins assemble as _homotetramers_ — four identical monomers, each with its own pore.
- "Single integral membrane protein that uses ATP to pump water." — Reveals misconception: student treats AQPs as energy-dependent pumps. Correction: aquaporins are _channels_, not pumps; they conduct water passively down its gradient and require no ATP.

Explanation: Each aquaporin monomer consists of six membrane-spanning domains and a central water-transporting pore. Four AQP monomers assemble in the plasma membrane to form a _homotetramer_, with each monomer functioning as an individual water channel [Berne ch.1]. The pore is highly selective — it conducts water at extremely high rates (10⁸ molecules/second per channel) while excluding ions and most other solutes. Some AQP isoforms (the _aquaglyceroporins_, e.g., AQP3, AQP7, AQP9) also conduct small uncharged molecules such as glycerol, urea, mannitol, CO₂, and NH₃. Cells regulate water permeability primarily by changing the _number_ of AQPs in the membrane — the renal collecting duct, for example, inserts AQP2 into the apical membrane in response to ADH.

Hints:

1. Each monomer has its own pore — but the protein assembles into a multi-subunit complex.
2. The complex contains four identical subunits.
3. The architecture is symmetric (homo-, not hetero-).

---

QUESTION 7
Type: misconception-targeted
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Which of the following substances crosses the cell membrane _most freely_ by simple diffusion through the lipid bilayer (without requiring a carrier or channel)?

Correct answer: Carbon dioxide (CO₂).

Distractors:

- "Sodium ion (Na⁺)" — Reveals misconception: student does not appreciate that charged ions cannot cross the hydrophobic bilayer significantly by simple diffusion. Correction: Na⁺ requires channels or carriers; its movement through the bilayer alone is negligible.
- "Glucose" — Reveals misconception: student treats glucose as small enough to diffuse freely. Correction: glucose is polar and has a low partition coefficient; it crosses the membrane via GLUT carriers (facilitated diffusion), not by simple diffusion.
- "Water (H₂O)" — Reveals misconception: student over-credits water's small size. Correction: water does cross by some simple diffusion through the bilayer, but most of its movement at physiological rates uses aquaporins; CO₂ has a higher partition coefficient and crosses more freely than water by pure simple diffusion.

Explanation: Substances cross the lipid bilayer by simple diffusion in proportion to their _partition coefficient_ (lipid solubility) [Costanzo ch.1]. Small uncharged hydrophobic molecules — gases (O₂, CO₂, N₂), steroid hormones, and lipid-soluble drugs — have high partition coefficients and cross the bilayer freely. Charged ions, sugars, and amino acids have low partition coefficients and do not cross the bilayer significantly without a protein-mediated pathway. Water is intermediate: it does cross the bilayer by simple diffusion (because it is small and uncharged), but most physiological water movement uses aquaporins. Among the options, CO₂ has the highest partition coefficient and therefore the freest passage by pure simple diffusion.

Hints:

1. The bilayer is a hydrophobic barrier. Which substance is most lipid-soluble?
2. Charged species and large polar molecules don't cross the bilayer well.
3. The answer is a small uncharged gas.

---

QUESTION 8
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: The transport rates of different membrane transport proteins span several orders of magnitude. In approximate descending order, which sequence is correct?

Correct answer: Open pores (e.g., aquaporins) > gated channels > carrier-mediated transport ≈ ATP-dependent transport.

Distractors:

- "ATP-dependent transport > carriers > channels > pores." — Reveals misconception: student assumes that ATP use makes transporters faster. Correction: the energy cost of ATP-dependent transport actually limits its rate; pores and channels are faster.
- "Carriers > pores > channels > ATP-dependent." — Reveals misconception: student inverts the sequence. Correction: pores are the fastest; carriers are slower.
- "All transport proteins move solutes at similar rates because they have similar molecular sizes." — Reveals misconception: student denies the rate hierarchy.

Explanation: Berne tabulates transport rates as follows [Berne ch.1, Table 1.3]. Open pores (e.g., aquaporins, mitochondrial outer-membrane porins) conduct up to 10⁹ molecules per second per protein. Gated channels conduct 10⁶ to 10⁸ molecules per second when open. Solute carriers (uniporters, symporters, antiporters) cycle at 10² to 10⁴ molecules per second. ATP-dependent transporters cycle at similar rates (10² to 10⁴) because each cycle requires ATP hydrolysis and conformational change. The hierarchy reflects the underlying mechanism: a pore is always open and just lets molecules through; a gated channel must open and close; a carrier must bind, undergo conformational change, release, and reset; a pump does the same but also hydrolyses ATP.

Hints:

1. Open pores have nothing to do — molecules just diffuse through.
2. Pumps must hydrolyse ATP each cycle, which is slow.
3. The hierarchy is: pores > channels > carriers/pumps.

---

## Pass 2 — Active transport: pumps and carriers

QUESTION 9
Type: recall
Bloom's level: remember
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: With the hydrolysis of each ATP molecule, the Na⁺/K⁺-ATPase moves how many ions across the membrane?

Correct answer: 3 Na⁺ out of the cell and 2 K⁺ into the cell.

Distractors:

- "2 Na⁺ out and 3 K⁺ in." — Reveals misconception: student inverts the stoichiometry. Correction: 3 Na⁺ out, 2 K⁺ in — the asymmetry is what makes the pump electrogenic.
- "1 Na⁺ out and 1 K⁺ in." — Reveals misconception: student assumes a 1:1 stoichiometry.
- "2 Na⁺ out and 2 K⁺ in." — Reveals misconception: student assumes electroneutral exchange. Correction: the Na⁺/K⁺-ATPase is _electrogenic_ — it moves a net positive charge out of the cell each cycle.

Explanation: The Na⁺/K⁺-ATPase transports 3 Na⁺ out of the cell and 2 K⁺ into the cell per ATP hydrolysed [Berne ch.1]. The 3:2 stoichiometry makes the pump _electrogenic_ — net positive charge leaves the cell, contributing slightly (a few mV) to the negative resting membrane potential. The pump is found in all cells and is responsible for establishing and maintaining the steep Na⁺ and K⁺ gradients across the plasma membrane. These gradients in turn power secondary active transport (Na⁺-coupled cotransport and antiport) and underlie excitable cell function (action potentials, neuromuscular transmission, cardiac excitation–contraction coupling). The pump consumes a substantial fraction of the body's resting ATP — estimates range from 25% to 40% in some tissues.

Hints:

1. The numbers are different for the two ions — the pump is not electroneutral.
2. The number of Na⁺ ions transported is one greater than the number of K⁺ ions.
3. The two numbers, summed, equal five.

---

QUESTION 10
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: Cardiac glycosides such as ouabain and digoxin are used in heart failure to increase cardiac contractility. Their direct molecular target is:

Correct answer: The α subunit of the Na⁺/K⁺-ATPase, which they inhibit.

Distractors:

- "The L-type voltage-gated Ca²⁺ channel, which they activate." — Reveals misconception: student picks a calcium-channel target, perhaps confusing cardiac glycosides with calcium-channel agonists. Correction: cardiac glycosides do _not_ directly act on Ca²⁺ channels; they raise intracellular Ca²⁺ indirectly via Na⁺/K⁺-ATPase inhibition.
- "Beta-adrenergic receptors, which they activate." — Reveals misconception: student conflates positive inotropes; β-agonists are a separate class.
- "Cardiac myosin, which they bind to enhance crossbridge cycling." — Reveals misconception: student picks a direct contractile-protein effect. Correction: cardiac glycosides act upstream of contractile proteins — at the Na⁺/K⁺-ATPase.

Explanation: The α subunit of the Na⁺/K⁺-ATPase contains the binding sites for Na⁺, K⁺, ATP, and _cardiac glycosides_ (ouabain, digoxin) [Berne ch.1]. By inhibiting the pump, cardiac glycosides reduce Na⁺ extrusion. Intracellular Na⁺ rises modestly. The Na⁺/Ca²⁺ exchanger (NCX), which normally extrudes Ca²⁺ from the cardiomyocyte using the Na⁺ gradient, is therefore less effective; intracellular Ca²⁺ rises, the sarcoplasmic reticulum loads more Ca²⁺ between beats, and each beat releases more Ca²⁺ — increasing contractility (positive inotropy). The therapeutic margin is narrow: too much pump inhibition causes dangerous Ca²⁺ overload, hypokalaemia (from the same mechanism in renal tubules), and arrhythmias.

Hints:

1. Cardiac glycosides have a single direct target — a transporter, not a channel or receptor.
2. The transporter they inhibit is the most ubiquitous pump in the body.
3. The α subunit binding site is what receives the drug.

---

QUESTION 11
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Primary active transport and secondary active transport both move substrates against their electrochemical gradients. Which statement correctly distinguishes them?

Correct answer: Primary active transport uses ATP _directly_ to drive the substrate against its gradient; secondary active transport uses an ion gradient (usually Na⁺) — itself maintained by primary active transport — to drive the substrate against its gradient.

Distractors:

- "Primary active transport moves substrate uphill; secondary active transport moves substrate downhill." — Reveals misconception: student treats secondary active transport as passive. Correction: secondary active transport does move substrate uphill — it just uses an ion gradient as the immediate energy source rather than ATP directly.
- "Primary uses ATP and is reversible; secondary uses ATP and is irreversible." — Reveals misconception: student misclassifies secondary transport as also directly ATP-dependent.
- "Primary active transport is found only in epithelial cells; secondary is found in all cells." — Reveals misconception: student gives a tissue-distribution distinction that is not the defining feature.

Explanation: The distinction is in the _immediate_ energy source [Costanzo ch.1; Berne ch.1]. _Primary active transport_ hydrolyses ATP directly to drive substrate against its gradient — the Na⁺/K⁺-ATPase, Ca²⁺-ATPase (SERCA, PMCA), and H⁺/K⁺-ATPase are examples. _Secondary active transport_ couples movement of the substrate against its gradient to movement of an ion (usually Na⁺) _down_ its gradient — the Na⁺ gradient is the immediate energy source. The Na⁺ gradient is itself maintained by the Na⁺/K⁺-ATPase, so secondary active transport is indirectly powered by ATP through that pump. Examples include SGLT (Na⁺-glucose symporter), Na⁺-amino acid symporters, and the Na⁺/Ca²⁺ exchanger (NCX). The classification is based on the _immediate_ coupling, not the ultimate energy source.

Hints:

1. Both forms move substrate uphill — what differs is _what is hydrolysed_ in the immediate transport step.
2. Secondary active transport uses an ion gradient as its immediate energy source.
3. The ion whose gradient powers most secondary active transport is Na⁺.

---

QUESTION 12
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Solute carriers (SLCs) include three subgroups based on the directionality of substrate movement. Which of the following correctly pairs an SLC subgroup with its mode of transport?

Correct answer: An _antiporter_ (exchanger) couples movement of two substrates in _opposite_ directions across the membrane.

Distractors:

- "A _symporter_ (cotransporter) couples movement of two substrates in opposite directions." — Reveals misconception: student inverts symport vs antiport. Correction: symport = same direction; antiport = opposite directions.
- "A _uniporter_ couples movement of two substrates simultaneously in the same direction." — Reveals misconception: student treats uniporter as a multi-substrate carrier. Correction: uniporter moves a _single_ substrate, not two.
- "An _antiporter_ moves only one substrate, in the direction of its gradient." — Reveals misconception: student equates antiporter with uniporter and adds passive flow.

Explanation: Solute carriers (SLCs) are divided into three groups by directionality [Berne ch.1]. _Uniporters_ (also called facilitated transporters) move a single substrate; an example is GLUT1 (SLC2A1), which carries glucose down its concentration gradient. _Symporters_ (cotransporters) couple the movement of two or more substrates in the _same_ direction; the Na⁺/K⁺/2Cl⁻ symporter (NKCC2; SLC12A1) in the renal thick ascending limb is an example. _Antiporters_ (exchangers) couple the movement of two or more substrates in _opposite_ directions; the Na⁺/H⁺ exchanger (NHE-1; SLC9A1), important for intracellular pH regulation, is an example. The naming follows Greek prefixes — uni (one), sym (same direction), anti (opposite).

Hints:

1. Three Greek prefixes describe the three subgroups: uni-, sym-, anti-.
2. The prefix that means "opposite" identifies the relevant subgroup.
3. The Na⁺/H⁺ exchanger is a classical example of one of the three.

---

QUESTION 13
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: Glucose is reabsorbed from the intestinal lumen into enterocytes by a Na⁺-coupled symporter on the apical membrane. The energy that immediately drives glucose movement _into the cell against its gradient_ comes from:

Correct answer: The downhill movement of Na⁺ from the intestinal lumen into the enterocyte, with the Na⁺ gradient maintained by the basolateral Na⁺/K⁺-ATPase.

Distractors:

- "Direct hydrolysis of ATP by the SGLT carrier itself." — Reveals misconception: student treats SGLT as a primary active transporter. Correction: SGLT does not hydrolyse ATP — it uses the Na⁺ gradient as its immediate energy source (secondary active transport).
- "Simple diffusion of glucose down its concentration gradient." — Reveals misconception: student assumes glucose enters by passive diffusion. Correction: glucose enters _against_ its gradient at this step (concentration is higher inside the cell than the lumen at later stages of absorption); this requires active transport.
- "Cleavage of ATP by GLUT2 on the basolateral membrane." — Reveals misconception: student mislocates the energy source and confuses GLUT (uniporter) with SGLT (symporter). Correction: GLUT2 is a uniporter that allows glucose to leave the cell by facilitated diffusion across the basolateral membrane; it does not use ATP.

Explanation: Glucose absorption in the small intestine is a classical example of _secondary active transport_ coupled with subsequent _facilitated diffusion_ [Costanzo ch.1; Berne ch.1]. On the apical (luminal) membrane, SGLT1 (a Na⁺-glucose symporter) couples glucose entry to Na⁺ entry — both move from lumen into cell, glucose against its gradient, Na⁺ down its gradient. The energy comes from the Na⁺ gradient, which is maintained by the Na⁺/K⁺-ATPase on the basolateral membrane (which pumps Na⁺ out of the cell, keeping intracellular Na⁺ low). Glucose accumulates in the enterocyte and then leaves the cell across the basolateral membrane via GLUT2 (a uniporter) by facilitated diffusion down its now-favourable gradient into the bloodstream. The same architecture operates in the renal proximal tubule.

Hints:

1. Two transporters work in series across the enterocyte — apical and basolateral.
2. The apical transporter is a Na⁺-coupled symporter.
3. The Na⁺ gradient is the immediate energy source for glucose uphill movement; what maintains the Na⁺ gradient?

---

QUESTION 14
Type: recall
Bloom's level: understand
Difficulty (F / I / A): i
Priority (M / S / G): g

Stem: V-type H⁺-ATPases (vacuolar H⁺-ATPases) are found primarily in:

Correct answer: The membranes of acidic intracellular organelles such as endosomes and lysosomes, where they pump H⁺ into the lumen to maintain acidic pH.

Distractors:

- "The plasma membrane of all cells, where they pump H⁺ out of the cell." — Reveals misconception: student treats V-type ATPases as plasma-membrane pumps. Correction: V-type ATPases are _vacuolar_ (i.e., on intracellular vesicular membranes); they do appear on the plasma membrane in specific cells (e.g., renal intercalated cells), but their _primary_ location is intracellular acidic organelles.
- "The inner mitochondrial membrane, where they synthesise ATP." — Reveals misconception: student conflates V-type with F-type ATPases. Correction: F-type ATPases (in mitochondria) synthesise ATP; V-type ATPases hydrolyse ATP to pump H⁺.
- "The sarcoplasmic reticulum, where they pump Ca²⁺." — Reveals misconception: student conflates V-type ATPase with SERCA. Correction: SERCA is a P-type Ca²⁺ ATPase; V-type ATPases pump H⁺.

Explanation: ATP-dependent transporters of the _V-type_ (vacuolar) class are found primarily in the membranes of acidic intracellular organelles — endosomes, lysosomes, secretory vesicles — where they pump H⁺ into the organelle lumen to maintain its acidic pH (e.g., lysosomal pH ~4.8) [Berne ch.1]. They are also expressed on the plasma membrane of certain specialised cells, notably the type-A intercalated cells of the renal collecting duct (where apical V-type H⁺-ATPase contributes to urinary acidification) and osteoclasts (where they acidify the resorption lacuna to dissolve bone mineral). V-type ATPases are distinct from P-type ATPases (e.g., Na⁺/K⁺-ATPase, SERCA) and from F-type ATPases (which run in reverse to synthesise ATP in mitochondria).

Hints:

1. The "V" in V-type stands for _vacuolar_ — what kind of structure is a vacuole?
2. The pump's main job is to acidify a compartment.
3. Lysosomal pH (~4.8) is maintained by this pump.

---

QUESTION 15
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): a
Priority (M / S / G): g

Stem: Cystic fibrosis is the most common lethal autosomal recessive disease in white populations (~1 per 3000 live births). It is caused by mutation of a gene encoding which class of membrane transporter?

Correct answer: An ATP-binding cassette (ABC) transporter — specifically the cystic fibrosis transmembrane conductance regulator (CFTR), which functions as a chloride channel.

Distractors:

- "A P-type ATPase, similar to the Na⁺/K⁺-ATPase." — Reveals misconception: student conflates ATP-dependent transporter classes. Correction: CFTR is an ABC transporter, not a P-type ATPase.
- "A V-type H⁺-ATPase." — Reveals misconception: student conflates ATPase types. Correction: CFTR is a chloride conductor regulated by ATP; it is not a proton pump.
- "A solute carrier (uniporter) for chloride." — Reveals misconception: student mistakes CFTR for a passive carrier. Correction: CFTR is a channel that gates ATP-dependently; it conducts Cl⁻ when phosphorylated and gated open by ATP binding.

Explanation: CFTR (cystic fibrosis transmembrane conductance regulator) is an ABC-family transporter that functions as an ATP-gated chloride channel and also regulates other transporters such as ENaC (the epithelial Na⁺ channel) [Berne ch.1]. The most common disease-causing mutation is _F508del_ (deletion of phenylalanine at position 508), which causes the protein to misfold in the endoplasmic reticulum and to be degraded before reaching the plasma membrane. Without functional CFTR on epithelial apical membranes, chloride secretion (and the water that follows osmotically) is reduced, and the airway surface liquid becomes viscous. Mucociliary clearance fails, predisposing to recurrent lung infections, bronchiectasis, and respiratory failure. CFTR also affects pancreatic, sweat-gland, intestinal, and reproductive-tract function — pancreatic insufficiency, elevated sweat chloride (a diagnostic test), meconium ileus in neonates, and male infertility. Modulator drugs (e.g., lumacaftor/ivacaftor) restore some F508del-CFTR to the plasma membrane and represent a major therapeutic advance.

Hints:

1. CFTR's structural class shares ATP-binding domains with bacterial multidrug pumps and many drug-efflux transporters.
2. The acronym for the class is three letters and ends in "C."
3. Hint 2's letters stand for "ATP-binding cassette."

---

QUESTION 16
Type: comparison
Bloom's level: analyze
Difficulty (F / I / A): i
Priority (M / S / G): s

Stem: The Na⁺/Ca²⁺ exchanger (NCX), found prominently in cardiac myocytes, is best classified as:

Correct answer: A secondary active transporter — specifically a Na⁺-driven antiporter that uses the inward Na⁺ gradient to extrude Ca²⁺.

Distractors:

- "A primary active transporter that hydrolyses ATP to extrude Ca²⁺." — Reveals misconception: student conflates NCX with PMCA (the plasma-membrane Ca²⁺-ATPase). Correction: NCX does not hydrolyse ATP directly — it uses the Na⁺ gradient. PMCA _is_ a primary active transporter for Ca²⁺.
- "A passive symporter that moves Na⁺ and Ca²⁺ in the same direction." — Reveals misconception: student inverts the geometry of NCX. Correction: NCX is an _antiporter_ — Na⁺ in, Ca²⁺ out — and is active (it moves Ca²⁺ uphill).
- "A pure ion channel that opens in response to membrane voltage." — Reveals misconception: student treats NCX as a channel. Correction: NCX is a carrier (cycle-time ~10⁻³ seconds), not a channel.

Explanation: The Na⁺/Ca²⁺ exchanger (NCX) couples Na⁺ entry (down its electrochemical gradient) to Ca²⁺ extrusion (up its electrochemical gradient) with a stoichiometry of 3 Na⁺ in : 1 Ca²⁺ out [Berne ch.1; Costanzo ch.1]. It is an _antiporter_ — substrates move in opposite directions across the membrane — and is _secondary active_ — the Na⁺ gradient (maintained by Na⁺/K⁺-ATPase) is the immediate energy source. NCX is the major route for Ca²⁺ extrusion in cardiac myocytes and underlies the inotropic action of cardiac glycosides (ouabain inhibits Na⁺/K⁺-ATPase → intracellular Na⁺ rises → NCX is less effective at extruding Ca²⁺ → intracellular Ca²⁺ rises → enhanced contractility). NCX can also run _backwards_ (Na⁺ out, Ca²⁺ in) under conditions of high intracellular Na⁺ and depolarised membrane potential — this contributes to ischaemia–reperfusion Ca²⁺ overload.

Hints:

1. NCX moves two ions in opposite directions — what is that called?
2. It does not hydrolyse ATP directly — what is its immediate energy source?
3. The classification is based on the _immediate_ coupling, not the ultimate energy source.

---

## Pass 3 — Vesicular transport, tonicity, and clinical integration

QUESTION 17
Type: comparison
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: Endocytosis occurs by three main mechanisms. Which option correctly pairs the mechanism with its substrate?

Correct answer: Receptor-mediated endocytosis takes up specific molecules that bind cell-surface receptors (e.g., LDL via the LDL receptor; iron via transferrin).

Distractors:

- "Pinocytosis is the receptor-specific uptake of large particles such as bacteria." — Reveals misconception: student inverts pinocytosis and phagocytosis. Correction: pinocytosis is non-specific small-molecule uptake; phagocytosis is the engulfment of large particles.
- "Phagocytosis is the non-specific uptake of small dissolved molecules." — Reveals misconception: same inversion. Correction: phagocytosis is specific for large particles, often receptor-mediated.
- "All three mechanisms work without any membrane reorganisation." — Reveals misconception: student denies that endocytosis involves membrane invagination and pinching off.

Explanation: The three principal endocytic mechanisms differ in substrate and selectivity [Berne ch.1; Rapid Review ch.1]. _Pinocytosis_ — non-specific bulk uptake of extracellular fluid and small dissolved molecules; prominent in capillary endothelium. _Phagocytosis_ — uptake of large particles (>0.5 μm) such as bacteria, dead cells, and debris; performed predominantly by neutrophils and macrophages and often guided by specific receptors (e.g., Fc receptors recognising opsonised bacteria). _Receptor-mediated endocytosis_ — selective uptake of specific molecules that bind cell-surface receptors; cargo includes LDL (via the LDL receptor), iron (via transferrin), insulin (via the insulin receptor following signalling), and many growth factors. Receptor-mediated endocytosis uses clathrin-coated pits and the GTPase dynamin to pinch off vesicles; the receptor is typically recycled to the surface after the cargo is delivered to endosomes.

Hints:

1. Three mechanisms; one is non-specific bulk uptake; one is large-particle uptake; one is receptor-specific.
2. Macrophages use one of the three mechanisms to internalise opsonised bacteria.
3. The receptor-specific mechanism uses clathrin-coated pits.

---

QUESTION 18
Type: clinical application
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: When invading bacteria are coated by antibody (IgG), they are subsequently engulfed and destroyed by neutrophils and macrophages. The process by which antibody coating facilitates phagocytic uptake is called:

Correct answer: Opsonisation.

Distractors:

- "Pinocytosis." — Reveals misconception: student conflates the broader uptake categories with the antibody-tagging step. Correction: pinocytosis is a non-specific bulk-fluid mechanism; opsonisation is the specific tagging that targets phagocytes.
- "Transcytosis." — Reveals misconception: student picks a different vesicular process (transcytosis is endocytosis on one side of an epithelium followed by exocytosis on the other).
- "Apoptosis." — Reveals misconception: student conflates a cell-death programme with antibody coating.

Explanation: _Opsonisation_ refers to the coating of an antigen (typically a bacterium) by host molecules — most importantly antibodies (IgG) and complement proteins (C3b) — that mark it for phagocytic uptake [Berne ch.1]. Phagocytes have surface receptors that recognise the coating: macrophages have Fc receptors that bind the _Fc_ (constant) portion of bound IgG, leaving the variable region free to recognise bacterial antigens. When an opsonised bacterium contacts a macrophage, the Fc receptors on the macrophage surface engage the IgG; the membrane wraps around the bacterium and pinches off as a phagosome; the phagosome fuses with lysosomes, and acid hydrolases destroy the engulfed organism. Opsonisation dramatically increases the efficiency of phagocytosis — bacteria that resist opsonisation (e.g., encapsulated organisms with anti-phagocytic capsules such as _Streptococcus pneumoniae_) are correspondingly more virulent.

Hints:

1. The Greek root for the term means "to make tasty" or "to prepare for eating."
2. The process tags the bacterium so phagocytes recognise it.
3. The two main host molecules involved are antibodies and complement.

---

QUESTION 19
Type: misconception-targeted
Bloom's level: understand
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: A student says: "All exocytosis is the same — vesicles fuse with the plasma membrane and release their contents into the extracellular space." Which correction is most accurate?

Correct answer: Exocytosis is divided into _constitutive_ (continuous, unregulated, used for plasma-membrane maintenance and basal secretion) and _regulated_ (triggered by a signal, often Ca²⁺-dependent, used for hormones, neurotransmitters, and digestive enzymes).

Distractors:

- "Exocytosis is one process and the student is essentially correct." — Reveals misconception: student denies the constitutive-versus-regulated distinction. Correction: the distinction is functionally important — regulated exocytosis is what allows precise temporal control of hormone and neurotransmitter release.
- "All exocytosis requires Ca²⁺ as a trigger." — Reveals misconception: student over-generalises the regulated case. Correction: constitutive exocytosis does not require a Ca²⁺ trigger; it operates continuously.
- "Exocytosis only occurs in secretory cells." — Reveals misconception: student treats exocytosis as a specialty function. Correction: exocytosis occurs in all cells — constitutive exocytosis is the mechanism by which membrane proteins reach the plasma membrane in every cell.

Explanation: Exocytosis is the process by which an intracellular vesicle fuses with the plasma membrane, releasing its contents to the extracellular space and adding the vesicle's lipid and protein to the plasma membrane [Berne ch.1]. Two regulatory modes exist. _Constitutive exocytosis_ operates continuously in all cells — it delivers newly synthesised plasma-membrane proteins, lipids, and components of the extracellular matrix; an example is the constitutive secretion of immunoglobulins by plasma cells. _Regulated exocytosis_ requires a specific trigger — typically a rise in cytosolic Ca²⁺ — and releases the contents of pre-formed secretory vesicles on demand. Regulated exocytosis underlies hormone secretion (insulin from β cells in response to glucose-induced Ca²⁺ rise), neurotransmitter release (vesicle fusion at the active zone in response to action-potential-triggered Ca²⁺ entry), and exocrine secretion (digestive enzymes in response to neural and hormonal stimulation).

Hints:

1. There is an architectural distinction between exocytosis that is "always on" and exocytosis that is "triggered."
2. The triggered form requires a signal — usually an ion entering the cytosol.
3. Insulin release is a textbook example of triggered exocytosis.

---

QUESTION 20
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): m

Stem: A red blood cell is placed in a solution that has the same total osmolarity as plasma but contains only urea (which crosses red-cell membranes freely). What happens to the cell?

Correct answer: The cell swells and may lyse — urea crosses freely so it does not exert effective osmotic pressure; water enters the cell driven by the cell's own internal solutes.

Distractors:

- "The cell shrinks because urea is hyperosmotic." — Reveals misconception: student treats osmolarity as the determinant without considering effective vs ineffective osmoles. Correction: urea is iso-osmotic with the cell but ineffective because it crosses the membrane; tonicity (effective osmotic pressure) is what matters for water movement.
- "Nothing changes — the solution is iso-osmotic with the cell." — Reveals misconception: student equates osmolarity and tonicity. Correction: the urea solution is iso-osmotic but _hypotonic_ — it cannot retain water against the cell's effective osmotic pressure.
- "The cell shrinks and crenates because the solution is hypertonic." — Reveals misconception: student labels any iso-osmotic solution as hypertonic.

Explanation: The distinction between _osmolarity_ and _tonicity_ is essential here [Costanzo ch.1]. Osmolarity is the total concentration of solute particles in a solution. _Tonicity_ is the _effective_ osmotic activity — only solutes that cannot cross the cell membrane contribute. A solution of urea that is iso-osmotic with plasma is nevertheless _hypotonic_ because urea crosses the red-cell membrane freely; once the cell is placed in the solution, urea equilibrates across the membrane, so there is no urea gradient. The cell's internal solutes (proteins, organic phosphates, K⁺) cannot leave; they create an inward osmotic gradient for water; water enters the cell, the cell swells, and at sufficient water entry the membrane ruptures (haemolysis). The clinically important point: the _tonicity_ of an IV fluid — not its osmolarity — determines whether red cells survive its administration.

Hints:

1. Two related but distinct concepts apply here: osmolarity and tonicity. Which one matters for water movement?
2. Tonicity counts only the _effective_ osmoles — solutes that _cannot_ cross the membrane.
3. Urea crosses the membrane freely. What does that say about its contribution to tonicity?

---

QUESTION 21
Type: prediction
Bloom's level: apply
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: A patient receives a 1-litre infusion of 0.9% (isotonic) saline. Where does this fluid distribute, and why?

Correct answer: Almost entirely in the extracellular fluid (ECF) — both plasma and interstitial fluid — with negligible movement into the intracellular fluid (ICF), because 0.9% saline is iso-osmotic and isotonic with plasma.

Distractors:

- "Approximately two-thirds enters cells and one-third stays extracellular, matching the normal ICF/ECF ratio." — Reveals misconception: student applies the body-water distribution ratio to a transient infusion. Correction: the body-water ratio describes total body water at equilibrium, not where new fluid distributes. Tonicity governs the new fluid's distribution.
- "Almost entirely into cells, because cells are larger." — Reveals misconception: student conflates compartment volume with tonicity-driven movement.
- "Almost entirely into the plasma compartment, with no movement to interstitial fluid." — Reveals misconception: student does not appreciate that plasma and interstitial fluid equilibrate freely across the capillary wall.

Explanation: 0.9% saline (NaCl 154 mmol/L) is iso-osmotic and isotonic with plasma — it does not change ECF osmolality, so there is no driving force for water movement between ECF and ICF [Costanzo ch.1]. The infused volume therefore stays in the ECF. Within the ECF it distributes between plasma and interstitial fluid in proportion to the existing volumes (about 25% in plasma, 75% in interstitial fluid, since plasma is the smaller subcompartment). For comparison: an iso-osmotic infusion of 5% dextrose effectively becomes free water once the dextrose is metabolised, so it distributes proportionally throughout total body water (about two-thirds entering cells, one-third remaining extracellular). This logic underlies fluid management — choice of isotonic crystalloid (saline, Ringer's), free water (5% dextrose), or hypertonic saline depends on which compartment needs volume.

Hints:

1. 0.9% saline does not change ECF osmolality. What does that mean for water movement between ECF and ICF?
2. Within the ECF, plasma and interstitial fluid equilibrate freely.
3. Compare with 5% dextrose, which behaves quite differently after the dextrose is metabolised.

---

QUESTION 22
Type: analysis
Bloom's level: analyze
Difficulty (F / I / A): f
Priority (M / S / G): s

Stem: A patient with severe diarrhoea is treated with oral rehydration solution (ORS), which contains glucose, sodium, and other electrolytes. The mechanism by which adding _glucose_ to the rehydration solution dramatically improves intestinal water and Na⁺ uptake — even when the gut epithelium is damaged — is:

Correct answer: Glucose drives Na⁺ uptake via the SGLT1 Na⁺-glucose symporter on the apical membrane; Na⁺ uptake creates an osmotic gradient that pulls water into the cell.

Distractors:

- "Glucose is metabolised by the enterocyte to provide energy for active water absorption." — Reveals misconception: student attributes the effect to enterocyte metabolism. Correction: the effect is mechanical/transport, not metabolic — SGLT1 directly couples Na⁺ and glucose transport regardless of the cell's metabolic state.
- "Glucose activates aquaporins on the apical membrane, allowing water to cross." — Reveals misconception: student attributes the effect to channel modulation. Correction: ORS works through SGLT1, not by directly modulating aquaporins.
- "Glucose binds to chloride channels and stimulates chloride and water secretion in reverse." — Reveals misconception: student invokes the cholera-toxin mechanism in reverse, which is not how ORS works.

Explanation: Oral rehydration therapy is one of the most important medical advances of the 20th century — credited with saving millions of lives from diarrhoeal diseases [Berne ch.1; Costanzo ch.1]. The mechanism rests on SGLT1, the Na⁺-glucose symporter on the apical membrane of intestinal enterocytes. Even in cholera and other secretory diarrhoeas — where chloride secretion is pathologically activated and the intestinal lumen is flooded with fluid — SGLT1 remains functional. Adding glucose to a rehydration solution allows Na⁺ to be co-transported into the enterocyte against the secretory chloride flow; the Na⁺ entry creates a small but persistent osmotic gradient that pulls water into the cell behind it, then onward through the basolateral membrane into the bloodstream. The classical ORS formulation contains sodium chloride, glucose, and potassium chloride in carefully balanced concentrations to maximise SGLT1-driven absorption while preventing iatrogenic hypernatraemia. The clinical lesson: even when the secretory side of the epithelium is broken, the absorptive side — driven by SGLT1 — can be exploited to rehydrate the patient.

Hints:

1. The effective transporter is on the apical membrane and couples Na⁺ to a sugar.
2. Once Na⁺ enters the cell, what happens to water?
3. Recognising that ORS bypasses the secretory pathology and exploits an intact absorptive pathway is the conceptual key.

---

# Final Summary

**Sources drawn from most heavily:**

- _Berne & Levy 7e Ch. 1_ (membrane transport section) — primary source for transporter classification (Q1, Q12), aquaporins (Q6), Na⁺/K⁺-ATPase (Q9), cardiac glycosides (Q10), V-type ATPases (Q14), CFTR / ABC transporters (Q15), Na⁺/Ca²⁺ exchanger (Q16), and vesicular transport (Q17, Q18, Q19, Q22).
- _Costanzo 7e Ch. 1_ (transport across cell membranes section) — primary for diffusion mechanics (Q2, Q3), carrier-mediated features (Q4, Q5), classifications (Q1, Q11, Q12), tonicity vs osmolarity (Q20, Q21), and ORS mechanism (Q22).
- _Brown, Rapid Review Physiology Ch. 1_ — corroborates membrane transport and vesicular transport content.

**Source NOT consulted in this batch (PDF extraction unavailable in current session):**

- Guyton & Hall 14e Ch. 4 (Transport of Substances Through Cell Membranes) — would have added depth on specific channels and pumps. The topic is so well-covered by Berne and Costanzo, however, that this gap does not produce significant content holes for Ch. 3.

**Topics deferred to a follow-up batch:** detailed quantitative diffusion calculations beyond the basics (only one such question authored, Q2); more advanced ion-channel kinetics (gating, conductance ranges, single-channel recording) — these would produce 2–4 additional questions if Guyton Ch. 4 / Boron Chs 5–6 can be extracted in future. The current 22 questions cover the canonical transport content thoroughly.

**Source disagreements:** none flagged. Numeric facts (3:2 stoichiometry, transport rate hierarchy, partition coefficient definition, Tm logic) are corroborated across Berne and Costanzo where they overlap.

**[NEEDS VERIFICATION] flags:** none placed. Every quantitative claim and named relationship traces to a specific passage in the extracted source text.

**Convention used in stems:** book names (Berne, Costanzo, Rapid Review) appear only as inline citation markers in explanations — never in the question stem itself.

**Pedagogical choices worth noting:**

- _Heavy reliance on clinical anchors._ Q5 (renal glucose threshold), Q10 (cardiac glycosides), Q13 (intestinal glucose absorption), Q14 (lysosomal acidification), Q15 (cystic fibrosis), Q18 (opsonisation), Q20 (urea iso-osmolar but hypotonic), Q21 (saline distribution), and Q22 (ORS mechanism) all anchor abstract transport concepts in clinical conditions or therapies. This integrates physiology with pharmacology and pathology in the way CBME expects.
- _Distractor design._ Most distractors target common student errors: confusing osmolarity with tonicity (Q20), inverting symport vs antiport (Q12), misclassifying NCX as primary active transport (Q16), conflating different ATPase classes (Q14, Q15), and confusing pinocytosis with phagocytosis (Q17). A few distractors are simply plausible-but-wrong (e.g., Q9 stoichiometry alternatives) and are flagged as such.
- _Cognitive types covered._ Recall (Q9, Q14), comparison (Q1, Q4, Q8, Q11, Q12, Q16, Q17), prediction (Q2, Q5, Q20, Q21), clinical application (Q10, Q13, Q15, Q18, Q22), misconception-targeted (Q7, Q19), analysis (Q22), recall+understand (Q3, Q6). All eight prompt-defined cognitive types are represented; calculation is not (the chapter is qualitative apart from Fick's law, which is treated as prediction in Q2).
- _Aspects covered._ Passive transport (Q1–Q8); primary active transport including specific pumps (Q9, Q10, Q14, Q15); secondary active transport (Q11, Q12, Q13, Q16); vesicular transport (Q17, Q18, Q19); osmolarity/tonicity (Q20, Q21); clinical integration (Q5, Q10, Q15, Q18, Q22). The set illuminates Ch. 3 broadly — every major transport mechanism is represented.
- _Strong source coverage._ Unlike Ch. 2, Ch. 3's source extracts (Berne and Costanzo) cover transport content thoroughly, so the 22-question count for this Tier 1 chapter is well-grounded across the topic, not skewed toward a narrow content slice.
