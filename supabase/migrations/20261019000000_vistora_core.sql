-- VISTORA core schema; isolated table names avoid modifying existing UDS tables.
create extension if not exists pgcrypto;
create table if not exists public.vistora_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vistora_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  media_type text not null default 'image' check (media_type in ('image','video')),
  storage_path text,
  external_url text,
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft','published','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vistora_collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.vistora_collection_items (
  collection_id uuid not null references public.vistora_collections(id) on delete cascade,
  media_id uuid not null references public.vistora_media(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, media_id)
);
create table if not exists public.vistora_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid not null references public.vistora_media(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);
create table if not exists public.vistora_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create table if not exists public.vistora_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid references public.vistora_media(id) on delete set null,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists vistora_media_owner_created_idx on public.vistora_media(owner_id, created_at desc);
create index if not exists vistora_media_public_created_idx on public.vistora_media(created_at desc) where visibility = 'public' and status = 'published';
create index if not exists vistora_media_tags_idx on public.vistora_media using gin(tags);
create index if not exists vistora_collections_owner_idx on public.vistora_collections(owner_id);
create index if not exists vistora_collection_items_media_idx on public.vistora_collection_items(media_id);
alter table public.vistora_profiles enable row level security;
alter table public.vistora_media enable row level security;
alter table public.vistora_collections enable row level security;
alter table public.vistora_collection_items enable row level security;
alter table public.vistora_likes enable row level security;
alter table public.vistora_follows enable row level security;
alter table public.vistora_reports enable row level security;
drop policy if exists "VISTORA profiles are readable" on public.vistora_profiles;
create policy "VISTORA profiles are readable" on public.vistora_profiles for select using (true);
drop policy if exists "Users manage their own profile" on public.vistora_profiles;
create policy "Users manage their own profile" on public.vistora_profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Public media is readable" on public.vistora_media;
create policy "Public media is readable" on public.vistora_media for select using ((visibility = 'public' and status = 'published') or owner_id = auth.uid());
drop policy if exists "Owners manage their media" on public.vistora_media;
create policy "Owners manage their media" on public.vistora_media for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Public collections readable" on public.vistora_collections;
create policy "Public collections readable" on public.vistora_collections for select using (is_public or owner_id = auth.uid());
drop policy if exists "Owners manage collections" on public.vistora_collections;
create policy "Owners manage collections" on public.vistora_collections for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Collection items readable through collection" on public.vistora_collection_items;
create policy "Collection items readable through collection" on public.vistora_collection_items for select using (exists (select 1 from public.vistora_collections c where c.id = collection_id and (c.is_public or c.owner_id = auth.uid())));
drop policy if exists "Collection owners manage items" on public.vistora_collection_items;
create policy "Collection owners manage items" on public.vistora_collection_items for all to authenticated using (exists (select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = auth.uid()));
drop policy if exists "Likes are publicly readable" on public.vistora_likes;
create policy "Likes are publicly readable" on public.vistora_likes for select using (true);
drop policy if exists "Users manage their likes" on public.vistora_likes;
create policy "Users manage their likes" on public.vistora_likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Follows are readable" on public.vistora_follows;
create policy "Follows are readable" on public.vistora_follows for select using (true);
drop policy if exists "Users manage their follows" on public.vistora_follows;
create policy "Users manage their follows" on public.vistora_follows for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());
drop policy if exists "Users manage their reports" on public.vistora_reports;
create policy "Users manage their reports" on public.vistora_reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Users see their own reports" on public.vistora_reports;
create policy "Users see their own reports" on public.vistora_reports for select to authenticated using (reporter_id = auth.uid());
grant select on public.vistora_profiles, public.vistora_media, public.vistora_collections, public.vistora_collection_items, public.vistora_likes, public.vistora_follows to anon, authenticated;
grant insert, update, delete on public.vistora_profiles, public.vistora_media, public.vistora_collections, public.vistora_collection_items, public.vistora_likes, public.vistora_follows to authenticated;
grant insert, select on public.vistora_reports to authenticated;
