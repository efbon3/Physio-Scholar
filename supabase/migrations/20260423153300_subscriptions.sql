-- Subscriptions: data model for tiered access. v1 enforces nothing (all pilot
-- students are on the 'pilot' tier for free); table exists so pricing can be
-- added in v1.5 / v2 without schema churn.

create type public.subscription_tier as enum (
  'free',          -- unauthenticated or signed up but inactive
  'pilot',         -- v1 pilot cohort (author's MBBS batch), free
  'student',       -- future individual paid tier
  'institution'    -- future per-college licence
);

create type public.subscription_status as enum (
  'active',
  'past_due',
  'cancelled',
  'expired'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tier public.subscription_tier not null default 'pilot',
  status public.subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
  'Tiered access model. v1 is always tier=pilot/status=active. Billing integration is out of scope for v1 per build spec §2.x.';

create index subscriptions_profile_idx on public.subscriptions (profile_id);

-- At most one ACTIVE subscription per profile. Historical cancelled rows are
-- fine and expected (tier changes, cancellations).
create unique index subscriptions_one_active_per_profile
  on public.subscriptions (profile_id)
  where status = 'active';

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
