-- Phase 5 F1 — admin role + content_flags.
--
-- Goals:
--   1. Mark a profile as admin so /admin routes and admin-only writes
--      can authorise without hardcoding emails.
--   2. Give learners a structured "this card looks wrong" escape hatch
--      the author can triage server-side (build spec §2.6 dispute /
--      content-flagging surface).
--
-- The content_flags RLS follows the same pattern as every other table:
-- users see and create their own rows, admins see and update every row.

-- Profile admin flag ---------------------------------------------------

alter table public.profiles
  add column is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Marks this profile as an app admin. Grants access to /admin routes and to admin-only content_flags rows. Settable by service_role only.';

-- Content flags -------------------------------------------------------

create type public.content_flag_status as enum (
  'open',
  'resolved',
  'rejected'
);

create table public.content_flags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null check (card_id ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?:\d+$'),
  reason text not null check (char_length(trim(reason)) between 1 and 500),
  notes text check (notes is null or char_length(trim(notes)) <= 2000),
  status public.content_flag_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null
);

comment on table public.content_flags is
  'Learner-reported issues with cards (wrong answer, unclear stem, stale citation, etc). Admin triages via /admin/flags.';

create index content_flags_open_idx
  on public.content_flags (created_at desc)
  where status = 'open';

create index content_flags_profile_idx
  on public.content_flags (profile_id, created_at desc);

alter table public.content_flags enable row level security;

-- Learners flag their own cards.
create policy content_flags_insert_own
  on public.content_flags
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

-- Learners see their own flags to track status.
create policy content_flags_select_own
  on public.content_flags
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

-- Admins see every flag.
create policy content_flags_select_admin
  on public.content_flags
  for select
  to authenticated
  using (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

-- Admins resolve/reject flags.
create policy content_flags_update_admin
  on public.content_flags
  for update
  to authenticated
  using (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  )
  with check (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

-- DELETE is blocked for everyone — flags are audit history.
