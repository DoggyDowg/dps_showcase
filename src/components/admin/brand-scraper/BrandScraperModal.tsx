import { useState, useEffect } from 'react'
import { BrandAsset, BrandAssets } from '@/types/brand'
import { scrapeBrandFromUrl } from '../media-scraper/utils/brandScraper'
import { toast } from 'sonner'

interface BrandScraperModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (assets: {
    logos?: BrandAsset[],
    colors?: BrandAsset[],
    fonts?: BrandAsset[],
    agencyDetails?: {
      name?: string
      email?: string
      phone?: string
      website?: string
      copyrightText?: string
    }
  }) => void
  onStoreLogo: (file: File, variant: 'dark' | 'light') => Promise<void>
  onStoreFont: (url: string, category: 'heading' | 'body') => Promise<void>
}

interface LogoSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  logo: BrandAsset
  onSelect: (variant: 'dark' | 'light') => Promise<void>
}

interface FontPreviewProps {
  font: BrandAsset
  isHeading: boolean
  isBody: boolean
  onClick: () => void
}

function FontPreview({ font, isHeading, isBody, onClick }: FontPreviewProps) {
  const [fontFamily, setFontFamily] = useState('')
  const isStored = isHeading || isBody

  useEffect(() => {
    // For Google Fonts
    if (font.format === 'google') {
      const urlParams = new URLSearchParams(font.url.split('?')[1])
      const familyParam = urlParams.get('family')
      if (familyParam) {
        const fontFamily = familyParam.split(':')[0].replace(/\+/g, ' ')
        setFontFamily(fontFamily)
        
        const link = document.createElement('link')
        link.href = font.url
        link.rel = 'stylesheet'
        document.head.appendChild(link)
        return () => {
          document.head.removeChild(link)
        }
      }
      return
    }

    // For web fonts
    const loadWebFont = async () => {
      try {
        // Create a unique font family name based on the font name and a random string
        const uniqueFontFamily = `${font.name.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substring(2, 7)}`
        
        // Fetch the font file through our proxy
        const response = await fetch('/api/proxy-font', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: font.url }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch font')
        }

        // Convert the response to a blob and create an object URL
        const blob = await response.blob()
        const fontUrl = URL.createObjectURL(blob)

        // Determine the font format
        let format = 'woff2' // default
        if (font.url.endsWith('.woff2')) format = 'woff2'
        else if (font.url.endsWith('.woff')) format = 'woff'
        else if (font.url.endsWith('.ttf')) format = 'truetype'
        else if (font.url.endsWith('.otf')) format = 'opentype'
        else if (font.url.endsWith('.eot')) format = 'embedded-opentype'

        // Create and inject the @font-face rule
        const style = document.createElement('style')
        style.textContent = `
          @font-face {
            font-family: '${uniqueFontFamily}';
            src: url('${fontUrl}') format('${format}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `
        document.head.appendChild(style)
        setFontFamily(uniqueFontFamily)

        return () => {
          document.head.removeChild(style)
          URL.revokeObjectURL(fontUrl)
        }
      } catch (error) {
        console.error('Error loading web font:', error)
      }
    }

    const cleanup = loadWebFont()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [font.url, font.format, font.name])

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 ${
        isStored ? 'border-green-500 bg-green-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="font-medium">{font.name}</div>
      <div className="text-sm text-gray-500 mt-1">
        {font.format === 'google' ? 'Google Font' : 'Web Font'}
      </div>
      <div 
        style={{ 
          fontFamily: fontFamily ? `"${fontFamily}", system-ui, sans-serif` : 'system-ui, sans-serif',
          opacity: fontFamily ? 1 : 0.5
        }}
        className="mt-3 text-lg leading-relaxed"
      >
        The quick brown fox
        <div className="text-base mt-1">
          ABCDEFGHIJKLM
          <br />
          abcdefghijklm
        </div>
      </div>
      <div className="mt-2 text-sm text-center">
        {isHeading && <span className="text-green-600">Stored as Heading Font</span>}
        {isBody && <span className="text-green-600">Stored as Body Font</span>}
        {!isStored && <span className="text-gray-500">Click to store</span>}
      </div>
    </div>
  )
}

