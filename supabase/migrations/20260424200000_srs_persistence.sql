-- SRS persistence (Phase 3 C2). Two tables:
--
--   card_states — per-user-per-card scheduling state. The scheduler
--                 reads the previous state, computes the next, and
--                 upserts this row. Primary key is (profile_id, card_id)
--                 so we get natural one-row-per-user-per-card semantics.
--
--   reviews     — append-only history of rating submissions. Used by
--                 the Progress tab (retention curves, mastery) and by
--                 the dispute mechanism. Immutable: no UPDATE/DELETE
--                 policy, which means the only way to alter review
--                 rows is via service_role.
--
-- Card ids are derived from mechanism markdown — format is
-- `<mechanism-id>:<question-index>`, e.g. `frank-starling:1`. We enforce
-- the shape with a CHECK so stray ids (or a markdown loader bug) don't
-- silently pollute the table.

-- Enums ---------------------------------------------------------------

create type public.srs_card_status as enum (
  'learning',
  'review',
  'leech',
  'suspended'
);

create type public.srs_rating as enum (
  'again',
  'hard',
  'good',
  'easy'
);

-- card_states ---------------------------------------------------------

create table public.card_states (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null check (card_id ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?:\d+$'),

  ease numeric(4, 2) not null default 2.5 check (ease >= 1.5),
  interval_days numeric(12, 6) not null default 0 check (interval_days >= 0),
  status public.srs_card_status not null default 'learning',
  consecutive_again_count smallint not null default 0
    check (consecutive_again_count >= 0 and consecutive_again_count <= 50),

  last_reviewed_at timestamptz,
  due_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (profile_id, card_id)
);

comment on table public.card_states is
  'SM-2 scheduling state for one card, scoped to one learner. Mirror the CardState shape in src/lib/srs/types.ts.';

create index card_states_due_idx on public.card_states (profile_id, due_at);

create trigger card_states_set_updated_at
  before update on public.card_states
  for each row execute function public.set_updated_at();

alter table public.card_states enable row level security;

create policy card_states_select_own
  on public.card_states
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

create policy card_states_insert_own
  on public.card_states
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy card_states_update_own
  on public.card_states
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- DELETE is blocked for card_states — clearing a card's scheduling is
-- a service_role operation (e.g. the dispute workflow after content
-- retirement). Client has no need.

-- reviews -------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null check (card_id ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?:\d+$'),
  rating public.srs_rating not null,

  -- Per build spec §2.5 there are three hint tiers; zero means the
  -- student answered without any hint.
  hints_used smallint not null default 0 check (hints_used between 0 and 3),

  -- Session time captured to surface "Rated too fast" quality signals
  -- (build spec acceptance criteria — metacognitive calibration).
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),

  -- Optional link back to the study session the review happened in.
  session_id uuid references public.study_sessions (id) on delete set null,

  created_at timestamptz not null default now()
);

comment on table public.reviews is
  'Immutable append-only log of rating submissions. Drives retention analytics and the dispute mechanism (build spec §2.6).';

create index reviews_profile_idx on public.reviews (profile_id, created_at desc);
create index reviews_session_idx on public.reviews (session_id) where session_id is not null;

alter table public.reviews enable row level security;

create policy reviews_select_own
  on public.reviews
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

create policy reviews_insert_own
  on public.reviews
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

-- UPDATE and DELETE intentionally absent. A review row, once written,
-- is the canonical record of what happened. Corrections happen by
-- writing a new review (or via service_role for true admin edits).
