# Question Type Templates

A working catalogue of question types you can drop straight into a
mechanism file's `# Questions` section. Each template is a complete,
parser-valid question block with placeholder content — replace the
placeholders with your topic and you're done.

The `**Type:**` field accepts any non-empty string at the schema level,
so the names below are conventions, not enforced enums. Pick the label
that best describes what the learner is being asked to do; reuse a
label if a more specific one would be misleading.

Each template ships with default **Priority** and **Difficulty** values
that match the typical centre of gravity for that question type
(e.g., `recall` → `must / foundational`, `analysis` → `should / advanced`).
Override per-question whenever the topic warrants it. Both fields
parse to enums:

- **Priority**: `must` · `should` · `good`
- **Difficulty**: `foundational` · `standard` · `advanced`

The two axes are independent. A `recall` question can be `good /
advanced` (an obscure trivia recall), and an `analysis` question can
be `must / standard` (a high-yield breakdown that's not particularly
hard).

Each template uses the strict misconception line shape the parser
requires (`- Wrong answer: "..." -> Misconception: ...`). Either ASCII
`->` or Unicode `→` is accepted as the separator.

---

## 1. `recall` — direct retrieval

Use for foundational facts that the learner needs at fingertip speed.
Bloom's level: **remember**. Keep stems short and unambiguous.

```markdown
## Question N
**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** What is the normal resting cardiac output of a healthy 70 kg adult?
**Correct answer:** Approximately 5 L/min (range 4.5–6 L/min at rest).
**Elaborative explanation:** Cardiac output = stroke volume × heart rate. At rest, a typical 70 kg adult has SV ≈ 70 mL and HR ≈ 70 bpm, giving CO ≈ 4.9 L/min. This baseline anchors every comparison you'll see — a fall to 3 L/min is shock; a rise to 25 L/min is heavy exercise.

### Hint Ladder
1. Two numbers, both familiar: stroke volume and heart rate. Multiply them.
2. Stroke volume at rest is roughly 70 mL. Heart rate is roughly 70 bpm.
3. The product is in millilitres per minute. Convert to litres.

### Misconception Mappings
- Wrong answer: "10 L/min" -> Misconception: 10 L/min is upper-end exercise CO, not rest. Resting CO is roughly half this.
- Wrong answer: "1 L/min" -> Misconception: This is closer to renal blood flow alone. Total CO is much higher; the kidneys receive ~20% of resting output.
```

---

## 2. `comparison` — distinguish two concepts or scenarios

Forces the learner to articulate the difference between similar-looking
phenomena. Bloom's level: **understand** (sometimes **apply** if a
clinical decision rides on the distinction).

```markdown
## Question N
**Type:** comparison
**Bloom's level:** understand
**Priority:** must
**Difficulty:** standard
**Stem:** A patient lying flat has a JVP of 4 cm above the sternal angle. After standing, it falls to below the clavicle. A second patient lying flat has a JVP of 4 cm; after standing, it remains visibly elevated. Which finding is normal and which suggests right-sided heart failure, and why does posture distinguish them?
**Correct answer:** The first patient is normal. JVP is a hydrostatic column reflecting right atrial pressure; standing drops the column relative to the sternal angle and the visible level falls. The second patient has a persistently elevated JVP regardless of posture — a hallmark of raised right atrial pressure (right-sided heart failure, fluid overload, tamponade, constrictive pericarditis).
**Elaborative explanation:** The bedside utility of JVP is exactly this: posture-sensitivity reveals whether elevated pressure is positional or pathological. A column that responds to gravity is venous return doing its job; a column that doesn't is the right atrium failing to drain.

### Hint Ladder
1. JVP measures pressure in which chamber, and what is normal?
2. Why does the visible JVP drop when a healthy person stands up?
3. If standing doesn't drop it, the problem is upstream from the venous return pathway.

### Misconception Mappings
- Wrong answer: "Both findings are normal because JVP varies with posture" -> Misconception: Posture-sensitivity is the normal property. A JVP that stays elevated with standing is the abnormality.
- Wrong answer: "JVP measures left atrial pressure" -> Misconception: JVP reflects right atrial pressure. Left atrial pressure requires Swan-Ganz catheterisation or echocardiography.
```

