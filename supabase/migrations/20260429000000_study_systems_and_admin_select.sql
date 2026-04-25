-- Phase 5+ J0 — per-student "active organ systems" + admin SELECT on profiles.
--
-- Two changes bundled:
--
-- 1. profiles.study_systems text[] — the organ systems a learner has
--    actively chosen to study. Default is "all systems," matching the
--    organ_system enum in src/lib/content/schema.ts. The review queue
--    filters cards by mechanism.organ_system IN study_systems so a
--    student studying cardiovascular this week doesn't see renal cards
--    mixed in.
--
-- 2. profiles_select_admin policy — admins can SELECT every profile
--    (needed for /admin/users which shipped in F1 and was silently
--    only showing the admin's own row due to the missing policy).
--    Recursive subquery is safe because auth.uid() always matches
--    profiles_select_own, breaking the loop.

alter table public.profiles
  add column study_systems text[] not null
    default array[
      'cardiovascular',
      'respiratory',
      'renal',
      'gastrointestinal',
      'endocrine',
      'nervous',
      'musculoskeletal',
      'reproductive',
      'blood',
      'immune',
      'integumentary'
    ]::text[];

comment on column public.profiles.study_systems is
  'Organ systems the learner has actively selected. Review queue filters cards to mechanisms whose organ_system is in this array. Defaults to all systems for new profiles.';

create policy profiles_select_admin
  on public.profiles
  for select
  to authenticated
  using (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );
