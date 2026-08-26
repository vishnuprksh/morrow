alter table public.notes add column if not exists is_archived boolean not null default false;

create index if not exists notes_user_id_archived_idx on public.notes(user_id, is_archived, updated_at desc);
