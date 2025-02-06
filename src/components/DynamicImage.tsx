'use client'

import { TrackedImage } from '@/components/shared/AssetTracker'
import type { ImageProps } from 'next/image'

export function DynamicImage(props: ImageProps) {
  return <TrackedImage {...props} />
} 