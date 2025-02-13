-- Add new values to the asset_type enum
ALTER TYPE public.asset_type ADD VALUE IF NOT EXISTS 'glb';

-- Add new values to the asset_category enum
ALTER TYPE public.asset_category ADD VALUE IF NOT EXISTS '3d_tour'; 