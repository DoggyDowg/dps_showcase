import { headers } from 'next/headers'
import Script from 'next/script'

export async function generateMetadata() {
  const headersList = await headers()
  const isCustomDomain = headersList.get('x-custom-domain') === 'true'
  
  return {
    title: 'Property Details',
    description: 'View details about the property',
    other: {
      'x-custom-domain': isCustomDomain ? 'true' : 'false'
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
      <Script id="custom-domain-detector">
        {`window.__CUSTOM_DOMAIN__ = ${isCustomDomain};`}
      </Script>
      {children}
    </>
  )
} 