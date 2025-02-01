import type { AssetCategory } from '@/types/assets'

/**
 * Builds a URL for an asset stored in Supabase Storage
 * If isDemo is true, uses the "demo" folder instead of the propertyId
 */
export function getAssetUrl({
  propertyId,
  isDemo,
  category,
  filename,
}: {
  propertyId: string
  isDemo?: boolean
  category: AssetCategory | string
  filename: string
}): string {
  const folder = isDemo ? 'demo' : propertyId
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-assets/${folder}/${category}/${filename}`
}

/**
 * Gets the public URL for a property's asset
 * This is a convenience wrapper around getAssetUrl that takes an asset object
 */
export function getPropertyAssetUrl(propertyId: string, isDemo: boolean, asset: { category: string; filename: string }): string {
  return getAssetUrl({
    propertyId,
    isDemo,
    category: asset.category,
    filename: asset.filename
  })
} 