-- Update the asset_category enum type to include new categories
ALTER TYPE public.asset_category ADD VALUE IF NOT EXISTS 'features_banner';
ALTER TYPE public.asset_category ADD VALUE IF NOT EXISTS 'lifestyle_banner';
ALTER TYPE public.asset_category ADD VALUE IF NOT EXISTS 'neighbourhood_banner';
ALTER TYPE public.asset_category ADD VALUE IF NOT EXISTS 'property_logo'; 