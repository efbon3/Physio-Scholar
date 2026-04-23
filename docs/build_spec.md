# Physiology PWA — V1 Build Specification

**Version 1.1**

This document defines what v1 is, what v1 is not, and how we know when v1 is done. It is the direct reference for implementation. Claude Code builds from this document; everything outside it is deferred.

For design principles and product philosophy, see the Vision and Design Document. For future phases, see the Roadmap. For content authoring workflows, see the Content Production SOP.

---

## 1. V1 Definition

### 1.1 V1 in One Paragraph

V1 is a progressive web app delivering the core learning loop for 10–15 physiology mechanisms covering cardiovascular system fundamentals. The author's current first-year MBBS batch — at the author's institution — is the pilot cohort. Students can sign up, complete daily SRS-scheduled review sessions with active recall, hint ladders, and forced metacognitive rating, receive elaborative misconception-aware feedback on wrong answers, write self-explanations graded by AI, and track their own progress. The app works offline after initial content download. The pilot is free for pilot students — no payment mechanics in v1. No faculty tools, no institutional admin, no schedule integration — these come in v2 if expansion happens.

### 1.2 V1 Goals

**Primary:** Validate that the core learning loop helps the author's own students learn physiology better than their previous study methods.

**Secondary:** Establish sustainable content authoring workflow for single-author (author alone) at pilot scale.

**Tertiary:** Gather real usage data that informs future decisions about whether and how to expand beyond the initial pilot.

### 1.3 V1 Non-Goals

