---
id: preload-and-afterload
title: Preload and Afterload Determinants
organ_system: cardiovascular
nmc_competencies:
  - PY-CV-1.5
  - PY-CV-1.7
exam_patterns:
  - mbbs
  - pre-pg
prerequisites:
  - cardiac-cycle-phases
related_mechanisms:
  - frank-starling
  - cardiac-output-regulation
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

**Preload is what the ventricle is filled with; afterload is what the
ventricle has to push against.** Stroke volume is set by the balance
of these two — plus contractility, the third lever. Most clinical
manoeuvres that change cardiac output work by changing one of the
three: a fluid bolus raises preload, a vasodilator drops afterload,
an inotrope raises contractility. Reading any haemodynamic situation
starts with deciding which of the three has changed and in which
direction.

## Clinical Hook

A patient in cardiogenic shock has cold, clammy skin and a low blood
pressure. Reflex sympathetic vasoconstriction has raised afterload to
defend pressure — but the failing ventricle cannot eject against that
afterload, so stroke volume falls further and the patient cycles
deeper into shock. Carefully reducing afterload (sodium
nitroprusside) can paradoxically raise cardiac output even as it
lowers blood pressure: the ventricle ejects more freely against a
lighter wall.

# Layer 2 — Working Explanation

## Preload — A Stretch, Measured Several Ways

Preload is **the degree to which the ventricle is stretched at end
diastole**, just before the next contraction. The fundamental
quantity is **end-diastolic sarcomere length** — that is what
governs contractile force via the Frank-Starling relationship. In
the clinic, sarcomere length cannot be measured. Surrogates are used
in approximate descending order of fidelity:

- **End-diastolic volume (EDV)** — the closest reasonable surrogate;
  measurable on echocardiogram or MRI.
- **End-diastolic pressure (EDP)** — proportional to EDV through the
  diastolic compliance curve, but a stiff ventricle reads "high
  pressure, normal volume" while a dilated cardiomyopathy reads
  "high pressure, very high volume."
- **Pulmonary capillary wedge pressure** — the pressure measured by
  a Swan-Ganz catheter wedged in the pulmonary artery. Approximates
  left atrial pressure, which approximates left ventricular
  end-diastolic pressure when the mitral valve is competent.
- **Central venous pressure** — approximates right atrial pressure,
  approximates right ventricular end-diastolic pressure. A poor
  surrogate for left-sided preload because the right and left sides
  do not always move together (e.g., pulmonary embolism).

## Determinants of Preload

End-diastolic volume rises when:

- Venous return rises (volume status, venous tone, posture).
- Heart rate falls (longer diastolic filling time).
- Atrial systole is preserved and timed correctly (no AF, no
  pacemaker mistiming).
- Ventricular compliance is preserved (no fibrosis, no hypertrophy,
  no tamponade).

## Afterload — A Wall the Ventricle Must Climb

Afterload is **the load against which the ventricle ejects** — the
opposing force during the ejection phase. The cleanest mechanical
definition is **wall stress during ejection**, which by Laplace's
law is:

> Wall stress = (pressure × radius) / (2 × wall thickness)

This is the formulation that explains why concentric hypertrophy is
adaptive: thickening the wall reduces wall stress at the same
pressure.

In day-to-day clinical reasoning, three quantities are used as
afterload surrogates:

- **Aortic systolic pressure** — the pressure ejection has to climb
  to. The simplest surrogate but ignores the effect of chamber
  geometry.
- **Systemic vascular resistance (SVR)** — calculated from
  (MAP − CVP) / cardiac output. Measures resistance to flow in the
  arterial tree.
- **Aortic input impedance** — pulsatile resistance, more accurate
  but rarely measured outside research.

## Determinants of Afterload

Afterload rises when:

- Aortic pressure rises (essential hypertension, exercise).
- Systemic vascular resistance rises (alpha-1 agonists, cold
  exposure, sympathetic tone).
- The aortic valve obstructs ejection (aortic stenosis).
- The ventricle dilates (Laplace: same pressure, larger radius →
  more wall stress per beat).

## Key Variables

- **End-diastolic volume** — preload surrogate
- **End-diastolic pressure** — preload surrogate (compliance-distorted)
- **Aortic systolic pressure** — afterload surrogate
- **Systemic vascular resistance** — afterload surrogate (arterial)
- **Wall stress** — the most fundamental afterload quantity

# Layer 3 — Deep Dive

## Why the Distinction Matters — The Three Levers

A clinician can change cardiac output through exactly three levers:
preload, afterload, and contractility. Each lever has its own
limits and its own toxicities:

