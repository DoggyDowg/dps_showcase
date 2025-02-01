import { createClient } from '@supabase/supabase-js'
import { Asset, AssetCategory } from '@/types/assets'

const DEMO_BUCKET = 'demo-assets'

// Asset categories and their required demo assets
const REQUIRED_DEMO_ASSETS: Record<AssetCategory, { count: number; required: boolean }> = {
  hero_video: { count: 1, required: true },
  gallery: { count: 6, required: true },
  your_home: { count: 3, required: true },
  neighbourhood: { count: 3, required: true },
  footer: { count: 1, required: false },
  floorplan: { count: 1, required: true },
  features_banner: { count: 1, required: true },
  lifestyle_banner: { count: 1, required: true },
  neighbourhood_banner: { count: 1, required: true },
  property_logo: { count: 1, required: false }
}

export class DemoAssetManager {
  private supabase
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Get demo assets for a specific category
   */
  async getDemoAssets(category: AssetCategory): Promise<Asset[]> {
    const { data, error } = await this.supabase.storage
      .from(DEMO_BUCKET)
      .list(category)

    if (error) {
      console.error('Error fetching demo assets:', error)
      return []
    }

    return data.map((file, index) => ({
      id: `demo-${category}-${index}`,
      property_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category,
      type: this.getAssetType(file.name),
      filename: file.name,
      storage_path: `${category}/${file.name}`,
      title: this.generateTitle(category, index + 1),
      alt_text: this.generateTitle(category, index + 1),
      status: 'active',
      display_order: index
    }))
  }

  /**
   * Check if all required demo assets are available
   */
  async validateDemoAssets(): Promise<{
    valid: boolean
    missing: { category: AssetCategory; count: number }[]
  }> {
    const missing: { category: AssetCategory; count: number }[] = []

    for (const [category, requirements] of Object.entries(REQUIRED_DEMO_ASSETS)) {
      const assets = await this.getDemoAssets(category as AssetCategory)
      if (requirements.required && assets.length < requirements.count) {
        missing.push({
          category: category as AssetCategory,
          count: requirements.count - assets.length
        })
      }
    }

    return {
      valid: missing.length === 0,
      missing
    }
  }

  private getAssetType(filename: string): 'image' | 'video' {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext === 'mp4' || ext === 'webm' ? 'video' : 'image'
  }

  private generateTitle(category: AssetCategory, index: number): string {
    const categoryName = category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    return `${categoryName} ${index}`
  }

  /**
   * Upload a demo asset
   */
  async uploadDemoAsset(
    category: AssetCategory,
    file: File
  ): Promise<boolean> {
    const path = `${category}/${file.name}`
    const { error } = await this.supabase.storage
      .from(DEMO_BUCKET)
      .upload(path, file)

    if (error) {
      console.error('Error uploading demo asset:', error)
      return false
    }

    return true
  }
}

// Export singleton instance
export const demoAssetManager = new DemoAssetManager() 