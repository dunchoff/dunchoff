create table if not exists public.dunchland_state (
  id text primary key,
  state jsonb,
  save_slots jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dunchland_state enable row level security;

drop policy if exists "Public can read DunchLand state" on public.dunchland_state;
create policy "Public can read DunchLand state"
on public.dunchland_state
for select
to anon
using (id = 'current');

drop policy if exists "Public can write DunchLand state" on public.dunchland_state;
create policy "Public can write DunchLand state"
on public.dunchland_state
for insert
to anon
with check (id = 'current');

drop policy if exists "Public can update DunchLand state" on public.dunchland_state;
create policy "Public can update DunchLand state"
on public.dunchland_state
for update
to anon
using (id = 'current')
with check (id = 'current');
