import { headers } from 'next/headers'

export async function generateMetadata() {
  const headersList = headers()
  return {
    title: 'Property Details',
    description: 'View details about the property',
    other: {
      'x-custom-domain': headersList.get('x-custom-domain') === 'true' ? 'true' : 'false'
    }
  }
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const isCustomDomain = headersList.get('x-custom-domain') === 'true'

  return (
    <>
      <meta name="x-custom-domain" content={isCustomDomain ? 'true' : 'false'} />
      {children}
    </>
  )
} 