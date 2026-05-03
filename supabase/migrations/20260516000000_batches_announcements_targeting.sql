-- Phase D — batches + targeted announcements + faculty_assignments targeting.
--
-- Adds the targeting infrastructure the Faculty Platform needs to send
-- assignments and announcements to specific batches instead of the whole
-- institution. Three structural pieces:
--
--   1. `batches` table — sub-cohorts inside an institution. A batch is
--      a named group of students (e.g. "MBBS 2025-26 First-Year-A").
--      Each student belongs to one batch via profiles.batch_id.
--
--   2. `profiles.batch_id` — single-batch membership for students.
--      Nullable because admins / faculty / HODs don't belong to a
--      batch. Settable by admin only via the column-lock trigger.
--
--   3. `target_batch_ids` (uuid[]) on faculty_assignments AND a new
--      `announcements` table. Convention: an empty array means
--      "everyone in the institution" (preserves the pre-Phase-D
--      broadcast behaviour for legacy rows). A non-empty array means
--      "only students in these batches see the row." The student-
--      side filter is `status='approved' AND (cardinality(targets)=0
--      OR my_batch_id = any(targets))`.
--
-- announcements carries the same approval workflow as
-- faculty_assignments: faculty drafts → HOD approves → students see
-- approved rows that target their batch. The re-review-on-edit trigger
-- mirrors the one on faculty_assignments.

-- ───────────────────────────── 1. batches ─────────────────────────────

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 1 and char_length(name) <= 100),
  -- Year of study is informational; lets the admin filter "all
  -- first-year batches" without joining on profiles.year_of_study.
  -- Nullable for institutions that don't slice by year.
  year_of_study smallint check (year_of_study between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, name)
);

comment on table public.batches is
  'Sub-cohorts inside an institution. Students belong to one via profiles.batch_id; assignments and announcements can target a list of batches via the target_batch_ids array on each row.';

create index batches_institution_idx on public.batches (institution_id);

create trigger batches_set_updated_at
  before update on public.batches
  for each row
  execute function public.set_updated_at();

alter table public.batches enable row level security;

-- Read: same-institution authenticated. Faculty + HOD read the list
-- to populate the target-batches picker; students read the list so a
-- "find your batch" page can render their own batch's name.
create policy batches_read_same_institution
  on public.batches
  for select
  to authenticated
  using (
    institution_id in (
      select institution_id from public.profiles where id = (auth.uid())::uuid
    )
  );

-- Write: admin only. Batch creation is an org-chart decision.
create policy batches_admin_write
  on public.batches
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid and is_admin = true
    )
  );

-- ───────────────────────────── 2. profiles.batch_id ─────────────────────────────

alter table public.profiles
  add column batch_id uuid references public.batches(id) on delete set null;

comment on column public.profiles.batch_id is
  'Batch this user belongs to. Nullable. Settable by admin only via the extended column-lock trigger from migration 20260516.';

create index profiles_batch_idx on public.profiles (batch_id) where batch_id is not null;

-- Extend the column-lock trigger to also snap batch_id back to OLD
-- for non-admin callers. Same defence-in-depth posture as role +
-- department_id + the approval columns.
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

  new.is_admin := old.is_admin;
  new.is_faculty := old.is_faculty;
  new.approved_at := old.approved_at;
  new.approved_by := old.approved_by;
  new.institution_id := old.institution_id;
  new.rejected_at := old.rejected_at;
  new.rejection_reason := old.rejection_reason;
  new.rejected_by := old.rejected_by;
  new.role := old.role;
  new.department_id := old.department_id;
  new.batch_id := old.batch_id;

  if old.profile_completed_at is not null then
    new.profile_completed_at := old.profile_completed_at;
  end if;

  return new;
end;
$$;

comment on function public.profiles_lock_admin_columns is
  'BEFORE UPDATE trigger: prevents non-admin callers from modifying admin-restricted profile columns. Lock-list now includes batch_id (added 20260516) alongside is_admin, is_faculty, approved_at, approved_by, institution_id, rejected_at, rejected_by, rejection_reason, role, department_id, plus the one-shot lock on profile_completed_at.';

-- ───────────────────────────── 3. target_batch_ids on faculty_assignments ─────────────────────────────

alter table public.faculty_assignments
  add column target_batch_ids uuid[] not null default array[]::uuid[];

comment on column public.faculty_assignments.target_batch_ids is
  'Batches this assignment targets. Empty array means everyone in the institution (legacy broadcast behaviour for pre-Phase-D rows). Non-empty array filters student-side reads via cardinality + ANY check.';

-- Replace the existing select policy so students only see rows where
-- their batch is targeted (or the targeting list is empty = broadcast).
drop policy if exists faculty_assignments_select_approved_or_owner on public.faculty_assignments;

