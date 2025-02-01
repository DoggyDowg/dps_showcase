import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Asset } from '@/types/assets';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface GridGalleryProps {
  propertyId: string;
}

export function GridGallery({ propertyId }: GridGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<Asset[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const centerColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('property_id', propertyId)
        .eq('category', 'gallery')
        .order('created_at', { ascending: true })
        .limit(9);

      if (data) {
        setGalleryImages(data);
      }
    };

    fetchGalleryImages();
  }, [propertyId]);

  // Initialize animations
  useEffect(() => {
    if (!containerRef.current || !leftColumnRef.current || !centerColumnRef.current || !rightColumnRef.current || galleryImages.length === 0) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const ctx = gsap.context(() => {
      timelineRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        }
      });

      // Hide side columns initially
      gsap.set([leftColumnRef.current, rightColumnRef.current], { 
        x: (index) => index === 0 ? '-100%' : '100%',
        opacity: 0 
      });

      // Set center column to full viewport width and height
      gsap.set(centerColumnRef.current, {
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        left: '50%',
        x: '-50%',
        top: 0,
        padding: '2rem'
      });

      // Set the center column images to be full height
      if (centerColumnRef.current) {
        gsap.set(centerColumnRef.current.querySelectorAll('.grid-image'), {
          height: '100%',
          marginBottom: 0
        });
      }

      // Animation sequence
      timelineRef.current
        .to(centerColumnRef.current, {
          position: 'relative',
          width: 'auto',
          height: 'auto',
          left: 'auto',
          x: 0,
          padding: 0,
          duration: 1.5,
          ease: "power2.inOut"
        })
        .to(centerColumnRef.current?.querySelectorAll('.grid-image') || [], {
          height: '400px',
          marginBottom: '1.5rem',
          duration: 1.5,
          ease: "power2.inOut"
        }, "<")
        .to([leftColumnRef.current, rightColumnRef.current], {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out"
        }, "-=0.5");
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, [galleryImages]);

  if (galleryImages.length === 0) return null;

  // Split images into columns
  const leftColumn = galleryImages.slice(0, 3);
  const centerColumn = galleryImages.slice(3, 6);
  const rightColumn = galleryImages.slice(6, 9);

  return (
    <section 
      ref={containerRef} 
      className="relative bg-black"
      style={{ minHeight: '300vh' }}
    >
      <div className="h-screen sticky top-0 flex items-center justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 w-full relative">
            {/* Left Column */}
            <div ref={leftColumnRef} className="space-y-6 relative z-10">
              {leftColumn.map((image, index) => (
                <div 
                  key={image.id}
                  className="grid-image aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 relative"
                  style={{ height: '400px' }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-assets/${image.storage_path}`}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>

            {/* Center Column */}
            <div ref={centerColumnRef} className="space-y-6 relative z-20">
              {centerColumn.map((image, index) => (
                <div 
                  key={image.id}
                  className="grid-image aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 relative"
                  style={{ height: '400px' }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-assets/${image.storage_path}`}
                    alt={`Gallery image ${index + 4}`}
                    fill
                    sizes="100vw"
                    className="object-cover hover:scale-110 transition-transform duration-700"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div ref={rightColumnRef} className="space-y-6 relative z-10">
              {rightColumn.map((image, index) => (
                <div 
                  key={image.id}
                  className="grid-image aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 relative"
                  style={{ height: '400px' }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-assets/${image.storage_path}`}
                    alt={`Gallery image ${index + 7}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
