-- Flexible, owner-editable About page.
-- Each block carries its own typography + layout controls.

create table if not exists public.about_blocks (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'paragraph'
             check (kind in ('heading','paragraph','list','quote','image','divider','split')),
  content    text,
  image_url  text,
  align      text not null default 'left'  check (align in ('left','center','right')),
  font       text not null default 'serif' check (font in ('display','serif','sans')),
  size       text not null default 'md'    check (size in ('sm','md','lg','xl')),
  img_width  text not null default 'md'    check (img_width in ('sm','md','lg','full')),
  img_pct    int,
  img_h      int,
  img_side   text not null default 'left'  check (img_side in ('left','right')),
  text_x     int  not null default 0,
  text_y     int  not null default 0,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- Backfill for databases created before these columns existed.
alter table public.about_blocks add column if not exists img_pct int;
alter table public.about_blocks add column if not exists img_h int;
alter table public.about_blocks add column if not exists img_side text not null default 'left';
alter table public.about_blocks add column if not exists text_x int not null default 0;
alter table public.about_blocks add column if not exists text_y int not null default 0;

create index if not exists about_blocks_position_idx on public.about_blocks (position);

alter table public.about_blocks enable row level security;

drop policy if exists "about_select_public" on public.about_blocks;
create policy "about_select_public" on public.about_blocks for select using (true);

drop policy if exists "about_insert_owner" on public.about_blocks;
create policy "about_insert_owner" on public.about_blocks for insert
  to authenticated with check (public.is_owner());

drop policy if exists "about_update_owner" on public.about_blocks;
create policy "about_update_owner" on public.about_blocks for update
  to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "about_delete_owner" on public.about_blocks;
create policy "about_delete_owner" on public.about_blocks for delete
  to authenticated using (public.is_owner());

-- Seed the existing bio as the default page (only if empty).
insert into public.about_blocks (kind, content, image_url, align, font, size, img_width, position)
select * from (values
  ('heading', 'Welcome — This is me!!', null, 'left', 'display', 'xl', 'md', 0),
  ('image', null, null, 'right', 'serif', 'md', 'md', 1),
  ('paragraph', 'Hi there! I''m Itsuki Nakano, the fifth-born of the Nakano quintuplets. People often say I''m the serious and studious one — but hey, someone has to keep things on track, right?', null, 'left', 'serif', 'md', 'md', 2),
  ('list', 'I love food — especially anything with meat!\nI take my studies seriously and keep improving.\nSomeday I hope to become a teacher.', null, 'left', 'serif', 'md', 'md', 3),
  ('quote', 'Thanks for stopping by — just don''t touch my lunch, okay?', null, 'left', 'serif', 'lg', 'md', 4)
) as v(kind, content, image_url, align, font, size, img_width, position)
where not exists (select 1 from public.about_blocks);

-- Atomic replace-all used by the About editor (delete + insert in one txn so a
-- failed save can never wipe the page). WHERE clause satisfies the no-unqualified-
-- delete guard. Owner-only.
create or replace function public.set_about_blocks(blocks jsonb)
returns void
language plpgsql
security invoker
as $$
begin
  if not public.is_owner() then
    raise exception 'Only the owner can edit the About page';
  end if;
  delete from public.about_blocks where position is not null;
  insert into public.about_blocks
    (kind, content, image_url, align, font, size, img_width, img_pct, img_h, img_side, text_x, text_y, position)
  select x.kind, x.content, x.image_url, coalesce(x.align,'left'), coalesce(x.font,'serif'),
         coalesce(x.size,'md'), coalesce(x.img_width,'md'), x.img_pct, x.img_h,
         coalesce(x.img_side,'left'), coalesce(x.text_x,0), coalesce(x.text_y,0), x.position
  from jsonb_to_recordset(blocks) as x(
    kind text, content text, image_url text, align text, font text, size text,
    img_width text, img_pct int, img_h int, img_side text, text_x int, text_y int, position int
  );
end $$;
