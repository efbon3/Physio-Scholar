# Physiology PWA — Vision and Design Document

**Version 2.0**

This document defines what the product is and why. It is the stable reference for design decisions that do not change based on implementation phase. Pedagogical foundations, product principles, and content philosophy live here. For what ships in v1 and when, see the V1 Build Specification. For future phases, see the Roadmap.

This document is intended to evolve slowly. Most edits should be to clarify or deepen, not to reverse. When fundamental positions change, mark them explicitly in the change log.

---

## Part 1 — The Product

### 1.1 One-Sentence Definition

A progressive web app that makes the limited physiology study time of Indian MBBS students produce durable, exam-ready understanding of physiological mechanisms — through forced active recall, spaced repetition, misconception-aware feedback, and metacognitive calibration.

### 1.2 What This Product Is

It is a retrieval and reasoning environment for physiology, organized around mechanisms rather than chapters. Every session is a deliberate act of thinking through causal chains — not reading, not recognizing, not matching patterns. The app teaches physiology the way it is actually tested: as a set of interacting systems whose behavior must be predicted, compared, and explained.

It is built for the real student. A first-year MBBS student in India with 60–90 productive minutes per evening, usually tired, on a mobile phone, often on patchy data. It is not built for an idealized learner with unlimited time on a desktop computer.

It integrates with teaching where that teaching exists. For students at institutions that adopt the app, faculty can assign work, see class-level patterns, and align the app's learning calendar with their teaching schedule. For independent students, the same core experience exists without the institutional scaffolding.

It is not a content library. Content exists to be retrieved and applied, not consumed. The mechanism page, the layered explanations, the diagrams — these are reference material supporting retrieval, not destinations for browsing.

It is not a general MBBS study app. It is physiology first, deliberately narrow, deep rather than broad. Other subjects may come later if this works; they do not dilute the focus now.

### 1.3 The User

**The primary user: first-year MBBS student.** Eighteen to twenty years old, typically. Attending classes eight to four, five or six days a week. Evenings are for study — when they have energy for study, which is not always. Weekends variable: sometimes extended study, sometimes not.

The student is taking physiology alongside anatomy and biochemistry. Physiology is the hardest of the three for most of them — not because the material is inherently harder, but because it demands integration. You cannot understand cardiac output without understanding respiration, fluid balance, autonomic control. The student who memorizes physiology fails at it. The student who understands mechanisms succeeds.

Their medium-term horizon is NEET-PG, INI-CET, or USMLE Step 1 — exams sitting three years away. They are not actively preparing for these exams now, but the foundation for them is being laid. What they learn in first year is what they will be tested on in fourth year. The app serves this temporal reality: daily learning that compounds over years.

The gap between students in any batch is substantial. Regional board to international baccalaureate, Hindi-medium to English-medium, intuitive grasp to genuine struggle. The app must serve this range without forcing anyone into a category.

**The secondary user: physiology faculty.** A professor or assistant professor responsible for 100–200 students. Already carrying a teaching load, clinical duties, administrative work, and often research. They have limited time for new tools and limited patience for software that adds to their workload rather than reducing it.

The app succeeds with faculty by making their existing work easier. Creating an assignment should take three minutes, not thirty. Grading 150 submissions should be review-and-override, not grade-from-scratch. Seeing where the class is weak should happen at a glance, not require running reports.

### 1.4 Principles

Eight principles, held invariant. Features that violate them are rejected no matter how individually appealing.

**Active retrieval beats passive exposure.** No content is shown to a student without a retrieval attempt first. Reading and recognition are demoted. Recall and reasoning are privileged.

**Mechanism over memorization.** Every question resolves through a causal chain, never through word association. The app teaches physiology as interacting systems, not as facts to memorize.

**Tiered scaffolding without tiered content.** One body of content at depth, adaptive delivery. No parallel "easy" and "advanced" versions. The student who needs more scaffolding gets it invisibly; the student who doesn't never encounters it.

**Honest metacognition as a feature.** The app cultivates accurate self-assessment — through rating, calibration feedback, and explicit pattern reporting. Students leaving the app should be better at knowing what they know, not just at knowing more.

**Respect the student's time and state.** A tired Tuesday at 10 PM is a different cognitive moment than a rested Sunday morning. Both are valid. The app serves both without penalty and without guilt.

**Faculty as collaborators, not observers.** The teacher layer empowers teaching. It does not enable surveillance. Patterns that help teach better are surfaced; minute-by-minute behavior is not.

**Content is the product.** Engineering excellence without excellent content is worthless. Beyond a baseline of working code, every hour invested in content quality produces more value than an hour invested in features.

**Trust before forcing.** Where the student's choice matters and does not meaningfully affect others, let them choose. Forcing functions exist only where their absence would compromise the core pedagogical contract — and even there, they are as lightweight as possible.

### 1.5 What This Product Is Not

