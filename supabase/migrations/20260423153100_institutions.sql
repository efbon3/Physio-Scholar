-- Institutions: medical colleges / training institutes.
-- v1 has exactly one row (the author's own institution), but the column lives
-- now so v2 multi-tenancy doesn't require a disruptive schema migration.

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  country char(2) not null default 'IN' check (country ~ '^[A-Z]{2}$'),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.institutions is
  'Medical colleges or training institutes. v1 is single-institution; table exists to support v2 multi-tenancy without migration churn.';

create trigger institutions_set_updated_at
  before update on public.institutions
  for each row execute function public.set_updated_at();

-- RLS ENABLED with no policies = default deny. Policies arrive in A3.
alter table public.institutions enable row level security;
