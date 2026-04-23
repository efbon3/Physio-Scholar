# Physiology PWA — Roadmap

**Version 1.0**

This document defines what comes after v1 — the sequence of versions that build on the student-core MVP toward a full institutional product. It is a working roadmap, not a commitment; priorities shift based on what we learn from v1 users and from institutional conversations.

For what v1 is, see the V1 Build Specification. For design principles, see the Vision and Design Document.

---

## 1. Roadmap Philosophy

Three principles govern what goes into which version:

**Ship narrower, deeper, earlier.** Each version does fewer things exceptionally well, rather than many things adequately. Width grows across versions, not within them.

**Real usage teaches priorities.** Roadmap items past v1.5 are hypotheses, not plans. As v1 users reveal what actually matters, earlier versions of this document become wrong. Expect and welcome that.

**Institutional value is built in stages, not in one release.** Going from student-only (v1) to full institutional product (v2) is a multi-step process. Each step must be independently useful — v1.5 is not a halfway-broken v2.

---

## 2. Version Summary

**v1** — Student core. Cardiovascular content. 10–15 mechanisms. Individual students only. Manual billing. Covered in V1 Build Specification.

**v1.5** — Production polish. Adds phone auth, Google Sign-In, exam mode, Razorpay billing, full accessibility audit. Expands to respiratory system content. No faculty features yet.

**v2** — Faculty and institutions. Faculty UI for assignments and analytics. Institutional admin role. Schedule integration with file import. Remaining organ systems content. First institutional customers go live.

**v2.5** — Operational scale. Multi-tenant refinements. Automated content maintenance. Expanded analytics.

**v3** — Advanced learning features. FSRS scheduler upgrade. Concept maps. Interactive simulators for high-value mechanisms. Exam-pattern sophistication.

**v4+** — Expansion. Adjacent subjects, API platform, international markets, potential native apps.

---

## 3. V1.5 — Production Polish

**Target timeline:** 3–4 months after v1 launch.

**Primary goal:** Move from pilot-quality to production-quality for independent student users. Establish the operational foundation for v2's institutional push.

### 3.1 V1.5 Scope

**Authentication expansion.**
- Phone number with OTP authentication (common Indian preference).
- Google Sign-In.
- Account recovery for users who lose access to both email and phone.

**Content expansion.**
- Respiratory system complete: approximately 15–20 mechanisms.
- Running total: 25–35 mechanisms.
- Authored and reviewed in parallel with engineering work.

**Exam mode.**
- Layer 1 summaries at high velocity (rapid review mode).
- Timed MCQ drills in exam patterns (initially generic pattern; NEET-PG/INI-CET/USMLE-specific calibration in v2).
- New content blocked from entering SRS during exam mode window.
- Exam-proximity behavior: within 14 days of a student-declared exam date, SRS weights exam content higher.

**Billing automation.**
- Razorpay integration for recurring subscriptions.
- Monthly and annual plans.
- Payment failure handling.
- Receipt and invoice generation with GST.
- Subscription state synchronization between Razorpay and app database.

**Accessibility full audit.**
- Specialist accessibility audit.
- All identified issues resolved.
- Documented compliance for institutional procurement.
- Advanced features: dyslexia-friendly font option, high-contrast mode.

**Content admin improvements.**
- Bulk operations (import draft batches, tag multiple items).
- Improved review queue workflow.
- AI-assisted quarterly audit tooling.
- Content analytics (which mechanisms/questions are most/least performing).

**Platform admin improvements.**
- User search across all users.
- Better subscription management interface.
- Audit log viewer.
- Basic institutional setup (still manual but faster).

**Faculty read-only view (preview).**
- Faculty role users can log in and see the student view (useful for faculty considering recommending the app).
- No assignment creation yet.
- No class management yet.

### 3.2 V1.5 Acceptance Criteria

- Phone/OTP and Google Sign-In work end-to-end.
- Exam mode functional with at least 50 exam-pattern questions per organ system covered.
- Razorpay processes subscriptions correctly including renewals and cancellations.
- Accessibility audit complete with report available.
- Respiratory system content complete with two-reviewer signoff.
- Faculty preview access works without security issues.

### 3.3 V1.5 Out-of-Scope

- Full faculty tools (v2).
- Institutional admin (v2).
- Schedule features (v2).
- File import (v2).
- Remaining organ systems beyond respiratory (v2).

---

## 4. V2 — Faculty and Institutions

**Target timeline:** 6–9 months after v1.5.

**Primary goal:** Enable first institutional customers. Faculty experience operational. Institutional admin flows functional.

### 4.1 V2 Scope — Faculty Tools

