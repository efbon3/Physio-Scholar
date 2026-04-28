# Build Specification — Section Revisions for Mechanism Pages and Test Sessions

This document contains drop-in replacements for specific sections of the V1 Build Specification. Each section is marked with the build spec section it replaces. Apply these in sequence. Sections not mentioned here remain as currently drafted in `build_spec.md`.

These revisions cover three connected design decisions made after the original build spec was written:

1. The two-zone mechanism page model: each mechanism page has a textbook-reading zone (the four content layers) and a test zone (the format-chosen test session). The original "Learn mode" terminology is retired in favor of this two-zone framing.
2. A unified submit-then-reveal flow across all three formats. The student commits an answer (or declines to attempt) via an explicit submit action; only after submitting do they see the correct answer and reveal screen.
3. An "I don't know" rating as a fifth SM-2 input, for MCQ and fill-blank formats. This separates honest acknowledgment of ignorance from confident-wrong attempts, both for pedagogical accuracy and for metacognitive analytics.

---

## Replaces Section 2.3 ("Student Experience") — partial revision

The existing section opens with "Navigation. Three tabs: Today, Systems, Progress." Keep this. Keep the descriptions of the Today dashboard. The Systems tab description and Mechanism detail page description need replacement; the rest of 2.3 stays as currently written.

### Systems tab (revised)

List of organ systems. V1 shows only Cardiovascular as active; future systems display with "Coming soon" labels and are not selectable. Tapping Cardiovascular opens the list of mechanisms within that system, ordered by curriculum position. Each mechanism in the list shows its title, brief subtitle, the student's mastery percentage on that mechanism (if any progress exists), and a status indicator distinguishing mechanisms the student has not yet started, has tested at least once, or has reached a defined mastery threshold on.

Tapping a mechanism opens the mechanism detail page (the two-zone view).

### Mechanism detail page (replaces existing description)

The mechanism detail page is the central student-facing surface for studying and testing on a single mechanism. It presents two distinct zones — a textbook-reading zone and a test zone — accessible from the same page. The student moves between them as they choose.

**Header.** Mechanism title and brief subtitle. Personal stats line showing mastery percentage, last reviewed date, and next review due date if applicable.

**Zone 1 — Textbook reading.** Four layer tabs displayed prominently: Core (30 seconds), Working (2-3 minutes), Deep Dive (8-10 minutes), and Clinical Integration. The Core tab opens by default on first visit. Each tab renders the corresponding layer's content as readable text and inline diagrams.

Students browse, read, and re-read at their own pace. There is no time pressure, no required progression through tabs, and no rating prompt while in the textbook zone. A student can read only Layer 1 and leave; they can read all four; they can return tomorrow and pick up where they left off.

The textbook zone is purely a learning surface. Time spent in it is logged for analytics but does not contribute to SRS state.

**Zone 2 — Test yourself.** A "Test yourself" button appears below the layer tabs and is also accessible from a persistent action bar on the page. Tapping it opens format selection.

Format selection presents three options as cards, with brief descriptions:
- **MCQ** — multiple choice questions; the system grades automatically; misconception-aware feedback fires on wrong answers.
- **Descriptive** — free-text answers; the student commits an answer (or declines to type one), then sees the model answer and self-rates Green/Yellow/Red.
- **Fill in the blanks** — short answers (typically a value, term, or phrase); the system grades against the author-specified answer space; partial-credit feedback fires for unit errors and near-miss values.

The student picks one format. The system assembles a test session from the question bank for this mechanism, filtered to the chosen format. Session length is bounded by available questions in that format (typically 4-8 questions per format per mechanism in v1).

Within the format selection screen, students may also apply optional filters before starting:
- Question type (recall, comparison, ordering, prediction, calculation, clinical application, misconception-targeted, analysis) — drill on a specific cognitive operation.
- Priority (must / should / good) — focus on essential content first.
- Difficulty (foundational / standard / advanced) — match the student's current level.

