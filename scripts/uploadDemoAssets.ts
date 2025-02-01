import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { AssetCategory } from '@/types/assets'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
)

const DEMO_BUCKET = 'demo-assets'

// Define the required demo assets for each category
const DEMO_ASSETS_CONFIG = {
  hero_video: [{ filename: 'hero.mp4', type: 'video/mp4' }],
  gallery: [
    { filename: 'living-room.jpg', type: 'image/jpeg' },
    { filename: 'kitchen.jpg', type: 'image/jpeg' },
    { filename: 'master-bedroom.jpg', type: 'image/jpeg' },
    { filename: 'bathroom.jpg', type: 'image/jpeg' },
    { filename: 'pool.jpg', type: 'image/jpeg' },
    { filename: 'exterior.jpg', type: 'image/jpeg' }
  ],
  your_home: [
    { filename: 'entrance.jpg', type: 'image/jpeg' },
    { filename: 'lounge.jpg', type: 'image/jpeg' },
    { filename: 'view.jpg', type: 'image/jpeg' }
  ],
  neighbourhood: [
    { filename: 'area-1.jpg', type: 'image/jpeg' },
    { filename: 'area-2.jpg', type: 'image/jpeg' },
    { filename: 'area-3.jpg', type: 'image/jpeg' }
  ],
  footer: [{ filename: 'footer.jpg', type: 'image/jpeg' }],
  floorplan: [{ filename: 'floorplan.jpg', type: 'image/jpeg' }],
  features_banner: [{ filename: 'features.jpg', type: 'image/jpeg' }],
  lifestyle_banner: [{ filename: 'lifestyle.jpg', type: 'image/jpeg' }],
  neighbourhood_banner: [{ filename: 'neighbourhood.jpg', type: 'image/jpeg' }],
  property_logo: [{ filename: 'logo.png', type: 'image/png' }]
}

async function uploadDemoAssets() {
  try {
    // Create the demo-assets bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket(DEMO_BUCKET, {
      public: true,
      fileSizeLimit: 52428800 // 50MB limit
    })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError
    }

    // Upload assets for each category
    for (const [category, assets] of Object.entries(DEMO_ASSETS_CONFIG)) {
      for (const asset of assets) {
        const filePath = join(process.cwd(), 'demo-assets', category, asset.filename)
        const fileContent = readFileSync(filePath)
        const storagePath = `${category}/${asset.filename}`

        console.log(`Uploading ${storagePath}...`)

        const { error: uploadError } = await supabase.storage
          .from(DEMO_BUCKET)
          .upload(storagePath, fileContent, {
            contentType: asset.type,
            upsert: true
          })

        if (uploadError) {
          console.error(`Error uploading ${storagePath}:`, uploadError)
          continue
        }

        console.log(`Successfully uploaded ${storagePath}`)
      }
    }

    console.log('Demo assets upload completed!')
  } catch (error) {
    console.error('Error uploading demo assets:', error)
    process.exit(1)
  }
}

uploadDemoAssets() 