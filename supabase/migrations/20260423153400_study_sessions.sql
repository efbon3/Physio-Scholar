-- Study sessions: a timed block of active-recall practice by a learner.
-- v1 records minimal telemetry (start/end, duration); Phase 3 will FK cards +
-- reviews to this table once the SRS engine exists.

create type public.study_session_status as enum (
  'active',        -- currently in progress
  'completed',     -- ended normally
  'abandoned'      -- timed out or exited without explicit end
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,

  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer generated always as (
    case
      when ended_at is null then null
      else greatest(0, extract(epoch from (ended_at - started_at)))::integer
    end
  ) stored,

  status public.study_session_status not null default 'active',

  -- Context — which system/topic the session was anchored to.
  -- Free text in v1; Phase 2 may replace with a system_id FK.
  system_slug text,

  -- Counters (populated by app as cards are shown/answered). Not authoritative
  -- in v1; Phase 3's reviews table will be the source of truth.
  cards_seen integer not null default 0 check (cards_seen >= 0),
  cards_correct integer not null default 0 check (cards_correct >= 0 and cards_correct <= cards_seen),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.study_sessions is
  'A single block of active-recall practice. Minimal telemetry in v1; Phase 3 links review rows back to a session_id here.';

create index study_sessions_profile_idx on public.study_sessions (profile_id);
create index study_sessions_active_idx on public.study_sessions (profile_id, started_at desc)
  where status = 'active';

create trigger study_sessions_set_updated_at
  before update on public.study_sessions
  for each row execute function public.set_updated_at();

alter table public.study_sessions enable row level security;
