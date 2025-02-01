'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { HeaderLink } from './shared/HeaderLink'
import { MobileMenu } from './shared/MobileMenu'
import { usePropertyLogo } from '@/hooks/usePropertyLogo'
import styles from '@/styles/Header.module.css'
import type { Property } from '@/types/property'

const DEFAULT_MENU_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Lifestyle', href: '#lifestyle' },
  { label: 'Neighbourhood', href: '#neighbourhood' },
  { label: 'Viewings', href: '#viewings' },
  { label: 'Contact', href: '#contact' },
]

const LOGO_HEIGHT = 44    // Reduced from 64 to allow for padding
const MAX_LOGO_WIDTH = 200 // Maximum width for the logo

interface HeaderProps {
  property: Property
}

export function Header({ property }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logoUrl } = usePropertyLogo(property.id)

  // Handle scroll behavior
  useEffect(() => {
    let lastScrollY = window.scrollY
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY <= 0 || currentScrollY < lastScrollY)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get custom menu items from agency settings or use defaults
  const menuItems = useMemo(() => {
    // Debug logs
    console.log('Property:', property)
    console.log('Agency Settings:', property?.agency_settings)
    console.log('Menu Items:', property?.agency_settings?.menu_items)
    console.log('Menu Items Type:', typeof property?.agency_settings?.menu_items)
    console.log('Menu Items Keys:', property?.agency_settings?.menu_items ? Object.keys(property.agency_settings.menu_items) : 'No menu items')

    // Check if property and agency_settings exist
    if (!property || !property.agency_settings) {
      console.log('Using default menu items because property or agency_settings is missing')
      return DEFAULT_MENU_ITEMS
    }

    // Check if menu_items exists and is a valid object
    const customMenuItems = property.agency_settings.menu_items
    if (!customMenuItems || typeof customMenuItems !== 'object' || Object.keys(customMenuItems).length === 0) {
      console.log('Using default menu items because customMenuItems is invalid:', customMenuItems)
      return DEFAULT_MENU_ITEMS
    }

    console.log('Using custom menu items:', customMenuItems)
    console.log('Custom menu items features:', customMenuItems.features)
    console.log('Custom menu items lifestyle:', customMenuItems.lifestyle)
    console.log('Custom menu items neighbourhood:', customMenuItems.neighbourhood)
    console.log('Custom menu items viewings:', customMenuItems.viewings)
    console.log('Custom menu items contact:', customMenuItems.contact)

    // Map the values with fallbacks, ensuring we handle undefined or null values
    return [
      { label: customMenuItems.features || DEFAULT_MENU_ITEMS[0].label, href: '#features' },
      { label: customMenuItems.lifestyle || DEFAULT_MENU_ITEMS[1].label, href: '#lifestyle' },
      { label: customMenuItems.neighbourhood || DEFAULT_MENU_ITEMS[2].label, href: '#neighbourhood' },
      { label: customMenuItems.viewings || DEFAULT_MENU_ITEMS[3].label, href: '#viewings' },
      { label: customMenuItems.contact || DEFAULT_MENU_ITEMS[4].label, href: '#contact' },
    ]
  }, [property])

  // Use property data for SEO
  useEffect(() => {
    if (property) {
      document.title = property.content.seo.title || 'Digital Property Showcase'
    }
  }, [property])

  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null // Prevent hydration mismatch by not rendering until mounted
  }
  
  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : ''} relative z-[100]`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 min-w-0 max-w-[160px] sm:max-w-[200px] h-20 flex items-center">
            <Link href="/" prefetch={false} className="block py-[10px]">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${property.agency_name} Logo`}
                  width={MAX_LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  priority
                  className="object-contain w-auto h-[44px]"
                />
              ) : (
                <div 
                  className="bg-gray-200 flex items-center justify-center h-[44px]"
                  style={{ width: MAX_LOGO_WIDTH }}
                >
                  <span className="text-gray-400 text-sm">Logo not found</span>
                </div>
              )}
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center flex-1 justify-end">
            <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-6 xl:gap-8 text-sm sm:text-[15px] xl:text-base">
              {menuItems.map((item) => (
                <HeaderLink key={item.label} href={item.href} className="whitespace-nowrap">
                  {item.label}
                </HeaderLink>
              ))}
            </div>
          </nav>

          <button 
            type="button"
            aria-label="Menu"
            className="md:hidden p-2 -mr-2 relative z-20"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg 
              className="w-6 h-6 text-brand-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        menuItems={menuItems}
        property={property}
      />
    </header>
  )
}
