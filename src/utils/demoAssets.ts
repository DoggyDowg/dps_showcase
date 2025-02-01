import type { Asset, AssetCategory } from '@/types/assets';

// Define the structure of demo assets
const DEMO_ASSETS: Record<AssetCategory, { path: string; type: 'image' | 'video'; title: string }[]> = {
  hero_video: [
    {
      path: 'demo/hero/hero-video.mp4',
      type: 'video',
      title: 'Demo Property Hero Video'
    }
  ],
  gallery: [
    {
      path: 'demo/gallery/living-room.jpg',
      type: 'image',
      title: 'Luxurious Living Room'
    },
    {
      path: 'demo/gallery/kitchen.jpg',
      type: 'image',
      title: 'Designer Kitchen'
    },
    {
      path: 'demo/gallery/master-bedroom.jpg',
      type: 'image',
      title: 'Master Bedroom Suite'
    },
    {
      path: 'demo/gallery/bathroom.jpg',
      type: 'image',
      title: 'Spa-like Bathroom'
    },
    {
      path: 'demo/gallery/pool.jpg',
      type: 'image',
      title: 'Resort-style Pool'
    }
  ],
  your_home: [
    {
      path: 'demo/sections/your-home.jpg',
      type: 'image',
      title: 'Your Home Section Image'
    }
  ],
  neighbourhood: [
    {
      path: 'demo/neighbourhood/cafe.jpg',
      type: 'image',
      title: 'Local Cafes'
    },
    {
      path: 'demo/neighbourhood/park.jpg',
      type: 'image',
      title: 'Nearby Parks'
    },
    {
      path: 'demo/neighbourhood/shopping.jpg',
      type: 'image',
      title: 'Shopping District'
    }
  ],
  footer: [
    {
      path: 'demo/sections/footer.jpg',
      type: 'image',
      title: 'Footer Background'
    }
  ],
  floorplan: [
    {
      path: 'demo/floorplan/ground-floor.jpg',
      type: 'image',
      title: 'Ground Floor Plan'
    },
    {
      path: 'demo/floorplan/first-floor.jpg',
      type: 'image',
      title: 'First Floor Plan'
    }
  ],
  features_banner: [
    {
      path: 'demo/banners/features-banner.jpg',
      type: 'image',
      title: 'Features Section Banner'
    }
  ],
  lifestyle_banner: [
    {
      path: 'demo/banners/lifestyle-banner.jpg',
      type: 'image',
      title: 'Lifestyle Section Banner'
    }
  ],
  neighbourhood_banner: [
    {
      path: 'demo/banners/neighbourhood-banner.jpg',
      type: 'image',
      title: 'Neighbourhood Section Banner'
    }
  ],
  property_logo: [
    {
      path: 'demo/logos/property-logo.png',
      type: 'image',
      title: 'Property Logo'
    }
  ]
};

/**
 * Generates demo assets for a property
 * @param propertyId - The ID of the property to generate demo assets for
 * @returns An array of demo assets
 */
export function generateDemoAssets(propertyId: string): Asset[] {
  const assets: Asset[] = [];
  const now = new Date().toISOString();

  Object.entries(DEMO_ASSETS).forEach(([category, demoAssets]) => {
    demoAssets.forEach((demoAsset, index) => {
      assets.push({
        id: `demo-${category}-${index}`,
        property_id: propertyId,
        created_at: now,
        updated_at: now,
        category: category as AssetCategory,
        type: demoAsset.type,
        filename: demoAsset.path.split('/').pop() || '',
        storage_path: demoAsset.path,
        title: demoAsset.title,
        alt_text: demoAsset.title,
        status: 'active',
        display_order: index
      });
    });
  });

  return assets;
}

/**
 * Checks if a property should use demo assets
 * @param propertyId - The ID of the property to check
 * @returns A promise that resolves to a boolean indicating if the property should use demo assets
 */
export async function shouldUseDemoAssets(propertyId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/properties/${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch property');
    const property = await response.json();
    return property.is_demo;
  } catch (error) {
    console.error('Error checking demo status:', error);
    return false;
  }
} 