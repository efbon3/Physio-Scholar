---
id: cardiac-output-regulation
title: Cardiac Output Regulation
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.5
  - PY-CV-1.7
  - PY-CV-1.8
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - cardiac-cycle-phases
  - preload-and-afterload
related_mechanisms:
  - frank-starling
  - baroreceptor-reflex
blooms_distribution:
  remember: 15
  understand: 35
  apply: 30
  analyze: 20
author: claude-draft
reviewer: pending
status: draft
version: "0.1-claude-draft"
published_date: 2026-04-26
last_reviewed: 2026-04-26
---

# Layer 1 — Core

**Cardiac output is heart rate times stroke volume — and stroke volume
is the resultant of three levers (preload, afterload, contractility)
working against each other.** The body adjusts cardiac output across
a roughly five-fold range — from ~5 L/min at rest to ~25 L/min in
heavy exercise — by combining changes in heart rate, venous return,
afterload, and contractility. No single lever does it alone; every
clinically meaningful manoeuvre moves at least two of them.

## Clinical Hook

A young endurance athlete has a resting heart rate of 42 bpm and a
cardiac output entirely normal at 5 L/min. The trained heart hits
the same cardiac output at one-and-a-half times the stroke volume
of an untrained heart. Their reserve for exercise is huge, because
the levers they pull on (heart rate, contractility) start from a
position where the maximum gain is largest. The same logic — but
inverted — explains why a patient on chronic beta-blockade has a
limited response to acute haemorrhage: the heart-rate lever has
been blunted before they need it.

# Layer 2 — Working Explanation

## The Equation

Cardiac output (CO) is the volume of blood the heart ejects per unit
time:

> CO = HR × SV

Heart rate (HR) is straightforward — beats per minute. Stroke volume
(SV) is more complex; it is the resultant of the three levers:

- **Preload** — sets where the ventricle starts on the Frank-Starling
  curve.