- **Preload** is the cheapest, fastest, most reversible lever. A
  500 mL crystalloid bolus moves it within minutes. The ceiling is
  set by ventricular compliance — pushing preload past the flat top
  of the Frank-Starling curve raises filling pressures (and
  therefore pulmonary congestion) without raising stroke volume.
- **Afterload** is the highest-leverage lever in many clinical
  situations because the ventricle's response is not symmetric:
  raising afterload drops stroke volume sharply, while lowering it
  raises stroke volume even more sharply (especially in a failing
  ventricle whose force-velocity curve is shifted).
- **Contractility** is the slowest lever: catecholamines act in
  minutes, calcium sensitisers in tens of minutes, mechanical
  support (IABP, LVAD) immediately but invasively. Inotropic agents
  also raise myocardial oxygen demand, so the cost of using them
  rises with the disease they are being used to treat.

## Preload's Effect on the Pressure-Volume Loop

Increasing preload **shifts the bottom-right corner of the loop to
the right** (higher EDV) along the diastolic pressure-volume
relationship. Stroke volume rises (Frank-Starling), so the area of
the loop grows. Peak pressure may rise modestly. The loop becomes
wider but not taller.

## Afterload's Effect on the Pressure-Volume Loop

Increasing afterload **raises the pressure at which ejection begins**
(top-right corner of the ejection segment shifts up). Ejection ends
at a higher end-systolic volume because the ventricle exhausts its
energy at a higher residual volume. Stroke volume falls; the loop
becomes taller and narrower. Stroke work depends on the trade-off
between height and width — usually it rises modestly.

## Contractility — The Third Lever Briefly

Contractility (inotropy) is the intrinsic vigour of the contraction
at any given preload and afterload. It shifts the **end-systolic
pressure-volume relationship** (the upper-left envelope of all
possible loops): a steeper, leftward-shifted ESPVR means the
ventricle empties to a lower end-systolic volume against the same
afterload, and stroke volume rises. Reducing contractility (a
beta-blocker) does the opposite.

## The Force-Velocity Curve

Hill's force-velocity relationship: the speed of contraction falls
as the load opposing it rises, until at maximum load (isometric
contraction) velocity is zero. In ventricular terms, raising
afterload slows ejection; the ventricle takes longer to expel a
given volume. This is why a small additional rise in afterload in a
failing ventricle (whose force-velocity curve is flatter) can drop
stroke volume disproportionately.

## Quantitative Estimates

At rest, normal adult:

- End-diastolic volume: ~120 mL
- End-systolic volume: ~50 mL
- Stroke volume: ~70 mL
- Aortic systolic pressure: ~120 mmHg
- Systemic vascular resistance: ~1100 dyne·s/cm⁵ (≈ 14 mmHg/L/min)

A 500 mL fluid bolus typically raises EDV by 30–50 mL in an
unstressed patient and stroke volume by 5–15 mL. A vasodilator
sufficient to lower SVR by 20% can raise stroke volume by 10–25%
in a heart-failure patient.

## Misconceptions

- "End-diastolic pressure is preload" — **only as a surrogate**.
  Preload is sarcomere length; pressure is what survives the
  compliance curve. A stiff ventricle has high pressure at low
  volume (not really preloaded); a dilated cardiomyopathy has high
  pressure at very high volume (over-preloaded).
- "Lowering blood pressure always lowers cardiac output" — **no**,
  in a failing ventricle dropping afterload may raise cardiac
  output even as it modestly lowers blood pressure, because stroke
  volume rises more than mean pressure falls.
- "Hypertrophy is always bad" — **adaptively, no**. Concentric
  hypertrophy is the normal response to pressure overload; it
  reduces wall stress per Laplace's law. The pathology emerges later,
  when the hypertrophied wall stiffens and impairs filling.

# Layer 4 — Clinical Integration

## Vignette 1 — Acute Decompensated Heart Failure

A 70-year-old with chronic systolic heart failure presents with
worsening dyspnoea over three days. On examination she is volume
overloaded — bibasal crackles, raised JVP, peripheral oedema. Blood
pressure is 145/90, heart rate 96, oxygen saturation 89%. The
conventional wisdom — "give furosemide" — is correct, but only if
the trade-offs are understood. Furosemide reduces preload by
inducing diuresis. On the Frank-Starling curve, she is sitting on
the flat top: dropping preload moves her left along the curve with
only a modest fall in stroke volume, while pulmonary venous
pressure falls steeply, relieving dyspnoea. Adding nitrates lowers
both preload and afterload, which often produces a larger
improvement than furosemide alone.

