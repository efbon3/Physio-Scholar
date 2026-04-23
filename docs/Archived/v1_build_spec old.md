# Physiology PWA — V1 Build Specification

**Version 1.0**

This document defines what v1 is, what v1 is not, and how we know when v1 is done. It is the direct reference for implementation. Claude Code builds from this document; everything outside it is deferred.

For design principles and product philosophy, see the Vision and Design Document. For future phases, see the Roadmap.

---

## 1. V1 Definition

### 1.1 V1 in One Paragraph

V1 is a progressive web app delivering the core learning loop for 10–15 physiology mechanisms covering cardiovascular system fundamentals. Individual students can sign up, complete daily SRS-scheduled review sessions with active recall, hint ladders, and forced metacognitive rating, receive elaborative misconception-aware feedback on wrong answers, write self-explanations graded by AI, and track their own progress over time. The app works offline after initial content download. Payment is manual (bank transfer or UPI); subscription state is manually maintained. No faculty features, no institutional tools, no schedule integration — these come in v1.5 and v2.

### 1.2 V1 Goals

**Primary:** Prove the core learning loop produces durable retention in real students.

**Secondary:** Establish content authoring workflow with faculty collaborators at sustainable velocity.

**Tertiary:** Validate willingness-to-pay among independent student users.

### 1.3 V1 Non-Goals

Not demonstrating institutional product-market fit (v2 goal).
Not establishing a production sales pipeline (v2 goal).
Not having a polished admin or faculty experience (v2 goal).
Not covering full physiology curriculum (v2/v3 goal).
Not automated billing at scale (v1.5 goal).

### 1.4 Timeline

**Content production:** Starts 2 months before engineering. Target: 10 mechanisms fully authored and reviewed by the time engineering is ready to consume them.

**Engineering v1:** 5–6 months focused solo development with Claude Code.

**Pre-launch beta:** 4 weeks with 10–15 pilot students.

**V1 launch:** Limited launch to 50–100 invited students.

Total from project start to v1 launch: approximately 9–10 months including content lead time.

This is longer than the original 3–4 month estimate, honestly acknowledged. Attempting shorter compromises quality in ways that undermine the pedagogical goals.

---

## 2. V1 Scope — What Ships

### 2.1 Users and Access

**Authentication.**
- Email and password signup/login.
- Email verification required.
- Password reset via email link (30-minute token).
- Account lockout after 5 failed attempts in 15 minutes.
- Session tokens expire after 30 days of inactivity.

**Not in V1:** Phone/OTP auth, Google Sign-In, institutional SSO. Email-only keeps the auth surface simple.

**Roles.** Student, Platform Admin. Faculty role exists in the data model but has no UI in v1 — faculty read-only view comes in v1.5.

**Subscription tiers.** Free and Individual Student only. Institutional tiers exist in data model but are not used in v1.

**Free tier limits.** Layer 1 and 2 access for cardiovascular mechanisms. SRS limited to 20 active cards. No self-explanation AI grading. All other features work on available content.

**Individual Student tier.** Full access to all v1 content (10–15 cardiovascular mechanisms), all four layers, unlimited SRS, self-explanation grading, full progress features.

### 2.2 Content

**Scope:** 10–15 mechanisms covering cardiovascular system fundamentals. Examples (exact list determined by content team):

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
- ECG basics (one or two mechanisms worth, not comprehensive ECG interpretation)
- Cardiac ion channels and action potentials
- Autonomic cardiac control
- Coronary circulation
- Response to exercise

**Per-mechanism contents.**
- All four content layers (Core, Working, Deep Dive, Clinical Integration).
- 6–10 questions at varied Bloom's levels and types.
- Three-tier hint ladder per question.
- Misconception mappings per question.
- At least one diagram (SVG preferred for scalability).
- Tags: organ system, NMC competency, exam pattern relevance, Bloom's distribution.

**Content quality gates.**
- Authored by faculty with AI draft assistance.
- Reviewed by a second faculty member.
- Approved by content lead before publish.
- Every mechanism fully complete (no partial content shipping).

