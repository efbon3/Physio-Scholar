-- Phase E — write-once HOD → student messages.
--
-- The HOD wants to nudge weak students directly ("attendance is below
-- 75%, please come see me", "your last assignment was rejected — let's
-- talk through the comments"). The original brief was specific:
-- HOD sends, student reads, no reply thread. Threaded messaging is
-- v2; v1 is a notice-board scoped to one recipient at a time.
--
-- Storage:
--   - sender_id: HOD or admin profile. ON DELETE SET NULL so a removed
--     HOD doesn't take their messages with them — students still see
--     the message (with sender name "(former HOD)" surfaced by the UI).
--   - recipient_id: student profile. ON DELETE CASCADE — if the student
--     account is deleted, their inbox goes with them.
--   - institution_id: snapshotted on insert and used by RLS to scope
--     the read/write checks. Cross-institution messaging is impossible
--     by construction.
--   - body: 1-2000 chars. Free text; rendered as plain text on the
--     student inbox.
--   - sent_at: server-set on insert via DEFAULT.
--   - read_at: student-only update path (the only column the student
--     can write). NULL means "unread, surface on dashboard".

create table public.weak_student_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  body text not null check (char_length(trim(body)) >= 1 and char_length(body) <= 2000),
  sent_at timestamptz not null default now(),
  read_at timestamptz
);

comment on table public.weak_student_messages is
  'Write-once HOD/admin → student messages. Sender authors; recipient reads + flips read_at. No reply path in v1; the build spec is explicit about that.';

create index weak_student_messages_recipient_idx
  on public.weak_student_messages (recipient_id, sent_at desc);
create index weak_student_messages_unread_idx
  on public.weak_student_messages (recipient_id)
  where read_at is null;

alter table public.weak_student_messages enable row level security;

-- READ: sender or recipient. The sender keeps a "what I sent" trail
-- (the HOD inbox surfaces this); the recipient reads their inbox.
create policy weak_student_messages_select_own
  on public.weak_student_messages
  for select
  to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

-- INSERT: caller must be HOD or admin AND in the same institution as
-- the recipient AND the row's sender_id pins to auth.uid() (no
-- impersonation). The recipient_id is checked at-write time via the
-- caller's institution_id — RLS reads profiles inline.
create policy weak_student_messages_insert_hod_or_admin
  on public.weak_student_messages
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.profiles caller
      where caller.id = (select auth.uid())
        and (caller.role in ('hod', 'admin') or caller.is_admin = true)
        and caller.institution_id = weak_student_messages.institution_id
    )
    and exists (
      select 1 from public.profiles recipient
      where recipient.id = weak_student_messages.recipient_id
        and recipient.institution_id = weak_student_messages.institution_id
    )
  );

-- UPDATE: only the recipient, and only the read_at column. Postgres RLS
-- doesn't have native column-level UPDATE policies, so we lean on a
-- BEFORE UPDATE trigger to snap every other column back to OLD when
-- the caller is the recipient (and refuse the update entirely when
-- they're not).
create policy weak_student_messages_update_recipient
  on public.weak_student_messages
  for update
  to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

create or replace function public.weak_student_messages_lock_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    return new;
  end if;

  -- Recipient-only update path. The select policy already gates row
  -- visibility; this trigger is the column-level half.
  if caller_id = old.recipient_id then
    new.id := old.id;
    new.sender_id := old.sender_id;
    new.recipient_id := old.recipient_id;
    new.institution_id := old.institution_id;
    new.body := old.body;
    new.sent_at := old.sent_at;
    -- read_at: allow setting from NULL to a timestamp once; once set,
    -- pin it (so a student can't "un-read" a message and bring it
    -- back to the top of their inbox).
    if old.read_at is not null then
      new.read_at := old.read_at;
    end if;
    return new;
  end if;

  -- Anyone else: refuse.
  raise exception 'weak_student_messages: only the recipient can update read_at';
end;
$$;

revoke all on function public.weak_student_messages_lock_columns() from public;

create trigger weak_student_messages_lock_columns_trigger
  before update on public.weak_student_messages
  for each row
  execute function public.weak_student_messages_lock_columns();

-- DELETE: admin only. Sender-side or recipient-side delete would let
-- a sender retract a message after sending (defeating "write-once")
-- or let a student delete a message they didn't want to read
-- (defeating the gate entirely). Admins keep the option for
-- mistake recovery / DPDPA-deletion compliance.
create policy weak_student_messages_delete_admin
  on public.weak_student_messages
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and is_admin = true
    )
  );
