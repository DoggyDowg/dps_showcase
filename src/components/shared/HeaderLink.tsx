'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGesture } from '@/hooks/useGesture'
import styles from '@/styles/HeaderLink.module.css'

interface HeaderLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export function HeaderLink({ href, children, className = '', onClick }: HeaderLinkProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  const gestureRef = useGesture({
    onPress: () => setIsPressed(true),
    onPressUp: () => setIsPressed(false),
    onTap: () => {
      // Smooth scroll for anchor links
      if (href.startsWith('#')) {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  })

  const isHashLink = href.startsWith('#')

  const internalHandleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHashLink) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    internalHandleClick(e)
    if (onClick) {
      onClick(e)
    }
  }

  const linkClassName = `${styles.link} ${className || ''}`

  if (isHashLink) {
    return (
      <a href={href} className={linkClassName} onClick={handleClick}>
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      ref={(node: HTMLAnchorElement | null) => { gestureRef.current = node as HTMLAnchorElement | null; }}
      className={`
        relative text-brand-light hover:text-brand-light/80 transition-colors
        after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full 
        after:h-[2px] after:bg-brand-light after:scale-x-0 after:origin-right
        after:transition-transform hover:after:scale-x-100 hover:after:origin-left
        active:text-brand-light/60
        ${isPressed ? 'scale-95' : 'scale-100'}
        transition-transform duration-150
        ${linkClassName}
      `}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}