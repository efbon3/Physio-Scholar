-- RLS isolation tests.
-- Runs via `supabase test db` (pgTAP). Two fake users in two institutions;
-- every assertion verifies a row owned by user B is invisible/unwritable
-- to user A, and vice versa.

-- pgTAP is part of Supabase's available extensions. Creating it idempotently
-- here keeps the test file self-contained.
create extension if not exists pgtap with schema extensions;

begin;

select plan(20);

-- -------------------------------------------------------------
-- Fixtures (run as service_role / postgres, bypasses RLS)
-- -------------------------------------------------------------

insert into public.institutions (id, name, slug)
values
  ('11111111-1111-1111-1111-111111111111', 'College A', 'college-a'),
  ('22222222-2222-2222-2222-222222222222', 'College B', 'college-b');

-- Insert auth.users → handle_new_user trigger auto-creates profiles rows.
insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles
  set institution_id = '11111111-1111-1111-1111-111111111111', full_name = 'Alice'
  where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.profiles
  set institution_id = '22222222-2222-2222-2222-222222222222', full_name = 'Bob'
  where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

insert into public.subscriptions (profile_id, tier, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pilot', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pilot', 'active');

insert into public.study_sessions (profile_id, system_slug)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cardiovascular'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cardiovascular');

-- -------------------------------------------------------------
-- Authenticate as Alice
-- -------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 1. Alice sees her own institution — and only her own.
select is(
  (select count(*)::int from public.institutions),
  1,
  'Alice sees exactly one institution (her own)'
);

select is(
  (select slug from public.institutions),
  'college-a',
  'Alice sees College A, not College B'
);

-- 2. Alice sees only her own profile.
select is(
  (select count(*)::int from public.profiles),
  1,
  'Alice sees exactly one profile row'
);

select is(
  (select id from public.profiles),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'The profile Alice sees is her own'
);

-- 3. Alice can update her own profile (e.g. set consent).
select lives_ok(
  $$ update public.profiles set consent_analytics = true
     where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'Alice can update her own profile'
);

select is(
  (select consent_analytics from public.profiles),
  true,
  'Consent update persisted for Alice'
);

-- 4. Alice attempting to update Bob's profile: RLS filters the row out of
--    the update target set, so UPDATE succeeds with zero rows affected.
select lives_ok(
  $$ update public.profiles set consent_analytics = true
     where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'UPDATE targeting Bob from Alice is silently filtered (not an error)'
);

-- Pop back to admin role to read across all rows and verify Bob untouched.
reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select consent_analytics from public.profiles
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  false,
  'Bob''s profile was not actually updated by Alice'
);

-- Back to Alice.
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 5. Alice cannot delete profiles (no DELETE policy). Statement runs with
--    zero rows affected.
select lives_ok(
  $$ delete from public.profiles
     where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'DELETE from profiles does not error (RLS hides the row from the operation)'
);

reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select count(*)::int from public.profiles
   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  1,
  'Alice''s profile is still present — DELETE had no effect'
);
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 6. Alice sees only her own subscription.
select is(
  (select count(*)::int from public.subscriptions),
  1,
  'Alice sees exactly one subscription'
);

select is(
  (select profile_id from public.subscriptions),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'The subscription Alice sees is her own'
);

-- 7. Alice cannot insert a subscription (no INSERT policy for authenticated).
select throws_ok(
  $$ insert into public.subscriptions (profile_id, tier, status)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'student', 'active') $$,
  '42501',
  null,
  'Alice cannot INSERT a subscription row'
);

-- 8. Alice sees only her own study_sessions.
select is(
  (select count(*)::int from public.study_sessions),
  1,
  'Alice sees exactly one study_session'
);

-- 9. Alice can create her own study_session.
select lives_ok(
  $$ insert into public.study_sessions (profile_id, system_slug)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'renal') $$,
  'Alice can insert a study_session where profile_id = herself'
);

-- 10. Alice cannot create a study_session under Bob's id — WITH CHECK fails.
select throws_ok(
  $$ insert into public.study_sessions (profile_id, system_slug)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'renal') $$,
  '42501',
  null,
  'Alice cannot INSERT a study_session under Bob''s profile_id'
);

-- 11. Alice can update her own session.
select lives_ok(
  $$ update public.study_sessions
     set status = 'completed', ended_at = now()
     where profile_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'Alice can update her own study_session'
);

-- 12. Alice cannot UPDATE to reassign a session to Bob (WITH CHECK fails).
select throws_ok(
  $$ update public.study_sessions
     set profile_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     where profile_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501',
  null,
  'Alice cannot UPDATE study_session to assign Bob''s profile_id'
);

-- -------------------------------------------------------------
-- Authenticate as anon — zero visibility to all four tables
-- -------------------------------------------------------------
reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select is(
  (select count(*)::int from public.institutions),
  0,
  'anon sees zero institutions'
);

select is(
  (select count(*)::int from public.profiles),
  0,
  'anon sees zero profiles'
);

reset role;

select * from finish();
rollback;