function LogoSelectionModal({ isOpen, onClose, logo, onSelect }: LogoSelectionModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSelect = async (variant: 'dark' | 'light') => {
    try {
      setLoading(true)
      await onSelect(variant)
      toast.success(`Stored as ${variant} logo`)
      onClose()
    } catch (error) {
      toast.error('Failed to store logo')
      console.error('Error storing logo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not its children
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
          <h3 className="text-lg font-medium">Store Logo As</h3>
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
            src={logo.url}
            alt={logo.name || 'Logo'}
            className="h-24 w-auto mx-auto"
          />
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleSelect('dark')}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Dark Logo
          </button>
          <button
            onClick={() => handleSelect('light')}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Light Logo
          </button>
        </div>
      </div>
    </div>
  )
}

export function BrandScraperModal({ isOpen, onClose, onSelect, onStoreLogo, onStoreFont }: BrandScraperModalProps) {
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assets, setAssets] = useState<BrandAssets | null>(null)
  const [selectedLogo, setSelectedLogo] = useState<BrandAsset | null>(null)
  const [storedLogos, setStoredLogos] = useState<{
    dark?: BrandAsset;
    light?: BrandAsset;
  }>({})
  const [selectedFont, setSelectedFont] = useState<BrandAsset | null>(null)
  const [storedFonts, setStoredFonts] = useState<{
    heading?: BrandAsset;
    body?: BrandAsset;
  }>({})
  const [editableAgencyDetails, setEditableAgencyDetails] = useState<{
    name: string;
    email: string;
    phone: string;
    website: string;
    copyrightText: string;
  }>({
    name: '',
    email: '',
    phone: '',
    website: '',
    copyrightText: ''
  })

  const handleScrape = async () => {
    try {
      setLoading(true)
      setError(null)
      const scrapedAssets = await scrapeBrandFromUrl(url)
      setAssets(scrapedAssets)
      
      // Update editable agency details when new assets are scraped
      if (scrapedAssets?.agencyDetails) {
        const { name = '', email = '', phone = '', website = '', copyrightText = '' } = scrapedAssets.agencyDetails
        setEditableAgencyDetails({
          name,
          email,
          phone,
          website,
          copyrightText
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape brand assets')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoSelect = async (variant: 'dark' | 'light') => {
    if (!selectedLogo?.url) return

    try {
      // Use a proxy endpoint to fetch the image
      const response = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: selectedLogo.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const file = new File([blob], 'logo.png', { type: 'image/png' })
      await onStoreLogo(file, variant)

      setStoredLogos(prev => ({
        ...prev,
        [variant]: selectedLogo
      }))
    } catch (error) {
      console.error('Error fetching logo:', error)
      throw error
    }
  }

  const handleFontSelect = async (category: 'heading' | 'body') => {
    if (!selectedFont?.url) return

    try {
      setLoading(true)
      await onStoreFont(selectedFont.url, category)
      setStoredFonts(prev => ({
        ...prev,
        [category]: selectedFont
      }))
      setSelectedFont(null)
      toast.success(`Stored as ${category} font`)
    } catch (error) {
      console.error('Error storing font:', error)
      toast.error('Failed to store font')
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setUrl('')
    setAssets(null)
    setError(null)
    setSelectedLogo(null)
    setStoredLogos({})
    setSelectedFont(null)
    setStoredFonts({})
    setEditableAgencyDetails({
      name: '',
      email: '',
      phone: '',
      website: '',
      copyrightText: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Import Brand Assets</h2>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
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
            {/* Logos */}
            {assets.logos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Logos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {assets.logos.map((logo) => {
                    const isDark = storedLogos.dark?.url === logo.url
                    const isLight = storedLogos.light?.url === logo.url
                    const isStored = isDark || isLight
                    
                    return (
                      <div
                        key={logo.url}
                        className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 ${
                          isStored ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => setSelectedLogo(logo)}
                      >
                        <img
                          src={logo.url}
                          alt={logo.name || 'Logo'}
                          className="h-12 w-auto mx-auto"
                        />
                        <div className="mt-2 text-sm text-center">
                          {isDark && <span className="text-green-600">Stored as Dark Logo</span>}
                          {isLight && <span className="text-green-600">Stored as Light Logo</span>}
                          {!isStored && <span className="text-gray-500">Click to store</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fonts */}
            {assets.fonts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Fonts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.fonts.map((font) => (
                    <FontPreview
                      key={font.url}
                      font={font}
                      isHeading={storedFonts.heading?.url === font.url}
                      isBody={storedFonts.body?.url === font.url}
                      onClick={() => setSelectedFont(font)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Agency Details Section */}
            {assets?.agencyDetails && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Agency Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editableAgencyDetails.name || ''}
                      onChange={(e) => setEditableAgencyDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editableAgencyDetails.email || ''}
                      onChange={(e) => setEditableAgencyDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={editableAgencyDetails.phone || ''}
                      onChange={(e) => setEditableAgencyDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={editableAgencyDetails.website || ''}
                      onChange={(e) => setEditableAgencyDetails(prev => ({ ...prev, website: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Copyright Text</label>
                    <input
                      type="text"
                      value={editableAgencyDetails.copyrightText || ''}
                      onChange={(e) => setEditableAgencyDetails(prev => ({ ...prev, copyrightText: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={() => onSelect({ agencyDetails: editableAgencyDetails })}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Apply Agency Details
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

      <LogoSelectionModal
        isOpen={!!selectedLogo}
        onClose={() => setSelectedLogo(null)}
        logo={selectedLogo!}
        onSelect={handleLogoSelect}
      />

      {/* Font Selection Modal */}
      {selectedFont && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Store Font As</h3>
              <button
                onClick={() => setSelectedFont(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleFontSelect('heading')}
                disabled={loading || storedFonts.heading?.url === selectedFont.url}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Storing...' : 'Heading Font'}
              </button>
              <button
                onClick={() => handleFontSelect('body')}
                disabled={loading || storedFonts.body?.url === selectedFont.url}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Storing...' : 'Body Font'}
              </button>
              <button
                onClick={() => setSelectedFont(null)}
                disabled={loading}
                className="w-full p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 