import { useState } from 'react'
import { AgentAsset, AgentAssets } from '@/types/agent'
import { scrapeAgentFromUrl } from '../media-scraper/utils/agentScraper'
import { toast } from 'sonner'

interface AgentScraperModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (assets: {
    avatar?: AgentAsset,
    agentDetails?: {
      name?: string
      email?: string
      phone?: string
      position?: string
    }
  }) => void
  onStoreAvatar: (file: File) => Promise<void>
}

interface ImageSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  image: AgentAsset
  onSelect: () => Promise<void>
}

function ImageSelectionModal({ isOpen, onClose, image, onSelect }: ImageSelectionModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSelect = async () => {
    try {
      setLoading(true)
      await onSelect()
      toast.success('Stored as agent avatar')
      onClose()
    } catch (error) {
      toast.error('Failed to store avatar')
      console.error('Error storing avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Store Image As Avatar</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <img
            src={image.url}
            alt={image.name || 'Agent avatar'}
            className="h-48 w-48 object-cover mx-auto rounded-full"
          />
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleSelect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Storing...' : 'Use as Avatar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AgentScraperModal({ isOpen, onClose, onSelect, onStoreAvatar }: AgentScraperModalProps) {
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assets, setAssets] = useState<AgentAssets | null>(null)
  const [selectedImage, setSelectedImage] = useState<AgentAsset | null>(null)
  const [storedAvatar, setStoredAvatar] = useState<AgentAsset | null>(null)
  const [editableAgentDetails, setEditableAgentDetails] = useState<{
    name: string;
    email: string;
    phone: string;
    position: string;
  }>({
    name: '',
    email: '',
    phone: '',
    position: ''
  })

  const handleScrape = async () => {
    try {
      setLoading(true)
      setError(null)
      const scrapedAssets = await scrapeAgentFromUrl(url)
      setAssets(scrapedAssets)
      
      // Update editable agent details when new assets are scraped
      if (scrapedAssets?.agentDetails) {
        const { name = '', email = '', phone = '', position = '' } = scrapedAssets.agentDetails
        setEditableAgentDetails({
          name,
          email,
          phone,
          position
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape agent assets')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = async () => {
    if (!selectedImage?.url) return

    try {
      // Use a proxy endpoint to fetch the image
      const response = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: selectedImage.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const file = new File([blob], 'avatar.png', { type: 'image/png' })
      await onStoreAvatar(file)

      setStoredAvatar(selectedImage)
    } catch (error) {
      console.error('Error fetching avatar:', error)
      throw error
    }
  }

  const handleModalClose = () => {
    setUrl('')
    setAssets(null)
    setError(null)
    setSelectedImage(null)
    setStoredAvatar(null)
    setEditableAgentDetails({
      name: '',
      email: '',
      phone: '',
      position: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Import Agent Details</h2>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter agent profile URL"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              onClick={handleScrape}
              disabled={loading || !url}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {assets && (
          <div className="flex-1 overflow-auto p-4">
            {/* Images */}
            {assets.images.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Profile Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {assets.images.map((image) => {
                    const isStored = storedAvatar?.url === image.url
                    
                    return (
                      <div
                        key={image.url}
                        className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 ${
                          isStored ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.name || 'Profile image'}
                          className="h-48 w-48 object-cover mx-auto rounded-full"
                        />
                        <div className="mt-2 text-sm text-center">
                          {isStored ? (
                            <span className="text-green-600">Stored as Avatar</span>
                          ) : (
                            <span className="text-gray-500">Click to store</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Agent Details Section */}
            {assets?.agentDetails && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Agent Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editableAgentDetails.name || ''}
                      onChange={(e) => setEditableAgentDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editableAgentDetails.email || ''}
                      onChange={(e) => setEditableAgentDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={editableAgentDetails.phone || ''}
                      onChange={(e) => setEditableAgentDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={editableAgentDetails.position || ''}
                      onChange={(e) => setEditableAgentDetails(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={() => onSelect({ 
                      avatar: storedAvatar || undefined,
                      agentDetails: editableAgentDetails 
                    })}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Apply Agent Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={handleModalClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>

      <ImageSelectionModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage!}
        onSelect={handleImageSelect}
      />
    </div>
  )
} 