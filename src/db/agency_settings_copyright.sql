-- Add copyright column to agency_settings
alter table agency_settings add column if not exists copyright text;

-- Update existing rows to have a default copyright
update agency_settings 
set copyright = name || ' © ' || extract(year from current_date) || '. All rights reserved.'
where copyright is null; 