create policy faculty_assignments_select_approved_or_owner
  on public.faculty_assignments
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
    and (
      -- Faculty: own drafts always visible.
      faculty_id = (select auth.uid())
      -- HOD / admin: everything in their institution visible.
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and p.institution_id = faculty_assignments.institution_id
          and p.role in ('hod', 'admin')
      )
      -- Students: status='approved' AND
      --           (no batch targeting OR student's batch is targeted)
      or (
        status = 'approved'
        and (
          cardinality(target_batch_ids) = 0
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.batch_id is not null
              and p.batch_id = any(faculty_assignments.target_batch_ids)
          )
        )
      )
    )
  );

comment on policy faculty_assignments_select_approved_or_owner on public.faculty_assignments is
  'Students see only status=approved rows whose target_batch_ids is empty (broadcast) OR contains their batch_id. Faculty see their own drafts/pending. HOD/admin see all in their institution. Replaces pre-targeting policy from 20260514.';

-- ───────────────────────────── 4. announcements ─────────────────────────────

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  -- Empty array = broadcast to whole institution; non-empty = only
  -- students in those batches.
  target_batch_ids uuid[] not null default array[]::uuid[],
  title text not null check (char_length(trim(title)) >= 1 and char_length(title) <= 200),
  body text check (body is null or char_length(body) <= 4000),
  status text not null default 'draft'
    check (status in ('draft', 'pending_hod', 'approved', 'rejected', 'changes_requested')),
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  decision_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.announcements is
  'Faculty-authored institution announcements. HOD-approval workflow + batch targeting same as faculty_assignments.';

create index announcements_inst_status_idx
  on public.announcements (institution_id, status);
create index announcements_pending_idx
  on public.announcements (submitted_at)
  where status = 'pending_hod';

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row
  execute function public.set_updated_at();

-- Re-review on content edit: the same shape as the trigger on
-- faculty_assignments. Material content fields here are title + body
-- + target_batch_ids. Editing target_batch_ids changes who sees the
-- announcement so it counts as material.
create or replace function public.announcements_re_review_on_edit()
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

  if old.status is distinct from new.status then
    return new;
  end if;

  if old.title is distinct from new.title
     or old.body is distinct from new.body
     or old.target_batch_ids is distinct from new.target_batch_ids then
    if old.status = 'approved' and new.status = 'approved' then
      new.status := 'pending_hod';
      new.submitted_at := now();
      new.decided_at := null;
      new.decided_by := null;
      new.decision_comment := null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.announcements_re_review_on_edit is
  'BEFORE UPDATE: snap an approved announcement back to pending_hod when a non-admin caller edits title / body / target_batch_ids. Mirrors the faculty_assignments trigger from migration 20260514.';

revoke all on function public.announcements_re_review_on_edit() from public;

create trigger announcements_re_review_on_edit_trigger
  before update on public.announcements
  for each row
  execute function public.announcements_re_review_on_edit();

alter table public.announcements enable row level security;

-- READ: same shape as faculty_assignments — students see
-- approved+targeted; faculty see their own; HOD/admin see all in
-- institution.
create policy announcements_select_approved_or_owner
  on public.announcements
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
    and (
      faculty_id = (select auth.uid())
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and p.institution_id = announcements.institution_id
          and p.role in ('hod', 'admin')
      )
      or (
        status = 'approved'
        and (
          cardinality(target_batch_ids) = 0
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.batch_id is not null
              and p.batch_id = any(announcements.target_batch_ids)
          )
        )
      )
    )
  );

-- INSERT: caller must be faculty / HOD / admin AND
-- faculty_id = auth.uid() (no impersonation) AND
-- the institution matches.
create policy announcements_insert_self
  on public.announcements
  for insert
  to authenticated
  with check (
    faculty_id = (select auth.uid())
    and institution_id = (
      select institution_id from public.profiles
      where id = (select auth.uid())
        and (is_faculty = true or is_admin = true)
    )
  );

-- UPDATE / DELETE: original author (or admin / HOD).
create policy announcements_update_owner_or_hod
  on public.announcements
  for update
  to authenticated
  using (
    faculty_id = (select auth.uid())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and (role in ('hod', 'admin') or is_admin = true)
        and institution_id = announcements.institution_id
    )
  )
  with check (
    faculty_id = (select auth.uid())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and (role in ('hod', 'admin') or is_admin = true)
        and institution_id = announcements.institution_id
    )
  );

create policy announcements_delete_owner_or_admin
  on public.announcements
  for delete
  to authenticated
  using (
    faculty_id = (select auth.uid())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  );
