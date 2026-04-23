-- Row-Level Security policies for the four public tables.
-- A2 enabled RLS on every table with no policies (default deny). This
-- migration grants the minimum reads and writes each authenticated user
-- needs. anon users get nothing; service_role bypasses RLS entirely.
--
-- Implementation notes:
--   - Uses (select auth.uid()) rather than auth.uid() directly so Postgres
--     caches the call per statement instead of per row — significant on
--     larger result sets and the Supabase-recommended pattern.
--   - No INSERT/UPDATE/DELETE policies = those operations are denied.
--     We lean on that default to avoid verbose explicit-deny policies.

-- INSTITUTIONS --------------------------------------------------------
-- Authenticated users can read the one institution row their profile
-- belongs to. Cross-institution leakage is blocked by the subquery.

create policy institutions_select_own
  on public.institutions
  for select
  to authenticated
  using (
    id = (
      select institution_id
      from public.profiles
      where id = (select auth.uid())
    )
  );

-- PROFILES -----------------------------------------------------------
-- Users see and update only their own row. INSERT is handled by
-- handle_new_user() at signup (SECURITY DEFINER bypasses RLS). DELETE is
-- blocked for everyone — clients request deletion via
-- `deletion_requested_at` and a scheduled job performs the cascade purge.

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- SUBSCRIPTIONS ------------------------------------------------------
-- Users read their own subscription row. Writes are service_role only
-- (billing / admin operations). In v1 there's effectively no tier change;
-- this becomes live when pricing ships in v1.5 or v2.

create policy subscriptions_select_own
  on public.subscriptions
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

-- STUDY_SESSIONS -----------------------------------------------------
-- Users can select, insert, and update only sessions they own. DELETE is
-- blocked for everyone (analytics retention). If a user exercises right to
-- be forgotten, the service_role scheduler cascades via profiles delete.

create policy study_sessions_select_own
  on public.study_sessions
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

create policy study_sessions_insert_own
  on public.study_sessions
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy study_sessions_update_own
  on public.study_sessions
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