Not demonstrating product-market fit for a general market (pilot is specific to author's students).
Not establishing a sales pipeline.
Not generating revenue.
Not polished admin or faculty experience.
Not covering full physiology curriculum.
Not automated billing at scale.
Not a fully scalable production system.

### 1.4 Timeline Framing

Timeline is not fixed by external constraints. The app launches when the author is ready and the content is complete. The author's current first-year batch has remaining months in their first year when v1 is ready; if timing permits, v1 launches while they are still in first year. If timing means they move into second year before v1 is ready, they remain valuable pilot users — second-year students reviewing first-year physiology is actually a strong test of durable retention.

The team structure is: author plus Claude Code for engineering, author alone for content authoring, dedicated testing team for functional validation. This team structure is stable and supports sustained work without burnout concerns.

---

## 2. V1 Scope — What Ships

### 2.1 Users and Access

**Authentication.**
- Email and password signup/login.
- Email verification required.
- Password reset via email link (30-minute token).
- Account lockout after 5 failed attempts in 15 minutes.
- Session tokens expire after 30 days of inactivity.

**Not in V1:** Phone/OTP auth, Google Sign-In, institutional SSO.

**Roles.** Student, Platform Admin (author). Faculty and Institutional Admin roles exist in data model but have no UI — activated when expansion happens.

**Subscription tiers.** Data model supports tiers but v1 uses none — all pilot students have full access for free. Subscription mechanics activate when expansion happens.

### 2.2 Content

**Scope:** 10–15 mechanisms covering cardiovascular system fundamentals. Specific mechanisms selected by the author based on pedagogical priority and the batch's curriculum position.

Examples (actual selection by author):
- Cardiac cycle phases
- Frank-Starling mechanism
- Cardiac output regulation
- Baroreceptor reflex
- Preload and afterload determinants
- Contractility regulation
- Blood pressure regulation
- Vascular function curves
- Venous return
- Cardiac cycle pressure-volume relationships
- ECG fundamentals
- Cardiac ion channels and action potentials
- Autonomic cardiac control
- Coronary circulation
- Response to exercise

**Per-mechanism contents.**
- All four content layers (Core, Working, Deep Dive, Clinical Integration).
- 6–10 questions at varied Bloom's levels and types.
- Three-tier hint ladder per question.
- Misconception mappings per question.
- At least one diagram (SVG preferred).
- Tags: organ system, NMC competency, exam pattern relevance, Bloom's distribution.

**Content storage.**
- Content lives as structured markdown files in the Git repository in v1.
- Editing content means editing markdown files and redeploying.
- No content admin interface built in v1. The full CMS-style interface is a v1.5 or v2 build when content volume justifies it.
- The markdown structure is defined in the Content Production SOP.

**Content quality gates.**
- Authored by the author with AI drafting assistance.
- Single-author workflow in pilot (two-reviewer signoff becomes mandatory when expansion happens).
- Every mechanism complete before inclusion (no partial content shipping).

### 2.3 Student Experience

**Navigation.** Three tabs: Today, Systems, Progress.

**Today dashboard.**
- Greeting with student name.
- Review queue count.
- Primary action button: "Start review."
- Streak indicator.
- One weak area callout if applicable.
- One clinical challenge link (if Layer 4 content available).

**Systems tab.**
- List of organ systems.
- V1 shows only Cardiovascular; future systems gray with "Coming soon" labels.
- Click into cardiovascular → list of mechanisms.
- Click into mechanism → mechanism detail page.

**Mechanism detail page.**
- Title, brief subtitle.
- Four layer tabs (Layer 1 expanded by default).
- Layer content: text and diagrams.
- "Study this mechanism" button (launches Learn mode).
- Personal stats: retention score, last reviewed, next due.

**Session interface.**
- Fullscreen card presentation.
- Question shown. Attempt field for free recall.
- "Show hint" button (graduated ladder).
- "Show answer" button (after attempt committed).
- On answer reveal: correct answer, elaborative explanation, misconception correction if applicable.
- Self-explanation prompt (optional in Review mode, required in Learn mode).
- Four-button rating (Again, Hard, Good, Easy) — required to advance to next card.
- Transitions under 200ms perceived latency.

**Review session flow.**
- Queue assembled from SRS (due cards + new cards according to limits).
- Each card follows six-step loop.
- Session ends when queue empty or student pauses.
- Session summary on completion: cards reviewed, rough retention percentage, next review due.

**Learn mode.**
- Launched from a mechanism page.
- Full six-step loop without time pressure.
- Self-explanation required.
- On completion, cards from that mechanism enter student's SRS schedule.

**Progress tab.**
- Retention curve visualized over time.
- Mastery percentage per mechanism.
- Streak history.
- Weekly metacognitive calibration report (starts week 2).
- Study time aggregates.

### 2.4 Forced Rating Behavior

Rating required before advancing to next card. Specifically:

**Required:** Student cannot see next card without rating the current one. Rating buttons are the only forward path.

**Not required:** Tab away, close app, phone call, screen sleep are all tolerated. Return shows same card with same rating prompt. No tab-switch forcing.

**Time decay.** Unrated card auto-rates as "Again" after 24 hours; scheduling continues.

**Pause.** Student can pause entire session at any time.

**Minimum 2-second delay** before rating buttons active.

**Flat emotional tone.** No celebration on "Easy," no failure messaging on "Again."

### 2.5 Hint Ladder

Three tiers per question:

**Hint 1:** Conceptual nudge toward relevant framework.
**Hint 2:** More specific identification of key concept.
**Hint 3:** Approaches answer without stating directly.

Opt-in — student must request. Each hint tap logged as metacognitive signal. After hint 3, "Show answer" becomes the path.

### 2.6 Self-Explanation Grading

After student commits answer and sees reveal, they type (or paste) their explanation.

**Grading rubric (Green/Yellow/Red).** Per Vision Document section 2.7.

**Output.** "Well explained" (green), "Partially correct" (yellow with specific feedback), "Missing the mechanism" (red with pointer to correct model).

**Language robustness requirement.** Grading prompt tested against test set of 200+ sample responses before launch, including Hinglish, Indian medical abbreviations, varied English proficiency. False-positive rate must be below 5%. Faculty-adjudicated gold labels.

**Dispute mechanism.** Student who disagrees with a grade can flag it for review via a button in the grading interface. Flagged grades queue for review by the author. Dispute rate tracked as quality signal.

**Queueing for offline.** Self-explanations submitted offline stored locally, sent for grading on reconnection. Student sees "Grading when online" status. Results delivered via in-app notification when student next opens the app. No email notification for grades (too noisy).

### 2.7 SRS Scheduler (SM-2 with modifications)

SM-2 algorithm, pure function with comprehensive test coverage.

**Initial parameters.**
- New card default ease factor: 2.5.
- Minimum ease factor floor: 1.5 (modified from standard 1.3).
- Intervals after rating: Again → 1 minute (same session) then 1 day, Hard → current × 1.2, Good → current × ease, Easy → current × ease × 1.3.
- Ease adjustments: Again -0.2, Hard -0.15, Good no change, Easy +0.15.

**Leech detection.** Cards failed 5 consecutive times flagged. Student prompted:
- "Review the full mechanism" (opens Learn mode).
- "Suspend this card" (kept in leech list).
- "Continue trying" (stays in queue).

**New card introduction rate.** Default 10 new cards per day, student-configurable 5–20.

**Daily review limits.** No hard cap on reviews; session length time-bounded at 30 minutes with option to extend.

**Test coverage.** 100% coverage on scheduler function against reference outputs. Explicit edge cases tested:
- Cards at ease floor behavior.
- Transition from learning to review.
- Leech detection triggering.
- Interval calculation at various ease values.
- Card reset on Again after long interval.
- Precedence when multiple rules interact.

### 2.8 Offline and PWA

**Progressive Web App.**
- Web App Manifest with name, icons, theme colors, standalone display mode.
- Service worker for asset caching.
- Install prompt surfaced contextually (after 3+ sessions).

**Progressive content download.**
- Initial install: 5 MB app shell (gzipped JavaScript + CSS + essential assets; measured as part of acceptance criteria).
- Cardiovascular content pack: 15–25 MB, prompted for download on first session.
- Student on metered connection can defer pack download.

**What works offline.**
- App shell.
- Downloaded content.
- SRS scheduling (local).
- Review sessions end-to-end.
- Rating submission (queued for sync).
- Self-explanation composition (queued for grading).
- Progress viewing (local data).

**What requires connection.**
- Initial signup and login.
- Self-explanation grading (results arrive async).
- Downloading new content.
- Cross-device sync.

**Sync strategy.**
- Local-first writes via IndexedDB (Dexie wrapper).
- Background sync queue when online.
- Conflict resolution: server timestamp with basic vector clock for ambiguous cases.
- **Hard gate before launch:** 100 offline-to-online sync cycles with zero data loss. If this gate fails, launch delays.

### 2.9 Platform Admin Experience (Minimal)

Basic admin interface for author-only operational management.

**Users management.**
- List users, search by email.
- View user details: activity, subscription (even if unused in pilot), last active.
- Deactivate or delete accounts.

**Dispute review queue.**
- AI-grading disputes surfaced for author review.
- Author can override grade with one click.

**Content flag queue.**
- Student-flagged content surfaced for author review.
- Author investigates and either dismisses, corrects, or escalates.

**Basic system metrics.**
- Active users last 7/30 days.
- Sessions per day.
- AI calls per day with cost estimate.
- Error rate (from Sentry).

**Not in v1:** Full content admin interface. Content lives as markdown files edited directly.

### 2.10 Privacy and Compliance

**DPDPA compliance.**
- Privacy policy drafted with legal counsel review before launch.
- Explicit consent flow at signup.
- Granular consent for analytics (per-category opt-out).
- Data export capability (student downloads own data as JSON).
- Data deletion capability (30-day grace period, then actual deletion).
- Grievance officer contact designated.
- Breach notification procedure documented.

**Minor consent handling.**
- Legal consult completed before v1 launch.
- Signup flow handles age appropriately per legal guidance.

**Content licensing.**
- Copyright memo obtained from specialist lawyer.
- Every piece of content has clear provenance.

### 2.11 Anti-Abuse Controls

**Watermarking.** Content pages include visible user_id hash watermark.

**Rate limiting.**
- Maximum 80 questions served per account per day.
- Maximum 5 password reset requests per account per day.
- Maximum 10 AI grading calls per student per day.

**Concurrent session detection.** Sessions from geographically distant IPs within short windows trigger email verification.

**Terms of service.** Explicit prohibition on redistribution. Account termination remedy.

### 2.12 Accessibility Baseline

**V1 Required.**
- Keyboard navigation for all interactions.
- Screen reader support via shadcn/ui defaults with ARIA labels.
- Color contrast 4.5:1 for body text.
- Visible focus indicators.
- Text scaling to 200% without layout breaking.
- Reduced motion mode respected.
- Dark mode.

**V1 Testing.** axe-core automated tests in CI. Manual testing on critical flows with screen reader.

**Not in V1.** Formal accessibility audit by specialist (deferred to v1.5 before any institutional deployment).

---

## 3. V1 Acceptance Criteria

V1 is done when all of the following are demonstrable:

### 3.1 Functional Criteria

- [ ] A new user can sign up, verify email, complete onboarding, and start first session within 5 minutes.
- [ ] A student can complete a full review session (6-step loop) for a cardiovascular mechanism with all features working.
- [ ] The SRS scheduler correctly calculates intervals for at least 50 distinct rating sequences verified against reference outputs.
- [ ] Leech detection triggers at exactly 5 consecutive failures.
- [ ] Self-explanation grading returns results within 15 seconds for online requests, or queues correctly when offline.
- [ ] Self-explanation grading false-positive rate below 5% on test set of 200+ responses.
- [ ] Self-explanation grading accepts Hinglish and localized medical language in test set.
- [ ] Student dispute mechanism works: flagged grade appears in author's review queue, override updates student's record.
- [ ] All selected mechanisms have complete content at all four layers.
- [ ] Progressive content download works: app shell under 5 MB gzipped, content pack downloads in background on demand.
- [ ] Offline-to-online sync: 100 test cycles with zero data loss verified.
- [ ] Forced rating allows tab switches, auto-rates at 24 hours, cannot be bypassed within session.
- [ ] Watermarking appears on all rendered content.
- [ ] Rate limits trigger correctly at configured thresholds.

### 3.2 Performance Criteria

- [ ] Time to interactive on first load under 3 seconds on 3G.
- [ ] Card transition in session under 200ms perceived latency.
- [ ] Self-explanation grading end-to-end under 15 seconds when online.
- [ ] Database query performance: SRS queue assembly under 500ms for students with up to 500 cards.
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1.

### 3.3 Reliability Criteria

- [ ] Error rate under 0.5% of sessions (Sentry).
- [ ] Zero data loss in sync operations verified across 100+ test cycles.
- [ ] Automated daily backups operational and restoration tested.
- [ ] 99.5% uptime over any 30-day window (largely Vercel SLA).

### 3.4 Security and Privacy Criteria

- [ ] RLS policies tested: student A cannot read student B's data under any code path.
- [ ] RLS policies match stated principles: no hidden permission broadening.
- [ ] Cross-institution data isolation tested (even though v1 has one institution).
- [ ] Privacy policy, terms of service deployed and legally reviewed.
- [ ] Data export: student can download data as JSON.
- [ ] Data deletion: works, verified removed from database.
- [ ] Minor consent handling consistent with legal guidance.
- [ ] Password hashing, rate limits on login, session rotation — all standard Supabase Auth.

### 3.5 Content Quality Criteria

- [ ] 100% of v1 mechanisms have complete four layers, questions, hints, misconceptions.
- [ ] Every question has hint ladder and misconception map.
- [ ] Every substantive claim has traceable source.
- [ ] Zero known factual errors at launch time.
- [ ] Content flag button works; submissions reach review queue.
- [ ] One gold-standard mechanism completed and used as reference template before Phase 1 engineering begins (see Section 4.1).

### 3.6 User Experience Criteria

- [ ] Pilot users complete at least 3 sessions in first week.
- [ ] Session completion rate over 75%.
- [ ] Pilot users report (via feedback) that the app is understandable, works on their phone, and feels usable.
- [ ] Specific pilot user concerns addressed or explicitly deferred with rationale.

---

## 4. V1 Build Sequence

### 4.1 Phase 0 — Gold-Standard Mechanism (Before Phase 1 Engineering)

Before engineering begins in earnest, produce one fully-realized mechanism as reference template and de-risking exercise.

**Target mechanism:** Frank-Starling mechanism (or equivalent core cardiovascular mechanism at author's discretion).

**Deliverables.**
- Complete Layer 1 (30-second core).
- Complete Layer 2 (working explanation with key variables, essential graph).
- Complete Layer 3 (deep dive with molecular basis, integration).
- Complete Layer 4 (clinical integration with vignettes).
- 8 questions across varied Bloom's levels and types.
- Three-tier hint ladder per question.
- Misconception mappings (at least 3 per question).
- SVG diagrams.
- Structured markdown format matching Content Production SOP.

**Why this comes first.**
- Establishes style guide by example.
- Produces time-per-mechanism data informing content timeline.
- Provides reference artifact Claude Code can see while building the content consumption parts of the app.
- Tests the content production workflow before scaling.

**Completion criterion.** The author reviews the completed mechanism and judges it ready to ship. This is the anchor against which all other mechanisms are evaluated.

### 4.2 Phase 1 — Foundation (Weeks 1–3)

**Project setup.**
- Next.js 14+ App Router project initialized.
- TypeScript strict mode.
- Tailwind and shadcn/ui installed.
- ESLint, Prettier, pre-commit hooks.
- Git repository with main branch protection.
- README with development setup.

**Supabase setup.**
- Supabase project created.
- Initial schema: users, institutions, subscriptions, sessions.
- RLS policies on core tables with tests.
- Database migrations system operational.

**Authentication.**
- Email/password via Supabase Auth.
- Email verification.
- Password reset.
- Session management.

**Infrastructure.**
- Vercel connected to GitHub.
- Preview deployments on PRs.
- Production deployment from main.
- Sentry for error monitoring.
- PostHog for product analytics.
- Resend for transactional email.

**Testing infrastructure.**
- Vitest for unit tests.
- Playwright for E2E tests.
- axe-core for accessibility.
- CI on every PR.

### 4.3 Phase 2 — Content Model and Offline Foundation (Weeks 4–6)

**This phase merges content model with offline foundation, so offline is built before features depend on it.**

**Content model.**
- Markdown file structure defined and documented.
- Build-time content compilation to searchable JSON.
- Content serving via API routes.
- First mechanism (Frank-Starling from Phase 0) loaded as end-to-end proof.

**Offline foundation.**
- IndexedDB setup via Dexie.
- Service worker configuration via next-pwa.
- Offline content caching strategy.
- Sync queue infrastructure (not yet used by features).
- 20 test cycles of offline-to-online verified.

### 4.4 Phase 3 — Learning Loop (Weeks 7–10)

- Card display components.
- Hint ladder interface.
- Rating interface (forced-within-session, pause-allowed, 24-hour-decay).
- SM-2 scheduler as pure function with tests.
- Student card state management (both server and IndexedDB).
- Learn mode end-to-end.
- Review mode end-to-end with queue assembly.
- Session summary on completion.
- Offline review sessions working end-to-end.

### 4.5 Phase 4 — AI Integration (Weeks 11–13)

- Claude API integration layer with retry and caching.
- Self-explanation grading endpoint.
- Grading prompt developed and tested against 200+ sample responses including Hinglish.
- False-positive rate verified below 5%.
- Grading queue uses offline infrastructure from Phase 2.
- Misconception-aware feedback rendering.
- Rate limiting on grading calls.
- Dispute mechanism.

### 4.6 Phase 5 — Today, Systems, Progress (Weeks 14–16)

- Today dashboard with live data.
- Systems tab with mechanism list.
- Mechanism detail page with layer tabs.
- Progress tab with retention curves, mastery, streaks.
- Weekly metacognitive calibration report.

### 4.7 Phase 6 — PWA Polish and Offline Completion (Weeks 17–20)

- Progressive content download UI.
- Install prompt contextually surfaced.
- 100 offline-to-online sync cycles with zero data loss verified (hard gate).
- Cross-device sync conflict resolution tested.
- Service worker update flow verified.
- Performance optimization pass.

### 4.8 Phase 7 — Admin and Polish (Weeks 21–22)

- Platform admin interface (minimal): users, content flags, dispute queue, metrics.
- Watermarking on rendered content.
- Rate limiting implemented across endpoints.
- Accessibility baseline verified with axe-core.
- Manual screen reader testing on critical flows.

### 4.9 Phase 8 — Legal and Compliance (Starts Week 10, completes by Week 22)

**Started early because legal turnaround in India can be multi-week.**

- Privacy lawyer consult on minor consent — recommendations implemented.
- Copyright lawyer memo on content licensing — attribution format applied.
- Privacy policy drafted and legally reviewed.
- Terms of service drafted and legally reviewed.
- DPDPA compliance checklist completed.
- Grievance officer designated and contact published.

### 4.10 Phase 9 — Team Testing (Weeks 23–24)

The dedicated testing team executes functional validation.

- All acceptance criteria in Section 3 verified by testing team.
- Bug list managed, critical bugs fixed, others deferred or documented.
- Performance benchmarks measured on real devices.
- Offline sync cycles verified at scale.

### 4.11 Phase 10 — Closed Pilot (Weeks 25–26)

- Launch to 10–15 students from author's batch as closed pre-pilot.
- Daily monitoring of sessions, errors, feedback.
- In-class and WhatsApp feedback collected.
- Rapid iteration on critical issues.

### 4.12 Phase 11 — V1 Launch (Week 27+)

- Launch readiness checklist complete (Section 5).
- Opening to full pilot cohort.
- Daily monitoring.
- Support via WhatsApp, in-class, and in-app feedback form.

**Content production runs in parallel throughout.** Mechanisms 2–15 authored during Phases 1–8, with target of 2–3 mechanisms per month. All 10–15 mechanisms complete before Phase 10.

---

## 5. V1 Launch Readiness Checklist

Final gate before opening access to pilot users:

### 5.1 Engineering

- [ ] All acceptance criteria in Section 3 verified by testing team.
- [ ] Test coverage: 100% on critical paths (scheduler, RLS, entitlement, grading).
- [ ] Zero known critical bugs.
- [ ] Performance targets met.
- [ ] Error monitoring and alerting operational.
- [ ] Database backups automated and restoration tested.
- [ ] Production deployment pipeline verified.
- [ ] Rollback procedure documented and tested.
- [ ] 100 offline sync test cycles passed.

### 5.2 Content

- [ ] All 10–15 mechanisms published with author signoff.
- [ ] Content flag mechanism operational.
- [ ] Dispute resolution workflow tested.
- [ ] Gold-standard mechanism (Phase 0) ships with v1.

### 5.3 Legal

- [ ] Privacy policy published.
- [ ] Terms of service published.
- [ ] DPDPA compliance verified.
- [ ] Copyright compliance verified.
- [ ] Minor consent handling verified.
- [ ] Grievance officer designated.

### 5.4 Operations

- [ ] Author's WhatsApp support channel communicated to pilot students.
- [ ] In-app feedback form operational.
- [ ] Initial FAQ documented.
- [ ] Incident response procedure documented.

### 5.5 Communications

- [ ] Pilot students briefed on expectations and feedback channels.
- [ ] Signup flow works end-to-end.
- [ ] Transactional emails tested.

---

## 6. MVP Cut Line

Explicit ordering of what gets cut first if time or quality constraints demand it. This is a deliberate planning tool — making these decisions now, not when pressed.

**Order of cuts (most expendable first):**

1. **Weekly metacognitive calibration report.** Valuable but can be added post-launch as a v1.0.1 update. Students get value from the core loop without it.

2. **Mechanism count reduced from 15 to 10.** Ten mechanisms are still a meaningful pilot. Quality matters more than count.

3. **Advanced rate limiting (concurrent session detection).** Basic rate limits stay; concurrent session detection moves to v1.5.

4. **Dispute mechanism sophistication.** Keep basic flag-for-review, drop the override workflow refinement if needed.

5. **Mechanism count reduced from 10 to 6.** This is the minimum viable pilot — six mechanisms covering the core of cardiac cycle, Frank-Starling, cardiac output, baroreflex, blood pressure regulation, and autonomic control.

**Never cut (the actual MVP):**

- Core six-step learning loop.
- SM-2 scheduler with forced rating.
- Hint ladders.
- Misconception-aware feedback.
- Offline capability for sessions and ratings.
- AI self-explanation grading (the feature that most differentiates the app).
- RLS and security baseline.
- DPDPA compliance.
- Basic accessibility.

**Decision trigger.** If at Phase 7 (Week 22) the app is not on track to pass acceptance criteria, the cut line activates. Author and testing team lead review progress and cut in order. This prevents quality compromise without scope reduction.

---

## 7. V1 Out-of-Scope

Explicitly not in v1:

**Faculty features.** No faculty UI. Faculty role in data model only.
**Institutional features.** No institutional admin UI. Institutional data model exists, not actively managed.
**Schedule features.** No schedule creation, import, or schedule-aware notifications.
**Other systems.** Only cardiovascular content in v1.
**Exam mode.** Basic review mode only. Exam mode in v1.5.
**Concept maps.** Deferred to v3.
**Interactive simulators.** Deferred to v2.
**Automated billing.** No billing in v1 pilot.
**Phone/OTP authentication.** Email only.
**Google Sign-In.** Deferred to v1.5.
**Internationalization.** English only.
**Advanced search.** Basic filtering only.
**Native mobile apps.** PWA only.
**FSRS scheduler.** SM-2 in v1.
**Advanced analytics.** Basic metrics only.
**API for third-party integration.** None.
**Full WCAG 2.2 AA audit.** Baseline compliance in v1; formal audit in v1.5.
**Full content admin interface.** Content as markdown files in repo.

---

## 8. V1 Risks and Mitigations

### 8.1 Critical Risks

**Risk: Content production falls behind engineering.**
Mitigation: Content starts with Phase 0 gold-standard mechanism before engineering Phase 1. One mechanism per 2–3 weeks sustained rate is achievable with dedicated time. MVP cut line drops mechanism count if needed.

**Risk: AI grading quality insufficient or inconsistent.**
Mitigation: Extensive prompt testing against 200+ varied responses before launch. False-positive budget below 5%. Dispute mechanism catches problems in real use.

**Risk: Pilot users find app confusing or insufficient.**
Mitigation: Author teaches these students directly; feedback is immediate. Small pilot size enables intensive user research. WhatsApp support channel.

**Risk: Sync bugs cause data loss.**
Mitigation: 100 sync cycle hard gate before launch. Local-first architecture. Server-side backup of all student data. Sync test team performs extensive edge case testing.

### 8.2 Technical Risks

**Risk: SRS scheduler bugs cause wrong intervals.**
Mitigation: 100% test coverage against reference outputs. Pure function implementation. Extensive edge case testing.

**Risk: PWA caching or service worker bugs.**
Mitigation: Gradual rollout. Fallback to network-first for critical paths. Remote cache invalidation capability.

**Risk: Offline sync complexity.**
Mitigation: Phase 2 builds offline foundation before features depend on it. Dedicated 100-cycle test gate.

### 8.3 Legal Risks

**Risk: DPDPA minor consent handling non-compliant.**
Mitigation: Legal consult before launch. Age verification in signup. Documented compliance.

**Risk: Content licensing violations.**
Mitigation: Copyright memo obtained. Attribution verified. Source traceability required.

**Risk: Medical content accuracy liability.**
Mitigation: Author signoff. Clear disclaimers in ToS. Error correction protocol. Investigate professional indemnity insurance.

---

## 9. Post-V1 Immediate Priorities

Not for v1 build, but first 2–3 months after launch:

- User feedback aggregation and triage.
- Performance monitoring and optimization.
- Content gap analysis from real usage.
- Bug fixes and stability improvements.
- Observability improvements.
- Decision point at 4-week pilot window: continue? Iterate? Pivot?
- Decision point at 3-month mark: plan for v1.5 (respiratory content, exam mode).

---

## Appendix A — Tech Stack Reference

**Frontend:** Next.js 14+ App Router, TypeScript strict, Tailwind, shadcn/ui.
**State:** Zustand (client), TanStack Query (server).
**Backend:** Next.js API routes.
**Database:** Supabase (managed Postgres with RLS).
**Auth:** Supabase Auth (email/password in v1).
**Storage:** Supabase Storage.
**Offline:** IndexedDB via Dexie, next-pwa plugin.
**AI:** Anthropic Claude SDK direct.
**Deployment:** Vercel.
**Email:** Resend.
**Monitoring:** Sentry, PostHog, Vercel Analytics.
**Testing:** Vitest, Playwright, axe-core.
**Content:** Structured markdown in Git repo.

## Appendix B — Key Prompts (Developed and Version-Controlled)

Critical AI prompts developed and stored in repository with test cases:

- Self-explanation grading prompt (handles Hinglish, abbreviations; rubric-based Green/Yellow/Red).
- Content authoring prompts (layers, questions, hints, misconceptions).
- Periodic content audit prompt.
- Adaptive remediation prompt.

Prompts include explicit test cases with expected outputs.

## Appendix C — Change Log

**Version 1.1** — Revisions incorporating feedback from four external reviews.

Key changes from v1.0:
- Reframed as pilot for author's own students (not general product launch).
- Removed content admin interface from v1 scope (markdown in repo instead).
- Phase 0 produces one gold-standard mechanism as reference before Phase 1 begins.
- Offline foundation moved to Phase 2, before features depend on it (sequencing fix).
- Extended offline/PWA phase to 4 weeks total with 100-cycle sync gate.
- Added explicit grading rubric (Green/Yellow/Red) with false-positive budget <5%.
- Grading test set increased to 200+ responses with Hinglish and localization.
- Added dispute mechanism for AI grades.
- Added MVP cut line section with explicit order of cuts.
- Legal phase starts earlier (Week 10) given multi-week turnaround.
- Reframed success criteria: v1 measures leading indicators, not durable retention (which requires month 14+ data).
- Removed pricing and subscription mechanics from v1 (pilot is free for author's students).
- Single-author content workflow in pilot; two-reviewer when scaling.
- Team testing phase added before launch.

**Version 1.0** — Initial V1 Build Specification.

---

**End of V1 Build Specification v1.1**
