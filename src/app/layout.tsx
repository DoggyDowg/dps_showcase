'use client'

import { Inter } from 'next/font/google'
import "./globals.css"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden font-sans">
      <body className="overflow-x-hidden font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
