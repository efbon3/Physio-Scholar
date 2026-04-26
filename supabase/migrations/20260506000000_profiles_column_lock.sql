-- Phase 5+ — Lock admin-only profile columns.
--
-- Security review uncovered a privilege-escalation hole: the
-- `profiles_update_own` policy from the original 20260423153500 migration
-- only checks `id = auth.uid()` in WITH CHECK, which is an identity
-- check — NOT a column-level restriction. So any authenticated learner
-- could `PATCH /rest/v1/profiles?id=eq.<self>` directly to Supabase's
-- PostgREST endpoint and set `is_admin = true`, `approved_at = now()`,
-- or `profile_completed_at = now()`, defeating every gate built on top
-- of those columns:
--   - requireAdmin() (src/lib/auth/admin.ts) reads profiles.is_admin
--   - is_current_user_admin() SECURITY DEFINER reads the same column
--   - requireApprovedUser() reads approved_at + profile_completed_at
--
-- Postgres RLS doesn't have native column-level UPDATE policies. Two
-- options exist: column-level GRANTs, or a BEFORE UPDATE trigger that
-- snaps locked columns back to OLD when the caller isn't an admin.
-- We pick the trigger because it lets us encode the one-time
-- NULL → timestamp transition for `profile_completed_at` (the
-- /complete-profile form needs to set it exactly once; nothing else
-- should touch it). Column-level GRANTs can't express that nuance.
--
-- Migration also corrects the inaccurate comment from
-- 20260504000000_user_approval.sql which claimed the existing policy
-- "explicitly excludes these columns via WITH CHECK" — it does not.

create or replace function public.profiles_lock_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_is_admin boolean;
begin
  -- Service-role / cron / SECURITY DEFINER paths run with no JWT, so
  -- auth.uid() is NULL. Those callers already bypass RLS — they have
  -- no business being constrained by an app-layer trigger either.
  if caller_id is null then
    return new;
  end if;

  -- Look up caller's admin flag from the snapshotted profiles row.
  -- Reading their OLD state is correct here: we want to know whether
  -- the *caller* is an admin, not whether the row being modified is.
  select coalesce(p.is_admin, false) into caller_is_admin
    from public.profiles p
    where p.id = caller_id;

  if caller_is_admin then
    return new;
  end if;

  -- Non-admin update path. Snap locked columns back to OLD so the
  -- learner can't elevate privileges or self-approve via direct REST
  -- calls. The legitimate flows (admin actions, signup trigger,
  -- /complete-profile form) either come in as admin or are writing
  -- a column that isn't on this list.
  new.is_admin := old.is_admin;
  new.is_faculty := old.is_faculty;
  new.approved_at := old.approved_at;
  new.approved_by := old.approved_by;
  new.institution_id := old.institution_id;

  -- profile_completed_at: allow the one-shot NULL → timestamp transition
  -- (that's exactly the /complete-profile form). Once it's set, only an
  -- admin can change it again — a non-admin can't roll their own
  -- completion timestamp forward, and they can't unset it either.
  if old.profile_completed_at is not null then
    new.profile_completed_at := old.profile_completed_at;
  end if;

  return new;
end;
$$;

comment on function public.profiles_lock_admin_columns is
  'BEFORE UPDATE trigger: prevents non-admin callers from modifying admin-restricted profile columns (is_admin, is_faculty, approved_at, approved_by, institution_id) or re-stamping profile_completed_at after first set. See 20260506000000 migration.';

revoke all on function public.profiles_lock_admin_columns() from public;

-- BEFORE UPDATE so we mutate NEW before any write happens, and BEFORE
-- the existing `profiles_set_updated_at` trigger fires (it sorts later
-- alphabetically: 'profiles_lock_…' < 'profiles_set_…').
create trigger profiles_lock_admin_columns_trigger
  before update on public.profiles
  for each row execute function public.profiles_lock_admin_columns();

-- Correct the misleading comment from the previous migration.
comment on policy profiles_update_admin_approval on public.profiles is
  'Admins (only) can update any profile row. Combined with the BEFORE UPDATE trigger profiles_lock_admin_columns_trigger which snaps admin-restricted columns back to OLD for non-admin callers — that is what actually prevents self-approval / self-promotion, NOT the WITH CHECK clause on profiles_update_own.';
