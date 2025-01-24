'use client'

import { BrandColorInitializer } from '@/components/BrandColorInitializer'
import { BrandFontInitializer } from '@/components/BrandFontInitializer'
import type { Property } from '@/types/property'

interface ClientLayoutProps {
  property: Property
  children: React.ReactNode
}

export function ClientLayout({ property, children }: ClientLayoutProps) {
  console.log('ClientLayout rendering with property:', property)
  
  return (
    <>
      <BrandColorInitializer property={property} />
      <BrandFontInitializer property={property} />
      {children}
    </>
  )
} 