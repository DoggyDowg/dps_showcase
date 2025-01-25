import Link from 'next/link'
import styles from '@/styles/HeaderLink.module.css'

interface HeaderLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function HeaderLink({ href, children, className, onClick }: HeaderLinkProps) {
  const isHashLink = href.startsWith('#')

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHashLink) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    onClick?.()
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
    <Link href={href} className={linkClassName} onClick={onClick}>
      {children}
    </Link>
  )
}