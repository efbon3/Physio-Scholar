-- Phase 5+ K1 — cohort-analytics aggregate functions.
--
-- Faculty (and app admins) need a class-level view of how their cohort
-- is performing: who's active, who's drifting, which mechanisms are
-- crushing everyone vs. which ones the cohort has comfortably internalised.
--
-- The reviews table already has tight per-row RLS (everyone sees their
-- own rows only). Granting faculty/admin direct SELECT on every learner's
-- review row would over-share — they don't need the individual hint-usage
-- patterns or self-explanations, just aggregates. So we expose two
-- SECURITY DEFINER functions that:
--
--   1. compute aggregates server-side
--   2. authorise via can_view_cohort() before returning rows
--   3. scope hard to a single institution_id (no cross-institution peek)
--
-- The functions are stable, so Postgres caches results within a single
-- request. They run on the existing reviews + profiles tables — no
-- schema change required, which means the framework is ready today and
-- auto-populates as Phase 6's offline-sync starts pushing reviews.

-- Helper: is the caller faculty? Mirrors is_current_user_admin().
create or replace function public.is_current_user_faculty()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(p.is_faculty, false)
  from public.profiles p
  where p.id = (select auth.uid());
$$;

revoke all on function public.is_current_user_faculty() from public;
grant execute on function public.is_current_user_faculty() to authenticated;

-- Helper: institution_id of the calling user. Returns null for users
-- without one (e.g. early-pilot admins who weren't seeded into an
-- institution).
create or replace function public.current_user_institution_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select institution_id
  from public.profiles
  where id = (select auth.uid());
$$;

revoke all on function public.current_user_institution_id() from public;
grant execute on function public.current_user_institution_id() to authenticated;

-- Authorisation predicate for the cohort surface. App-admins see any
-- cohort (cross-institution support / debugging); faculty see only
-- their own institution's cohort.
create or replace function public.can_view_cohort(p_institution_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case
    when public.is_current_user_admin() then true
    when public.is_current_user_faculty()
         and public.current_user_institution_id() = p_institution_id
      then true
    else false
  end;
$$;

revoke all on function public.can_view_cohort(uuid) from public;
grant execute on function public.can_view_cohort(uuid) to authenticated;

-- ----------------------------------------------------------------------
-- Class roster — one row per learner in the institution, with their
-- aggregate review activity. Excludes faculty + admins from the cohort
-- itself (a faculty member is not their own student).
-- ----------------------------------------------------------------------

create or replace function public.cohort_class_roster(p_institution_id uuid)
returns table (
  profile_id uuid,
  full_name text,
  year_of_study integer,
  reviews_total bigint,
  reviews_last_7d bigint,
  retention_pct_30d integer,
  last_review_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id as profile_id,
    p.full_name,
    p.year_of_study,
    coalesce(count(r.id), 0) as reviews_total,
    coalesce(
      count(r.id) filter (where r.created_at >= now() - interval '7 days'),
      0
    ) as reviews_last_7d,
    case
      when count(r.id) filter (where r.created_at >= now() - interval '30 days') = 0
        then null
      else round(
        100.0
        * count(r.id) filter (
            where r.created_at >= now() - interval '30 days'
              and r.rating in ('good', 'easy')
          )
        / count(r.id) filter (where r.created_at >= now() - interval '30 days')
      )::integer
    end as retention_pct_30d,
    max(r.created_at) as last_review_at
  from public.profiles p
  left join public.reviews r on r.profile_id = p.id
  where p.institution_id = p_institution_id
    and p.is_admin = false
    and p.is_faculty = false
    and public.can_view_cohort(p_institution_id) = true
  group by p.id, p.full_name, p.year_of_study;
$$;

revoke all on function public.cohort_class_roster(uuid) from public;
grant execute on function public.cohort_class_roster(uuid) to authenticated;

comment on function public.cohort_class_roster(uuid) is
  'Per-learner aggregates for the cohort dashboard. SECURITY DEFINER + can_view_cohort() gate prevent cross-institution peek. Excludes faculty/admin from the returned cohort.';

-- ----------------------------------------------------------------------
-- Per-card aggregates — used by the topic heatmap. Returns one row per
-- card_id with cohort-level review counts + retention. The app maps
-- card_id → mechanism + organ_system in memory (the authored content
-- isn't in the DB), so the heatmap UI groups these rows by organ_system.
-- ----------------------------------------------------------------------

create or replace function public.cohort_card_aggregates(p_institution_id uuid)
returns table (
  card_id text,
  reviews_total bigint,
  reviews_last_30d bigint,
  retention_pct_30d integer,
  unique_learners bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with allowed_profiles as (
    select id
    from public.profiles
    where institution_id = p_institution_id
      and is_admin = false
      and is_faculty = false
  )
  select
    r.card_id,
    count(*) as reviews_total,
    count(*) filter (where r.created_at >= now() - interval '30 days') as reviews_last_30d,
    case
      when count(*) filter (where r.created_at >= now() - interval '30 days') = 0
        then null
      else round(
        100.0
        * count(*) filter (
            where r.created_at >= now() - interval '30 days'
              and r.rating in ('good', 'easy')
          )
        / count(*) filter (where r.created_at >= now() - interval '30 days')
      )::integer
    end as retention_pct_30d,
    count(distinct r.profile_id) as unique_learners
  from public.reviews r
  where r.profile_id in (select id from allowed_profiles)
    and public.can_view_cohort(p_institution_id) = true
  group by r.card_id;
$$;

revoke all on function public.cohort_card_aggregates(uuid) from public;
grant execute on function public.cohort_card_aggregates(uuid) to authenticated;

comment on function public.cohort_card_aggregates(uuid) is
  'Per-card cohort aggregates for the topic heatmap. Same auth gate as cohort_class_roster.';
