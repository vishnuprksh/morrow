create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null default 'Untitled note' check (char_length(trim(title)) between 1 and 200),
  content_markdown text not null default '',
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openrouter', 'openai-compatible')),
  encrypted_api_key text not null,
  model text not null check (char_length(trim(model)) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index folders_user_id_position_idx on public.folders(user_id, position);
create index folders_parent_id_idx on public.folders(parent_id);
create index notes_user_id_updated_at_idx on public.notes(user_id, updated_at desc);
create index notes_folder_id_idx on public.notes(folder_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger folders_set_updated_at before update on public.folders for each row execute function public.set_updated_at();
create trigger notes_set_updated_at before update on public.notes for each row execute function public.set_updated_at();
create trigger ai_credentials_set_updated_at before update on public.ai_credentials for each row execute function public.set_updated_at();

create or replace function public.validate_note_folder_owner()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.folder_id is not null and not exists (
    select 1 from public.folders where id = new.folder_id and user_id = new.user_id
  ) then
    raise exception 'folder does not belong to the current user';
  end if;
  return new;
end;
$$;

create trigger notes_validate_folder_owner
before insert or update of user_id, folder_id on public.notes
for each row execute function public.validate_note_folder_owner();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.ai_credentials enable row level security;

create policy "Users manage their own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage their own folders" on public.folders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own AI credentials" on public.ai_credentials for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.ai_credentials force row level security;