### 2.3 Student Experience

**Navigation.** Three tabs: Today, Systems, Progress.

**Today dashboard.**
- Greeting with student name.
- Review queue count (e.g., "12 cards due today").
- Primary action button: "Start review."
- Streak indicator (days in a row with review completed).
- One weak area callout if applicable.
- One clinical challenge link (if Layer 4 content available).

**Systems tab.**
- List of organ systems.
- V1 shows only Cardiovascular; future systems gray with "Coming soon" labels (demonstrates the product's scope to users).
- Click into cardiovascular → list of mechanisms in that system.
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
- Four-button rating (Again, Hard, Good, Easy) — required to advance.
- Transitions under 200ms perceived latency.

**Review session flow.**
- Starts with queue assembled from SRS (due cards + new cards introduced according to limits).
- Each card follows six-step loop.
- Session ends when queue is empty or student pauses.
- Session summary on completion: cards reviewed, rough retention percentage, next due.

**Learn mode.**
- Launched from a mechanism page.
- Full six-step loop without time pressure.
- Self-explanation is required (not optional).
- On completion, cards from that mechanism enter the student's SRS schedule.

**Progress tab.**
- Retention curve (visualized over time).
- Mastery percentage by mechanism (since only one system in v1, this shows per-mechanism detail).
- Streak history.
- Weekly metacognitive calibration report (shown starting week 2).
- Study time aggregates.

### 2.4 Forced Rating Behavior

Rating is required before advancing to the next card in a session. Specifically:

**Required:** A student cannot see the next card without rating the current one. The rating buttons are the only forward path.

**Not required:** The student can tab away, close the app, answer a phone call, or let the screen sleep. When they return, they see the same card and the same rating prompt. No tab-switch forcing, no page visibility API traps.

**Time decay.** If a card remains unrated for 24 hours, it auto-rates as "Again" and scheduling continues. This prevents stalled-session dead ends.

**Pause.** The student can pause the entire session at any time. The current card remains unrated until the session resumes or the 24-hour auto-rate kicks in.

**Minimum 2-second delay** before rating buttons become active, preventing reflexive taps.

**Flat emotional tone.** No celebration on "Easy," no failure messaging on "Again." All ratings are neutral data.

### 2.5 Hint Ladder

Three tiers per question:

- **Hint 1:** Conceptual nudge. Points toward the relevant framework without specifics.
- **Hint 2:** More specific. Identifies the key concept involved.
- **Hint 3:** Approaches the answer. Gives the structure of the answer without stating it directly.

Hints are opt-in — the student must request them. Each hint tap is logged for metacognitive analysis.

After hint 3, the "Show answer" button becomes the path forward.

### 2.6 Self-Explanation Grading

After the student commits an answer and sees the reveal, they type (or paste) their explanation of the mechanism in their own words.

AI grades for mechanism presence:
- Did the student identify the correct causal chain?
- Are the key concepts mentioned?
- Are there any red-flag misconceptions in the explanation?

Output is one of: "Well explained" (green), "Partially correct" (yellow, with specific feedback on what's missing or ambiguous), "Missing the mechanism" (red, with pointer back to the correct model).

**Critical requirement:** Grading prompts must be tested against Hinglish and localized medical language before v1 launch. Test set of 50+ sample responses mixing English with Hindi/regional terms and Indian medical abbreviations. Grader must not penalize natural code-switching.

In free tier, self-explanation is disabled (shown as a paid feature).

**Queueing for offline.** Self-explanations submitted offline are stored locally and sent for grading when connectivity returns. The student sees "Grading when online" status and receives the result asynchronously.

### 2.7 SRS Scheduler (SM-2 with modifications)

SM-2 algorithm, implemented as pure function with comprehensive test coverage.

**Initial parameters.**
- New card default ease factor: 2.5.
- Minimum ease factor (floor): 1.5 (modified from standard 1.3).
- Intervals after rating: Again → 1 minute (same session) then 1 day, Hard → current interval × 1.2, Good → current interval × ease, Easy → current interval × ease × 1.3.
- Ease adjustments: Again -0.2, Hard -0.15, Good no change, Easy +0.15.

**Leech detection.** Cards failed 5 consecutive times are flagged. Student is prompted:
- "Review the full mechanism" (opens Learn mode for that mechanism).
- "Suspend this card" (removes from active queue, kept in leech list).
- "Continue trying" (stays in queue).

**New card introduction rate.** Default 10 new cards per day, student-configurable from 5 to 20.

**Daily review limits.** No hard cap on reviews (student does all due), but session length is time-bounded at 30 minutes with option to extend.

**Test coverage.** 100% coverage on scheduler function against reference outputs. Edge cases explicitly tested:
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
- Install prompt surfaced contextually (after 3+ sessions, not on first visit).

**Progressive content download.**
- Initial install: 5 MB app shell.
- Cardiovascular content pack: 15–25 MB, prompted for download on first session.
- Student on metered connection can defer pack download; free-tier-accessible content loads on demand.

**What works offline.**
- App shell.
- Downloaded content (mechanisms, questions, hints, explanations).
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
- Subscription operations.

**Sync strategy.**
- Local-first writes via IndexedDB (Dexie wrapper).
- Background sync queue when online.
- Student ratings and reviews are each student's own data — effectively non-conflicting.
- Cross-device conflicts resolved by server timestamp with basic vector clock for tie-breaking.

### 2.9 Platform Admin Experience

Basic admin interface for operational management. Not polished — functional.

**Users management.**
- List users, search by email.
- View user details: role, subscription, activity.
- Manually set subscription tier and expiry (manual billing).
- Deactivate or delete accounts.

**Content management.**
- List mechanisms, filter by status.
- Create/edit mechanism (all four layers).
- Create/edit questions (with hints, explanations, misconception maps).
- Preview as student.
- Publish/unpublish/retire.
- Version history.

**Content review queue.**
- Drafts awaiting review.
- Review actions: approve, request changes, reject.

**Basic system metrics.**
- Active users last 7/30 days.
- Sessions per day.
- AI calls per day with cost estimate.
- Error rate (from Sentry).

### 2.10 Privacy and Compliance

**DPDPA compliance.**
- Privacy policy drafted with legal counsel review before launch.
- Explicit consent flow at signup covering data collection, processing, retention.
- Granular consent for analytics (per-category opt-out).
- Data export capability (student downloads own data as JSON).
- Data deletion capability (30-day grace period, then actual deletion).
- Grievance officer contact designated.
- Breach notification procedure documented.

**Minor consent handling.**
- Legal consult completed before v1 launch, specifically on minor consent for users aged 17.
- Signup flow handles age appropriately (details depend on legal guidance — likely parental verification flow for under-18 independent users).
- No behavioral tracking of minors beyond what the consent framework permits.

**Content licensing.**
- Copyright memo obtained from specialist lawyer confirming attribution formats for StatPearls, OpenStax, NCBI Bookshelf.
- Every piece of v1 content has clear provenance: original faculty authorship or properly attributed open-access source.

### 2.11 Anti-Abuse Controls (Minimum)

**Watermarking.** Content pages and questions include visible user_id hash watermark in rendered output. Screenshots posted publicly are traceable.

**Rate limiting.** Server-side per-account rate limits:
- Maximum 200 questions served per account per day (prevents bulk scraping).
- Maximum 5 password reset requests per account per day.
- Maximum 10 AI grading calls per student per day (prevents abuse).

**Concurrent session detection.** Sessions from geographically distant IPs within short time windows trigger email verification to the account owner.

**Terms of service.** Explicit prohibition on content redistribution. Account termination as remedy for violation.

### 2.12 Accessibility Baseline

**Required for v1.**
- Keyboard navigation for all interactions.
- Screen reader support with proper ARIA labels on shadcn/ui components (defaults are accessible).
- Color contrast 4.5:1 for body text, verified across design system.
- Visible focus indicators.
- Text scaling to 200% without layout breaking.
- Reduced motion mode respected.
- Dark mode.
- Captions on any audio content (v1 has no audio content).

**Not in V1.** Formal accessibility audit by specialist (v1.5). Advanced features like dyslexia-friendly fonts (v1.5).

**Testing.** axe-core automated accessibility tests in CI. Manual testing on critical flows with screen reader (NVDA or VoiceOver).

---

## 3. V1 Acceptance Criteria

V1 is done when all of the following are demonstrable:

### 3.1 Functional Criteria

- [ ] A new user can sign up via email, verify email, complete onboarding, and start a first learning session within 5 minutes.
- [ ] A student can complete a full review session (6-step loop) for a cardiovascular mechanism with all features working: question, hints, answer reveal, elaborative explanation, self-explanation, rating.
- [ ] The SRS scheduler correctly calculates intervals for at least 50 distinct rating sequences verified against reference outputs.
- [ ] Leech detection triggers at exactly 5 consecutive failures and surfaces the prompt correctly.
- [ ] Self-explanation grading returns results within 15 seconds for online requests, or queues correctly when offline.
- [ ] Self-explanation grading accepts Hinglish and localized medical language without false-negative grading in a test set of 50 varied responses.
- [ ] All 10–15 mechanisms have complete content at all four layers, faculty-authored and reviewed.
- [ ] Progressive content download works: app shell loads in under 5 seconds on 3G, content pack downloads in background on demand.
- [ ] Offline-to-online sync completes without data loss across a test matrix of interruption scenarios.
- [ ] Forced rating allows tab switches, auto-rates at 24 hours, and cannot be bypassed within session.
- [ ] Watermarking appears on all rendered question and content pages.
- [ ] Rate limits trigger correctly at configured thresholds.

### 3.2 Performance Criteria

- [ ] Time to interactive on first load under 3 seconds on 3G.
- [ ] Card transition in session under 200ms perceived latency.
- [ ] Self-explanation grading end-to-end under 15 seconds when online.
- [ ] Database query performance: SRS queue assembly under 500ms for students with up to 500 cards in system.
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1 on all primary pages.

### 3.3 Reliability Criteria

- [ ] Error rate under 0.5% of sessions (measured via Sentry).
- [ ] Zero data loss in sync operations verified across 100+ test sync cycles.
- [ ] Automated daily backups operational and restoration tested.
- [ ] 99.5% uptime over any 30-day window (Vercel SLA covers most of this).

### 3.4 Security and Privacy Criteria

- [ ] RLS policies tested: student A cannot read student B's data under any code path (test suite covers this).
- [ ] RLS policies match stated principles: no hidden permission broadening.
- [ ] Cross-institution data isolation tested (even though v1 has no institutions, the RLS is in place for v2).
- [ ] Privacy policy, terms of service, DPA template deployed and reviewed by legal counsel.
- [ ] Data export: student can download their data as JSON on demand.
- [ ] Data deletion: student can delete account, deletion completes within 30-day grace period, data verified removed from database.
- [ ] Minor consent handling consistent with legal guidance obtained pre-launch.
- [ ] Authentication security: password hashing via Supabase, rate limits on login attempts, session token rotation.

### 3.5 Content Quality Criteria

- [ ] 100% of v1 mechanisms have two-reviewer signoff documented.
- [ ] Every question has hint ladder and misconception map.
- [ ] Every substantive claim in content has traceable source (faculty author or properly attributed open-access reference).
- [ ] Zero known factual errors at launch time.
- [ ] Content flag button works and submissions reach review queue.

### 3.6 User Experience Criteria

- [ ] Pilot users complete at least 3 sessions in first week with over 75% session completion rate.
- [ ] Pilot users report (via feedback) that the app is understandable, works on their phone, and feels usable.
- [ ] Specific pilot user concerns raised are addressed or explicitly deferred with rationale.

---

## 4. V1 Build Sequence

### 4.1 Phase 0 — Content Production Start (Months -2 to 0)

Before engineering begins, content production starts.

- [ ] Recruit 2–3 faculty authors.
- [ ] Draft author agreement (with IP assignment, indemnification, payment terms).
- [ ] Establish authoring workflow using Claude-assisted drafting.
- [ ] Author and review first 3 mechanisms as pilot (refining process).
- [ ] Scale to 10 mechanisms by the time engineering phase 4 begins.

### 4.2 Phase 1 — Foundation (Weeks 1–3)

**Project setup.**
- [ ] Next.js 14+ App Router project initialized.
- [ ] TypeScript strict mode configured.
- [ ] Tailwind and shadcn/ui installed.
- [ ] ESLint, Prettier, pre-commit hooks.
- [ ] Git repository with main branch protection.
- [ ] README with development setup instructions.

**Supabase setup.**
- [ ] Supabase project created.
- [ ] Initial schema migration: users, institutions, subscriptions, sessions.
- [ ] RLS policies on core tables with tests.
- [ ] Database migrations system operational.

**Authentication.**
- [ ] Email/password signup via Supabase Auth.
- [ ] Email verification flow.
- [ ] Password reset flow.
- [ ] Session management with token refresh.

**Infrastructure.**
- [ ] Vercel project connected to GitHub.
- [ ] Preview deployments on pull requests.
- [ ] Production deployment from main branch.
- [ ] Sentry integration for error monitoring.
- [ ] PostHog integration for product analytics.
- [ ] Resend integration for transactional email.

**Testing infrastructure.**
- [ ] Vitest configured for unit tests.
- [ ] Playwright configured for E2E tests.
- [ ] axe-core for accessibility tests.
- [ ] CI runs on every pull request.

### 4.3 Phase 2 — Content Model (Weeks 4–5)

- [ ] Content database schema: mechanisms, questions, hints, misconceptions, versions, tags.
- [ ] Content admin interface: basic CRUD for platform admin.
- [ ] Content serving endpoints with entitlement checks.
- [ ] First mechanism loaded into database as end-to-end proof.
- [ ] Content versioning logic with tests.

### 4.4 Phase 3 — Learning Loop (Weeks 6–9)

- [ ] Card display components (question, attempt field, answer reveal).
- [ ] Hint ladder interface.
- [ ] Rating interface with forced-within-session, pause-allowed, 24-hour-decay logic.
- [ ] SM-2 scheduler as pure function with comprehensive tests.
- [ ] Student card state management.
- [ ] Learn mode end-to-end.
- [ ] Review mode end-to-end with queue assembly.
- [ ] Session summary on completion.

### 4.5 Phase 4 — AI Integration (Weeks 10–11)

- [ ] Claude API integration layer with retry and caching.
- [ ] Self-explanation grading endpoint.
- [ ] Grading prompt tested against Hinglish/localized sample set.
- [ ] Grading queue for offline scenarios.
- [ ] Misconception-aware feedback rendering.
- [ ] Rate limiting on grading calls.

### 4.6 Phase 5 — Today, Systems, Progress (Weeks 12–14)

- [ ] Today dashboard with live data.
- [ ] Systems tab with mechanism list.
- [ ] Mechanism detail page with layer tabs.
- [ ] Progress tab with retention curves, mastery, streaks.
- [ ] Weekly metacognitive calibration report (generated on schedule).

### 4.7 Phase 6 — PWA and Offline (Weeks 15–17)

- [ ] Web App Manifest.
- [ ] Service worker for app shell caching.
- [ ] Progressive content download UI.
- [ ] IndexedDB content caching via Dexie.
- [ ] Offline review sessions working end-to-end.
- [ ] Sync queue for online reconnection.
- [ ] Install prompt contextually surfaced.

### 4.8 Phase 7 — Admin and Polish (Weeks 18–20)

- [ ] Platform admin interface: users, content, review queue, metrics.
- [ ] Watermarking on rendered content.
- [ ] Rate limiting implemented across endpoints.
- [ ] Accessibility baseline verified with axe-core.
- [ ] Manual screen reader testing on critical flows.
- [ ] Performance optimization pass.

### 4.9 Phase 8 — Legal and Compliance (Weeks 18–22, parallel)

- [ ] Privacy lawyer consult on minor consent — recommendations implemented.
- [ ] Copyright lawyer memo on content licensing — attribution format applied.
- [ ] Privacy policy drafted and legally reviewed.
- [ ] Terms of service drafted and legally reviewed.
- [ ] DPDPA compliance checklist completed.
- [ ] Grievance officer designated and contact published.

### 4.10 Phase 9 — Beta Testing (Weeks 22–25)

- [ ] Closed beta with 10–15 invited pilot students.
- [ ] Daily monitoring of sessions, errors, feedback.
- [ ] Weekly check-ins with pilot users.
- [ ] Rapid iteration on critical issues.
- [ ] Bug list managed, critical bugs fixed, others deferred or documented.

### 4.11 Phase 10 — V1 Launch (Weeks 26+)

- [ ] Launch readiness checklist complete (see section 5).
- [ ] Opening limited launch to 50–100 students.
- [ ] Daily monitoring.
- [ ] Support email staffed.
- [ ] Post-launch iteration based on real usage.

---

## 5. V1 Launch Readiness Checklist

Final gate before opening access to real users:

### 5.1 Engineering

- [ ] All acceptance criteria in section 3 verified.
- [ ] Test coverage: 100% on critical paths (scheduler, RLS, entitlement, grading).
- [ ] Zero known critical bugs.
- [ ] Performance targets met.
- [ ] Error monitoring and alerting operational.
- [ ] Database backups automated and restoration tested.
- [ ] Production deployment pipeline verified.
- [ ] Rollback procedure documented and tested.

### 5.2 Content

- [ ] All planned mechanisms published with two-reviewer signoff.
- [ ] Content flag mechanism operational.
- [ ] Content admin comfortable with ongoing maintenance workflow.

### 5.3 Legal

- [ ] Privacy policy published.
- [ ] Terms of service published.
- [ ] DPDPA compliance verified.
- [ ] Copyright compliance verified with memo from legal counsel.
- [ ] Minor consent handling verified with privacy counsel.
- [ ] Grievance officer designated.

### 5.4 Operations

- [ ] Support email address live and monitored.
- [ ] In-app feedback form operational.
- [ ] Initial FAQ documented.
- [ ] Incident response procedure documented.
- [ ] Manual billing workflow documented and rehearsed.

### 5.5 Communications

- [ ] Landing page live with clear value proposition.
- [ ] Signup flow works end-to-end.
- [ ] Transactional emails tested (verification, welcome, password reset).
- [ ] Pilot users have been briefed on expectations and feedback channels.

---

## 6. V1 Out-of-Scope

Explicitly not in v1. These are noted here so they're not accidentally built:

**Faculty features.** No faculty UI, no assignments, no class analytics, no topic heatmap. Faculty role exists in data model only.

**Institutional features.** No institutional admin UI, no institutional onboarding, no multi-tenant institutional configuration. Institution records can exist in the database but have no active management.

**Schedule features.** No schedule creation, no schedule import, no schedule-aware notifications.

**Other systems.** Only cardiovascular content in v1. Respiratory, renal, and others deferred to v2.

**Practice tab.** Consolidated into Today as a "study ahead" option. No separate Practice tab.

**Exam mode.** Deferred to v1.5. Basic review mode is sufficient for v1.

**Concept maps.** Deferred to v3.

**Interactive simulators.** Deferred to v2.

**Automated billing.** Manual billing (bank transfer, UPI) for all v1 customers. Razorpay integration in v1.5.

**Phone/OTP authentication.** Email only in v1. Phone auth in v1.5.

**Google Sign-In.** Deferred to v1.5.

**Institutional SSO.** Deferred to specific institutional request.

**Internationalization (beyond English).** English only in v1. i18n infrastructure may be scaffolded but not used.

**Advanced search.** Basic filtering only. Semantic search deferred.

**Native mobile apps.** PWA only. Native apps considered in v3+ if PWA proves insufficient.

**FSRS scheduler.** SM-2 in v1. FSRS considered for v2 if retention data justifies.

**Advanced analytics for platform admin.** Basic metrics only in v1.

**API for third-party integration.** No public API in v1.

**Referral or ambassador programs.** Deferred.

**Full WCAG 2.2 AA audit.** Baseline compliance in v1; formal audit in v1.5 before first institutional deployment.

---

## 7. V1 Risks and Mitigations

### 7.1 Critical Risks

**Risk: Content production falls behind schedule.**
This is the most likely failure mode. Mitigation: start content production 2 months before engineering. Dedicated content lead. Weekly content progress tracking. Willingness to trim content scope rather than delay launch.

**Risk: Faculty authors unavailable or slow.**
Mitigation: recruit more authors than minimum needed. Structured authoring workflow reduces per-mechanism time. Backup plan: hire paid contract content authors if institutional faculty insufficient.

**Risk: AI grading quality insufficient or inconsistent.**
Mitigation: extensive prompt testing against varied language use before launch. Continuous monitoring of grading results. Fall back to simpler grading if AI proves unreliable. Faculty override capability (v1.5).

**Risk: Pilot users find app confusing or insufficient.**
Mitigation: small pilot group (10–15) allows intensive user research. Weekly check-ins. Rapid iteration. Willingness to delay broader launch if pilot signals are weak.

**Risk: Timeline slip makes entire project non-viable.**
Mitigation: monthly reassessment of timeline and scope. Willingness to trim scope aggressively rather than extend timeline. Clear criteria for v1 MVP that can be trimmed further if needed.

### 7.2 Technical Risks

**Risk: Offline sync edge cases cause data loss.**
Mitigation: extensive test matrix for sync scenarios. Local-first with server-side reconciliation. Backup of all student data server-side as source of truth.

**Risk: SRS scheduler bugs cause wrong intervals.**
Mitigation: 100% test coverage against reference outputs. Extensive edge case testing. Bug in scheduler is existential — this gets priority attention.

**Risk: PWA caching or service worker bugs break app for users.**
Mitigation: gradual rollout of service worker updates. Fallback to network-first for critical paths. Ability to push cache invalidation remotely.

### 7.3 Legal Risks

**Risk: DPDPA minor consent handling non-compliant.**
Mitigation: legal consult completed before launch. Age verification in signup. Documented compliance process.

**Risk: Content licensing violations from misattribution.**
Mitigation: copyright memo obtained. Attribution format verified and applied. Source traceability required for every piece of content.

**Risk: Medical content accuracy liability.**
Mitigation: two-reviewer signoff. Clear disclaimers in terms of service. Error correction protocol. Investigate professional indemnity insurance.

---

## 8. Post-V1 Immediate Priorities

Not for v1 build, but planned for the first 2–3 months after launch:

- User feedback aggregation and triage.
- Performance monitoring and optimization based on real usage.
- Content gap analysis: what mechanisms do students want next?
- Bug fixes and stability improvements.
- Observability improvements based on what production teaches us.

Then move to V1.5 scope as defined in the Roadmap.

---

## Appendix A — Tech Stack Reference

For Claude Code to reference during implementation:

**Frontend:** Next.js 14+ (App Router), TypeScript strict, Tailwind, shadcn/ui.
**State:** Zustand (client), TanStack Query (server).
**Backend:** Next.js API routes.
**Database:** Supabase (managed Postgres with RLS).
**Auth:** Supabase Auth (email/password in v1).
**Storage:** Supabase Storage.
**Offline:** IndexedDB via Dexie, next-pwa plugin.
**AI:** Anthropic Claude SDK direct.
**Deployment:** Vercel.
**Email:** Resend.
**Monitoring:** Sentry (errors), PostHog (product analytics), Vercel Analytics (web vitals).
**Testing:** Vitest (unit), Playwright (E2E), axe-core (accessibility).

## Appendix B — Key Prompts (To Be Specified)

Critical AI prompts will be specified separately and version-controlled. Placeholders:

- Self-explanation grading prompt (must handle Hinglish, abbreviations).
- Content authoring prompts (layers, questions, hints, misconceptions).
- Quarterly content audit prompt.
- Misconception detection prompt.

These are documented in a separate prompts repository with test cases and version history.

---

**End of V1 Build Specification v1.0**
