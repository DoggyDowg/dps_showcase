'use client'

import { useProperty } from '@/hooks/useProperty'
import { Header } from '@/components/Header'
import { Hero as CuscoHero } from '@/components/Hero'
import { Hero as DubaiHero } from '@/templates/dubai/components/Hero'
import { YourHome } from '@/components/YourHome'
import { YourLifestyle } from '@/components/YourLifestyle'
import { YourNeighbourhood } from '@/components/YourNeighbourhood'
import { Viewings } from '@/components/Viewings'
import { Footer } from '@/components/Footer'
import { TransitionGallery } from '@/components/TransitionGallery'
import { MoreInfo } from '@/components/MoreInfo'
import ClientLayout from '@/components/layouts/ClientLayout'
import { Contact } from '@/components/Contact'
import CustomChat from '@/components/shared/CustomChat'

interface CuscoTemplateProps {
  propertyId: string
  templateStyle?: 'cusco' | 'dubai'
}

export function CuscoTemplate({ propertyId, templateStyle = 'cusco' }: CuscoTemplateProps) {
  const { property, loading, error } = useProperty(propertyId)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const HeroComponent = templateStyle === 'dubai' ? DubaiHero : CuscoHero

  return (
    <ClientLayout property={property}>
      <main className="min-h-screen overflow-x-hidden">
        <Header property={property} />
        <HeroComponent property={property} />
        <TransitionGallery property={property} />
        <YourHome property={property} />
        <YourLifestyle property={property} />
        <YourNeighbourhood property={property} />
        <MoreInfo property={property} />
        <Viewings property={property} />
        <Contact property={property} />
        <Footer property={property} />
        {property.is_demo && <CustomChat />}
      </main>
    </ClientLayout>
  )
}