-- pgTAP regression for the BEFORE UPDATE trigger that locks admin-only
-- profile columns against direct REST writes. See migration
-- 20260506000000_profiles_column_lock.sql for the full background.
--
-- Each scenario seeds two users (one admin, one learner), authenticates
-- as the appropriate JWT, runs an UPDATE that the trigger should clamp,
-- and asserts the OLD value is preserved.

create extension if not exists pgtap with schema extensions;

begin;

select plan(15);

-- -------------------------------------------------------------
-- Fixtures (run as service_role / postgres, bypasses RLS + trigger)
-- -------------------------------------------------------------

insert into public.institutions (id, name, slug)
values
  ('33333333-3333-3333-3333-333333333333', 'Lock Test College', 'lock-test'),
  ('44444444-4444-4444-4444-444444444444', 'Other College',     'other-college');

insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'carla@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'dave@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now());

-- Carla is a regular learner with profile already completed and approved.
-- (We snapshot real values into OLD so the trigger has something to revert
-- to when she tries to escalate.)
update public.profiles
  set institution_id        = '33333333-3333-3333-3333-333333333333',
      full_name             = 'Carla',
      approved_at           = '2026-01-01 00:00:00+00',
      approved_by           = 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      profile_completed_at  = '2026-01-01 00:00:00+00',
      is_admin              = false,
      is_faculty            = false
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Dave is the admin. He's seeded with is_admin = true so the trigger's
-- caller-admin lookup actually returns true for him.
update public.profiles
  set institution_id = '44444444-4444-4444-4444-444444444444',
      full_name      = 'Dave',
      is_admin       = true
  where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- -------------------------------------------------------------
-- Scenario 1: Non-admin tries to escalate to admin
-- -------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

-- The UPDATE itself succeeds (no error) — the trigger silently snaps
-- the new value back to OLD. This is by design: returning an error
-- would tip the caller off that the column is meaningful. Better to
-- accept the write and discard the elevation attempt.
select lives_ok(
  $$ update public.profiles
       set is_admin = true,
           is_faculty = true,
           approved_at = '2027-01-01',
           approved_by = 'cccccccc-cccc-cccc-cccc-cccccccccccc',
           institution_id = '44444444-4444-4444-4444-444444444444'
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Carla can attempt to update locked columns (no error)'
);

reset role;
select set_config('request.jwt.claims', '', true);

-- Verify NONE of the locked columns actually moved.
select is(
  (select is_admin from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  false,
  'Trigger reverted is_admin — no self-promotion'
);

select is(
  (select is_faculty from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  false,
  'Trigger reverted is_faculty'
);

select is(
  (select approved_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '2026-01-01 00:00:00+00'::timestamptz,
  'Trigger reverted approved_at — no self-approval'
);

select is(
  (select institution_id from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Trigger reverted institution_id'
);

-- -------------------------------------------------------------
-- Scenario 2: Non-admin can still update legitimate columns
-- -------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update public.profiles
       set nickname = 'Carlita',
           college_name = 'Lock Test',
           full_name = 'Carla Renamed'
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Carla can update nickname / college / full_name'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select nickname from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'Carlita',
  'Legitimate update for nickname persisted'
);

-- -------------------------------------------------------------
-- Scenario 3: profile_completed_at — one-shot NULL → timestamp
-- -------------------------------------------------------------

-- Reset Carla's profile_completed_at to NULL so we can test the
-- legitimate first-time set from the /complete-profile flow.
update public.profiles
  set profile_completed_at = null
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select set_config('request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

-- First-time set: NULL → timestamp. Trigger lets it through.
select lives_ok(
  $$ update public.profiles
       set profile_completed_at = '2026-04-26 12:00:00+00'
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Carla can set profile_completed_at when it was NULL'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select profile_completed_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '2026-04-26 12:00:00+00'::timestamptz,
  'First-time profile_completed_at write persisted'
);

-- Re-stamping: trigger should snap back to the established value.
select set_config('request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

update public.profiles
  set profile_completed_at = '2099-01-01 00:00:00+00'
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select profile_completed_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '2026-04-26 12:00:00+00'::timestamptz,
  'Trigger blocked re-stamp of profile_completed_at after first set'
);

-- -------------------------------------------------------------
-- Scenario 4: Admin caller bypasses the lock
-- -------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update public.profiles
       set approved_at = '2099-01-01 00:00:00+00',
           is_faculty = true
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Dave (admin) can update locked columns on another profile'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select approved_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '2099-01-01 00:00:00+00'::timestamptz,
  'Admin update for approved_at persisted (lock bypassed for admins)'
);

-- -------------------------------------------------------------
-- Scenario 5: rejected_at / rejection_reason are locked too
-- -------------------------------------------------------------
-- Admin marks Carla rejected (using the admin session above is fine,
-- but reset to keep this scenario hermetic).
update public.profiles
  set rejected_at = '2026-04-26 09:00:00+00',
      rejection_reason = 'Initial reason',
      rejected_by = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select set_config('request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

-- Rejected user tries to clear their own rejection. Trigger snaps it back.
select lives_ok(
  $$ update public.profiles
       set rejected_at = null,
           rejection_reason = 'No, I am fine actually',
           rejected_by = null
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Carla can attempt to clear rejected_at (no error)'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select rejected_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  '2026-04-26 09:00:00+00'::timestamptz,
  'Trigger reverted rejected_at — no self-unreject'
);

select is(
  (select rejection_reason from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'Initial reason',
  'Trigger reverted rejection_reason'
);

-- Admin can clear the rejection (the proper unreject flow).
select set_config('request.jwt.claims',
  '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update public.profiles
       set rejected_at = null,
           rejection_reason = null,
           rejected_by = null
       where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  'Dave (admin) can clear rejected_at on another profile'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select rejected_at from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  null::timestamptz,
  'Admin unreject persisted (lock bypassed for admins)'
);

select * from finish();

rollback;
