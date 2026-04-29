-- Phase 5+ — assignment engagement tracking for the faculty hub.
--
-- A faculty member who creates an assignment wants to know who's
-- doing it and who isn't, so they can chase up the laggards. The
-- assignments table itself doesn't track engagement (it's a notice
-- board, not a workflow); engagement is inferred from the reviews
-- table — specifically, "did this student do anything between the
-- assignment dropping and now?"
--
-- v1 caveat: assignments don't yet carry a target mechanism, so the
-- engagement signal here is "general activity during the assignment
-- window." A null signal (zero reviews) is meaningful — it tells
-- faculty the student hasn't engaged with the platform at all since
-- the assignment dropped, regardless of topic. A non-null signal
-- means at minimum the student has been active; faculty correlates
-- with assignment topic in their head. Mechanism-targeted assignments
-- + completion (proper "done / not done" semantics) are a follow-up.

create or replace function public.assignment_engagement(p_assignment_id uuid)
returns table (
  profile_id uuid,
  full_name text,
  nickname text,
  year_of_study integer,
  reviews_since_assignment bigint,
  last_review_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  with assignment as (
    select id, institution_id, created_at
    from public.faculty_assignments
    where id = p_assignment_id
  ),
  authorised as (
    -- Same auth gate as the cohort RPCs: admin, or faculty in the
    -- assignment's institution. The exists() also guards against the
    -- "assignment doesn't exist" path — null institution_id can't
    -- match anything.
    select 1
    from assignment a
    where public.can_view_cohort(a.institution_id) = true
  )
  select
    p.id as profile_id,
    p.full_name,
    p.nickname,
    p.year_of_study,
    coalesce(
      count(r.id) filter (where r.created_at >= a.created_at),
      0
    ) as reviews_since_assignment,
    max(r.created_at) filter (where r.created_at >= a.created_at) as last_review_at
  from assignment a
  cross join lateral (select 1) gate -- noop join to keep the WHERE shape symmetric
  join public.profiles p
    on p.institution_id = a.institution_id
   and p.is_admin = false
   and p.is_faculty = false
  left join public.reviews r on r.profile_id = p.id
  where exists (select 1 from authorised)
  group by p.id, p.full_name, p.nickname, p.year_of_study, a.created_at;
$$;

revoke all on function public.assignment_engagement(uuid) from public;
grant execute on function public.assignment_engagement(uuid) to authenticated;

comment on function public.assignment_engagement(uuid) is
  'Per-student engagement during an assignment window. Returns one row per student in the assignment''s institution with their review count + last activity since the assignment was created. Caller must be admin or same-institution faculty.';
