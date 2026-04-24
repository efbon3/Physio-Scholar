-- Phase 5+ G3 — public Supabase Storage bucket for mechanism diagrams.
--
-- The CMS editor lets admins attach SVG/PNG/JPEG images to mechanisms.
-- Files land in this bucket under `<mechanism_id>/<filename>`; the
-- public URL is pasted into the mechanism markdown as a standard
-- `![alt](url)` image reference and rendered via ReactMarkdown.
--
-- Bucket is public so images embed without auth round-trips on the
-- learner side. Write access is admin-only via storage.objects RLS,
-- keeping the old "who can author content" model intact.

insert into storage.buckets (id, name, public)
values ('diagrams', 'diagrams', true)
on conflict (id) do nothing;

create policy "diagrams_select_any"
  on storage.objects
  for select
  to public
  using (bucket_id = 'diagrams');

create policy "diagrams_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'diagrams'
    and (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

create policy "diagrams_update_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'diagrams'
    and (select is_admin from public.profiles where id = (select auth.uid())) = true
  )
  with check (
    bucket_id = 'diagrams'
    and (select is_admin from public.profiles where id = (select auth.uid())) = true
  );

create policy "diagrams_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'diagrams'
    and (select is_admin from public.profiles where id = (select auth.uid())) = true
  );
