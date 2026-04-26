-- Phase 5+ — admin-approval gate on profiles.
--
-- Author requirement (2026-04-26): "any random person cannot sign in.
-- their credentials have to be verified first." So signup creates the
-- profile / auth user as before, but the profile is in a non-approved
-- state until an admin / faculty marks it approved.
--
-- The approval check is enforced at the application layer (the (app)
-- layout redirects unapproved users to /pending-approval before any
-- learner surface renders). This DB migration adds the columns and
-- back-fills existing rows so current users aren't locked out.

alter table public.profiles
  add column approved_at timestamptz,
  add column approved_by uuid references public.profiles(id) on delete set null;

comment on column public.profiles.approved_at is
  'When an admin/faculty approved this learner. NULL = not yet approved; the (app) layout blocks unapproved users from learner surfaces.';

comment on column public.profiles.approved_by is
  'The admin/faculty profile id who approved this learner. References profiles(id); set to null if the approving admin is later deleted.';

-- Retroactive approval for all existing rows. They were already using
-- the app pre-this-feature, so locking them out would be a regression.
-- New profiles created after this migration default to NULL = pending.
update public.profiles
  set approved_at = created_at
  where approved_at is null;

-- Index for the admin-pending query: list every profile where
-- approved_at is null, sorted by request order. The partial index
-- keeps it tiny — once a user is approved their row drops out of the
-- index entirely.
create index profiles_pending_idx
  on public.profiles (created_at)
  where approved_at is null;

-- Helper: is the current user approved? Returns true for not-yet-
-- approved-but-admin profiles too (admins shouldn't be locked out of
-- /admin even before they self-approve), which keeps the back-door
-- open during initial seeding.
create or replace function public.is_current_user_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    p.approved_at is not null or p.is_admin = true,
    false
  )
  from public.profiles p
  where p.id = (select auth.uid());
$$;

revoke all on function public.is_current_user_approved() from public;
grant execute on function public.is_current_user_approved() to authenticated;

-- Admins (only) can update approved_at / approved_by. The existing
-- profiles_update_own policy explicitly excludes these columns via
-- WITH CHECK so a learner can't self-approve. We add a parallel
-- admin-update policy here.
create policy profiles_update_admin_approval
  on public.profiles
  for update
  to authenticated
  using (public.is_current_user_admin() = true)
  with check (public.is_current_user_admin() = true);
