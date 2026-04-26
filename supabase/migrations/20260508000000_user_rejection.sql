-- Phase 5+ — Admin can deny access to signup requests.
--
-- Author requirement (2026-04-26): "users can be approved or denied
-- access as per the admin." Approval is already covered by approved_at;
-- this migration adds the symmetric `rejected_at` + `rejection_reason`
-- columns so the admin can also explicitly deny a request. A rejected
-- user retains their session but the (app) layout's gate redirects
-- them to /access-denied (a terminal page) rather than letting them
-- reach learner surfaces or the /pending-approval / /complete-profile
-- holding pages.
--
-- We don't hard-delete rejected users at this layer because:
--   1. We want the rejection to be auditable / reversible. The admin
--      may have rejected by mistake.
--   2. DPDPA right-to-be-forgotten goes through deletion_requested_at,
--      which gives a 30-day grace and full cascade purge. That flow
--      already exists; rejection is a different concept.
--
-- The 20260506 column-lock trigger needs to know about these new
-- columns too — otherwise a rejected user could clear their own
-- rejected_at via direct REST and walk past the gate. Updated below.

alter table public.profiles
  add column rejected_at timestamptz,
  add column rejection_reason text,
  add column rejected_by uuid references public.profiles(id) on delete set null;

comment on column public.profiles.rejected_at is
  'When an admin denied this user''s sign-up request. NULL = not rejected. Mutually exclusive with approved_at — the rejectUserAction clears approved_at, and approveUserAction clears rejected_at.';
comment on column public.profiles.rejection_reason is
  'Optional admin-entered reason shown to the user on /access-denied. Free text; no sensitive info expected.';
comment on column public.profiles.rejected_by is
  'The admin profile id who rejected this user. Set to null if the rejecting admin is later deleted.';

-- Update the column-lock trigger to also clamp rejected_at,
-- rejection_reason, and rejected_by for non-admin callers. Without
-- this, a rejected user could `PATCH /rest/v1/profiles?id=eq.<self>`
-- and clear rejected_at, walking past the gate. Approved_at-style
-- full lock — non-admins never write to these columns.
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
  if caller_id is null then
    return new;
  end if;

  select coalesce(p.is_admin, false) into caller_is_admin
    from public.profiles p
    where p.id = caller_id;

  if caller_is_admin then
    return new;
  end if;

  -- Non-admin path: lock everything that could grant or rescind access.
  new.is_admin := old.is_admin;
  new.is_faculty := old.is_faculty;
  new.approved_at := old.approved_at;
  new.approved_by := old.approved_by;
  new.institution_id := old.institution_id;
  new.rejected_at := old.rejected_at;
  new.rejection_reason := old.rejection_reason;
  new.rejected_by := old.rejected_by;

  if old.profile_completed_at is not null then
    new.profile_completed_at := old.profile_completed_at;
  end if;

  return new;
end;
$$;

comment on function public.profiles_lock_admin_columns is
  'BEFORE UPDATE trigger: prevents non-admin callers from modifying admin-restricted profile columns. Locks is_admin, is_faculty, approved_at, approved_by, institution_id, rejected_at, rejection_reason, rejected_by; allows the one-shot NULL → timestamp transition for profile_completed_at.';

-- Index for the admin "rejected requests" filter view. Partial index
-- keeps it tiny since rejected users are the long-tail.
create index profiles_rejected_idx
  on public.profiles (rejected_at)
  where rejected_at is not null;
