-- Create agency_settings table
CREATE TABLE agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  copyright TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  footer_links JSONB DEFAULT '[]'::jsonb,
  menu_items JSONB DEFAULT '{}'::jsonb
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
  ON agency_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable write access for authenticated users"
  ON agency_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON agency_settings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON agency_settings FOR DELETE
  TO authenticated
  USING (true); 