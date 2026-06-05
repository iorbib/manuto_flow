create table if not exists studio_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table studio_state replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'studio_state'
  ) then
    alter publication supabase_realtime add table studio_state;
  end if;
end $$;
