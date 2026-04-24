-- Phase 5 F2 — rate_limits + enforce_rate_limit RPC.
--
-- Build spec §2.11:
--   - 80 questions served per account per day
--   - 5 password reset requests per account per day
--   - 10 AI grading calls per student per day (Phase 4, deferred)
--
-- We store one counter row per (profile, key, window_date). Rows older
-- than 14 days are pruned by a scheduled job (out of scope for the
-- pilot — a nightly `delete from rate_limits where window_date <
-- current_date - interval '14 days'` can be added later without a
-- schema change).
--
-- The RPC is SECURITY DEFINER so it runs with the owner's privileges
-- — that way application code can increment limits without needing
-- additional INSERT/UPDATE policies exposed to authenticated users.

create table public.rate_limits (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 64),
  window_date date not null default (now() at time zone 'utc')::date,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (profile_id, key, window_date)
);

comment on table public.rate_limits is
  'Daily rate-limit counters per (profile, key). Incremented by enforce_rate_limit().';

create index rate_limits_date_idx on public.rate_limits (window_date);

alter table public.rate_limits enable row level security;

-- Users see their own counters (no writes — the RPC is the only writer).
create policy rate_limits_select_own
  on public.rate_limits
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

-- enforce_rate_limit ------------------------------------------------

create or replace function public.enforce_rate_limit(
  p_profile_id uuid,
  p_key text,
  p_max_per_day integer
) returns table (allowed boolean, remaining integer, total_today integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_day date := (now() at time zone 'utc')::date;
begin
  if p_profile_id is null or auth.uid() is null or auth.uid() <> p_profile_id then
    raise exception 'unauthorised';
  end if;
  if p_max_per_day < 1 then
    raise exception 'invalid max_per_day';
  end if;

  -- Insert-or-bump the counter row for today. Using ON CONFLICT so the
  -- upsert is atomic under concurrent requests.
  insert into public.rate_limits (profile_id, key, window_date, count, updated_at)
  values (p_profile_id, p_key, v_day, 1, now())
  on conflict (profile_id, key, window_date)
  do update set count = public.rate_limits.count + 1,
                updated_at = now()
  returning count into v_count;

  if v_count > p_max_per_day then
    -- Bumped past the ceiling. Roll the count back so a client that
    -- caught the rejection and retried immediately doesn't burn through
    -- the budget every call.
    update public.rate_limits
      set count = p_max_per_day,
          updated_at = now()
      where profile_id = p_profile_id
        and key = p_key
        and window_date = v_day;
    allowed := false;
    remaining := 0;
    total_today := p_max_per_day;
    return next;
    return;
  end if;

  allowed := true;
  remaining := p_max_per_day - v_count;
  total_today := v_count;
  return next;
end;
$$;

comment on function public.enforce_rate_limit is
  'Atomic per-user-per-key daily rate limiter. Rejects when the bump would exceed p_max_per_day. Raises unauthorised if the caller is not p_profile_id.';

grant execute on function public.enforce_rate_limit(uuid, text, integer) to authenticated;