**Assignment system.**
- Faculty creates assignments by selecting mechanisms or specific questions.
- Assign to full class or specific students.
- Set deadlines.
- Assignments inject cards into student SRS queues with deadline markers (per design).
- Real-time completion and performance visibility.
- AI first-pass grading on free-text submissions.
- Faculty review-and-override on AI grades.
- Grade reports exportable.

**Class analytics.**
- My Classes view with roster.
- Per-student engagement (traffic light) and retention metrics.
- Topic heatmap: organ systems × mechanisms heat-shaded by class-average mastery.
- Per-student aggregate details (no individual wrong-answer visibility on practice — only on assignments per design principles).

**Faculty annotations.**
- Faculty attach notes to mechanisms.
- Notes visible to that faculty's students when studying the mechanism.
- Creates local pedagogical wisdom layer on top of core content.

**Faculty content authoring (optional).**
- Faculty can propose content additions or changes.
- Goes through standard two-reviewer workflow.
- Faculty who contribute content can be credited (optional).

### 4.2 V2 Scope — Institutional Admin

**Institutional admin role activated.**
- Manages one institution.
- User management: add/remove/deactivate students and faculty.
- Bulk user import from CSV or Excel.
- Institutional settings configuration.

**Academic calendar.**
- Institution-level events (term dates, holidays, institutional exams).
- Scaffold within which faculty build their teaching schedules.

**Subscription and billing.**
- View current subscription, renewal dates, seat counts.
- Upgrade/downgrade flows.
- Invoice history.

**Branding.**
- Institution logo.
- Display name.
- Light color customization (not full white-labeling).

**Content access configuration.**
- Institution can choose which organ systems are available to its students.
- Useful for colleges that phase content over their curriculum calendar.

### 4.3 V2 Scope — Schedule System

**Events model.**
- Unified events table covering lectures, practicals, exams, assignment deadlines, holidays, institutional events.
- Mechanism tagging on events makes them pedagogically active.

**Faculty schedule management.**
- Month and week calendar views.
- Create, edit, bulk operations.
- ICS and CSV export.

**Schedule import via AI extraction.**
- Upload file: Excel, Word, PDF, image, photo of printed schedule.
- AI processes and extracts structured events.
- Review interface with side-by-side source and extracted events.
- Inline editing of extracted data.
- Publish to institution's schedule.

**Schedule-aware student experience.**
- Today dashboard includes schedule-derived prompts.
- Mechanism pages show schedule context ("Taught Oct 15").
- Schedule notifications (evening before a class on a mechanism).
- Exam events automatically activate exam mode in the two weeks leading up to them.

### 4.4 V2 Scope — Content Expansion

- Complete curriculum coverage: 180–220 mechanisms total across all organ systems.
- Renal, endocrine, GI, nervous, reproductive, integrative systems fully authored.
- Authoring continues in parallel with engineering throughout v2.

### 4.5 V2 Scope — Other Improvements

**NEET-PG / INI-CET / USMLE pattern calibration in exam mode.**
- Students select target exam.
- Exam mode drills are calibrated to that exam's question patterns.
- Analysis of past papers (not reproduction) informs calibration.

**Variable manipulation simulators for 12–15 high-value mechanisms.**
- Frank-Starling slider with live stroke volume and pressure-volume loop.
- V/Q matching simulator.
- Nephron handling simulator.
- Baroreceptor reflex simulator.
- Endocrine feedback loops (several).
- Acid-base compensation simulator.
- Others as identified during v1 and v1.5 usage.

**AI-assisted content auditing operational.**
- Quarterly AI review of content bank.
- Flags inconsistencies, stale content, underperforming questions.
- Faculty reviews and acts on flags.

**Concurrent session handling.**
- Graceful handling when a student's session is active on two devices.
- Sync conflict resolution for edge cases.

### 4.6 V2 Launch Strategy

**Institutional pilots first.** Two to three pilot institutions onboarded during v2 development or immediately after. Pilot pricing (₹100–300/student/year). Intensive support. Case studies generated.

**Expanded sales after pilots.** Months 6–12 after v2 launch: 15–30 institutions, 3,000–7,500 students.

### 4.7 V2 Acceptance Criteria

- Faculty can create, assign, and grade an assignment end-to-end.
- AI grading first-pass is accepted or overridden by faculty; workflow is efficient.
- Topic heatmap accurately reflects class performance.
- Institutional admin can onboard a new institution with users in under 30 minutes.
- Schedule import from Excel produces usable extracted events that faculty reviews and publishes.
- Exam mode with exam-pattern calibration is distinguishable from regular review mode in student feedback.
- At least 2 pilot institutions successfully deployed with positive reported outcomes.
- All acceptance criteria from v1 continue to pass.

