alter table public.notes
  add column agent_instructions text not null default '';
