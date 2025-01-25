'use client'

import { BrandColorInitializer } from '@/components/BrandColorInitializer'
import { BrandFontInitializer } from '@/components/BrandFontInitializer'
import type { Property } from '@/types/property'

interface ClientLayoutProps {
  property: Property
  children: React.ReactNode
}

export function ClientLayout({ property, children }: ClientLayoutProps) {
  return (
    <>
      <BrandColorInitializer property={property} />
      <BrandFontInitializer property={property} />
      {children}
    </>
  )
}