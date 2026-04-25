-- Phase 5+ J7 / J8 — Exam events + faculty role.
--
-- Two changes bundled because they share the same RLS surface:
--
-- 1. profiles.is_faculty boolean — mirrors the is_admin pattern. A
--    faculty member can author institution-scoped events for their own
--    institution. Set by service_role / DB admin (no app-side write
--    path); the bootstrap is a one-time UPDATE per faculty profile.
--
-- 2. public.exam_events table — the calendar / scheduler / SRS weighting
--    foundation. Audience-discriminated:
--
--      audience='institution'  → institution_id required, owner_id null
--                                 (faculty-authored, all students of the
--                                  institution see it)
--      audience='personal'     → owner_id required, institution_id null
--                                 (student-authored, only the owner sees it)
--
--    `kind` covers exam | holiday | semester_boundary | milestone — same
--    enum at both audiences. We don't restrict "students can't add a
--    holiday" at the DB level because a personal "self-declared holiday"
--    is private and harms no one.
--
--    `organ_systems` is a text[] of organ_system tokens. The cluster-2
--    SRS-weighting work reads this array: in the ±14-day window before an
--    exam, cards whose mechanism's organ_system intersects the array get
--    surfaced earlier in the queue. Mechanism-level granularity was
--    considered and rejected per the author — institution-level events
--    happen at the system level, and authoring overhead drops sharply.
--
-- DPDPA note: an institution event has no PII; a personal event may have
-- a free-text title / notes that the learner authored. Both inherit the
-- existing right-to-be-forgotten cascade via the FK to profiles.

alter table public.profiles
  add column is_faculty boolean not null default false;

comment on column public.profiles.is_faculty is
  'Marks this profile as institutional faculty. Grants write access to '
  'audience=institution exam_events scoped to their institution_id. '
  'Settable by service_role only — no app-side write path.';

create table public.exam_events (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('institution', 'personal')),
  institution_id uuid references public.institutions(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 1 and char_length(title) <= 200),
  kind text not null check (kind in ('exam', 'holiday', 'semester_boundary', 'milestone')),
  organ_systems text[] not null default '{}'::text[],
  starts_at date not null,
  ends_at date,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Audience-driven row shape: each row must point at exactly one of
  -- institution_id or owner_id, never both, never neither. The check
  -- here is belt-and-suspenders — RLS still gates writes per audience.
  constraint exam_events_audience_target check (
    (audience = 'institution' and institution_id is not null and owner_id is null)
    or (audience = 'personal' and owner_id is not null and institution_id is null)
  ),
  -- Multi-day events span [starts_at, ends_at]. Single-day events have
  -- ends_at null. Reject inverted ranges so a typo can't sneak through.
  constraint exam_events_range check (ends_at is null or ends_at >= starts_at)
);

comment on table public.exam_events is
  'Calendar of exams, holidays, semester boundaries, and milestones. '
  'Institution-scoped events are authored by faculty; personal events are '
  'student-owned. Drives the dashboard upcoming-events surface and the '
  'SRS exam-aware weighting in the ±14d window before an exam.';

create index exam_events_institution_starts_idx
  on public.exam_events(institution_id, starts_at)
  where audience = 'institution';

create index exam_events_owner_starts_idx
  on public.exam_events(owner_id, starts_at)
  where audience = 'personal';

alter table public.exam_events enable row level security;

-- READ: a learner sees institution events for their institution_id, and
-- their own personal events. Two policies (one per audience) so each
-- one's USING clause is independently auditable.

create policy exam_events_select_institution
  on public.exam_events
  for select
  to authenticated
  using (
    audience = 'institution'
    and institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
  );

create policy exam_events_select_personal
  on public.exam_events
  for select
  to authenticated
  using (
    audience = 'personal'
    and owner_id = (select auth.uid())
  );

-- WRITE institution events — faculty for their own institution, or admins
-- (admins can manage cross-institutionally for setup tasks).

create policy exam_events_insert_institution
  on public.exam_events
  for insert
  to authenticated
  with check (
    audience = 'institution'
    and (
      -- faculty in this institution
      institution_id = (
        select institution_id
        from public.profiles
        where id = (select auth.uid()) and is_faculty = true
      )
      -- or app-admin
      or public.is_current_user_admin()
    )
  );

create policy exam_events_update_institution
  on public.exam_events
  for update
  to authenticated
  using (
    audience = 'institution'
    and (
      institution_id = (
        select institution_id
        from public.profiles
        where id = (select auth.uid()) and is_faculty = true
      )
      or public.is_current_user_admin()
    )
  )
  with check (
    audience = 'institution'
    and (
      institution_id = (
        select institution_id
        from public.profiles
        where id = (select auth.uid()) and is_faculty = true
      )
      or public.is_current_user_admin()
    )
  );

create policy exam_events_delete_institution
  on public.exam_events
  for delete
  to authenticated
  using (
    audience = 'institution'
    and (
      institution_id = (
        select institution_id
        from public.profiles
        where id = (select auth.uid()) and is_faculty = true
      )
      or public.is_current_user_admin()
    )
  );

-- WRITE personal events — owner only.

create policy exam_events_insert_personal
  on public.exam_events
  for insert
  to authenticated
  with check (
    audience = 'personal'
    and owner_id = (select auth.uid())
  );

create policy exam_events_update_personal
  on public.exam_events
  for update
  to authenticated
  using (audience = 'personal' and owner_id = (select auth.uid()))
  with check (audience = 'personal' and owner_id = (select auth.uid()));

create policy exam_events_delete_personal
  on public.exam_events
  for delete
  to authenticated
  using (audience = 'personal' and owner_id = (select auth.uid()));
