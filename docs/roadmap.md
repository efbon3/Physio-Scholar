# Physiology PWA — Roadmap

**Version 1.1**

This document defines what comes after v1 — the sequence of versions that could build on the student-core pilot toward broader deployment if expansion proves worthwhile. It is a working roadmap, not a commitment; priorities shift based on what we learn from the v1 pilot and from any institutional conversations that emerge.

The primary framing: v1 is a teaching tool for the author's own students. Everything after v1 is conditional on the pilot proving that the pedagogical model works, and on expansion becoming genuinely desirable rather than a forced growth trajectory.

For what v1 is, see the V1 Build Specification. For design principles, see the Vision and Design Document. For content authoring workflows, see the Content Production SOP.

---

## 1. Roadmap Philosophy

Three principles govern version progression:

**Expansion is optional.** If the v1 pilot with the author's students works well, v1.5 and beyond are natural next steps. If it doesn't work well, the app's purpose may still have been served — teaching the author's current batch effectively. No obligation to scale.

**Ship narrower, deeper, earlier.** Each version does fewer things exceptionally well, rather than many things adequately. Width grows across versions only when depth is established.

**Real usage teaches priorities.** Roadmap items past v1.5 are hypotheses, not plans. As v1 users reveal what actually matters, earlier versions of this document become wrong. Expect and welcome that.

---

## 2. Version Summary

**v1** — Student pilot. Cardiovascular content. 10–15 mechanisms. Author's own batch. No payment. Content as markdown in repo. Covered in V1 Build Specification.

**v1.5** — Pilot expansion within the author's institution. Adds phone auth, Google Sign-In, basic exam mode, respiratory system content, formal accessibility audit. Still free pilot. Possible expansion to next year's batch if v1 outcomes justify.

**v2** — First external expansion. Other institutions approached. Faculty tools essential features only (assignments, class roster analytics, schedule import). Institutional admin basics. Razorpay billing activated. Remaining organ systems content.

**v2.5** — Operational maturity. Topic heatmap. Faculty annotations. Faculty content authoring. Automated content maintenance. Expanded analytics.

**v3** — Advanced learning features. FSRS scheduler upgrade. Concept maps. Interactive simulators for high-value mechanisms. Exam-pattern sophistication.

**v4+** — Broader expansion. Adjacent subjects, potential international markets, API platform, possible native apps.

---

## 3. V1.5 — Pilot Expansion Within Author's Institution

**Trigger:** V1 pilot with current batch produces positive leading indicators (per Vision Document Section 8.1).

**Primary goal:** Extend proven pilot to more students within the author's institution. Add features needed for broader pilot use.

### 3.1 V1.5 Scope

**Authentication expansion.**
- Phone number with OTP authentication (common Indian preference).
- Google Sign-In.
- Account recovery for users who lose access to both email and phone.

**Content expansion.**
- Respiratory system complete: approximately 15–20 mechanisms.
- Running total: 25–35 mechanisms.
- Content still authored by author alone; two-reviewer signoff introduced when content team expands.

**Exam mode.**
- Layer 1 summaries at high velocity.
- Timed MCQ drills in exam patterns.
- New content blocked from entering SRS during exam mode window.
- Exam-proximity behavior: within 14 days of declared exam date, SRS weights exam content higher.

**Accessibility full audit.**
- Specialist accessibility audit.
- All identified issues resolved.
- Documented compliance for any institutional procurement conversations.
- Advanced features: dyslexia-friendly font option, high-contrast mode.

**Content infrastructure improvements.**
- Evaluate whether to move from markdown-in-repo to a proper content database.
- If yes, build minimal content admin interface.
- If no (single author still sufficient), defer admin UI.

**Platform admin improvements.**
- User search across all users.
- Better subscription management interface (even though billing still not active).
- Audit log viewer.

**Next batch enrollment.**
- If timing aligns, next year's first-year batch uses the app from start of academic year.
- Observations from first batch's experience inform onboarding for second batch.

### 3.2 V1.5 Acceptance Criteria

- Phone/OTP and Google Sign-In work end-to-end.
- Exam mode functional with at least 50 exam-pattern questions per organ system covered.
- Accessibility audit complete with report available.
- Respiratory system content complete with author signoff.
- V1 acceptance criteria continue to pass.

