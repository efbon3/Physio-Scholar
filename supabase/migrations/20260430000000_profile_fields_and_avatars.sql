-- Phase 5+ J4 — Learner profile fields + avatar storage bucket.
--
-- Adds the personally-identifying fields the user requested for the
-- profile page: DOB, postal address, phone, roll number, avatar URL.
-- (`full_name` already exists on profiles from the Phase 1 migration.)
-- All nullable so existing rows stay valid; the profile form treats
-- them as optional and the dashboard degrades gracefully when they
-- are absent.
--
-- DPDPA note: these are personal data fields. They sit on the same
-- profiles row that already carries DPDPA consent timestamps, so the
-- existing right-to-be-forgotten cascade (deletion_requested_at →
-- service_role purge) covers them automatically. The DOB column is
-- shown only to the owner and to admins per the author's stated
-- privacy posture — that visibility constraint is enforced at the
-- view layer (profile page renders own DOB; admin user-search renders
-- it; nowhere else surfaces it). No peer-visible profile views exist
-- in v1.
--
-- Avatars storage bucket follows the diagrams-bucket pattern, except
-- writes are owner-keyed (path prefix must equal the writer's auth uid)
-- rather than admin-only. Reads are public so the URL drops straight
-- into <img src> without an auth round-trip.

alter table public.profiles
  add column date_of_birth date,
  add column address text,
  add column phone text,
  add column roll_number text,
  add column avatar_url text;

-- Public-readable bucket; owner-keyed writes via storage.objects RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  524288,                                          -- 512 KB max — plenty for a 256x256 jpeg.
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "avatars_select_any"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "avatars_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "avatars_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
