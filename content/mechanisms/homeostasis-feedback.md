---
id: homeostasis-feedback
title: Homeostasis and Feedback Loops
organ_system: general
exam_patterns:
  - mbbs
  - pre-pg
prerequisites: []
related_mechanisms:
  - cell-signaling-second-messengers
blooms_distribution:
  remember: 30
  understand: 30
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

**Negative feedback drives a regulated variable back toward a setpoint;
positive feedback amplifies a change away from baseline.** Almost every
physiological control system uses negative feedback: blood pressure,
glucose, pH, body temperature, fluid volume. Positive feedback is rare
in physiology because it's destabilising — it's used only for a few
explicitly self-completing events (parturition, the AP upstroke, blood
clotting, ovulation surge of LH).

## Clinical Hook

Sepsis-induced fever resists antipyretics partly because the
hypothalamic setpoint itself has been raised by inflammatory cytokines
(IL-1, IL-6, TNF). Paracetamol works by lowering the setpoint —
without that, peripheral cooling would just trigger shivering and
counter-cooling vasoconstriction. Understanding which loop a drug
targets (effector, sensor, or setpoint) is essential clinical
physiology.

# Questions

## Question 1

**Type:** classification
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** What is homeostasis, and what are the four canonical components of any feedback control loop?
**Correct answer:** Homeostasis is the maintenance of a stable internal environment despite external perturbation. The four components: (1) regulated variable (e.g., blood glucose), (2) sensor / detector (e.g., pancreatic β-cell glucose sensor), (3) integrator / controller (e.g., islet, with possibly hypothalamic input), (4) effector (e.g., insulin secretion → glucose uptake by tissues).
**Elaborative explanation:** Loops can be very simple (single hormone, single tissue) or very complex (multiple hormones, multiple tissues, multiple time scales). The same four-step framework applies.

### Hint Ladder

1. There's a thing being regulated.
2. Something measures it.
3. Something corrects deviations.

### Misconception Mappings

- Wrong answer: "Homeostasis is the absence of any change in physiology" → Misconception: homeostasis is regulation around a setpoint, not stasis.
- Wrong answer: "Three components: sensor, signal, effector" → Misconception: the controller / integrator is essential.
- Wrong answer: "Homeostasis only applies to body temperature" → Misconception: it applies to dozens of variables.

## Question 2

**Type:** mechanism
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** Differentiate negative and positive feedback with examples in physiology.
**Correct answer:** Negative feedback opposes the deviation from setpoint, restoring stability. Examples: insulin lowering blood glucose, baroreceptor reflex correcting BP changes, cortisol/CRH feedback. Positive feedback amplifies the deviation. Examples: parturition (oxytocin and uterine stretch), blood clotting (thrombin generates more thrombin), action potential upstroke (Na⁺ entry → more Na⁺ channel opening), LH surge before ovulation.
**Elaborative explanation:** Positive feedback is destabilising and must terminate by an external mechanism. Birth ends pregnancy; the AP terminates by Na⁺ inactivation; clot formation terminates with cofactor exhaustion. Without termination, positive feedback runs to completion or destruction.

### Hint Ladder

1. Each type of feedback has a different sign on the change.
2. Negative feedback maintains; positive feedback amplifies.
3. Most physiology uses negative feedback because amplification is destabilising.

### Misconception Mappings

- Wrong answer: "Positive feedback is always pathological" → Misconception: it has specific physiological roles.
- Wrong answer: "Negative feedback eliminates change entirely" → Misconception: it reduces deviation but doesn't abolish noise.
- Wrong answer: "Positive feedback can be sustained indefinitely" → Misconception: it always needs an external terminator.

## Question 3

**Type:** application
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** Trace the negative feedback loop that responds to a sudden drop in blood pressure (e.g., hypovolaemia from haemorrhage).
**Correct answer:** (1) Reduced BP → reduced stretch in carotid sinus and aortic arch baroreceptors → reduced afferent firing in CN IX and X. (2) Reduced afferent input to medullary cardiovascular centre. (3) Sympathetic outflow rises, parasympathetic falls. (4) Heart: ↑ rate (β1) and ↑ contractility. (5) Vessels: vasoconstriction (α1) raises peripheral resistance. (6) Adrenal medulla: catecholamine release reinforces the response. (7) RAAS activation (slower) restores volume over hours. Net effect: BP rises back toward setpoint.
**Elaborative explanation:** Multiple effectors operating on different timescales — neural (seconds), hormonal (minutes-hours), renal (hours-days). Each contributes to BP recovery. Failure at any node (e.g., autonomic neuropathy) causes orthostatic intolerance.

