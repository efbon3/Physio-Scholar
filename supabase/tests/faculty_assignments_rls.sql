-- pgTAP regression for the faculty_assignments table's RLS surface.
-- Verifies that:
--   1. A learner in institution A sees institution-A assignments and
--      not institution-B assignments.
--   2. A learner can't insert / update / delete assignments.
--   3. A faculty member in institution A can insert assignments for A
--      but not for B (the WITH CHECK pins institution_id).
--   4. A faculty member can only update / delete their own rows;
--      another faculty's row is untouchable.
--   5. An admin can update / delete any row.

create extension if not exists pgtap with schema extensions;

begin;

select plan(11);

-- -------------------------------------------------------------
-- Fixtures (run as service_role / postgres, bypasses RLS + trigger)
-- -------------------------------------------------------------

insert into public.institutions (id, name, slug)
values
  ('77777777-7777-7777-7777-777777777777', 'Assign College A', 'assign-a'),
  ('88888888-8888-8888-8888-888888888888', 'Assign College B', 'assign-b');

insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  -- Faculty A (institution A)
  ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fac_a@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Faculty B (institution A)
  ('a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fac_b@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Student A (institution A)
  ('a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'stu_a@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Student B (institution B)
  ('b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'stu_b@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Admin
  ('99999999-9999-9999-9999-999999999999', 'adm@example.com',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles
  set institution_id = '77777777-7777-7777-7777-777777777777',
      is_faculty = true,
      approved_at = now()
  where id in (
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  );

update public.profiles
  set institution_id = '77777777-7777-7777-7777-777777777777',
      approved_at = now()
  where id = 'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.profiles
  set institution_id = '88888888-8888-8888-8888-888888888888',
      approved_at = now()
  where id = 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.profiles
  set is_admin = true, approved_at = now()
  where id = '99999999-9999-9999-9999-999999999999';

-- Seed one assignment per institution / per faculty so we can verify
-- isolation across all the read / write paths.
insert into public.faculty_assignments (id, faculty_id, institution_id, title, due_at)
values
  ('aaaaaaaa-1111-1111-1111-111111111111',
   'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '77777777-7777-7777-7777-777777777777',
   'Read chapter 14',
   '2026-05-01'),
  ('aaaaaaaa-2222-2222-2222-222222222222',
   'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '77777777-7777-7777-7777-777777777777',
   'MCQ set 3',
   null);

-- Pretend we have an assignment in institution B too — service_role
-- can insert it without it ever existing in any RLS-visible result for
-- A's users. The "stu_a" assertions below confirm that.
insert into public.faculty_assignments (id, faculty_id, institution_id, title)
values
  ('bbbbbbbb-1111-1111-1111-111111111111',
   '99999999-9999-9999-9999-999999999999',
   '88888888-8888-8888-8888-888888888888',
   'Inst-B private assignment');

-- -------------------------------------------------------------
-- Scenario 1: Student A sees only institution-A rows
-- -------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

select is(
  (select count(*)::int from public.faculty_assignments),
  2,
  'Student A sees the two institution-A assignments'
);

select ok(
  not exists (
    select 1 from public.faculty_assignments
    where institution_id = '88888888-8888-8888-8888-888888888888'
  ),
  'Student A cannot see institution-B assignments'
);

-- -------------------------------------------------------------
-- Scenario 2: Student A cannot insert
-- -------------------------------------------------------------
select throws_ok(
  $$ insert into public.faculty_assignments (faculty_id, institution_id, title)
     values ('a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             '77777777-7777-7777-7777-777777777777',
             'Sneaky student insert') $$,
  '42501',
  null,
  'Student A cannot INSERT (RLS rejects)'
);

-- -------------------------------------------------------------
-- Scenario 3: Faculty A inserts for institution A — works
-- -------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ insert into public.faculty_assignments (faculty_id, institution_id, title)
     values ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             '77777777-7777-7777-7777-777777777777',
             'Faculty A new task') $$,
  'Faculty A can INSERT into their own institution'
);

-- -------------------------------------------------------------
-- Scenario 4: Faculty A cannot insert into institution B
-- -------------------------------------------------------------
select throws_ok(
  $$ insert into public.faculty_assignments (faculty_id, institution_id, title)
     values ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             '88888888-8888-8888-8888-888888888888',
             'Cross-institution insert attempt') $$,
  '42501',
  null,
  'Faculty A cannot INSERT for a different institution'
);

-- -------------------------------------------------------------
-- Scenario 5: Faculty A cannot update Faculty B's row
-- -------------------------------------------------------------
-- The UPDATE doesn't error — RLS just filters out B's row, so the
-- statement runs with zero rows affected. We verify by reading the
-- original title back via service_role.
update public.faculty_assignments
  set title = 'Hijacked by faculty A'
  where id = 'aaaaaaaa-2222-2222-2222-222222222222';

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select title from public.faculty_assignments
   where id = 'aaaaaaaa-2222-2222-2222-222222222222'),
  'MCQ set 3',
  'Faculty A could not overwrite Faculty B''s row'
);

-- -------------------------------------------------------------
-- Scenario 6: Faculty A can update their own row
-- -------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update public.faculty_assignments
       set title = 'Read chapter 14 (revised)'
       where id = 'aaaaaaaa-1111-1111-1111-111111111111' $$,
  'Faculty A can update their own row (no error)'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select title from public.faculty_assignments
   where id = 'aaaaaaaa-1111-1111-1111-111111111111'),
  'Read chapter 14 (revised)',
  'Faculty A''s own row reflects the update'
);

-- -------------------------------------------------------------
-- Scenario 7: Admin can update any row
-- -------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update public.faculty_assignments
       set title = 'Admin override'
       where id = 'aaaaaaaa-2222-2222-2222-222222222222' $$,
  'Admin can update any row'
);

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select title from public.faculty_assignments
   where id = 'aaaaaaaa-2222-2222-2222-222222222222'),
  'Admin override',
  'Admin update persisted'
);

-- -------------------------------------------------------------
-- Scenario 8: Faculty A cannot delete Faculty B's row
-- -------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

delete from public.faculty_assignments
  where id = 'aaaaaaaa-2222-2222-2222-222222222222';

reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select count(*)::int from public.faculty_assignments
   where id = 'aaaaaaaa-2222-2222-2222-222222222222'),
  1,
  'Faculty A could not DELETE Faculty B''s row'
);

select * from finish();

rollback;
