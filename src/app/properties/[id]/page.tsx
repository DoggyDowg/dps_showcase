'use client'

import { use } from 'react'
import { ShowcaseTemplate } from '@/templates/showcase/page'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params)
  return <ShowcaseTemplate propertyId={id} />
} 