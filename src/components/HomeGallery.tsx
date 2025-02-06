'use client'

import { AutoScrollGallery } from './AutoScrollGallery'
import type { Property } from '@/types/property'

interface HomeGalleryProps {
  property: Property
}

export function HomeGallery({ property }: HomeGalleryProps) {
  return <AutoScrollGallery property={property} />
} 