---

## 5. V2.5 — Operational Scale

**Target timeline:** 3–6 months after v2.

**Primary goal:** Make the institutional product maintainable at scale. Address the operational realities that emerge once multiple institutions are live.

### 5.1 V2.5 Scope

**Multi-tenant refinements.**
- Based on real institutional feedback: what configuration options institutions actually need.
- Performance tuning for multi-institution workloads.
- Cross-institution reporting for platform admin.

**Automated content maintenance.**
- Student-flagged content automatically routed to appropriate reviewers.
- Performance-driven question revisions: questions with anomalous performance patterns automatically queued for review.
- Content freshness tracking: mechanisms not reviewed in X months auto-flagged.

**Expanded analytics.**
- Institutional dashboards: aggregate metrics across a college's students.
- Longitudinal retention analysis.
- Comparative analytics across institutions (anonymized).
- Per-mechanism difficulty calibration based on real performance data.

**Support tooling.**
- Support ticket system integration.
- Tiered support workflow.
- User impersonation (with consent and audit) for debugging.
- Bulk communication tools for institutional announcements.

**Institutional operations automation.**
- Self-service institutional signup for smaller institutions.
- Automated onboarding flows.
- Template institutional contracts.

### 5.2 V2.5 Acceptance Criteria

- At least 5 institutional customers using the platform.
- Automated content maintenance reduces faculty review burden by measurable amount.
- Support response times within SLA without heroic manual effort.
- Self-service institutional signup successfully onboards at least one institution without platform admin intervention.

---

## 6. V3 — Advanced Learning Features

**Target timeline:** 6–9 months after v2.5.

**Primary goal:** Deepen the learning features based on what real student data reveals. This is where novel pedagogical innovations move from idea to product.

### 6.1 V3 Scope

**FSRS scheduler upgrade.**
- Replaces SM-2 with FSRS.
- Uses accumulated student review data to tune parameters.
- Domain-specific extensions:
  - Mechanism dependency awareness (struggling with Frank-Starling auto-resurfaces cardiac output cards).
  - Exam-proximity scheduling (shorter intervals near declared exam dates).
  - Layer-specific intervals (Layer 1 longer, Layer 3 shorter).

**Concept maps.**
- Scaffolded concept mapping exercises.
- Students build mechanism relationships explicitly.
- Semi-structured: center vignette, left causes, middle mechanisms, right manifestations.
- Guided and advanced modes.
- Used in the "Connect" step of the learning loop (currently scaffolded as simpler links).

**Comprehensive simulators.**
- Beyond v2's 12–15, expand to 25–30 interactive simulators.
- Interactive explorations of dynamic physiological systems.
- Used in Layer 2 and Layer 3 content where applicable.

**Sophisticated exam mode.**
- Mock exam sessions timed and formatted like the real thing.
- Performance predictions based on current mastery.
- Gap analysis: "you're weak on these topics for NEET-PG."
- Custom drills targeting identified gaps.

**Student roster imports from institutional systems.**
- Integration hooks for institutional student information systems.
- Syncing enrollment changes automatically.

**Advanced faculty analytics.**
- Teaching effectiveness metrics: which lectures correlate with mastery improvements.
- Intervention impact analysis: did the assignment on renal physiology actually help.
- Comparative views (with appropriate anonymization).

### 6.2 V3 Acceptance Criteria

- FSRS produces retention outcomes equal to or better than SM-2 in controlled comparison.
- Concept maps used by at least 30% of active students weekly.
- Simulators rated as valuable by students in user feedback.
- Exam mode calibration produces meaningfully differentiated experience for different target exams.

---

## 7. V4 and Beyond

These are directional, not committed. The shape of v4+ depends heavily on what we learn from v1 through v3.

### 7.1 Possible Directions

**Adjacent subjects.** If physiology model proves out strongly, expansion to biochemistry, pathology, or pharmacology becomes possible. Same core architecture; different content. This is the highest-value expansion if the product works.

**International expansion.** Medical education markets beyond India (Nepal, Bangladesh, parts of Africa using similar curricula; USMLE-focused students in multiple countries). Localization of content and interface as needed.

**API platform.** For institutions wanting integration with their own LMS or information systems. Enables larger institutional deals and potential partnerships.

**Native mobile apps.** If PWA proves insufficient for some use case — perhaps deep Android integration features or iOS-specific requirements — native apps become worth considering. The bar is high; PWA is serving the current needs well.