## Vignette 2 — Septic Shock and the Three Levers

A 50-year-old with bacteraemia is hypotensive, warm, tachycardic.
SVR is profoundly low (vasoplegia from inflammatory mediators) —
afterload is the first abnormality. Cardiac output is high
initially, but as sepsis progresses myocardial depression develops:
contractility drops. Volume status is variable: capillary leak
makes giving fluid both essential and risky. Treatment threads all
three levers — fluids for preload, noradrenaline to restore
afterload, occasionally inotropic support if cardiac output stays
inadequate after pressure is restored.

## Vignette 3 — Aortic Stenosis vs. Hypertension

Two patients have an aortic systolic pressure of 180 mmHg. In one,
it reflects essential hypertension — a pressure that the ventricle
sees throughout ejection because peripheral resistance is raised. In
the other, severe aortic stenosis has imposed a transvalvular
gradient — peripheral systolic pressure may be only 130 mmHg, but
the ventricle has to climb to 200+ mmHg to open the valve. Both
present as "afterload overload" but the surrogate (peripheral
pressure) reads them differently. Treatment diverges: ACE inhibitors
for one, valve replacement for the other.

## Pathophysiology

- **Hypertensive heart disease** — chronic afterload elevation drives
  concentric hypertrophy → wall stiffening → diastolic dysfunction.
- **Dilated cardiomyopathy** — Laplace failure: chamber dilation
  raises wall stress at any given pressure, so the ventricle is
  effectively afterloaded by its own geometry.
- **Mitral stenosis** — the obstruction is at the inflow valve. Left
  atrial pressure rises, pulmonary pressures follow, and right-sided
  failure eventually appears. Left ventricular preload is reduced
  despite high atrial pressure.
- **Constrictive pericarditis** — preload limited mechanically by a
  rigid pericardium. End-diastolic volume cannot rise no matter how
  much filling pressure rises, so cardiac output is fixed.

# Questions

## Question 1

**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** What is the single most fundamental measure of preload, and what clinical surrogate is most commonly used in its place?
**Correct answer:** End-diastolic sarcomere length is the most fundamental preload — it is the variable Frank-Starling acts on directly. Sarcomere length cannot be measured clinically, so end-diastolic volume (measured on echocardiography) is the closest practical surrogate.
**Elaborative explanation:** Sarcomere length is what determines the proximity of myosin heads to actin and therefore the force the next contraction can generate. End-diastolic pressure is the most ubiquitously measured surrogate (because pressure is easier to obtain than volume), but it is distorted by the diastolic compliance curve — a stiff ventricle reads "high preload" by pressure when by volume it is normal. Volume is therefore the cleaner clinical surrogate when echocardiography is available.

### Hint Ladder

1. Preload is fundamentally a stretch, not a pressure.
2. The cellular level that determines next-beat contractile force is the level just below the cell.
3. The closest clinical measurement to that cellular variable is also a chamber-level dimension.

### Misconception Mappings

- Wrong answer: "Central venous pressure" → Misconception: Equating right atrial pressure with left ventricular preload; CVP is at best a surrogate for right-sided preload.
- Wrong answer: "End-diastolic pressure" → Misconception: Treating pressure and volume as interchangeable; they diverge in any condition that alters ventricular compliance.

## Question 2

**Type:** prediction
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** A previously well 60-year-old develops new aortic stenosis with a peak transvalvular gradient of 50 mmHg. Tracing the change on the pressure-volume loop, where does the loop change and why does stroke volume fall?
**Correct answer:** The top-left corner of ejection rises — the ventricle now has to develop ~170 mmHg before the aortic valve will open (compared to ~80 mmHg before). Isovolumetric contraction lengthens. Ejection starts at higher pressure and proceeds against higher resistance, so the ventricle's force-velocity relationship limits how completely it can empty: end-systolic volume rises, and stroke volume falls. The loop becomes taller and narrower.
**Elaborative explanation:** Aortic stenosis is afterload imposed at the valve rather than at the periphery. The ventricle's response is the same — concentric hypertrophy over months to years — but the surrogate measurements diverge: peripheral systolic pressure may even fall (because cardiac output is dropping), while the transvalvular gradient widens. Echocardiographic measurement of the gradient is what tracks the actual afterload.

### Hint Ladder

1. Identify which corner of the pressure-volume loop changes when afterload rises.
2. Aortic stenosis adds a pressure barrier to ejection — what does that do to the duration of isovolumetric contraction and to peak ventricular pressure?
3. With ejection happening against higher resistance, how does the ventricle's emptying compare across the beat?

### Misconception Mappings

