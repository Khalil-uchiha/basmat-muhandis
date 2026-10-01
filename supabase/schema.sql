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
  created_at    timestamptz not null default now()
);

create index if not exists photos_album_idx on public.photos (album);
create index if not exists photos_created_at_idx on public.photos (created_at desc);

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

-- Public bucket holding event photos and member portraits.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

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