- **Afterload** — sets the cost of ejection (force-velocity).
- **Contractility** — sets the slope of the end-systolic
  pressure-volume relationship (the ventricle's intrinsic vigour).

## Heart Rate — Two Inputs to the SA Node

The sinoatrial node has an intrinsic firing rate of ~100–110 bpm.
The resting heart rate of 60–80 bpm reflects continuous **vagal
brake** dominating over sympathetic acceleration. The two limbs are:

- **Parasympathetic (vagus, M2 receptors)** — slows the SA node by
  hyperpolarising pacemaker cells. Acts within one cardiac cycle
  (acetylcholine onset and offset are millisecond-fast).
- **Sympathetic (β1 receptors)** — accelerates the SA node by
  raising the slope of phase 4 depolarisation. Acts within seconds;
  norepinephrine effects persist for tens of seconds.

The result is that vagal modulation produces beat-to-beat
fluctuations (respiratory sinus arrhythmia in young people),
while sympathetic modulation produces sustained changes in baseline.

## Stroke Volume — The Three Levers Recap

- **Preload** — End-diastolic volume sets sarcomere length;
  Frank-Starling translates that into stroke volume.
- **Afterload** — Higher aortic pressure (or stenotic valve) raises
  the wall stress against which the ventricle ejects, reducing
  stroke volume on the force-velocity curve.
- **Contractility** — Independent of preload and afterload, the
  ventricle's intrinsic vigour. Sympathetic stimulation, calcium
  sensitisers, increased heart rate (Bowditch effect) all raise it.

These three are not independent — pulling one lever often pulls
another with it. Sympathetic tone, for example, raises heart rate
AND contractility AND venous tone (preload) AND arterial tone
(afterload) simultaneously.

## Resting Values

In a typical 70 kg adult at rest:

- Heart rate: ~75 bpm
- Stroke volume: ~70 mL
- Cardiac output: ~5.0 L/min
- Cardiac index (CO / body surface area): ~2.8 L/min/m²

## Common Exam Framings

A question almost always perturbs one variable and asks the student
to trace the others. Recognise the lever being pulled, walk through
which other levers move with it, and end at the new cardiac output.

# Layer 3 — Deep Dive

## The Bainbridge Reflex and the Bowditch Effect — Internal Couplings

Two self-amplifying mechanisms exist within the heart itself:

- **Bainbridge reflex** — Stretch of the right atrium (rising venous
  return) reflexively raises heart rate. Atrial stretch receptors
  signal the medulla, which withdraws vagal tone. The teleology is
  obvious: more blood arriving at the heart triggers faster
  forwarding.
- **Bowditch (treppe / staircase) effect** — Faster heart rate
  raises contractility within the muscle itself, independent of
  external signals. The mechanism is intracellular: less time for
  Na⁺/Ca²⁺ exchanger to extrude calcium between beats, so calcium
  accumulates and contractile force rises. Most evident in the
  range 50–150 bpm.

Both are positive-feedback couplings that the body uses to make
exercise responses self-amplifying.

## The Two-Way Trade-off Between Heart Rate and Stroke Volume

Cardiac output is HR × SV, but the two factors do not increase
independently. Beyond ~150 bpm, diastolic filling time becomes the
limiting factor:

- Diastolic filling time at 150 bpm: ~200 ms.
- Diastolic filling time at 200 bpm: ~75 ms.

Below the rate-limiting threshold, raising HR raises CO. Above it,
SV falls faster than HR rises and CO drops. The optimal HR for
maximum CO depends on the heart's filling kinetics — typically
160–180 bpm for a healthy untrained adult, somewhat higher for a
trained athlete (because trained ventricles relax faster).

## Cardiac Output During Exercise — All Levers At Once

From rest to maximum exercise, a typical untrained adult's cardiac
output rises from 5 L/min to ~20 L/min:

- Heart rate roughly doubles or triples (75 → ~190 bpm).
- Stroke volume rises by 30–40% (70 → ~95 mL) and then plateaus.
- Skeletal muscle vasodilation drops local resistance dramatically,
  but compensatory vasoconstriction in splanchnic, renal, and
  inactive-muscle beds defends mean arterial pressure.
- Total peripheral resistance falls modestly; mean arterial pressure
  rises modestly; pulse pressure widens markedly.

In a trained athlete, the same maximum cardiac output (or higher,
~30 L/min at elite endurance) is achieved with a stroke volume that
peaks at 120–150 mL — the heart-rate ceiling is similar (~190 bpm),
so the gain is almost entirely through stroke volume.

## The Cardiac Function Curve and Vascular Function Curve — Coupled

Plot venous return on the y-axis against right atrial pressure on
the x-axis: cardiac output (which equals venous return at steady
state) rises as right atrial pressure falls (more pressure gradient
from venous reservoirs to the heart). Plot ventricular output on
the same axes: cardiac output rises as right atrial pressure rises
(more preload). The intersection of the two curves is the operating
point. Any haemodynamic intervention shifts one or both curves.

This is **Guyton's model**: the heart and the vasculature are
co-regulators, and the operating cardiac output is wherever they
agree.

## Quantitative Estimates

| State                            | HR (bpm) | SV (mL) | CO (L/min) |
| -------------------------------- | -------- | ------- | ---------- |
| Resting healthy adult            | 75       | 70      | 5.3        |
| Sleeping healthy adult           | 55       | 65      | 3.6        |
| Mild exercise                    | 110      | 90      | 9.9        |
| Heavy exercise (untrained)       | 180      | 95      | 17.1       |
| Heavy exercise (trained athlete) | 180      | 140     | 25.2       |
| Cardiogenic shock                | 105      | 30      | 3.2        |
| Septic shock (early)             | 130      | 70      | 9.1        |

## Misconceptions

- "Heart rate is the dominant determinant of cardiac output" —
  **partly**. Up to ~150 bpm yes; beyond that, diastolic filling
  collapses and stroke volume falls faster than HR rises. Maximal
  CO is not at maximal HR.
- "Stroke volume rises throughout exercise" — **no**, SV peaks
  early in exercise (around 40–50% of VO₂max) and plateaus or even
  falls slightly after that. Further increases in CO are
  heart-rate-driven.
- "A high cardiac output means a healthy circulation" — **no**, in
  early sepsis CO is high but the circulation is failing because
  oxygen delivery to tissues is uncoupled from CO (vasoplegia
  shunts blood through metabolically inactive beds).

# Layer 4 — Clinical Integration

## Vignette 1 — Beta-Blocker in a Patient with Bleeding

A 60-year-old on chronic atenolol for hypertension presents with
upper GI bleeding. Heart rate is 88 bpm — what would normally be a
warning sign of compensated haemorrhage is masked because the
heart-rate lever has been blunted. Cardiac output is being defended
solely by stroke volume (Frank-Starling on rising preload from the
splenic and venous reserves) and by vasoconstriction. As blood loss
continues, both compensations exhaust before the heart-rate
warning can be heard. Recognising that the chronotropic response is
absent — and that haemodynamic deterioration in this patient looks
nothing like it does in a non-blocked patient — is critical to
correct triage.

## Vignette 2 — Atrial Fibrillation with Rapid Ventricular Response

A 72-year-old develops new atrial fibrillation with a heart rate of
160 bpm. Echocardiography shows preserved ejection fraction. The
patient is breathless. Why is cardiac output falling despite the
rapid heart rate? Two mechanisms: first, atrial systole is lost, so
end-diastolic volume falls 15–25%. Second, at 160 bpm diastolic
filling time is too short for the ventricle to fill passively even
with preserved relaxation. Stroke volume falls faster than heart
rate rises, and cardiac output falls below resting baseline.
Treatment is rate control (slow the ventricle) before considering
rhythm control — buying back diastolic filling time has the
largest immediate effect on cardiac output.

## Vignette 3 — Endurance Athlete

A 25-year-old marathon runner has a resting heart rate of 38 bpm.
Cardiac output at rest is 4.8 L/min — entirely normal. This is the
expected adaptation to endurance training: the trained heart fills
more completely (larger end-diastolic volume from chronic volume
loading), ejects more completely (preserved ejection fraction
applied to a larger volume), so stroke volume at rest is large and
heart rate is correspondingly low to keep cardiac output normal.
The pathological mimic — "low heart rate is a sign of disease" —
must be ruled out only by confirming the patient is asymptomatic
and that exercise capacity is preserved.

## Pathophysiology

- **Cardiogenic shock** — All three levers compromised. Stroke
  volume is severely reduced (low contractility, often elevated
  afterload from reflex vasoconstriction). Heart rate is reflexively
  raised but cannot compensate beyond a point. Cardiac output falls.
- **High-output failure** — Increased metabolic demand (severe
  anaemia, thyrotoxicosis, AV fistula, beriberi) raises cardiac
  output above normal but the heart eventually cannot sustain it.
  Volume overload, fatigue, and eventual decompensation result.
- **Distributive (septic) shock** — Cardiac output may be high
  early, low later. The primary lesion is in the periphery
  (vasodilation), not the heart, but myocardial depression often
  develops over hours.
- **Obstructive shock** — A mechanical block (massive PE,
  tamponade, tension pneumothorax) prevents ventricular filling or
  ejection. Stroke volume crashes; heart rate rises; cardiac output
  cannot recover until the obstruction is removed.

# Questions

## Question 1

**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** Write the equation that defines cardiac output and identify each variable's typical resting value in a healthy 70 kg adult.
**Correct answer:** Cardiac output equals heart rate multiplied by stroke volume: CO = HR × SV. Typical resting values are heart rate ~75 beats per minute, stroke volume ~70 mL, giving cardiac output ~5.3 L/min. Cardiac index (CO normalised to body surface area) is ~2.8 L/min/m².
**Elaborative explanation:** Both factors in the product can change independently, but they are coupled through filling time at high heart rates. Below ~150 bpm, raising heart rate raises cardiac output linearly. Above that, diastolic filling time becomes the limiting variable and cardiac output plateaus or falls.

### Hint Ladder

1. Cardiac output is a flow per unit time — what two factors must multiply to give a flow per minute?
2. Heart rate is in bpm; the other factor must be a volume per beat.
3. Resting cardiac output is roughly 5 L/min; resting heart rate is roughly 75 bpm — the third number follows.

### Misconception Mappings

- Wrong answer: "CO = HR + SV" → Misconception: Treating cardiac output as a sum of independent rates rather than the product of rate and per-beat volume.
- Wrong answer: "CO = SV / HR" → Misconception: Inverting the relationship. Per-beat volume divided by rate would give time per unit volume, not volume per time.

## Question 2

**Type:** prediction
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** During severe exercise, heart rate rises from 75 to 180 bpm and stroke volume rises from 70 to 95 mL. Calculate the absolute and fractional contribution of each variable to the rise in cardiac output.
**Correct answer:** Resting cardiac output is 75 × 70 = 5.25 L/min. Exercise cardiac output is 180 × 95 = 17.1 L/min. The rise is 11.85 L/min. Decomposing: if heart rate rose alone (180 × 70 = 12.6 L/min), it would contribute 7.35 L/min of the rise. If stroke volume rose alone (75 × 95 = 7.13 L/min), it would contribute 1.88 L/min. The interaction term (the simultaneous rise of both) accounts for the remaining 2.62 L/min. Heart rate dominates: about 60% of the rise is heart-rate-driven, 16% stroke-volume-driven, and 24% from their interaction.
**Elaborative explanation:** This decomposition is why the heart-rate response is the foundation of exercise tolerance — and why blunting it (beta-blockade) limits exercise capacity, even in someone whose stroke volume reserve is preserved. In a trained athlete the same exercise drives stroke volume from 100 to 140 mL, so the SV contribution is much larger; this is the haemodynamic shape of training adaptation.

### Hint Ladder

1. Compute baseline CO and exercise CO. Note the difference.
2. Hold one variable fixed at its resting value while the other rises to its exercise value — that gives the contribution of the second variable alone.
3. The rise from holding both at exercise values cannot exceed the rise from each alone summed; the difference is the interaction.

### Misconception Mappings

- Wrong answer: "Both contribute equally" → Misconception: Adding the percentage rises rather than the absolute contributions.
- Wrong answer: "Stroke volume contributes more in absolute terms" → Misconception: Because stroke volume's percentage rise is large (35%), but the multiplication is dominated by the variable that is changing more in absolute terms multiplied by the larger of the two.

## Question 3

**Type:** clinical reasoning
**Bloom's level:** analyze
**Priority:** must
**Difficulty:** standard
**Stem:** A 70-year-old with new atrial fibrillation at 165 bpm has fallen breathless despite a preserved ejection fraction on echo. Trace the mechanism by which cardiac output has fallen below their pre-AF baseline.
**Correct answer:** Two compounding losses: first, atrial systole is no longer coordinated, so the 15–25% atrial-kick contribution to end-diastolic volume is lost. Second, at 165 bpm diastolic filling time is too short (~140 ms) for adequate passive filling. End-diastolic volume falls below the level that supports stroke volume on the Frank-Starling curve. Stroke volume drops by perhaps 40–50% — far more than the heart-rate rise can compensate. Cardiac output falls below baseline. Treatment is rate control (slow the ventricle, restore diastolic filling time) before considering rhythm control.
**Elaborative explanation:** This is the haemodynamic logic behind aggressive rate control in AF with rapid ventricular response. Anti-coagulation prevents thromboembolic complications, but rate control is what restores cardiac output. Rhythm control (cardioversion or anti-arrhythmic) addresses both losses but is more invasive and has its own risks.

### Hint Ladder

1. Identify the two contributions to ventricular filling that are normally present but have changed in this patient.
2. Estimate the diastolic filling time at 165 bpm and compare to the resting value.
3. Combine the two losses (atrial kick + filling time) and predict their net effect on stroke volume.

### Misconception Mappings

- Wrong answer: "Heart rate is the only problem; rate control alone restores CO" → Misconception: Half-right; rate control matters most, but the loss of atrial kick is a separate loss that resolves only with restored sinus rhythm.
- Wrong answer: "Stroke volume rose because of the increased preload from rapid filling" → Misconception: Confusing rapid filling phase (a sub-phase of filling) with adequate filling. Rapid filling cannot complete in 140 ms.

## Question 4

**Type:** prediction
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** A young endurance athlete has a resting cardiac output of 5.0 L/min and a resting heart rate of 45 bpm. What does this imply about their stroke volume and what physiological adaptation accounts for it?
**Correct answer:** Stroke volume must be ~110 mL (5000 mL/min ÷ 45 bpm), substantially higher than the untrained resting value of ~70 mL. The adaptation is chronic ventricular volume overload from endurance training: end-diastolic volume rises (eccentric hypertrophy with chamber enlargement, sarcomeres added in series), so the same ejection fraction yields a larger stroke volume. Resting heart rate falls reciprocally because the larger stroke volume satisfies the same metabolic cardiac output requirement at a lower beat rate. Vagal tone is also enhanced by training, contributing to the bradycardia.
**Elaborative explanation:** This is athletic remodelling, distinct from pathological hypertrophy. The stroke-volume reserve is what separates endurance athletes from untrained subjects: at maximum exercise both reach similar heart-rate ceilings (~190 bpm), but the trained athlete's stroke volume rises to 140–150 mL, while the untrained heart's plateaus at ~95 mL. The maximum-exercise cardiac output therefore differs by 30–50%.

### Hint Ladder

1. Solve for SV from the cardiac output equation.
2. The athlete's SV is much larger than normal — what structural change in the ventricle would explain a larger SV?
3. The bradycardia is the necessary corollary — at constant CO, larger SV means lower HR.

### Misconception Mappings

- Wrong answer: "Stroke volume is normal; cardiac output is just lower" → Misconception: Computing the wrong product. CO is constant at 5 L/min in both rest states; SV must rise if HR falls.
- Wrong answer: "Athletic adaptation is concentric hypertrophy" → Misconception: Endurance is volume overload (eccentric); pressure overload (e.g., chronic hypertension) drives concentric hypertrophy.

## Question 5

**Type:** prediction
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** Why does cardiac output rise during the first few seconds of standing from a supine position, before steady-state autonomic compensation kicks in?
**Correct answer:** It does not — cardiac output transiently FALLS during the first few seconds of standing. Gravity pools 300–500 mL of blood in the lower extremities; venous return drops; right ventricular preload falls; right ventricular stroke volume falls; left ventricular preload falls one cycle later; left ventricular stroke volume falls; cardiac output falls. The baroreflex then compensates over 1–2 cardiac cycles by raising heart rate (vagal withdrawal first, sympathetic acceleration second) and raising vascular resistance. The reflex restores cardiac output and mean arterial pressure within seconds. Failure of this reflex is orthostatic hypotension.
**Elaborative explanation:** This is one of the few questions where the "rise vs fall" framing in the stem is intentionally tricky. The cascade — preload falls → SV falls → CO falls → reflex compensation — is one of the most heavily-tested in cardiovascular physiology because it shows the integrated function of the system rather than any single variable.

### Hint Ladder

1. What does standing do to venous return mechanically, before any reflex acts?
2. Trace right ventricular preload to right ventricular stroke volume to left ventricular preload.
3. Cardiac output is a product of HR and SV — which has changed first, in which direction?

### Misconception Mappings

- Wrong answer: "Cardiac output rises because gravity assists venous return from upper body" → Misconception: Treating gravity as universally helpful for venous return. Gravity opposes return from the lower body, which dominates because most blood volume is below the heart when standing.
- Wrong answer: "Cardiac output is unchanged because the baroreflex acts immediately" → Misconception: Treating the baroreflex as instantaneous; it acts within 1–2 cardiac cycles, but those cycles are when CO has already fallen.

## Question 6

**Type:** clinical reasoning
**Bloom's level:** analyze
**Priority:** must
**Difficulty:** advanced
**Stem:** A patient in cardiogenic shock has a cardiac output of 3.0 L/min and a mean arterial pressure of 60 mmHg. The clinician adds dobutamine (a β1 agonist) and the cardiac output rises to 4.2 L/min — but mean arterial pressure rises only to 65 mmHg. Explain why the BP rise is so much smaller than the CO rise.
**Correct answer:** Mean arterial pressure equals cardiac output multiplied by systemic vascular resistance: MAP = CO × SVR. Dobutamine raises contractility (and modestly heart rate), increasing CO. But dobutamine is also a weak β2 agonist — it dilates skeletal muscle vascular beds, modestly lowering SVR. The product CO × SVR therefore rises less than CO does alone, because part of the CO gain is consumed by the SVR drop. The improved CO does reach the periphery (this is why peripheries warm up clinically), but the pressure number on the monitor lags. Adding noradrenaline (an α1 agonist) restores SVR and produces the expected pressure rise.
**Elaborative explanation:** This is why combination therapy — inotrope plus vasopressor — is often necessary in cardiogenic shock. Dobutamine alone fixes one half of the equation (CO) but partially undoes its own work on the other (SVR). The clinical lesson is that "blood pressure is not cardiac output" and that improving the patient is not the same as improving the number on the monitor.

### Hint Ladder

1. Write the equation that connects mean arterial pressure to cardiac output.
2. Dobutamine has multiple receptor effects — list which receptors it binds and what each does.
3. Compare the percentage rise in CO to the percentage change in SVR; which has changed more?

### Misconception Mappings

- Wrong answer: "Cardiac output and blood pressure must move together" → Misconception: Treating CO and BP as the same variable. They are linked through SVR but can diverge.
- Wrong answer: "Dobutamine has no effect on SVR" → Misconception: Forgetting the β2 vasodilator activity, which is part of why dobutamine alone may not raise BP.

# Sources

- Primary: Guyton & Hall, 14th ed, Chapters 9–14 and 20.
- Open-access: StatPearls article on Cardiac Output (CC BY 4.0).
- Open-access: StatPearls article on Cardiac Output Determinants (CC BY 4.0).

# Author Notes

Initial draft authored by Claude (claude-opus-4-7) on 2026-04-26.
Pending faculty review. Items to scrutinise: the Question 2
quantitative decomposition (the interaction term framing is
unusual; some textbooks present it differently and a faculty
review should ensure this matches the course's accepted derivation),
the dobutamine pharmacology in Question 6 (the β2 vasodilator effect
is contextual — high-dose dobutamine may behave differently), and
the resting heart-rate ranges in Layer 2 (some sources cite slightly
different intrinsic SA node firing rates).
