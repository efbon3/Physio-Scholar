-- Phase 5+ — Profile-completion gate.
--
-- Author requirement (2026-04-26): "in the first signup, they should
-- first complete their profile. then only they can see the dashboard."
-- Mandatory: name, nickname, mobile, college, roll number. Optional:
-- DOB, address, photo. The signup form itself is reduced to email +
-- password + consent; a dedicated /complete-profile page collects the
-- rest before the user can reach /pending-approval (which is itself
-- gated on admin approval).
--
-- This migration adds the two columns we don't already have
-- (`nickname`, `college_name`) plus `profile_completed_at` — the
-- timestamp the (app) layout's gate checks. `full_name`, `phone`,
-- `roll_number`, `date_of_birth`, `address`, `avatar_url` are all
-- already on profiles from earlier migrations.
--
-- Back-fill posture: existing approved learners (created before this
-- migration shipped) should not be locked out behind the gate. We
-- stamp `profile_completed_at = created_at` for every existing row.
-- New profiles default to NULL → must complete the form first.

alter table public.profiles
  add column nickname text,
  add column college_name text,
  add column profile_completed_at timestamptz;

comment on column public.profiles.nickname is
  'Short display name. Mandatory; collected on /complete-profile after signup.';

comment on column public.profiles.college_name is
  'Free-text college / institution name. Mandatory; collected on /complete-profile.';

comment on column public.profiles.profile_completed_at is
  'When the learner finished the /complete-profile form. NULL = the (app) layout redirects to /complete-profile before any learner surface renders.';

-- Retroactive completion for existing rows so current users keep
-- working. They were already on the platform before the gate existed;
-- locking them out would be a regression.
update public.profiles
  set profile_completed_at = created_at
  where profile_completed_at is null;

-- Index for the admin-pending query: list every profile where
-- approved_at is null *and* profile_completed_at is not null (the
-- ones actually waiting on a human). Partial index keeps it tiny.
create index profiles_awaiting_approval_idx
  on public.profiles (profile_completed_at)
  where approved_at is null and profile_completed_at is not null;
