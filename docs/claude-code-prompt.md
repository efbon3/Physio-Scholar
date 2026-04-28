# Prompt for Claude Code

The text below is a complete prompt to paste into a Claude Code session for applying the build spec revisions. The session should be opened on the project folder containing the architectural documents (`build_spec.md`, `vision_and_design.md`, etc.).

---

## The prompt to paste

I need you to apply a set of revisions to the V1 Build Specification (`build_spec.md` in this project). The revisions document is `build-spec-revisions-consolidated.md` — please read it first before making any changes.

These revisions cover three connected design decisions that have been made since `build_spec.md` was last edited:

1. **Two-zone mechanism page model.** Each mechanism page now has a textbook-reading zone (the four content layers) and a test zone (the format-chosen test session). The original "Learn mode" terminology is retired in favor of this two-zone framing. The six-step pedagogical loop is preserved but mapped onto the new structure rather than enforced as a sequence.

2. **Unified submit-then-reveal flow across all formats.** All three formats (MCQ, descriptive, fill-blank) now use an explicit "Submit answer" button as the commit action. The student can change their answer freely before submit; after submit, the reveal screen appears.

3. **"I don't know" as a fifth SM-2 rating.** MCQ and fill-blank formats add an "I don't know" option as a visually subordinate fifth choice. Selecting it produces the same next-interval as Again (1 day) but does not decrement ease and does not increment lapse count. This is a third modification to standard SM-2, joining the existing two (ease floor at 1.5, leech detection at 5). The pedagogical rationale: a student who admitted ignorance has not consolidated a wrong mental model, so future intervals don't need tightening — only the next encounter does.

## Your task

Read `build-spec-revisions-consolidated.md` in full. It contains drop-in replacement text for specific sections of `build_spec.md`, marked with which section each replacement targets. Apply these revisions to `build_spec.md` carefully:

- Replace existing sections cleanly. Do not leave residual text from the old version.
- Preserve the build spec's existing voice, formatting conventions, and section numbering style.
- Update the change log in Appendix C with a new version entry (1.2) describing these changes.
- Verify internal consistency: cross-references to "Learn mode" elsewhere in the document need updating to match the new "mechanism detail page" framing.

## What NOT to change in this revision

The revisions document explicitly lists six other build spec sections that need revision but are not addressed here (search for "What this draft does NOT cover" at the end of the revisions document). Do not touch those sections in this pass — they require separate revisions that haven't been drafted yet. If you notice a contradiction between a section being revised here and a section that hasn't been revised, flag it for me but don't try to resolve it unilaterally.

## Sequencing

Work through the revisions in this order:

1. Read `build_spec.md` end-to-end to understand current structure.
2. Read `build-spec-revisions-consolidated.md` end-to-end to understand the changes.
3. Apply Section 2.3 revisions (Student Experience — Systems tab and Mechanism detail page).
4. Insert the new Test Session Flow subsection within 2.3.
5. Replace the Learn mode subsection with the redirect language from the revisions doc.
6. Apply the Section 2.6 partial revision (adding the daily-review-and-mechanism-tests-as-complementary-surfaces explanation).
7. Apply the Section 2.7 revision (SM-2 with three modifications, including the new five-rating list).
8. Add the new acceptance criteria to Section 3.1.
9. Add the new UX criteria to Section 3.6.
10. Update Appendix C change log with version 1.2 entry.

## Verification

After applying all changes, do a consistency check:

- Search for "Learn mode" across the whole document and confirm any remaining references are either updated or are intentional historical references.
- Verify that the SRS scheduler section (2.7) and the test session flow subsection (in 2.3) describe consistent rating mappings.
- Verify that the acceptance criteria in 3.1 reference features that are actually described in the body of the spec.
- Check that the schema additions for the reviews log are reflected if there's a data model section.

When you're done, summarize what you changed and flag anything you noticed but didn't resolve. I'll review before committing.

## A note on the broader context

This is one of several pending revisions to the document set. The vision document, content production SOP, and roadmap also need updates to reflect connected decisions (no AI in v1, three-format separate banks, content addressing via UUIDs and content hashes). Don't try to address those here — focus only on the build spec changes covered by the revisions document. We'll work through the others in subsequent passes.

---

## End of prompt
