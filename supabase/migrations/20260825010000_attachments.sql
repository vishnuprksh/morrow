insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attachments', 'attachments', false, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload their own attachments" on storage.objects
for insert to authenticated with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users read their own attachments" on storage.objects
for select to authenticated using (bucket_id = 'attachments' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users delete their own attachments" on storage.objects
for delete to authenticated using (bucket_id = 'attachments' and (storage.foldername(name))[1] = (select auth.uid()::text));