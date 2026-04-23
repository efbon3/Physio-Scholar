# Physiology PWA — Comprehensive Project Plan

**Version:** 1.0 (initial design document)
**Status:** Pre-build, design phase complete
**Target audience:** Project founder, Claude Code (as build specification), faculty collaborators, future engineers

---

## Table of contents

1. Executive summary
2. Product vision and design principles
3. Target users and usage context
4. Core learning model (the pedagogy)
5. Content model and taxonomy
6. Roles and permissions
7. Subscription model
8. Feature specifications — student experience
9. Feature specifications — faculty experience
10. Feature specifications — admin experience
11. Feature specifications — schedule system
12. Feature specifications — content authoring and management
13. Technical architecture
14. Data model
15. AI integration
16. Offline architecture
17. Security, privacy, and compliance
18. Accessibility
19. Testing strategy
20. Deployment, monitoring, and operations
21. Build phasing and release plan
22. Content production plan
23. Business operations
24. Open questions and deferred decisions
25. Appendix A — Prompt templates
26. Appendix B — Data schemas
27. Appendix C — Initial mechanism list

---

## 1. Executive summary

This document specifies a Progressive Web App (PWA) designed to help first-year MBBS students in India build durable, exam-ready understanding of physiology through evidence-based learning methods. The app combines active recall, adaptive spaced repetition, self-explanation, clinical integration, and metacognitive feedback into a coherent learning loop, with a faculty layer that enables teachers to assign, track, assess, and customize the learning experience for their students.

The product serves three distinct user populations: students affiliated with partner medical colleges (who receive institutional features including synchronized teaching schedules and faculty assignments), independent students (who subscribe individually for self-directed learning), and faculty and administrators at partner institutions. The app operates as a Progressive Web App to maximize cross-device compatibility, support offline use on patchy connectivity, and avoid app store friction.

The product is designed to be built by a solo technical operator using Claude Code as the primary implementation partner, with faculty collaborators providing content authoring and pedagogical review. The phased build plan delivers a student-focused MVP first, followed by the institutional and faculty layers, with ongoing expansion of content coverage and features.

Core differentiators versus existing medical education apps: genuinely layered content that respects limited student time, a forced metacognitive rating system that builds self-assessment skill, misconception-targeted feedback, mechanism-first organization rather than disease-first or textbook-first, and deep integration between institutional teaching schedules and student study pacing.

---

## 2. Product vision and design principles

### Vision statement

A physiology learning platform that makes every study session a deliberate act of thinking through mechanisms, not browsing content. Built for the real constraints of MBBS life — limited evening time, cognitive fatigue, mobile-first, patchy connectivity, preparation for high-stakes exams. Institutional when needed, independent when not. Durable knowledge, not short-term familiarity.

### Design principles

**Active over passive.** No content exposure without retrieval that follows. Reading is not studying. Every interaction ends with the student producing knowledge, not receiving it.

**Mechanism before memorization.** Every answer is grounded in a physiological mechanism. Even multiple-choice questions resolve through understanding the why, not pattern-matching the what.

**Time respect.** The student's time is the scarcest resource in the system. Features that waste time are cut. Layered content lets students engage at whatever depth fits their energy and schedule today, without penalty.

**Honest difficulty.** The app makes students work for answers through graduated hints, forces rating before it reveals solutions, and refuses to minimize self-assessment. But it always teaches when a student has genuinely engaged — Socratic method is not a wall.

**Pedagogical tone of neutrality.** Right, wrong, confident, uncertain — all are equally useful signals. The app treats them as data, not as moral outcomes. No celebration of success, no punishment of struggle. Emotional flatness supports honest self-assessment.

**Trust before surveillance.** Faculty see patterns, not keystrokes. Aggregate class data, not individual practice mistakes. Student trust is foundational; an app students feel surveilled by is an app students don't use honestly.

**Institutional depth, individual accessibility.** Affiliated institutions get deep features (schedules, assignments, custom content). Independent users get the same core learning experience without being made to feel second-class.

**Simplicity of runtime, richness of authoring.** AI does heavy lifting during content authoring, with faculty review. Runtime AI is minimal — just the tasks that genuinely require it. This keeps the app cheap, fast, reliable, and offline-capable.

**Build for solo maintainability.** Every technical decision optimizes for a small team (or one person plus Claude Code) being able to build, ship, and operate the product sustainably for years.

---

## 3. Target users and usage context

### Primary user: first-year MBBS student

**Demographics.** 17-20 years old, from across India, diverse educational backgrounds (from English-medium private schools to state-board Hindi-medium, from urban to rural), varying prior biology depth, varying English proficiency, varying digital fluency.

**Context.** Classroom instruction 8 AM to 4 PM, physiology as one of three subjects (alongside anatomy and biochemistry). Physical and cognitive fatigue by evening. Lives in a hostel or shared accommodation, primarily mobile phone access (with occasional laptop for longer sessions), patchy WiFi, limited data budgets on mobile networks.

**Available study time.** Realistically 60-90 productive minutes per day for physiology, but highly variable — some evenings 20 minutes, some weekends 4 hours. Highly uneven weekly patterns around internal exams, practicals, and life. Evenings are cognitively depleted; sessions must respect this.

**Motivation profile.** Intrinsically motivated by a clear long-term goal (passing MBBS, qualifying for PG entrance exams, eventually practicing medicine). Does not need gamification to study. Does need the app to feel worthwhile — studying is hard; studying with a bad app is demoralizing. Small amounts of friction compound into disengagement.

**Prior knowledge baseline.** Wide variance. Some students entered MBBS with strong 12th-grade biology and can engage physiology at a near-textbook level immediately. Others are still catching up on basic cell biology concepts that underpin physiology. The app must serve both without making either feel patronized or overwhelmed.

**Exam context.** Proximate: internal assessments every few weeks, semester exams, first-year university exams at end of year. Distant but dominant: NEET-PG or INI-CET for PG admission (3 years out), optionally USMLE (for those considering US clinical training). The conceptual framework and clinical integration built now compound into long-term exam readiness — the student knows this even if they can't articulate it.

### Secondary user: physiology faculty

Professors, associate professors, assistant professors, and senior residents responsible for teaching physiology at medical colleges. Typically 8-15 faculty members per department depending on college size. Teaching loads include lectures, practicals, tutorials, assessments, administrative duties.

**Context.** Limited technology adoption willingness varies by institution and individual. Some faculty are digitally fluent and eager for tools; others are skeptical and time-pressed. The app must provide clear value in faculty's existing workflow, not demand they change their workflow to accommodate it.

**Key needs.** Reduce grading burden (AI first-pass on submissions), identify struggling students before exams, track class-level understanding, share pedagogical insights across colleagues, coordinate teaching and assessment schedules.

### Tertiary user: institutional admin

The department head, dean's office representative, or administrative coordinator who manages the department's software subscriptions and institutional deployments. Primarily responsible for user management, subscription renewal, and high-level oversight.

### Quaternary user: platform admin (the operator)

The app founder and any future team members. Full access to all data for support, debugging, platform management, and content management.

### Independent student

Students from non-affiliated colleges, private study candidates, PG aspirants re-studying physiology, international students using the app for USMLE prep. They subscribe individually, use the full learning loop without institutional features. Represents a direct-to-consumer growth channel separate from institutional sales.

---

## 4. Core learning model (the pedagogy)

### Foundational principle

Learning physiology well means being able to reconstruct mechanisms from partial cues, apply them to novel clinical scenarios, and recognize when a mental model is broken. This is distinct from recognizing correct answers on multiple-choice questions, which pattern-matches without deep understanding. The app's entire architecture serves this deeper goal, not the shallower one.

### The canonical six-step learning loop

Every substantive interaction with a mechanism follows this sequence:

**Step 1 — Learn (60-120 seconds).** A compact mechanism introduction. One diagram, one narrated or textual explanation, one clinical hook showing why this mechanism matters. Deliberately brief to respect cognitive load. Students can expand into deeper layers (see content model) if they have time and energy.

**Step 2 — Retrieve (forced attempt before any reveal).** The student attempts to answer a question based on what they just learned or previously studied. The answer is never accessible until they commit a response. Multiple question formats (see question engine section) probe the same underlying concept from different angles.

**Step 3 — Explain (self-explanation).** After the reveal, the student writes or speaks a short explanation of the mechanism in their own words. Typically 2-4 sentences. This is graded by AI for mechanism presence, not wording accuracy.

**Step 4 — Connect (concept linking).** The student completes a scaffolded concept map or link task showing how this mechanism relates to adjacent concepts (cause, consequence, compensation, integration with other systems).

**Step 5 — Apply (clinical vignette).** A short clinical scenario (4-6 lines) testing mechanism-level reasoning. Not a long PBL case — a focused test of whether the student can deploy the mechanism in a clinical context.

**Step 6 — Revisit (SRS scheduling).** After the student rates their performance, the card enters (or returns to) the spaced repetition queue with an interval calculated from the rating, confidence level, response time, and mechanism-specific history.

This loop is the unit of substantive learning. All other modes (review, exam mode, quick practice) are variations that emphasize specific steps and compress others.

### The forced rating system

After revealing an answer, students rate their performance on a four-button scale:

- **Again** — wrong, or correct only after seeing the answer. Card returns within the same session.
- **Hard** — correct but with significant struggle. Card returns in ~1 day.
- **Good** — correct with reasonable effort. Standard scheduling applies.
- **Easy** — correct quickly and confidently. Extended interval.

The rating step cannot be skipped. The UI locks on the rating screen with no close button, no back gesture escape, and no tab-switch bypass (Page Visibility API returns to the rating prompt). A 2-3 second minimum delay prevents reflexive tapping. The only escape is "Pause Session," which preserves the unrated card for a future session but does not let the student avoid rating it.

If the student force-closes the app mid-rating, reopening returns them to the same card and rating prompt. Incomplete ratings are stored in IndexedDB locally and persist across restarts.

The emotional tone of all four ratings is flat. No success animations on Easy, no failure messaging on Again. The UX treats ratings as data collection, not as judgment.

### Metacognitive calibration

The system tracks confidence ratings alongside correctness. Every card stores: the rating, the actual outcome on subsequent reviews, the time taken to answer, the number of hints used, and confidence (implicit in the rating choice).

Weekly calibration reports surface patterns to the student: "You rated 34 cards Easy this week but got 7 of them wrong on subsequent review. You tend to overestimate your mastery of acid-base but underestimate on cardiac output." This is the explicit metacognitive feedback that builds self-assessment skill over time.

Calibration patterns are personal. They are not shown to faculty or other students.

### Question types supported

The question engine produces and serves multiple question formats, all testing mechanisms:

**Free recall** — open-ended prompts requiring the student to generate the answer. "List the determinants of stroke volume." Uses structured fill-in where possible (one or two key terms), free-text for self-explanation phases.

**Prediction** — forward reasoning from a stated condition. "If the renal artery is constricted by 50%, predict the changes in GFR, RPF, and filtration fraction."

**Reverse reasoning** — given an outcome, identify the mechanism. "A patient presents with hypokalemia, metabolic alkalosis, and hypertension. Which mechanism explains these findings?"

**Mechanism-chain ordering** — arrange steps in correct causal sequence. "Order these events in the baroreceptor reflex following a blood pressure drop."

**Diagram labeling** — drag-and-drop labels onto unlabeled diagrams (nephron segments, cardiac cycle phases, action potential regions).

**Variable-effect questions** — given a change in one variable, predict effects on others. Uses simulator-style thinking without requiring actual simulator UI.

**Clinical application** — short vignettes with mechanism-based questions. "Which compensatory response explains this patient's presentation?"

**Misconception-targeted** — questions specifically designed to catch known wrong mental models, with misconception-specific feedback when the student falls into the trap.

