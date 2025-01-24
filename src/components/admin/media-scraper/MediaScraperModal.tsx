'use client'

import { useState } from 'react'
import { UrlInput } from './UrlInput'
import { MediaGrid } from './MediaGrid'
import { DownloadProgress } from './DownloadProgress'
import { scrapeMediaFromUrl } from './utils/mediaScraper'
import { downloadAssets } from './utils/downloadManager'

export interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'video'
  category?: 'floorplan' | 'footer' | 'gallery' | 'hero_video' | 'uncategorized'
  selected: boolean
}

type MediaTab = 'all' | 'images' | 'videos' | 'floorplans' | 'footer'

export default function MediaScraperModal() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<MediaTab>('all')

  const handleUrlSubmit = async (url: string) => {
    setLoading(true)
    setError(null)
    setAssets([])
    
    try {
      const scrapedAssets = await scrapeMediaFromUrl(url)
      setAssets(scrapedAssets)
    } catch (error) {
      console.error('Error processing URL:', error)
      setError('Failed to process URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssetSelect = (id: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, selected: !asset.selected } : asset
    ))
  }

  const handleDownloadSelected = async () => {
    const selectedAssets = assets.filter(asset => asset.selected)
    if (selectedAssets.length === 0) {
      setError('Please select at least one asset to download')
      return
    }

    setError(null)
    try {
      await downloadAssets(selectedAssets, (progress) => {
        setDownloadProgress(progress)
      })
    } catch (error) {
      console.error('Error downloading assets:', error)
      setError('Failed to download selected assets.')
    } finally {
      setDownloadProgress(null)
    }
  }

  const filteredAssets = assets.filter(asset => {
    switch (activeTab) {
      case 'images':
        return asset.type === 'image' && !['floorplan', 'footer'].includes(asset.category || '')
      case 'videos':
        return asset.type === 'video'
      case 'floorplans':
        return asset.category === 'floorplan'
      case 'footer':
        return asset.category === 'footer'
      default:
        return true
    }
  })

  const counts = {
    images: assets.filter(a => a.type === 'image' && !['floorplan', 'footer'].includes(a.category || '')).length,
    videos: assets.filter(a => a.type === 'video').length,
    floorplans: assets.filter(a => a.category === 'floorplan').length,
    footer: assets.filter(a => a.category === 'footer').length
  }

  const selectedCount = assets.filter(a => a.selected).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Media Scraper</h2>
          <UrlInput onSubmit={handleUrlSubmit} disabled={loading} />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {error && (
            <div className="p-4 bg-red-50 text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : assets.length > 0 ? (
            <>
              <div className="border-b">
                <div className="flex space-x-4 p-4">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    All ({assets.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('images')}
                    className={`px-4 py-2 rounded ${activeTab === 'images' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    Images ({counts.images})
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 rounded ${activeTab === 'videos' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    Videos ({counts.videos})
                  </button>
                  <button
                    onClick={() => setActiveTab('floorplans')}
                    className={`px-4 py-2 rounded ${activeTab === 'floorplans' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    Floorplans ({counts.floorplans})
                  </button>
                  <button
                    onClick={() => setActiveTab('footer')}
                    className={`px-4 py-2 rounded ${activeTab === 'footer' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    Footer ({counts.footer})
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <MediaGrid 
                  assets={filteredAssets}
                  onAssetSelect={handleAssetSelect}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="p-4 border-t">
          {downloadProgress !== null && (
            <div className="mb-4">
              <DownloadProgress progress={downloadProgress} />
            </div>
          )}
          {assets.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </div>
              <button
                onClick={handleDownloadSelected}
                disabled={selectedCount === 0 || downloadProgress !== null}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors
                  ${selectedCount === 0 ? 
                    'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'}
                `}
              >
                Download Selected
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}