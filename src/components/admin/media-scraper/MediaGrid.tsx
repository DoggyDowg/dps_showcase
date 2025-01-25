'use client'

import { useState } from 'react'
import Image from 'next/image'

interface MediaGridAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  selected: boolean;
  category?: 'floorplan' | 'footer' | 'gallery' | 'hero_video' | 'uncategorized';
}

interface MediaGridProps {
  assets: MediaGridAsset[];
  onAssetSelect: (assetId: string) => void;
}

export function MediaGrid({ assets, onAssetSelect }: MediaGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  if (assets.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No media assets found. Try fetching media first.
      </div>
    )
  }

  const handleImageError = (assetId: string) => {
    setFailedImages(prev => new Set([...prev, assetId]))
  }

  const handleAssetClick = (asset: MediaGridAsset) => {
    if (asset.type === 'video' && (asset.url.includes('youtube.com') || asset.url.includes('vimeo.com'))) {
      // For videos, show preview in a modal or new tab
      window.open(asset.url, '_blank')
    }
    onAssetSelect(asset.id)
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          onClick={() => handleAssetClick(asset)}
          className={`
            relative group cursor-pointer border rounded-lg overflow-hidden
            transition-all duration-200 transform hover:scale-105
            ${asset.selected ? 'ring-4 ring-blue-500 border-blue-500' : 'hover:ring-2 hover:ring-blue-200'}
            ${failedImages.has(asset.id) ? 'bg-gray-100' : ''}
          `}
        >
          {/* Media Preview */}
          {asset.type === 'video' ? (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 text-center">
                  Click to preview video
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100">
              {failedImages.has(asset.id) ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={asset.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => handleImageError(asset.id)}
                />
              )}
            </div>
          )}

          {/* Selection Indicator */}
          {asset.selected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* Category Badge */}
          {asset.category && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              {asset.category}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}