Not an Anki clone. Anki is a flashcard tool; this is a structured learning system built on different primitives (mechanisms, not cards) with richer interactions (hints, self-explanation, misconceptions).

Not a textbook or content browser. Content exists to support retrieval. Browsing is a secondary use case, not the point.

Not a general MBBS prep platform. Marrow and PrepLadder do that, and better, at least for now. This app's differentiation is depth within physiology, not breadth across medicine.

Not gamified. No XP, no badges, no leaderboards, no streak penalties. Medical students are intrinsically motivated by exams in front of them; the dopamine scaffolding of consumer apps is unnecessary and often counterproductive.

Not a live tutoring service. AI assists with grading and authoring; it does not replace human teaching.

Not a replacement for classroom teaching. It complements it, especially for affiliated students whose schedule the app integrates with.

Not free forever. A free tier exists for demonstration. Paid subscriptions sustain the product.

---

## Part 2 — Pedagogical Design

### 2.1 Evidence Base

The learning design draws from specific research traditions, not from intuition or fashion:

**Retrieval practice.** Roediger and Karpicke's work (2006 onwards) on the testing effect, showing that retrieval strengthens memory more than restudy. One of the most replicated findings in educational psychology.

**Spaced repetition.** Ebbinghaus's forgetting curve, refined by Woźniak and others. Optimal review timing produces maximum retention per unit of study time.

**Desirable difficulties.** Bjork's research showing that conditions which feel harder during learning often produce better long-term retention. Variation, spacing, interleaving, generation effects all fall here.

**Self-explanation.** Chi et al.'s work demonstrating that explaining material to oneself produces deeper, more transferable understanding than studying it passively.

**Metacognitive calibration.** Dunning-Kruger effects and the well-documented overconfidence of medical students (Davis et al., 2006). Explicit calibration feedback corrects this systematic bias.

**Productive failure.** Kapur's research showing that struggling before instruction produces deeper understanding — provided high-quality explanation follows. Struggle without resolution is not productive.

**Cognitive load theory.** Sweller and Mayer on managing extraneous cognitive load, pacing content, and dual coding without redundancy.

These findings converge on a specific pedagogical stance. This app embodies that stance.

### 2.2 The Six-Step Learning Loop

The canonical session structure, applied to each mechanism:

**Learn.** A 60–120 second micro-lesson establishing a minimal mental model. One diagram, one short explanation, three key points at most. Enough to attempt retrieval.

**Retrieve.** The student attempts recall before any answer is revealed. Multiple question types rotate: short-answer free recall, diagram labeling, prediction, reverse reasoning, mechanism chain ordering, comparison. Hint ladders available — three graduated hints before the answer.

**Explain.** After reveal, the student produces a self-explanation in their own words. AI grades for mechanism presence, not exact wording. "Did the student identify the correct causal chain?"

**Connect.** A scaffolded link showing how this mechanism relates to others. A partial concept map, an identification task for prerequisite mechanisms, a comparison with an adjacent concept.

**Apply.** A brief clinical vignette tests the mechanism in a patient context. Mechanism-level reasoning, not pattern matching.

**Revisit.** The student rates the encounter (Again, Hard, Good, Easy). Rating combined with confidence, hints used, and explanation quality drives adaptive scheduling.

This six-step structure is the unit of learning. All other features are compositions or variations of it.

### 2.3 Four Content Layers

Every mechanism exists at four depths:

**Layer 1 — Core (30 seconds).** One sentence of mechanism, one diagram, one clinical hook. What a student reviews on the autorickshaw home. The highest-priority retention target.

Example for Frank-Starling: "Increased preload stretches cardiac sarcomeres toward optimal actin-myosin overlap, increasing stroke volume — until overstretch in failing hearts inverts the relationship."

**Layer 2 — Working Explanation (2–3 minutes).** The mechanism unpacked with key variables, one essential graph, two most common exam framings. Where most active study happens.

**Layer 3 — Deep Dive (8–10 minutes).** Molecular basis, mathematical relationships, edge cases, integration with other systems, misconceptions. Pre-exam consolidation, not daily use.

**Layer 4 — Clinical Integration.** Vignettes and pathophysiology. "How does this break in heart failure? Sepsis? Hemorrhage?" Where exam-pattern cognition lives.

Layers are progressive disclosure within a mechanism, not separate pages. The SRS schedules Layer 1 cards frequently; Layer 3 less so; Layer 4 may fade except before exams.

Depth engagement is never framed as "completion percentage." A student who engages only at Layer 1 for a week has not failed; they have maintained.

### 2.4 Adaptive Structure

The app adapts on three axes:

**Level adaptation per mechanism, invisible.** Each mechanism calibrates silently based on the student's first few encounters. Novice or familiar? Starting layer and hint availability adjust. No explicit level selection — the student just uses the app and it fits itself around them.

Why per-mechanism: the student gap is not uniform across topics. Strong on cardiovascular and weak on acid-base is a normal pattern.

