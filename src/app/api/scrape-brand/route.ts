import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Starting brand scraping for URL:', url)

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

    try {
      const page = await browser.newPage()

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
        // Allow all resource types except media and other
        const resourceType = request.resourceType()
        const blockedTypes = ['media', 'other']
        
        if (blockedTypes.includes(resourceType)) {
          request.abort()
        } else {
          request.continue()
        }
      })

      await page.setViewport({ width: 1920, height: 1080 })

      console.log('Navigating to URL:', url)
      
      const response = await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000
      })

      if (!response) {
        throw new Error('No response received from page')
      }

      if (response.status() >= 400) {
        throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`)
      }

      console.log('Page loaded successfully')

      // Wait for common elements
      await Promise.race([
        page.waitForSelector('img', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('link[rel="stylesheet"]', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('header', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('a[href^="mailto:"]', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('a[href^="tel:"]', { timeout: 5000 }).catch(() => null)
      ])

      // Add a small delay to ensure dynamic content is loaded
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Take a screenshot for debugging
      await page.screenshot({ path: '/tmp/debug-screenshot.png' })

      // Extract brand assets and agency details
      const { brandAssets, agencyDetails } = await page.evaluate(() => {
        const assets: {
          logos: Array<{
            type: 'logo';
            url: string;
            confidence: number;
            name: string;
          }>;
          fonts: Array<{
            type: 'font';
            url: string;
            confidence: number;
            name: string;
            format?: string;
          }>;
        } = {
          logos: [],
          fonts: []
        }

        // Extract agency details
        const extractAgencyDetails = () => {
          // Extract website (root URL)
          const website = window.location.origin

          // Extract name - look for common patterns in real estate websites
          let name = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || // Try Open Graph site name
                    document.querySelector('meta[name="application-name"]')?.getAttribute('content') || // Try application name
                    document.querySelector('header h1')?.textContent?.trim() || // Try first h1 in header
                    document.querySelector('header .logo, header .brand')?.getAttribute('alt') || // Try logo alt text
                    window.location.hostname.split('.')[0] // Fallback to domain name

          // Clean up name (remove common suffixes)
          name = name.replace(/(Real Estate|Realty|Properties|Property|Group|LLC|Ltd|Limited|Pty Ltd)$/i, '').trim()

          // Extract email - look for common patterns
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
          const emailMatch = document.documentElement.innerHTML.match(emailRegex)
          const email = document.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '') ||
                       emailMatch?.[0] ||
                       ''

          // Extract phone - look for common patterns
          const phoneRegex = /(?:\+?61|0)?(?:[ -]?[2-9](?:[ -]?\d){7,8})/
          const phoneMatch = document.documentElement.innerHTML.match(phoneRegex)
          const phone = document.querySelector('a[href^="tel:"]')?.getAttribute('href')?.replace('tel:', '') ||
                       document.querySelector('.phone, .contact-phone')?.textContent?.trim() ||
                       phoneMatch?.[0] ||
                       ''

          // Generate copyright text
          const currentYear = new Date().getFullYear()
          const copyrightText = `© ${currentYear} ${name}. All rights reserved.`

          return {
            name,
            email,
            phone,
            website,
            copyrightText
          }
        }

        try {
          // Extract logos
          console.log('Extracting logos...')
          const logoSelectors = [
            'img[src*="logo"]',
            'img[alt*="logo" i]',
            'img[class*="logo" i]',
            'img[id*="logo" i]',
            '.logo img',
            '#logo img',
            '[class*="logo"] img',
            '[id*="logo"] img',
            'header img',
            '.header img',
            'nav img'
          ]

          // Log all images found
          const allImages = document.querySelectorAll('img')
          console.log('Total images found:', allImages.length)
          allImages.forEach(img => {
            const element = img as HTMLImageElement
            console.log('Image:', {
              src: element.src,
              alt: element.alt,
              class: element.className,
              id: element.id,
              width: element.width,
              height: element.height
            })
          })

          const logoElements = document.querySelectorAll(logoSelectors.join(','))
          console.log('Logo elements found:', logoElements.length)
          
          const processedUrls = new Set<string>()

          logoElements.forEach((img) => {
            const element = img as HTMLImageElement
            const url = element.src || element.dataset.src
            
            if (url && !processedUrls.has(url)) {
              console.log('Processing potential logo:', {
                url,
                alt: element.alt,
                width: element.width,
                height: element.height
              })

              // Skip data URLs
              if (!url.startsWith('data:')) {
                processedUrls.add(url)
                const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href
                console.log('Adding logo:', fullUrl)
                assets.logos.push({
                  type: 'logo',
                  url: fullUrl,
                  confidence: 0.8,
                  name: element.alt || 'Logo'
                })
              }
            }
          })

          // Extract fonts
          console.log('Extracting fonts...')
          const fontUrls = new Set<string>()
          const seenFontNames = new Set<string>()

          // List of common icon font names to exclude
          const iconFontPatterns = [
            /fontawesome/i,
            /fa-/i,
            /material-icons/i,
            /icomoon/i,
            /glyphicons/i,
            /dashicons/i,
            /ionicons/i
          ]

          function isIconFont(fontName: string): boolean {
            return iconFontPatterns.some(pattern => pattern.test(fontName))
          }

          function addFont(font: { url: string, name: string, format: string, confidence: number }) {
            // Skip if it's an icon font or we've seen this font name before
            if (isIconFont(font.name) || seenFontNames.has(font.name)) {
              return
            }
            
            seenFontNames.add(font.name)
            fontUrls.add(font.url)
            
            assets.fonts.push({
              type: 'font',
              url: font.url,
              name: font.name,
              confidence: font.confidence,
              format: font.format
            })
          }

          // Get Google Fonts from stylesheets
          const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
          console.log('Stylesheets found:', stylesheets.length)

          stylesheets.forEach((link) => {
            const href = link.getAttribute('href')
            console.log('Processing stylesheet:', href)
            if (href?.includes('fonts.googleapis.com')) {
              const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.origin).href
              console.log('Adding Google Font:', fullUrl)
              addFont({
                url: fullUrl,
                name: 'Google Font',
                format: 'google',
                confidence: 0.9
              })
            }
          })

          // Extract web fonts from @font-face rules
          const styleSheets = Array.from(document.styleSheets)
          console.log('Processing', styleSheets.length, 'stylesheets for @font-face rules')

          styleSheets.forEach(sheet => {
            try {
              const rules = Array.from(sheet.cssRules || sheet.rules || [])
              rules.forEach(rule => {
                if (rule instanceof CSSFontFaceRule) {
                  const src = rule.style.getPropertyValue('src')
                  const fontFamily = rule.style.getPropertyValue('font-family').replace(/['"]/g, '')
                  console.log('Found @font-face rule:', { fontFamily, src })
                  
                  // Extract URLs from the src property
                  const urlMatches = src.match(/url\(['"]?([^'"]+)['"]?\)/g) || []
                  urlMatches.forEach(urlMatch => {
                    const url = urlMatch.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1]
                    if (url && !url.startsWith('data:')) {
                      const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href
                      console.log('Adding Web Font:', fullUrl)
                      
                      // Determine font format
                      let format = 'unknown'
                      if (url.endsWith('.woff2')) format = 'woff2'
                      else if (url.endsWith('.woff')) format = 'woff'
                      else if (url.endsWith('.ttf')) format = 'ttf'
                      else if (url.endsWith('.otf')) format = 'otf'
                      else if (url.endsWith('.eot')) format = 'eot'
                      
                      addFont({
                        url: fullUrl,
                        name: fontFamily || 'Web Font',
                        format,
                        confidence: 0.8
                      })
                    }
                  })
                }
              })
            } catch (error) {
              console.log('Error processing stylesheet:', error)
            }
          })

          // Extract font-family declarations from all elements
          const computedStyles = new Set<string>()
          document.querySelectorAll('*').forEach(element => {
            const style = window.getComputedStyle(element)
            const fontFamily = style.getPropertyValue('font-family')
            if (fontFamily && !computedStyles.has(fontFamily)) {
              computedStyles.add(fontFamily)
              console.log('Found font-family declaration:', fontFamily)
            }
          })

          console.log('Final assets:', {
            logoCount: assets.logos.length,
            fontCount: assets.fonts.length
          })

          return {
            brandAssets: assets,
            agencyDetails: extractAgencyDetails()
          }
        } catch (e) {
          console.error('Error in page evaluation:', e)
          throw e
        }
      })

      console.log('Brand assets and agency details extracted:', { brandAssets, agencyDetails })

      // Add debug logging
      console.log('Extracted agency details:', agencyDetails)

      return NextResponse.json({
        logos: brandAssets.logos,
        fonts: brandAssets.fonts,
        colors: [],
        agencyDetails
      })

    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('Error scraping brand assets:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape brand assets' },
      { status: 500 }
    )
  }
} 