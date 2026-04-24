-- Phase 3 C5 — self-explanation capture.
--
-- Build spec §2.6 says the learner types (or pastes) an explanation
-- after the answer reveal. We persist it on the review row: self-
-- explanation belongs to the submission that produced it, and reviews
-- are the canonical "what happened" record.
--
-- Nullable because self-explanation is optional in Review mode per
-- §2.6 ("optional in Review mode, required in Learn mode"); a missing
-- value means the learner skipped it.
--
-- The actual AI grading happens in Phase 4 (blocked on Anthropic key +
-- 200 Hinglish samples). That work will add a separate `grades` table
-- to track rubric + feedback + dispute state — keeping reviews
-- immutable.

alter table public.reviews
  add column self_explanation text;

comment on column public.reviews.self_explanation is
  'Student-authored explanation captured after answer reveal (build spec §2.6). NULL = skipped. Graded asynchronously by the stub in Phase 3 / Claude in Phase 4.';