- Wrong answer: "End-diastolic volume rises" → Misconception: Mistaking afterload for preload. Aortic stenosis directly raises afterload; preload changes only secondarily over time.
- Wrong answer: "Stroke volume is unchanged because the ventricle compensates" → Misconception: Conflating chronic compensation (hypertrophy over months) with acute response (fall in stroke volume immediately).

## Question 3

**Type:** clinical reasoning
**Bloom's level:** analyze
**Priority:** must
**Difficulty:** standard
**Stem:** A patient with severe systolic heart failure has a blood pressure of 95/55, heart rate 110, and cool peripheries. A vasodilator (sodium nitroprusside) is started and over the next hour the blood pressure falls to 90/50 — but cardiac output rises and the peripheries warm up. Explain why blood pressure can fall while cardiac output rises.
**Correct answer:** In severe systolic heart failure the ventricle's stroke volume is highly afterload-sensitive — its force-velocity curve is shifted such that small reductions in afterload produce disproportionate increases in stroke volume. Sodium nitroprusside reduces both arteriolar tone (afterload) and venous tone (preload). Stroke volume rises sharply because the failing ventricle ejects more freely against the lower wall stress; cardiac output (stroke volume × heart rate) therefore rises. Blood pressure depends on the product of cardiac output and systemic vascular resistance: SVR has fallen more than cardiac output has risen, so the product is slightly lower. The improved cardiac output reaches the periphery, dilating cutaneous vessels and warming the skin — a clinical sign that the haemodynamic improvement is real.
**Elaborative explanation:** This is the foundational logic of afterload reduction in heart failure. The healthy ventricle's stroke volume is relatively afterload-insensitive (the force-velocity curve is steep), so a vasodilator in a healthy person would mostly drop pressure and modestly raise cardiac output. The failing ventricle's flatter force-velocity curve makes afterload reduction the highest-leverage intervention available short of mechanical support. Misinterpreting the falling blood pressure as deterioration and re-starting vasoconstrictors is a classic error.

### Hint Ladder

1. Cardiac output and blood pressure are related but not the same — write down the equation that connects them.
2. In heart failure, the ventricle's response to changes in afterload is exaggerated — why?
3. Compare what happened to systemic vascular resistance and to stroke volume; which changed more in proportion?

### Misconception Mappings

- Wrong answer: "The vasodilator dropped both blood pressure and cardiac output" → Misconception: Treating BP and CO as equivalent; missing that BP can fall while flow improves.
- Wrong answer: "Cardiac output cannot rise from a vasodilator alone" → Misconception: Forgetting that afterload reduction unloads the ventricle, allowing greater stroke volume in a heart whose force-velocity curve is afterload-sensitive.

## Question 4

**Type:** prediction
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** Using Laplace's law, explain why concentric ventricular hypertrophy is adaptive in pressure overload (e.g., chronic hypertension).
**Correct answer:** Laplace's law states that wall stress equals (pressure × radius) / (2 × wall thickness). When pressure rises in chronic hypertension, wall stress would rise proportionally if geometry stayed the same. The ventricle responds by adding sarcomeres in parallel — increasing wall thickness without changing chamber radius. The increase in wall thickness offsets the pressure rise, returning wall stress per beat to roughly normal. Sarcomere-level workload normalises despite the elevated chamber pressure, which is why concentric hypertrophy is initially protective.
**Elaborative explanation:** This is also why chronic hypertension is dangerous beyond its absolute pressure: the adaptive thickening eventually impairs diastolic filling (a thick wall is a stiff wall), so what started as a compensation creates a separate pathology. Eccentric hypertrophy (sarcomeres added in series, chamber dilation) is the response to volume overload (e.g., aortic regurgitation), where the geometric problem is different — and Laplace works against the ventricle as the radius grows.

### Hint Ladder

1. Write down Laplace's law and identify which variables can change.
2. The ventricle controls wall thickness and chamber radius (over time) but not chamber pressure.
3. Solving Laplace for wall stress, what is the simplest geometric response to a sustained rise in pressure?

### Misconception Mappings

- Wrong answer: "Hypertrophy increases the force of contraction by adding more sarcomeres" → Misconception: True at the level of total wall force, but not the mechanism Laplace points to. Laplace is about wall stress per unit area.
- Wrong answer: "Hypertrophy reduces chamber size, which lowers wall stress" → Misconception: Concentric hypertrophy may modestly reduce chamber radius, but the dominant effect is on wall thickness — additional sarcomeres in parallel.

## Question 5

