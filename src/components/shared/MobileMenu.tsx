import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeaderLink } from './HeaderLink'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { usePropertyLogo } from '@/hooks/usePropertyLogo'
import type { Property } from '@/types/property'

interface MobileMenuProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  menuItems: Array<{ label: string; href: string }>
  property: Property
}

export function MobileMenu({ isOpen, setIsOpen, menuItems, property }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false)
  const { logoUrl } = usePropertyLogo(property.id)
  const LOGO_HEIGHT = 40 // Smaller logo for mobile menu
  const MAX_LOGO_WIDTH = 160 // Maximum width for the mobile menu logo

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />
          
          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-64 bg-brand-light shadow-lg z-[9999] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-brand-dark hover:opacity-70 transition-opacity"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Menu items */}
            <nav className="pt-16 px-4 flex-1">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <HeaderLink
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-lg text-brand-dark hover:opacity-70 transition-opacity"
                    >
                      {item.label}
                    </HeaderLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logo at bottom */}
            <div className="flex justify-center pb-8 px-4">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${property.agency_name} Logo`}
                  width={MAX_LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="w-auto h-[40px] object-contain opacity-80"
                />
              ) : (
                <div 
                  className="bg-gray-200 flex items-center justify-center h-[40px]"
                  style={{ width: MAX_LOGO_WIDTH }}
                >
                  <span className="text-gray-400 text-sm">Logo not found</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null

  return createPortal(menuContent, document.body)
} 