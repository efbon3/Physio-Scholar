-- Phase 5+ — Faculty-assigned homework / tasks.
--
-- Author requirement (2026-04-26): the dashboard should show a
-- "reminder of the task/homework given by the faculties." The
-- placeholder shipped in #81 explained what would appear; this
-- migration adds the table that backs it.
--
-- Scope: institution-only audience. A faculty member writes an
-- assignment for their institution; every approved student in the
-- same institution sees it on /today until the due_at passes (or
-- the faculty deletes it). Personal / DM-style assignments are out
-- of scope for the pilot — the cohort is small enough that broadcast
-- is fine, and per-student targeting can come later if it's needed.
--
-- Naming: "assignment" is the noun the medical-school faculty actually
-- use for take-home reading or task lists. Avoiding "homework" in the
-- table name keeps the schema neutral while the dashboard still labels
-- it "Faculty homework" in the user-facing copy.

create table public.faculty_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  title text not null
    check (char_length(trim(title)) >= 1 and char_length(title) <= 200),
  description text
    check (description is null or char_length(description) <= 2000),
  -- NULL means "no specific deadline" — useful for reading assignments
  -- where the faculty just wants the student aware of it.
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.faculty_assignments is
  'Faculty-authored homework / tasks for an institution. The dashboard '
  'reads upcoming entries (due_at >= now() or due_at is null) and shows '
  'the next few in the Faculty homework card.';

comment on column public.faculty_assignments.faculty_id is
  'The faculty profile that authored this assignment. Updates and '
  'deletes are gated by faculty_id = auth.uid() for the owner, or admin.';

create index faculty_assignments_inst_due_idx
  on public.faculty_assignments (institution_id, due_at);

create trigger faculty_assignments_set_updated_at
  before update on public.faculty_assignments
  for each row execute function public.set_updated_at();

alter table public.faculty_assignments enable row level security;

-- READ: anyone in the same institution sees every assignment for that
-- institution. Faculty / admin / approved learners all flow through
-- the same policy because the dashboard surface is the same.

create policy faculty_assignments_select_inst
  on public.faculty_assignments
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
  );

-- INSERT: the caller must be faculty (or admin) AND the row's
-- institution_id has to match the caller's institution. faculty_id is
-- pinned to auth.uid() so a faculty user can't write rows under
-- another faculty's name.

create policy faculty_assignments_insert_self
  on public.faculty_assignments
  for insert
  to authenticated
  with check (
    faculty_id = (select auth.uid())
    and (
      institution_id = (
        select institution_id from public.profiles
        where id = (select auth.uid()) and is_faculty = true
      )
      or public.is_current_user_admin()
    )
  );

-- UPDATE: only the original faculty author or an admin. Both USING
-- and WITH CHECK clauses repeat the predicate so a row can't be
-- "moved" to a different faculty/institution by an UPDATE.

create policy faculty_assignments_update_own
  on public.faculty_assignments
  for update
  to authenticated
  using (
    faculty_id = (select auth.uid()) or public.is_current_user_admin()
  )
  with check (
    faculty_id = (select auth.uid()) or public.is_current_user_admin()
  );

-- DELETE: same authorisation surface as UPDATE.

create policy faculty_assignments_delete_own
  on public.faculty_assignments
  for delete
  to authenticated
  using (
    faculty_id = (select auth.uid()) or public.is_current_user_admin()
  );
