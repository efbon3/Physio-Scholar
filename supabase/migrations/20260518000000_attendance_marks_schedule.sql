-- Phase F+G+H — attendance, marks, and teaching schedule.
--
-- Three feature areas, one migration because the data model overlaps:
-- a class_session is the unit of attendance AND the row that appears
-- on the teaching schedule, and assignment_marks attaches to existing
-- faculty_assignments rows.
--
-- New tables:
--
--   1. class_sessions — when faculty teaches a batch. Carries topic,
--      time, duration, location, status (scheduled | held | cancelled).
--      Unified across the schedule view and the attendance grid: the
--      schedule reads upcoming rows; attendance reads past or held
--      rows and joins to attendance_records.
--
--   2. attendance_codes — institution-scoped codes the faculty uses
--      to mark a row in the grid (P / A / L / EX / etc.). Codes are
--      authored once per institution by the admin; the grid renders
--      them as a dropdown per student row.
--
--   3. attendance_records — one row per (session × student) with the
--      code chosen and an audit trail (marked_by, marked_at). Unique
--      on (session_id, student_id) — re-marking is an UPDATE.
--
--   4. assignment_marks — per-student marks for a faculty_assignments
--      row. Unique on (assignment_id, student_id) — re-grading is an
--      UPDATE. Caries graded_by + graded_at.
--
-- Column additions:
--   - faculty_assignments.max_marks — nullable; presence flips the
--     existing assignments page from "notice board" to "graded
--     work" mode in the UI.
--   - institutions.attendance_threshold — numeric 0..1 default 0.75
--     for the "are they below threshold" banner.
--   - institutions.grade_thresholds — jsonb array of {label, min}.
--     Default seeds A=85, B=75, C=65, D=50; admin edits via /admin/settings.
--
-- All four tables enable RLS with same-institution scoping. Faculty /
-- HOD / admin write to the recording side (attendance_records,
-- assignment_marks); students read their own rows only. Admins still
-- author the codes and the threshold settings.

-- ───────────────────────────── 1. class_sessions ─────────────────────────────

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  topic text not null check (char_length(trim(topic)) >= 1 and char_length(topic) <= 200),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60
    check (duration_minutes between 5 and 600),
  location text check (location is null or char_length(location) <= 100),
  notes text check (notes is null or char_length(notes) <= 2000),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'held', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.class_sessions is
  'Teaching sessions. Unified across schedule + attendance: the row scheduled in advance is the same row attendance is recorded against once held.';

create index class_sessions_institution_time_idx
  on public.class_sessions (institution_id, scheduled_at);
create index class_sessions_batch_time_idx
  on public.class_sessions (batch_id, scheduled_at) where batch_id is not null;
create index class_sessions_faculty_idx
  on public.class_sessions (faculty_id);

create trigger class_sessions_set_updated_at
  before update on public.class_sessions
  for each row
  execute function public.set_updated_at();

alter table public.class_sessions enable row level security;

create policy class_sessions_read_same_institution
  on public.class_sessions
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
  );

create policy class_sessions_insert_faculty
  on public.class_sessions
  for insert
  to authenticated
  with check (
    faculty_id = (select auth.uid())
    and institution_id = (
      select institution_id from public.profiles
      where id = (select auth.uid())
        and (is_faculty = true or is_admin = true or role in ('hod', 'admin', 'faculty'))
    )
  );

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

create policy class_sessions_delete_owner_or_admin
  on public.class_sessions
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

-- ───────────────────────────── 2. attendance_codes ─────────────────────────────

create table public.attendance_codes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  code text not null check (char_length(trim(code)) >= 1 and char_length(code) <= 8),
  label text not null check (char_length(trim(label)) >= 1 and char_length(label) <= 100),
  counts_toward_total boolean not null default true,
  display_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, code)
);

comment on table public.attendance_codes is
  'Per-institution attendance codes (P / A / L / EX / etc.). Faculty pick from this list when marking a session. counts_toward_total = whether the code counts toward the attendance %.';

create index attendance_codes_institution_idx on public.attendance_codes (institution_id);

create trigger attendance_codes_set_updated_at
  before update on public.attendance_codes
  for each row
  execute function public.set_updated_at();

alter table public.attendance_codes enable row level security;

create policy attendance_codes_read_same_institution
  on public.attendance_codes
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
  );

create policy attendance_codes_admin_write
  on public.attendance_codes
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  );

-- ───────────────────────────── 3. attendance_records ─────────────────────────────

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  marked_by uuid references public.profiles(id) on delete set null,
  marked_at timestamptz not null default now(),
  unique (class_session_id, student_id)
);

comment on table public.attendance_records is
  'One row per student per class session. Code references attendance_codes.code (within the session''s institution). Re-marking a student is an UPDATE on the existing row, not an INSERT.';

create index attendance_records_session_idx on public.attendance_records (class_session_id);
create index attendance_records_student_idx on public.attendance_records (student_id);

alter table public.attendance_records enable row level security;

-- READ: faculty/HOD/admin in the session's institution; OR the student
-- themselves (so /today can show "my attendance %"). The institution
-- check rides through class_sessions.institution_id.
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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  )
  with check (
    exists (
      select 1
      from public.class_sessions cs
      join public.profiles p on p.id = (select auth.uid())
      where cs.id = attendance_records.class_session_id
        and cs.institution_id = p.institution_id
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

create policy attendance_records_delete_admin
  on public.attendance_records
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  );

-- ───────────────────────────── 4. assignment_marks ─────────────────────────────

create table public.assignment_marks (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.faculty_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  marks numeric(6, 2) not null check (marks >= 0),
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

comment on table public.assignment_marks is
  'Per-student marks on a faculty_assignments row. Re-grading is an UPDATE.';

create index assignment_marks_student_idx on public.assignment_marks (student_id);
create index assignment_marks_assignment_idx on public.assignment_marks (assignment_id);

alter table public.assignment_marks enable row level security;

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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

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
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  )
  with check (
    exists (
      select 1
      from public.faculty_assignments fa
      join public.profiles p on p.id = (select auth.uid())
      where fa.id = assignment_marks.assignment_id
        and fa.institution_id = p.institution_id
        and (p.is_faculty = true or p.is_admin = true or p.role in ('hod', 'admin'))
    )
  );

create policy assignment_marks_delete_admin
  on public.assignment_marks
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  );

-- ───────────────────────────── 5. faculty_assignments.max_marks ─────────────────────────────

alter table public.faculty_assignments
  add column max_marks numeric(6, 2) check (max_marks is null or max_marks > 0);

comment on column public.faculty_assignments.max_marks is
  'Optional. When non-null the assignment is graded — the faculty marks page lets faculty enter scores 0..max_marks per student. When null the row is a notice-board task with no scoring.';

-- ───────────────────────────── 6. institutions.attendance_threshold + grade_thresholds ─────────────────────────────

alter table public.institutions
  add column attendance_threshold numeric(4, 3) not null default 0.75
    check (attendance_threshold > 0 and attendance_threshold <= 1),
  add column grade_thresholds jsonb not null
    default '[{"label":"A","min":85},{"label":"B","min":75},{"label":"C","min":65},{"label":"D","min":50}]'::jsonb;

comment on column public.institutions.attendance_threshold is
  'Fraction (0..1) below which a student is flagged as low-attendance. Default 0.75 (75%).';
comment on column public.institutions.grade_thresholds is
  'Letter-grade cut-offs as a JSON array of {label, min} sorted highest-min-first. Used to compute a letter grade from a marks percentage.';