**Advanced AI features.**
- Personalized tutoring conversations.
- Dynamic question generation based on student weaknesses.
- AI-powered content creation acceleration.

**Certification and accreditation.**
- Partnership with NMC or regional bodies for recognized learning credentials.
- Continuing medical education integration.

**Community features.**
- Study groups within and across institutions.
- Peer discussion forums (carefully designed to avoid the failure modes most medical student forums have).

### 7.2 Directions We Will Likely Never Pursue

**Gamification beyond streaks.** XP, badges, leaderboards, achievement systems. Philosophically misaligned with the product.

**General MBBS exam prep.** Competing with Marrow and PrepLadder on their home turf. We stay specialized.

**Student-to-student content sharing.** Quality control risk is too high; institutional context is preferable.

**Free forever model.** Sustainable business requires paid customers.

**Ad-supported tier.** Privacy implications inconsistent with our positioning.

---

## 8. Operational Evolution

### 8.1 Team Growth

**Through v1.5:** Solo operator with Claude Code plus part-time faculty authors (3–5).

**Through v2:** Add part-time content coordinator (possibly the lead faculty author transitioning to a coordinator role). Possibly part-time designer/front-end help.

**Through v2.5:** First full-time hire — likely content lead or operations lead depending on which bottleneck is more pressing.

**Through v3:** Small team of 4–6 people. Mix of engineering, content, operations, and sales.

**Beyond v3:** Scale-dependent. Product-market fit validated by this point; team growth driven by unit economics.

### 8.2 Financial Evolution

**V1 period:** Pre-revenue or very low revenue. Operating costs under ₹50,000/month. Bootstrap-viable.

**V1.5 period:** First meaningful revenue from individual subscribers. Approximately break-even on monthly operating costs.

**V2 period:** Institutional revenue begins. Approaching break-even including founder compensation.

**V2.5 period:** Profitability with manageable growth investment.

**V3 period:** Unit economics proven; decision point on fundraising or continued bootstrap.

### 8.3 Content Evolution

**V1:** 10–15 mechanisms, cardiovascular only.

**V1.5:** 25–35 mechanisms, cardiovascular + respiratory.

**V2:** 180–220 mechanisms, complete curriculum.

**V2.5:** Maintenance and quality improvements on the full curriculum. Continuous updates.

**V3:** 250+ mechanisms as coverage deepens. Possible expansion to adjacent subjects begins.

### 8.4 Infrastructure Evolution

**V1–V1.5:** Vercel + Supabase default configuration. No dedicated infrastructure.

**V2:** Upgrade to Supabase Pro as institutional data volume grows. Add dedicated caching if needed.

**V2.5:** Possibly split certain services if scale demands. Observability infrastructure upgraded.

**V3+:** Architecture review as scale demands. Possible read replicas, dedicated background job infrastructure, CDN optimization.

---

## 9. Decision Points

Specific moments where decisions will be made based on real data:

### 9.1 After V1 Launch (3 months post-launch)

- Are individual users retaining and paying? Go/no-go signal for v1.5 investment.
- Is the content production workflow sustainable? Adjust v1.5 content plans.
- What do users actually want that we didn't build? Informs v1.5 scope.

### 9.2 After V1.5 Launch (3 months post-launch)

- Are institutional conversations productive? Go/no-go signal for v2 institutional focus.
- Is billing automation working smoothly? Revenue confidence check.
- Are accessibility and compliance sufficient for institutional procurement?

### 9.3 After V2 Pilot Deployments (6 months post-v2 launch)

- Are pilot institutions seeing value? Case study material.
- What institutional features are essential vs nice-to-have? Refines v2.5 scope.
- Is pricing right for institutional segment?

### 9.4 After V2.5 (6 months post-v2.5 launch)

- Is unit economics profitable? Decision on funding strategy.
- Is team composition right for the scale? Hiring decisions.
- What's the next-most-valuable content area (adjacent subject, depth, or simulators)?

### 9.5 Ongoing Decision Criteria

**Add a feature when:** multiple users have requested it, the core product is stable enough to handle additional complexity, we have capacity to build it well.

**Defer a feature when:** it's a "nice to have" that doesn't address a specific user pain, we're stretched on existing priorities, the feature's long-term value is unclear.

**Cut a feature when:** usage data shows it's ignored, maintenance cost exceeds value, it introduces complexity disproportionate to benefit.

---

## 10. Risks to the Roadmap

### 10.1 Strategic Risks

**Risk: Individual subscriptions don't scale.** The bet that independent MBBS students will pay is not guaranteed. If v1 and v1.5 don't produce meaningful individual revenue, institutional sales must carry the business, which changes everything.

