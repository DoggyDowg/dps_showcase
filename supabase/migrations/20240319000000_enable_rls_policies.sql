-- Enable RLS
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON agency_settings;
DROP POLICY IF EXISTS "Enable read access for public" ON agency_settings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON agency_settings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON agency_settings;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON agency_settings;

-- Create policies
-- Allow public read access for frontend functionality
CREATE POLICY "Enable read access for public"
ON agency_settings
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage agency settings
CREATE POLICY "Enable insert access for authenticated users"
ON agency_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON agency_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON agency_settings
FOR DELETE
TO authenticated
USING (true);