-- Create the asset_category enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_category') THEN
    CREATE TYPE public.asset_category AS ENUM (
      'features_banner',
      'lifestyle_banner',
      'neighbourhood_banner',
      'property_logo'
    );
  END IF;
END $$; 