### Hint Ladder

1. Where are the BP sensors?
2. The autonomic nervous system is the fast effector.
3. The kidney handles long-term volume regulation.

### Misconception Mappings

- Wrong answer: "Baroreceptors are in the heart, not the great vessels" → Misconception: principal baroreceptors are in carotid sinus and aortic arch.
- Wrong answer: "Sympathetic stimulation lowers BP" → Misconception: sympathetic raises BP through HR, contractility, and vasoconstriction.
- Wrong answer: "Volume regulation is faster than the autonomic response" → Misconception: autonomic is seconds; volume is hours.

## Question 4

**Type:** application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A patient is post-thyroidectomy and develops hypocalcaemia. Trace the corrective feedback loop, naming the gland, hormone, and target tissues.
**Correct answer:** (1) Low ionised Ca²⁺ → parathyroid CaSR (calcium-sensing receptor) detects the drop → PTH secretion rises. (2) PTH acts on bone: stimulates osteoclasts (indirectly via RANKL on osteoblasts) → Ca²⁺ release. (3) PTH acts on kidney: increases distal tubule Ca²⁺ reabsorption, decreases phosphate reabsorption, stimulates 1α-hydroxylase. (4) 1,25(OH)₂-vitamin D rises → enhanced gut Ca²⁺ absorption. (5) Plasma Ca²⁺ rises back toward normal. After thyroidectomy, parathyroid damage / removal disrupts step 1 — hypocalcaemia persists, requiring oral Ca²⁺ + active vitamin D supplementation.
**Elaborative explanation:** This is one of the slower hormonal feedback loops. Vitamin D activation takes hours; bone mobilisation takes longer. Acute symptomatic hypocalcaemia after thyroidectomy is treated with IV Ca²⁺ first, then chronic management with oral supplements.

### Hint Ladder

1. The parathyroid is the sensor.
2. PTH targets bone, kidney, and (indirectly via vit D) gut.
3. Surgical damage to the parathyroids disrupts the loop.

### Misconception Mappings

- Wrong answer: "PTH lowers serum Ca²⁺" → Misconception: PTH raises serum Ca²⁺.
- Wrong answer: "Calcitonin is the dominant Ca²⁺-regulating hormone in adults" → Misconception: PTH/Vit D dominate; calcitonin has a minor role.
- Wrong answer: "Vitamin D activation occurs in the parathyroid gland" → Misconception: 1α-hydroxylation is in the kidney.

## Question 5

**Type:** mechanism
**Bloom's level:** understand
**Priority:** should
**Difficulty:** standard
**Stem:** What is gain in a feedback control system, and how does it determine the precision of regulation?
**Correct answer:** Gain = (correction)/(error). High-gain systems correct large fractions of any deviation; low-gain systems correct only partly. The baroreflex has gain ~2–7 (corrects 2–7× the steady-state error per unit error). The thermoregulatory system has high gain near setpoint. Higher gain = tighter control = smaller deviation persisting at steady state.
**Elaborative explanation:** Gain has limits — too high gain causes overshoot and oscillation. Real systems trade off speed (high gain) against stability (lower gain). The clinical implication: in disease (e.g., autonomic neuropathy), gain falls and orthostatic BP swings widen.

### Hint Ladder

1. Gain is a ratio.
2. Higher gain = better correction.
3. Too high gain has a downside.

### Misconception Mappings

- Wrong answer: "Higher gain is always better" → Misconception: high gain produces oscillation and instability.
- Wrong answer: "Gain is the absolute size of the response" → Misconception: gain is a ratio of correction to error.
- Wrong answer: "Gain is constant for any control system" → Misconception: gain varies with operating point and adapts over time.

## Question 6

**Type:** integration
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** Explain why fever during sepsis is a controlled response (regulated upward), not loss of thermoregulation.
**Correct answer:** Inflammatory cytokines (IL-1, IL-6, TNF) cross or signal across the blood-brain barrier and act on the hypothalamic preoptic area. They induce PGE2 production, which raises the thermoregulatory setpoint. The body now defends a higher temperature — vasoconstriction, shivering, and behavioural responses raise temperature toward the new setpoint, perceived as "feeling cold." When the setpoint resets (resolution of infection), heat dissipation mechanisms (vasodilation, sweating) bring temperature back down — perceived as "fever break."
**Elaborative explanation:** Antipyretics (paracetamol, NSAIDs) inhibit COX and reduce PGE2, lowering the setpoint back. They don't directly cool — they let the body's own cooling mechanisms work. Heat stroke, by contrast, is a _loss_ of thermoregulation (overwhelmed by heat load), not a regulated upward shift; cooling must be active and aggressive.

