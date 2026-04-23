-- Profiles: 1:1 extension of auth.users with application-specific columns.
-- DPDPA-compliant consent fields (build spec §2.10) live here.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  institution_id uuid references public.institutions (id) on delete restrict,
  full_name text,
  year_of_study smallint check (year_of_study between 1 and 5),

  -- DPDPA §2.10: explicit consent flow at signup, granular analytics opt-out.
  consent_terms_accepted_at timestamptz,
  consent_privacy_accepted_at timestamptz,
  consent_analytics boolean not null default false,
  consent_analytics_updated_at timestamptz,

  -- Minor handling: declared at signup. Guardian email stored only if minor.
  -- v1 is author's MBBS batch (typically 18+); columns present for future use.
  is_minor boolean,
  guardian_email citext,

  -- §2.10 right-to-delete: 30-day grace period. NULL = not requested.
  deletion_requested_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile data extending auth.users. DPDPA consent + deletion fields per build spec §2.10.';
comment on column public.profiles.deletion_requested_at is
  'Timestamp of user-initiated deletion request. Profile + cascaded rows are purged 30 days after this time via a scheduled job (Phase 6).';
comment on column public.profiles.consent_analytics is
  'Granular analytics consent (build spec §2.10). Default false — opt-in required.';

create index profiles_institution_idx on public.profiles (institution_id);
create index profiles_deletion_requested_idx on public.profiles (deletion_requested_at)
  where deletion_requested_at is not null;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth.users row is inserted.
-- No consent values are copied here; the app must populate them on first login
-- via the signup/consent flow (otherwise we'd fabricate consent the user never gave).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

comment on function public.handle_new_user is
  'Creates a blank public.profiles row when auth.users grows. Consent columns stay NULL until the signup flow records them explicitly.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Default-deny until A3 adds policies.
alter table public.profiles enable row level security;
