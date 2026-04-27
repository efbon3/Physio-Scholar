---
id: cell-signaling-second-messengers
title: Cell Signaling and Second Messengers
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites: []
related_mechanisms:
  - synaptic-transmission
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

**Receptors translate ligand binding into intracellular signals; second
messengers amplify those signals at the cost of speed.** The four
canonical second-messenger systems: cAMP (Gs / Gi-coupled receptors,
adenylate cyclase), IP₃/DAG (Gq, phospholipase C), Ca²⁺ (downstream of
many pathways), and cGMP (NO, ANP). Each cycle produces hundreds of
messengers per receptor binding — the amplification step that gives
hormones their potency.

## Clinical Hook

Cholera toxin ADP-ribosylates Gαs, locking it in the active state.
Continuous adenylate cyclase activity in intestinal epithelium drives
cAMP-mediated Cl⁻ secretion, with Na⁺ and water following. The result
is the massive watery diarrhoea of cholera. Similarly, pertussis toxin
ADP-ribosylates Gαi, blocking its inhibition of adenylate cyclase —
also raising cAMP, but in different tissues, producing different
clinical phenotypes.

# Questions

## Question 1

**Type:** classification
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** Match each G-protein subtype to its primary downstream effect: Gs, Gi, Gq, G12/13.
**Correct answer:** Gs: activates adenylate cyclase → ↑ cAMP. Gi: inhibits adenylate cyclase → ↓ cAMP; also opens K⁺ channels (hyperpolarisation). Gq: activates phospholipase C → IP₃ (Ca²⁺ release) + DAG (PKC activation). G12/13: activates Rho/ROCK → cytoskeletal regulation, smooth muscle contraction.
**Elaborative explanation:** Many GPCRs use multiple G proteins depending on cell type and signal context. β1-adrenergic is canonically Gs (raises cAMP, increases cardiac contractility); β2 too is Gs (smooth muscle relaxation, bronchodilation); α1 is Gq (vasoconstriction); α2 is Gi (inhibits NE release).

### Hint Ladder

1. Four G protein families with distinct effectors.
2. Gs and Gi work on the same enzyme but in opposite directions.
3. Gq is the phospholipase route.

### Misconception Mappings

- Wrong answer: "Gs and Gi both raise cAMP" → Misconception: they have opposite effects on adenylate cyclase.
- Wrong answer: "Gq raises cAMP" → Misconception: Gq raises Ca²⁺ via IP₃, not cAMP.
- Wrong answer: "All GPCRs use Gs" → Misconception: at least four subfamilies, plus complex multi-coupling.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Describe the cAMP signalling cascade from β-adrenergic receptor activation to a physiological effect.
**Correct answer:** (1) Adrenaline binds β-receptor. (2) Receptor activates Gs (GDP→GTP exchange, Gαs dissociates from βγ). (3) Gαs-GTP activates adenylate cyclase → ATP→cAMP. (4) cAMP activates protein kinase A (PKA). (5) PKA phosphorylates target proteins (e.g., L-type Ca²⁺ channel in cardiac myocyte → ↑ Ca²⁺ entry, ↑ contractility). (6) Phosphodiesterase (PDE) breaks cAMP, terminating the signal.
**Elaborative explanation:** Each step amplifies: one receptor activates many G proteins, each adenylate cyclase makes hundreds of cAMPs, each PKA phosphorylates many substrates. The downside is slower onset compared to direct ion-channel signalling. PDE inhibitors (theophylline, milrinone, sildenafil) prolong the signal.

### Hint Ladder

1. Receptor → G protein → enzyme.
2. The second messenger is cAMP.
3. The kinase phosphorylates many targets.

### Misconception Mappings

- Wrong answer: "β-receptor activates phospholipase C directly" → Misconception: β goes through Gs/cAMP, not Gq/PLC.
- Wrong answer: "PKA is activated by phosphorylating ATP" → Misconception: PKA is activated by binding cAMP.
- Wrong answer: "PDE inhibitors block the receptor" → Misconception: PDE inhibitors prolong the signal by stopping cAMP breakdown.

## Question 3

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Describe the IP₃/DAG signalling cascade and give a physiological example.
**Correct answer:** (1) Ligand binds Gq-coupled receptor (e.g., α1-adrenergic, vasopressin V1, M1/M3 muscarinic). (2) Gαq-GTP activates phospholipase C-β. (3) PLC hydrolyses PIP₂ in the membrane → IP₃ + DAG. (4) IP₃ binds IP₃ receptors on the SR → Ca²⁺ release. (5) DAG (with Ca²⁺) activates PKC → phosphorylates targets. Example: α1-adrenergic on vascular smooth muscle → IP₃ Ca²⁺ release + DAG PKC → vasoconstriction.
**Elaborative explanation:** This dual-messenger system (Ca²⁺ + DAG) integrates two signals: the strength and duration of Ca²⁺ release, and the membrane-localised DAG signal. PKC has many isoforms with tissue-specific roles (e.g., PKC-θ in T cells, PKC-α in vascular smooth muscle).

