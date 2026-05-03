-- Phase G — Data-Entry Operator (DEO) role + class_sessions HOD workflow.
--
-- Adds a fifth role 'deo' to the role enum. DEOs are the data-entry
-- hand for an institution: they upload class schedules and notices
-- (HOD-approved before students see them) and key in marks +
-- attendance against existing rows (no approval — straight data entry).
--
-- class_sessions already carries `status` for the lifecycle
-- (scheduled / held / cancelled). To avoid colliding with it, the
-- approval workflow lives in a parallel `approval_status` column
-- mirroring faculty_assignments / announcements (draft / pending_hod /
-- approved / rejected / changes_requested). Existing rows backfill to
-- approval_status='approved' so the schedule already on prod stays
-- visible to students.
--
-- The trigger pattern mirrors faculty_assignments_re_review_on_edit:
-- a non-admin caller editing a content field on an approved row snaps
-- approval_status back to pending_hod, forcing re-review.
--
-- RLS write paths on attendance_records and assignment_marks already
-- gate on `is_faculty / is_admin / role IN ('hod', 'admin')`. The DEO
-- isn't is_faculty or is_admin, so we extend each predicate to also
-- accept role='deo'. Students reading their own rows is unchanged.

-- ───────────────────────────── 1. role enum extension ─────────────────────────────

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('student', 'faculty', 'hod', 'admin', 'deo'));

alter table public.role_permissions
  drop constraint if exists role_permissions_role_check;

alter table public.role_permissions
  add constraint role_permissions_role_check
    check (role in ('student', 'faculty', 'hod', 'admin', 'deo'));

insert into public.role_permissions (
  role,
  can_create_assignments, can_grade_assignments, can_edit_schedule,
  can_send_announcements, can_create_student_tasks, can_approve_publishing,
  can_message_students, can_view_attendance, can_edit_attendance,
  can_view_marks, can_edit_marks, can_view_roster, can_edit_roster,
  can_view_audit_log
) values
  ('deo',
   false, false, true,  true,  false, false, false,
   true,  true,  true,  true,  true,  false, false)
on conflict (role) do nothing;

-- ───────────────────────────── 2. class_sessions approval_status ─────────────────────────────

alter table public.class_sessions
  add column approval_status text not null default 'approved'
    check (approval_status in ('draft', 'pending_hod', 'approved', 'rejected', 'changes_requested')),
  add column submitted_at timestamptz,
  add column decided_at timestamptz,
  add column decided_by uuid references public.profiles(id) on delete set null,
  add column decision_comment text;

comment on column public.class_sessions.approval_status is
  'Approval-workflow state. New DEO/faculty rows from Phase G onward default to draft via the create action; pre-existing rows keep approval_status=approved (the schema default applied during this migration''s backfill) so they stay visible. Distinct from `status` (scheduled/held/cancelled).';
comment on column public.class_sessions.submitted_at is
  'When the author submitted the draft for HOD review. NULL for legacy approved rows.';
comment on column public.class_sessions.decided_at is
  'When the HOD approved / rejected / requested changes. NULL while in draft or pending_hod.';
comment on column public.class_sessions.decided_by is
  'HOD profile id who took the decision. Cleared if that HOD is later removed.';
comment on column public.class_sessions.decision_comment is
  'Optional HOD comment shown to author (e.g. "wrong room"); shown to students only on approve.';

create index class_sessions_pending_idx
  on public.class_sessions (submitted_at)
  where approval_status = 'pending_hod';

-- ───────────────────────────── 3. re-review trigger ─────────────────────────────

create or replace function public.class_sessions_re_review_on_edit()
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

  -- approval_status-only or lifecycle-status-only updates pass through.
  if old.approval_status is distinct from new.approval_status then
    return new;
  end if;
  if old.status is distinct from new.status then
    return new;
  end if;

  if old.topic is distinct from new.topic
     or old.scheduled_at is distinct from new.scheduled_at
     or old.duration_minutes is distinct from new.duration_minutes
     or old.batch_id is distinct from new.batch_id
     or old.location is distinct from new.location
     or old.notes is distinct from new.notes then
    if old.approval_status = 'approved' and new.approval_status = 'approved' then
      new.approval_status := 'pending_hod';
      new.submitted_at := now();
      new.decided_at := null;
      new.decided_by := null;
      new.decision_comment := null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.class_sessions_re_review_on_edit is
  'BEFORE UPDATE: snap an approved class_sessions row back to pending_hod when a non-admin caller edits any content field. Mirrors faculty_assignments_re_review_on_edit from migration 20260514.';

