-- Add missing columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agency_settings(id),
ADD COLUMN IF NOT EXISTS agency_name TEXT,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_property_agency_name_trigger ON properties;
DROP FUNCTION IF EXISTS update_property_agency_name();

-- Create the function
CREATE OR REPLACE FUNCTION update_property_agency_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.agency_name := (
    SELECT name 
    FROM agency_settings 
    WHERE id = NEW.agency_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_property_agency_name_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_property_agency_name(); 