**Type:** prediction
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Standing up rapidly causes 300–500 mL of blood to pool in the lower extremities. Trace the consequence on preload and on the cardiac output that the body needs to defend.
**Correct answer:** Pooling reduces venous return to the right atrium, which reduces right ventricular end-diastolic volume (lower preload). Lower preload means lower right ventricular stroke volume on the Frank-Starling curve, lower pulmonary blood flow, lower left ventricular preload one cycle later, and therefore lower left ventricular stroke volume. Cardiac output falls. To defend cardiac output, the baroreceptor reflex raises heart rate (vagal withdrawal + sympathetic acceleration) and raises systemic vascular resistance (sympathetic vasoconstrictor tone). The trade-off is reduced reliance on stroke volume and increased reliance on heart rate, exactly the opposite of trained athletic adaptation.
**Elaborative explanation:** This sequence — preload drop → SV drop → CO drop → reflex compensation — is the same pathway that fails in orthostatic hypotension. Whether the failure is in venous tone (poor baseline preload), in the baroreflex itself (autonomic neuropathy), or in the chronotropic effector (beta-blocker therapy), the symptomatic outcome is the same.

### Hint Ladder

1. What happens to venous return when blood pools in the legs?
2. Trace right ventricular preload to right ventricular stroke volume to left ventricular preload.
3. The baroreflex changes which two variables to defend mean arterial pressure?

### Misconception Mappings

- Wrong answer: "Preload rises because pooled blood adds to ventricular filling" → Misconception: Confusing total body fluid distribution with venous return; pooled blood is unavailable to the heart until venous tone or muscular pump returns it.
- Wrong answer: "Cardiac output is restored solely by raising heart rate" → Misconception: Heart rate is half the answer; the vasoconstriction limb of the reflex restores afterload too, supporting both pressure and stroke volume on the next cycle.

## Question 6

**Type:** clinical reasoning
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** A patient with dilated cardiomyopathy has an end-diastolic volume of 280 mL (normal ~120 mL) and a left ventricular ejection fraction of 25%. Why does merely increasing preload further (a fluid bolus) often worsen rather than improve cardiac output in this setting?
**Correct answer:** A massively dilated ventricle is already at or past the flat top of its Frank-Starling curve. Adding more preload moves it along the descending limb of the length-tension relationship at the sarcomere level (sarcomeres beyond optimum length generate less force) and along the steep part of the diastolic compliance curve at the chamber level (small volume increments produce large pressure increments). The result is no rise in stroke volume but a sharp rise in end-diastolic pressure, transmitted backward to the pulmonary capillaries — pulmonary oedema appears or worsens. The ventricle is already over-preloaded; the appropriate manoeuvre is to reduce preload (diuresis, venodilation) and reduce afterload, not to add volume.
**Elaborative explanation:** This is why "stroke volume responds to a fluid challenge" — the bedside test of preload responsiveness — is so useful. A patient who is preload-responsive has stroke volume rise after a 250 mL bolus; a patient who is not is on the flat or descending part of the curve and will only worsen. Heart-failure care has shifted toward avoiding volume in patients who are not preload-responsive, even when their filling pressures are nominally low.

### Hint Ladder

1. Sketch a Frank-Starling curve. Where on the curve is a heart with EDV 280 mL and EF 25%?
2. Adding more preload to a heart that is past the top of its Frank-Starling curve does what to stroke volume?
3. The diastolic pressure-volume relationship has a steep right-hand portion — what happens to filling pressures in that region?

### Misconception Mappings

- Wrong answer: "The patient is hypovolaemic because cardiac output is low" → Misconception: Equating low cardiac output with hypovolaemia. In dilated cardiomyopathy the ventricle is over-filled, not under-filled.
- Wrong answer: "More preload always raises stroke volume per Frank-Starling" → Misconception: Treating Frank-Starling as monotonic. The relationship is curvilinear and has a flat (and eventually descending) top.

# Sources

- Primary: Guyton & Hall, 14th ed, Chapters 9–13.
- Open-access: StatPearls article on Frank-Starling Law of the Heart (CC BY 4.0).
- Open-access: StatPearls article on Cardiac Preload (CC BY 4.0).
- Open-access: StatPearls article on Afterload (CC BY 4.0).

# Author Notes

Initial draft authored by Claude (claude-opus-4-7) on 2026-04-26.
Pending faculty review. Items to scrutinise: the exact numerical
values for SVR / fluid bolus stroke volume gain (these vary by
patient), the clinical advice in vignettes (do not surface as
absolute treatment guidance until reviewed), and Question 3's
explanation of why blood pressure can fall while cardiac output
rises (I want a faculty member to confirm the wording is correct
for first-year MBBS).
