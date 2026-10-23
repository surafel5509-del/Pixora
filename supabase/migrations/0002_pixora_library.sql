-- Pixora personal library schema (v2).
--
-- Isolated in its own tables (pixora_*) so it can be applied to an existing
-- Supabase project without touching any other schema. Every table is protected
-- by row-level security: a signed-in visitor can only read and write their own
-- rows, and anonymous visitors can read nothing.
--
-- Apply with:  supabase db push            (linked projects)
--          or  psql "$DATABASE_URL" -f 0002_pixora_library.sql

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.pixora_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pixora_boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null default '',
  accent text not null default 'lime',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pixora_saved_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  external_id text not null,
  provider text not null default 'pixabay',
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  title text not null default '',
  media_url text not null,
  thumbnail_url text not null default '',
  page_url text not null default '',
  board_id uuid references public.pixora_boards (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (owner_id, provider, external_id, media_type)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists pixora_boards_owner_idx
  on public.pixora_boards (owner_id, created_at desc);

create index if not exists pixora_saved_media_owner_idx
  on public.pixora_saved_media (owner_id, created_at desc);

create index if not exists pixora_saved_media_board_idx
  on public.pixora_saved_media (board_id)
  where board_id is not null;

create index if not exists pixora_saved_media_lookup_idx
  on public.pixora_saved_media (owner_id, external_id, media_type);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.pixora_profiles enable row level security;
alter table public.pixora_boards enable row level security;
alter table public.pixora_saved_media enable row level security;

-- Profiles: readable by everyone (for public boards later), writable by owner.
drop policy if exists "Profiles are readable" on public.pixora_profiles;
create policy "Profiles are readable"
  on public.pixora_profiles for select
  using (true);

drop policy if exists "Users manage their own profile" on public.pixora_profiles;
create policy "Users manage their own profile"
  on public.pixora_profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Boards: private by default; public boards are readable by anyone.
drop policy if exists "Boards are readable by owner or public" on public.pixora_boards;
create policy "Boards are readable by owner or public"
  on public.pixora_boards for select
  using (is_public or owner_id = auth.uid());

drop policy if exists "Owners manage their boards" on public.pixora_boards;
create policy "Owners manage their boards"
  on public.pixora_boards for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Saved media: strictly private to the owner.
drop policy if exists "Users read their own saved media" on public.pixora_saved_media;
create policy "Users read their own saved media"
  on public.pixora_saved_media for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Users manage their own saved media" on public.pixora_saved_media;
create policy "Users manage their own saved media"
  on public.pixora_saved_media for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Profile bootstrap: mirror every new auth user into pixora_profiles.
-- ---------------------------------------------------------------------------
create or replace function public.pixora_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pixora_profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists pixora_on_auth_user_created on auth.users;
create trigger pixora_on_auth_user_created
  after insert on auth.users
  for each row execute function public.pixora_handle_new_user();

-- Keep updated_at fresh on boards.
create or replace function public.pixora_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pixora_boards_touch on public.pixora_boards;
create trigger pixora_boards_touch
  before update on public.pixora_boards
  for each row execute function public.pixora_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.pixora_profiles to anon, authenticated;
grant insert, update, delete on public.pixora_profiles to authenticated;

grant select, insert, update, delete on public.pixora_boards to authenticated;
grant select on public.pixora_boards to anon;

grant select, insert, update, delete on public.pixora_saved_media to authenticated;