**Multiple choice** — only after free recall attempt. MCQ is used for exam-pattern practice (NEET-PG, INI-CET, USMLE style) and for situations where the distractor analysis itself teaches something.

All question types serve the same mechanism. Rotating through formats when re-testing the same concept is a design requirement, not a nice-to-have — this is what produces flexible, transferable knowledge.

### Hint ladder system

Rather than a binary "show answer" reveal, every question supports a three-tier hint ladder:

**Hint 1 — Conceptual nudge.** Points to the relevant mechanism or framework without giving away specifics. "Think about what happens to venous return in hypovolemia."

**Hint 2 — Directional hint.** More specific guidance toward the answer. "Preload depends on venous return. How does volume status affect venous return?"

**Hint 3 — Partial answer / scaffolding.** Leads the student to the answer without quite giving it. "Reduced volume → reduced venous return → reduced preload → reduced stroke volume. What happens next?"

After hint 3, the full answer with elaborative explanation is revealed.

Hints are pre-generated during content authoring for every question. The number of hints used is recorded as a metacognitive signal (students needing hint 3 repeatedly on a topic indicates weak mastery).

### Elaborative feedback

When answers are revealed, feedback is never just "correct" or "incorrect." Every reveal includes:

- The correct answer.
- An explanation of the mechanism involved.
- If the student was wrong, identification of what specifically went wrong (pattern-matched to misconception catalog where possible).
- Connection to related mechanisms or clinical implications.
- A pointer to deeper content if the student wants to explore further.

This is the feedback that produces learning. Hattie's meta-analysis shows elaborative feedback has ~3x the effect size of simple correctness feedback. No shortcuts here.

### Modes of operation

Students explicitly choose among three modes based on their current context:

**Learn mode.** Full six-step loop for new mechanisms or mechanisms the student hasn't seen in a long time. 15-25 minutes per mechanism. Used for first exposures, catch-up study, deep relearning.

**Review mode.** Default daily mode. SRS queue only. Abbreviated to retrieval + rating + (for wrong answers) brief mechanism reminder. 10-20 minutes regardless of card count. This is the habit the app is trying to build.

**Exam mode.** Last-minute revision, typically 1-3 days before an exam. High-velocity Layer 1 surfacing for pattern recognition, exam-pattern MCQ drills calibrated to target exam (NEET-PG, INI-CET, USMLE), no new material, no self-explanation prompts, no concept maps. Deliberately narrow focus.

The app switches between these modes based on student choice, not automatically. However, Exam mode becomes more prominent on the home screen within 2 weeks of a scheduled exam date (for affiliated students whose exam schedule is known).

### Adaptive difficulty — three axes

The app adapts across three independent dimensions:

**Level calibration (automatic, per mechanism).** Based on the student's first 2-3 attempts at a mechanism, the system determines whether to anchor them at Layer 1 (novice on this specific mechanism) or skip to Layer 2/3 cards (already comfortable). Calibration is continuous — ongoing performance shifts the level up or down. There is no explicit "beginner/intermediate/advanced" setting.

**Mode (explicit, student choice).** Learn / Review / Exam as described above.

**Scaffolding (optional, per screen).** "Explain it simpler" button on every explanation surfaces analogy-based versions. Inline glossary tooltip on medical terminology. Both invisible to students who don't use them, non-stigmatizing for students who do.

### The SRS scheduler

Version 1 uses SM-2 with two modifications:

