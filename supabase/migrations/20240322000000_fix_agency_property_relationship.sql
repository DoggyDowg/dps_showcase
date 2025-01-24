-- Drop the duplicate foreign key constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_agency_settings_id_fkey;
ALTER TABLE properties DROP COLUMN IF EXISTS agency_settings_id;

-- Drop the existing agency_id foreign key
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_agency_id_fkey;

-- Recreate the agency_id foreign key with ON DELETE CASCADE
ALTER TABLE properties 
ADD CONSTRAINT properties_agency_id_fkey 
FOREIGN KEY (agency_id) 
REFERENCES agency_settings(id) 
ON DELETE CASCADE; 