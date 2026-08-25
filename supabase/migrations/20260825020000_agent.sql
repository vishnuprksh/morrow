alter table public.notes
  add column if not exists search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content_markdown, ''))
  ) stored;

create index if not exists notes_search_vector_idx on public.notes using gin(search_vector);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active_note_id uuid references public.notes(id) on delete set null,
  status text not null default 'running' check (status in ('running', 'completed', 'cancelled', 'failed')),
  messages jsonb not null default '[]'::jsonb,
  tool_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);
alter table public.agent_runs enable row level security;
create policy "Users manage their own agent runs" on public.agent_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger agent_runs_set_updated_at before update on public.agent_runs
  for each row execute function public.set_updated_at();

create or replace function public.search_user_notes(query_text text, result_limit integer default 8)
returns table (id uuid, title text, content_markdown text, folder_id uuid, version integer, updated_at timestamptz, rank real)
language sql security invoker set search_path = public
as $$
  select n.id, n.title, n.content_markdown, n.folder_id, n.version, n.updated_at,
    ts_rank(n.search_vector, websearch_to_tsquery('simple', query_text)) as rank
  from public.notes n
  where n.user_id = auth.uid()
    and n.search_vector @@ websearch_to_tsquery('simple', query_text)
  order by rank desc, n.updated_at desc
  limit least(greatest(result_limit, 1), 20);
$$;