revoke all on function public.class_sessions_re_review_on_edit() from public;

create trigger class_sessions_re_review_on_edit_trigger
  before update on public.class_sessions
  for each row
  execute function public.class_sessions_re_review_on_edit();

-- ───────────────────────────── 4. RLS — gate student reads on approval_status ─────────────────────────────

drop policy if exists class_sessions_read_same_institution on public.class_sessions;

create policy class_sessions_select_approved_or_owner
  on public.class_sessions
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
    and (
      approval_status = 'approved'
      or faculty_id = (select auth.uid())
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and p.institution_id = class_sessions.institution_id
          and p.role in ('hod', 'admin')
      )
    )
  );

drop policy if exists class_sessions_insert_faculty on public.class_sessions;

create policy class_sessions_insert_author
  on public.class_sessions
  for insert
  to authenticated
  with check (
    faculty_id = (select auth.uid())
    and institution_id = (
      select institution_id from public.profiles
      where id = (select auth.uid())
        and (
          is_faculty = true
          or is_admin = true
          or role in ('hod', 'admin', 'faculty', 'deo')
        )
    )
  );

drop policy if exists class_sessions_update_owner_or_admin on public.class_sessions;

create policy class_sessions_update_owner_or_admin
  on public.class_sessions
  for update
  to authenticated
  using (
    faculty_id = (select auth.uid())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and (is_admin = true or role in ('hod', 'admin'))
        and institution_id = class_sessions.institution_id
    )
  )
  with check (
    faculty_id = (select auth.uid())
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and (is_admin = true or role in ('hod', 'admin'))
        and institution_id = class_sessions.institution_id
    )
  );

-- ───────────────────────────── 5. RLS — extend marks + attendance writes to DEO ─────────────────────────────

drop policy if exists attendance_records_select_own_or_inst on public.attendance_records;
create policy attendance_records_select_own_or_inst
  on public.attendance_records
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1
      from public.class_sessions cs
      join public.profiles p on p.id = (select auth.uid())
      where cs.id = attendance_records.class_session_id
        and cs.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

drop policy if exists attendance_records_write_faculty on public.attendance_records;
create policy attendance_records_write_faculty
  on public.attendance_records
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.class_sessions cs
      join public.profiles p on p.id = (select auth.uid())
      where cs.id = attendance_records.class_session_id
        and cs.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

drop policy if exists attendance_records_update_faculty on public.attendance_records;
create policy attendance_records_update_faculty
  on public.attendance_records
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.class_sessions cs
      join public.profiles p on p.id = (select auth.uid())
      where cs.id = attendance_records.class_session_id
        and cs.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  )
  with check (
    exists (
      select 1
      from public.class_sessions cs
      join public.profiles p on p.id = (select auth.uid())
      where cs.id = attendance_records.class_session_id
        and cs.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

drop policy if exists assignment_marks_select_own_or_inst on public.assignment_marks;
create policy assignment_marks_select_own_or_inst
  on public.assignment_marks
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1
      from public.faculty_assignments fa
      join public.profiles p on p.id = (select auth.uid())
      where fa.id = assignment_marks.assignment_id
        and fa.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

drop policy if exists assignment_marks_write_faculty on public.assignment_marks;
create policy assignment_marks_write_faculty
  on public.assignment_marks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.faculty_assignments fa
      join public.profiles p on p.id = (select auth.uid())
      where fa.id = assignment_marks.assignment_id
        and fa.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

drop policy if exists assignment_marks_update_faculty on public.assignment_marks;
create policy assignment_marks_update_faculty
  on public.assignment_marks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.faculty_assignments fa
      join public.profiles p on p.id = (select auth.uid())
      where fa.id = assignment_marks.assignment_id
        and fa.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  )
  with check (
    exists (
      select 1
      from public.faculty_assignments fa
      join public.profiles p on p.id = (select auth.uid())
      where fa.id = assignment_marks.assignment_id
        and fa.institution_id = p.institution_id
        and (
          p.is_faculty = true
          or p.is_admin = true
          or p.role in ('hod', 'admin', 'deo')
        )
    )
  );

-- ───────────────────────────── 6. RLS — extend announcements authorship to DEO ─────────────────────────────

drop policy if exists announcements_insert_author on public.announcements;
create policy announcements_insert_author
  on public.announcements
  for insert
  to authenticated
  with check (
    faculty_id = (select auth.uid())
    and institution_id = (
      select institution_id from public.profiles
      where id = (select auth.uid())
        and (
          is_faculty = true
          or is_admin = true
          or role in ('hod', 'admin', 'faculty', 'deo')
        )
    )
  );