---

## 3. `mechanism chain ordering` — place steps in causal order

Tests whether the learner has the sequence locked in, not just the
parts. Bloom's level: **understand**. Provide 5–7 elements; fewer is
trivial, more becomes a puzzle.

```markdown
## Question N
**Type:** mechanism chain ordering
**Bloom's level:** understand
**Priority:** must
**Difficulty:** foundational
**Stem:** Place the following events of the baroreceptor reflex in causal order, beginning with the disturbance: (i) sympathetic outflow falls and parasympathetic outflow rises, (ii) MAP rises acutely, (iii) afferent signals via CN IX and CN X reach the NTS, (iv) carotid sinus and aortic arch baroreceptors increase firing, (v) heart rate slows, contractility decreases, vasodilatation occurs, (vi) MAP returns toward set-point.
**Correct answer:** ii → iv → iii → i → v → vi (disturbance → sensor → afferent → integrator → efferent + effector → response).
**Elaborative explanation:** The reflex maps onto the canonical homeostatic loop. Knowing where each lesion lives clinically — afferent baroreceptor failure, NTS damage, autonomic neuropathy — is the payoff for memorising this sequence rather than the bare reflex name.

### Hint Ladder
1. Detection has to come before any coordinated response.
2. Information has to travel toward the brainstem before efferent output is produced.
3. The pattern is sensor → ? → integrator → ? → effector → response. Fill the gaps.

### Misconception Mappings
- Wrong answer: "MAP returns to set-point comes immediately after baroreceptors fire" -> Misconception: Several intermediate steps (afferent, integration, efferent, effector) sit between sensor firing and the eventual MAP correction.
- Wrong answer: "Sympathetic outflow rises in response to a MAP rise" -> Misconception: Baroreflex output to a MAP rise is sympathetic inhibition + parasympathetic activation. Sympathetic activation is the response to a MAP fall.
```

---

## 4. `prediction` — perturb and predict

The learner takes a baseline, a perturbation, and predicts the
consequence using the mechanism. Bloom's level: **apply**.

```markdown
## Question N
**Type:** prediction
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A patient with normal cardiac function receives a sudden 1 L crystalloid bolus. Predict the directional changes in (a) right atrial pressure, (b) end-diastolic volume, (c) stroke volume, and (d) cardiac output, holding heart rate constant.
**Correct answer:** All four rise. The bolus increases venous return, raising right atrial pressure. Greater venous return increases end-diastolic volume (preload). By the Frank-Starling relationship, increased preload increases stroke volume. With heart rate held constant, the rise in stroke volume produces a rise in cardiac output.
**Elaborative explanation:** This is the Frank-Starling chain in its simplest form. Each step depends on the previous one — a failure anywhere breaks the prediction. In a patient with diastolic dysfunction, step (b) is impaired; in systolic failure, step (c) is impaired. Practising the prediction on a healthy heart first makes the failure modes legible.

### Hint Ladder
1. Where does the extra fluid land first in the venous circulation?
2. The Frank-Starling curve relates which two variables?
3. With heart rate held constant, cardiac output tracks one of the other variables directly.

### Misconception Mappings
- Wrong answer: "Stroke volume falls because the ventricle is overstretched" -> Misconception: Overstretch only matters at very high preloads (descending limb of Frank-Starling). A 1 L bolus in a normal heart sits well within the ascending limb.
- Wrong answer: "Cardiac output is unchanged because heart rate is constant" -> Misconception: CO = SV × HR. SV rose, so CO rose, even with HR fixed.
```

---

## 5. `calculation` — quantitative working

The learner shows numerical reasoning. Bloom's level: **apply**.
Always state the formula, the values, the arithmetic, and the units.

