-- Phase A — Roles + departments + per-role capability matrix.
--
-- Adds the structural ingredients the Faculty Platform needs:
--
--   1. A canonical `role` column on profiles (`student | faculty | hod | admin`)
--      derived from the existing `is_admin` / `is_faculty` booleans on
--      backfill. The booleans stay in place — every RLS policy that
--      already references them keeps working — and we read the new
--      column for new code paths.
--
--   2. A `departments` table — sub-divisions inside an institution
--      (e.g. Physiology, Anatomy). The HOD's user id is recorded on
--      the department row so we can answer "who's the HOD of dept X?"
--      with a single join.
--
--   3. `profiles.department_id` — links HOD/faculty to their department.
--      Nullable: students belong to a batch (existing concept) and
--      don't necessarily carry a department.
--
--   4. A `role_permissions` table — one row per role, one column per
--      capability flag. The admin edits this table from the
--      /admin/permissions page; the app reads each flag at request
--      time, so a flip takes effect on the next page load (no caching
--      beyond Supabase's natural query layer).
--
-- The Faculty Platform features (assignment publish workflow, HOD
-- approval queue, announcements, student tasks, HOD→student messages)
-- gate on these flags + the role + the user's department. They land
-- in subsequent migrations.

-- ───────────────────────────── 1. role column ─────────────────────────────

alter table public.profiles
  add column role text not null default 'student'
    check (role in ('student', 'faculty', 'hod', 'admin'));

comment on column public.profiles.role is
  'Canonical role for the Faculty Platform. ''student'' | ''faculty'' | ''hod'' | ''admin''. Derived from is_admin / is_faculty on backfill; new code reads this column. Settable only by admin via the column-lock trigger from 20260506 (extended below to cover this column).';

-- Backfill from the existing booleans. Order matters: admin > faculty
-- > student. No HODs exist yet — they''re assigned by an admin via
-- the /admin/roles UI in a later phase.
update public.profiles
   set role = 'admin'
 where is_admin = true;

update public.profiles
   set role = 'faculty'
 where is_admin = false
   and is_faculty = true;

-- ───────────────────────────── 2. departments ─────────────────────────────

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  name text not null,
  head_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, name)
);

comment on table public.departments is
  'Sub-division inside an institution (e.g. Physiology, Anatomy, Biochemistry). Each HOD heads exactly one; faculty belong to one via profiles.department_id. The Faculty Platform approval queue routes a faculty''s submitted artefacts to their department''s HOD.';

create index departments_institution_idx on public.departments (institution_id);
create index departments_head_idx on public.departments (head_user_id) where head_user_id is not null;

create trigger departments_set_updated_at
  before update on public.departments
  for each row
  execute function public.set_updated_at();

alter table public.departments enable row level security;

-- Read: any authenticated profile in the same institution can read its
-- department list (needed for batch pickers, HOD discovery, dashboards).
create policy departments_read_same_institution
  on public.departments
  for select
  to authenticated
  using (
    institution_id in (
      select institution_id
        from public.profiles
       where id = (auth.uid())::uuid
    )
  );

-- Write: admin only. HOD / faculty don't author departments — that's
-- an institution-level org-chart decision.
create policy departments_admin_write
  on public.departments
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid
         and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid
         and is_admin = true
    )
  );

-- ───────────────────────────── 3. profiles.department_id ─────────────────────────────

alter table public.profiles
  add column department_id uuid references public.departments (id) on delete set null;

comment on column public.profiles.department_id is
  'Department this user belongs to (HOD / faculty / student). Nullable. Settable by admin only via the extended column-lock trigger.';

create index profiles_department_idx on public.profiles (department_id) where department_id is not null;

-- ───────────────────────────── 4. extended column-lock trigger ─────────────────────────────

-- The 20260506 / 20260508 column-lock trigger already snaps is_admin /
-- is_faculty / institution_id / approved_at / approved_by / rejected_at
-- / rejected_by / rejection_reason back to OLD for non-admin callers.
-- The new role + department_id columns are equally privilege-bearing
-- (a learner could otherwise self-promote to HOD and bypass approval
-- gates), so add them to the same lock-list. Snap-back style matches
-- the existing function — never raise, always silently revert, so the
-- caller's other column writes still succeed.

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
  new.role := old.role;
  new.department_id := old.department_id;

  if old.profile_completed_at is not null then
    new.profile_completed_at := old.profile_completed_at;
  end if;

  return new;
