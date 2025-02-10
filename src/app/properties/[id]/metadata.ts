import { Metadata } from 'next'
import { getProperty } from '@/utils/propertyUtils'
import { getGalleryImages } from '@/utils/galleryUtils'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Get property data
  const property = await getProperty(params.id)

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
    }
  }

  const agencyName = property.agency_name || property.agency_settings?.copyright?.split('©')?.[1]?.trim() || ''
  
  // Get the first gallery image for OG image
  const galleryImages = await getGalleryImages(property.id)
  const ogImage = galleryImages?.[0]?.src || property.agency_settings?.branding?.logo?.dark

  // Get the base URL for this property
  // First try property's custom domain, then deployment URL, then fallback to env variable
  const baseUrl = property.custom_domain || 
                 property.deployment_url || 
                 process.env.NEXT_PUBLIC_BASE_URL || 
                 'https://digipropshow.com'

  return {
    // Use SEO title and description from content
    title: property.content?.seo?.title || `${property.name} - ${property.suburb}`,
    description: property.content?.seo?.description,
    
    // Use OG specific content for social sharing
    openGraph: {
      title: property.content?.og?.title || property.content?.seo?.title || `${property.name} - ${property.suburb}`,
      description: property.content?.og?.description || property.content?.seo?.description,
      images: [
        {
          url: ogImage || '',
          width: 1200,
          height: 630,
          alt: property.name,
        },
      ],
      locale: 'en_AU',
      type: 'website',
      siteName: agencyName,
      url: `${baseUrl}/properties/${params.id}`,
    },
    
    // Use OG content for Twitter as well
    twitter: {
      card: 'summary_large_image',
      title: property.content?.og?.title || property.content?.seo?.title || `${property.name} - ${property.suburb}`,
      description: property.content?.og?.description || property.content?.seo?.description,
      images: [ogImage || ''],
    },
    
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/properties/${params.id}`,
    },
  }
} 