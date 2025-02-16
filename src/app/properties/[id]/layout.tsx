import Script from 'next/script'
import { headers } from 'next/headers'

export default async function PropertyLayout({
  children
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const headersList = await headers()
  const isCustomDomain = headersList.get('x-custom-domain') === 'true'

  return (
    <>
      <Script id="custom-domain-detector" strategy="beforeInteractive">
        {`window.__CUSTOM_DOMAIN__ = ${isCustomDomain};`}
      </Script>
      {children}
    </>
  )
} 