### 3.3 V1.5 Out-of-Scope

- Faculty tools (v2).
- Institutional admin (v2).
- External institution deployment (v2).
- Automated billing (v2).
- Remaining organ systems beyond respiratory (v2).

### 3.4 Pilot Evaluation at End of V1.5

After v1.5 has been used by one or two batches for a full academic year, evaluation happens:

**If pedagogical model works well:** Proceed to v2 with external expansion.

**If model works but expansion seems unnecessary:** Continue maintaining the app for the author's institution indefinitely. This is a legitimate end state.

**If model doesn't work:** Iterate on design or sunset the project. The author's time is better spent elsewhere if the pedagogical hypothesis fails.

---

## 4. V2 — First External Expansion

**Trigger:** V1.5 evaluation justifies expansion, and there is genuine interest from at least one external institution.

**Primary goal:** Enable first external institutional customer or direct expansion to students at other institutions.

### 4.1 V2 Scope — Faculty Tools (Essential Only)

**Assignment system.**
- Faculty creates assignments by selecting mechanisms or specific questions.
- Assign to full class or specific students.
- Set deadlines.
- Assignments inject cards into student SRS queues with deadline markers.
- Real-time completion and performance visibility.
- AI first-pass grading on free-text submissions.
- Faculty review-and-override on AI grades.
- Grade reports exportable.

**Basic class roster analytics.**
- My Classes view with student roster.
- Per-student engagement traffic light and retention metrics.
- Aggregate details at class level.
- No individual wrong-answer visibility on practice (only on assignments — per design principles).

**Note:** Topic heatmap, faculty annotations, and faculty content authoring are deferred to v2.5. The v2 scope focuses on the minimum faculty functionality needed for external institution deployment. This reflects realistic faculty adoption rates (20–30% active use) — start with the tools faculty will actually use first.

### 4.2 V2 Scope — Institutional Admin (Basic)

**Institutional admin role activated.**
- Manages one institution.
- User management: add/remove/deactivate students and faculty.
- Bulk user import from CSV or Excel.
- Institutional settings configuration.

**Academic calendar.**
- Institution-level events (term dates, holidays, institutional exams).

**Subscription and billing.**
- View current subscription, renewal dates, seat counts.
- Invoice history.

**Branding.**
- Institution logo.
- Display name.
- Light color customization.

### 4.3 V2 Scope — Schedule System

**Events model.**
- Unified events table covering lectures, practicals, exams, assignment deadlines, holidays.
- Mechanism tagging on events.

**Faculty schedule management.**
- Month and week calendar views.
- Create, edit, bulk operations.
- ICS and CSV export.

**Schedule import via AI extraction.**
- Upload file: Excel, Word, PDF, image, photo of printed schedule.
- AI extracts structured events.
- Review interface with side-by-side source and extracted events.
- Inline editing.
- Publish to institution's schedule.

**Schedule-aware student experience.**
- Today dashboard includes schedule-derived prompts.
- Mechanism pages show schedule context.
- Schedule notifications.
- Exam events auto-activate exam mode.

### 4.4 V2 Scope — Content Expansion

- Complete curriculum coverage: 180–220 mechanisms total across all organ systems.
- Renal, endocrine, GI, nervous, reproductive, integrative systems authored.
- Two-reviewer signoff becomes mandatory once content team expands beyond sole author.
- Content Production SOP operationalized for multi-author work.

### 4.5 V2 Scope — Other Improvements

**Billing automation.**
- Razorpay integration for recurring subscriptions.
- Monthly and annual plans.
- Payment failure handling.
- Receipt and invoice generation with GST.

**NEET-PG / INI-CET / USMLE pattern calibration in exam mode.**
- Students select target exam.
- Exam mode drills calibrated to patterns.
- Past paper analysis informs calibration (no reproduction).

**Variable manipulation simulators for 6–10 high-value mechanisms.**
- Frank-Starling slider.
- V/Q matching simulator.
- Nephron handling simulator.
- Baroreceptor reflex simulator.
- Acid-base compensation simulator.
- Others identified through v1/v1.5 usage.