Mitigation: early validation via pre-v1 landing page or pilot signups. Willingness to pivot business model if individual signal is weak.

**Risk: Institutional sales cycle longer than projected.** 6-month sales cycles may be more like 12–18 months for Indian medical colleges. This delays revenue substantially.

Mitigation: start institutional conversations during v1 development. Maintain individual user revenue as sustaining foundation. Consider grant funding to extend runway if needed.

**Risk: Competitor launches similar product.** Marrow or PrepLadder could launch a competing physiology-specific product using their established distribution.

Mitigation: move fast, differentiate on depth and pedagogy, build switching costs via content quality and institutional integration.

**Risk: Regulatory changes.** DPDPA enforcement evolution, NMC educational technology guidelines, or medical education reforms could affect requirements.

Mitigation: stay current with regulatory landscape. Relationships with medical education bodies. Legal counsel retained for updates.

### 10.2 Execution Risks

**Risk: Founder burnout.** Solo building for 9+ months to v1 is intense; multi-year roadmap compounds this.

Mitigation: sustainable pace over sprint. Early hiring when justified by revenue. Accountability partner or advisor for perspective.

**Risk: Content production never reaches sufficient scale.** If authoring 200+ mechanisms proves impossible with available faculty resources, v2 content goals fail.

Mitigation: multiple content team members, not single point of failure. Contract content authors as backup. Willingness to extend timeline rather than compromise quality.

**Risk: Technical debt from solo AI-assisted development compounds.** Months of Claude Code-assisted code without professional engineering review can produce subtle problems.

Mitigation: disciplined testing. Occasional external engineering review (paid consultant for spot checks). Refactoring time built into each version.

### 10.3 Product Risks

**Risk: Students don't engage with the forced rating, finding it annoying despite our design.**

Mitigation: monitor session completion rates. Ready to adjust if data shows widespread abandonment at rating step. Softer variants tested in pilot.

**Risk: AI grading produces too many false negatives in natural language.**

Mitigation: extensive testing before launch. Continuous monitoring. Student feedback channel specifically for grading disputes.

**Risk: Content quality drift as volume grows.**

Mitigation: maintain two-reviewer signoff discipline. Quarterly AI audits. Student flagging with prompt response.

---

## 11. Communication and Governance

### 11.1 How This Document Evolves

**Quarterly review.** Founder plus any team members review the roadmap quarterly. Adjust based on learning.

**After major releases.** Full roadmap revision after each version launch, incorporating lessons learned.

**Emergency updates.** If a major external change (regulatory, competitive, market) invalidates assumptions, roadmap gets updated promptly.

### 11.2 Sharing With Stakeholders

**Internal (founder + team):** Full detail.

**Faculty authors:** Relevant sections on content plans and timelines.

**Pilot institutions:** High-level version summary for the versions affecting them.

**Potential customers:** Selective sharing of what's coming when — never over-promising.

**Never shared publicly:** Business specifics, competitive responses, pricing strategy details.

### 11.3 Decision-Making Principles

For decisions covered by this roadmap: founder decides, consulting collaborators.

For decisions not covered: add them to the roadmap or explicit "out of scope" noted, with rationale.

For reversals of previous decisions: document the reasoning in the change log. Decision-making should learn from experience.

---

## 12. Change Log

**Version 1.0** — Initial roadmap document. Supersedes the future-version sections of the comprehensive plan.

Key differences from comprehensive plan:
- Extended timeline reflecting realistic solo development with content production lead time.
- Added v1.5 as an explicit intermediate version rather than jumping v1 to v2.
- Clearer boundaries between versions (each is independently useful).
- Explicit decision points based on real data.
- More realistic framing of institutional sales timelines.

---

## Appendix — Quick Reference

**v1** (launched 9–10 months in): Students, cardiovascular, 10–15 mechanisms, manual billing.

**v1.5** (v1 + 3–4 months): Respiratory content, exam mode, phone auth, Google auth, Razorpay, accessibility audit.

**v2** (v1.5 + 6–9 months): Faculty tools, institutional admin, schedules, file import, full curriculum content.

**v2.5** (v2 + 3–6 months): Operational scale, automated maintenance, expanded analytics.

**v3** (v2.5 + 6–9 months): FSRS, concept maps, simulators, sophisticated exam mode.

**v4+:** Adjacent subjects, international, API platform, possible native apps.

Total time from project start to v2 institutional-ready product: approximately 22–26 months.

This is longer than the initial comprehensive plan suggested. It is honest about what solo building plus content production plus institutional sales realistically takes. Shorter timelines compromise quality in ways that undermine the strategic positioning.

---

**End of Roadmap v1.0**
