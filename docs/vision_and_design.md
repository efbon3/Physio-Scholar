# Physiology PWA — Vision and Design Document

**Version 2.1**

This document defines what the product is and why. It is the stable reference for design decisions that do not change based on implementation phase. Pedagogical foundations, product principles, and content philosophy live here. For what ships in v1 and when, see the V1 Build Specification. For future phases, see the Roadmap. For content production workflows, see the Content Production SOP.

This document is intended to evolve slowly. Most edits should be to clarify or deepen, not to reverse. When fundamental positions change, mark them explicitly in the change log.

---

## Part 1 — The Product

### 1.1 One-Sentence Definition

A progressive web app that helps Indian MBBS students build durable, exam-ready understanding of physiological mechanisms — through forced active recall, spaced repetition, misconception-aware feedback, and metacognitive calibration.

### 1.2 Primary Framing

This product is being built first as a teaching tool for the author's own students — first-year MBBS students at the author's institution — and is designed for possible expansion to MBBS students at other institutions if and when expansion becomes natural.

This framing matters for design decisions. It means:

The initial users are known, not imagined. Feedback is direct and immediate. The pilot group is not a research cohort — they are students the author teaches.

Features are built for this specific context first. Generality is a later concern. An app that works well for first-year MBBS students in one institution can be generalized later; an app built for an imagined general audience from day one often serves no one well.

Expansion is an option, not a commitment. If the app works for the initial students, it can be refined and extended. If it doesn't, no obligation to scale something that isn't proven.

Business considerations (pricing, institutional sales, revenue models) are secondary until the educational model is proven. The app justifies itself through its effect on student learning before it justifies itself financially.

### 1.3 What This Product Is

It is a retrieval and reasoning environment for physiology, organized around mechanisms rather than chapters. Every session is a deliberate act of thinking through causal chains — not reading, not recognizing, not pattern-matching. The app teaches physiology the way it is actually tested: as interacting systems whose behavior must be predicted, compared, and explained.

It is built for the real student. An MBBS student in India with limited evening study time, usually tired, on a mobile phone, often on patchy data. Not for an idealized learner with unlimited time on a desktop.

It integrates with teaching where that teaching exists. In the initial pilot, the author teaches the students directly; feature integration is immediate. Later, if expansion happens to other institutions, faculty tools enable similar integration for teachers who aren't the app's author.

It is not a content library. Content exists to support retrieval. The mechanism page, the layered explanations, the diagrams — these are reference material supporting retrieval, not destinations for browsing.

It is not a general MBBS study app. It is physiology first, deliberately narrow, deep rather than broad. Other subjects may come later if this works; they do not dilute the focus now.

### 1.4 The User

**The initial user: first-year MBBS student at the author's institution.** Eighteen to twenty years old. Attending classes, studying evenings when energy permits, preparing implicitly for NEET-PG, INI-CET, or USMLE Step 1 three years out.

The student is taking physiology alongside anatomy and biochemistry. Physiology is the hardest of the three for most, not because the material is inherently harder, but because it demands integration. The student who memorizes physiology fails at it. The student who understands mechanisms succeeds.

The gap between students in any batch is substantial. Regional board to international schooling, Hindi-medium to English-medium, intuitive grasp to genuine struggle. The app must serve this range without forcing anyone into a category.

**The expanded user (future): MBBS students at other institutions.** If and when expansion happens. Same fundamental needs, different institutional contexts. Features that only matter for the expanded user base (institutional admin, multi-tenant tooling, institutional sales support) are deferred until expansion is real.

**The secondary user (future): physiology faculty at institutions using the app.** Professors responsible for teaching, assessment, and administrative duties. Already overburdened. The app succeeds with faculty by making existing work easier, not by adding to it.

### 1.5 Differentiation — How This Is Different

The app sits in a crowded space. Being honest about what makes it different matters for both pedagogical clarity and potential future positioning.