- Ease factor floor of 1.5 (not SM-2's 1.3), preventing "ease hell" where cards never recover from repeated Hard ratings.
- Leech detection flags cards failed 5 consecutive times, offering the student (and their faculty, if affiliated) a prompt to review whether the card itself is poorly written or whether the student needs mechanism reteaching.

Version 2 plans for FSRS upgrade with potential domain-specific extensions: mechanism dependency awareness (if Frank-Starling is shaky, also surface cardiac output regulation), exam-proximity scheduling (within 2 weeks of declared exam, intervals compress and high-yield cards surface more), and pedagogical layer awareness (Layer 1 cards retained longer once stable, Layer 3 allowed to fade between exam periods).

Algorithm details in Technical Architecture section.

---

## 5. Content model and taxonomy

### The mechanism as the unit of content

Physiological mechanisms are the fundamental units of content, not topics or chapters. A mechanism is a discrete physiological process with defined inputs, outputs, regulatory controls, and integration points with other mechanisms. Examples: Frank-Starling, countercurrent multiplier, V/Q matching, baroreceptor reflex, tubuloglomerular feedback, alveolar gas equation.

Each mechanism has a unique ID, a canonical name, aliases (how else it might be referenced — abbreviations, regional names, alternative phrasings), a system it belongs to (cardiovascular, respiratory, etc.), and relationships to other mechanisms (dependencies, components, consequences).

The target content library spans approximately 200 mechanisms covering the full physiology curriculum.

### Four content layers per mechanism

Every mechanism has four independently-authored layers of increasing depth:

**Layer 1 — The 30-second core.** One sentence summarizing the mechanism, one diagram, one clinical hook. The minimum viable understanding. Example for Frank-Starling: "Increased ventricular filling stretches sarcomeres to their optimal length-tension position, increasing contractile force and stroke volume — until overstretch in heart failure inverts the relationship."

**Layer 2 — The working explanation.** 2-3 minutes of content. Key variables, one critical graph the student should be able to draw from memory, the main exam framings, the most important clinical correlates. The main study layer where most sessions happen.

**Layer 3 — The deep dive.** 8-10 minutes of content. Molecular basis, mathematical relationships, edge cases, integration with other systems, common misconceptions explicitly addressed. For motivated students and pre-exam consolidation.

**Layer 4 — Clinical integration.** Pathophysiology and clinical scenarios. "How does this mechanism break in heart failure? In sepsis? In hypovolemic shock? What exam patterns commonly test this?" This is the layer that makes physiology stick, because clinical context creates retrieval cues that exams will later supply.

Layers are progressive disclosure within a single mechanism page — students expand layers as they want depth. Layers are not separate pages; they are depth within the same mechanism.

SRS treats layers differently. Layer 1 cards get longer intervals once stable (they are foundational). Layer 3 cards are allowed to fade between exam periods. Layer 4 clinical vignettes compound best when repeated at spaced intervals.

### Tagging and cross-referencing

Every mechanism and every question carries multiple tags:

**NMC competency codes.** The National Medical Commission's Physiology competency framework codes (PY1.1 through PY11.x). A single mechanism often maps to multiple competencies; competencies often map to multiple mechanisms. The tagging allows navigation by competency for institutional tracking without forcing NMC's poorly-structured hierarchy on the content.

**Exam pattern tags.** NEET-PG pattern, INI-CET pattern, USMLE Step 1 pattern, AIIMS-pattern, state PG entrance patterns. Questions tagged by pattern can be filtered during exam mode practice.

**System tags.** Cardiovascular, respiratory, renal, endocrine, gastrointestinal, nervous, reproductive, hematology, general physiology.

**Bloom's taxonomy level.** Remember, Understand, Apply, Analyze, Evaluate, Create. Most MBBS physiology questions should target Apply and Analyze; the tagging ensures balanced coverage rather than accidentally clustering at Remember.

**Difficulty tier.** Foundational, intermediate, advanced. This is not user-facing (no "difficulty slider") but drives the adaptive calibration.

**Clinical specialty relevance.** Which downstream clinical specialties commonly reference this mechanism — cardiology, nephrology, critical care, etc. Useful for senior students.

### Questions attached to mechanisms

Each mechanism has 6-12 questions spanning the question types described in Section 4. Not all mechanisms need all question types; the mix is chosen during authoring based on what best tests the mechanism.

Each question carries:
- Question text
- Correct answer
- Three hint tiers (scaffolded)
- Elaborative explanation for the correct answer
- List of common wrong answers with misconception-specific feedback
- Tags (as above)
- Question type
- Bloom's level
- Estimated time to complete

Questions are versioned. Edits create new versions; old versions remain until students mid-learning finish reviewing them, then are retired.

### Content completeness standards

A mechanism is "complete" and ready to ship only when it has:
- All four content layers authored
- At least 6 questions across varied types and Bloom's levels
- Three-tier hint ladders for every question
- Correct answers with elaborative explanations
- At least 3 misconception mappings
- All relevant tags applied
- One clinical vignette (Layer 4)
- Faculty review signoff from two reviewers

Incomplete mechanisms do not ship. Students should never encounter half-built content.

### The misconception catalog

Physiology has a finite set of commonly-held wrong mental models. Examples:
- ADH drives sodium reabsorption (wrong — it drives water reabsorption)
- Hyperventilation causes respiratory acidosis (wrong — respiratory alkalosis)
- Arterial PO₂ equals alveolar PO₂ (wrong — there is an A-a gradient)
- Loop diuretics lower BP primarily through volume reduction (incomplete — also via venodilation and other mechanisms)
- Compliance and elastance are the same thing (wrong — reciprocals)

The initial misconception catalog targets ~100-150 entries spanning the major systems. Each entry identifies the wrong mental model, explains what causes it (why students naturally fall into it), and specifies the correct framework.

Questions can tag "this wrong answer indicates misconception #42," triggering targeted feedback when students select that wrong answer.

---

## 6. Roles and permissions

### Role hierarchy

Four user roles:

1. **Student** — the primary learner role. All learning features. Views own progress only.

2. **Faculty** — teaching staff at affiliated institutions. Student features plus class management, assignment creation, grading, content review, schedule management, topic heatmap access for their classes.

3. **Institutional admin** — administrative lead at an affiliated institution. Faculty features plus user management (within their institution), subscription management, institutional configuration.

4. **Platform admin** — the operator (founder and team). All-institution visibility. Content management across all mechanisms. Billing and subscription operations. Audit logs.

Roles are stored as a field on the user record. A single user has exactly one role. Role changes are audit-logged.

### Institutional affiliation

Orthogonal to role. Every user has either:
- An institution_id, indicating affiliation with a specific partner institution
- No institution_id, indicating independent status

Students, faculty, and institutional admins always have an institution_id. Platform admins have none (they operate at platform level). Independent users are always students (faculty and admin roles require institutional affiliation).

A user can change institution affiliation — students transfer between colleges, faculty consult at multiple institutions. This is handled by updating the institution_id with audit logging; learning history and account persist.

### Permission matrix

The following capabilities are scoped by role and affiliation:

**Read own data.** All users.

**Read another student's progress detail.** Faculty (within own classes, for assignments only), institutional admin (within own institution), platform admin (all). Never other students.

**Read class aggregate data.** Faculty (own classes), institutional admin (all classes in institution), platform admin (all).

**Create assignments.** Faculty (own classes), institutional admin (all classes in institution).

**Grade assignments.** Faculty (own assignments or other faculty's in own institution if granted override), institutional admin (as faculty, plus override ability), platform admin (none — avoided by design).

**Create content.** Faculty with content-author flag (draft status), institutional admin (can approve), platform admin (publish).

**Review content.** Faculty with content-reviewer flag, institutional admin, platform admin.

**Publish content.** Platform admin only for global content. Institutional admin for institution-specific content additions.

**Manage users within institution.** Institutional admin (add, remove, change roles within institution), platform admin.

**Manage subscriptions.** Platform admin (all). Institutional admin can request changes, not execute.

**Access billing data.** Platform admin only.

**Create institutions.** Platform admin only.

**Modify system configuration.** Platform admin only.

**View audit logs.** Platform admin (all). Institutional admin (own institution). Faculty (their own actions).

### Row Level Security

All permissions are enforced at the database layer via Supabase Row Level Security, not just in application code. Detailed RLS policies are specified in the data model section. The principle: even if application code has a bug, the database refuses unauthorized access.

RLS policies are tested with explicit test cases covering every role combination. A test suite verifies, for example, that a faculty member at Institution A cannot read student records at Institution B, even if they craft a custom query.

### Faculty flags

Faculty can carry optional flags that extend their base faculty permissions:

- **content-author** — can create draft content
- **content-reviewer** — can approve content created by others
- **department-head** — can modify other faculty's schedules and assignments within their department
- **examiner** — can create and manage exam events, assign exam coverage

These flags are set by institutional admins (or platform admins for platform-level content).

---

## 7. Subscription model

### Tier structure (v1)

**Free tier.** Available to independent students without payment. Includes: full access to Layer 1-2 content for cardiovascular and respiratory systems (the two systems taught first in most Indian MBBS curricula), core learning loop, SRS, basic progress tracking. Excludes: exam mode, Layer 3-4 content, other organ systems, faculty features.

The free tier is designed as a genuine product, not a nag-ware demo. A student should be able to use it for weeks and get real value, then upgrade because the depth is clearly more than they can get free.

**Individual tier.** Paid subscription for independent students. Full content across all systems, exam mode, all learning features, weekly metacognitive reports. No institutional features (no assignments, no schedule system — these are not applicable for independent users). Monthly and annual pricing.

**Institutional tier.** Sold to medical colleges as per-student annual license. Everything in Individual tier for every student at the institution, plus the full faculty layer (assignments, classes, grading, heatmap, schedule system, content annotations). Pricing negotiated per institution based on student count.

**Institutional premium (v2+).** Adds: custom content additions (institution-specific mechanisms or questions), priority support, institutional admin self-service tools, advanced analytics, integration capabilities.

### Access enforcement

Every content-serving endpoint and every feature check verifies the user's effective subscription tier. The effective tier is:
- The user's direct subscription, if they have one (independent paid users)
- Otherwise, their institution's subscription, if affiliated
- Otherwise, free tier

Access is checked at the database layer (via RLS rules) and reinforced in application code. Locked content appears in lists as locked (visible but not usable), creating a natural upsell surface.

### Billing approach

**First 100 paying users and first 5 institutions:** manual billing. Direct invoicing, UPI or bank transfer, manual subscription state updates in database. Unscalable but sufficient at low volume, and the manual process teaches the real patterns.

**Beyond that scale:** automated payments via Razorpay (primary — supports UPI, cards, net banking, wallets for Indian users) with Stripe as secondary option if international users become significant. Automated subscription management, renewal, expiry handling, grace periods.

**Refund policy:** 7-day money-back guarantee for individual subscriptions, no questions asked. Institutional contracts are annual with specific terms.

**Failed payment handling:** 3-day grace period after payment failure, then gentle email, then subscription moves to "payment_failed" status (content locks but account persists), then cancellation after 14 days. Never delete data based on payment status.

### GST and compliance

GST registration once annual turnover approaches ₹20 lakhs. Chartered accountant engaged before first institutional contract. Appropriate tax treatment on invoices. Business entity transitions from sole proprietorship to private limited company when needed.

---

## 8. Feature specifications — student experience

### Navigation structure

Four-tab bottom navigation (mobile-first):

- **Today** — daily dashboard, review queue, schedule-aware prioritization
- **Systems** — browse physiology content organized by organ system
- **Practice** — start a learning session (Learn / Review / Exam modes)
- **Progress** — personal analytics, retention, calibration, achievements

### Today tab

The Today dashboard is the student's default landing surface. Priorities:

**Primary call-to-action.** A single large button: "Start today's review" with current queue count. This is what the student should do today. All other content on this screen is subordinate.

**Schedule awareness (affiliated students).** If tomorrow has a scheduled class on specific mechanisms, a compact card: "Class tomorrow: Cardiac Cycle. Review these 4 cards tonight." If an exam is approaching (within 2 weeks), an exam preparation card surfaces.

**Weak area nudge.** One system or mechanism where the student's retention is currently weakest, with a one-tap option to do a quick drill.

**Streak and consistency indicator.** A small, non-dominant visual of review consistency (heatmap or bar chart). Not gamified — informational.

**Announcements.** For affiliated students, any institutional or faculty announcements (new assignment posted, upcoming exam schedule updated, etc.).

### Systems tab

Browse content organized by organ system. Each system shows:
- Completion indicator (how many mechanisms the student has encountered)
- Mastery indicator (rolled up from retention scores across mechanisms in the system)
- List of mechanisms within the system
- Access status (locked for tier-gated content)

Tapping a system shows its mechanism list. Tapping a mechanism opens the mechanism page.

### Mechanism page

The mechanism page is the canonical content destination. Layout (vertically scrollable):

- Mechanism name and one-line summary
- Mastery status for this mechanism (personal)
- Schedule context (if applicable): "Being taught Oct 15. In Mock Exam 1."
- Layer 1 content (always visible — the 30-second core)
- Expandable Layer 2 (tap to open)
- Expandable Layer 3 (tap to open)
- Expandable Layer 4 (tap to open)
- "Practice this mechanism" button (starts a learning session on this mechanism)
- Related mechanisms (links to dependent or adjacent mechanisms)
- Faculty annotations (for affiliated students — notes their institution's faculty have attached)

### Practice tab

The entry point for learning sessions. Offers three mode choices:

- **Learn new** — introduces a new mechanism or deeply relearns one. Full six-step loop.
- **Review** (default) — SRS queue for today. Retrieval + rating focused.
- **Exam mode** — rapid Layer 1 surfacing and exam-pattern MCQ drills.

Before a Learn session, the student picks a mechanism (from recommended list or by browsing). Before Exam mode, the student picks the target exam (NEET-PG, INI-CET, USMLE, Internal) and the duration (15min, 30min, 60min, etc.).

### Session UI

During a session, the UI is deliberately minimalist:

- Top bar: session progress (X of Y cards), session mode indicator, pause button
- Main area: current card (question, image, or instruction)
- Bottom area: action buttons appropriate to current step (e.g., "I've attempted it," "Show hint," rating buttons)

The UI does not show answers until the student explicitly requests reveal or attempts input. The UI does not allow forward navigation past the rating step.

Keyboard shortcuts on desktop for all interactions (accessibility and power users).

### Progress tab

Personal analytics destination. Shows:

**Retention curve.** Actual retention over time across all mechanisms studied, compared to optimal SRS retention. Shows whether the student is meeting their target retention rate.

**System mastery matrix.** Heatmap of systems × mechanism clusters, colored by the student's personal mastery level. Weak areas are visually apparent.

**Study pattern.** Review consistency over recent weeks. Days active, cards reviewed per day, time spent.

**Calibration report (weekly).** How well the student's self-ratings predict actual subsequent performance. Miscalibration patterns identified: "You're overconfident on acid-base, well-calibrated on cardiac output."

**Metacognitive insights.** Text-form observations generated from the data: patterns the student might not notice themselves ("Your Monday evening sessions have 20% higher wrong-answer rate than weekend sessions — consider lighter Monday loads").

### Settings

Personal settings accessible from profile menu:

- Notification preferences (which events, quiet hours, channels)
- Reduced motion toggle
- Text size adjustment
- High contrast mode
- Language selection (for v1, English only; i18n infrastructure present)
- Data export (download own data as JSON)
- Account deletion (with 30-day grace period)

---

## 9. Feature specifications — faculty experience

### Faculty navigation

When a user has the faculty role, the app offers a role switcher in the navigation (toggle between "Student view" and "Faculty view"). Most faculty will spend time in both.

Faculty view has its own bottom navigation:

- **My Classes** — class rosters and student overview
- **Assignments** — create, track, and grade assignments
- **Heatmap** — class-level mechanism mastery view
- **Schedule** — teaching and assessment calendar

### My Classes

Lists all classes (batches) the faculty member teaches. For each class:

- Student count and active student count (last 7 days)
- Average class mastery
- Review consistency indicator for the class
- Upcoming events (next class, next assignment due, next exam)

Tapping a class opens a roster view:

- Each student listed with: name, active status, recent engagement pattern, aggregate mastery indicator
- Traffic-light column flagging students who may need intervention (low engagement, declining mastery, missed assignments)
- Filterable and sortable (by mastery, engagement, alphabetical, last active)

Tapping a student opens their faculty-visible profile:

- Mastery across systems (read-only)
- Assignment history for assignments the faculty has given
- Recent engagement pattern
- No access to practice answers, rating history on non-assignment work, or private metacognitive reports

The principle: faculty sees what supports teaching. Not surveillance.

### Assignments

The assignment system lets faculty inject structured work into student SRS queues.

**Creating an assignment:**

- Pick target class(es)
- Pick target mechanisms (multi-select from content library, filterable by system, competency, or search)
- Optionally pick specific questions (otherwise all questions for chosen mechanisms are included)
- Set deadline
- Optionally add custom instructions or supplementary notes
- Optionally add custom questions (faculty-authored questions specific to this assignment)
- Publish

**What students see:**

- Assignment appears in Today dashboard with deadline
- Assigned cards are injected into student's SRS queue with priority scheduling
- Cards are marked as "assigned" distinguishing them from free-choice study
- Progress indicator shows completion against assignment requirement

**What faculty sees:**

- Completion status per student (not started / in progress / complete)
- Aggregate performance (average correct, hint usage, time)
- Individual responses on free-text and written answers (submissions view)
- Drill-down available for any student

### Submissions (grading)

For assignments with free-text or long-form components, a grading view:

- List of submissions awaiting review
- Each submission shows: student, question, their response, AI's first-pass grade and rationale, time submitted
- Faculty reviews, edits grade if needed, adds personal feedback
- One-click "approve as AI graded" for when AI is clearly correct
- Batch actions for quick grading of multiple similar submissions

AI first-pass grading handles the bulk of the volume. Faculty time becomes review-and-override, not grading from scratch. For 150 students × 10 essays, this reduces grading from ~15 hours to ~2 hours.

Grades roll up into the student's overall assignment completion record, visible to both student and faculty.

### Heatmap view

Class-level mastery visualization:

- Grid of systems × mechanism clusters
- Colored by class-average mastery
- Tap any cell to see which students are struggling with that cluster
- Filter by class, by time range, by assignment-only vs all practice

This view answers "what should I reteach?" — identifying collective class weaknesses before exams.

### Annotations

Faculty can attach notes to any mechanism visible to their students. Examples:

- "Dr. Menon emphasizes this — high-yield for viva"
- "Our internal exam will focus on the clinical correlations in this mechanism"
- "Watch the dissection video in the NMC shared folder before studying this"

Annotations are stored per-institution (not global) and appear on the mechanism page for students affiliated with that institution. They do not modify the core content.

### Faculty student-view

Faculty can always switch to student view and use the app as a student. This is important for:
- Understanding what their students experience
- Using the app for their own learning or teaching preparation
- Catching UX problems students might report

---

## 10. Feature specifications — admin experience

### Institutional admin navigation

Institutional admins have access to both faculty features (they can optionally teach classes) and admin features:

- **Dashboard** — institution-wide metrics
- **Users** — manage students and faculty
- **Classes** — manage class structure and assignments of faculty to classes
- **Subscription** — view subscription status and usage
- **Schedule** — institutional calendar
- **Settings** — institutional configuration

### Institution dashboard

High-level metrics:

- Total students, active students (7-day, 30-day)
- Total faculty
- Overall engagement trend
- Aggregate mastery across systems
- Subscription utilization (seats used vs. paid)
- Recent activity log

### User management

**Students:**
- Add individually (by email invitation)
- Bulk add via CSV upload
- Assign to batches/classes
- Deactivate (preserves data; reactivatable)
- Transfer between batches
- Export student list

**Faculty:**
- Add individually
- Set faculty flags (content-author, reviewer, department-head, examiner)
- Assign to classes
- Deactivate

**Role promotions:**
- Student to faculty (with verification)
- Faculty to institutional admin (platform admin approval required for this)

### Classes management

Classes represent cohorts of students taught together. Examples: "MBBS 2025 Batch A," "MBBS 2024 Batch B."

- Create classes with name, year, semester, student count limit
- Assign faculty to classes (multiple faculty per class possible)
- Assign students to classes (typically batch upload from institutional records)
- View class aggregate data

### Schedule management (institutional level)

Institutional admins set the top-level academic calendar:

- Academic year start and end dates
- Term structure (semester, trimester, block)
- Holidays and breaks
- Institution-wide exam periods
- Major events affecting all students

Faculty schedules are built within this framework.

### Subscription view

Subscription status visible to institutional admin:

- Current tier
- Seat count (paid) vs active users
- Renewal date
- Billing contact information
- Payment history
- Upgrade/downgrade request option (processed by platform admin)

### Institutional settings

- Branding: institution name, logo (appears on student dashboards), color accent
- Timezone
- Default language (for content presentation preferences)
- Module access: which systems/mechanisms are enabled for this institution's students
- Feature toggles: enable/disable specific features if the institution prefers

### Platform admin interface

Separate area accessible only to platform admins:

- **All Institutions:** list, search, filter. Detail view shows all institution data.
- **All Users:** search across entire platform. User detail with full history.
- **Content Management:** the full content admin interface (see Section 12).
- **Subscriptions:** create, modify, cancel subscriptions. Billing operations.
- **Audit Logs:** platform-wide log of significant actions.
- **System Health:** error rates, AI API usage, infrastructure status.
- **Announcements:** platform-wide communications to users.

---

## 11. Feature specifications — schedule system

### Event types

The unified event system supports:

- **Lecture** — scheduled teaching session, with mechanism tagging
- **Practical / Lab** — hands-on or demonstration session
- **Tutorial** — small-group teaching
- **Exam** — formal assessment, with mechanism coverage tagging
- **Assignment Deadline** — deadline for submission of app-created assignments (auto-generated from assignment records)
- **Guest Lecture / Special Event** — significant non-routine event
- **Holiday / Break** — non-teaching day
- **Student Event** — student-facing event (orientation, workshop, etc.)

### Event fields

Each event stores:

- ID, institution_id, class_id (nullable — null means institution-wide)
- Type (from list above)
- Title
- Description (optional)
- Start datetime, end datetime
- Location (optional text)
- Faculty_id (who is leading/teaching)
- Associated mechanism IDs (multi-valued, used for pedagogical integration)
- Visibility (students, faculty only, admin only — typically students)
- Status (scheduled, completed, cancelled, rescheduled)
- Source (manually created, imported from file, generated from assignment)
- Created_by, created_at, updated_at

### Schedule creation paths

**Manual creation.** Faculty or admin creates events one at a time through a calendar UI. Fine for single events.

**Bulk CSV/Excel import.** Upload a spreadsheet with columns (date, time, type, topic, faculty). System validates, shows preview, faculty reviews, publishes. Standard path for pre-planned term schedules.

**AI-assisted document import.** Upload PDF, Word document, image, or photo of a schedule. AI extracts structured events (see below). This is the primary path for institutions that already maintain schedules in existing formats.

**Copy from previous term/year.** Clone an existing term's schedule as a starting point, then adjust dates.

**ICS import.** Import from standard calendar files produced by other scheduling systems.

### AI-assisted schedule import

The flagship feature for reducing adoption friction. Full workflow:

1. Faculty uploads file (PDF, DOCX, XLSX, PNG, JPG, or multi-image upload).
2. System routes by file type: structured files (XLSX, DOCX, CSV) are parsed locally. PDFs are text-extracted where possible, otherwise treated as images. Images are sent to Claude vision API.
3. Claude receives extracted content plus structured prompt (see Appendix A), plus the institution's mechanism list (for mechanism matching).
4. Claude returns structured JSON of extracted events with confidence flags on uncertain extractions.
5. System presents review UI: extracted events in editable list alongside source document preview. Uncertain extractions flagged visually.
6. Faculty reviews, corrects as needed (inline editing, batch operations for systematic errors).
7. Faculty publishes. Events go into institutional schedule. Mechanism associations enable downstream pedagogical integration.

Expected accuracy: 85-99% depending on source quality. Review is required, not optional.

Token costs per import: 2-40 cents depending on source type and length. Not a scaling concern.

Reusable for: student roster imports, syllabus imports, past paper imports, lecture notes imports. Same pattern (upload → AI extract → review → publish) applies to each.

### Student-facing schedule integration

**Today dashboard awareness.** When an event is tagged with mechanisms, the student's Today dashboard surfaces the event and recommends pre-study. "Class tomorrow: Frank-Starling. Review these 3 cards tonight."

**SRS prioritization.** The SRS scheduler uses upcoming lecture events to slightly advance cards for mechanisms about to be taught, ensuring students encounter them before class.

**Exam mode triggering.** Two weeks before a scheduled exam event, exam preparation becomes prominent on Today. Cards tagged with the exam's covered mechanisms surface more frequently. The student doesn't need to manually switch to exam mode; the context triggers it.

**Post-exam reflection.** After an exam event completes, students receive a short optional reflection: "How did it go? Any topics you wished you'd reviewed more?" Responses adjust future pacing.

**Calendar tab.** A dedicated calendar view (not primary navigation) for students who want to see the full schedule.

**Notifications.** Configurable: evening-before class reminders, exam-date reminders, assignment-due reminders.

### Study schedule generation

A "study schedule" is distinct from a "teaching schedule." The teaching schedule is fixed; the study schedule is a personalized recommendation of what the student should study when.

**Approach:** Auto-generated from the teaching schedule and the student's current SRS state.

**Logic:** "Your professor is teaching Frank-Starling on Oct 15. Based on the mechanism's complexity, your current mastery level on dependent mechanisms, and your typical study pace, we recommend starting Frank-Starling Oct 13, covering Layers 1-2 before class, then Layer 3 after the lecture."

**Presentation:** Suggestions, not mandates. Shown on the mechanism page and as ambient context on Today. Student can follow or ignore.

**Faculty override:** Faculty can pin specific study recommendations if they want to emphasize particular pacing for their class.

### Schedule changes and updates

Schedules change. The system handles this:

- Editing an event preserves history (old version archived)
- Cancelling an event marks it as cancelled but retains for historical reference
- Rescheduling creates a link between old and new event
- Students receive notifications when relevant events change (class moved, exam rescheduled)

---

## 12. Feature specifications — content authoring and management

### Content as database, not code

All content lives in database tables, versioned, with status flags. No content is ever hardcoded in the application. This is foundational — it enables updates without deployments, versioning, faculty self-service, and audit.

### Content admin interface

The content admin is built as part of the main app, accessible only to users with appropriate roles (platform admin, institutional admin with content rights, faculty with content-author or content-reviewer flags).

**Content browser.** List view of all mechanisms with filters (system, status, competency, completeness, last-modified). Shows completion state: which mechanisms have all four layers, question count, review status. Faculty can spot gaps easily.

**Mechanism editor.** Opens a single mechanism. Four tabs for the four layers, each with a rich text editor (Markdown-based, with diagram upload support). Tags managed separately. Draft/published status with explicit publish action.

**Question editor.** Opens a single question. Fields: question text, answer, explanation, three hints, misconception mappings, tags. "Preview as student" button renders exactly as students would see including the hint ladder reveal sequence.

**Misconception editor.** Browse and edit the misconception catalog. Each misconception: name, description, why students fall into it, correct framework, linked questions.

**Review queue.** Items awaiting review (draft content, draft questions, AI-generated drafts). Reviewer approves, requests changes, or rejects. Changes move to next reviewer (two-reviewer signoff required for publication).

**Bulk operations.** Tag multiple mechanisms at once. Retire questions matching criteria. Import AI-generated drafts in batches. Content export for backup.

**Version history.** Every content item shows its edit history with timestamps and authors. Rollback to previous versions supported.

### AI-assisted content authoring workflow

The canonical workflow for authoring new content:

1. Faculty chooses a mechanism to author.
2. Faculty (or AI-assisted) creates Layer 1 content: one sentence, one diagram, one clinical hook.
3. AI generates draft Layer 2 content based on Layer 1, faculty-provided outline, and canonical reference materials. Faculty reviews, edits.
4. Same for Layer 3 (deeper treatment) and Layer 4 (clinical integration).
5. AI generates 10-15 candidate questions at specified Bloom's levels and question types. Faculty picks 6-8 best, edits for accuracy and pedagogical quality.
6. For each question, AI generates hint ladder (3 tiers) and elaborative explanation. Faculty reviews.
7. For each question, faculty identifies likely wrong answers (from teaching experience) and AI suggests misconception mappings. Faculty confirms or edits.
8. Faculty applies tags (NMC competencies, exam patterns, Bloom's level, difficulty).
9. First reviewer (author) marks complete.
10. Second reviewer (another faculty member) reviews, approves.
11. Platform admin publishes.

**Time estimate:** 45-90 minutes per mechanism with AI assistance and faculty review.

**AI prompts:** See Appendix A for specific prompt templates.

### Content updates after launch

**Minor edits (typos, clarity).** Single reviewer required. Published as a patch version increment. Students mid-learning see updated version on next interaction.

**Substantive edits (changing correctness, changing mechanism description).** Full two-reviewer process. Published as minor version increment. Students with the old version in active SRS see a "this question has been updated" notice explaining the correction. This builds trust through visible correction rather than silent updates.

**Adding new questions to existing mechanisms.** Same as creating new content. Added questions appear in SRS rotation for students who have encountered that mechanism.

**Retiring content.** Status changes to "retired." No new students encounter it. Students with the content in active SRS finish reviewing for up to 30 days, then it's dropped from their queue. Progress data preserved for historical analysis.

**Adding new mechanisms.** Full authoring workflow. Students doing system-level review encounter it naturally.

**Bulk corrections.** For systemic errors (e.g., "30 renal questions reference the wrong tubule segment"), batch edit interface filters affected questions, applies edits in batch with single review step.

### AI-assisted content maintenance

Periodic audits using AI:

- **Internal consistency audit.** AI reviews the question bank for contradictions, overlapping coverage, gaps, and style inconsistency. Quarterly.
- **Student-performance-driven audit.** Questions with unusual performance patterns (too easy, too hard, high-mastery students getting wrong) are flagged for review.
- **Curriculum alignment audit.** When NMC competencies change or exam patterns shift, AI identifies affected content for update.
- **Hint ladder effectiveness audit.** For questions with poor hint-to-correct conversion, AI suggests alternative hints.

### Student-driven quality control

Students can flag questions:
- "This seems wrong"
- "I don't understand the explanation"
- "The hint didn't help me"
- "I think there's a typo"

One-tap flagging from the session UI. Flags aggregate into a faculty review queue. Students see no visible acknowledgment (to prevent gaming), but high-flag-rate questions automatically prioritize in review queue.

---

## 13. Technical architecture

### High-level architecture

Client-side: Progressive Web App built with Next.js 14+, React, TypeScript. Service worker for offline capability. IndexedDB for local data.

Server-side: Next.js API routes running on Vercel. No separate backend service. Serverless functions handle requests.

Database: Supabase (managed Postgres with built-in authentication, storage, and real-time capabilities).

AI: Direct API calls to Anthropic's Claude API via the official SDK.

Deployment: Vercel for frontend/API, Supabase as managed service, GitHub for code and CI/CD.

### Frontend stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript in strict mode
- **UI library:** React 18+
- **Styling:** Tailwind CSS
- **Component library:** shadcn/ui (accessible by default, copy-paste components not npm-installed dependencies, fully customizable)
- **State management:** Zustand for client state, TanStack Query for server state
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Charts:** Recharts for data visualization
- **Rich text:** TipTap for content authoring
- **Offline storage:** IndexedDB via Dexie
- **PWA:** next-pwa plugin for service worker and manifest management
- **Internationalization:** next-intl (set up from day one, English only v1)

### Backend stack

- **Runtime:** Node.js 20+ on Vercel Edge/Serverless functions
- **API layer:** Next.js API routes (RESTful design)
- **Authentication:** Supabase Auth (handles password, OAuth, OTP)
- **Database client:** Supabase JS client with TypeScript types generated from schema
- **AI SDK:** @anthropic-ai/sdk
- **File processing:** SheetJS (Excel), mammoth.js (Word), pdf-parse (PDF text), Claude vision API (images)
- **Email:** Resend (transactional emails)
- **Payments:** Razorpay (primary), Stripe (secondary if needed)

### Database stack

- **Database:** Supabase Postgres (managed, backed up, scalable)
- **Schema management:** Supabase migrations, version controlled
- **Security:** Row Level Security policies on every table
- **Storage:** Supabase Storage for files (diagrams, uploaded documents, audio narration)
- **Real-time:** Supabase Realtime for live-update features (assignment status, etc.)

### Development tooling

- **Version control:** Git with GitHub
- **Package management:** pnpm (faster than npm, stricter than yarn)
- **Linting:** ESLint with strict config
- **Formatting:** Prettier
- **Testing:**
  - Vitest for unit tests
  - Playwright for end-to-end tests
  - React Testing Library for component tests
- **Type checking:** TypeScript strict mode enforced in CI
- **Pre-commit hooks:** Husky + lint-staged
- **CI/CD:** GitHub Actions for tests and build checks, Vercel for deployment
- **Error monitoring:** Sentry
- **Product analytics:** PostHog

### Code organization

```
/app                    # Next.js App Router pages
  /(auth)              # Authentication flows
  /(student)           # Student-facing pages
  /(faculty)           # Faculty-facing pages
  /(admin)             # Admin pages
  /api                 # API routes
/components            # Reusable React components
  /ui                  # shadcn/ui components
  /session             # Learning session components
  /content             # Content display components
  /schedule            # Calendar/schedule components
/lib                   # Shared utilities
  /srs                 # SRS scheduler (pure logic)
  /ai                  # Claude API integration
  /db                  # Database helpers
  /auth                # Auth helpers
  /validation          # Zod schemas
/types                 # TypeScript type definitions
/tests                 # Test files mirroring source structure
/content-tools         # Content authoring utilities (not shipped with app)
/prisma or /supabase   # Database schema and migrations
/public                # Static assets
/docs                  # Project documentation
```

### Key design patterns

**Server components by default, client components when needed.** Next.js App Router encourages server components. Interactive components (session UI, forms) are explicitly client components. This minimizes JavaScript bundle size.

**API routes as thin wrappers.** API routes validate input, invoke business logic from /lib, return responses. Business logic is testable in isolation.

**Schema-driven types.** Database schema generates TypeScript types. API schemas (Zod) generate TypeScript types. Types flow from schema to code, not defined separately.

**Pure functions for algorithms.** The SRS scheduler, content versioning, and similar logic are pure functions with no database dependencies, fully unit-tested against reference implementations.

**Feature flags for gated features.** A feature flag system (simple database table or external service) allows enabling/disabling features per user, per institution, per environment without code deployments.

---

## 14. Data model

### Core tables

**users**
- id (uuid, primary key)
- email (unique)
- phone (optional, unique)
- auth_id (links to Supabase auth)
- role (enum: student, faculty, institutional_admin, platform_admin)
- institution_id (nullable uuid, foreign key)
- subscription_id (nullable uuid, foreign key) — only set for independent users
- faculty_flags (jsonb array: content_author, content_reviewer, department_head, examiner)
- first_name, last_name
- display_name
- avatar_url
- preferences (jsonb: notification settings, display settings, etc.)
- created_at, updated_at, last_active_at
- deleted_at (soft delete)

**institutions**
- id (uuid, primary key)
- name
- slug (url-friendly unique identifier)
- logo_url
- subscription_id (foreign key)
- billing_contact (jsonb)
- timezone
- branding_config (jsonb)
- settings (jsonb: feature flags, module access)
- created_at, updated_at
- deleted_at

**subscriptions**
- id (uuid, primary key)
- tier (enum: free, individual, institutional, institutional_premium)
- status (enum: active, trialing, past_due, cancelled, expired)
- start_date, end_date
- payment_provider (enum: manual, razorpay, stripe, null for free)
- provider_subscription_id (nullable, provider's ID)
- seats_paid (for institutional)
- metadata (jsonb)
- created_at, updated_at

**classes** (batches)
- id (uuid, primary key)
- institution_id (foreign key)
- name
- academic_year
- description
- created_at, updated_at
- deleted_at

**class_enrollments**
- id, class_id, user_id (the student), enrolled_at, active

**class_faculty**
- id, class_id, user_id (the faculty), role_in_class, assigned_at

### Content tables

**mechanisms**
- id (uuid, primary key)
- canonical_name
- slug (url-friendly unique)
- aliases (text array)
- system (enum: cardiovascular, respiratory, renal, endocrine, gi, nervous, reproductive, hematology, general)
- summary (Layer 0: one-line)
- layer_1_content (markdown)
- layer_2_content (markdown)
- layer_3_content (markdown)
- layer_4_content (markdown)
- primary_diagram_url
- tags (jsonb: competencies, exam_patterns, bloom_levels, specialties)
- difficulty_tier (enum: foundational, intermediate, advanced)
- tier_required (enum: free, individual, institutional)
- status (enum: draft, review, published, retired)
- version (semantic version string)
- created_by, reviewed_by_1, reviewed_by_2
- created_at, updated_at, published_at
- deleted_at

**mechanism_relationships**
- id, parent_mechanism_id, child_mechanism_id, relationship_type (depends_on, component_of, leads_to, compensates_for)

**questions**
- id (uuid)
- mechanism_id (foreign key)
- question_type (enum: free_recall, prediction, reverse_reasoning, mechanism_chain, diagram_labeling, variable_effect, clinical_application, misconception_targeted, multiple_choice)
- question_text (markdown)
- question_diagram_url (nullable)
- correct_answer
- answer_explanation (markdown)
- hint_1, hint_2, hint_3
- distractors (jsonb array for MCQ)
- misconception_mappings (jsonb: maps wrong answers to misconception_ids)
- bloom_level (enum)
- estimated_time_seconds
- tags (jsonb: same structure as mechanism)
- status (enum: draft, review, published, retired)
- version
- created_by, reviewed_by_1, reviewed_by_2
- created_at, updated_at, published_at

**misconceptions**
- id (uuid)
- name
- description
- why_students_fall_into_it
- correct_framework
- system (enum, nullable)
- tags (jsonb)
- status (enum)
- created_at, updated_at

**content_versions** (historical versions of content)
- id, content_type (mechanisms, questions, misconceptions), content_id, version, content (jsonb snapshot), change_type, changed_by, changed_at, change_reason

### Student progress tables

**student_mechanism_progress**
- id, user_id, mechanism_id
- mastery_score (0-1, computed from retention)
- level (current layer the student is engaging with)
- cards_seen, cards_correct
- last_reviewed_at
- created_at, updated_at

**student_card_state** (the SRS state per card per student)
- id, user_id, question_id
- ease_factor (SM-2 field)
- interval_days (SM-2 field)
- repetitions (SM-2 field)
- next_review_at
- last_reviewed_at
- leech_count (consecutive failures)
- status (enum: new, learning, review, leeched, suspended)

**student_review_history** (every review attempt)
- id, user_id, question_id
- rating (again, hard, good, easy)
- confidence (derived from rating)
- response_time_seconds
- hints_used (0-3)
- was_correct (boolean)
- self_explanation_text (nullable)
- self_explanation_score (nullable, AI-graded)
- reviewed_at

### Assignment tables

**assignments**
- id, institution_id, class_id, faculty_id
- title, description, instructions
- mechanism_ids (array)
- question_ids (array, optional — if unset, all questions for mechanisms)
- deadline
- custom_questions (jsonb, optional)
- status (enum: draft, published, closed)
- created_at, published_at, closed_at

**assignment_progress**
- id, assignment_id, user_id
- started_at, completed_at
- cards_total, cards_complete
- score_percent
- submissions (jsonb: per-card performance)

### Schedule tables

**events**
- id, institution_id, class_id (nullable)
- type (enum: lecture, practical, tutorial, exam, assignment_deadline, event, holiday)
- title, description
- start_at, end_at
- location
- faculty_id (nullable)
- mechanism_ids (array)
- visibility (enum)
- status (enum: scheduled, completed, cancelled, rescheduled)
- source (enum: manual, bulk_import, ai_extract, generated)
- created_by, created_at, updated_at

### Audit tables

**audit_log**
- id, user_id, action, entity_type, entity_id, changes (jsonb), ip_address, user_agent, created_at

**ai_usage_log**
- id, user_id, operation (grading, hint_generation, schedule_extract, etc.), model_used, input_tokens, output_tokens, cost_usd, created_at

### Row Level Security policies (key examples)

```sql
-- Students can only read their own progress
CREATE POLICY "Students read own progress"
  ON student_card_state FOR SELECT
  USING (auth.uid() = user_id);

-- Faculty can read progress of students in their classes for assignment context only
CREATE POLICY "Faculty read student progress via assignments"
  ON student_card_state FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM class_faculty cf
      JOIN class_enrollments ce ON ce.class_id = cf.class_id
      WHERE ce.user_id = student_card_state.user_id
    )
  );

-- Institution isolation on events
CREATE POLICY "Users read own institution events"
  ON events FOR SELECT
  USING (
    institution_id = (SELECT institution_id FROM users WHERE id = auth.uid())
  );
```

Full RLS policy suite specified in technical build spec. Every table has policies. Policies are tested in automated test suite.

---

## 15. AI integration

### Provider choice

Anthropic Claude via official SDK. One provider, one integration. Rationale: strongest instruction-following for structured generation tasks, strong medical knowledge, good vision capabilities for schedule import, predictable pricing, mature SDK.

### Models by task

- **Content authoring (offline, highest-stakes):** Claude Sonnet (latest version). Quality-sensitive.
- **Runtime free-text grading:** Claude Sonnet. Quality-sensitive and student-facing.
- **Schedule extraction from documents:** Claude Sonnet with vision. Accuracy matters.
- **Classification tasks (misconception matching):** Claude Haiku. Cost-optimized.
- **Future Socratic dialogue:** Claude Sonnet.

### Runtime AI usage

Deliberately minimal. The only runtime AI calls in v1:

1. **Self-explanation grading.** When a student submits a free-text explanation, Claude grades for mechanism presence (not exact wording). Returns: score (0-3), feedback message, flags for patterns observed. Queued for async processing if offline.

2. **Schedule import extraction.** When faculty uploads a document, Claude extracts structured event data. Async by nature (not blocking user action).

3. **Occasional adaptive remediation.** When a student has failed a mechanism 3+ times with different wrong answers, a custom explanation is generated. Rare edge case.

Everything else — hints, explanations, question variations, misconception matching — is pre-generated during authoring and served from the database.

### Pre-generation strategy

During content authoring:

- All question variations generated by AI from mechanism definition
- All three-tier hint ladders generated per question
- All elaborative explanations generated
- Misconception mappings generated (faculty-reviewed)
- Clinical vignettes generated
- Simulator narratives generated (where applicable)

Authoring costs: $200-800 total for full curriculum generation (one-time).

### Cost projections

**Per student per day (runtime):**
- Grading: 1 call × ~$0.02 = $0.02
- Other: effectively zero in typical usage

**Monthly costs:**
- 100 students: ~$60-100 (includes margin for content authoring and overhead)
- 1,000 students: ~$150-300
- 5,000 students: ~$500-1,200

These are dramatic reductions from runtime-heavy alternatives. The pre-generation approach is the cost optimization.

### Prompt engineering principles

**Deterministic outputs:** Structured JSON responses where possible. Temperature 0.0 for classification and grading tasks. Higher temperature only for generation tasks during authoring.

**Guardrails in prompts:** Explicit instructions to refuse to answer if outside physiology scope, to flag uncertainty, to format outputs in specified schemas.

**Context passing:** For tasks that need context (which mechanism, which student's history), include as structured system prompt fields rather than inline prose.

**Few-shot examples:** For complex or nuanced tasks (misconception classification, mechanism matching), provide 2-3 example inputs and outputs in the system prompt.

### Prompt templates

See Appendix A for full prompt templates. Key ones:

- Self-explanation grading
- Question generation (for authoring)
- Hint ladder generation (for authoring)
- Schedule extraction from text
- Schedule extraction from images
- Misconception classification
- Content audit (internal consistency check)

All prompts are versioned. Changes to prompts are tested against regression test cases before deployment.

### Rate limiting and abuse prevention

- Per-user rate limit: 50 AI calls per day (sufficient for normal use, catches abuse)
- Institution-wide rate limit: proportional to student count
- Global platform rate limit: catches runaway bugs
- Billing alert at daily spend thresholds

### Fallback behavior

- If Claude API is down: runtime AI features degrade gracefully. Self-explanations queue for later grading. Schedule imports defer until service returns. No user-visible hard errors.
- If a specific call fails: single retry with exponential backoff. If retry fails, log and return fallback response.

---

## 16. Offline architecture

### What works offline

Everything a student does in a typical daily session:
- All content viewing (mechanisms, layers, diagrams)
- SRS queue retrieval and review
- Rating cards
- Taking practice sessions
- Viewing progress and analytics
- Viewing schedule
- Viewing assignments (read-only)
- Completing questions with hints (hints are pre-generated and stored locally)

### What requires connectivity

Only:
- Initial login / authentication
- Self-explanation grading (can be queued for later)
- Submitting completed assignments
- Schedule import (admin task, not daily use)
- Faculty content creation
- Subscription management
- Push notifications (but queued notifications still fire locally)

### Storage sizes

- App shell (JS, CSS, images): 2-8 MB
- Content text (200 mechanisms × 4 layers): 3-4 MB
- Questions (~2000 questions with metadata): 3 MB
- Core diagrams (SVG): 25-50 MB
- Total baseline offline package: **50-80 MB**

- Optional video/audio per system (narrated animations): 200-400 MB per organ system pack
- Full video content for all systems: 1-2 GB
- User-pulled, not auto-downloaded

### Sync strategy

**On app load with connectivity:**
- Check for content updates since last sync
- Pull new/updated mechanisms and questions in background
- Push any queued self-explanations for grading
- Push any pending progress updates

**Conflict resolution:**
- Content updates: server wins (authoritative source)
- Progress updates: client wins (student did the work; preserve local history)
- Dual-write conflicts on progress: union of both (all reviews recorded, duplicates deduplicated by timestamp)

### Offline-first data flow

Student actions write to IndexedDB immediately and mark for sync. A sync worker periodically pushes to server when online. User experience is instant — no waiting for network.

This requires careful database design on the client: local IDs vs server IDs, optimistic writes, eventual consistency. Dexie handles much of this; custom logic layers on top for domain-specific conflict resolution.

### Service worker strategy

- App shell cached on first load, served cache-first with background update
- Content cached stale-while-revalidate (show cached, fetch updates in background)
- API calls: network-first with cache fallback for GET, queue for POST when offline
- Assets (images, fonts): cache-first with periodic refresh

next-pwa plugin handles standard cases. Custom service worker logic for domain-specific needs (content sync, progress sync, queued writes).

### Install prompt

Students prompted to install the PWA to home screen after 3 successful sessions. One-time prompt, respectful, not repeated. Install increases retention significantly.

---

## 17. Security, privacy, and compliance

### Authentication security

- Passwords hashed via bcrypt (Supabase default)
- Minimum password length 12 characters, strength requirements
- Rate limiting on login attempts (5 per 15 minutes)
- Session tokens with appropriate expiry
- Refresh tokens rotated on use
- Logout invalidates all sessions

### Authorization security

- Every API endpoint verifies user authentication and authorization
- RLS policies enforce data access at database layer
- No direct database access from client — all through authenticated API
- Principle of least privilege: API keys, service accounts have minimum necessary permissions

### Data protection

- HTTPS enforced (TLS 1.3 minimum)
- Database encryption at rest (Supabase-managed)
- Sensitive fields (phone numbers, billing details) encrypted at application layer where appropriate
- PII in logs redacted or hashed
- Backups encrypted

### DPDPA compliance (India)

India's Digital Personal Data Protection Act requirements:

- **Explicit consent:** On signup, users consent to data collection with clear description of what's collected and why. Consent is logged with timestamp.
- **Purpose limitation:** Data is used only for purposes disclosed at consent.
- **Data minimization:** Collect only what's needed.
- **Data subject rights:** Users can access, export, correct, and delete their data.
- **Breach notification:** Procedures in place for notifying Data Protection Board and affected users in case of breach.
- **Grievance officer:** Designated person for handling privacy complaints, contact information published.
- **Data retention:** Active accounts retained indefinitely. Deleted accounts: 30-day grace period then actual deletion. Inactive accounts: retained but periodically prompted to confirm activity.

### Student data protection

Student learning records are educational data with sensitivity implications:

- Students can download their complete data as JSON export
- Students can request deletion of their account with 30-day grace period
- Aggregated, anonymized analytics may be used for platform improvement
- Individual student data never shared outside their institution (and only within institution per RLS)
- Institutions cannot export individual student data without proper authorization

### Legal entities and contracts

- Business entity: sole proprietorship initially → private limited company when needed
- Privacy policy and terms of service drafted by qualified Indian tech lawyer
- Institutional contracts template covering data processing, SLAs, termination
- Data Processing Agreements (DPA) with service providers (Anthropic, Supabase, Vercel)

### Vulnerability management

- Dependencies kept current (Dependabot or Renovate for automated updates)
- Security patches applied promptly
- Regular dependency audit for known vulnerabilities
- Penetration testing before first major institutional deployment
- Bug bounty program once at scale

### Incident response

- Defined procedure for handling security incidents
- Incident log maintained
- Post-incident review for each incident
- User communication plan for breaches affecting them

---

## 18. Accessibility

### Standard

WCAG 2.2 Level AA as the compliance target. This is the standard institutional procurement increasingly requires, and it reflects genuine commitment to usability for students with disabilities.

### Specific requirements

**Keyboard navigation:** Every interactive element reachable and operable via keyboard. Tab order follows visual flow. Focus indicators visible.

**Screen reader support:** All interactive elements have accessible labels. All images have meaningful alt text (not just "image"). Page structure uses semantic HTML. Dynamic content updates announced via ARIA live regions.

**Color contrast:** Body text 4.5:1 contrast ratio minimum. Large text 3:1 minimum. UI component contrast 3:1 minimum. Both light and dark themes meet contrast requirements.

**Color independence:** Information never conveyed by color alone. Status indicators use icons plus color. Charts have text labels, not just color coding.

**Text scaling:** Interface usable at 200% text size without horizontal scrolling or content loss.

**Reduced motion:** Respect prefers-reduced-motion. Animations disabled or replaced with static alternatives when set.

**Forms:** All inputs have associated labels. Error messages associated with fields. Required fields clearly marked.

**Video and audio:** Captions for all video content. Transcripts for audio narration. Audio descriptions for visual-only educational content.

**Focus management:** Focus moved to appropriate element when content changes (modals open, pages load).

**Cognitive accessibility:** Plain language where possible. Complex medical terminology linked to glossary. Consistent navigation patterns. Predictable interface behavior.

### Testing

- Automated testing via axe-core integrated in development and CI
- Manual testing with screen readers (NVDA on Windows, VoiceOver on iOS/macOS) before releases
- Real user testing with students with disabilities (planned for beta phase)
- Accessibility audit by qualified professional before institutional deployments

### Accessibility statement

Published accessibility statement on the platform describing:
- Conformance level claimed
- Known limitations and their workarounds
- Contact point for accessibility feedback
- Date of last accessibility review

---

## 19. Testing strategy

### Test pyramid

**Unit tests (majority):** Pure logic tested in isolation. Fast feedback. Vitest.
- SRS scheduler: 100% coverage against reference implementation
- Content versioning: 100% coverage
- Validation logic: 100% coverage
- Utility functions: high coverage

**Integration tests (moderate):** API endpoints tested with test database.
- Every API endpoint: auth check, input validation, happy path, error paths
- RLS policy verification: explicit tests for every role combination
- Content operations: create/edit/version/retire flows

**End-to-end tests (minimum viable):** Critical user journeys, Playwright.
- Student signup → first session → second session
- Student complete learning loop
- Faculty assignment creation → student completion → faculty grading
- Institutional admin user management
- Schedule import from Excel

### Test data

- Seed data for development and testing environments
- Faker-generated test users
- Reference test content (10 mechanisms fully specified for testing)
- Snapshot test expectations for key responses

### Continuous integration

- GitHub Actions runs on every pull request
- Required checks: type check, lint, unit tests, integration tests
- E2E tests run nightly and on release candidates
- Coverage reporting (aim for 80%+ on business logic, not chasing 100% on everything)

### Performance testing

- Load testing before institutional deployment (simulate 500 concurrent users)
- Lighthouse scores tracked, performance budget enforced
- Core Web Vitals monitored in production

### Acceptance testing

- Faculty reviewers try new features before release
- Beta group of students tests new features
- Staged rollout for significant changes (5% → 25% → 100%)

---

## 20. Deployment, monitoring, and operations

### Environments

- **Development:** Local development with Supabase local or dev project
- **Preview:** Automatic preview deploys per pull request (Vercel)
- **Staging:** Mirror of production for final testing
- **Production:** Live environment

Each environment has isolated database and separate API keys.

### Deployment process

- Main branch auto-deploys to production
- Pull requests get preview deploys automatically
- Rollback available (Vercel instant rollback to previous deployment)
- Database migrations applied via Supabase CLI, version-controlled
- Breaking schema changes require careful migration planning with zero-downtime approach

### Monitoring

**Error monitoring:** Sentry captures frontend and backend errors with source maps, user context (anonymized), and stack traces. Alerts on error rate spikes.

**Performance monitoring:** Vercel Analytics for Web Vitals. Database query performance tracked via Supabase logs.

**Business metrics:** PostHog tracks feature usage, user flows, retention, conversion. Privacy-respecting: no PII in events.

**AI usage monitoring:** Internal dashboard shows AI API usage, cost, failure rate per operation. Alerts on anomalies.

**Uptime monitoring:** External service (Uptime Kuma self-hosted, or Better Uptime) pings critical endpoints.

### Logging

- Structured JSON logs from all server-side code
- Log levels: debug, info, warn, error
- Centralized log collection (Vercel log drains or similar)
- PII redacted from logs
- Log retention: 30 days hot, 1 year cold

### Backup and recovery

- Database: Supabase automatic daily backups (included in paid tier)
- Weekly manual content export to separate storage
- Restore procedures documented and tested quarterly
- Disaster recovery plan: RTO 4 hours, RPO 24 hours for v1

### Support

- Single support email initially
- In-app feedback form
- 24-hour response SLA for institutional users, 48 hours for independent
- Knowledge base articles for common issues
- Escalation paths for critical issues (payment, data access, security)

### Capacity planning

- Free tier headroom tracked
- Upgrade paths identified for each service as usage grows
- Budget alerts at 80% of projected spend
- Cost per user tracked as key efficiency metric

---

## 21. Build phasing and release plan

### Version 1.0 — Student MVP

**Timeline:** 3-4 months of focused work.

**Scope:**
- Authentication (email/password, Google Sign-In, phone OTP)
- Student role only (no faculty, no admin except platform admin for content management)
- 30-50 mechanisms covering cardiovascular and respiratory systems, fully authored with all four layers
- Core learning loop: Learn mode, Review mode (no Exam mode yet)
- SM-2 scheduler with modifications
- Forced rating system
- Three-tier hint ladders
- Elaborative feedback
- Self-explanation with AI grading
- Misconception-targeted feedback
- Free and Individual subscription tiers (manual billing)
- Offline capability for core features
- PWA installation
- Basic progress tab
- Basic notification system
- Accessibility baseline
- Data export and deletion

**What's explicitly excluded from v1:**
- Faculty role and features
- Institutional admin role
- Schedule system
- Assignments
- Exam mode
- Concept maps (Connect step — simplified in v1)
- Variable-manipulation simulators
- Video/audio content (text and static diagrams only)
- FSRS (using SM-2)
- Automated billing
- Content admin interface (content managed via direct database access by platform admin)
- Weekly metacognitive reports (basic progress only)

**Success criteria:**
- Working app deployable to first 50 beta users
- Full learning loop functional and bug-free for supported content
- Offline use works reliably
- Sub-3-second load times
- Accessibility baseline passing automated tests

### Version 1.5 — Faculty Foundation

**Timeline:** 2-3 months after v1.

**Scope:**
- Faculty role with core features
- Institution concept, institutional affiliation
- Institutional admin role (basic)
- Institutional subscription tier
- My Classes view for faculty
- Assignment creation and tracking
- AI grading for submissions with faculty review
- Topic heatmap
- Faculty annotations on mechanisms
- Weekly metacognitive reports for students
- Exam mode
- Content admin interface (faculty-usable)
- Content versioning UI
- Review queue for content

**Additional content target:** 100 mechanisms total (cardiovascular, respiratory, plus renal and endocrine).

### Version 2.0 — Schedule Integration and Scale

**Timeline:** 3-4 months after v1.5.

**Scope:**
- Full schedule system with events table
- AI-assisted schedule import (PDF, Word, Excel, images)
- Schedule-aware Today dashboard
- Schedule-triggered exam mode
- Study schedule generation
- Concept maps (Connect step)
- Variable-manipulation simulators for 10-15 high-value mechanisms
- Video/audio narration for core mechanisms
- Automated billing (Razorpay integration)
- Self-service institutional admin features
- Advanced analytics for faculty
- Bulk operations for content management
- Student roster import

**Additional content target:** 200 mechanisms total (full curriculum coverage).

### Version 3.0 — Maturation

**Timeline:** 4-6 months after v2.0.

**Scope:**
- FSRS scheduler upgrade
- Mechanism dependency awareness in SRS
- Exam-proximity adaptive scheduling
- Multi-tenancy maturity (many institutions)
- Stripe integration for international users
- Advanced content audit tools
- Institutional customization (custom mechanisms, custom content layers)
- Integration APIs for external LMS
- Platform ambassador program
- Internationalization rollout (Hindi, regional languages)

### Post-v3

Ongoing content expansion, feature refinement based on real usage data, community features, advanced institutional capabilities.

### Release principles

- Ship early, ship often, ship small
- Every release is backward-compatible or has clear migration path
- Feature flags for gradual rollout
- Beta groups for significant features
- Changelog maintained for users

---

## 22. Content production plan

### Content is the critical path

The app cannot succeed without content. The app with great UX and 20 mechanisms is unusable. The app with mediocre UX and 200 well-authored mechanisms is valuable. Content production must start before engineering and run in parallel throughout.

### Authoring team

**Minimum viable team for v1 scope (30-50 mechanisms, cardiovascular + respiratory):**
- 1 lead faculty author (the founder, if faculty; otherwise recruited)
- 2-3 additional faculty authors
- 1-2 reviewing faculty
- AI assistance (Claude) for drafting

**For v1.5 scope (100 mechanisms):**
- Expand team to 5-8 authors
- 3-4 reviewers
- Part-time content coordinator

**For v2.0 scope (200 mechanisms):**
- 8-12 authors across the full curriculum
- 4-6 reviewers
- Dedicated content coordinator
- Content quality processes formalized

### Compensation models

Options to consider for authoring faculty:
- Per-mechanism honorarium (₹X per completed mechanism at spec)
- Hourly rate for authoring and review work
- Equity share in the venture (for early and committed authors)
- Institutional affiliation and credit (for faculty whose institutions see the app as departmental investment)
- Combination based on individual faculty preference

Specific numbers depend on budget and negotiation. A reasonable range might be ₹1500-3000 per completed mechanism for authoring, ₹500-1000 per mechanism reviewed.

### Authoring workflow (repeated for scale)

Per mechanism:
1. Author reviews reference materials (StatPearls, OpenStax, faculty notes, personal expertise)
2. Author + AI drafts Layer 1 (15-30 minutes)
3. Author + AI drafts Layer 2 (30-45 minutes)
4. Author + AI drafts Layer 3 (45-60 minutes)
5. Author + AI drafts Layer 4 with clinical vignettes (30-45 minutes)
6. AI generates question candidates, author curates and edits (30-45 minutes)
7. Hint ladders and explanations generated and reviewed (15-30 minutes)
8. Misconception mapping (15-30 minutes)
9. Tagging (15 minutes)
10. First review markoff (30-45 minutes for another faculty member)
11. Final sign-off

**Total time per mechanism with AI assistance:** 3-5 hours spread across authoring and review.

**Without AI assistance:** 8-12 hours per mechanism (traditional content production).

### Production schedule

**Pre-build content production (parallel with engineering of v1):**
- Months 1-2: Infrastructure for authoring, first 5 mechanisms as pilots (refining process)
- Months 2-3: Authoring scales to 20-30 mechanisms
- Months 3-4: Completion of v1 content target (30-50 mechanisms in CV and respiratory)

**Post-v1 content production:**
- Continuous authoring of 10-15 mechanisms per month sustained
- v1.5 target (100 mechanisms) reached at ~6-8 months post-launch
- v2.0 target (200 mechanisms) at ~12-15 months post-launch

### Content quality standards

Every mechanism before publication must meet:

- All four layers authored
- At least 6 questions across varied types and Bloom's levels
- Complete hint ladders for every question
- Elaborative explanations for every answer
- At least 3 misconception mappings
- All relevant tags applied
- One clinical vignette
- Two reviewer sign-offs
- Spelling, grammar, and medical accuracy verified
- Diagrams clear and properly licensed

Content failing any of these does not ship. Partial content is worse than no content.

### Legal and licensing compliance for content

- All referenced sources attributed appropriately
- Only open-access sources (StatPearls, OpenStax, NCBI Bookshelf) or original faculty authorship
- No commercial textbook reproductions
- No commercial question bank reproductions
- No unlicensed textbook PDFs in project
- Diagrams: either originally created, licensed appropriately, or public domain
- Audio/video narration: licensed or originally produced
- Legal review of content production workflow before scale

### Content maintenance plan

Ongoing operations:
- Weekly: minor edits, typo fixes (continuous)
- Monthly: draft review session (4-6 hours team time)
- Quarterly: comprehensive audit cycle (AI-assisted, faculty reviewed)
- Annual: major curriculum alignment update
- As needed: NMC update alignment, exam pattern shifts

---

## 23. Business operations

### Revenue model

- **Free tier:** Loss leader. Acquisition funnel.
- **Individual subscriptions:** Monthly and annual pricing. Sustainable unit economics expected with reasonable retention.
- **Institutional subscriptions:** Higher-ticket, longer contracts (annual or multi-year). Primary revenue at scale.
- **Institutional premium:** Higher-margin add-on for institutions with specific needs.

### Pricing strategy

**Individual tier (target pricing for research):**
- Monthly: ₹299-499
- Annual: ₹2,499-3,999 (roughly 4-5 months free versus monthly)

**Institutional tier:**
- Per-student annual fee in ₹500-1,500 range
- Volume discounts for larger institutions
- Multi-year commitments get discount

**Institutional premium:**
- 30-50% uplift over institutional
- Custom negotiation for large institutions

**Pricing validation:** Before setting final prices, research current spending patterns with target institutions and individual students. Adjust to market realities.

### Sales motion

**Direct institutional sales:**
- Founder-led for first 5-10 institutions
- Relationship-based, high-touch
- Pilot programs (3-month free or discounted trial) as foot-in-the-door
- Conversion via demonstrated student value

**Individual user acquisition:**
- Content marketing (physiology teaching content driving app interest)
- Word-of-mouth from institutional users
- Social media presence in medical student communities
- Partnership with existing study communities and tools
- Referral program

### Financial operations

- Business entity: sole proprietorship → private limited company
- Accounting: QuickBooks, Zoho Books, or similar
- Chartered accountant engaged for:
  - GST registration and filings
  - Annual tax returns
  - Institutional contract tax treatment
  - Financial advisory
- Bank account separate from personal
- Expense tracking disciplined from day one
- Monthly P&L review

### Team growth

**Solo phase (v1):** Founder builds with Claude Code. Content authoring by recruited faculty (contracted). Legal and accounting outsourced.

**Small team phase (v1.5-v2):** Consider adding:
- Part-time engineer (as technical load grows)
- Content coordinator (as content team grows)
- Customer success (as institutional base grows)

**Scale phase (v3+):** Proper team with multiple engineers, content team, sales, customer success, operations.

### Metrics to track

**Product metrics:**
- Daily active users, weekly active users, monthly active users
- Session duration and frequency
- Review completion rates
- Retention curves (D1, D7, D30, D90)
- Feature adoption rates
- Content completion rates
- Calibration score improvement over time

**Business metrics:**
- Revenue (MRR, ARR)
- Customer acquisition cost (CAC)
- Customer lifetime value (LTV)
- Churn rate (individual and institutional)
- Net Promoter Score
- Institutional retention rate
- Time to first value (how quickly new users experience benefit)

**Operational metrics:**
- Cost per user
- AI cost per user
- Support ticket volume and resolution time
- Error rate and uptime
- Content production velocity

---

## 24. Open questions and deferred decisions

Intentionally deferred from v1 to simplify and ship:

1. **Concept map module.** Simpler "connect" step in v1, full concept map feature in v2.
2. **Variable-manipulation simulators.** Not in v1. Added in v2 for 10-15 high-value mechanisms.
3. **Video and audio narration.** Not in v1. Added in v2.
4. **FSRS scheduler.** Using SM-2 in v1. Upgrade in v3.
5. **Automated billing.** Manual in v1. Razorpay integration in v2.
6. **Institutional admin self-service.** Platform admin handles institutional setup in v1. Self-service in v2.
7. **Multi-tenancy maturity.** Basic in v1-v2. Advanced in v3.
8. **Internationalization beyond English.** Infrastructure in v1. Language rollout in v3.
9. **External LMS integration.** Not before v3.
10. **Mobile native apps.** PWA only. Consider native wrappers post-v3 if specific platform features needed.
11. **Community features (forums, peer discussion).** Not in roadmap currently. Reconsider based on user demand.
12. **Gamification (XP, leaderboards, etc.).** Deliberately excluded. Core product philosophy.

### Research questions before major decisions

- Precise pricing for individual and institutional tiers (market research with target users)
- First target institutions for partnership (relationships, negotiations)
- Specific content authoring compensation model (negotiation with first authors)
- Legal structure details (founding documents, equity if any)

### Decisions to revisit based on data

- SM-2 vs FSRS (revisit at v2 with real retention data)
- Concept map format (revisit based on user testing)
- Notification frequency and channels (tune based on engagement data)
- Subscription tier feature allocation (tune based on conversion data)
- Pricing (tune based on acquisition and churn data)

---

## 25. Appendix A — Prompt templates

### Self-explanation grading prompt

```
You are grading a medical student's self-explanation of a physiological mechanism.

MECHANISM BEING EXPLAINED: {mechanism_name}
EXPECTED KEY POINTS:
{key_points_list}

STUDENT'S EXPLANATION:
{student_text}

Evaluate on:
1. Mechanism accuracy (is the described mechanism correct?)
2. Key points coverage (are the essential elements present?)
3. Conceptual coherence (does the explanation make causal sense?)

Return JSON:
{
  "score": <integer 0-3>,
  "mechanism_accurate": <boolean>,
  "key_points_covered": <array of covered points>,
  "key_points_missing": <array of missing points>,
  "misconceptions_detected": <array of misconception names or null>,
  "feedback": <string, 1-3 sentences for student>,
  "grading_notes": <string, for faculty review if needed>
}

Grading rubric:
- Score 3: Accurate mechanism, all key points present, coherent causal logic
- Score 2: Accurate mechanism, most key points, minor gaps
- Score 1: Partial understanding, some correct elements with some errors
- Score 0: Fundamental misconception or incorrect mechanism

Feedback should be:
- Direct and specific
- Affirming correct elements
- Identifying gaps without being harsh
- Actionable (what to think about next)
```

### Question generation prompt (for authoring)

```
You are helping a medical physiology faculty author a set of questions for the mechanism: {mechanism_name}

MECHANISM CONTEXT:
Layer 1: {layer_1_content}
Layer 2: {layer_2_content}
Key concepts: {key_concepts}

Generate 10 question candidates covering:
- 2 free recall questions (open-ended, testing basic mechanism understanding)
- 2 prediction questions (forward reasoning)
- 2 reverse reasoning questions (outcome to cause)
- 1 mechanism-chain ordering question
- 2 clinical application questions (short vignettes)
- 1 misconception-targeted question

For each question, include:
- Question text
- Correct answer
- Estimated Bloom's taxonomy level (Remember/Understand/Apply/Analyze)
- Three-tier hint ladder (Conceptual nudge → Directional hint → Scaffolding)
- Elaborative explanation of the correct answer (2-4 sentences)
- For MCQ-type questions: 4 distractors with brief notes on why each is wrong or tempting
- For misconception-targeted: which misconception from the catalog this targets

Tag each question with:
- Question type (from list above)
- Estimated difficulty (foundational/intermediate/advanced)
- Suggested NMC competency codes
- Relevant exam pattern tags

Return as JSON array. Each question object should be complete and ready for faculty review.

Avoid:
- Direct quotations from copyrighted sources
- Overly similar questions (ensure variety in framing)
- Ambiguous wording
- Clinically unrealistic scenarios
```

### Schedule extraction prompt (text-based documents)

```
You are extracting structured schedule data from a document uploaded by medical school faculty.

DOCUMENT CONTENT:
{document_text}

OUR MECHANISM LIST:
{mechanism_names_and_aliases}

Extract every schedulable event you can identify. For each event:
- Date (ISO format YYYY-MM-DD)
- Start time (24-hour format HH:MM)
- End time (if specified, else null)
- Event type (one of: lecture, practical, tutorial, exam, assignment_deadline, event, holiday)
- Title/topic
- Associated mechanism IDs (match from our mechanism list; use aliases too)
- Faculty name (if specified)
- Location (if specified)
- Confidence level (high/medium/low based on how certain you are about extraction)
- Notes (anything relevant for review, especially uncertainties)

Return JSON:
{
  "events": [
    { ... event object ... },
    ...
  ],
  "extraction_issues": [
    "any ambiguities or problems encountered, e.g., dates without year context, unrecognized faculty names, topics not matching any mechanism"
  ],
  "summary": "one-line summary of what was extracted"
}

Important:
- If a topic doesn't match any mechanism in our list, leave mechanism_ids empty and flag in notes
- If dates are ambiguous (like "Week 3 Day 2"), mark confidence low and flag
- Do not fabricate information not in the source
- Preserve exact topic text from source document
- When in doubt, include the event with confidence low rather than excluding it
```

### Misconception classification prompt

```
You are classifying a student's incorrect answer against a catalog of known misconceptions in medical physiology.

QUESTION: {question_text}
CORRECT ANSWER: {correct_answer}
STUDENT'S ANSWER: {student_answer}
MECHANISM: {mechanism_name}

KNOWN MISCONCEPTIONS FOR THIS MECHANISM:
{relevant_misconceptions}

Determine:
1. Does the student's answer match a known misconception? If yes, which one?
2. If not a known misconception, categorize: factual error, logical error, incomplete reasoning, or other
3. What is the student's likely mental model based on this answer?

Return JSON:
{
  "matches_misconception": <boolean>,
  "misconception_id": <string or null>,
  "misconception_name": <string or null>,
  "category": <enum: known_misconception, factual_error, logical_error, incomplete, other>,
  "likely_mental_model": <string, brief description>,
  "targeted_feedback": <string, 2-3 sentences addressing specifically what went wrong>
}
```

### Additional prompts (abbreviated for this document)

- Hint ladder generation prompt
- Content audit prompt
- Clinical vignette generation prompt
- Content gap identification prompt
- Adaptive remediation prompt

Full templates maintained in /prompts directory, versioned with code.

---

## 26. Appendix B — Data schemas

Key schemas in TypeScript (Zod) for validation:

```typescript
// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['student', 'faculty', 'institutional_admin', 'platform_admin']),
  institution_id: z.string().uuid().nullable(),
  subscription_id: z.string().uuid().nullable(),
  faculty_flags: z.array(z.enum(['content_author', 'content_reviewer', 'department_head', 'examiner'])),
  first_name: z.string(),
  last_name: z.string(),
  display_name: z.string(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.any()),
  created_at: z.date(),
  updated_at: z.date(),
  last_active_at: z.date().optional(),
  deleted_at: z.date().nullable()
});

// Mechanism schema
export const MechanismSchema = z.object({
  id: z.string().uuid(),
  canonical_name: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()),
  system: z.enum(['cardiovascular', 'respiratory', 'renal', 'endocrine', 'gi', 'nervous', 'reproductive', 'hematology', 'general']),
  summary: z.string(),
  layer_1_content: z.string(),
  layer_2_content: z.string(),
  layer_3_content: z.string(),
  layer_4_content: z.string(),
  primary_diagram_url: z.string().url().optional(),
  tags: z.object({
    competencies: z.array(z.string()),
    exam_patterns: z.array(z.string()),
    bloom_levels: z.array(z.string()),
    specialties: z.array(z.string())
  }),
  difficulty_tier: z.enum(['foundational', 'intermediate', 'advanced']),
  tier_required: z.enum(['free', 'individual', 'institutional']),
  status: z.enum(['draft', 'review', 'published', 'retired']),
  version: z.string(),
  created_by: z.string().uuid(),
  reviewed_by_1: z.string().uuid().optional(),
  reviewed_by_2: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
  deleted_at: z.date().nullable()
});

// Question schema
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  mechanism_id: z.string().uuid(),
  question_type: z.enum(['free_recall', 'prediction', 'reverse_reasoning', 'mechanism_chain', 'diagram_labeling', 'variable_effect', 'clinical_application', 'misconception_targeted', 'multiple_choice']),
  question_text: z.string(),
  question_diagram_url: z.string().url().optional(),
  correct_answer: z.string(),
  answer_explanation: z.string(),
  hint_1: z.string(),
  hint_2: z.string(),
  hint_3: z.string(),
  distractors: z.array(z.object({ text: z.string(), rationale: z.string() })).optional(),
  misconception_mappings: z.array(z.object({ wrong_answer_pattern: z.string(), misconception_id: z.string().uuid() })),
  bloom_level: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
  estimated_time_seconds: z.number().int().positive(),
  tags: z.record(z.any()),
  status: z.enum(['draft', 'review', 'published', 'retired']),
  version: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional()
});

// Event schema (for schedule)
export const EventSchema = z.object({
  id: z.string().uuid(),
  institution_id: z.string().uuid(),
  class_id: z.string().uuid().nullable(),
  type: z.enum(['lecture', 'practical', 'tutorial', 'exam', 'assignment_deadline', 'event', 'holiday']),
  title: z.string(),
  description: z.string().optional(),
  start_at: z.date(),
  end_at: z.date(),
  location: z.string().optional(),
  faculty_id: z.string().uuid().nullable(),
  mechanism_ids: z.array(z.string().uuid()),
  visibility: z.enum(['students', 'faculty_only', 'admin_only']),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']),
  source: z.enum(['manual', 'bulk_import', 'ai_extract', 'generated']),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date()
});

// Additional schemas maintained in /types directory
```

---

## 27. Appendix C — Initial mechanism list

Target list of 200 mechanisms for full curriculum. Priority for v1 (cardiovascular and respiratory, ~30-50 mechanisms):

### Cardiovascular (v1 priority)

1. Cardiac muscle structure and contraction
2. Cardiac action potential (pacemaker and non-pacemaker)
3. Excitation-contraction coupling in cardiac muscle
4. Cardiac cycle phases
5. Pressure-volume loops
6. Frank-Starling mechanism
7. Preload, afterload, and contractility
8. Stroke volume determinants
9. Cardiac output regulation
10. Heart rate regulation (autonomic control)
11. Baroreceptor reflex
12. Chemoreceptor reflex (cardiovascular)
13. Bainbridge reflex
14. Pressure-flow-resistance relationships
15. Poiseuille's law and vascular resistance
16. Laminar vs turbulent flow
17. Mean arterial pressure determinants
18. Venous return and its regulation
19. Capillary dynamics (Starling forces)
20. Lymphatic circulation
21. Coronary circulation
22. Cerebral circulation and autoregulation
23. Renal circulation (to bridge with renal)
24. Pulmonary circulation (to bridge with respiratory)
25. Microcirculation and vasomotion
26. Blood pressure regulation (short and long-term)
27. Renin-angiotensin-aldosterone system (cardiovascular effects)
28. ANP/BNP and cardiovascular regulation
29. ECG interpretation (basics)
30. Cardiac cycle events and heart sounds

### Respiratory (v1 priority)

31. Lung anatomy and airway structure
32. Respiratory muscles and mechanics of breathing
33. Compliance and elastance
34. Surface tension and surfactant
35. Airway resistance
36. Lung volumes and capacities
37. Flow-volume loops
38. Ventilation distribution
39. Dead space (anatomical and physiological)
40. Alveolar ventilation equation
41. Alveolar gas equation
42. Gas diffusion in the lung
43. Oxygen transport and hemoglobin
44. Oxygen-hemoglobin dissociation curve
45. Carbon dioxide transport
46. Ventilation-perfusion matching
47. V/Q ratio variations and consequences
48. Hypoxic pulmonary vasoconstriction
49. Bohr and Haldane effects
50. Chemical control of breathing

### Remaining systems (v1.5 and beyond)

Renal (20-30 mechanisms), Endocrine (25-30), GI (20-25), Nervous (30-40), Reproductive (15-20), Hematology (10-15), General physiology (10-15).

Detailed list maintained separately and evolved based on authoring progress and curriculum feedback.

---

## Document maintenance

This plan is version-controlled in the project repository. Updates require:
- Clear rationale for change
- Impact assessment (what downstream changes needed)
- Version bump
- Changelog entry

Plan review: comprehensive review every 6 months or at major version releases, whichever is sooner.

---

**End of Plan Document v1.0**