(Note: v2 scope for simulators reduced from original plan; more sophisticated simulator set deferred to v3.)

**AI-assisted content auditing operational.**
- Quarterly AI review.
- Flags inconsistencies, stale content.
- Author or content team reviews.

**Concurrent session handling.**
- Graceful handling across devices.
- Sync conflict resolution refinements.

### 4.6 V2 Launch Strategy

**Pilot institutions first.** One or two pilot institutions onboarded during v2 development. Pilot pricing heavily discounted (₹100–300/student/year). Intensive support. Case studies generated.

**Expanded sales follows pilot validation.** Depends on pilot outcomes.

### 4.7 V2 Acceptance Criteria

- Faculty can create, assign, and grade an assignment end-to-end.
- AI grading first-pass accepted or overridden efficiently.
- Class roster analytics accurate and useful.
- Institutional admin can onboard new institution with users in under 30 minutes.
- Schedule import from Excel produces usable extracted events.
- Exam mode with exam-pattern calibration is distinguishable from regular review mode.
- At least 1 pilot institution successfully deployed.
- All acceptance criteria from v1 and v1.5 continue to pass.

---

## 5. V2.5 — Operational Maturity

**Trigger:** V2 has multiple institutions successfully deployed. Operational burden starts compounding.

**Primary goal:** Make the institutional product maintainable at scale.

### 5.1 V2.5 Scope

**Faculty tool expansion.**
- Topic heatmap (organ systems × mechanisms grid showing class weakness).
- Faculty annotations on mechanisms (institution-specific notes visible to students).
- Faculty content authoring (through admin interface, with standard review workflow).

**Multi-tenant refinements.**
- Based on real institutional feedback.
- Performance tuning for multi-institution workloads.
- Cross-institution reporting for platform admin.

**Automated content maintenance.**
- Student-flagged content routed to reviewers automatically.
- Performance-driven question revisions.
- Content freshness tracking.

**Expanded analytics.**
- Institutional dashboards.
- Longitudinal retention analysis.
- Comparative analytics (anonymized).
- Per-mechanism difficulty calibration from real performance data.

**Support tooling.**
- Support ticket system integration.
- Tiered support workflow.
- User impersonation (with consent and audit).
- Bulk communication tools.

**Institutional operations automation.**
- Self-service institutional signup for smaller institutions.
- Automated onboarding flows.
- Template institutional contracts.

### 5.2 V2.5 Acceptance Criteria

- At least 5 institutional customers using the platform.
- Topic heatmap actively used by at least 50% of institutions.
- Automated content maintenance reduces manual review burden measurably.
- Support response times within SLA without heroic effort.

---

## 6. V3 — Advanced Learning Features

**Trigger:** V2.5 deployed and operating at scale. Accumulated data supports advanced feature decisions.

**Primary goal:** Deepen learning features based on real student data.

### 6.1 V3 Scope

**FSRS scheduler upgrade.**
- Replaces SM-2.
- Uses accumulated review data for parameter tuning.
- Domain-specific extensions: mechanism dependency awareness, exam-proximity scheduling, layer-specific intervals.

**Concept maps.**
- Scaffolded concept mapping exercises.
- Students build mechanism relationships explicitly.
- Semi-structured: center vignette, causes, mechanisms, manifestations.
- Used in "Connect" step of learning loop.

**Comprehensive simulators.**
- Beyond v2's 6–10, expand to 20–25.
- Interactive explorations of dynamic physiological systems.
- Used in Layer 2 and Layer 3 content.

**Sophisticated exam mode.**
- Mock exam sessions timed like the real thing.
- Performance predictions.
- Gap analysis.
- Custom drills targeting identified gaps.

**Student roster imports from institutional systems.**
- Integration hooks for institutional student information systems.
- Syncing enrollment changes.

**Advanced faculty analytics.**
- Teaching effectiveness metrics.
- Intervention impact analysis.
- Comparative views.

### 6.2 V3 Acceptance Criteria

- FSRS produces retention outcomes equal to or better than SM-2.
- Concept maps used by significant percentage of active students weekly.
- Simulators rated as valuable in user feedback.
- Exam mode calibration meaningfully differentiated per target exam.

