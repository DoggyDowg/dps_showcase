'use client'

import { ParallaxBanner } from '@/components/shared/ParallaxBanner'
import { MasonryGallery } from '@/components/shared/MasonryGallery'
import { ShareButtons } from '@/components/shared/ShareButtons'
import { useLifestyleBanner } from '@/hooks/useLifestyleBanner'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import type { Property } from '@/types/property'

interface YourLifestyleProps {
  property: Property
}

export function YourLifestyle({ property }: YourLifestyleProps) {
  const { imageUrl, loading } = useLifestyleBanner(property.id)
  const { images, loading: galleryLoading } = useGalleryImages(property.id)
  const bannerTitle = property.content?.lifestyle?.banner_title || 'YOUR LIFESTYLE'
  const description = property.content?.lifestyle?.description || ''

  return (
    <div className="flex flex-col overflow-x-hidden">
      <div id="lifestyle">
        <ParallaxBanner
          imageSrc={imageUrl || '/images/banners/yourlifestyle.jpg'}
          title={bannerTitle}
          loading={loading}
        />
      </div>

      {/* Content Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-brand-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Gallery Grid */}
            <div className="h-[600px] overflow-y-auto">
              {galleryLoading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
              ) : (
                <MasonryGallery
                  images={images || []}
                  columns={2}
                  gap={4}
                />
              )}
            </div>

            {/* Lifestyle Description */}
            <div className="prose prose-lg max-w-none text-brand-dark prose-ul:text-brand-dark prose-li:marker:text-brand-dark">
              <p>{description}</p>
            </div>
          </div>

          {/* Social Share */}
          <ShareButtons />
        </div>
      </section>
    </div>
  )
} 