If the student doesn't apply filters, the session pulls all available questions in the chosen format. Filters narrow the pool. New students opening a mechanism for the first time see priority and difficulty pre-defaulted to "must" and "foundational" respectively, with the defaults visibly indicated and easily cleared. Returning students keep their last-used filter selection as the default.

A "Start test" button initiates the session.

---

## Test session flow (new subsection within 2.3, replacing the existing Learn mode description)

The test session runs as a sequence of question-answer-reveal cycles. The structure is unified across all three formats: the student commits an answer via an explicit submit action, after which the reveal screen appears.

### Question screen

The question screen displays the stem prominently, with format-appropriate input affordances below it:

- **MCQ** — answer options as selectable cards. The student taps an option to select it; their selection is visibly highlighted. They can change their selection any number of times before submitting. A fifth option, **"I don't know,"** appears below the answer options as a visually subordinate but clearly available choice. Selecting "I don't know" highlights it the same way as picking an answer option; the student can switch between options and "I don't know" freely.
- **Descriptive** — a text area for typing the answer. The student may type, edit freely, or leave the area blank if they're answering mentally. There is no character limit.
- **Fill-in-the-blank** — an inline input field (or multiple, depending on the question). The student types their answer; they can edit freely. A subordinate **"I don't know"** button appears below the input field.

Hint ladder is available on every format — the student can request hint 1, hint 2, or hint 3 before submitting. Each hint tap is logged as a metacognitive signal.

A primary **"Submit answer"** button is the action that commits the answer and advances to the reveal screen. The student's input (or "I don't know" selection, where applicable) is locked at the moment of submit. Until submitted, the student can change their answer freely.

For descriptive: tapping submit with an empty text area is permitted and indicates the student answered mentally only. The system records the empty submission and proceeds to reveal.

### Reveal screen

After submit, the reveal screen loads. The structure differs slightly per format because the cognitive work the student needs to do at this stage differs.

**MCQ reveal.** The student's selection is shown alongside the correct option. If the student picked correctly, a brief acknowledgment appears alongside the elaborative explanation. If they picked wrong and the chosen option matches a misconception map entry, the misconception correction is shown alongside the explanation. If they picked wrong without a matching misconception, only the elaborative explanation is shown. If they picked "I don't know," the correct answer is shown with the elaborative explanation; no misconception correction fires (there is no wrong answer to map).

For MCQ, there is no separate self-rating step. The system has graded the answer; the rating is determined automatically per the SM-2 mapping below. After a brief pause for the student to read the explanation, they tap "Next question" to advance.

**Fill-in-the-blank reveal.** The student's typed answer is shown alongside the correct answer. The system displays the grade (Green for exact match or accepted variant within tolerance; Yellow for partial — typically right value with wrong unit, or numerically close but outside tolerance; Red for wrong; or "Don't know" if the student selected that option). Brief explanatory feedback accompanies the grade, particularly for Yellow ("right value, check the units" or similar).

For fill-blank, there is no separate self-rating step. The system has graded the answer; the rating is determined automatically per the SM-2 mapping below.

**Descriptive reveal.** The student's typed answer (or "answered mentally" if empty) is shown at the top. The model answer is shown below, with the elaborative explanation. The Green/Yellow/Red rating buttons are grayed out for a 5-second minimum delay, ensuring the student actually reads the model answer before rating.

After the delay, the student rates Green (well explained), Yellow (partially correct), or Red (missing or wrong). The rating drives SRS scheduling per the SM-2 mapping below.

**Engagement method prompt (descriptive only).** After the student rates, an optional prompt asks how they engaged with the question:
- "Wrote my answer; checked with a friend or peer."
- "Wrote my answer; checked it myself against the model answer."
- "Worked it out mentally — said it out loud or thought it through."

The student picks one. Their pick becomes the default for the next descriptive question; they can change it per-card if their method varies. If they decline to answer, the prompt is skipped silently and no method is recorded for that card.

