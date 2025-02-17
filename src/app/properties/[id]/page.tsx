import { CuscoTemplate } from '@/templates/cusco/page'
import { DubaiTemplate } from '@/templates/dubai/page'

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params

  return (
    <div>
      <CuscoTemplate propertyId={id} />
    </div>
  )
}