### Hint Ladder

1. Gq couples to which enzyme?
2. The enzyme produces two products.
3. One mobilises Ca²⁺; the other activates a kinase.

### Misconception Mappings

- Wrong answer: "PLC produces cAMP" → Misconception: PLC produces IP₃ and DAG.
- Wrong answer: "DAG mobilises Ca²⁺" → Misconception: IP₃ mobilises Ca²⁺; DAG activates PKC.
- Wrong answer: "IP₃ acts at the plasma membrane" → Misconception: IP₃ acts at the SR/ER membrane.

## Question 4

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A patient with chronic asthma uses albuterol (a β2-agonist) for symptom relief. Trace the molecular mechanism from inhalation to bronchodilation.
**Correct answer:** (1) Albuterol binds β2-receptors on bronchial smooth muscle. (2) β2 activates Gs → adenylate cyclase → cAMP. (3) cAMP activates PKA. (4) PKA phosphorylates myosin light chain kinase, _inhibiting_ it (lowering its Ca²⁺ sensitivity), and opens K⁺ channels (hyperpolarising the cell). (5) Lower MLCK activity + hyperpolarisation → less actin-myosin cycling → smooth muscle relaxation → bronchodilation.
**Elaborative explanation:** β2-receptors also relax vascular smooth muscle (limb vasodilation), so albuterol can produce mild tachycardia and tremor as side effects from incidental β1 cross-reactivity and adrenergic feedback. Long-acting β2-agonists (salmeterol) and steroids are combined for asthma control.

### Hint Ladder

1. β2 acts through cAMP.
2. PKA phosphorylates the contractile machinery.
3. The net effect is reduced contraction.

### Misconception Mappings

- Wrong answer: "β2-agonist stimulates contraction by increasing Ca²⁺" → Misconception: β2/cAMP causes relaxation, not contraction.
- Wrong answer: "Albuterol works by blocking acetylcholine" → Misconception: that's an anticholinergic; albuterol is a β2-agonist.
- Wrong answer: "β2-agonists work primarily on cardiac muscle" → Misconception: β2 dominates smooth muscle (bronchi, vasculature, uterus).

## Question 5

**Type:** classification
**Bloom's level:** remember
**Priority:** should
**Difficulty:** standard
**Stem:** Distinguish receptor tyrosine kinases (RTKs) from G-protein-coupled receptors (GPCRs) by mechanism and example.
**Correct answer:** RTKs: receptor itself has tyrosine kinase activity. Ligand binding causes receptor dimerisation, autophosphorylation on tyrosine residues, and recruitment of SH2-domain-containing signalling proteins. Examples: insulin receptor, growth factor receptors (EGFR, FGFR, PDGFR), VEGFR. Effects via PI3K/Akt, Ras/MAPK pathways. GPCRs: 7-transmembrane receptors that activate G proteins → second messengers. Examples: most monoamine, peptide, and odour receptors.
**Elaborative explanation:** RTK signalling is slow (minutes-hours) and supports cell growth, division, differentiation, and survival. GPCR signalling is fast (seconds) and supports moment-to-moment metabolic and electrical control. Many cancers involve activated RTKs (BCR-ABL, EGFR, HER2); tyrosine kinase inhibitors (imatinib, erlotinib) are major cancer drugs.

### Hint Ladder

1. RTK has enzymatic activity in the receptor itself.
2. GPCR uses an intermediate G protein.
3. The downstream cascades are different.

### Misconception Mappings

- Wrong answer: "RTKs activate G proteins" → Misconception: GPCRs do; RTKs use SH2-domain adaptors.
- Wrong answer: "Insulin receptor is a GPCR" → Misconception: insulin receptor is an RTK.
- Wrong answer: "All hormone receptors use the same mechanism" → Misconception: families differ fundamentally.

## Question 6

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** advanced
**Stem:** What is signal amplification in cell signalling, and why is it both an advantage and a risk?
**Correct answer:** Each step in a cascade activates many copies of the next: one ligand-bound receptor activates many G proteins; each adenylate cyclase makes many cAMPs; each PKA phosphorylates many substrates. A single hormone molecule can produce thousands of intracellular events. Advantage: high sensitivity, allowing low hormone concentrations to produce robust effects. Risk: small dysregulation can produce large output changes; excess sensitivity can produce pathology (e.g., insulin resistance compensated by hyperinsulinaemia → β-cell exhaustion).
**Elaborative explanation:** Amplification is balanced by termination mechanisms: GTP hydrolysis, PDE, phosphatases, internalisation, ubiquitination, desensitisation. The dynamic balance produces both speed and stability — the same systems-physiology theme as feedback control loops.