The method is logged as analytics metadata only. It does not affect SRS scheduling. The data exists to support later analysis of how different study methods correlate with retention, and to inform metacognitive calibration features when AI grading is added in v2.

### SRS rating mappings

The SM-2 scheduler accepts five rating inputs in the revised system, up from the standard four. The fifth — "Don't know" — is a new modification, joining the existing two modifications (ease floor at 1.5; leech detection at 5 consecutive lapses).

For MCQ:
- **Correct** → Good. Standard SM-2 Good behavior: interval × ease, ease unchanged.
- **Wrong** → Again. Card returns next day; ease drops by 0.2; repetition count resets; lapse count increments. Misconception correction fires if the picked option matches a misconception map entry.
- **"I don't know"** → Don't know (new). Card returns next day (same as Again); ease unchanged; repetition count resets; lapse count does not increment. No misconception correction fires.

For fill-in-the-blank:
- **Green** (exact match or accepted variant within tolerance) → Good.
- **Yellow** (partial — unit error or near-miss) → Hard. Interval × 1.2; ease drops by 0.15.
- **Red** (wrong) → Again.
- **"I don't know"** → Don't know.

For descriptive (student-rated):
- **Green** → Good.
- **Yellow** → Hard.
- **Red** → Again.

There is no "I don't know" option for descriptive, because the student already controls whether to attempt — submitting an empty text area and rating themselves Red is the equivalent.

The pedagogical rationale for "Don't know" being distinct from Again: a student who confidently picked a wrong answer demonstrated a wrong mental model that needs unlearning, justifying the ease drop. A student who admitted ignorance demonstrated absence rather than miscalibration; their future intervals don't need tightening because no wrong model is consolidated, even though the card should return soon to introduce the content. The next-interval is identical between the two; only the ease behavior differs.

### End-of-session summary

When the test session ends — all questions completed, or session paused with all attempted questions rated — the student sees a summary screen showing:

- Number of questions completed in this session.
- Performance breakdown:
  - For MCQ: number correct, wrong, "I don't know."
  - For fill-blank: number Green, Yellow, Red, "I don't know."
  - For descriptive: number rated Green, Yellow, Red.
