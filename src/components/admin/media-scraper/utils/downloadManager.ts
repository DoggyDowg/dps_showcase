import { MediaAsset } from '../MediaScraperModal'

export async function downloadAssets(
  assets: MediaAsset[],
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    const selectedAssets = assets.filter(asset => asset.selected)
    if (selectedAssets.length === 0) {
      throw new Error('No assets selected')
    }

    // Create a link element to trigger downloads
    const link = document.createElement('a')
    link.style.display = 'none'
    document.body.appendChild(link)

    // Download each asset
    for (let i = 0; i < selectedAssets.length; i++) {
      const asset = selectedAssets[i]
      try {
        // Handle video URLs differently
        if (asset.type === 'video') {
          // For YouTube or Vimeo links, just open them in a new tab
          if (asset.url.includes('youtube.com') || asset.url.includes('vimeo.com')) {
            window.open(asset.url, '_blank')
            onProgress(((i + 1) / selectedAssets.length) * 100)
            continue
          }
        }

        // For images and direct video files, use the proxy download
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: asset.url })
        })

        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`)
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Set up download
        link.href = url
        link.download = asset.url.split('/').pop() || `download-${i}`

        // Trigger download
        link.click()

        // Clean up
        window.URL.revokeObjectURL(url)

        // Update progress
        const progress = ((i + 1) / selectedAssets.length) * 100
        onProgress(progress)

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`Failed to download asset: ${asset.url}`, error)
        // Continue with next asset
      }
    }

    // Clean up
    document.body.removeChild(link)
    
  } catch (error) {
    console.error('Error downloading assets:', error)
    throw error
  }
}