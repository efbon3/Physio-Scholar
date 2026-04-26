-- Phase 5+ — Self-declared role at signup.
--
-- Author requirement (2026-04-26): "in signup, there has to be options
-- of student, faculty and admin. in the homepage, the signin page,
-- they should first choose this."
--
-- IMPORTANT: this column is *informational only*. It records what the
-- user said they were when they signed up, so the admin can prioritise
-- the approval queue and grant the matching is_admin / is_faculty
-- flags. It does NOT itself confer any privilege — the actual role is
-- decided by the admin during approval and the column-lock trigger
-- from 20260506 still keeps a learner from setting is_admin / is_faculty
-- directly. If we ever made requested_role load-bearing for any gate,
-- we'd be re-opening the privilege-escalation hole the trigger closed.
--
-- Existing rows are stamped 'student' as the safe default; new signups
-- via the simplified form pass an explicit choice.

alter table public.profiles
  add column requested_role text not null default 'student'
    check (requested_role in ('student', 'faculty', 'admin'));

comment on column public.profiles.requested_role is
  'Self-declared role at signup. ''student'' | ''faculty'' | ''admin''. INFORMATIONAL ONLY — does not grant privileges. The admin reads this to decide whether to set is_admin / is_faculty during approval. The 20260506 BEFORE UPDATE trigger continues to lock those columns from non-admin writes, so a learner cannot self-elevate by tampering with this field either.';

-- Index the pending queue by requested role so the admin can filter
-- "show me all faculty awaiting approval" without a sequential scan.
-- Partial index limits storage to rows that actually need attention.
create index profiles_pending_role_idx
  on public.profiles (requested_role, profile_completed_at)
  where approved_at is null and profile_completed_at is not null;