**Versus Anki and AnKing decks.** Those are flashcard tools with no structure beyond cards. This app organizes around mechanisms, not isolated facts. Has a learning loop, not just review. Includes hint ladders, misconception-targeted feedback, self-explanation, and clinical integration — none of which pure flashcard tools provide. For students who find AnKing overwhelming or too atomistic, this app's structured approach is genuinely different.

**Versus Marrow, PrepLadder, DAMS.** Those are comprehensive exam prep platforms covering all MBBS subjects with video lectures, notes, and MCQ banks. This app is physiology-only, and does physiology deeper than any of them. A student may well use both — Marrow for general prep, this app for physiology mastery. Additive, not replacing.

**Versus Kenhub, Physeo, TeachMeAnatomy.** Those are content-first platforms organized around lectures and reference material. This app is retrieval-first, with content serving the retrieval rather than being the destination. A student can read on Kenhub and practice retrieval here.

**Versus textbooks (Guyton, Ganong, Costanzo).** Obvious differences. Textbooks are the authority; the app is the practice environment.

**The specific wedge.** For students who understand that retrieval practice works but find Anki too atomistic, who want structured mechanism-based learning that respects their time and cognitive energy, and who want feedback that addresses misconceptions rather than just marking answers correct or incorrect — this app fills a gap none of the existing options fill.

### 1.6 Principles

Eight principles, held invariant. Features that violate them are rejected no matter how individually appealing.

**Active retrieval beats passive exposure.** No content is shown to a student without a retrieval attempt first. Reading and recognition are demoted; recall and reasoning are privileged.

**Mechanism over memorization.** Every question resolves through a causal chain, never through word association. The app teaches physiology as interacting systems, not as facts to memorize.

**Tiered scaffolding without tiered content.** One body of content at depth, adaptive delivery. No parallel "easy" and "advanced" versions. The student who needs more scaffolding gets it invisibly; the student who doesn't never encounters it.

**Honest metacognition as a feature.** The app cultivates accurate self-assessment — through rating, calibration feedback, and explicit pattern reporting. Students leaving the app should be better at knowing what they know, not just at knowing more.

**Respect the student's time and state.** A tired Tuesday at 10 PM is a different cognitive moment than a rested Sunday morning. Both are valid. The app serves both without penalty and without guilt.

**Faculty as collaborators, not observers.** In the pilot phase, the author is the faculty — feedback is direct. In future institutional deployments, the teacher layer empowers teaching, not enables surveillance. Patterns that help teach better are surfaced; minute-by-minute behavior is not.

**Content is the product.** Engineering excellence without excellent content is worthless. Beyond a baseline of working code, every hour invested in content quality produces more value than an hour invested in features.

**Trust before forcing.** Where the student's choice matters and does not meaningfully affect others, let them choose. Forcing functions exist only where their absence would compromise the core pedagogical contract — and even there, they are as lightweight as possible.

### 1.7 What This Product Is Not

Not an Anki clone.
Not a textbook or content browser.
Not a general MBBS prep platform.
Not gamified (no XP, badges, leaderboards, streak penalties).
Not a live tutoring service.
Not a replacement for classroom teaching.
Not student-generated content (quality control risk too high).
Not ad-supported (privacy implications inconsistent with positioning).
Not free forever for the general user base (pilot is free; later versions have paid tiers if expansion happens).

---

## Part 2 — Pedagogical Design

### 2.1 Evidence Base

The learning design draws from specific research traditions:

**Retrieval practice.** Roediger and Karpicke's work (2006 onwards) on the testing effect.
**Spaced repetition.** Ebbinghaus refined by Woźniak and others.
**Desirable difficulties.** Bjork's research on conditions that feel harder but produce better long-term retention.
**Self-explanation.** Chi et al.'s work on explanation-driven understanding.
**Metacognitive calibration.** Dunning-Kruger effects; medical student overconfidence (Davis et al., 2006).
**Productive failure.** Kapur's research — struggle before instruction works, when followed by high-quality explanation.
**Cognitive load theory.** Sweller and Mayer on managing extraneous load.

These findings converge on a specific pedagogical stance. This app embodies that stance.

### 2.2 The Six-Step Learning Loop

The canonical session structure, applied to each mechanism:

**Learn.** A 60–120 second micro-lesson establishing a minimal mental model. One diagram, one short explanation, three key points at most.

**Retrieve.** The student attempts recall before any answer is revealed. Multiple question types rotate: short-answer free recall, diagram labeling, prediction, reverse reasoning, mechanism chain ordering, comparison. Hint ladders available — three graduated hints before the answer.

**Explain.** After reveal, the student produces a self-explanation in their own words. AI grades for mechanism presence — not exact wording. "Did the student identify the correct causal chain?"

**Connect.** A scaffolded link showing how this mechanism relates to others.

**Apply.** A brief clinical vignette tests the mechanism in a patient context.

**Revisit.** The student rates the encounter (Again, Hard, Good, Easy). Rating combined with confidence, hints used, and explanation quality drives adaptive scheduling.

This six-step structure is the unit of learning.

### 2.3 Four Content Layers

Every mechanism exists at four depths:

**Layer 1 — Core (30 seconds).** One sentence of mechanism, one diagram, one clinical hook. Highest-priority retention target.

**Layer 2 — Working Explanation (2–3 minutes).** Mechanism unpacked with key variables, one essential graph, two most common exam framings.

**Layer 3 — Deep Dive (8–10 minutes).** Molecular basis, mathematical relationships, edge cases, integration, misconceptions.

**Layer 4 — Clinical Integration.** Vignettes and pathophysiology. Where exam-pattern cognition lives.

Layers are progressive disclosure within a mechanism, not separate pages.

### 2.4 Adaptive Structure

The app adapts on three axes:

**Level adaptation per mechanism, invisible.** Silent calibration based on first few encounters.

**Mode selection, explicit.** Learn, Review, Exam modes.

**Scaffolding, optional.** "Explain it simpler" button and inline vocabulary glossary on every content screen.

### 2.5 Rating and Forced Metacognition

After each retrieval, four-button scale: Again, Hard, Good, Easy.

**Required within session.** A student cannot advance to the next card without rating the current one.

**Not hostile across sessions.** Tab switches tolerated. App backgrounding tolerated. Phone sleep tolerated. An unrated card stays in the queue until the student returns. After 24 hours unrated, auto-rates as "Again" and scheduling continues.

**Pause always available.** Student can pause the entire session; current card remains unrated.

**Minimum 2-second delay** before rating buttons activate.

**Flat emotional tone.** No celebration on "Easy," no failure messaging on "Again." All ratings are neutral data.

Every rating logged with context: timestamp, time-to-rate, hints used, confidence, explanation quality.

### 2.6 Feedback Principles

**Retrieval precedes reveal.** Non-negotiable.

**Hints graduated, not instant.** Three-tier ladder on demand.

**Answers come with elaborative explanation.** Not binary correct/incorrect.

**Wrong answers trigger misconception-specific responses.** Known wrong mental models get targeted corrections.

**Self-explanation closes the loop.**

**Weekly metacognitive reports surface calibration patterns.**

### 2.7 Self-Explanation Grading Rubric

The AI grading of self-explanations operates on a three-tier rubric:

**Green — Well explained.**
- The student identifies the correct causal chain (direction correct).
- At least one mechanistic or structural basis is mentioned.
- No flagged misconceptions present.

**Yellow — Partially correct.**
- The causal chain is named but direction is unclear or mechanism lacks mechanistic basis.
- OR mechanism is described without clear causal direction.
- Some key concept missing but not fundamentally wrong.

**Red — Missing or wrong.**
- Wrong causal direction.
- Flagged misconception present.
- Mechanism fundamentally misidentified.

**False-positive budget.** False positives (wrong explanations marked Green) are pedagogically worse than false negatives (correct explanations marked Yellow). The grading must keep false-positive rate below 5% in testing. This is verified before launch against a test set of at least 200 sample responses, with faculty-adjudicated gold labels.

**Language robustness.** Grading prompts tested against Hinglish, Indian medical abbreviations, and varied English proficiency levels. The grader accepts natural code-switching and common abbreviations. Test set includes deliberately varied linguistic samples.

