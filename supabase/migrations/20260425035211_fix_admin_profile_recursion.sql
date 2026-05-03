-- Phase 5+ — fix infinite recursion in profiles_select_admin policy.
--
-- The original profiles_select_admin policy (from 20260423153500) read
-- `profiles.is_admin` directly inside the USING clause:
--
--   using ((select is_admin from public.profiles where id = auth.uid()) = true)
--
-- Postgres re-applies RLS to the inner SELECT, which re-invokes the
-- policy → infinite recursion → 42P17 ERROR. The fix is to lift the
-- read into a SECURITY DEFINER function so the inner SELECT bypasses
-- RLS, then have the policy call the function.
--
-- This file mirrors what was applied to production at 20260425035211.
-- It's checked in here so a fresh local dev or a CI replay matches
-- the prod schema state. The trigger was originally applied via the
-- Supabase dashboard / hotfix path and never landed in git; this is
-- the catch-up commit.

drop policy if exists profiles_select_admin on public.profiles;

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