```markdown
## Question N
**Type:** calculation
**Bloom's level:** apply
**Priority:** should
**Difficulty:** standard
**Stem:** A patient has a heart rate of 80 bpm, end-diastolic volume of 120 mL, and end-systolic volume of 50 mL. Calculate (a) stroke volume, (b) ejection fraction, and (c) cardiac output in L/min.
**Correct answer:**
(a) SV = EDV − ESV = 120 − 50 = **70 mL**.
(b) EF = SV / EDV = 70 / 120 = **0.58 or 58%**.
(c) CO = SV × HR = 70 mL × 80 bpm = 5,600 mL/min = **5.6 L/min**.
**Elaborative explanation:** All three numbers fall in the normal adult range. EF below ~40% suggests systolic dysfunction; above ~70% can indicate hypertrophic or restrictive disease (preserved EF with reduced filling). The point of the calculation is feeling the relationships, not memorising the constants.

### Hint Ladder
1. Stroke volume is the difference between two volumes — which two?
2. Ejection fraction is a ratio. Which volume goes on top, and which on the bottom?
3. Cardiac output multiplies stroke volume by something per minute.

### Misconception Mappings
- Wrong answer: "EF = SV / ESV" -> Misconception: EF is fraction of EDV ejected, so the denominator is EDV (the starting volume), not ESV (what's left).
- Wrong answer: "CO is 5,600 L/min" -> Misconception: A unit slip — 5,600 is in mL/min. Divide by 1,000 for L/min. Spotting the unit error is part of the skill.
```

---

## 6. `clinical application` — bedside scenario

Maps the mechanism onto a real clinical situation. Bloom's level:
**apply**. Keep the scenario tight; one finding, one mechanism question.

```markdown
## Question N
**Type:** clinical application
**Bloom's level:** apply
**Priority:** should
**Difficulty:** advanced
**Stem:** A 65-year-old with severe aortic stenosis presents with exertional syncope. Using cardiovascular mechanics, explain why exertion specifically — rather than rest — precipitates loss of consciousness in this patient.
**Correct answer:** Aortic stenosis fixes the maximum stroke volume by limiting outflow. At rest, baseline cardiac output is preserved by elevated heart rate and contractility. During exertion, peripheral vasodilatation drops total peripheral resistance, but the stenosed valve prevents the compensatory rise in cardiac output (CO cannot rise enough to maintain MAP = CO × TPR). MAP falls, cerebral perfusion falls, syncope follows.
**Elaborative explanation:** The clinical pearl: any condition that fixes one term in MAP = CO × TPR makes the patient fragile to exercise, where the other term must adjust. Aortic stenosis is the textbook example; severe pulmonary hypertension and constrictive pericarditis behave similarly. Recognising the haemodynamic family is more useful than memorising the symptom list of each condition individually.

### Hint Ladder
1. What is the relationship between MAP, cardiac output, and total peripheral resistance?
2. What happens to TPR during exercise, and why?
3. If TPR drops and CO can't rise to compensate, what happens to MAP and to brain perfusion?

### Misconception Mappings
- Wrong answer: "Syncope is from valve obstruction directly blocking blood flow to the brain" -> Misconception: The brain isn't supplied through the aortic valve in any direct sense. Syncope here is a peripheral haemodynamic problem (MAP falls), not a focal flow obstruction.
- Wrong answer: "Patient should compensate by raising heart rate further" -> Misconception: Higher HR shortens diastolic filling, which can worsen LV filling across a fixed valve. The compensation strategies that work at rest run out under load.
```

---

## 7. `misconception-targeted` — direct attack on a common error

Names a specific error the learner likely holds and corrects it. Bloom's
level: **understand** to **analyze** depending on subtlety. The wrong
answer is the *intended* answer to surface in the misconceptions list,
so the question is doing pedagogical work even before the reveal.

