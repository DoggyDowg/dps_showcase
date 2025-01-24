-- Enable RLS on the properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON properties;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON properties
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON properties
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON properties
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON properties
    FOR DELETE
    TO authenticated
    USING (true); 