**Mode selection, explicit.** Three modes the student chooses based on context:

*Learn mode* — first exposure or return to faded material. Full six-step loop. No time pressure.

*Review mode* — daily SRS queue. Retrieval-first. Short mechanism reminders on wrong answers, not full re-teaching. Sessions bounded by queue and by student pause.

*Exam mode* — last-minute revision. Layer 1 summaries at velocity. Exam-pattern drills (NEET-PG, INI-CET, USMLE). Timed MCQ sets. Long-form activities disabled. New material cannot enter active SRS here — the app refuses, deliberately.

**Scaffolding, optional and low-friction.** Two scaffolds present on every content screen:

*"Explain it simpler"* button offers an analogy version. Students who need it tap it; others never notice.

*Inline vocabulary glossary* — tap any medical term for a one-line definition. Handles the English-fluency gap without a parallel dictionary.

### 2.5 Rating and Forced Metacognition

After each retrieval, the student rates on the four-button Anki-style scale:

**Again** — wrong, or didn't really know it. Card returns within minutes.
**Hard** — got it, real struggle. Returns in about one day.
**Good** — got it with reasonable effort. Standard interval.
**Easy** — got it quickly, confidently. Longer interval.

Rating is required before advancing to the next card. The student cannot skip it. They can pause the entire session — which preserves the unrated card for later — but they cannot complete a session while dodging the rating.

However, rating does not trap the phone. Tab switches, app backgrounding, and phone sleep are all tolerated. An unrated card stays in the queue until the student returns to it. After 24 hours unrated, the card auto-rates as "Again" and scheduling continues, preventing the student from getting stuck in a stalled session.

This balance — mandatory within session, flexible across sessions — preserves the metacognitive discipline without becoming user-hostile.

Three design subtleties:

**Emotional tone is flat.** "Again" is not punished with failure messaging. "Easy" is not celebrated. All four ratings are equally useful data, and the UX communicates that.

**Minimum 2-second wait before rating buttons activate.** Prevents reflexive taps that skip reflection. Not long enough to annoy; long enough to require deliberate choice.

**Every rating is logged with context.** Timestamp, time-to-rate, hints used, confidence, explanation quality. Drives adaptive scheduling and weekly calibration reports.

### 2.6 Feedback Principles

**Retrieval precedes reveal.** Non-negotiable.

**Hints graduated, not instant.** Three-tier ladder on demand. First: conceptual nudge. Second: more specific. Third: approaches the answer without giving it. Hint taps tracked.

**Answers come with elaborative explanation.** Not binary correct/incorrect. "You said X; the mechanism actually works like Y because Z." Hattie's feedback meta-analysis shows elaborative feedback produces roughly three times the effect size of simple correctness feedback.

**Wrong answers trigger misconception-specific responses.** Known wrong mental models get targeted corrections. Not just "correct answer is Y" but "you held mental model M; here's why M is wrong and what the correct model is."

**Self-explanation closes the loop.** Consolidates understanding and surfaces misconceptions MCQs miss.

**Weekly metacognitive reports surface calibration patterns.** "You rated 34 cards Easy last week; on re-test you got 27 correct. Slightly overconfident on acid-base, well-calibrated on cardiac output." This is the explicit metacognitive feedback that builds lifelong self-regulated learning.

### 2.7 Question Design Philosophy

Every question probes a mechanism. No trivia. Question types rotate:

**Prediction.** "If renal artery pressure drops 50%, predict GFR, RPF, filtration fraction." Forward inference.

**Reverse reasoning.** "ABG shows metabolic acidosis with respiratory compensation. Underlying pathology?" Backward inference.

**Mechanism chain ordering.** "Order: baroreceptor firing → medullary CV center → sympathetic efferent → TPR rise → MAP recovery." Explicit causal sequencing.

**Comparison.** "Septic shock vs cardiogenic shock: which hemodynamic parameters differ and why?" Integrative.

**Clinical application.** "22-year-old with acute wheezing and prolonged expiratory phase. Predict FEV1, FVC, FEV1/FVC." Pattern recognition with mechanism justification.

**Misconception-targeted.** Deliberately probes known wrong models. "Does ADH directly reabsorb sodium? Yes/No — explain."

The same underlying concept is probed through multiple framings. A student mastering cardiac output regulation sees it as prediction, reverse inference, comparison, clinical vignette, and mechanism chain — not five times as "determinants of stroke volume." Variation builds transferable understanding rather than reflex word-association.

Variation scales with demonstrated mastery. Novices see closely related framings first; variation widens as stability develops.

### 2.8 The Scheduler

V1 uses SM-2 with two modifications:

**Ease floor raised to 1.5.** Standard SM-2 allows ease to drop to 1.3, creating "ease hell" — permanently difficult cards that frustrate without teaching. The floor prevents this while keeping the self-adjusting behavior.

