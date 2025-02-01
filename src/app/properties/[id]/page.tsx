'use client'

import { use } from 'react'
import { useProperty } from '@/hooks/useProperty'
import { CuscoTemplate } from '@/templates/cusco/page'
import { DubaiTemplate } from '@/templates/dubai/page'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params)
  const { property, loading, error } = useProperty(id)

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

  // Render the appropriate template based on the property's template_name
  switch (property.template_name) {
    case 'dubai':
      return <DubaiTemplate propertyId={id} />
    case 'cusco':
    default:
      return <CuscoTemplate propertyId={id} />
}