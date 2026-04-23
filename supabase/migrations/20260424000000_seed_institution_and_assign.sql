-- Seed the single v1-pilot institution and make sure every new signup is
-- attached to it. Closes the gap caught in the pre-Phase-2 review:
-- handle_new_user() created profiles with institution_id NULL, so the
-- institutions_select_own RLS policy (joined via that FK) returned zero rows
-- to every newly-signed-up user.

-- The deterministic UUID keeps local + remote in sync without a separate
-- mapping table; `on conflict (slug) do nothing` makes the migration
-- idempotent for re-apply scenarios.
insert into public.institutions (id, name, slug, country, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Pilot Cohort (v1)',
  'pilot-cohort',
  'IN',
  'Asia/Kolkata'
)
on conflict (slug) do nothing;

-- Rewrite handle_new_user() so the trigger assigns the default institution
-- to every auto-created profile. Same SECURITY DEFINER posture so the
-- insert can bypass RLS (which would otherwise deny a freshly-authenticated
-- user from creating their own profile row).
--
-- We look up the institution by slug rather than hardcoding the UUID so
-- the function stays valid if the seed UUID is ever intentionally changed
-- (e.g. multi-tenant expansion in v2 uses invite codes to pick a different
-- institution_id at signup time).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_institution_id uuid;
begin
  select id into default_institution_id
  from public.institutions
  where slug = 'pilot-cohort'
  limit 1;

  insert into public.profiles (id, institution_id)
  values (new.id, default_institution_id);
  return new;
end;
$$;

comment on function public.handle_new_user is
  'Creates a blank public.profiles row (with default institution_id) when auth.users grows. Consent columns stay NULL until the signup flow records them explicitly.';
