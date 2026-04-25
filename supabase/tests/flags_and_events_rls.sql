-- RLS isolation tests for content_flags + exam_events.
--
-- Build-spec acceptance criterion 366 mandates:
--   "RLS policies tested: student A cannot read student B's data
--    under any code path."
--
-- rls.sql + srs_persistence.sql cover the original tables; this file
-- extends coverage to the post-MVP additions:
--
--   content_flags        — admin-and-content-flags migration
--   exam_events          — calendar / J7 migration
--                          (audience='institution' vs 'personal')
--
-- Runs via `supabase test db` (pgTAP).

create extension if not exists pgtap with schema extensions;

begin;

select plan(27);

-- ----------------------------------------------------------------------
-- Fixtures (service_role / postgres bypasses RLS)
-- ----------------------------------------------------------------------

insert into public.institutions (id, name, slug)
values
  ('33333333-3333-3333-3333-333333333333', 'College Flags A', 'flags-college-a'),
  ('44444444-4444-4444-4444-444444444444', 'College Flags B', 'flags-college-b');

insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  -- Alice — student in College Flags A
  ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@flags.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Bob — student in College Flags B (different institution)
  ('b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@flags.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Carol — admin (sees flags from any student)
  ('c3333333-cccc-cccc-cccc-cccccccccccc', 'carol@flags.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  -- Diana — faculty in College Flags A
  ('d4444444-dddd-dddd-dddd-dddddddddddd', 'diana@flags.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles
  set institution_id = '33333333-3333-3333-3333-333333333333', full_name = 'Alice Flags'
  where id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
update public.profiles
  set institution_id = '44444444-4444-4444-4444-444444444444', full_name = 'Bob Flags'
  where id = 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
update public.profiles
  set is_admin = true, full_name = 'Carol Admin'
  where id = 'c3333333-cccc-cccc-cccc-cccccccccccc';
update public.profiles
  set institution_id = '33333333-3333-3333-3333-333333333333',
      is_faculty = true, full_name = 'Diana Faculty'
  where id = 'd4444444-dddd-dddd-dddd-dddddddddddd';

-- Seed flags + events for both audiences.
insert into public.content_flags (id, profile_id, card_id, reason, status)
values
  ('11111111-f111-f111-f111-f111f111f111',
   'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:1', 'wrong answer key', 'open'),
  ('22222222-f222-f222-f222-f222f222f222',
   'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frank-starling:2', 'unclear stem', 'open');

insert into public.exam_events (id, audience, institution_id, title, kind, organ_systems, starts_at)
values
  ('e1111111-1111-1111-1111-111111111111', 'institution',
   '33333333-3333-3333-3333-333333333333', 'College A midterm',
   'exam', array['cardiovascular'], current_date + 5);

insert into public.exam_events (id, audience, institution_id, title, kind, organ_systems, starts_at)
values
  ('e2222222-2222-2222-2222-222222222222', 'institution',
   '44444444-4444-4444-4444-444444444444', 'College B midterm',
   'exam', array['cardiovascular'], current_date + 5);

insert into public.exam_events (id, audience, owner_id, title, kind, organ_systems, starts_at)
values
  ('e3333333-3333-3333-3333-333333333333', 'personal',
   'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alice''s mock test',
   'exam', array['cardiovascular'], current_date + 7);

insert into public.exam_events (id, audience, owner_id, title, kind, organ_systems, starts_at)
values
  ('e4444444-4444-4444-4444-444444444444', 'personal',
   'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bob''s mock test',
   'exam', array['cardiovascular'], current_date + 7);

-- ----------------------------------------------------------------------
-- content_flags — Alice as authenticated student
-- ----------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 1. Alice sees only her own flag, not Bob's.
select is(
  (select count(*)::int from public.content_flags),
  1,
  'Alice sees exactly one content_flag (her own)'
);

select is(
  (select profile_id from public.content_flags),
  'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'The content_flag Alice sees is her own'
);

-- 2. Alice can insert a new flag under her own profile_id.
select lives_ok(
  $$ insert into public.content_flags (profile_id, card_id, reason)
     values ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'nephron:1', 'typo in stem') $$,
  'Alice can insert her own content_flag'
);

-- 3. Alice cannot insert a flag under Bob's profile_id.
select throws_ok(
  $$ insert into public.content_flags (profile_id, card_id, reason)
     values ('b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nephron:1', 'forgery attempt') $$,
  '42501',
  null,
  'Alice cannot insert a content_flag under Bob''s profile_id'
);

-- 4. Alice cannot UPDATE Bob's flag — RLS filters the row out.
select lives_ok(
  $$ update public.content_flags set status = 'resolved'
     where id = '22222222-f222-f222-f222-f222f222f222' $$,
  'UPDATE on Bob''s content_flag does not error from Alice (RLS hides the row)'
);

-- ----------------------------------------------------------------------
-- content_flags — Carol as admin
-- ----------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', '', true);
select set_config('request.jwt.claims',
  '{"sub":"c3333333-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
set local role authenticated;

-- 5. Carol (admin) sees every flag — Alice's, Alice's later insert, Bob's.
select cmp_ok(
  (select count(*)::int from public.content_flags),
  '>=',
  3,
  'Carol (admin) sees every content_flag across students'
);

-- 6. Carol can update any flag's status (admin update policy).
select lives_ok(
  $$ update public.content_flags set status = 'resolved',
       resolved_by = 'c3333333-cccc-cccc-cccc-cccccccccccc',
       resolved_at = now()
     where id = '22222222-f222-f222-f222-f222f222f222' $$,
  'Carol (admin) can mark Bob''s content_flag as resolved'
);

-- Verify the update actually landed.
reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select status::text from public.content_flags
   where id = '22222222-f222-f222-f222-f222f222f222'),
  'resolved',
  'Bob''s content_flag was marked resolved by Carol (admin)'
);

-- ----------------------------------------------------------------------
-- exam_events — Alice (student in institution A)
-- ----------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 7. Alice sees institution-A institution events but not B's.
select is(
  (select count(*)::int from public.exam_events
   where audience = 'institution'),
  1,
  'Alice sees exactly one institution event (her own institution''s)'
);

select is(
  (select institution_id from public.exam_events
   where audience = 'institution'),
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Alice sees institution A''s event, not B''s'
);

-- 8. Alice sees her own personal event but not Bob's.
select is(
  (select count(*)::int from public.exam_events
   where audience = 'personal'),
  1,
  'Alice sees exactly one personal event (her own)'
);

select is(
  (select owner_id from public.exam_events
   where audience = 'personal'),
  'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'The personal event Alice sees is hers'
);

-- 9. Alice can insert her own personal event.
select lives_ok(
  $$ insert into public.exam_events (audience, owner_id, title, kind, organ_systems, starts_at)
     values ('personal', 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             'Alice retake', 'milestone', '{}'::text[], current_date + 14) $$,
  'Alice can insert her own personal exam_event'
);

-- 10. Alice cannot insert a personal event under Bob's owner_id.
select throws_ok(
  $$ insert into public.exam_events (audience, owner_id, title, kind, organ_systems, starts_at)
     values ('personal', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
             'Forged event', 'milestone', '{}'::text[], current_date + 14) $$,
  '42501',
  null,
  'Alice cannot insert a personal exam_event under Bob''s owner_id'
);

-- 11. Alice (no is_faculty) cannot insert an institution event.
select throws_ok(
  $$ insert into public.exam_events (audience, institution_id, title, kind, organ_systems, starts_at)
     values ('institution', '33333333-3333-3333-3333-333333333333',
             'Bogus institution event', 'exam', '{}'::text[], current_date + 14) $$,
  '42501',
  null,
  'Alice (student, not faculty) cannot insert an institution-audience event'
);

-- 12. Alice can update her own personal event.
select lives_ok(
  $$ update public.exam_events set title = 'Alice retake (revised)'
     where id = 'e3333333-3333-3333-3333-333333333333' $$,
  'Alice can update her own personal event'
);

-- 13. Alice cannot update Bob's personal event — RLS hides the row.
select lives_ok(
  $$ update public.exam_events set title = 'hijacked'
     where id = 'e4444444-4444-4444-4444-444444444444' $$,
  'UPDATE targeting Bob''s personal event from Alice does not error (filtered)'
);

-- Verify Bob's event was not actually mutated.
reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select title from public.exam_events
   where id = 'e4444444-4444-4444-4444-444444444444'),
  'Bob''s mock test',
  'Bob''s personal event title is unchanged after Alice''s UPDATE attempt'
);

