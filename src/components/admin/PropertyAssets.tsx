'use client';

import React, { useState, useEffect } from 'react';
import type { Asset, AssetCategory } from '@/types/assets';
import { demoAssetManager } from '@/utils/demoAssetManager';
import Image from 'next/image';

const DEMO_BUCKET = 'demo-assets';

interface PropertyAssetsProps {
  propertyId: string;
  is_demo?: boolean;
  template_name?: 'dubai' | 'cusco';
  onSave?: () => void;
}

// Asset category component
function AssetCategory({ 
  category, 
  assets, 
  onDelete, 
  onUpload, 
  isDemo 
}: { 
  category: AssetCategory
  assets: Asset[]
  onDelete: ((asset: Asset) => Promise<void>) | null
  onUpload: ((files: FileList, category: AssetCategory) => Promise<void>) | null
  isDemo: boolean
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {assets.map(asset => (
          <div key={asset.id} className="relative">
            {/* Asset preview */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {asset.type === 'video' ? (
                <video src={asset.storage_path} className="w-full h-full object-cover" />
              ) : (
                <Image 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${DEMO_BUCKET}/${asset.storage_path}`}
                  alt={asset.title || ''}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            
            {/* Delete button - only show if not demo and onDelete is provided */}
            {!isDemo && onDelete && (
              <button
                onClick={() => onDelete(asset)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Upload area - only show if not demo and onUpload is provided */}
      {!isDemo && onUpload && (
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={(e) => e.target.files && onUpload(e.target.files, category)}
            accept={category === 'hero_video' ? 'video/*' : 'image/*'}
            className="hidden"
            id={`upload-${category}`}
          />
          <label
            htmlFor={`upload-${category}`}
            className="cursor-pointer text-blue-500 hover:text-blue-600"
          >
            Click to upload or drag files here
          </label>
        </div>
      )}
    </div>
  )
}

// Handle asset deletion
async function handleDeleteAsset(asset: Asset): Promise<void> {
  const response = await fetch(`/api/assets/${asset.id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete asset')
  }
}

// Handle asset upload
async function handleUploadAsset(files: FileList, category: AssetCategory): Promise<void> {
  const formData = new FormData()
  formData.append('file', files[0])
  formData.append('category', category)
  
  const response = await fetch('/api/assets/upload', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload asset')
  }
}

// Helper function to group assets by category
function groupAssetsByCategory(assets: Asset[]): Record<AssetCategory, Asset[]> {
  return assets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = []
    }
    acc[asset.category].push(asset)
    return acc
  }, {} as Record<AssetCategory, Asset[]>)
}

export function PropertyAssets({ propertyId, is_demo, template_name, onSave }: PropertyAssetsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState<Record<AssetCategory, Asset[]>>({
    hero_video: [],
    gallery: [],
    your_home: [],
    neighbourhood: [],
    footer: [],
    floorplan: [],
    features_banner: [],
    lifestyle_banner: [],
    neighbourhood_banner: [],
    property_logo: []
  })

  // Define categories outside of the effect to avoid dependency on assets
  const assetCategories: AssetCategory[] = [
    'hero_video',
    'gallery',
    'your_home',
    'neighbourhood',
    'footer',
    'floorplan',
    'features_banner',
    'lifestyle_banner',
    'neighbourhood_banner',
    'property_logo'
  ]

  // Load assets
  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true)
        setError('')

        if (is_demo && template_name) {
          // Load demo assets for each category
          const demoAssets: Record<AssetCategory, Asset[]> = {} as Record<AssetCategory, Asset[]>
          
          for (const category of assetCategories) {
            demoAssets[category] = await demoAssetManager.getDemoAssets(template_name, category)
          }
          
          setAssets(demoAssets)
        } else {
          // Load real property assets from your existing API
          const response = await fetch(`/api/properties/${propertyId}/assets`)
          if (!response.ok) throw new Error('Failed to load assets')
          
          const data = await response.json()
          setAssets(groupAssetsByCategory(data))
        }
      } catch (err) {
        console.error('Error loading assets:', err)
        setError(err instanceof Error ? err.message : 'Failed to load assets')
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [propertyId, is_demo, template_name]) // Now we don't need assets in the dependency array

  // Update the handleDeleteAsset and handleUploadAsset to call onSave
  const handleAssetDelete = async (asset: Asset): Promise<void> => {
    await handleDeleteAsset(asset)
    onSave?.()
  }

  const handleAssetUpload = async (files: FileList, category: AssetCategory): Promise<void> => {
    await handleUploadAsset(files, category)
    onSave?.()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading assets...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error: {error}</p>
      </div>
    )
  }

  // Show demo mode warning
  if (is_demo) {
    return (
      <div>
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="font-medium">Demo Mode Active</p>
          <p>This property is using standardized demo assets. Asset uploads are disabled.</p>
        </div>
        {Object.entries(assets).map(([category, categoryAssets]) => (
          <AssetCategory
            key={category}
            category={category as AssetCategory}
            assets={categoryAssets}
            onDelete={null}  // Disable delete in demo mode
            onUpload={null}  // Disable upload in demo mode
            isDemo={true}
          />
        ))}
      </div>
    )
  }

  // Show regular asset management UI
  return (
    <div>
      {Object.entries(assets).map(([category, categoryAssets]) => (
        <AssetCategory
          key={category}
          category={category as AssetCategory}
          assets={categoryAssets}
          onDelete={handleAssetDelete}
          onUpload={handleAssetUpload}
          isDemo={false}
        />
      ))}
    </div>
  )
}