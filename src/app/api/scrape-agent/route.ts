import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Fetch the webpage content
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // Initialize arrays and objects to store scraped data
    const images: { type: 'image'; url: string; name?: string; confidence: number }[] = []
    const agentDetails: {
      name?: string
      email?: string
      phone?: string
      position?: string
    } = {}

    // Find potential profile images
    $('img').each((_, element) => {
      const img = $(element)
      const src = img.attr('src')
      const alt = img.attr('alt')

      if (src) {
        // Convert relative URLs to absolute URLs
        const absoluteUrl = new URL(src, url).href

        // Skip tiny images and common icons
        if (
          !src.includes('icon') &&
          !src.includes('logo') &&
          !src.includes('favicon')
        ) {
          images.push({
            type: 'image',
            url: absoluteUrl,
            name: alt,
            confidence: 0.5 // Default confidence score
          })
        }
      }
    })

    // Try to find agent name
    // Look for headings or elements with specific classes/IDs
    const possibleNameElements = [
      'h1',
      '[class*="agent-name"]',
      '[class*="profile-name"]',
      '[class*="name"]',
      '[id*="agent-name"]',
      '[id*="profile-name"]'
    ]
    
    for (const selector of possibleNameElements) {
      const element = $(selector).first()
      if (element.length) {
        const text = element.text().trim()
        if (text && text.length > 0 && text.length < 50) {
          agentDetails.name = text
          break
        }
      }
    }

    // Try to find email
    // Look for email links or text
    $('a[href^="mailto:"]').each((_, element) => {
      const email = $(element).attr('href')?.replace('mailto:', '')
      if (email && !agentDetails.email) {
        agentDetails.email = email
      }
    })

    // Try to find phone number
    // Look for tel links or text containing phone numbers
    $('a[href^="tel:"]').each((_, element) => {
      const phone = $(element).attr('href')?.replace('tel:', '')
      if (phone && !agentDetails.phone) {
        agentDetails.phone = phone
      }
    })

    // Try to find position/role
    // Look for elements with specific classes or content patterns
    const possiblePositionElements = [
      '[class*="position"]',
      '[class*="role"]',
      '[class*="title"]',
      '[class*="job"]'
    ]

    for (const selector of possiblePositionElements) {
      const element = $(selector).first()
      if (element.length) {
        const text = element.text().trim()
        if (
          text &&
          text.length > 0 &&
          text.length < 50 &&
          !text.includes('@') && // Skip if it looks like an email
          !/^\+?\d/.test(text) // Skip if it looks like a phone number
        ) {
          agentDetails.position = text
          break
        }
      }
    }

    // Return the scraped data
    return NextResponse.json({
      images,
      agentDetails
    })

  } catch (error) {
    console.error('Error scraping agent details:', error)
    return NextResponse.json(
      { error: 'Failed to scrape agent details' },
      { status: 500 }
    )
  }
} 