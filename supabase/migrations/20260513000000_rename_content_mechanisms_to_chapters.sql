-- Rename content_mechanisms → content_chapters.
--
-- The unit of content is a chapter of a physiology textbook, not a
-- single physiological mechanism. Sidebar nav, code identifiers, and
-- the filesystem directory have already moved to "chapter" naming;
-- the database table was the last holdout.
--
-- Renames everything end-to-end: table, status enum, indexes, trigger,
-- and all four RLS policies. Existing rows survive the rename
-- unchanged (SQL `alter ... rename` doesn't touch row data).
--
-- The `id` column comment + the table comment also pick up the
-- renamed terminology so a fresh `\d+ public.content_chapters` reads
-- consistently.

alter type public.content_mechanism_status rename to content_chapter_status;

alter table public.content_mechanisms rename to content_chapters;

alter index public.content_mechanisms_status_idx rename to content_chapters_status_idx;

alter trigger content_mechanisms_set_updated_at on public.content_chapters
  rename to content_chapters_set_updated_at;

alter policy content_mechanisms_select_published on public.content_chapters
  rename to content_chapters_select_published;
alter policy content_mechanisms_select_admin on public.content_chapters
  rename to content_chapters_select_admin;
alter policy content_mechanisms_insert_admin on public.content_chapters
  rename to content_chapters_insert_admin;
alter policy content_mechanisms_update_admin on public.content_chapters
  rename to content_chapters_update_admin;

comment on table public.content_chapters is
  'CMS-authored chapter markdown. Dual-source with content/chapters/*.md; DB wins when a row exists. Full file content (frontmatter + body) stored as a single text column for simple export.';
