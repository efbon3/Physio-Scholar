-- Default-institution assignment tests.
-- A new auth.users row must result in a profile with institution_id
-- pointing at the seeded 'pilot-cohort' institution.

create extension if not exists pgtap with schema extensions;

begin;

select plan(4);

-- 1. The migration seeded exactly one institution with slug pilot-cohort.
select is(
  (select count(*)::int from public.institutions where slug = 'pilot-cohort'),
  1,
  'pilot-cohort institution is seeded by migration 20260424000000'
);

-- 2. Its id is the deterministic UUID the migration uses.
select is(
  (select id from public.institutions where slug = 'pilot-cohort'),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'pilot-cohort has the deterministic UUID'
);

-- 3. Insert a fresh auth.users row; handle_new_user() should create the
--    profile AND attach it to pilot-cohort.
insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'newuser@example.com',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  '{}'::jsonb, '{}'::jsonb, now(), now()
);

select is(
  (select institution_id from public.profiles
   where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'new signup is auto-assigned to pilot-cohort by handle_new_user trigger'
);

-- 4. Consent columns stay NULL — the signup flow must record them
--    explicitly, we don't fabricate consent we didn't receive.
select is(
  (select consent_terms_accepted_at from public.profiles
   where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  null,
  'consent_terms_accepted_at is NULL until the signup flow records it'
);

select * from finish();
rollback;
