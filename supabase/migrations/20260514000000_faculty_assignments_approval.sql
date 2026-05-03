-- Phase B — HOD approval workflow on faculty_assignments.
--
-- Faculty author assignments as drafts; an HOD in the same department
-- reviews + approves before students see them. Backfill stamps every
-- existing row as `approved` so nothing already-shipped vanishes from
-- student dashboards mid-roll-out.
--
-- The five statuses are:
--   - draft              — author is still working on it (default for new rows)
--   - pending_hod        — submitted; in the HOD's queue
--   - approved           — visible to the targeted students
--   - rejected           — terminally refused; HOD comment carries the reason
--   - changes_requested  — HOD asked for revisions; faculty edits + re-submits
--
-- Re-approving on edit:
-- The existing `updated_at` trigger doesn't reset status — that's
-- intentional, but it means a faculty edit-after-approval doesn't
-- automatically re-enter the HOD queue. Add a row-level BEFORE UPDATE
-- trigger that, when a non-status field changes on an `approved` row,
-- snaps status back to `pending_hod` so any post-approval material edit
-- is re-reviewed (faculty tweak typo → HOD re-confirms). The trigger
-- skips when the only delta is status itself (HOD's approval action) or
-- updated_at (the existing set_updated_at trigger).
--
-- The other publishable surfaces (announcements, student_tasks,
-- schedule entries) gain the same status columns when they ship in a
-- later phase. We keep this migration focused on faculty_assignments
-- so the workflow can be exercised end-to-end before the surface area
-- grows.

-- ───────────────────────────── 1. status columns ─────────────────────────────

alter table public.faculty_assignments
  add column status text not null default 'approved'
    check (status in ('draft', 'pending_hod', 'approved', 'rejected', 'changes_requested')),
  add column submitted_at timestamptz,
  add column decided_at timestamptz,
  add column decided_by uuid references public.profiles(id) on delete set null,
  add column decision_comment text;

comment on column public.faculty_assignments.status is
  'Approval-workflow state. New rows from Phase B onward default to draft via the create action; pre-existing rows keep status=approved (the schema default applied during this migration''s backfill) so they stay visible to students.';
comment on column public.faculty_assignments.submitted_at is
  'When the faculty submitted the draft for HOD review. NULL for rows that never went through the workflow (legacy data).';
comment on column public.faculty_assignments.decided_at is
  'When the HOD approved / rejected / requested changes. NULL while the row is in draft or pending_hod.';
comment on column public.faculty_assignments.decided_by is
  'HOD profile id who took the decision. Cleared if that HOD is later removed.';
comment on column public.faculty_assignments.decision_comment is
  'Optional HOD comment shown to faculty (e.g. "rephrase Q3"); shown to students only on approve.';

-- Approval-queue index — pending rows by submitted_at so the queue
-- shows oldest-first. Partial index keeps the row count tiny since
-- most rows are eventually approved or rejected.
create index faculty_assignments_pending_idx
  on public.faculty_assignments (submitted_at)
  where status = 'pending_hod';

-- ───────────────────────────── 2. re-review on material edits ─────────────────────────────

create or replace function public.faculty_assignments_re_review_on_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_is_admin boolean;
begin
  -- Service-role / SECURITY DEFINER paths skip — no JWT, no admin check
  -- needed. Same posture as the existing column-lock trigger.
  if caller_id is null then
    return new;
  end if;

  -- Admins bypass the re-review requirement. Their edits land directly
  -- (admins already have the authority an HOD has).
  select coalesce(p.is_admin, false) into caller_is_admin
    from public.profiles p
    where p.id = caller_id;
  if caller_is_admin then
    return new;
  end if;

  -- Skip when the only deltas are workflow-internal (the HOD or
  -- faculty themselves moving the row through statuses) or
  -- timestamp bookkeeping. We only force re-review on *content* edits.
  if old.status is distinct from new.status then
    return new;
  end if;

  -- Material content fields. Add new ones here when the table grows.
  if old.title is distinct from new.title
     or old.description is distinct from new.description
     or old.due_at is distinct from new.due_at then
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

comment on function public.faculty_assignments_re_review_on_edit is
  'BEFORE UPDATE: snap an approved row back to pending_hod when a non-admin caller edits any of its content fields (title, description, due_at). Admins bypass; status-only or timestamp-only updates pass through. See migration 20260514.';

revoke all on function public.faculty_assignments_re_review_on_edit() from public;

create trigger faculty_assignments_re_review_on_edit_trigger
  before update on public.faculty_assignments
  for each row
  execute function public.faculty_assignments_re_review_on_edit();

-- ───────────────────────────── 3. RLS — gate student reads on status ─────────────────────────────

-- The existing select policy lets every authenticated profile in the
-- institution read every row. Drop it and replace with two:
--   - approved rows: visible to the whole institution (current behaviour)
--   - non-approved rows: visible to faculty (own drafts) + HOD (dept queue)
--                        + admins. Students don't see drafts.
drop policy if exists faculty_assignments_select_inst on public.faculty_assignments;

create policy faculty_assignments_select_approved_or_owner
  on public.faculty_assignments
  for select
  to authenticated
  using (
    institution_id = (
      select institution_id from public.profiles where id = (select auth.uid())
    )
    and (
      -- Approved rows are visible to everyone in the institution.
      status = 'approved'
      -- Faculty can see their own drafts / pending / rejected.
      or faculty_id = (select auth.uid())
      -- HOD of the faculty's department (when the table grows to carry
      -- a department_id we'll join on it; for now any HOD in the
      -- institution can see the institution's queue).
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid())
          and p.institution_id = faculty_assignments.institution_id
          and p.role in ('hod', 'admin')
      )
      -- Admins see everything via the role check above.
    )
  );

comment on policy faculty_assignments_select_approved_or_owner on public.faculty_assignments is
  'Students see only status=approved rows. Faculty see their own drafts/pending. HOD/admin see all in their institution. Replaces faculty_assignments_select_inst from migration 20260509.';