### Hint Ladder

1. Setpoint can be moved, not just defended.
2. Sepsis cytokines act centrally on the setpoint.
3. The body works to raise temperature to a new setpoint.

### Misconception Mappings

- Wrong answer: "Fever is uncontrolled overheating" → Misconception: fever is regulated; heat stroke is uncontrolled.
- Wrong answer: "Antipyretics cool the body directly" → Misconception: they lower the setpoint; the body cools itself.
- Wrong answer: "Shivering during fever means the patient is too cold" → Misconception: shivering is the body raising temperature toward the new (higher) setpoint.

## Question 7

**Type:** integration
**Bloom's level:** analyze
**Priority:** good
**Difficulty:** advanced
**Stem:** Explain how the hypothalamic-pituitary-adrenal (HPA) axis demonstrates negative feedback at multiple levels, and why long-term steroid therapy causes adrenal insufficiency on withdrawal.
**Correct answer:** Stress → hypothalamus releases CRH → anterior pituitary releases ACTH → adrenal cortex releases cortisol → cortisol negatively feeds back at both pituitary (suppressing ACTH) and hypothalamus (suppressing CRH). Long-term exogenous steroids elevate cortisol-equivalent levels chronically, suppressing CRH and ACTH; the adrenal atrophies from disuse. Sudden withdrawal leaves the patient unable to respond to stress (no functional ACTH or cortisol) — adrenal crisis. Recovery takes weeks to months.
**Elaborative explanation:** This is why steroid taper is slow (typically over weeks). The "feedback at multiple levels" is a recurring pattern in endocrine systems — it makes the system more robust and provides multiple intervention points.

### Hint Ladder

1. The HPA axis has at least three steps.
2. Cortisol shuts down its own production at multiple levels.
3. Chronic suppression atrophies the adrenal.

### Misconception Mappings

- Wrong answer: "Cortisol feeds back only on the pituitary" → Misconception: it acts at hypothalamus too.
- Wrong answer: "Sudden steroid withdrawal causes Cushing's syndrome" → Misconception: chronic excess causes Cushing's; withdrawal causes addisonian crisis.
- Wrong answer: "Adrenal recovery from suppression takes hours" → Misconception: it takes weeks to months.

# Facts

## Definitions

- **Homeostasis**: maintenance of a stable internal environment despite external perturbation.
- **Setpoint**: the target value the control system defends.
- **Negative feedback**: a response that opposes deviation from setpoint.
- **Positive feedback**: a response that amplifies deviation from setpoint.
- **Feedforward control**: anticipatory response before the disturbance reaches the regulated variable (e.g., cephalic-phase digestion).
- **Gain**: ratio of correction to error in a feedback loop.

## Functions

- Negative feedback maintains physiological stability.
- Positive feedback drives self-completing events.
- Feedforward provides predictive correction (insulin secretion before glucose rises after meals).

## Normal values

- **Body temperature**: 36.5–37.5 °C (oral); setpoint is dynamic across the day.
- **Plasma glucose (fasting)**: 70–100 mg/dL.
- **Plasma osmolality**: 280–295 mOsm/kg.
- **Arterial pH**: 7.35–7.45.
- **Mean arterial pressure**: 70–100 mmHg.

## Relations

- Most homeostatic loops have multiple effectors operating on different timescales.
- Feedforward + negative feedback together produce both accuracy and speed.

## Classification

- **By sign**: negative vs positive feedback.
- **By timing**: feedforward vs feedback.
- **By order**: simple (one variable) vs hierarchical (multiple variables, integrated).

# Values

- **Baroreflex gain**: 2–7 (correction per unit error).
- **Body temperature setpoint variation**: ~0.5°C through the day.
- **Hypoglycaemia threshold for symptoms**: ~70 mg/dL.
- **Cortisol diurnal range**: 5–25 μg/dL (peak ~6 AM, trough ~midnight).
- **HPA axis recovery time after long-term steroid suppression**: weeks to months.

# Sources

- Guyton & Hall, _Textbook of Medical Physiology_, 14th ed., Chapter 1.
- Boron & Boulpaep, _Medical Physiology_, 3rd ed., Chapter 1.
- Ganong's _Review of Medical Physiology_, 26th ed., Chapter 1.
- AK Jain, _Textbook of Physiology_, 9th ed.
- Indu Khurana, _Textbook of Medical Physiology_, 2nd ed.