---

## 7. V4 and Beyond

Directional, not committed. Shape depends heavily on v1–v3 learnings.

### 7.1 Possible Directions

**Adjacent subjects.** If physiology model proves out strongly, expansion to biochemistry, pathology, or pharmacology becomes possible.

**International expansion.** Medical education markets beyond India (Nepal, Bangladesh, parts of Africa using similar curricula; USMLE-focused students internationally).

**API platform.** For institutions wanting integration with their own LMS.

**Native mobile apps.** If PWA proves insufficient for specific use cases.

**Advanced AI features.** Personalized tutoring, dynamic question generation, content creation acceleration.

**Certification and accreditation.** Partnership with NMC or regional bodies.

### 7.2 Directions We Will Not Pursue

**Gamification beyond streaks.** Philosophically misaligned.
**General MBBS exam prep.** Competing with Marrow/PrepLadder on their turf.
**Student-to-student content sharing.** Quality control risk too high.
**Ad-supported tier.** Privacy implications inconsistent with positioning.

---

## 8. Operational Evolution

### 8.1 Team Growth

**V1 pilot:** Solo operator with Claude Code. Dedicated testing team (external). Single content author (the operator).

**Through v1.5:** Same structure. Possibly add backup content author.

**Through v2:** Content team grows (2–4 authors with review overlap). Possibly part-time designer/front-end help.

**Through v2.5:** First full-time hire — content lead or operations lead.

**Through v3:** Small team of 4–6 people.

**Beyond v3:** Scale-dependent based on revenue.

### 8.2 Financial Evolution

**V1 pilot:** No revenue. Operating costs under ₹20,000/month (infrastructure, AI authoring, legal consults amortized).

**V1.5:** Still no revenue. Similar operating costs.

**V2:** First institutional revenue. Approaching break-even on monthly operating costs.

**V2.5:** Growing institutional revenue. Profitability with manageable growth investment.

**V3:** Unit economics proven. Decision point on fundraising or continued bootstrap.

### 8.3 Content Evolution

**V1:** 10–15 mechanisms, cardiovascular only.
**V1.5:** 25–35 mechanisms, cardiovascular + respiratory.
**V2:** 180–220 mechanisms, complete curriculum.
**V2.5:** Maintenance and quality improvements. Continuous updates.
**V3:** 250+ mechanisms as coverage deepens.

### 8.4 Infrastructure Evolution

**V1–V1.5:** Vercel + Supabase default configuration. No dedicated infrastructure.
**V2:** Upgrade to Supabase Pro as data volume grows.
**V2.5:** Architectural review; possibly split services, add caching, observability infrastructure.
**V3+:** Architecture review as scale demands.

---

## 9. Decision Points

### 9.1 After V1 Pilot (4-week mark)

- Leading indicators evaluated per Vision Document Section 8.1.
- Session completion rate, return rates, student feedback.
- Go/no-go signal for v1.5 investment.

### 9.2 After V1.5 (6-month mark)

- Extended leading indicators plus early outcome signals.
- Evaluate whether expansion to external institutions makes sense.
- Institution conversation activity assessed.

### 9.3 After V2 Pilot Deployments (6-month post-v2)

- Pilot institutions seeing value?
- What institutional features essential vs nice-to-have?
- Pricing right for institutional segment?

### 9.4 After V2.5 (6-month post-v2.5)

- Unit economics profitable?
- Team composition right?
- Next-most-valuable content expansion (adjacent subject, depth, simulators)?

### 9.5 Ongoing Criteria

**Add a feature when:** multiple users have requested it, core product stable enough, capacity to build well.

**Defer a feature when:** nice-to-have without specific user pain, stretched on priorities, long-term value unclear.

**Cut a feature when:** usage shows ignored, maintenance exceeds value, complexity disproportionate to benefit.

---

## 10. Risks to the Roadmap

### 10.1 Strategic Risks

**Risk: Pilot shows the pedagogical model doesn't work as hoped.**
This is the most important risk. Mitigation: honest evaluation against criteria. Willingness to sunset if model fails. The project exists to help students learn; if it doesn't, better to accept that.