end;
$$;

comment on function public.profiles_lock_admin_columns is
  'BEFORE UPDATE trigger: prevents non-admin callers from modifying admin-restricted profile columns. Lock-list: is_admin, is_faculty, approved_at, approved_by, institution_id, rejected_at, rejected_by, rejection_reason, role, department_id, plus the one-shot lock on profile_completed_at. Re-stamping any of these from a non-admin REST call is a privilege-escalation route, so they all snap back to OLD silently.';

-- ───────────────────────────── 5. role_permissions ─────────────────────────────

create table public.role_permissions (
  role text primary key check (role in ('student', 'faculty', 'hod', 'admin')),
  -- Faculty-platform capabilities. Each flag gates a UI affordance + an
  -- RLS check on the corresponding write path. Default seed below
  -- reflects the build spec (faculty drafts → HOD approves → published).
  can_create_assignments boolean not null default false,
  can_grade_assignments boolean not null default false,
  can_edit_schedule boolean not null default false,
  can_send_announcements boolean not null default false,
  can_create_student_tasks boolean not null default false,
  can_approve_publishing boolean not null default false,
  can_message_students boolean not null default false,
  can_view_attendance boolean not null default false,
  can_edit_attendance boolean not null default false,
  can_view_marks boolean not null default false,
  can_edit_marks boolean not null default false,
  can_view_roster boolean not null default false,
  can_edit_roster boolean not null default false,
  can_view_audit_log boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.role_permissions is
  'Per-role capability matrix for the Faculty Platform. The admin edits this table from /admin/permissions; the app reads each flag at request time so a flip takes effect on the next page load. Admin role is omitted from the gating reads — admins always pass every flag — but the row is kept for matrix completeness.';

create trigger role_permissions_set_updated_at
  before update on public.role_permissions
  for each row
  execute function public.set_updated_at();

-- Seed defaults. Faculty get the day-to-day capabilities (create
-- assignments, mark attendance, enter marks). HOD adds approval +
-- messaging on top. Student gets nothing — every student-facing
-- read is gated elsewhere by ownership, not by this matrix.
insert into public.role_permissions (
  role,
  can_create_assignments, can_grade_assignments, can_edit_schedule,
  can_send_announcements, can_create_student_tasks, can_approve_publishing,
  can_message_students, can_view_attendance, can_edit_attendance,
  can_view_marks, can_edit_marks, can_view_roster, can_edit_roster,
  can_view_audit_log
) values
  ('student',
   false, false, false, false, false, false, false,
   false, false, false, false, false, false, false),
  ('faculty',
   true,  true,  true,  true,  true,  false, false,
   true,  true,  true,  true,  true,  false, false),
  ('hod',
   true,  true,  true,  true,  true,  true,  true,
   true,  true,  true,  true,  true,  true,  true),
  ('admin',
   true,  true,  true,  true,  true,  true,  true,
   true,  true,  true,  true,  true,  true,  true);

alter table public.role_permissions enable row level security;

-- Read: any authenticated profile can read the matrix. The app gates
-- UI affordances client-side using these flags, and the matrix is
-- platform-wide (no per-user / per-institution variation in v1), so
-- it's fine to expose to all authenticated callers.
create policy role_permissions_read_all
  on public.role_permissions
  for select
  to authenticated
  using (true);

-- Write: admin only. /admin/permissions is the sole writer.
create policy role_permissions_admin_write
  on public.role_permissions
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid
         and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
       where id = (auth.uid())::uuid
         and is_admin = true
    )
  );

-- ───────────────────────────── 6. requested_role: add 'hod' ─────────────────────────────

-- The signup form should let prospective HODs identify themselves so
-- the admin's approval queue can route them straight to the
-- department-head editor. Re-add the check constraint with 'hod'
-- included.
alter table public.profiles
  drop constraint profiles_requested_role_check;

alter table public.profiles
  add constraint profiles_requested_role_check
    check (requested_role in ('student', 'faculty', 'hod', 'admin'));

comment on column public.profiles.requested_role is
  'Self-declared role at signup. ''student'' | ''faculty'' | ''hod'' | ''admin''. INFORMATIONAL ONLY — does not grant privileges. The admin reads this to decide whether to set is_admin / is_faculty / role during approval. The column-lock trigger continues to keep the load-bearing columns out of non-admin reach.';