- Brief acknowledgment that the cards encountered in this session will reappear in the student's daily review queue based on the ratings.
- Two action buttons: "Review another mechanism" (returns to Systems tab) and "Open today's review" (jumps to the Today dashboard's daily SRS queue).

The summary is informational only. No celebration on high performance. No failure messaging on low performance. Performance is data, not a judgment, consistent with the flat-emotional-tone principle.

### Practice-only sessions (optional)

Before starting a test session, the student may toggle "Practice only — don't update my schedule." When enabled, the session runs identically except that no SRS state is created or updated. The student gets the cognitive workout and the per-question feedback, but the cards do not enter the daily review queue (or, if already in it, do not have their schedules altered by this session).

This is opt-in per session, not a global setting. Default is off — sessions update SRS state.

---

## Replaces Section 2.3 ("Learn mode" subsection) — full replacement

The existing build spec describes Learn mode as a separate flow launched from a mechanism page, with the six-step loop applied without time pressure. This is replaced by the two-zone model above. The term "Learn mode" is retired; mechanism-centric study is now described as "the mechanism detail page" or "studying a mechanism."

The six-step loop's pedagogical structure is preserved within the two-zone model:

- **Learn** (read the layers, especially Layer 1 Core and Layer 2 Working) → Zone 1 textbook reading.
- **Retrieve** → answering each test question.
- **Explain** → reading the elaborative explanation after answer reveal; for descriptive, the student's own typed answer is the explanation, compared against the model answer.
- **Connect** → embedded in Layer 3 Deep Dive content (integration with other mechanisms) and in question types like comparison and analysis that explicitly relate this mechanism to others.
- **Apply** → embedded in Layer 4 Clinical Integration content and in clinical application question types.
- **Revisit** → the rating at the end of each test question, plus the daily review queue surfacing the card again per SRS scheduling.

The six steps are not enforced as a sequence within a single session. The student reads what they want, tests when they want, returns to the daily queue when SRS schedules cards. The pedagogical intent of the six-step loop is preserved; the rigid sequence is not.

---

## Replaces Section 2.6 ("Review session flow") — partial revision

The existing description of review session flow stays as written for the daily SRS-driven session. Add the following clarification at the end of the section:

### Daily review and mechanism-centric tests as complementary surfaces

The student-facing app provides two ways to engage with the question bank:

**Daily review session** (Today dashboard, "Start review" button). SRS-driven, pulls cards due across all mechanisms and all formats the student has tested in. Type-mixed and format-mixed by default. The system decides what the student sees, based on the schedule. This is the primary retention-building surface.

**Mechanism-centric tests** (Systems tab → mechanism page → "Test yourself" button). Student-driven, scoped to one mechanism, format chosen by the student, optionally filtered by type/priority/difficulty. The student decides what they see. This is the primary new-content learning surface and the targeted-drill surface.

The two surfaces share a single underlying SRS state per (student, card). A card encountered for the first time through a mechanism-centric test enters the student's SRS state with an initial schedule based on the rating given. Subsequent encounters of that card happen through the daily review queue, which schedules it according to SM-2 and the student's accumulated ratings. The student does not need to keep using the mechanism-centric test for that card; the daily review handles ongoing review automatically.

---

## Replaces Section 2.7 ("SRS Scheduler") — partial revision

The existing section describes SM-2 with two modifications. Update the modification list to include the new Don't-know rating, and add the explicit five-rating input description.

### SM-2 with three modifications (revised)

The scheduler is SM-2 with three modifications from the textbook algorithm:

**Modification 1 — Ease floor at 1.5.** Standard SM-2 floor is 1.3. Raised to prevent "ease hell" while keeping self-adjusting behavior.

**Modification 2 — Leech detection at 5 consecutive lapses.** Cards failed five times in a row are flagged. Student is offered three options: open Learn mode (the mechanism detail page), suspend the card, or continue trying.

**Modification 3 — Five rating inputs instead of four.** The standard SM-2 ratings are Again, Hard, Good, Easy. The system adds a fifth rating, "Don't know," for use on MCQ and fill-blank formats. Don't know produces the same next-interval as Again (card returns next day) but does not decrement ease and does not increment lapse count. The pedagogical rationale: a student who admitted ignorance has not consolidated a wrong mental model, so future intervals don't need tightening.

The interval and ease rules per rating are:

- **Easy** → interval × ease × 1.3; ease + 0.15.
- **Good** → interval × ease; ease unchanged.
- **Hard** → interval × 1.2; ease − 0.15.
- **Again** → 1 day; ease − 0.2; repetitions reset to 0; lapses + 1.
- **Don't know** → 1 day; ease unchanged; repetitions reset to 0; lapses unchanged.

The scheduler is implemented as a pure function with 100% test coverage required, with explicit edge cases tested for all five rating inputs.

---

## Additions to Section 3.1 ("Functional Criteria")

Add the following acceptance criteria:

- A student can navigate from Systems → Cardiovascular → [a mechanism] and see the four layer tabs rendering correctly with content and diagrams.
- A student can read each of the four layers without any test-related interruption.
- A student can tap "Test yourself" and see three format options with brief descriptions.
- A student can pick a format and see optional filter controls (type, priority, difficulty) with sensible defaults.
- A student can start a test session and answer questions in the chosen format, with a primary "Submit answer" button as the commit action across all formats.
- For MCQ and fill-blank, a visually subordinate "I don't know" button is available alongside the answer input.
- Students can change their answer (including switching between selected options and "I don't know") freely until they submit.
- After submit, the reveal screen displays format-appropriate feedback:
  - MCQ: deterministic grading against the correct option; misconception correction fires on wrong choices that match misconception map entries; no correction fires on "I don't know."
  - Fill-blank: deterministic grading against author-specified answer space, with Green/Yellow/Red distinguishing exact match, partial (unit errors or near-misses), and wrong; "Don't know" recorded distinctly.
  - Descriptive: model answer reveal, then student self-rates Green/Yellow/Red after the 5-second minimum delay.
- For descriptive, after self-rating, an optional engagement-method prompt is displayed (written-peer / written-self / mental). Selection is recorded as analytics metadata; SRS scheduling is unaffected.
- A test session correctly updates SRS state per question, with the five-rating mapping (Easy/Good/Hard/Again/Don't know) producing the correct interval and ease changes per the SM-2 rules.
- "Don't know" submissions are recorded distinctly from wrong attempts in the reviews log, so analytics can distinguish the two.
- The "practice only" toggle on a test session correctly suppresses SRS state updates while still rendering questions and feedback identically.
- The end-of-session summary correctly displays performance breakdown including the "Don't know" count where applicable.
- Filter selections persist as the default for the next test session on the same mechanism.
- New students see priority="must" and difficulty="foundational" pre-applied as defaults on first encounter with a mechanism, with the defaults visibly indicated and easily cleared.

---

## Additions to Section 3.6 ("User Experience Criteria")

Add the following:

- Students report that the textbook-reading zone and the test zone feel like complementary parts of one workflow.
- Students who use mechanism-centric tests as their primary entry point also use daily review at least 3 times per week for ongoing retention.
- Students who self-rate descriptive answers report that the rating buttons feel clear and the 5-second delay does not feel arbitrary.
- The "I don't know" button is used by students at a measurable rate on MCQ (suggesting they perceive it as a legitimate option rather than a hidden fallback). Target: at least 5% of MCQ encounters use the option, indicating students aren't always guessing.
- The ratio of "I don't know" submissions to wrong-attempt submissions per student is tracked and surfaced in the weekly progress view as a metacognitive calibration signal.

---

## Schema additions for the reviews log

The `reviews` table records each rating event. The following fields are added to support the changes in this revision:

- `answer_method` (enum, nullable): one of `attempted_correct`, `attempted_wrong`, `dont_know` for MCQ/fill-blank; null for descriptive (where the rating is self-assigned and the concept does not apply).
- `engagement_method` (enum, nullable): one of `written_peer`, `written_self`, `mental` for descriptive; null for MCQ/fill-blank or when the student declined to specify.
- `rating` (enum): expanded from the four-value SM-2 standard to include `dont_know` as a fifth value.

The misconception map join is now conditional on `answer_method = attempted_wrong` for MCQ; "Don't know" submissions do not fire misconception corrections even if a misconception entry exists for the position the student would have selected.

---

## What this draft does NOT cover

Several other build spec sections also need revision to reflect decisions made elsewhere in the conversation. They are not drafted here and should be addressed in separate revision passes:

1. **Section 2.2 (Content)** — needs to reflect three-format separate-banks (Scenario C), UUID-and-content-hash content addressing, and the cosmetic-vs-material edit ruleset from the SOP revision.
2. **Section 2.6 (Self-Explanation Grading)** — currently describes AI grading. Needs full replacement: AI grading is deferred to v2; descriptive is self-graded in v1 per the test session flow above.
3. **Section 4.5 (Phase 4 — AI Integration)** — should be removed from v1 build phases entirely. Phases renumber.
4. **Section 6 (MVP Cut Line)** — needs revision because AI self-explanation grading is no longer in v1 scope. The differentiation argument shifts.
5. **Section 7 (V1 Out-of-Scope)** — needs to add "AI self-explanation grading" and "metacognitive calibration" to the deferred list.
6. **Cost projections** — runtime AI cost drops to zero in v1.

These revisions should be done together to keep the document coherent.
