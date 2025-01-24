'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Remove from DOM after animation completes
    const timer = setTimeout(() => {
      setShow(false)
    }, 2500) // Match the animation duration

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999] animate-loadingScreen pointer-events-none">
      <div className="w-64 h-24 relative mb-4">
        <Image
          src="/logos/dps_whitebg.png"
          alt="Digital Property Showcase"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="text-xl">Loading demonstration...</div>
      <div className="loader"></div>
    </div>
  )
} 