**Risk: Expansion doesn't materialize.**
V1 may produce a great tool for the author's students with no broader interest. Mitigation: v1.5 staying within author's institution is a valid end state. No obligation to scale.

**Risk: Institutional sales cycle longer than projected.**
For Indian medical colleges, 12–18 months is more realistic than 6 months. Mitigation: maintain pilot institution focus. Don't over-invest in institutional tooling until institutional demand is real.

**Risk: Competitor launches similar product.**
Possible. Mitigation: move steadily, differentiate on depth and pedagogy. Cannot be prevented; can only outbuild.

**Risk: Regulatory changes.**
DPDPA enforcement, NMC guidelines. Mitigation: stay current. Legal counsel retained.

### 10.2 Execution Risks

**Risk: Content production can't sustain 200+ mechanism target.**
Mitigation: multiple content team members when expanding. Contract authors as backup. Willingness to extend timeline rather than compromise quality.

**Risk: Technical debt from AI-assisted development compounds.**
Mitigation: disciplined testing. Occasional external engineering review. Refactoring time built in.

### 10.3 Product Risks

**Risk: Students don't engage with forced rating.**
Mitigation: monitor session completion. Ready to adjust if data shows widespread abandonment.

**Risk: AI grading false positives erode trust.**
Mitigation: false-positive budget below 5%. Continuous monitoring. Student dispute mechanism.

**Risk: Content quality drift as volume grows.**
Mitigation: two-reviewer signoff when scaling. Quarterly AI audits. Student flagging.

---

## 11. Communication and Governance

### 11.1 How This Document Evolves

**Quarterly review.** Roadmap reviewed quarterly by author and any team members.

**After major releases.** Full roadmap revision after each version launch.

**Emergency updates.** If major external change invalidates assumptions, roadmap updated promptly.

### 11.2 Sharing With Stakeholders

**Internal:** Full detail.
**Pilot students:** High-level version summary as relevant.
**Content collaborators (future):** Relevant sections.
**Pilot institutions (future):** Version summary for versions affecting them.
**Potential customers:** Selective sharing, never over-promising.
**Never shared publicly:** Business specifics, competitive responses, pricing strategy details.

### 11.3 Decision-Making Principles

For decisions covered by this roadmap: author decides.

For decisions not covered: add to roadmap or explicit "out of scope" with rationale.

For reversals: document reasoning in change log.

---

## 12. Change Log

**Version 1.1** — Revisions incorporating feedback from four external reviews and refined project framing.

Key changes from v1.0:
- Reframed v1 as pilot for author's own students; v1.5 as potential expansion within the author's institution; v2 as first external expansion.
- Moved topic heatmap, faculty annotations, and faculty content authoring from v2 to v2.5 (only essential faculty tools in v2).
- Reduced v2 simulator count from 12–15 to 6–10; more sophisticated simulators in v3.
- Explicit acknowledgment that expansion is optional; v1.5 staying within author's institution is a valid end state.
- Removed specific month-based timelines; versions progress based on readiness and trigger conditions rather than fixed dates.
- Operational evolution reflects dedicated testing team in v1.
- Reframed pilot evaluation criteria per Vision Document's leading indicators vs outcome metrics split.

**Version 1.0** — Initial roadmap document.

---

## Appendix — Quick Reference

**v1:** Cardiovascular, 10–15 mechanisms, author's students, free pilot, markdown-in-repo content.

**v1.5:** Add respiratory, exam mode, phone auth, Google auth, accessibility audit. Possible next-year batch onboarding at author's institution.

**v1.5 end state (optional):** Continue serving author's institution indefinitely. Valid terminal state.

**v2:** First external expansion. Essential faculty tools (assignments, roster analytics, schedule import), institutional admin basics, Razorpay billing, complete curriculum.

**v2.5:** Topic heatmap, faculty annotations, faculty content authoring, multi-tenant refinements, automated maintenance.

**v3:** FSRS, concept maps, expanded simulators, sophisticated exam mode.

**v4+:** Adjacent subjects, international, API platform.

Version progression based on readiness and trigger conditions, not fixed dates.

---

**End of Roadmap v1.1**