```markdown
## Question N
**Type:** misconception-targeted
**Bloom's level:** analyze
**Priority:** must
**Difficulty:** advanced
**Stem:** Many textbooks state that the parasympathetic nervous system "decreases heart rate." A student infers from this that vagal stimulation alone could stop a healthy heart by driving rate to zero. Why is this inference wrong, and what actually limits the maximum slowing produced by vagal tone?
**Correct answer:** Vagal stimulation slows the SA node by hyperpolarising the pacemaker cells (M2 → Gi → IK,ACh activation), but it cannot drive heart rate below the intrinsic rate of subordinate pacemakers. If the SA node is silenced entirely, the AV node (~40–60 bpm) or ventricular pacemakers (~20–40 bpm) take over. Maximum vagal slowing in a healthy human is roughly 30–40 bpm — not zero. Asystole from vagal activation alone is not a normal physiological outcome; it requires either sustained extreme stimulation or pre-existing conduction disease.
**Elaborative explanation:** This is the conceptual difference between *suppressing the dominant pacemaker* and *abolishing all cardiac automaticity*. The hierarchy of pacemakers is a safety system — vagal tone modulates the dominant one without eliminating the backup.

### Hint Ladder
1. The SA node isn't the only structure with automaticity. Which others have it?
2. If the SA node stops firing, what takes over?
3. Vagal tone changes the rate of the dominant pacemaker, not the existence of automaticity itself.

### Misconception Mappings
- Wrong answer: "Vagal stimulation can drive HR to zero" -> Misconception: Subordinate pacemakers (AV node, ventricle) take over once the SA node is suppressed. Vagal tone modulates the dominant pacemaker, not the entire conduction hierarchy.
- Wrong answer: "Sympathetic blockade alone would stop the heart" -> Misconception: Intrinsic SA pacemaker rate (~100 bpm) is faster than the resting rate, which is set by tonic vagal predominance. Removing both autonomic inputs gives the intrinsic rate, not asystole.
```

---

## 8. `analysis` — multi-step decomposition

Asks the learner to take apart a complex situation, identify the
contributing mechanisms, and explain how they interact. Bloom's level:
**analyze**.

```markdown
## Question N
**Type:** analysis
**Bloom's level:** analyze
**Priority:** should
**Difficulty:** advanced
**Stem:** A patient on long-term ACE inhibitor therapy for hypertension develops acute renal failure within hours of starting an NSAID. Decompose this into the contributing mechanisms: (i) what the ACE inhibitor does to the renal afferent and efferent arterioles, (ii) what NSAIDs do to the same vessels, and (iii) why combining the two — but neither alone — typically produces the failure.
**Correct answer:**
(i) ACE inhibitors reduce angiotensin II, which preferentially constricts the *efferent* arteriole. Removing ATII lowers efferent tone, dropping intra-glomerular pressure and GFR.
(ii) Prostaglandins (PGE₂, PGI₂) maintain vasodilatation of the *afferent* arteriole, especially when renal perfusion is already compromised. NSAIDs block prostaglandin synthesis, raising afferent tone and reducing inflow.
(iii) On their own, each can be tolerated by a healthy kidney. Combined, the kidney loses both glomerular pressure mechanisms — the afferent vasodilator support and the efferent vasoconstrictor support — and GFR collapses. The physiology, not the pharmacology, is what makes this combination dangerous.
**Elaborative explanation:** This pattern is recurrent: each drug perturbs one limb of a two-limb regulatory system, and the system tolerates either perturbation alone but not both. Recognising the mechanism class lets the learner predict similar interactions (e.g., ACE inhibitor + volume depletion, NSAID + heart failure with renal hypoperfusion).

### Hint Ladder
1. Which arteriole does angiotensin II constrict preferentially, and what happens when you block ATII?
2. What role do prostaglandins play in afferent arteriolar tone, especially under stress?
3. The kidney has compensatory pathways for either perturbation alone. What does combining them remove?

### Misconception Mappings
- Wrong answer: "Both drugs damage the kidney directly" -> Misconception: Neither drug is directly nephrotoxic in usual doses. The injury is haemodynamic — collapse of the dual regulatory system that maintains glomerular pressure.
- Wrong answer: "ACE inhibitors and NSAIDs act on the same arteriole" -> Misconception: They act on opposite arterioles (ACE inhibitor on efferent, NSAID on afferent). That's why the combination is uniquely dangerous — it removes both safety margins.
```
