'use client'

import "./globals.css"
import { Toaster } from 'sonner'

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
