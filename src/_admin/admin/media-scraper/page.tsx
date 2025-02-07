'use client'

import dynamic from 'next/dynamic'

const MediaScraperModal = dynamic(
  () => import('@/components/admin/media-scraper/MediaScraperModal'),
  { ssr: false }
)

export default function MediaScraperPage() {
  return (
    <div>
      <MediaScraperModal />
    </div>
  )
} 