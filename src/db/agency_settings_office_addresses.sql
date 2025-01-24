-- Add office_addresses column to agency_settings as a JSONB array
alter table agency_settings add column if not exists office_addresses jsonb default '[]'::jsonb;

-- Create an index for faster querying
create index if not exists idx_agency_settings_office_addresses on agency_settings using gin (office_addresses);

-- Add a check constraint to ensure office_addresses is an array
alter table agency_settings add constraint office_addresses_is_array check (jsonb_typeof(office_addresses) = 'array'); 