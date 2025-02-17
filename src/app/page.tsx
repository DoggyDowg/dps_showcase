'use client'

import { CuscoTemplate } from '@/templates/cusco/page'

export default function Home() {
  // Production property ID
  const testPropertyId = '918bd332-c7a9-4541-ba06-68e4829206e4'
  
  return <CuscoTemplate propertyId={testPropertyId} />
}
