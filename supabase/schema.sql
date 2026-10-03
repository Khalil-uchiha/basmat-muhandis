-- Basmat-Muhandis — database schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run: every statement is guarded.

-- ============================================================ members

create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  role        text        not null,
  bio         text,
  photo_url   text,
  facebook    text,
  instagram   text,
  linkedin    text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists members_sort_order_idx on public.members (sort_order);

alter table public.members enable row level security;

-- Anyone may read the roster (it powers the public Team page).
drop policy if exists "members are publicly readable" on public.members;
create policy "members are publicly readable"
  on public.members for select
  to anon, authenticated
  using (true);

-- Only signed-in committee accounts may change it.
drop policy if exists "members are writable by signed-in users" on public.members;
create policy "members are writable by signed-in users"
  on public.members for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================= photos

create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  album         text        not null,
  caption       text,
  image_url     text        not null,
  storage_path  text,
  taken_on      date,
  is_hero       boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- Added after the first release; harmless to re-run.
alter table public.photos add column if not exists is_hero boolean not null default false;

create index if not exists photos_album_idx on public.photos (album);
create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_is_hero_idx on public.photos (is_hero) where is_hero;

alter table public.photos enable row level security;

drop policy if exists "photos are publicly readable" on public.photos;
create policy "photos are publicly readable"
  on public.photos for select
  to anon, authenticated
  using (true);

drop policy if exists "photos are writable by signed-in users" on public.photos;
create policy "photos are writable by signed-in users"
  on public.photos for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================ storage
--
-- NOTE: on some projects the SQL Editor lacks ownership of the storage tables,
-- so everything below can fail with "must be owner of table objects" even
-- though every statement above succeeded. Read the output, and if it did fail
-- create the bucket and its policies through the Storage UI instead:
--   Storage -> New bucket -> name "media", tick "Public bucket"
--   Storage -> media -> Policies -> template "Allow access to authenticated
--   users only", applied to INSERT, UPDATE and DELETE.
-- The verification query at the very bottom tells you which happened.

-- Public bucket holding event photos and member portraits.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media is uploadable by signed-in users" on storage.objects;
create policy "media is uploadable by signed-in users"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media is updatable by signed-in users" on storage.objects;
create policy "media is updatable by signed-in users"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media is deletable by signed-in users" on storage.objects;
create policy "media is deletable by signed-in users"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- ============================================================ verify
-- Expect one row reading: media | t
-- No row means the bucket was NOT created — use the Storage UI (see note above).
select id, public from storage.buckets where id = 'media';
