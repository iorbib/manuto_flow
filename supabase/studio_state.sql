create table if not exists studio_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

