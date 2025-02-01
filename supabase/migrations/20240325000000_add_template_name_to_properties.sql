-- Add template_name column to properties table
alter table properties
add column if not exists template_name text default 'cusco';

-- Update existing properties to have the default template
update properties
set template_name = 'cusco'
where template_name is null;