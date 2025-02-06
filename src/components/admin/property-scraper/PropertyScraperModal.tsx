'use client'

import { useState } from 'react'
import { MediaGrid } from '../media-scraper/MediaGrid'
import { scrapeMediaFromUrl } from '../media-scraper/utils/mediaScraper'
import { toast } from 'react-hot-toast'

// Define valid categories that match the database enum
export type MediaCategory = 
  | 'gallery'
  | 'features_banner'
  | 'lifestyle_banner'
  | 'neighbourhood_banner'
  | 'hero_video'
  | 'your_home'
  | 'floorplan'
  | 'footer';

export const MEDIA_CATEGORIES: Record<MediaCategory, { min: number; max: number; label: string }> = {
  gallery: { min: 10, max: 30, label: 'Gallery' },
  features_banner: { min: 1, max: 1, label: 'Features Banner' },
  lifestyle_banner: { min: 1, max: 1, label: 'Lifestyle Banner' },
  neighbourhood_banner: { min: 1, max: 1, label: 'Neighbourhood Banner' },
  hero_video: { min: 0, max: 1, label: 'Hero Video' },
  your_home: { min: 0, max: 1, label: 'Your Home' },
  floorplan: { min: 0, max: 4, label: 'Floor Plan' },
  footer: { min: 0, max: 1, label: 'Footer' }
};

interface PropertyAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  category: MediaCategory | 'uncategorized';
  storage_path?: string;
}

interface CategorizedAsset {
  id: string;
  category: MediaCategory;
  name: string;
  storage_path: string;
  file: File;
}

interface ScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: { content: Record<string, unknown> | null; assets: CategorizedAsset[] }) => void;
}

