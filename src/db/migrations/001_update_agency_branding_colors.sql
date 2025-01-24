-- Update agency_settings table to use new color schema
UPDATE agency_settings
SET branding = jsonb_set(
  branding,
  '{colors}',
  jsonb_build_object(
    'dark', COALESCE(branding->'colors'->>'secondary', branding->'colors'->>'dark', '#000000'),
    'light', COALESCE(branding->'colors'->>'primary', branding->'colors'->>'light', '#ffffff'),
    'accent', COALESCE(branding->'colors'->>'accent', '#000000')
  )
)
WHERE branding->>'colors' IS NOT NULL;

-- Remove old color fields if they exist
UPDATE agency_settings
SET branding = branding #- '{colors,primary}'
WHERE branding->'colors'->>'primary' IS NOT NULL;

UPDATE agency_settings
SET branding = branding #- '{colors,secondary}'
WHERE branding->'colors'->>'secondary' IS NOT NULL; 