import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: Request) {
  try {
    console.log('Received scrape request')
    
    const { url } = await request.json()
    console.log('URL to scrape:', url)
    
    if (!url) {
      console.error('No URL provided')
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Launch Puppeteer with additional configuration
    console.log('Launching browser...')
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--ignore-certificate-errors'
      ]
    })
    
    const page = await browser.newPage()

    try {
      // Enable console logging from the page
      page.on('console', msg => console.log('PAGE LOG:', msg.text()))
      page.on('pageerror', err => console.error('PAGE ERROR:', err))

      // Mask webdriver
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
        // @ts-expect-error Chrome property doesn't exist on window
        window.chrome = {
          runtime: {},
        };
      })
      
      // Set a common user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

      // Configure request interception
      await page.setRequestInterception(true)
      page.on('request', request => {
        // Block unnecessary resources to speed up loading
        const blockedTypes = ['stylesheet', 'font']
        if (blockedTypes.includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })

      // Set viewport size
      await page.setViewport({ width: 1920, height: 1080 })

      // Navigate to the page with more lenient conditions
      console.log('Navigating to URL...')
      const response = await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 45000 // Increased timeout
      })

      if (!response) {
        throw new Error('No response received from page')
      }

      if (response.status() >= 400) {
        throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`)
      }

      console.log('Page loaded')

      // Wait for common elements with a race condition
      await Promise.race([
        page.waitForSelector('img', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('video', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('iframe', { timeout: 10000 }).catch(() => null)
      ])

      // Add a longer delay to ensure dynamic content is loaded
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Initialize media sets
      const images = new Set<string>()
      const videos = new Set<string>()
      const floorplans = new Set<string>()

      const extractMedia = async () => {
        console.log('Extracting media from current page state...')
        const mediaUrls = await page.evaluate(() => {
          const urls = {
            images: new Set<string>(),
            videos: new Set<string>(),
            floorplans: new Set<string>()
          }

          const addValidUrl = (url: string, type: keyof typeof urls) => {
            try {
              const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href
              urls[type].add(fullUrl)
            } catch {
              console.error('Invalid URL:', url)
            }
          }

          // Find all images
          document.querySelectorAll('img').forEach(img => {
            const src = img.src || img.dataset.src
            if (src) {
              addValidUrl(src, 'images')
            }
          })

          // Find background images
          document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el)
            const bgImage = style.backgroundImage
            if (bgImage && bgImage !== 'none') {
              const url = bgImage.slice(4, -1).replace(/['"]/g, '')
              if (url) {
                addValidUrl(url, 'images')
              }
            }
          })

          return {
            images: Array.from(urls.images),
            videos: Array.from(urls.videos),
            floorplans: Array.from(urls.floorplans)
          }
        })

        console.log('Extracted media counts:', {
          images: mediaUrls.images.length,
          videos: mediaUrls.videos.length,
          floorplans: mediaUrls.floorplans.length
        })

        return mediaUrls
      }

      // Take a screenshot for debugging
      await page.screenshot({ path: '/tmp/debug-screenshot.png' })

      // Extract media from initial state
      const initialMedia = await extractMedia()
      initialMedia.images.forEach(url => images.add(url))
      initialMedia.videos.forEach(url => videos.add(url))
      initialMedia.floorplans.forEach(url => floorplans.add(url))

      // Click through tabs if they exist
      const tabSelectors = [
        '[data-tab]',
        '[role="tab"]',
        '.tab',
        '[class*="tab"]',
        '[class*="gallery"]',
        '[class*="photo"]',
        'button',
        'a'
      ]

      // Try clicking elements that might reveal more images
      for (const selector of tabSelectors) {
        try {
          const elements = await page.$$(selector)
          for (const element of elements) {
            const text = await element.evaluate(el => el.textContent?.toLowerCase() || '')
            if (text.includes('gallery') || text.includes('photo') || text.includes('image')) {
              console.log(`Found potential gallery element: ${text}`)
              await element.click().catch(() => null)
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              const tabMedia = await extractMedia()
              tabMedia.images.forEach(url => images.add(url))
              tabMedia.videos.forEach(url => videos.add(url))
              tabMedia.floorplans.forEach(url => floorplans.add(url))
            }
          }
        } catch (e) {
          console.log(`Error with selector ${selector}:`, e)
        }
      }

      // Log findings
      console.log('Final media counts:', {
        images: images.size,
        videos: videos.size,
        floorplans: floorplans.size
      })

      // Format the response
      const assets = [
        ...Array.from(images).map((url, index) => ({
          id: `img-${index}`,
          url,
          type: 'image' as const,
          selected: false
        })),
        ...Array.from(videos).map((url, index) => ({
          id: `video-${index}`,
          url,
          type: 'video' as const,
          selected: false
        })),
        ...Array.from(floorplans).map((url, index) => ({
          id: `floorplan-${index}`,
          url,
          type: 'image' as const,
          category: 'floorplan',
          selected: false
        }))
      ]

      console.log('Total assets found:', assets.length)
      return NextResponse.json({ assets })

    } finally {
      await browser.close()
      console.log('Browser closed')
    }
    
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape media from URL' },
      { status: 500 }
    )
  }
} 