export function PropertyScraperModal({ isOpen, onClose, onSelect }: ScraperModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content')
  const [url, setUrl] = useState('')
  const [listingText, setListingText] = useState('')
  const [assets, setAssets] = useState<PropertyAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scrapedContent, setScrapedContent] = useState<Record<string, unknown> | null>(null)
  const [activeTag, setActiveTag] = useState<MediaCategory | null>(null)
  const [completedTags, setCompletedTags] = useState<Set<MediaCategory>>(new Set())
  const [selections, setSelections] = useState<Map<MediaCategory, Set<string>>>(new Map())

  const handleContentScrape = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const payload = {
        listing_url: url.trim() || null,
        listing_text: listingText.trim() || null,
        user: 'property-scraper'
      }

      console.log('Sending scrape request with payload:', payload)

      const response = await fetch('/api/scrape-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to scrape property content')
      }

      // Parse the content from the response
      let parsedContent: Record<string, unknown>;
      
      try {
        // Clean and parse the response text directly
        const cleanText = responseData.text
          .replace(/^`|`$/g, '') // Remove backticks
          .replace(/\\n/g, '') // Remove newlines
          .replace(/\s+/g, ' ') // Clean up spaces
          .trim();
        
        parsedContent = JSON.parse(cleanText);
        
        // Log the parsed content
        console.log('Successfully parsed content:', parsedContent);
        
      } catch (error) {
        console.error('Content parsing failed:', error);
        throw new Error(`Failed to parse content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Validate the parsed content has the required structure
      if (!parsedContent || typeof parsedContent !== 'object') {
        throw new Error('Invalid content format: Not an object')
      }

      // Additional validation for required fields
      const requiredFields = ['hero', 'features', 'lifestyle', 'neighbourhood', 'seo', 'og']
      const missingFields = requiredFields.filter(field => !(field in parsedContent))
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Store the parsed object in state
      setScrapedContent(parsedContent)
      console.log('Stored content:', parsedContent)

      toast.success('Content scraped successfully')
    } catch (error) {
      console.error('Scraping error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to scrape content'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaScrape = async () => {
    setLoading(true)
    setError(null)
    setAssets([])
    
    try {
      // Scrape media assets
      const mediaAssets = await scrapeMediaFromUrl(url)
      setAssets(mediaAssets.map(asset => ({
        ...asset,
        category: 'uncategorized'
      })))
      toast.success('Media scraped successfully')
    } catch (error) {
      console.error('Error scraping media:', error)
      setError(error instanceof Error ? error.message : 'Failed to scrape media')
      toast.error('Failed to scrape media')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyContent = () => {
    if (!scrapedContent) {
      toast.error('No content to apply')
      return
    }

    try {
      console.log('Applying content...')
      console.log('Content:', {
        type: typeof scrapedContent,
        fields: Object.keys(scrapedContent),
        content: scrapedContent
      })

      // Validate content structure before applying
      const requiredFields = ['hero', 'features', 'lifestyle', 'neighbourhood', 'seo', 'og']
      const missingFields = requiredFields.filter(field => !(field in scrapedContent))
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      onSelect({
        content: scrapedContent,
        assets: []  // Always send empty array for content-only updates
      })
      
      toast.success('Content applied successfully')
      setActiveTab('media')
    } catch (error) {
      console.error('Error applying content:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to apply content')
    }
  }

  const handleTagClick = (category: MediaCategory) => {
    setActiveTag(activeTag === category ? null : category)
  }

  const handleAssetSelect = (assetId: string) => {
    if (!activeTag) return

    setSelections(prev => {
      const newSelections = new Map(prev)
      const categorySelections = new Set(prev.get(activeTag) || [])
      const { min: minRequired, max } = MEDIA_CATEGORIES[activeTag]

      if (categorySelections.has(assetId)) {
        categorySelections.delete(assetId)
        // If removing this asset puts us below the minimum, remove from completed tags
        if (categorySelections.size < minRequired) {
          setCompletedTags(prev => {
            const newCompleted = new Set(prev)
            newCompleted.delete(activeTag)
            return newCompleted
          })
        }
      } else if (categorySelections.size < max) {
        categorySelections.add(assetId)
      }

      newSelections.set(activeTag, categorySelections)
      return newSelections
    })
  }

  const handleSaveTagSelections = () => {
    if (!activeTag) return

    const categorySelections = selections.get(activeTag)
    const { min: minRequired } = MEDIA_CATEGORIES[activeTag]

    console.log('Saving tag selections:', {
      tag: activeTag,
      selections: categorySelections ? Array.from(categorySelections) : [],
      minRequired,
      max: MEDIA_CATEGORIES[activeTag].max
    })

    if (categorySelections && categorySelections.size >= minRequired) {
      setCompletedTags(prev => {
        const newCompleted = new Set([...prev, activeTag])
        console.log('Updated completed tags:', Array.from(newCompleted))
        return newCompleted
      })
      setActiveTag(null)
    }
  }

  const handleSaveMedia = async () => {
    console.group('🚨 Media Save Process')
    console.log('Starting media save with state:', {
      completedTags: Array.from(completedTags),
      selections: Object.fromEntries(
        Array.from(selections.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      totalAssets: assets.length
    })

    const categorizedAssets: CategorizedAsset[] = []
    
    // Helper function to fetch and convert URL to File
    const urlToFile = async (url: string, filename: string, retries = 3): Promise<File> => {
      console.log('Fetching file:', { url, filename, retriesLeft: retries })
      
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      
      try {
        const response = await fetch('/api/proxy-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          console.error('Failed to fetch image:', {
            status: response.status,
            statusText: response.statusText,
            url
          })
          
          // If we have retries left and it's a retryable error, try again
          if (retries > 0 && response.status !== 404) {
            console.log(`Retrying... ${retries} attempts left`)
            await delay(1000) // Wait 1 second before retrying
            return urlToFile(url, filename, retries - 1)
          }
          
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        const blob = await response.blob()
        
        if (blob.size === 0) {
          throw new Error('Received empty file')
        }
        
        console.log('File fetched successfully:', {
          type: blob.type,
          size: blob.size
        })
        
        return new File([blob], filename, { type: blob.type })
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying due to error... ${retries} attempts left`)
          await delay(1000) // Wait 1 second before retrying
          return urlToFile(url, filename, retries - 1)
        }
        console.error('Error fetching file:', error)
        throw error
      }
    }
    
    try {
      // Process each selected asset
      for (const [category, selectedIds] of selections.entries()) {
        console.group(`Processing category ${category}`)
        console.log('Selected IDs:', Array.from(selectedIds))

        for (const id of selectedIds) {
          console.group(`Processing asset ID: ${id}`)
          const asset = assets.find(a => a.id === id)
          
          if (!asset) {
            console.error('Asset not found:', id)
            console.groupEnd()
            continue
          }

          try {
            // Generate a clean filename with timestamp to avoid conflicts
            const timestamp = Date.now()
            const extension = asset.url.split('.').pop()?.toLowerCase() || 'jpg'
            const cleanName = asset.url.split('/').pop()?.toLowerCase()
              .replace(/[^a-z0-9.]/g, '_')
              .replace(/_+/g, '_')
              .replace(/\.[^/.]+$/, '') || id
            
            const filename = `${cleanName}_${timestamp}.${extension}`

            console.log('Generated filename:', filename)

            // Fetch and convert the URL to a File object
            const file = await urlToFile(asset.url, filename)

            const categorizedAsset: CategorizedAsset = {
              id: asset.id,
              category: category,
              name: filename,
              storage_path: `properties/${category}/${filename}`,
              file
            }

            console.log('Created categorized asset:', {
              id: categorizedAsset.id,
              category: categorizedAsset.category,
              name: categorizedAsset.name,
              path: categorizedAsset.storage_path,
              fileSize: categorizedAsset.file.size
            })

            categorizedAssets.push(categorizedAsset)
          } catch (error) {
            console.error(`Failed to process asset ${id}:`, error)
            toast.error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`)
          } finally {
            console.groupEnd() // End asset processing group
          }
        }
        console.groupEnd() // End category processing group
      }

      if (categorizedAssets.length === 0) {
        throw new Error('No assets were successfully processed')
      }

      const payload = {
        content: null,
        assets: categorizedAssets
      }

      console.log('Sending payload to parent:', {
        assetCount: payload.assets.length,
        categories: payload.assets.map(a => a.category)
      })

      onSelect(payload)
      onClose()
      toast.success('Media applied successfully')
    } catch (error) {
      console.error('Error preparing media assets:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to prepare media assets')
    } finally {
      console.groupEnd() // End media save process group
    }
  }

  const isTagComplete = (category: MediaCategory) => {
    const categorySelections = selections.get(category)
    const { min: minRequired } = MEDIA_CATEGORIES[category]
    const complete = categorySelections && categorySelections.size >= minRequired
    
    if (complete) {
      console.log(`Category ${category} is complete:`, {
        selected: categorySelections?.size,
        required: minRequired,
        maximum: MEDIA_CATEGORIES[category].max
      })
    }
    
    return complete
  }

  const canSaveAll = Object.keys(MEDIA_CATEGORIES).every(category => {
    const categoryKey = category as MediaCategory
    const { min: minRequired } = MEDIA_CATEGORIES[categoryKey]
    const isComplete = !minRequired || isTagComplete(categoryKey)
    
    console.log(`Checking category ${category}:`, {
      required: minRequired,
      isComplete,
      selections: selections.get(categoryKey)?.size || 0
    })
    
    return isComplete
  })

  // Add helper function to determine if we can fetch content
  const canFetchContent = url.trim() !== '' || listingText.trim() !== ''

  // Add helper function to get the fetch button text
  const getFetchButtonText = () => {
    if (loading) return 'Fetching...'
    if (url.trim() !== '' && listingText.trim() !== '') return 'Fetch Content (URL + Text)'
    if (url.trim() !== '') return 'Fetch Content (URL)'
    return 'Fetch Content (Text)'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        <div className="relative w-full max-w-6xl rounded-lg bg-white p-8 shadow-xl">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Property Scraper</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="p-4 border-b">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter property listing URL"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="border-b">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`
                      px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                      ${activeTab === 'content'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Step 1: Content
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`
                      px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                      ${activeTab === 'media'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Step 2: Media
                  </button>
                </nav>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 whitespace-pre-line">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === 'content' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Listing Text (optional)
                        </label>
                        <textarea
                          value={listingText}
                          onChange={(e) => setListingText(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 h-24"
                          placeholder="Paste any additional listing text here..."
                        />
                      </div>

                      {scrapedContent && (
                        <div>
                          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                            {JSON.stringify(scrapedContent, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(MEDIA_CATEGORIES).map(([category, { label, max }]) => (
                          <button
                            key={category}
                            onClick={() => handleTagClick(category as MediaCategory)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium
                              ${activeTag === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                              ${completedTags.has(category as MediaCategory) ? 'ring-2 ring-green-500' : ''}
                            `}
                          >
                            {label}
                            {' '}{selections.get(category as MediaCategory)?.size || 0}/{max}
                            {completedTags.has(category as MediaCategory) && (
                              <span className="ml-2 text-green-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {activeTag && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Select {MEDIA_CATEGORIES[activeTag].min}-{MEDIA_CATEGORIES[activeTag].max} {MEDIA_CATEGORIES[activeTag].label} images
                          </p>
                          <button
                            onClick={handleSaveTagSelections}
                            disabled={!isTagComplete(activeTag)}
                            className={`
                              px-4 py-2 rounded-md text-sm font-medium
                              ${isTagComplete(activeTag) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400'}
                            `}
                          >
                            Save {MEDIA_CATEGORIES[activeTag].label} Selections
                          </button>
                        </div>
                      )}

                      <MediaGrid
                        assets={assets.map(asset => {
                          // Map property scraper categories to media grid categories
                          let mappedCategory: 'floorplan' | 'footer' | 'gallery' | 'hero_video' | 'uncategorized' | undefined = 'uncategorized';
                          
                          if (asset.category === 'floorplan' || 
                              asset.category === 'footer' || 
                              asset.category === 'gallery' || 
                              asset.category === 'hero_video') {
                            mappedCategory = asset.category;
                          } else if (asset.category === 'uncategorized') {
                            mappedCategory = undefined;
                          }
                          
                          return {
                            id: asset.id,
                            url: asset.url,
                            type: asset.type,
                            selected: activeTag ? selections.get(activeTag)?.has(asset.id) || false : false,
                            category: mappedCategory
                          };
                        })}
                        onAssetSelect={handleAssetSelect}
                      />

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleSaveMedia}
                          disabled={!canSaveAll}
                          className={`
                            px-6 py-3 rounded-md text-sm font-medium
                            ${canSaveAll ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}
                          `}
                        >
                          Save All Media
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex justify-between">
            <div className="space-x-4">
              {activeTab === 'content' ? (
                <>
                  <button
                    onClick={handleContentScrape}
                    disabled={loading || !canFetchContent}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {getFetchButtonText()}
                  </button>
                  {scrapedContent && (
                    <button
                      onClick={handleApplyContent}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Content
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleMediaScrape}
                    disabled={loading || !url}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Fetching...' : 'Fetch Media'}
                  </button>
                  {assets.filter(a => a.category !== 'uncategorized').length > 0 && (
                    <button
                      onClick={handleSaveMedia}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Media
                    </button>
                  )}
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 