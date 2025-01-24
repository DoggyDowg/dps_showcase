-- First, remove the property_id column from agency_settings
alter table agency_settings drop column if exists property_id;

-- Add status column to agency_settings
alter table agency_settings add column if not exists status text not null default 'active'::text check (status in ('active', 'inactive'));

-- Add agency_settings_id column to properties if it exists
alter table properties add column if not exists agency_settings_id uuid references public.agency_settings(id) on delete restrict;

-- Create properties table if it doesn't exist
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  agency_settings_id uuid references public.agency_settings(id) on delete restrict,
  name text not null,
  street_address text,
  suburb text,
  state text,
  price text,
  status text not null default 'draft'::text check (status in ('draft', 'published', 'archived')),
  metadata jsonb default '{}'::jsonb,
  content jsonb default '{}'::jsonb
);

-- Create indexes (only after ensuring columns exist)
create index if not exists idx_properties_agency_settings_id on properties(agency_settings_id);
create index if not exists idx_properties_status on properties(status);
create index if not exists idx_agency_settings_status on agency_settings(status);

-- Enable Row Level Security
alter table public.properties enable row level security;

-- Create policies for properties
create policy "Properties are viewable by everyone" on public.properties
  for select using (true);

create policy "Properties are editable by authenticated users only" on public.properties
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create updated_at trigger for properties
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_properties_updated_at
  before update on public.properties
  for each row
  execute function public.handle_updated_at(); 