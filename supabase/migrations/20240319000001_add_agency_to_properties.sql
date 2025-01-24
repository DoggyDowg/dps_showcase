-- Add agency_id column to properties table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE properties
    ADD COLUMN agency_id UUID REFERENCES agency_settings(id);
  END IF;
END $$;

-- Add agency_name column for denormalized access if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'agency_name'
  ) THEN
    ALTER TABLE properties
    ADD COLUMN agency_name TEXT;
  END IF;
END $$;

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_property_agency_name_trigger ON properties;
DROP FUNCTION IF EXISTS update_property_agency_name();

-- Create a function to update agency_name
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

-- Create trigger to automatically update agency_name
CREATE TRIGGER update_property_agency_name_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_property_agency_name(); 