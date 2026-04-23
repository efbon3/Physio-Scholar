-- RLS isolation + CHECK-constraint tests for card_states + reviews.
-- Complements rls.sql (which covers institutions/profiles/subscriptions/
-- study_sessions) — keeping SRS checks in their own file so failures
-- point at the right subsystem.

create extension if not exists pgtap with schema extensions;

begin;

select plan(15);

-- Fixtures -----------------------------------------------------------

insert into auth.users (id, email, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@srs.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@srs.example',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   '{}'::jsonb, '{}'::jsonb, now(), now());

-- Seed one card_state for each user, as service_role.
insert into public.card_states (profile_id, card_id, ease, interval_days, status, due_at)
values
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:1', 2.5, 0, 'learning', now()),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frank-starling:1', 2.5, 0, 'learning', now());

insert into public.reviews (profile_id, card_id, rating, hints_used, time_spent_seconds)
values
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:1', 'good', 0, 25),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frank-starling:1', 'hard', 1, 40);

-- Authenticate as Alice ----------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 1. Alice sees exactly one card_state row (her own).
select is(
  (select count(*)::int from public.card_states),
  1,
  'Alice sees exactly one card_state'
);

-- 2. It is hers, not Bob's.
select is(
  (select profile_id from public.card_states),
  '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'The card_state Alice sees is her own'
);

-- 3. Alice can insert a new card_state under her own id.
select lives_ok(
  $$ insert into public.card_states (profile_id, card_id, ease, interval_days, status, due_at)
     values ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:2', 2.5, 0, 'learning', now()) $$,
  'Alice can insert her own card_state'
);

-- 4. Alice cannot insert under Bob's id — WITH CHECK fails.
select throws_ok(
  $$ insert into public.card_states (profile_id, card_id, ease, interval_days, status, due_at)
     values ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frank-starling:2', 2.5, 0, 'learning', now()) $$,
  '42501',
  null,
  'Alice cannot insert a card_state under Bob''s profile_id'
);

-- 5. Alice can update her own card_state (new ease after Good rating).
select lives_ok(
  $$ update public.card_states
     set ease = 2.5, interval_days = 1, status = 'review'
     where profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
       and card_id = 'frank-starling:1' $$,
  'Alice can update her own card_state'
);

-- 6. Alice cannot UPDATE to reassign a card_state to Bob.
select throws_ok(
  $$ update public.card_states
     set profile_id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     where card_id = 'frank-starling:1' and profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501',
  null,
  'Alice cannot UPDATE card_state to assign Bob''s profile_id'
);

-- 7. Reviews: Alice sees only her own review row.
select is(
  (select count(*)::int from public.reviews),
  1,
  'Alice sees exactly one review (her own)'
);

-- 8. Reviews insert allowed for self.
select lives_ok(
  $$ insert into public.reviews (profile_id, card_id, rating, hints_used, time_spent_seconds)
     values ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:1', 'good', 0, 10) $$,
  'Alice can insert her own review row'
);

-- 9. Reviews update is NOT allowed (no UPDATE policy exists).
--    Postgres reports the UPDATE as success with zero rows affected.
select lives_ok(
  $$ update public.reviews set rating = 'again'
     where profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'UPDATE on reviews does not error (RLS hides all rows from update)'
);

-- Pop to admin to verify no review was actually mutated by Alice's UPDATE.
reset role;
select set_config('request.jwt.claims', '', true);

select is(
  (select count(*)::int from public.reviews
   where profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and rating = 'again'),
  0,
  'No Alice-owned review was flipped to again (reviews are immutable via client)'
);

-- Back to Alice for the remaining tests.
select set_config('request.jwt.claims',
  '{"sub":"11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

-- 10. Reviews DELETE not allowed.
select lives_ok(
  $$ delete from public.reviews where profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'DELETE on reviews runs but affects zero rows'
);

reset role;
select set_config('request.jwt.claims', '', true);
select is(
  (select count(*)::int from public.reviews
   where profile_id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  2, -- original seed + Alice's later insert; DELETE was a no-op
  'Alice''s review rows still exist — DELETE is blocked'
);

-- CHECK constraints (not RLS, but worth asserting as data invariants) --

-- Drop to postgres so the constraint checks aren't shadowed by RLS.
-- These run against the service_role bypassing RLS.

-- 11. Ease floor (>= 1.5) rejected.
select throws_ok(
  $$ insert into public.card_states (profile_id, card_id, ease, due_at)
     values ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:3', 1.4, now()) $$,
  '23514',
  null,
  'CHECK constraint rejects ease below the 1.5 floor'
);

-- 12. card_id format rejected.
select throws_ok(
  $$ insert into public.card_states (profile_id, card_id, due_at)
     values ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NOT A VALID ID', now()) $$,
  '23514',
  null,
  'CHECK constraint rejects malformed card_id'
);

-- 13. hints_used out of range rejected.
select throws_ok(
  $$ insert into public.reviews (profile_id, card_id, rating, hints_used)
     values ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'frank-starling:1', 'good', 4) $$,
  '23514',
  null,
  'CHECK constraint rejects hints_used above 3'
);

select * from finish();
rollback;
