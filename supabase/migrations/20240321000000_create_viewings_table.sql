-- Drop existing table if it exists
drop table if exists public.viewings;

-- Create viewings table
create table public.viewings (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references public.properties(id) on delete cascade,
    viewing_datetime timestamp with time zone not null,
    type text check (type in ('public', 'private')) not null,
    status text check (status in ('scheduled', 'completed', 'cancelled')) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.viewings enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on public.viewings
    for select to authenticated using (true);

create policy "Enable insert access for authenticated users" on public.viewings
    for insert to authenticated with check (true);

create policy "Enable update access for authenticated users" on public.viewings
    for update to authenticated using (true);

create policy "Enable delete access for authenticated users" on public.viewings
    for delete to authenticated using (true);

-- Add indexes
create index viewings_property_id_idx on public.viewings(property_id);
create index viewings_datetime_idx on public.viewings(viewing_datetime); 