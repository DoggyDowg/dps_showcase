import "./globals.css"
import { headers } from 'next/headers'
import { Metadata } from 'next'
import ClientLayout from '@/components/layouts/ClientLayout'
import './globals.css'
import Providers from '@/components/shared/Providers'

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
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" async></script>
      </head>
      <body>
        {children}
        <Providers />
      </body>
    </html>
  )
}
