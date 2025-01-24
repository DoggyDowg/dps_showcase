-- Add office_addresses column to agency_settings if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'agency_settings' 
    AND column_name = 'office_addresses'
  ) THEN
    ALTER TABLE agency_settings
    ADD COLUMN office_addresses JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$; 