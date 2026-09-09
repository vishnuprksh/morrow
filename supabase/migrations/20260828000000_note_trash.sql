alter table public.notes add column deleted_at timestamptz;

create index notes_user_id_deleted_at_idx
  on public.notes(user_id, deleted_at, updated_at desc);

create or replace function public.purge_expired_notes()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.notes
  where deleted_at is not null
    and deleted_at <= now() - interval '30 days';
end;
$$;

create or replace function public.search_user_notes(query_text text, result_limit integer default 8)
returns table (id uuid, title text, content_markdown text, folder_id uuid, version integer, updated_at timestamptz, rank real)
language sql security invoker set search_path = public
as $$
  select n.id, n.title, n.content_markdown, n.folder_id, n.version, n.updated_at,
    ts_rank(n.search_vector, websearch_to_tsquery('simple', query_text)) as rank
  from public.notes n
  where n.user_id = auth.uid()
    and n.deleted_at is null
    and n.search_vector @@ websearch_to_tsquery('simple', query_text)
  order by rank desc, n.updated_at desc
  limit least(greatest(result_limit, 1), 20);
$$;

-- Schedule this function from Supabase pg_cron when the extension is enabled:
-- select cron.schedule('purge-expired-notes', '15 2 * * *', $$select public.purge_expired_notes()$$);
