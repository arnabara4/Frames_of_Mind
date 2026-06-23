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

-- ── Commenter identity table ─────────────────────────────────────────────
-- One Gmail address maps to exactly one display name and vice-versa.
-- Emails and names are stored case-normalised (lower). The email column is
-- never visible to the public API — all access goes through the security-
-- definer functions below.
create table if not exists public.commenters (
  email      text primary key check (lower(email) like '%@gmail.com'),
  name       text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness on name: "John" and "john" are the same person.
create unique index if not exists commenters_name_lower_idx
  on public.commenters (lower(name));

alter table public.commenters enable row level security;

-- No direct public read/write — everything goes through the functions below.
drop policy if exists "commenters_delete_owner" on public.commenters;
create policy "commenters_delete_owner" on public.commenters for delete
  to authenticated using (public.is_owner());

-- Full revoke so PostgREST never exposes the table directly.
revoke all on public.commenters from anon, authenticated;
grant  delete on public.commenters to authenticated;

-- ── get_commenter_name ───────────────────────────────────────────────────
-- Returns the stored display name for a given Gmail, or NULL if not yet seen.
-- Safe to call from the browser (security definer hides the full table).
create or replace function public.get_commenter_name(p_email text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select name from public.commenters where email = lower(p_email);
$$;

grant execute on function public.get_commenter_name(text) to anon, authenticated;

-- ── check_commenter ──────────────────────────────────────────────────────
-- Atomically validates and registers the email↔name mapping.
-- Returns { ok, field?, error?, canonical_name? }.
-- Invariants enforced:
--   • One email → one name  (same email, different name → rejected)
--   • One name  → one email (same name, different email → rejected)
create or replace function public.check_commenter(p_email text, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stored_name text;
begin
  -- Is this email already registered with a name?
  select name into v_stored_name
  from   public.commenters
  where  email = lower(p_email);

  if found then
    -- Name must match (case-insensitive).
    if lower(v_stored_name) <> lower(p_name) then
      return jsonb_build_object(
        'ok',    false,
        'field', 'name',
        'error', format(
          'This email is already registered as "%s". Please use that name.',
          v_stored_name
        )
      );
    end if;
    -- Known commenter — return the canonical (original-case) stored name.
    return jsonb_build_object('ok', true, 'canonical_name', v_stored_name);
  end if;

  -- New email: make sure the display name is not already taken.
  if exists (
    select 1 from public.commenters where lower(name) = lower(p_name)
  ) then
    return jsonb_build_object(
      'ok',    false,
      'field', 'name',
      'error', 'This display name is already taken — please pick another.'
    );
  end if;

  -- Register the mapping (handle the rare concurrent-insert race gracefully).
  begin
    insert into public.commenters (email, name)
    values (lower(p_email), p_name);
  exception
    when unique_violation then
      return jsonb_build_object(
        'ok',    false,
        'field', 'name',
        'error', 'This display name was just taken — please try another.'
      );
  end;

  return jsonb_build_object('ok', true, 'canonical_name', p_name);
end;
$$;

grant execute on function public.check_commenter(text, text) to anon, authenticated;