**Leech detection.** Cards failed five consecutive times are flagged. The student is prompted: review the full mechanism, mark for faculty attention, or continue. Surfaces genuine learning problems rather than grinding.

SM-2 is chosen over FSRS because it is simpler, transparent, sufficient for first-year card volumes, and familiar to medical students who have used Anki. FSRS's efficiency gains matter most at very high card counts, which first-year students do not have.

Upgrade path to FSRS planned when retention data justifies it. Domain-specific extensions possible: mechanism dependency awareness, exam proximity scheduling, layer-specific intervals.

---

## Part 3 — Content Architecture

### 3.1 The Unit of Content

The **mechanism** is the fundamental unit. A physiological process treated as a coherent learning target. Frank-Starling, countercurrent multiplier, baroreceptor reflex, ventilation-perfusion matching.

This choice is deliberate and differentiating. Most competing products organize by chapter (textbook structure) or by disease (clinical presentation). Neither reflects how physiology actually generalizes to clinical reasoning. Mechanisms do.

A mechanism contains four content layers, a tag set (NMC competency, organ system, exam pattern, Bloom's distribution, clinical contexts), prerequisite and related mechanisms, associated questions, faculty annotations, and linked misconceptions.

Questions attach to a primary mechanism, with cross-reference tags for related ones. A question contains text and type, correct answer, elaborative explanation, three-tier hint ladder, and a misconception map linking wrong answers to specific mental models.

Misconceptions are first-class entities. "ADH directly reabsorbs sodium" is a single misconception linked from dozens of questions across renal and endocrine. The misconception has its own correction explanation.

### 3.2 Organization

Content is organized by mechanism, with multiple navigation lenses:

**System-first** (primary): Cardiovascular → Cardiac cycle → Frank-Starling. How physiology is taught.

**NMC competency** (institutional): Each mechanism tagged with NMC codes. Institutions can view coverage, faculty can assign by competency.

**Exam pattern** (student, exam mode): "NEET-PG-style questions on cardiovascular." Questions tagged with exam relevance.

**Clinical context** (student, review): "Mechanisms relevant to heart failure."

**Prerequisite graph** (adaptive): Used by the system to introduce mechanisms in sensible order.

Same content, multiple lenses. Database stores relationships; UI presents whichever lens the user needs.

### 3.3 Content Sources

Content is grounded in legally and ethically sound sources:

**Open-access medical references** as citation backbone: StatPearls (NCBI Bookshelf, CC BY 4.0), OpenStax Anatomy and Physiology (CC BY 4.0), LibreTexts Medicine, specific NCBI Bookshelf open titles, NIH physiology resources. Attribution format per each license — not all NCBI Bookshelf content is open access, so per-source verification is required.

**Institutional reference access** for faculty during authoring (their college's Access Medicine, ClinicalKey, or similar — used as personal reference while writing, not reproduced).

**Faculty expertise** as primary authoritative voice. A physiology professor with years of teaching experience is a legitimate source, and their understanding is what the content should reflect.

**Past exam paper patterns** for exam-mode calibration. Patterns inform new question creation; specific questions are never reproduced.

**AI drafting assistance** for initial generation, with mandatory faculty review of every output.

Explicitly excluded: commercial question bank content (Marrow, PrepLadder, DAMS, UWorld, Kaplan — copyrighted), unlicensed textbook PDFs, any content whose reproduction would constitute infringement under the Indian Copyright Act 1957 or the Berne Convention.

This requires a copyright lawyer's memo confirming specific attribution formats for StatPearls, OpenStax, and NCBI Bookshelf content before scaled content production begins. That review is a prerequisite, not an afterthought.

### 3.4 Content Production Philosophy

Content is the product. The authoring workflow is as important as the engineering workflow.

**Scale matters, but quality matters more.** Ten mechanisms done exceptionally are worth more than fifty done adequately. Students can tell the difference. Faculty can tell the difference. The app's reputation will rest on content quality far more than on feature count.

**AI assists; faculty authors.** The frontier AI produces drafts. Faculty reviews, edits, approves. This is not AI-generated content reviewed by faculty — it is faculty-authored content where AI drafts are starting points. The distinction matters legally (authorship for copyright purposes) and pedagogically (faculty judgment is what makes the content trustworthy).

**Two-reviewer signoff, always.** Author plus reviewer. No shortcuts, no exceptions. Medical content without review is liability.

**Continuous improvement is built in.** Student performance data flags questions for revision. Student feedback flags errors. Quarterly audits catch drift. Content is never "done."

### 3.5 Content Accuracy and Correction

Published content will occasionally contain errors. The workflow for handling this matters:

**Error discovery paths.** Faculty self-review during ongoing use; student flags via in-app report button; AI-assisted quarterly audits; performance anomalies (questions students consistently get wrong despite mastery elsewhere).

**Correction workflow.** Flagged content goes to a review queue. A reviewer investigates and either dismisses (not an error), corrects (minor — fixes in place with version increment), or escalates (substantive — requires second review before publishing correction).

**Student notification for substantive corrections.** When a mechanism or question is found materially wrong, students who have encountered it see a notice on their next review: "This content has been updated. [brief description of change]." Students can opt to re-review affected cards immediately or let them come up naturally in SRS.

**No silent corrections.** Errors are acknowledged, not papered over. This builds trust rather than hiding problems. It also has legal importance — for medical education content that students may rely on for exams or clinical reasoning, documented correction history matters.

---

## Part 4 — Product Structure

### 4.1 Roles

Three fundamental roles, with one carved out for institutional self-service:

**Student.** Primary user. Completes reviews, works through the loop, takes practice, sees personal progress.

**Faculty.** Teachers within an institution. Creates assignments, grades submissions, views class analytics, manages teaching schedule, authors and reviews content if part of content team.

**Institutional Admin.** Manages one institution's use. Users, subscription, institutional settings, academic calendar.

**Platform Admin.** Operates the platform. Cross-institution visibility, global content management, subscription and billing operations, audit logs.

Institutional affiliation is an attribute of any user, not a separate role. A student may be affiliated or independent; faculty are always affiliated. The same role (Student) serves both, with context-aware features.

### 4.2 Subscription Tiers

Four tiers:

**Free.** Limited — Layer 1 and 2 for one organ system (cardiovascular). Full core loop on that system. Enough to experience the product over 1–2 weeks and understand what paid unlocks. Not a sustainable study platform by itself.

**Individual Student.** Full content across all systems, all four layers, SRS, exam mode, calibration reports, personal schedule features. Direct-to-consumer.

**Institutional.** Individual Student features for all affiliated students, plus faculty tools (assignments, analytics, heatmap), schedule management, class management, AI-assisted grading, onboarding support. Purchased by institutions.

**Institutional Premium.** Institutional plus custom content authoring support, priority response, detailed institutional analytics, early feature access. For larger institutions or those requiring customization.

Entitlement is checked at every content-serving endpoint, enforced at the database layer via Row Level Security. A user's effective entitlement combines individual and institutional subscriptions; the more permissive applies.

Two UI patterns for entitlement enforcement: **gating** (content visible in navigation but locked on open — marketing surface) and **filtering** (content omitted from SRS queues and drills — seamless absence).

### 4.3 Student Experience

**Navigation.** Three primary tabs in v1: Today, Systems, Progress. (Practice consolidates into Today via a "study ahead" option rather than being a separate tab.)

**Today.** Landing screen. Review queue count, one flagged weak area, one clinical challenge, streak indicator, schedule-derived alerts. Single primary action button. Minimal dashboard philosophy — only actionable items.

**Systems.** Content browser by organ system. Filterable by NMC competency, exam pattern, mechanism type. Secondary navigation, not primary — students should not spend most of their time browsing.

**Progress.** Personal analytics. Retention curves, mastery percentages, streak history, weekly metacognitive calibration report, study time aggregates. Private mirror of the student's own learning.

**Session experience.** Fullscreen card presentation. Minimal chrome. The content is the focus. Rating appears only at the rating step. Transitions fast (under 200ms perceived latency). No lectures between cards, no motivational messages, no interruptions.

**Session end.** Brief informational summary — cards reviewed, rough retention, next review due. Not celebratory. Student closes the app or moves on.

**Affiliated student additions.** Today dashboard includes schedule-derived prompts ("Class tomorrow on Frank-Starling — review these cards tonight?"). Assignment notifications when faculty assigns work. Small institutional identifier in profile. Assignments inject cards into SRS queue with deadline markers — same learning experience, just tagged.

### 4.4 Faculty Experience

**Navigation.** Four views: My Classes, Topic Heatmap, Assignments, Schedule.

**My Classes.** Roster with engagement traffic light, average retention by system, streak, last active, flags. Click into a student for aggregate detail only — never individual wrong answers on self-practice.

**Topic Heatmap.** Organ systems × mechanisms grid, heat-shaded by class-average mastery. Reveals collective weakness at a glance.

**Assignments.** Creation, management, grading review. Select mechanisms or questions, set deadlines, assign to class or individuals. AI provides first-pass grading on free-text; faculty reviews and overrides.

**Schedule.** Teaching calendar, exam calendar, assignment deadlines, practical schedules, events. Faculty manages own teaching schedule; department-level events from institutional admin.

**Faculty principles.** No surveillance framing. Aggregate data on self-practice, individual only on formal assignments. Faculty can annotate mechanisms with local pedagogical notes visible to their students — the app becomes a vessel for local wisdom, not just imported content.

### 4.5 Institutional and Platform Admin

**Institutional admin.** Overview, users, content access configuration, academic calendar, subscription and billing, light branding. Manages one institution.

**Platform admin.** Cross-institution visibility, user search across institutions (with audit logging), content management (global authoring and review), financial operations, system health, audit logs. Privileged access with MFA required, time-limited sessions, all actions logged.

---

## Part 5 — AI Strategy

### 5.1 Core Principle

Pre-generate aggressively during authoring. Minimize runtime AI usage.

Most of what students encounter is invariant. The explanation of Frank-Starling does not change between students or over time. Generating it once during authoring, faculty-reviewing, storing in the database, and serving from the database is dramatically more efficient than generating at runtime per request.

This design pattern compounds: runtime costs stay low regardless of user count, latency is database speed rather than API speed, offline capability becomes trivial, reliability improves (AI outages don't break core function), faculty review happens once per piece of content.

### 5.2 Pre-Generated Content

Generated during authoring, stored in the database, served without runtime AI: content layers, questions and variations, three-tier hint ladders, correct answers and explanations, misconception mappings, mechanism chain questions, clinical vignettes, simulator narratives.

This is approximately 85–90% of the app's content.

### 5.3 Runtime AI Usage

Two tasks genuinely require runtime AI:

**Self-explanation grading.** After answer reveal, student writes an explanation in their own words. AI grades for mechanism presence — not exact wording. "Did the student identify the correct causal chain?"

Model choice: Claude Sonnet. This is the highest-stakes runtime AI interaction; wrong grading damages learning.

Critical requirement: the grading prompt must accept natural language use. Indian medical students frequently code-switch between English and Hindi, use localized medical abbreviations, and mix registers. The grader that penalizes these patterns teaches students to write for the grader rather than for their own understanding. Before v1 launch, grading prompts must be tested against 50+ sample responses including Hinglish, common Indian medical abbreviations, and varied English proficiency levels. Prompts are adjusted until grading is robust to natural language variation.

Expected frequency: 0–1 calls per student per day. Not every session includes self-explanation.

**Adaptive remediation (occasional).** A student failing a card repeatedly with different wrong mechanisms each time needs custom intervention. One runtime AI call generates a targeted explanation. Rare — pre-generated content serves most students.

Model choice: Claude Sonnet. Expected frequency: small fraction of users monthly.

### 5.4 Content Authoring AI

Intensive use during authoring, but offline (not runtime), so cost doesn't scale with users.

**Layer generation** per mechanism: Claude Opus or Sonnet generates drafts of all four layers from source material. One-time cost.

**Question generation** per mechanism: 12–15 candidate questions at varied Bloom's levels and types. Faculty selects 6–10 best.

**Hint ladder generation** per question: three-tier graduated hints.

**Misconception map generation** per question: likely wrong answers mapped to misconceptions.

**Periodic content audits** (quarterly): AI reviews the question bank for internal consistency, flags issues for faculty review.

Total authoring AI cost for a complete curriculum (200 mechanisms): approximately $200–800 one-time. Not a scaling concern.

### 5.5 Provider

**Primary: Anthropic Claude.** Strong instruction-following for structured outputs (critical for authoring), competitive medical accuracy, clean API, vision capability for schedule image processing, native relationship with the development tool (Claude Code).

Model tier usage:
- **Claude Opus** — highest-stakes authoring (complex questions, initial mechanism generation).
- **Claude Sonnet** — runtime grading, most authoring, adaptive remediation.
- **Claude Haiku** — high-volume low-stakes classification if needed (most classification is database lookup in this architecture).

### 5.6 Caching Strategy

Self-explanation grading results cached keyed to (question_id, normalized_explanation). Similar explanations reuse cached grades.

Remediation responses cached by (question_id, error_pattern).

Expected cache hit rate after initial user base: 30–50%. Reduces effective AI costs substantially.

### 5.7 Cost Projections

Based on pre-generation and caching:
- 100 students: $30–80/month.
- 1,000 students: $100–300/month.
- 5,000 students: $500–1,500/month.

---

## Part 6 — Operating Principles

### 6.1 Privacy

**Minor consent under DPDPA.** First-year MBBS students include users aged 17. DPDPA treats under-18s as children requiring verifiable parental consent. Before v1 launch, a specialist privacy lawyer must be consulted on the specific mechanics:

- How signup handles users aged 17 (parental consent flow, likely via institutional framework for affiliated users and direct parental verification for independents).
- Whether calibration reports constitute behavioral tracking for minors (likely yes; handling follows consult guidance).
- Who the legally recognized consent authority is for institutional students aged 17 (parent, institution as fiduciary, or both).

Legal consult is a prerequisite, not a post-launch task.

**Data handling principles.** Minimize collection. Minimize retention. Encrypt in transit and at rest. Access logged and audited. Third-party processors vetted for compliance. Data Processing Agreements with institutional customers. Data export capability. Data deletion with 30-day grace period.

**Per-category analytics opt-out.** DPDPA's right-to-withdraw-consent implies per-category granularity, not blanket.

**Audit log retention.** Specified policy, with redaction for deleted-user data.

### 6.2 Content Accuracy Liability

**Terms of service include explicit disclaimers.** The app supports learning; it is not a clinical decision-making tool. Students must not use it for patient care decisions. This is stated prominently in terms and in onboarding.

**Faculty author contracts include indemnification clauses.** Authors warrant that their contributions are original or appropriately licensed and indemnify the platform against claims of infringement or inaccuracy.

**Professional indemnity insurance.** Investigate and likely acquire before scaled institutional deployment. Medical education content has non-trivial liability surface.

**Error correction protocol.** Substantive errors in published content trigger student notification (see section 3.5). Documented correction history maintained.

### 6.3 Security

**Row Level Security from day one.** Every table with sensitive data has RLS policies enforcing access rules. Defense in depth — even if application code has a bug, the database still enforces access.

**RLS policies match stated principles.** Specifically: faculty read access to student_card_state is scoped to assignment-context mechanisms only, not all card states. If a principle says "faculty sees assignment-context only," the RLS policy enforces it literally.

**Cross-institution leakage is explicitly tested.** The test suite includes cases verifying that a user from institution A cannot read any data from institution B under any code path.

### 6.4 Anti-Abuse Controls

Students will attempt to share accounts, screenshot questions for Telegram groups, and scrape the question bank. Minimum controls in v1:

**Watermarking.** Rendered content pages include a visible user_id hash watermark. Screenshots posted publicly are traceable.

**Rate limiting.** Server-side per-account limits on questions served per day. Prevents scraping.

**Concurrent session detection.** Sessions from geographically distant IPs trigger verification. Shared accounts are identified.

**Terms and conditions.** Explicit prohibition on redistribution. Account termination as remedy for violation.

Not a fortress. Visible deterrents that cover 80% of abuse cheaply.

### 6.5 Accessibility

WCAG 2.2 AA as the target. shadcn/ui components are accessible by default — use them.

**V1 baseline.** Keyboard navigation, screen reader support with proper ARIA labels, 4.5:1 color contrast on body text, visible focus indicators, text scaling to 200%, reduced motion mode, dark mode.

**V1.5 full audit.** Formal accessibility audit by a specialist before first institutional deployment. Institutional procurement increasingly requires documented accessibility compliance.

**Beyond WCAG.** Language simplicity option for medical terminology. Optional dyslexia-friendly fonts. High contrast mode.

### 6.6 Offline and Progressive Content

**Aggressive offline capability.** Students often study in hostels with unreliable WiFi or on metered mobile data. The app is designed for this.

**Progressive content download.** Initial install is a 5 MB app shell only. Content downloads as the student engages with it. Cardiovascular pack is an opt-in 15–25 MB download. Other systems similarly packaged. Institutional users on campus WiFi get a "download everything now" prompt. Students on metered mobile data control what they download.

**What works offline.** App shell, cached content and questions, hint ladders, SRS scheduling, rating and progress, self-explanations queued for later grading.

**What requires connection.** AI grading (results arrive asynchronously), downloading new content, cross-device sync, subscription operations.

**Sync strategy.** Local-first writes. IndexedDB immediate, sync queue processes in background when online. Ratings and reviews are effectively non-conflicting (each student's own data, last-writer-wins). Cross-device scenarios use server timestamp as tie-breaker with vector clocks for ambiguous cases.

### 6.7 Support and Communication

Early stage: single support email, 24-hour response target, in-app feedback form, Sentry for bug capture. Sufficient for under 500 users.

Growth stage: help center, FAQ, 12-hour response target, escalation path for critical issues.

Scale stage: support ticket system, tiered support, dedicated institutional points of contact, SLAs in institutional contracts.

Principle: responsiveness to early users is non-negotiable. The first 100 users teach you what the app needs to be. Quick response builds the loyalty that drives word-of-mouth.

---

## Part 7 — Business Design Foundations

### 7.1 Market Positioning

Indian medical education is served by established players (Marrow, PrepLadder, DAMS) offering comprehensive exam prep. This app does not compete with them on breadth.

It competes on depth within physiology. A student using Marrow for general prep can use this app alongside for physiology mastery — it is additive, not replacing. Institutional customers see it as a tool for physiology teaching specifically, not as a general LMS.

### 7.2 Customer Segments

**Institutional customers.** Medical colleges offering MBBS. Physiology department heads as primary decision-makers. Approximately 700 medical colleges in India; initial target is the 100–150 better-resourced institutions that already budget for educational technology.

**Individual customers.** MBBS students (Indian primarily, international following similar curricula as adjacent market). Self-selecting, find the app via word-of-mouth or content marketing. Price-conscious but willing to pay for clearly valuable material.

### 7.3 Pricing Philosophy

**Pilot pricing for first institutions.** Institutions 1–5 pilot at ₹100–300 per student per year — heavily discounted. Purpose is case studies and product refinement, not revenue. These relationships are investments.

**Standard institutional pricing from institution 6.** ₹800 per student per year for Institutional tier, ₹1,500 per student per year for Institutional Premium. Minimum 100 seats. Volume discounts at 500 and 1000 seats. Multi-year commitments get additional discount.

**Individual pricing.** Monthly ₹399, annual ₹2,999. Free tier permanent but limited.

**Payment.** Razorpay when automated billing earns its complexity. Manual invoicing for the first 100 paying users. Institutional contracts use annual invoicing with GST.

### 7.4 Go-to-Market

**Phase 1 — Pilots (months 1–6 post-launch).** Two to five pilot institutions, 200–500 students. Direct outreach via existing relationships. Intensive support. Goal: 2–3 strong case studies.

**Phase 2 — Institutional sales (months 6–18).** Fifteen to thirty institutional customers, 3,000–7,500 students. Expanded sales outreach. Conference presence. Referral program. Webinars for department heads.

**Phase 3 — Scale (months 18+).** Dedicated sales hire, self-service institutional signup for smaller institutions, international expansion.

**Individual acquisition (parallel, ongoing).** Content marketing (blog, YouTube). Word-of-mouth from institutional students. Social media where MBBS students congregate. App store optimization.

### 7.5 Institutional Sales Honesty

The institutional pitch: "This works for students regardless of faculty engagement; faculty get optional superpowers if they want them."

This is important because realistic base rate for faculty adoption at Indian institutions is 20–30% active usage, 50–70% passive tolerance, some fraction actively ignoring. The app's value to institutions cannot depend on faculty driving adoption — it must come from student outcomes directly.

Over-promising faculty engagement in pilot conversations damages the relationship when it does not materialize. The product pitch is about student learning; faculty tools are a bonus.

### 7.6 Legal Foundations

**Entity.** Sole proprietorship initially. Transition to private limited company when annual revenue approaches ₹20 lakhs, first institutional contracts require corporate entity, external funding contemplated, or hiring employees.

**GST registration.** Mandatory above ₹20 lakhs annual revenue. Voluntary earlier if institutional customers require GST invoices. Educational software typically 18% GST.

**Contracts.** Terms of Service, Privacy Policy (DPDPA-compliant), Data Processing Agreement template, Institutional subscription agreement, Faculty author agreements with IP assignment and indemnification clauses. Legal counsel review before any paying customer. Budget ₹50,000–100,000 for initial legal work including the minor consent consultation, copyright memo, and DPA template.

**IP.** Content authored in the app owned by the platform via faculty author assignment. Trademark application for product name. Clear license terms for any third-party content.

---

## Part 8 — Success Metrics

Primary metrics for year one, in order of importance:

**Durable retention.** Percentage of cards correct on reviews spaced more than 30 days after previous encounter. Target: above 85% for students with consistent daily use. This is the outcome the app exists to produce.

**Daily active use among enrolled students.** Percentage opening the app on any given day and completing at least one review session. Target: above 50% for institutional students, above 30% for independents. Without habitual use, retention doesn't happen.

**Session completion rate.** Percentage of started sessions reaching the rating step. Target: above 75%. Catches UX problems causing mid-session abandonment.

**Institutional renewal rate.** Annual. Target: above 80% in year two. Institutional churn is the existential risk to the business.

**Metacognitive calibration improvement.** Reduction in overconfidence error between first month and sixth month of use, per student. Novel metric but directly captures whether the app builds the metacognitive skill it claims to.

Secondary metrics: question-level difficulty distributions, feature usage patterns, faculty engagement with assignments and analytics, content-flag rates as quality signal.

---

## Part 9 — Evolution and Maintenance

This document is a foundation, not a finished work. It will change as the product encounters real students, real faculty, real institutions.

**Cadence.** Review quarterly for accuracy. Update when significant design decisions are made or reversed. Version tracked in git.

**Change discipline.** Parts 1 and 2 (product vision and pedagogy) should change rarely and only with strong justification. Parts 3–6 (content, structure, AI, operations) can evolve as we learn. Parts 7–8 (business, metrics) evolve fastest.

**Relationship to other documents.** The V1 Build Specification governs what ships in v1. The Roadmap governs what comes next. When they conflict with this document, this document is authoritative for design principles; they are authoritative for execution specifics.

---

## Appendix: Change Log

*Version 2.0 — Initial vision document separated from comprehensive plan.*

Key changes from the v1.0 Comprehensive Plan:
- Removed implementation specifics (moved to V1 Build Specification).
- Softened forced rating UX to allow tab switches, added 24-hour time decay.
- Tightened content licensing language with per-source specificity.
- Added minor consent under DPDPA as prerequisite legal review.
- Added content accuracy liability section.
- Added anti-abuse controls section.
- Changed first-install from 50–80 MB to 5 MB progressive download.
- Revised institutional sales messaging for realistic faculty adoption.
- Added explicit testing requirement for AI grading against Hinglish and localized language use.
- Added RLS-policy-matches-stated-principles requirement.

---

**End of Vision and Design Document v2.0**
