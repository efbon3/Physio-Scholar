-- Phase 5+ J5 — Admin audit log.
--
-- An append-only record of admin / faculty actions. Writing rows is
-- the responsibility of each admin server action that mutates state
-- (granting roles, deleting events, resolving flags, etc.) — those
-- writes get wired in incrementally as we touch each action. This
-- migration sets up the storage + RLS + viewer surface so the table
-- is in place when those wiring PRs land.
--
-- Schema kept generic so any admin action can log without schema
-- churn:
--   actor_id    — who performed the action (FK profiles.id)
--   action      — short canonical token, e.g. 'set_faculty'
--   target_type — table or domain object affected, e.g. 'profiles'
--   target_id   — the affected row's id, captured as text so it
--                 works for uuid + text primary keys alike
--   details     — jsonb context (before/after, request metadata)
--
-- RLS:
--   Read: admins only (re-uses is_current_user_admin() from J0).
--   Write: service_role only — server actions construct rows using
--          the service-role key, never the user's JWT. We don't
--          expose insert via RLS to authenticated users because that
--          would let any admin's compromised session forge log rows.

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(trim(action)) >= 1 and char_length(action) <= 64),
  target_type text check (target_type is null or char_length(target_type) <= 64),
  target_id text check (target_id is null or char_length(target_id) <= 200),
  details jsonb,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Append-only record of admin/faculty actions. Read by admins via /admin/audit; '
  'written by server actions using the service-role key.';

create index admin_audit_log_created_at_idx
  on public.admin_audit_log(created_at desc);

create index admin_audit_log_actor_idx
  on public.admin_audit_log(actor_id, created_at desc);

create index admin_audit_log_target_idx
  on public.admin_audit_log(target_type, target_id);

alter table public.admin_audit_log enable row level security;

create policy admin_audit_log_select_admin
  on public.admin_audit_log
  for select
  to authenticated
  using (public.is_current_user_admin());

-- No INSERT/UPDATE/DELETE policies → those operations are denied for
-- authenticated users by the default-deny posture established in
-- the Phase 1 RLS migration. service_role bypasses RLS entirely, so
-- the server-side helper that composes audit rows can write freely.