### Hint Ladder

1. Each step in a cascade has a multiplicative effect.
2. A small input produces a large output.
3. Termination mechanisms prevent runaway signalling.

### Misconception Mappings

- Wrong answer: "Amplification means more receptors" → Misconception: amplification is at each step of the cascade, not just at the receptor.
- Wrong answer: "Amplification is always beneficial" → Misconception: amplification creates vulnerability to dysregulation.
- Wrong answer: "Termination mechanisms slow signal amplification" → Misconception: termination ends the signal; amplification is during the signal.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** A patient with type 2 diabetes has hyperinsulinaemia despite hyperglycaemia. Explain how insulin signalling can be reduced (insulin resistance) at the cellular level, naming three molecular mechanisms.
**Correct answer:** (1) Receptor-level: reduced insulin receptor expression or downregulation due to chronic hyperinsulinaemia. (2) Receptor-substrate level: serine phosphorylation of IRS-1 (by inflammatory kinases like JNK, IKKβ, mTOR) inhibits its function — instead of the usual tyrosine phosphorylation that propagates signal. (3) Downstream: reduced GLUT4 translocation to the membrane, reduced PI3K/Akt activity, increased PTP1B (a phosphatase that opposes insulin signalling). Inflammation, lipotoxicity (FFA, ceramides), and obesity drive these changes.
**Elaborative explanation:** This is one reason metformin, thiazolidinediones, and lifestyle modification all work — they target different nodes in this signalling network. Type 2 diabetes is fundamentally a signalling disease, not just a fuel-storage disease.

### Hint Ladder

1. Insulin signalling has multiple steps; each can be impaired.
2. Inflammatory kinases interfere with downstream signalling.
3. Receptor, substrate, and effector levels all matter.

### Misconception Mappings

- Wrong answer: "Insulin resistance is solely from reduced insulin levels" → Misconception: insulin levels are usually elevated; the resistance is downstream.
- Wrong answer: "Insulin resistance affects all tissues equally" → Misconception: liver, muscle, and fat differ in vulnerability and timing.
- Wrong answer: "Insulin resistance is reversible only with insulin therapy" → Misconception: weight loss, exercise, metformin all improve insulin sensitivity.

# Facts

## Definitions

- **Second messenger**: small intracellular molecule produced in response to receptor activation; amplifies and propagates the signal.
- **G-protein-coupled receptor (GPCR)**: 7-transmembrane receptor that activates G proteins; large family with hundreds of members.
- **Receptor tyrosine kinase (RTK)**: receptor with intrinsic tyrosine kinase activity; activates growth/division pathways.
- **Adenylate cyclase**: membrane enzyme that produces cAMP from ATP.
- **Phospholipase C (PLC)**: enzyme that produces IP₃ + DAG from PIP₂.
- **Protein kinase A (PKA)**: cAMP-dependent kinase.
- **Protein kinase C (PKC)**: DAG- and Ca²⁺-dependent kinase family.

## Functions

- Second messengers amplify weak hormonal signals.
- Receptor diversity tunes the response to ligand and tissue.
- Cross-talk between pathways integrates multiple signals at a single cell.

## Normal values

- **Resting [cAMP]**: ~1 μM (rises 5–10× with strong stimulation).
- **PKA activation Kd for cAMP**: ~0.1 μM.
- **Resting cytosolic [Ca²⁺]**: ~100 nM (rises to 1–10 μM with activation).

## Relations

- Gs and Gi cancel each other on adenylate cyclase.
- Gq raises Ca²⁺ via IP₃; Gs raises cAMP via cyclase.
- Cross-talk: PKA can phosphorylate proteins downstream of PLC, and PKC can affect cAMP pathways.

## Classification

- **By signal**: cAMP, cGMP, IP₃/DAG, Ca²⁺, NO, lipid mediators.
- **By receptor**: GPCRs, RTKs, ligand-gated ion channels, cytokine receptors, nuclear receptors, guanylate cyclase receptors.

# Values

- **Receptor amplification ratio (one binding event → cascade outputs)**: 10²–10⁴.
- **cAMP turnover rate via PDE**: ~10 sec.
- **GPCR desensitisation time**: minutes (β-arrestin recruitment).
- **Receptor internalisation half-time**: ~10 min.
- **Number of GPCRs in human genome**: ~800.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 75.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 3.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 2.
- AK Jain, _Textbook of Physiology_, 9th ed.
- GK Pal, _Textbook of Medical Physiology_, 4th ed.
