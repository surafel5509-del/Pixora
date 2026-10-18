-- VISTORA additive schema for the existing UDS Supabase project.
-- Apply first to a Supabase development branch and review before production.
create extension if not exists pgcrypto;

create table if not exists public.vistora_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or username ~ '^[a-zA-Z0-9_]{3,30}$'),
  display_name text,
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vistora_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text check (description is null or char_length(description) <= 3000),
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  thumbnail_path text,
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  category text,
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft','published','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vistora_media_feed_idx on public.vistora_media (status, visibility, created_at desc);
create index if not exists vistora_media_owner_idx on public.vistora_media (owner_id, created_at desc);
create index if not exists vistora_media_tags_idx on public.vistora_media using gin (tags);

create table if not exists public.vistora_collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vistora_collections_owner_idx on public.vistora_collections (owner_id, created_at desc);

create table if not exists public.vistora_collection_items (
  collection_id uuid not null references public.vistora_collections(id) on delete cascade,
  media_id uuid not null references public.vistora_media(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
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
  media_id uuid references public.vistora_media(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create or replace function public.vistora_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vistora_profiles_updated_at on public.vistora_profiles;
create trigger vistora_profiles_updated_at before update on public.vistora_profiles
for each row execute function public.vistora_set_updated_at();
drop trigger if exists vistora_media_updated_at on public.vistora_media;
create trigger vistora_media_updated_at before update on public.vistora_media
for each row execute function public.vistora_set_updated_at();
drop trigger if exists vistora_collections_updated_at on public.vistora_collections;
create trigger vistora_collections_updated_at before update on public.vistora_collections
for each row execute function public.vistora_set_updated_at();

alter table public.vistora_profiles enable row level security;
alter table public.vistora_media enable row level security;
alter table public.vistora_collections enable row level security;
alter table public.vistora_collection_items enable row level security;
alter table public.vistora_likes enable row level security;
alter table public.vistora_follows enable row level security;
alter table public.vistora_reports enable row level security;

create policy "VISTORA public profiles readable" on public.vistora_profiles
for select to anon, authenticated using (true);
create policy "VISTORA users insert own profile" on public.vistora_profiles
for insert to authenticated with check (auth.uid() = id);
create policy "VISTORA users update own profile" on public.vistora_profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "VISTORA published public media readable" on public.vistora_media
for select to anon, authenticated using (
  (status = 'published' and visibility = 'public') or owner_id = (select auth.uid())
);
create policy "VISTORA authenticated owners create media" on public.vistora_media
for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "VISTORA owners update media" on public.vistora_media
for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "VISTORA owners delete media" on public.vistora_media
for delete to authenticated using (owner_id = (select auth.uid()));

create policy "VISTORA collection owners read collections" on public.vistora_collections
for select to authenticated using (owner_id = (select auth.uid()) or not is_private);
create policy "VISTORA owners create collections" on public.vistora_collections
for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "VISTORA owners update collections" on public.vistora_collections
for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "VISTORA owners delete collections" on public.vistora_collections
for delete to authenticated using (owner_id = (select auth.uid()));

create policy "VISTORA collection items follow collection access" on public.vistora_collection_items
for select to authenticated using (exists (
  select 1 from public.vistora_collections c
  where c.id = collection_id and (c.owner_id = (select auth.uid()) or not c.is_private)
));
create policy "VISTORA owners add collection items" on public.vistora_collection_items
for insert to authenticated with check (
  added_by = (select auth.uid()) and exists (
    select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = (select auth.uid())
  )
);
create policy "VISTORA owners remove collection items" on public.vistora_collection_items
for delete to authenticated using (exists (
  select 1 from public.vistora_collections c where c.id = collection_id and c.owner_id = (select auth.uid())
));

create policy "VISTORA likes readable" on public.vistora_likes
for select to authenticated using (true);
create policy "VISTORA users like as themselves" on public.vistora_likes
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "VISTORA users unlike as themselves" on public.vistora_likes
for delete to authenticated using (user_id = (select auth.uid()));

create policy "VISTORA follows readable" on public.vistora_follows
for select to authenticated using (true);
create policy "VISTORA users follow as themselves" on public.vistora_follows
for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "VISTORA users unfollow as themselves" on public.vistora_follows
for delete to authenticated using (follower_id = (select auth.uid()));

create policy "VISTORA users submit reports" on public.vistora_reports
for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "VISTORA users read own reports" on public.vistora_reports
for select to authenticated using (reporter_id = (select auth.uid()));

grant select on public.vistora_profiles to anon, authenticated;
grant insert, update on public.vistora_profiles to authenticated;
grant select on public.vistora_media to anon, authenticated;
grant insert, update, delete on public.vistora_media to authenticated;
grant select, insert, update, delete on public.vistora_collections to authenticated;
grant select, insert, delete on public.vistora_collection_items to authenticated;
grant select, insert, delete on public.vistora_likes to authenticated;
grant select, insert, delete on public.vistora_follows to authenticated;
grant select, insert on public.vistora_reports to authenticated;
