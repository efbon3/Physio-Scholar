-- Bookmarks — student "study later" list scoped per (student, card).
--
-- Different from SRS card_states (the scheduler's working memory) and
-- different from content_flags (the QA loop). Bookmarks let a learner
-- one-tap a card that they want to revisit outside the SRS queue —
-- typically a question whose explanation they want to come back to,
-- or a misconception they're chewing on.
--
-- card_id stores the legacy `{chapter}:{index}` identifier the rest
-- of the codebase already uses (matches content_flags.card_id), so a
-- bookmark survives chapter file renames as long as the chapter slug
-- stays put. UUID promotion comes in a follow-up.
--
-- One bookmark per (profile, card) — the toggle action either inserts
-- or deletes. RLS scopes reads + writes to the owner; admins keep no
-- access here (it's a private learner surface, not moderation data).

create table public.card_bookmarks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null check (
    char_length(card_id) >= 3
    and char_length(card_id) <= 200
    and card_id ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?:[0-9]+$'
  ),
  created_at timestamptz not null default now(),
  unique (profile_id, card_id)
);

comment on table public.card_bookmarks is
  'Per-student "study later" list. One row per (profile, card). Toggle action inserts on add, deletes on remove. Independent from SRS state — bookmarking does not change scheduling.';

create index card_bookmarks_profile_idx
  on public.card_bookmarks (profile_id, created_at desc);

alter table public.card_bookmarks enable row level security;

create policy card_bookmarks_select_own
  on public.card_bookmarks
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

create policy card_bookmarks_insert_own
  on public.card_bookmarks
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy card_bookmarks_delete_own
  on public.card_bookmarks
  for delete
  to authenticated
  using (profile_id = (select auth.uid()));
