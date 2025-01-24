import { cache } from 'react'
import { createHash } from 'crypto'

// This helper finds the first image in a directory at runtime
export const getFirstImageFromDir = cache(async (dirPath: string): Promise<string> => {
  try {
    const response = await fetch(`/api/get-first-image?dir=${encodeURIComponent(dirPath)}`)
    const data = await response.json()
    return data.path
  } catch {
    return ''
  }
})

// Generate a content-based hash for cache busting
export async function generateContentHash(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image')
    const buffer = await response.arrayBuffer()
    return createHash('md5').update(Buffer.from(buffer)).digest('hex').slice(0, 8)
  } catch (error) {
    console.error('Error generating content hash:', error)
    return Date.now().toString() // Fallback to timestamp if fetch fails
  }
}

// Add cache busting parameter based on content
export async function getImageUrlWithHash(url: string): Promise<string> {
  if (!url) return url
  try {
    const hash = await generateContentHash(url)
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}h=${hash}`
  } catch {
    return url
  }
}

// Static paths for social icons
export const socialIcons = {
  facebook: 'icons/facebook.svg',
  twitter: 'icons/twitterx.svg',
  linkedin: 'icons/linkedin.svg',
}

// Directory paths for logos
export const logoDirs = {
  header: 'images/logos/header',
  footer: 'images/logos/footer',
}

// Function to get the logo path
export function getLogoPath(dir: keyof typeof logoDirs): string {
  return `/${logoDirs[dir]}/logo`
}

// Function to get image path with fallback extensions
export function getImageWithFallback(basePath: string) {
  const extensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.avif',
    '.gif',
    '.svg',
    '.JPG',
    '.JPEG',
    '.PNG',
    '.WEBP',
    '.AVIF',
    '.GIF',
    '.SVG'
  ]
  return extensions.map(ext => `${basePath}${ext}`)
} 