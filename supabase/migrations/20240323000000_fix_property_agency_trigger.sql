-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_property_agency_name_trigger ON properties;
DROP FUNCTION IF EXISTS update_property_agency_name();

-- Create a function to update agency_name that handles NULL agency_id
CREATE OR REPLACE FUNCTION update_property_agency_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If agency_id is NULL, set agency_name to NULL
  IF NEW.agency_id IS NULL THEN
    NEW.agency_name := NULL;
  ELSE
    -- Otherwise, get the agency name from agency_settings
    NEW.agency_name := (
      SELECT name 
      FROM agency_settings 
      WHERE id = NEW.agency_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update agency_name
CREATE TRIGGER update_property_agency_name_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_property_agency_name(); 