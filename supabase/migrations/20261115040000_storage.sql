-- Thambi media storage.
--   media-private: originals with metadata. Each person uploads only into their
--                  own folder ({user id}/...). Only the owner and the server read it.
--   media-public:  compressed copies with metadata removed. Anyone can view;
--                  only the server writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media-private', 'media-private', false, 15728640,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('media-public', 'media-public', true, 5242880,
   array['image/jpeg', 'image/webp', 'video/mp4', 'video/webm'])
on conflict (id) do nothing;

create policy "people upload to their own private folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "people read their own private files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
