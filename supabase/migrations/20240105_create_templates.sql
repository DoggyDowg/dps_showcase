create table templates (
  id uuid default uuid_generate_v4() primary key,
  version text not null unique,
  major integer not null,
  minor integer not null,
  patch integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_stable boolean default false not null,
  changes text[] default array[]::text[] not null,
  components jsonb default '[]'::jsonb not null,
  schema jsonb default '{}'::jsonb not null,
  migrations jsonb default '[]'::jsonb not null
);

-- Create index for version lookup
create index idx_templates_version on templates(version);

-- Create index for stable version lookup
create index idx_templates_is_stable on templates(is_stable);

-- Add template_version to properties if not exists
do $$
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'properties' and column_name = 'template_version') then
    alter table properties add column template_version text default '1.0.0' not null;
  end if;
end $$; 