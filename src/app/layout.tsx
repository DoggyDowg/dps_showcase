'use client'

import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import { AssetLoadingProvider } from '@/contexts/AssetLoadingContext'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import './globals.css'
import { Metadata } from 'next'
import Providers from '@/components/shared/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Digital Property Showcase',
  description: 'Discover amazing properties with our digital showcase platform.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Digital Property Showcase',
    title: 'Digital Property Showcase',
    description: 'Discover amazing properties with our digital showcase platform.',
    images: [
      {
        url: '/og-image.jpg', // This should be a public image in your project
        width: 1200,
        height: 630,
        alt: 'Digital Property Showcase',
      }
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const isCustomDomain = headersList.get('x-is-custom-domain') === 'true'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" async></script>
        {isCustomDomain && (
          <meta name="is-custom-domain" content="true" />
        )}
      </head>
      <body className={inter.className}>
        <AssetLoadingProvider>
          <LoadingScreen />
          {children}
        </AssetLoadingProvider>
        <Providers />
      </body>
    </html>
  )
}
