-- Phase 5+ G1 — content_chapters table for CMS-authored chapters.
--
-- The pilot has moved from solo-author-in-repo to team-authoring via an
-- admin UI. Files under content/chapters/*.md stay as a canonical
-- fallback (so existing tests + CI continue to work without needing a
-- live DB), but the app now reads DB rows first.
--
-- Storage model: one row per chapter, holding the full markdown
-- *including* frontmatter. Keeping it as a single text column makes
-- export-to-markdown trivial (SELECT the column, write to disk) and
-- avoids re-inventing the parser on the DB side. The parser in
-- src/lib/content/loader.ts is reused unchanged for DB-sourced content.
--
-- Status mirrors the `chapterStatusSchema` in src/lib/content/schema.ts
-- so frontmatter's `status: draft|review|published|retired` and the DB's
-- row-level status can line up during authoring.

create type public.content_chapter_status as enum (
  'draft',
  'review',
  'published',
  'retired'
);

create table public.content_chapters (
  -- kebab-case id, matches the frontmatter `id:` and the URL slug.
  id text primary key check (id ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  markdown text not null check (char_length(markdown) between 1 and 500000),
  status public.content_chapter_status not null default 'draft',

  -- Audit: who last saved this revision. Trigger fills updated_at.
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.content_chapters is
  'CMS-authored chapter markdown. Dual-source with content/chapters/*.md; DB wins when a row exists. Full file content (frontmatter + body) stored as a single text column for simple export.';

create index content_chapters_status_idx
  on public.content_chapters (status, updated_at desc);

create trigger content_chapters_set_updated_at
  before update on public.content_chapters
  for each row execute function public.set_updated_at();

alter table public.content_chapters enable row level security;

-- Every authenticated user can READ published rows — the app loads
-- them server-side on every chapter-page render.
create policy content_chapters_select_published
  on public.content_chapters
  for select
  to authenticated
  using (status = 'published');

-- Admins can READ every row, including drafts under review.
create policy content_chapters_select_admin
  on public.content_chapters
  for select
  to authenticated
  using (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

-- Admins can INSERT and UPDATE. No separate write policy for learners.
create policy content_chapters_insert_admin
  on public.content_chapters
  for insert
  to authenticated
  with check (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

create policy content_chapters_update_admin
  on public.content_chapters
  for update
  to authenticated
  using (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  )
  with check (
    (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

-- DELETE intentionally blocked even for admins. Retire by setting
-- status = 'retired' instead; keeps audit history intact.
