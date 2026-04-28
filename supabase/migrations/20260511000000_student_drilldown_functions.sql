-- Phase 5+ — per-student drill-down for the faculty hub.
--
-- Faculty want to drill into one student to find specific weak
-- mechanisms and recent activity. The cohort-level RPCs already
-- handle aggregation across the class; these new ones do the same
-- shape of work but scoped to a single profile_id.
--
-- Auth gate: identical to the cohort RPCs (`can_view_cohort()` —
-- admin or faculty in the same institution) plus an explicit
-- cross-check that the target student belongs to the institution
-- the caller is asking about. The check prevents a faculty member
-- from peeking at students at another institution by passing a
-- mismatched (institution_id, student_id) pair.

-- ----------------------------------------------------------------------
-- Per-card aggregates for one student. One row per card_id with that
-- student's review count, recent activity, and retention. Used by
-- /faculty/students/[id] to render a mechanism-by-mechanism mastery
-- breakdown.
-- ----------------------------------------------------------------------

create or replace function public.student_card_aggregates(
  p_institution_id uuid,
  p_student_id uuid
)
returns table (
  card_id text,
  reviews_total bigint,
  reviews_last_30d bigint,
  retention_pct_30d integer,
  last_review_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
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
    max(r.created_at) as last_review_at
  from public.reviews r
  where r.profile_id = p_student_id
    and public.can_view_cohort(p_institution_id) = true
    and exists (
      select 1
      from public.profiles p
      where p.id = p_student_id
        and p.institution_id = p_institution_id
        and p.is_admin = false
        and p.is_faculty = false
    )
  group by r.card_id;
$$;

revoke all on function public.student_card_aggregates(uuid, uuid) from public;
grant execute on function public.student_card_aggregates(uuid, uuid) to authenticated;

comment on function public.student_card_aggregates(uuid, uuid) is
  'Per-card aggregates for one student in an institution. Caller must be admin or same-institution faculty AND the target must be a student of the named institution.';

-- ----------------------------------------------------------------------
-- Recent reviews for one student. Used by /faculty/students/[id] to
-- render a chronological activity log. p_limit caps the row count so
-- a long-running student doesn't pull thousands of rows in one shot.
-- ----------------------------------------------------------------------

create or replace function public.student_recent_reviews(
  p_institution_id uuid,
  p_student_id uuid,
  p_limit integer default 50
)
returns table (
  id uuid,
  card_id text,
  rating public.srs_rating,
  hints_used integer,
  time_spent_seconds integer,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.card_id,
    r.rating,
    r.hints_used,
    r.time_spent_seconds,
    r.created_at
  from public.reviews r
  where r.profile_id = p_student_id
    and public.can_view_cohort(p_institution_id) = true
    and exists (
      select 1
      from public.profiles p
      where p.id = p_student_id
        and p.institution_id = p_institution_id
        and p.is_admin = false
        and p.is_faculty = false
    )
  order by r.created_at desc
  limit greatest(1, least(p_limit, 500));
$$;

revoke all on function public.student_recent_reviews(uuid, uuid, integer) from public;
grant execute on function public.student_recent_reviews(uuid, uuid, integer) to authenticated;

comment on function public.student_recent_reviews(uuid, uuid, integer) is
  'Most recent reviews for one student. Same auth gate as student_card_aggregates. p_limit clamped to [1, 500].';

-- ----------------------------------------------------------------------
-- Profile-level summary for one student — name, year, last activity.
-- Used in the page header and to confirm the student exists / is
-- visible to the caller before doing the per-card and recent-review
-- queries.
-- ----------------------------------------------------------------------

create or replace function public.student_profile_summary(
  p_institution_id uuid,
  p_student_id uuid
)
returns table (
  profile_id uuid,
  full_name text,
  nickname text,
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
    p.nickname,
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
  where p.id = p_student_id
    and p.institution_id = p_institution_id
    and p.is_admin = false
    and p.is_faculty = false
    and public.can_view_cohort(p_institution_id) = true
  group by p.id, p.full_name, p.nickname, p.year_of_study;
$$;

revoke all on function public.student_profile_summary(uuid, uuid) from public;
grant execute on function public.student_profile_summary(uuid, uuid) to authenticated;

comment on function public.student_profile_summary(uuid, uuid) is
  'Single-row summary for one student. Returns no rows if the caller is unauthorized or the student is not enrolled in the named institution.';
