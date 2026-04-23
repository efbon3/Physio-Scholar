-- Utilities: shared extensions and trigger functions used by later migrations.
-- No tables created here; safe to run first.

-- citext: case-insensitive text. Reserved for future email fields on public
-- tables; auth.users already stores emails, so this is ancillary today.
create extension if not exists "citext";

-- gen_random_uuid() is provided by pgcrypto, which Supabase enables by default.
-- If we ever run on a vanilla Postgres, uncomment:
-- create extension if not exists "pgcrypto";

-- Generic updated_at auto-bump. Attach with `create trigger` per table.
-- Writes are a no-op if the column is unchanged, so this is cheap.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at is
  'Sets updated_at = now() on row update. Attach via per-table BEFORE UPDATE trigger.';