**Student dispute mechanism.** When a student disagrees with a grade, they can flag it for review. In the initial pilot, the author reviews flagged grades directly. In future versions with multiple faculty, flagged grades route to the appropriate reviewer. Dispute rate is tracked as a quality signal.

### 2.8 Question Design Philosophy

Every question probes a mechanism. No trivia. Question types rotate: prediction, reverse reasoning, mechanism chain ordering, comparison, clinical application, misconception-targeted.

The same underlying concept is probed through multiple framings. Variation scales with demonstrated mastery.

### 2.9 The Scheduler

V1 uses SM-2 with two modifications:

**Ease floor raised to 1.5.** Prevents "ease hell" while keeping self-adjusting behavior.

**Leech detection.** Cards failed five consecutive times are flagged.

SM-2 is chosen over FSRS for v1. Upgrade path to FSRS planned when retention data justifies it.

---

## Part 3 — Content Architecture

### 3.1 The Unit of Content

The **mechanism** is the fundamental unit. A physiological process treated as a coherent learning target.

A mechanism contains four content layers, a tag set (NMC competency, organ system, exam pattern, Bloom's distribution, clinical contexts), prerequisite and related mechanisms, associated questions, and linked misconceptions.

Questions attach to a primary mechanism with cross-reference tags for related ones.

Misconceptions are first-class entities shared across questions.

### 3.2 Organization

Content organized by mechanism, with multiple navigation lenses: system-first (primary), NMC competency (institutional), exam pattern (student, exam mode), clinical context (student, review), prerequisite graph (adaptive).

### 3.3 Content Sources

Content is grounded in legally sound sources:

**Open-access medical references** as citation backbone: StatPearls, OpenStax Anatomy and Physiology, LibreTexts Medicine, specific NCBI Bookshelf open titles, NIH physiology resources. Per-source license verification required.

**Institutional reference access** for faculty during authoring (used as personal reference, not reproduced).

**Faculty expertise** as primary authoritative voice.

**Past exam paper patterns** for exam-mode calibration. Patterns inform new question creation; specific questions never reproduced.

**AI drafting assistance** for initial generation, with mandatory faculty review.

Explicitly excluded: commercial question bank content, unlicensed textbook PDFs, any infringing reproduction.

Copyright memo from specialist lawyer required before scaled content production begins.

### 3.4 Content Production Philosophy

Content is the product. Authoring workflow is as important as engineering workflow.

**Scale matters, but quality matters more.** Ten mechanisms done exceptionally are worth more than fifty done adequately.

**AI assists; faculty authors.** AI produces drafts. Faculty (initially: the author alone) reviews, edits, approves. The content is faculty-authored; AI drafts are starting points.

**Single-author in the pilot; two-reviewer signoff when scaling.** For the initial pilot where the author teaches the students directly, single-author is sufficient — errors surface through direct conversation. For expansion beyond the author's own students, two-reviewer signoff becomes mandatory. This transition is documented in the Content Production SOP.

**Continuous improvement built in.** Student performance data flags questions. Student feedback flags errors. Content is never "done."

### 3.5 Content Accuracy and Correction

**Error discovery paths.** Author self-review during ongoing use; student flags via in-app report button; AI-assisted quarterly audits; performance anomalies.

**Correction workflow.** Flagged content goes to a review queue. The author investigates and either dismisses, corrects (minor edit in place with version increment), or escalates (substantive correction before publishing).

**Student notification for substantive corrections.** Weekly correction digest shown to affected students rather than per-card interruption. For corrections that change the correct answer itself (not just clarifications), an immediate notification appears the next time the student encounters the card.

**No silent corrections.** Errors are acknowledged, not papered over. Documented correction history maintained.

---

## Part 4 — Product Structure

### 4.1 Roles

For the initial pilot:
- **Student** (the author's current first-year batch).
- **Platform Admin** (the author).

For future expansion:
- Faculty role activates.
- Institutional Admin role activates.
- Platform Admin remains as operator role.

Institutional affiliation is an attribute of any user, not a separate role.

### 4.2 Subscription Tiers

**Pilot phase.** Free for the author's initial cohort. No subscription mechanics needed.

**Future (if expansion happens).** Tiers defined for eventual deployment but not built in v1:
- Free tier with limits for demonstration and acquisition.
- Individual Student tier for direct-to-consumer.
- Institutional tier for colleges with affiliated students.
- Institutional Premium tier for larger institutions needing customization.

Entitlement enforcement via Row Level Security at the database layer. Implemented in v1 data model even if not actively used in pilot, to prevent retrofit later.

### 4.3 Student Experience

**Navigation in pilot:** Three tabs: Today, Systems, Progress.

**Today.** Landing screen. Review queue count, one weak area callout, one clinical challenge, streak indicator. Single primary action button. Minimal dashboard philosophy.

**Systems.** Content browser by organ system. Filterable. Secondary navigation, not primary.

**Progress.** Personal analytics. Retention tracking, mastery percentages, streak history, weekly metacognitive calibration report, study time aggregates.

**Session experience.** Fullscreen card presentation. Minimal chrome. Content is the focus. Rating appears only at rating step. Transitions under 200ms perceived latency. No lectures between cards, no motivational messages, no interruptions.

### 4.4 Faculty Experience (Future, Not Pilot)

Not implemented in v1 pilot. The author acts as faculty directly through conversation, in-class discussion, and WhatsApp.

Future faculty experience detailed in Roadmap v2 and v2.5 scope.

### 4.5 Institutional and Platform Admin

**Pilot phase:** Author acts as platform admin through a minimal admin interface for user management and content operations. Content lives as structured markdown files in the repository edited directly — no full content admin interface built in v1.

**Future:** Full institutional and platform admin interfaces when expansion demands them.

---

## Part 5 — AI Strategy

### 5.1 Core Principle

Pre-generate aggressively during authoring. Minimize runtime AI usage.

Most of what students encounter is invariant. Generating once, faculty-reviewing, storing in database, serving from database is dramatically more efficient than generating at runtime.

### 5.2 Pre-Generated Content

Generated during authoring, stored as structured markdown files in repository (pilot) or database (future): content layers, questions and variations, three-tier hint ladders, correct answers and explanations, misconception mappings, mechanism chain questions, clinical vignettes.

This is approximately 85–90% of the app's content.

### 5.3 Runtime AI Usage

Two tasks genuinely require runtime AI:

**Self-explanation grading.** After answer reveal, student writes explanation in their own words. AI grades per the rubric in section 2.7.

**Adaptive remediation (occasional).** Student failing a card repeatedly with different wrong mechanisms. One runtime AI call generates a custom targeted explanation. Rare.

Model choice: Claude Sonnet for both.

### 5.4 Content Authoring AI

Intensive use during authoring, but offline. Layer generation, question generation, hint ladder generation, misconception map generation, periodic content audits.

Total authoring AI cost for complete curriculum: approximately $200–800 one-time.

### 5.5 Caching Strategy

Self-explanation grading responses cached by (question_id, normalized_explanation). Expected cache hit rate: 30–50%.

### 5.6 Cost Projections

**Pilot phase (author's students, ~50):** Under $20/month AI.

**If expansion to 100–1,000 students:** $30–300/month.

**If expansion to 5,000 students:** $500–1,500/month.

---

## Part 6 — Operating Principles

### 6.1 Privacy

**DPDPA compliance.** Applies from first user (author's students). Privacy policy drafted with legal counsel review before launch. Explicit consent flow at signup. Granular consent for analytics. Data export capability. Data deletion capability. Grievance officer designated.

**Minor consent under DPDPA.** First-year MBBS students include users aged 17. Legal consult completed before pilot launch, specifically on minor consent mechanics. Signup flow handles age appropriately.

**Per-category analytics opt-out.** DPDPA's right-to-withdraw-consent implies per-category granularity.

### 6.2 Content Accuracy Liability

**Terms of service include explicit disclaimers.** Educational tool, not clinical decision-making. Students must not use for patient care decisions.

**Error correction protocol.** Documented correction history maintained.

**Professional indemnity insurance.** Investigate for pilot launch; required for scaled institutional deployment.

### 6.3 Security

**Row Level Security from day one.** Every table with sensitive data has RLS policies. Defense in depth.

**RLS policies match stated principles literally.** Faculty read access to student progress is scoped to assignment-context only (when faculty role activates in v2), not all card states.

**Cross-institution leakage explicitly tested.** Test suite verifies no data leakage between institutions even in v1 where only one institution exists.

### 6.4 Anti-Abuse Controls

Even in the initial pilot where users are known, baseline controls matter:

**Watermarking.** Rendered content pages include visible user_id hash watermark.

**Rate limiting.** Server-side per-account limits: maximum 80 questions served per account per day (prevents bulk scraping), maximum 5 password reset requests per account per day, maximum 10 AI grading calls per student per day.

**Concurrent session detection.** Sessions from geographically distant IPs trigger email verification.

**Terms of service.** Explicit prohibition on content redistribution.

### 6.5 Accessibility

**V1 baseline:** WCAG 2.2 AA foundational compliance. Keyboard navigation, screen reader support, color contrast 4.5:1, visible focus indicators, text scaling to 200%, reduced motion mode, dark mode.

**V1.5 full audit:** Formal accessibility audit by specialist.

**Beyond WCAG:** Language simplicity option for medical terminology. Optional dyslexia-friendly fonts. High contrast mode.

### 6.6 Offline and Progressive Content

**Aggressive offline capability.** Students often study in hostels with unreliable WiFi or on metered mobile data.

**Progressive content download.** 5 MB app shell (gzipped JavaScript and CSS, measured in acceptance criteria). Content packs downloaded on demand. Cardiovascular pack approximately 15–25 MB.

**What works offline.** App shell, cached content and questions, hint ladders, SRS scheduling, rating and progress, self-explanations queued for later grading.

**What requires connection.** AI grading (results arrive async), downloading new content, cross-device sync, subscription operations (future).

**Sync strategy.** Local-first writes. IndexedDB immediate, sync queue processes in background when online. Ratings and reviews effectively non-conflicting. Cross-device scenarios use server timestamp as tie-breaker.

### 6.7 Support and Communication

**Pilot phase:** Author supports directly via WhatsApp, in-class conversation, and in-app feedback form. Immediate response possible because student base is small and known.

**Future scale stages:** Support ticket system, tiered support, SLAs in institutional contracts.

---

## Part 7 — Business Design Foundations

### 7.1 Pilot Phase Business Model

**No paid subscriptions in pilot.** Pilot is free for the author's students. The goal is to validate the pedagogical model, not revenue.

**No institutional sales in pilot.** The pilot institution is the author's own college, and there is no sales transaction.

### 7.2 If Expansion Happens — Future Positioning

Indian medical education is served by established players (Marrow, PrepLadder, DAMS) offering comprehensive exam prep. This app does not compete with them on breadth.

It competes on depth within physiology. A student using Marrow for general prep can use this app alongside for physiology mastery — additive, not replacing. Institutional customers see it as a tool for physiology teaching specifically.

### 7.3 Future Pricing Considerations (Not Pilot)

**Individual pricing (future).** Positioning below comprehensive exam prep, above free Anki content. Specific pricing to be determined based on pilot outcomes and market research.

**Institutional pricing (future).** Per-student annual pricing. Pilot institutions at heavily discounted rates. Standard pricing from subsequent customers.

**Payment infrastructure (future).** Razorpay for Indian payment processing. Manual invoicing initially, automation when scale justifies.

All pricing decisions deferred until pilot outcomes available.

### 7.4 Legal Foundations

**Entity.** Current entity status maintained. Transition to private limited company deferred unless expansion creates business necessity.

**Contracts.** Terms of Service, Privacy Policy (DPDPA-compliant), required before pilot launch. Faculty author agreements not needed in pilot (author is sole author). These become required when expansion brings multi-author content team.

**IP.** Content authored by the author in the app owned by the author. Platform ownership clear from start. Trademark application for product name considered when expansion approaches.

---

## Part 8 — Success Metrics

### 8.1 Leading Indicators (Measurable in V1 Pilot)

These indicators are measurable within the first 4–8 weeks of pilot deployment and serve as the primary v1 evaluation criteria:

**Session completion rate.** Percentage of started sessions reaching the rating step. Target: above 75%. Catches UX problems causing mid-session abandonment.

**Day-1, Day-7, Day-30 return rate.** Percentage of users opening the app 1, 7, and 30 days after first session. Targets: above 70%, 50%, 40% respectively.

**Average session length.** Target: 15–25 minutes per session. Too short suggests friction; too long suggests the app isn't respecting time constraints.

**Hint ladder usage distribution.** What percentage of questions get answered without hints, with one hint, two hints, three hints. Informs question calibration.

**Self-explanation submission rate.** Percentage of revealed answers where student writes a self-explanation. Target: above 40%. Low rates indicate the feature isn't earning its place.

**Student-reported helpfulness.** Qualitative feedback via in-app form and direct conversation. Target: majority of students report the app helped them understand physiology better than their previous study methods.

**Session frequency.** Number of sessions per active student per week. Target: 4+ sessions per week for engaged users.

### 8.2 Outcome Metrics (Measurable at Month 14+)

These metrics require longitudinal data and cannot be evaluated during v1 pilot:

**Durable retention.** Percentage of cards correct on reviews spaced more than 30 days after previous encounter. Target: above 85% for consistent users. Requires 3+ months of data per student.

**Metacognitive calibration improvement.** Reduction in overconfidence error between a student's first month and sixth month of use. Requires 6+ months of data.

**Exam performance correlation (if data available).** Does app usage correlate with physiology performance on internal exams or mock NEET-PG?

**Long-term retention (if data available).** Do pilot students retain physiology better than their peers at 1-year and 2-year intervals?

### 8.3 Decision Framework

**After 4-week pilot window:** Leading indicators evaluated. Continue? Iterate? Pivot? This is the primary v1 go/no-go decision.

**After 3-month pilot:** Extended leading indicators plus early outcome signals. Decide on v1.5 direction.

**After 6-month pilot:** First outcome metrics available. Evaluate whether the pedagogical model is working.

**After 14-month mark:** Full durable retention assessment. This is when the product's core claim can be tested.

Note explicitly: v1 is not evaluated on outcome metrics. Those come later. v1 is evaluated on whether students engage with it and find it helpful.

---

## Part 9 — Evolution and Maintenance

**Cadence.** Review quarterly. Update when significant decisions made or reversed.

**Change discipline.** Parts 1–2 change rarely. Parts 3–6 evolve as we learn. Parts 7–8 evolve fastest.

**Relationship to other documents.** V1 Build Specification governs what ships in v1. Roadmap governs what comes next. Content Production SOP governs content workflows. When they conflict with this document, this document is authoritative for design principles; they are authoritative for execution specifics.

---

## Appendix: Change Log

**Version 2.1** — Revisions incorporating feedback from four external reviews.

Key changes from v2.0:
- Reframed primary positioning as "teaching tool for own students, with possible expansion" rather than "product for Indian MBBS students generally."
- Added Differentiation section (Part 1.5) addressing competitive landscape.
- Clarified that pilot phase uses single-author content production; two-reviewer signoff becomes mandatory only when expansion to other institutions happens.
- Added explicit self-explanation grading rubric (Part 2.7) with Green/Yellow/Red criteria and false-positive budget.
- Added student dispute mechanism for AI grades.
- Changed content correction UX from per-card surfacing to weekly digest with immediate notification only for answer-changing corrections.
- Split Success Metrics (Part 8) into Leading Indicators (measurable at v1 pilot) and Outcome Metrics (measurable at month 14+).
- Explicit decision framework for v1 go/no-go decisions.
- Clarified business model for pilot phase (free for author's students, no paid subscriptions yet).

**Version 2.0** — Initial vision document separated from comprehensive plan.

---

**End of Vision and Design Document v2.1**
