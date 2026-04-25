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
--
--    Implementation note: a naive `(select is_admin from profiles
--    where id = auth.uid())` inside the policy's USING clause causes
--    `infinite recursion detected in policy for relation profiles`
--    — the SELECT on profiles re-triggers all SELECT policies,
--    including this one. We sidestep with a SECURITY DEFINER helper
--    that bypasses RLS for its own internal lookup. The function is
--    `stable` so Postgres can cache the result per statement.

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

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(p.is_admin, false)
  from public.profiles p
  where p.id = (select auth.uid());
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

create policy profiles_select_admin
  on public.profiles
  for select
  to authenticated
  using (public.is_current_user_admin());
