# Physiology PWA — Content Production Standard Operating Procedures

**Version 1.1** — Edit and correction ruleset revised in §6.3 to align with the UUID-based content architecture introduced by the two-zone build-spec redesign. New per-question fields documented in Appendix A: Format (mcq / descriptive / fill_blank), Status (published / retired), and an ID UUID. Cosmetic / material edit distinction codified, with a retire-and-replace flow for material edits and explicit rules against renumbering, UUID reuse, and hard deletion. AI-grading prompt template and dispute-rate metrics deferred to v2 alongside the AI grader itself.

**Version 1.0** (superseded)

This document defines how content gets made, reviewed, published, and maintained. It is the operational reference for the content workflow, separate from the product design and build specification because content production is its own discipline with its own sustainable rhythm.

For product design, see Vision and Design Document. For v1 build scope, see V1 Build Specification. For future versions, see Roadmap.

---

## 1. Purpose and Scope

### 1.1 What This SOP Covers

This document defines:

- How a mechanism gets authored from scratch.
- How AI assists without replacing faculty judgment.
- How review and quality control works at different project stages.
- How content gets published and versioned.
- How errors and student feedback get handled.
- How the content workflow scales from single-author pilot to multi-author operation.
- What gets measured and tracked.

**Canonical curriculum.** Scope decisions reference `docs/syllabus.md` — the master physiology table of contents (11 parts / 64 chapters / 255 sections / 723 sub-topics). Every authored mechanism must map to a section in the syllabus; mechanisms outside the syllabus are not authored for the platform. The syllabus is the long-term curriculum and the catalogue against which "what to author next" decisions are made; v1 is the cardiovascular slice (Part V) shipped to the pilot batch.

### 1.2 What This SOP Does Not Cover

- Technical implementation of content storage (covered in V1 Build Spec).
- UI for content consumption (covered in Vision and Design).
- Subscription entitlement to content (covered in V1 Build Spec).
- Marketing or sales of content (covered in Roadmap).

### 1.3 Audience

- The author during v1 pilot (sole content producer).
- Future content team members when expansion happens.
- External reviewers when two-reviewer signoff activates.
- Platform admin for operational oversight.

---

## 2. Content Philosophy

### 2.1 Quality Hierarchy

Content quality matters above all else. The rank order of priorities when making authoring decisions:

**First: Factual accuracy.** Wrong physiology teaches students wrong physiology. Everything else is worthless if this fails.

**Second: Pedagogical clarity.** Content that is accurate but confusingly presented fails to teach. Clarity of causal chains, appropriate scaffolding, and attention to student fatigue levels matter.

**Third: Integration with the learning loop.** Content that doesn't work with retrieval practice, hint ladders, and misconception feedback is not appropriate content for this app, no matter how well-written.

**Fourth: Consistency of voice and style.** Readers should not feel different mechanisms were written by different people with different standards. Consistent voice builds trust.

**Fifth: Completeness.** Every mechanism ships complete across all four layers. No partial mechanisms — a half-finished mechanism is worse than no mechanism at that slot.

### 2.2 What Makes Content "Done"

A mechanism is done when:

- All four content layers are complete and sign-off approved.
- 6–10 questions at varied Bloom's levels exist.
- Every question has a three-tier hint ladder.
- Every question has misconception mappings (at least 3 per question).
- At least one diagram exists (SVG preferred).
- Tags are complete: organ system, NMC competency, exam pattern relevance, Bloom's distribution.
- Reviewer signoff recorded (author signoff in pilot phase; two-reviewer signoff when scaling).
- The mechanism has been integrated into the test database and verified displays correctly in the app.

### 2.3 What Is Explicitly Not Acceptable

- Content that reproduces copyrighted material (textbooks, commercial question banks, other paid platforms).
- AI-generated content that has not been faculty-reviewed.
- Factual claims without traceable source.
- Questions without hint ladders or misconception maps.
- Mechanisms with incomplete layers.
- Content that violates the gamification principle (no "win" framings, no achievement unlocks).

---

## 3. The Authoring Workflow

### 3.1 Single-Author Workflow (Pilot Phase)

During the v1 pilot, the author is the sole content producer. This simplifies the workflow but demands discipline.

**Step 1: Mechanism selection.**
The author identifies which mechanism to author next. Factors: curriculum position of current batch, pedagogical importance, author's own subject confidence, expected difficulty level.

The author records which mechanism is being worked on (to avoid duplicate effort even in solo work).

**Step 2: Source gathering.**
The author collects source material:
- Primary textbook references (Guyton, Ganong, Costanzo, or equivalent) — used as personal reference, not reproduced.
- Open-access references (StatPearls, OpenStax, NCBI Bookshelf where applicable) — usable with proper attribution.
- Past exam papers for pattern analysis.
- Personal teaching notes and lecture materials.

Source traceability must be maintained. Every substantive claim in the final content should have a source the author could point to if asked.

**Step 3: AI-assisted drafting.**
The author uses Claude with a structured prompt to generate drafts. Separate prompts for each artifact type:

- Layer generation prompt (all four layers).
- Question generation prompt (varied Bloom's levels).
- Hint ladder prompt (three-tier per question).
- Misconception map prompt (per question).

Prompt templates are stored in the repository and version-controlled. Each prompt includes the mechanism context, the target depth layer or question type, the Bloom's level target, and explicit style guide requirements.

The author generates multiple variants for each artifact and selects the best.

**Step 4: Author review and editing.**
The author reviews every AI draft critically:
- Is the mechanism correct? Verify against primary textbook reference.
- Is the level appropriate for first-year MBBS?
- Does it align with the style guide?
- Are the questions testing what they should test?
- Do the hint ladders actually scaffold correctly?
- Are the misconceptions real misconceptions students hold, or hypothetical ones?

Edits aggressively. The AI output is a starting point, not a final product. Time investment: 50–70% of the mechanism authoring time is spent in review and editing.

**Step 5: Diagram creation or selection.**
For each mechanism, at least one diagram is needed. Options:
- Open-source physiology diagrams (Wikimedia Commons, public-domain medical illustrations).
- AI-generated diagrams (with careful verification for accuracy).
- Custom SVG created by the author.
- Simple schematic drawings adequate for the concept.

Diagrams must be legible at mobile phone screen sizes. Complex multi-panel diagrams usually work poorly.

**Step 6: Structured markdown creation.**
The final content is written in structured markdown matching the schema expected by the app. The markdown file lives in the repository at a specific path.

Structure (defined in Appendix A) includes frontmatter with metadata, layer sections, question blocks with hint ladders and misconception maps, and tag information.

**Step 7: Author self-review.**
Before committing:
- Read through the entire mechanism as if a student would encounter it.
- Verify all claims against source material one more time.
- Check that the mechanism reads consistently with other published mechanisms.
- Check for typos, formatting issues, broken markdown.

**Step 8: Commit and publish.**
The mechanism is committed to the repository and deployed. In pilot phase, this is immediate — commit pushes through CI which deploys the app.

The author logs the completion date and any notes for future reference.

**Total time per mechanism (solo workflow):** Realistically 8–15 hours spread over several sessions. Complex mechanisms (like cardiac cycle or acid-base) take longer than simpler ones (like vascular function curves). First mechanisms take longer; later ones get faster as the workflow calibrates.

### 3.2 Two-Reviewer Workflow (Post-Expansion)

When expansion to other institutions happens or when content team grows beyond sole author, two-reviewer signoff becomes mandatory.

Workflow changes:

**Authoring phase** (same as above, Steps 1–7).

**Step 8 becomes: Submit for review.** The author submits the completed mechanism for review, not directly to production. The mechanism enters a review queue.

**Step 9: Reviewer evaluation.** A second faculty member (different person from author) reviews the mechanism:
- Accuracy check against their own knowledge.
- Pedagogical assessment.
- Style consistency check.
- Question quality assessment.
- Hint ladder and misconception map verification.

Reviewer can: approve, request changes (with specific comments), or reject with explanation.

**Step 10: Revision if needed.** If changes requested, author revises and resubmits. Iteration until reviewer approves.

**Step 11: Publish.** After two-reviewer signoff, mechanism publishes.

Realistic review time: 1–3 hours per mechanism by the second reviewer.

### 3.3 Team Workflow (Scaled Operation)

When content team grows to 3+ authors, operational patterns:

- Mechanism assignments distributed based on expertise.
- Weekly coordination meetings to align on style, resolve questions.
- Shared style guide maintained and updated.
- Peer review distributed across team (author of mechanism A reviews author B's mechanism, etc.).
- Content lead oversees queue, makes assignments, maintains quality standards.

Operational details defined when team expansion actually happens.

---

## 4. The Style Guide

### 4.1 Voice and Tone

**Medical professional voice, not conversational.** The content is teaching medicine. Tone is calm, clear, authoritative without being cold. Not chatty, not humorous in the text itself.

**Second person used sparingly.** "When blood pressure drops..." not "When your blood pressure drops..." Clinical description rather than personal framing — except when a clinical vignette explicitly places the student in a clinical role ("You are examining a patient with...").

**Active voice preferred.** "The baroreceptors detect changes" rather than "Changes are detected by the baroreceptors."

**Present tense for mechanisms.** "Sympathetic activation increases heart rate" not "Sympathetic activation increased heart rate."

**Precision over elegance.** Physiology is precise. "Stroke volume decreases" is preferable to "stroke volume drops" because "drops" is vague. Save narrative flair for clinical vignettes, not mechanism descriptions.

### 4.2 Terminology

**Use standard medical terminology consistently.** Not simplified-for-students versions. First-year MBBS students must learn the real terms.

**First appearance of abbreviation.** Define on first use: "Glomerular filtration rate (GFR) is..." Then use GFR throughout.

**Accept common medical abbreviations.** ADH, SV, CO, MAP, etc. These appear frequently; using them is appropriate.

**Avoid proprietary or trademarked names** in generic mechanism content. Drug mechanisms reference drug classes, not brand names.

### 4.3 Layer-Specific Style

**Layer 1 (30 seconds).**
One sentence of mechanism. Dense and direct.
One diagram captioned briefly.
One clinical hook — usually one short sentence connecting to clinical relevance.
Example: "Increased preload stretches cardiac sarcomeres toward optimal actin-myosin overlap, increasing stroke volume — until overstretch in failing hearts inverts the relationship."

**Layer 2 (2–3 minutes, working explanation).**
Mechanism explained in 3–5 paragraphs.
Key variables identified.
One essential graph with annotation.
Common exam framings (1–2 paragraphs).
Writes as a mini-tutorial, not a scientific paper.

**Layer 3 (8–10 minutes, deep dive).**
Molecular basis covered.
Mathematical relationships where applicable (with explanations of what the math means).
Edge cases and exceptions.
Integration with other mechanisms.
Explicit misconceptions identified.
Writes as a thorough explanation for a student who wants to understand deeply.

**Layer 4 (clinical integration).**
Short clinical vignettes (3–5 sentences each).
Pathophysiology of conditions where this mechanism breaks.
Common clinical scenarios testing this concept in exams.
Writes as clinical teaching.

### 4.4 Question Style

**All questions test mechanism, not memorization.** A question like "What is the normal range of MAP?" fails this test. A question like "If stroke volume drops 30% and heart rate increases 20%, predict the change in cardiac output" passes.

**Question length.** 2–4 sentences for the stem typically. Clinical vignettes may be longer (4–6 sentences).

**Answer style.** Concise but complete. For MCQ distractors, each should be plausible — wrong for specific mechanism-level reasons, not just randomly chosen.

**Elaborative explanation required.** Every question's explanation explains why the correct answer is correct and (for MCQ) why each distractor is wrong.

### 4.5 Hint Ladder Style

**Hint 1 (conceptual nudge).** Points toward the relevant framework without solving. "Think about what determines stroke volume."

**Hint 2 (specific identification).** Identifies a key concept involved. "Frank-Starling describes the relationship between fiber length and contractile force."

**Hint 3 (approaches answer).** Gives the structural form of the answer without completing it. "Consider how increased preload affects sarcomere overlap, and what that implies for stroke volume."

**Never give the answer in a hint.** The third hint approaches; it does not arrive.

### 4.6 Misconception Style

**Misconception text (2–3 sentences).** States the wrong mental model as students actually think it, not in corrected form. Example: "ADH directly reabsorbs sodium in the collecting duct, which is why it causes water retention."

**Correction text (3–5 sentences).** Explains why the misconception is wrong and what the correct model is. Example: "ADH does not reabsorb sodium directly. ADH increases aquaporin-2 channel insertion into the apical membrane of collecting duct principal cells, allowing water reabsorption along the osmotic gradient established by sodium reabsorption. The sodium reabsorption itself is independent of ADH — it's handled by other mechanisms including aldosterone-sensitive sodium channels."

---

## 5. Review and Quality Control

### 5.1 Review Checklist (Author Self-Review)

Before committing a mechanism, the author verifies:

**Factual accuracy.**
- Every substantive claim has a traceable source.
- All claims verified against primary textbook reference.
- No claims that the author would not defend in a medical education context.

**Pedagogical quality.**
- Layer 1 is actually 30 seconds of content, not 2 minutes.
- Layer 2 covers the essential working understanding.
- Layer 3 goes genuinely deep, not just more verbose.
- Layer 4 has real clinical context.
- Questions test mechanism, not memorization.
- Hint ladders scaffold correctly.
- Misconceptions are real student misconceptions, not hypothetical.

**Style consistency.**
- Voice matches other published mechanisms.
- Terminology used consistently.
- Formatting clean and complete.

**Technical completeness.**
- Markdown structure matches template.
- All metadata filled in.
- Diagrams present and legible.
- File location correct in repository.

**Integration verification.**
- Mechanism displays correctly in development environment.
- All question interactions work.
- Hint reveals work.
- Misconception mappings trigger correctly on test wrong answers.

### 5.2 Review Checklist (Second Reviewer, Scaled Phase)

When two-reviewer signoff is active, the second reviewer uses this checklist:

**Independent accuracy verification.**
- Reviewer checks factual claims against their own knowledge.
- Any disagreement flagged for resolution (not just a note — actual dialogue with author).

**Pedagogical review.**
- Would the reviewer use this to teach their own students?
- If not, what's missing or wrong?

**Cross-mechanism consistency.**
- Does this mechanism connect with related mechanisms appropriately?
- Are terms used consistently across the bank?

**Question quality assessment.**
- Are questions at the right Bloom's level?
- Do distractors educate (not just fill slots)?

**Final judgment.**
- Approve as-is.
- Approve with minor comments (author fixes before publish).
- Request changes (author revises and resubmits).
- Reject (rare; explanation required).

### 5.3 Disagreement Resolution

When author and reviewer disagree substantively:

**First: dialogue.** Reviewer explains concern; author responds. Often resolves within a conversation.

**Second: external reference.** If the disagreement is factual, consult primary sources. The source resolves the dispute.

**Third: third-party consultation.** If still unresolved, consult another faculty member or authoritative reference.

**Never:** publish content with unresolved substantive disagreement between author and reviewer.

---

## 6. Content Lifecycle

### 6.1 Publication

When a mechanism is approved:
- Status changes to "published."
- Available to students immediately (pilot phase) or per institutional content-access settings (future).
- Version number recorded.
- Publication date logged.

### 6.2 Ongoing Monitoring

After publication:
- Performance data aggregated (question-level correct/incorrect distributions).
- Student flags on the content reviewed weekly.
- Automated quarterly AI audits flag anomalies.
- Author and reviewers may flag issues from their own ongoing use.

### 6.3 Edits and Corrections

Every published question has a UUID that the spaced-repetition system uses to track each student's performance history against that specific question. Edits to a question therefore fall into one of two categories, distinguished by whether the edit changes what the question *means*:

- A **cosmetic edit** changes presentation, labels, or scaffolding without changing the question's pedagogical content. Edits in this category happen in place. The UUID stays. Every student's accumulated review history for that question stays attached and stays accurate.
- A **material edit** changes the question's pedagogical content — what the question asks, what the correct answer is, or what physiology the explanation is teaching. Edits in this category are not performed in place. Instead, the existing question is retired and a new question with a fresh UUID is created. Students who had been reviewing the old question encounter the new one as fresh content.

This distinction protects student learning data. A student's interval and ease factor on a question are only meaningful if the question they were performing against has stayed the same. Editing meaning in place silently invalidates that data. Retiring and replacing keeps history honest: old reviews stay joined to the old question, new reviews accumulate against the new one.

#### What counts as cosmetic

The following edits are cosmetic. They are made in place, with the UUID preserved.

- Typos, grammar fixes, formatting changes.
- Re-labeling difficulty (`foundational` / `standard` / `advanced`).
- Re-labeling priority (`must` / `should` / `good`).
- Tag changes — NMC competency, exam pattern, organ system, Bloom's level.
- Prerequisite and related-mechanism updates.
- Hint text refinements, when the question itself is unchanged.
- Misconception correction-text refinements, when the wrong-answer string the misconception is keyed to is unchanged.
- Typographic fixes to a correct answer that don't change its meaning — for example, `5.6 L/mn` to `5.6 L/min`. The intended answer was correct; the rendering was wrong.

The test for whether a correct-answer edit is cosmetic: would a careful student reading the original have understood the intended right answer despite the error? If yes, cosmetic. If they would have walked away believing something wrong about physiology, the edit is material.

#### What counts as material

The following edits are material. They require retiring the existing question and creating a new one.

- Changes to what the stem is asking.
- Changes to the correct answer where the recorded answer was actually wrong — students who memorized it learned wrong physiology.
- Changes to the elaborative explanation that alter the physiology being taught (not merely how it's worded).
- Changes to a wrong-answer string in a misconception mapping. The wrong-answer string is the join key between a student's incorrect choice and the misconception coaching they receive; changing it breaks that join for historical analytics.

#### How a material edit is performed

1. Mark the existing question retired in the markdown. The question heading gains a `[retired]` annotation; the body of the question records `**Status:** retired` and a brief reason. The full question text remains in the file so that the gap is visibly intentional, removing any temptation to renumber surrounding questions.
2. Author a new question as the next-numbered question in the file. The new question receives a fresh UUID at the next CI run.
3. Commit both changes together in a single PR. The CI check verifies that the retired question's UUID is preserved and that the new question's UUID is genuinely new.

From the student's perspective: the retired question simply stops appearing in their review queue. The new question appears as a fresh card the next time they encounter the mechanism. Their existing card_state for the retired UUID stays in the database, dormant, available for any future audit of how students performed on that version of the question.

#### Never

Three operations are never performed, under any circumstances.

- **Never renumber question headings.** When a question is retired, its heading number stays. Subsequent questions keep their existing numbers. Gaps from earlier retirements remain as gaps. Renumbering causes silent SRS data corruption — every student's history for the renumbered questions becomes misattached to different content.
- **Never reuse a UUID.** A UUID is a permanent label for a specific historical question. Reusing one means historical reviews join to today's content, which is dishonest and breaks every audit trail.
- **Never hard-delete a UUID.** Questions are retired, not deleted. Retirement preserves every student's review history; deletion destroys it and orphans every joined record (disputes, content flags, audit data, sync state on offline devices).

#### Reviving a retired question

A question that was retired (for example, because it was thought to be wrong but later determined to be correct, or because it was set aside while a curriculum change was being considered) can be revived. Status flips from `retired` back to `published`. The UUID stays the same throughout. Students whose card_state had gone dormant during the retirement period resume normal scheduling with their prior interval and ease intact. Historical reviews remain joined to the same UUID, producing a continuous record across the retirement period.

Reviving a question is appropriate only when the question's content is unchanged from when it was retired. If the question's content needs to change, the correct path is to leave the original retired and create a new question — same as any other material edit.

#### Notification

For cosmetic edits, students are not notified. The fix appears the next time the card surfaces. Cosmetic edits accumulate silently in the version history of the markdown file.

For material edits, students who had been reviewing the retired question are not notified that it was retired specifically — that level of meta-information is noise. They simply stop seeing it. The new replacement question appears in their queue as a fresh card and they encounter it through normal review and learn flows.

For material edits where the retired question was teaching wrong physiology — the case where the recorded correct answer was actually incorrect — affected students should be notified directly. Not because the system mechanically requires it, but because students who learned wrong physiology deserve to know they did, so they can deliberately re-encounter the corrected version with appropriate attention. The notification is a single in-app message naming the mechanism and the nature of the correction. This is rare and should be treated as a content-quality incident worth recording in the change log.

#### Quick reference

| Edit | UUID | Student data | Markdown action |
|---|---|---|---|
| Typo, grammar, formatting | preserved | preserved | edit in place |
| Difficulty re-label | preserved | preserved | edit in place |
| Priority re-label | preserved | preserved | edit in place |
| Tag change | preserved | preserved | edit in place |
| Hint refinement | preserved | preserved | edit in place |
| Stem meaning change | retire old, new UUID for replacement | preserved on old UUID, fresh on new | tombstone + append new |
| Correct answer change (was wrong) | retire old, new UUID for replacement | preserved on old UUID, fresh on new | tombstone + append new |
| Explanation physiology change | retire old, new UUID for replacement | preserved on old UUID, fresh on new | tombstone + append new |
| Misconception wrong-answer string change | retire old, new UUID for replacement | preserved on old UUID, fresh on new | tombstone + append new |
| Question removed from circulation | preserved | preserved (dormant) | status → retired |
| Question brought back into circulation | preserved | preserved (resumes) | status → published |

### 6.4 Retirement

Content is retired when:
- Better replacement content authored.
- Curriculum changes make content irrelevant.
- Content is fundamentally wrong in ways that cannot be fixed.

Retirement process for whole mechanisms:
- Frontmatter status changes to "retired."
- Content hidden from new students.
- Students currently learning it finish their SRS cycle (up to 30 days), then the card drops from their queue.
- Content remains in database for audit purposes (not truly deleted).

Question-level retirement follows the same pattern as mechanism retirement and is the standard mechanism for removing a single question from circulation, whether because the question is being replaced as part of a material edit (§6.3) or because the question is no longer wanted in the bank. A retired question's UUID is preserved indefinitely. The question's content stays in the markdown file with a `[retired]` annotation on its heading and `**Status:** retired` in its body, both for human readability and to fill the position that would otherwise tempt renumbering. Retired questions can be revived (§6.3); they cannot be deleted.

### 6.5 Updates for Curriculum Changes

When NMC updates competency guidelines, or when exam patterns shift:
- Quarterly review identifies affected content.
- Author (or team) updates tags, may rewrite questions to match new patterns.
- Students see updated content on their next review.

---

## 7. Source Management

### 7.1 Attribution Requirements

Every piece of content has clear source provenance. In the content markdown file, a source section records:

- Primary sources consulted.
- Direct attributions for any open-access material referenced.
- Author's note for original faculty authorship.

For open-access sources with specific attribution requirements:

**StatPearls (CC BY 4.0):** "Content informed by [Article Title]. Available at StatPearls, NCBI Bookshelf."

**OpenStax Anatomy and Physiology (CC BY 4.0):** "Some content adapted from OpenStax Anatomy and Physiology, available at openstax.org."

**Specific NCBI Bookshelf titles (where open access):** "Content informed by [Title], [Authors], available at NCBI Bookshelf."

Check each source individually — not all NCBI Bookshelf content is open access.

### 7.2 Copyright Compliance

**Copyright memo required.** Before scaled content production, obtain a memo from a specialist copyright lawyer confirming:
- Acceptable attribution formats for each open-access source.
- Limits on derivative work.
- Commercial use implications (if paid tier launches).
- Treatment of adapted content vs. original work.

**Document compliance for each mechanism.** In the mechanism's source section, note which sources were consulted and how they were used.

**Forbidden sources.** Explicit list of sources not to use:
- Marrow, PrepLadder, DAMS, UWorld, Kaplan content.
- Textbook PDFs acquired outside institutional access.
- Other medical education platforms' content.
- AI-generated content from other services' databases.

### 7.3 Original Authorship vs. Derived Content

**Original authorship.** The author's own understanding, teaching notes, and explanations constitute original content. The author owns this content; the platform has licensed rights per the author agreement.

**AI-drafted content.** Content generated by Claude is starting material. The author's editing and review produces the final content, which is the author's work product.

**Derived content.** Content informed by open-access sources, properly attributed, is acceptable derived work. The author's expression of the content is original, even if the concepts are drawn from the sources.

**Reproduced content.** Not acceptable. Even with attribution, directly reproducing copyrighted material without permission is infringement.

---

## 8. Content Operations

### 8.1 What Gets Tracked

**Per mechanism:**
- Authoring status (planning, drafting, author review, reviewer review, revisions, published, retired).
- Author and reviewer (when applicable).
- Start and completion dates.
- Time invested (rough tracking for velocity analysis).
- Version history.
- Performance data (student correctness, engagement).
- Flag count (student-reported issues).

**Per content batch:**
- Planned mechanisms for the period.
- Completed mechanisms.
- Velocity (mechanisms per month).
- Quality issues identified.
- Lessons learned.

**Aggregate:**
- Total mechanisms published.
- Total questions.
- Content flag rate (flags per 1000 student interactions).
- Correction rate (corrections per mechanism per month).
<!--
  AI grading dispute rate moved to v2 alongside the AI grader itself
  (see build_spec.md §2.6). v1 has no AI-graded responses and
  therefore no dispute traffic to monitor.
-->

### 8.2 Review Queue Management

**Priority ordering.**
- Urgent: corrections affecting published content with student impact.
- High: new mechanism ready for review, batch of mechanisms awaiting publication.
- Medium: flagged content awaiting investigation.
- Low: draft content awaiting review.

**Response time expectations.**
- Pilot phase: author acts on queue items within 48 hours.
- Scaled phase: review queue items within 1 week; urgent items within 24 hours.

### 8.3 Student Feedback Integration

**Flag intake.** Students flag content via in-app button. Flag includes the question or content ID and optional text.

**Triage.** Flags reviewed weekly. Categories:
- Factual error (urgent).
- Unclear explanation (medium).
- Question problem (medium).
- Feature request (not a content issue — routed elsewhere).
- Non-issue (dismissed).

**Action.** Depending on category, flag triggers correction workflow or dismissal with notes.

**Flagger notification.** Student who flagged sees a response in their feedback history: "Thanks for flagging this — we've [corrected it / investigated and it's working as intended]."

### 8.4 AI-Assisted Auditing

Quarterly AI audit runs across all published content:

**Consistency checks.**
- Does mechanism A contradict mechanism B?
- Are tags used consistently?
- Is terminology standard?

**Pedagogical checks.**
- Are Bloom's levels distributed appropriately?
- Are question types varied within each mechanism?
- Do hint ladders scaffold correctly?

**Performance anomaly detection.**
- Questions with unusual correctness distributions.
- Mechanisms where class performance is lower than expected.
- Hint usage patterns suggesting broken scaffolding.

AI produces a prioritized list. Author reviews and acts.

---

## 9. Prompt Templates

### 9.1 Prompt Template Storage

All AI authoring prompts stored in repository at `/content/prompts/`. Version-controlled. Each prompt has:

- Purpose and usage.
- Required inputs.
- Expected outputs.
- Test cases with expected quality characteristics.
- Version history.

### 9.2 Key Prompt Templates

**Layer generation.** Given mechanism name, source material, target depth layer, and style guide reference, generate draft layer content.

**Question generation.** Given mechanism name, content layers, Bloom's level target, and question type target, generate candidate questions.

**Hint ladder generation.** Given a question and its answer, generate three-tier hint ladder matching style guide.

**Misconception mapping.** Given a question and likely wrong answers, identify which misconceptions each wrong answer matches. If new misconception, add it to the catalog.

**Periodic content audit.** Given the full content bank, identify consistency issues, pedagogical problems, and performance anomalies.

<!--
  Grading prompt (self-explanation) — deferred to v2 alongside the
  AI grader itself (see build_spec.md §2.6). v1 grades MCQ and fill-
  blank deterministically and has students self-rate descriptive
  answers, so no LLM-grading prompt template is required for v1.
-->

Each prompt is refined through testing. Initial versions are approximations; refinement based on observed quality of output.

### 9.3 Prompt Evolution

Prompts are not static. Refinements happen:

- After authoring each of the first 5 mechanisms, prompts are reviewed and refined.
- When AI outputs consistently miss something important, prompt is updated.
- When AI outputs include unwanted patterns, prompt is updated.
- Version changes logged.

---

## 10. Scaling the Content Operation

### 10.1 Single-Author to Multi-Author Transition

When expansion happens and content team grows:

**Step 1: Document everything.** Style guide, review checklists, prompt templates, workflow — all in this SOP. Future team members must be onboardable from this document.

**Step 2: Hire carefully.** Content authors are medical professionals with teaching experience. Not general writers. Not new graduates. The bar is high because the content is high-stakes.

**Step 3: Onboarding.** New author reads this SOP, reviews 5+ published mechanisms to absorb style, drafts their first mechanism under close supervision, gets detailed feedback before proceeding.

**Step 4: Peer review activation.** Two-reviewer signoff becomes mandatory. Authors cross-review each other's work. Content lead (initially the original author) oversees quality.

**Step 5: Regular coordination.** Weekly team meetings: style questions, coordination on mechanism coverage, resolution of disagreements.

### 10.2 Content Lead Role (Future)

When team grows beyond 2 authors, a content lead role may emerge. Responsibilities:

- Maintain style guide.
- Assign mechanisms to authors.
- Resolve disagreements.
- Oversee review queue.
- Report content health metrics.
- Interface with engineering team on content pipeline issues.

Initially the original author; may be delegated as team grows.

### 10.3 Content Velocity Targets

**Pilot phase (single author):** 1 mechanism per 2–3 weeks sustainable pace. Roughly 2–3 per month.

**V1.5 (single author or small team):** 3–5 mechanisms per month.

**V2 (team of 3–4 authors):** 10–15 mechanisms per month.

**V2.5+ (mature content team):** 15–20 mechanisms per month plus ongoing maintenance.

These are targets, not mandates. Quality over velocity always.

### 10.4 Quality Control at Scale

As content volume grows, quality control becomes more complex:

- Spot checks: random sampling of published content for re-review.
- Performance monitoring: automated flagging of underperforming content.
- Student feedback aggregation: patterns across flags reveal systemic issues.
- Periodic full audits: annual review of all content for freshness.

---

## 11. Metrics and Reporting

### 11.1 Weekly Metrics

- Mechanisms authored this week.
- Mechanisms in review.
- Content flags received.
- Flags resolved.
<!--
  Dispute rate on AI grades — deferred to v2. See build_spec.md §2.6
  and SOP §8.1 (aggregate metrics) for the corresponding deferral.
-->

### 11.2 Monthly Metrics

- Mechanisms published.
- Time per mechanism (trending).
- Flag rate per 1000 student interactions.
- Correction rate.
- AI audit findings.

### 11.3 Quarterly Metrics

- Total content coverage.
- Gap analysis against curriculum.
- Content quality trends.
- Team velocity (when team exists).
- Cost analysis (AI tokens, time invested).

### 11.4 Reporting

**Author self-reporting:** weekly status notes (for future team; during solo phase, just personal notes).

**To engineering team:** content pipeline health, any blockers.

**To platform admin:** operational health of content operation.

**For roadmap planning:** content capacity available, realistic targets.

---

## 12. Evolution and Maintenance

This SOP evolves with the project.

**Quarterly review.** Author reviews the SOP, updates for lessons learned.

**Post-major-release review.** After v1, v1.5, v2 launches, SOP revision based on what was learned.

**Team feedback.** When team grows, members contribute to SOP refinement.

**Change log maintained.** All revisions documented.

---

## Appendix A — Markdown Content Structure

Content mechanisms are stored as markdown files with YAML frontmatter. Structure:

```markdown
---
id: frank-starling
title: Frank-Starling Mechanism
organ_system: cardiovascular
nmc_competencies: [PY-CV-1.5, PY-CV-1.6]
exam_patterns: [mbbs, pre-pg]
prerequisites: [cardiac-cycle, ventricular-pressure-volume]
related_mechanisms: [cardiac-output-regulation, contractility-regulation]
blooms_distribution:
  remember: 10
  understand: 30
  apply: 30
  analyze: 30
author: [author_id]
reviewer: [reviewer_id or "pending"]
status: published
version: 1.0
published_date: 2026-05-15
last_reviewed: 2026-05-15
---

# Layer 1 — Core

[30-second core content. One sentence of mechanism, one diagram reference, one clinical hook.]

## Diagram
![Frank-Starling curve](../diagrams/frank-starling-curve.svg)

## Clinical Hook
[One sentence connecting to clinical relevance]

---

# Layer 2 — Working Explanation

[2-3 minutes of content. Mechanism unpacked with key variables, one essential graph, common exam framings.]

## Key Variables
- Preload
- Sarcomere length
- Stroke volume

## Essential Graph
![Length-tension relationship](../diagrams/length-tension.svg)

## Common Exam Framings
[1-2 paragraphs]

---

# Layer 3 — Deep Dive

[8-10 minutes of content. Molecular basis, mathematical relationships, edge cases, integration, misconceptions.]

## Molecular Basis
[Content]

## Mathematical Relationships
[Content]

## Edge Cases
[Content]

## Integration with Other Systems
[Content]

## Misconceptions
[List of misconceptions for this mechanism, each linked to the misconceptions catalog]

---

# Layer 4 — Clinical Integration

[Clinical vignettes and pathophysiology.]

## Vignette 1
[3-5 sentences]

## Vignette 2
[3-5 sentences]

## Pathophysiology
[Content on how this breaks in various conditions]

---

# Questions

Each question declares **Format**, **Status**, and an **ID** (UUID). The
two-zone redesign expects these on every published question; the
parser tolerates omissions for backwards-compatibility but CI rejects
published content that's missing them. See `mechanism_template.md`
and `question_type_templates.md` for the full author-facing shape.

## Question 1
**ID:** 8f3c8e72-2a14-4c2c-8c8f-9e4a3b1d2c3a
**Format:** mcq
**Status:** published
**Type:** prediction
**Bloom's level:** apply
**Priority:** must
**Difficulty:** standard
**Stem:** [Question text]
**Correct answer:** [Answer]
**Elaborative explanation:** [Why the answer is correct and how the mechanism works]

### Hint Ladder
1. [Hint 1 - conceptual nudge]
2. [Hint 2 - specific identification]
3. [Hint 3 - approaches answer]

### Misconception Mappings
- Wrong answer: "Heart rate increases" → Misconception: conflating SV and HR changes
- Wrong answer: "No change in CO" → Misconception: assuming compensation is complete

## Question 2
**ID:** a1b2c3d4-e5f6-4789-9abc-def012345678
**Format:** fill_blank
**Status:** published
**Type:** recall
**Bloom's level:** remember
**Priority:** must
**Difficulty:** foundational
**Stem:** Normal resting cardiac output is approximately ____ L/min.
**Correct answer:** 5 L/min
**Acceptable answers:** "5 L/min" | "5 l/min" | "5 liters per minute"
**Unit:** L/min
**Tolerance:** ±10%
**Elaborative explanation:** [Why this value is the anchor for downstream comparisons]

## Question 3 [retired]
**ID:** 9c4d2e8f-1a2b-4c3d-8e9f-0a1b2c3d4e5f
**Format:** mcq
**Status:** retired
**Type:** prediction
**Bloom's level:** apply
**Stem:** [Original stem stays — file is the audit record]
**Correct answer:** [Original answer stays]
**Elaborative explanation:** [Original explanation stays]

<!--
  A retired question keeps its UUID, body, and heading number. The
  gap is intentional — never renumber surrounding questions. See
  §6.3 for cosmetic-vs-material edits and the retire-and-replace
  flow.
-->

---

[Repeat for each question]

---

# Sources

- Primary: Guyton & Hall, 14th ed, Chapter 9
- Open-access: StatPearls article on Frank-Starling Law (CC BY 4.0)
- Author's own teaching notes, Physiology Department, [Institution]

# Author Notes

[Any notes for future reviewers or self-reference]
```

## Appendix B — Style Guide Quick Reference

**Voice:** Medical professional. Clear. Calm. Authoritative.
**Person:** Third person for mechanisms; second person for clinical vignettes.
**Tense:** Present for mechanisms; past for historical or case contexts.
**Terminology:** Standard medical; abbreviations defined on first use.
**Layer 1:** 30 seconds. One sentence mechanism. Dense.
**Layer 2:** 2-3 minutes. Working explanation with key variables.
**Layer 3:** 8-10 minutes. Deep dive with molecular basis and edge cases.
**Layer 4:** Clinical vignettes and pathophysiology.
**Questions:** Test mechanism, not memorization.
**Hints:** Three tiers — nudge, specify, approach.
**Misconceptions:** Real student errors, not hypothetical.

## Appendix C — Change Log

**Version 1.0** — Initial Content Production SOP.

Derived from:
- V1 Build Specification content requirements.
- Vision and Design Document content architecture.
- Feedback from external reviews recommending SOP separation.

---

**End of Content Production SOP v1.0**
