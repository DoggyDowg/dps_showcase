create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  agency_id uuid references public.agency_settings(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  position text not null,
  avatar_url text,
  bio text,
  status text not null default 'active'::text check (status in ('active', 'inactive')),
  social_media jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb
);

-- Create indexes
create index if not exists agents_agency_id_idx on public.agents(agency_id);
create index if not exists agents_status_idx on public.agents(status);

-- Enable Row Level Security
alter table public.agents enable row level security;

-- Create policies
create policy "Agents are viewable by everyone" on public.agents
  for select using (true);

create policy "Agents are editable by authenticated users only" on public.agents
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_agents_updated_at
  before update on public.agents
  for each row
  execute function public.handle_updated_at(); 