-- 14. Alice cannot delete Bob's personal event.
select set_config('request.jwt.claims',
  '{"sub":"a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ delete from public.exam_events
     where id = 'e4444444-4444-4444-4444-444444444444' $$,
  'DELETE on Bob''s event from Alice does not error (RLS filters the row)'
);

reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select count(*)::int from public.exam_events
   where id = 'e4444444-4444-4444-4444-444444444444'),
  1,
  'Bob''s personal event still exists after Alice''s DELETE attempt'
);

-- ----------------------------------------------------------------------
-- exam_events — Diana (faculty in institution A)
-- ----------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"d4444444-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}', true);
set local role authenticated;

-- 15. Diana (faculty A) can insert an institution event for institution A.
select lives_ok(
  $$ insert into public.exam_events (audience, institution_id, title, kind, organ_systems, starts_at)
     values ('institution', '33333333-3333-3333-3333-333333333333',
             'Diana''s pop quiz', 'milestone', '{}'::text[], current_date + 3) $$,
  'Diana (faculty A) can insert an institution-audience event for institution A'
);

-- 16. Diana cannot insert an institution event for institution B.
select throws_ok(
  $$ insert into public.exam_events (audience, institution_id, title, kind, organ_systems, starts_at)
     values ('institution', '44444444-4444-4444-4444-444444444444',
             'Cross-institution event', 'milestone', '{}'::text[], current_date + 3) $$,
  '42501',
  null,
  'Diana (faculty A) cannot insert an institution event for institution B'
);

-- ----------------------------------------------------------------------
-- exam_events — Bob (institution B)
-- ----------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);
set local role authenticated;

-- 17. Bob sees institution B's institution events, not A's.
select is(
  (select count(*)::int from public.exam_events
   where audience = 'institution'
     and institution_id = '33333333-3333-3333-3333-333333333333'),
  0,
  'Bob (institution B) sees zero events from institution A'
);

select cmp_ok(
  (select count(*)::int from public.exam_events
   where audience = 'institution'
     and institution_id = '44444444-4444-4444-4444-444444444444'),
  '>=',
  1,
  'Bob sees institution B''s events'
);

-- 18. Bob sees his own personal events but not Alice's.
select is(
  (select count(*)::int from public.exam_events
   where audience = 'personal'
     and owner_id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  0,
  'Bob sees zero of Alice''s personal events'
);

-- ----------------------------------------------------------------------
-- Anonymous role — zero visibility to everything
-- ----------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select is(
  (select count(*)::int from public.content_flags),
  0,
  'anon sees zero content_flags'
);

select is(
  (select count(*)::int from public.exam_events),
  0,
  'anon sees zero exam_events'
);

reset role;

select * from finish();
rollback;
