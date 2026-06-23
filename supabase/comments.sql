-- Frames of Mind — comments
-- YouTube-style: top-level comments + one level of replies (replies are flat
-- under their root comment). Anyone may post (name + email collected); the email
-- is kept PRIVATE — public reads never see it. The owner may delete (moderation).
-- Run after migration.sql (depends on public.is_owner()).

create extension if not exists "pgcrypto";

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  blog_id      uuid not null references public.blogs (id) on delete cascade,
  parent_id    uuid references public.comments (id) on delete cascade,
  author_name  text not null check (char_length(btrim(author_name)) between 1 and 60),
  author_email text not null check (char_length(author_email) between 3 and 160),
  body         text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at   timestamptz not null default now()
);

create index if not exists comments_blog_id_idx  on public.comments (blog_id, created_at);
create index if not exists comments_parent_id_idx on public.comments (parent_id);

-- RLS ------------------------------------------------------------------
alter table public.comments enable row level security;

-- Public may read (to display) and insert (to comment). Only the owner deletes.
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments for select using (true);

drop policy if exists "comments_insert_public" on public.comments;
create policy "comments_insert_public" on public.comments for insert
  to anon, authenticated with check (true);

drop policy if exists "comments_delete_owner" on public.comments;
create policy "comments_delete_owner" on public.comments for delete
  to authenticated using (public.is_owner());

-- Column privileges keep the commenter's email out of the public API entirely
-- (RLS gates rows; column grants gate columns — PostgREST honours both).
revoke select on public.comments from anon, authenticated;
grant  select (id, blog_id, parent_id, author_name, body, created_at)
  on public.comments to anon, authenticated;
grant  insert on public.comments to anon, authenticated;
grant  delete on public.comments to authenticated;
