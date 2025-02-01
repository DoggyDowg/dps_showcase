'use client'

import { CuscoTemplate } from '@/templates/cusco/page'

export default function Home() {
  // Test property ID
  const testPropertyId = '144e229e-34c9-4fa9-bb16-cfdc0dd0937a'
  
  return <CuscoTemplate propertyId={testPropertyId} />
}
