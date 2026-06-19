-- Storage bucket for blog cover + section images.
-- Public read (served via public URL); only the owner may write.

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Public can read objects in this bucket.
drop policy if exists "blog_images_read" on storage.objects;
create policy "blog_images_read" on storage.objects for select
  using (bucket_id = 'blog-images');

-- Owner-only writes.
drop policy if exists "blog_images_insert" on storage.objects;
create policy "blog_images_insert" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_owner());

drop policy if exists "blog_images_update" on storage.objects;
create policy "blog_images_update" on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_owner())
  with check (bucket_id = 'blog-images' and public.is_owner());

drop policy if exists "blog_images_delete" on storage.objects;
create policy "blog_images_delete" on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_owner());
