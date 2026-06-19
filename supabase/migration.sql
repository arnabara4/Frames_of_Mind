-- Frames of Mind — schema + RLS
-- Single-owner blog: public can read blogs/sections; any authenticated user (the owner) can write.
-- Anyone can submit a contact message; only authenticated users can read them.

create extension if not exists "pgcrypto";

create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  cover_image text,
  excerpt     text,
  read_time   text default '2 min read',
  author_id   uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.blog_sections (
  id         uuid primary key default gen_random_uuid(),
  blog_id    uuid not null references public.blogs (id) on delete cascade,
  kind       text not null check (kind in ('image','paragraph','title','quote')),
  content    text,
  image_url  text,
  align      text not null default 'left' check (align in ('left','center','right')),
  position   int  not null default 0
);

-- Backfill for existing databases created before `align` existed.
alter table public.blog_sections
  add column if not exists align text not null default 'left'
  check (align in ('left','center','right'));

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  first_name text,
  last_name  text,
  email      text,
  body       text,
  created_at timestamptz not null default now()
);

create index if not exists blog_sections_blog_id_idx on public.blog_sections (blog_id, position);
create index if not exists blogs_created_at_idx on public.blogs (created_at desc);

-- RLS ------------------------------------------------------------------
alter table public.blogs         enable row level security;
alter table public.blog_sections enable row level security;
alter table public.messages      enable row level security;

-- Strict single-owner check: true only for the designated admin email.
-- Centralised so every write policy shares one source of truth.
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in
    ('pranavi@frame.com', 'pranavisinghal2007@gmail.com');
$$;

-- blogs: public read, owner-only write
drop policy if exists "blogs_select_public" on public.blogs;
create policy "blogs_select_public" on public.blogs for select using (true);

drop policy if exists "blogs_write_owner" on public.blogs;
drop policy if exists "blogs_insert_owner" on public.blogs;
drop policy if exists "blogs_update_owner" on public.blogs;
drop policy if exists "blogs_delete_owner" on public.blogs;
create policy "blogs_insert_owner" on public.blogs for insert
  to authenticated with check (public.is_owner());
create policy "blogs_update_owner" on public.blogs for update
  to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "blogs_delete_owner" on public.blogs for delete
  to authenticated using (public.is_owner());

-- blog_sections: public read, owner-only write
drop policy if exists "sections_select_public" on public.blog_sections;
create policy "sections_select_public" on public.blog_sections for select using (true);

drop policy if exists "sections_write_owner" on public.blog_sections;
drop policy if exists "sections_insert_owner" on public.blog_sections;
drop policy if exists "sections_update_owner" on public.blog_sections;
drop policy if exists "sections_delete_owner" on public.blog_sections;
create policy "sections_insert_owner" on public.blog_sections for insert
  to authenticated with check (public.is_owner());
create policy "sections_update_owner" on public.blog_sections for update
  to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "sections_delete_owner" on public.blog_sections for delete
  to authenticated using (public.is_owner());

-- messages: anyone may submit, only the owner may read
drop policy if exists "messages_insert_public" on public.messages;
create policy "messages_insert_public" on public.messages for insert
  to anon, authenticated with check (true);

drop policy if exists "messages_select_owner" on public.messages;
create policy "messages_select_owner" on public.messages for select
  to authenticated using (public.is_owner());
