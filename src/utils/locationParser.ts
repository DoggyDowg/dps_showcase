interface ParsedLocation {
  name: string;
  lat: number;
  lng: number;
  placeId: string;
  category?: string;
  metadata?: {
    type?: string;
    isBusinessListing?: boolean;
    isMappedLocation?: boolean;
  };
}

export function parseGoogleMapsUrl(url: string): ParsedLocation | null {
  console.log('🔍 Parsing URL:', url);

  try {
    // Find all sets of coordinates in the URL
    const allCoords = [];
    
    // Look for actual location coordinates (3d/4d format)
    const actualCoordsRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g;
    let actualMatch;
    while ((actualMatch = actualCoordsRegex.exec(url)) !== null) {
      allCoords.push({
        type: 'actual',
        lat: parseFloat(actualMatch[1]),
        lng: parseFloat(actualMatch[2])
      });
    }
    
    // Look for map view coordinates
    const mapViewCoordsRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/g;
    let mapViewMatch;
    while ((mapViewMatch = mapViewCoordsRegex.exec(url)) !== null) {
      allCoords.push({
        type: 'mapView',
        lat: parseFloat(mapViewMatch[1]),
        lng: parseFloat(mapViewMatch[2])
      });
    }
    
    console.log('📍 All coordinates found:', allCoords);
    
    // Use the last set of actual coordinates, or fall back to the last map view coordinates
    const selectedCoords = allCoords.length > 0 
      ? (allCoords.filter(c => c.type === 'actual').pop() || allCoords.pop())
      : null;
    
    console.log('📍 Selected coordinates:', selectedCoords);
    
    // Extract place ID and analyze its format
    const placeIdRegex = /0x[a-fA-F0-9]+:0x[a-fA-F0-9]+/;
    const placeIdMatch = url.match(placeIdRegex);

    // Try to determine the type of location
    const metadata: ParsedLocation['metadata'] = {};
    
    // Check URL patterns for business vs general location
    if (url.includes('/m/')) {
      metadata.isMappedLocation = true;
      metadata.type = 'landmark';
    } else if (url.includes('/g/')) {
      metadata.isBusinessListing = true;
      metadata.type = 'business';
    }

    // Try to extract category information
    let category = '';
    
    // Common business types in URLs
    const businessTypes = {
      'restaurant': ['restaurant', 'cafe', 'bar', 'dining'],
      'shopping': ['shop', 'store', 'mall', 'retail'],
      'transport': ['station', 'stop', 'terminal', 'railway', 'bus'],
      'park': ['park', 'garden', 'reserve', 'playground'],
      'school': ['school', 'university', 'college', 'education', 'campus']
    };

    // Try to extract name and analyze it for category hints
    let name = '';
    try {
      const urlObj = new URL(url);

      // First try: Look for name in /place/{name}/ format
      const placeMatch = urlObj.pathname.match(/\/place\/([^/@]+)/);
      if (placeMatch && placeMatch[1]) {
        name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        console.log('📝 Found name in place format:', name);
      }

      // Second try: Look in query parameters
      if (!name) {
        const searchParams = new URLSearchParams(urlObj.search);
        for (const [, value] of searchParams.entries()) {
          if (value.includes('!1s')) {
            const nameMatch = value.match(/!1s(.*?)!/);
            if (nameMatch && nameMatch[1]) {
              name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
              console.log('📝 Found name in query params:', name);
              break;
            }
          }
        }
      }

      // Third try: Look in pathname parts
      if (!name) {
        const pathParts = urlObj.pathname.split('/');
        const potentialName = pathParts
          .filter(part => part && 
            !part.startsWith('0x') && 
            !part.match(/^-?\d/) &&
            part !== 'place' &&
            part !== 'maps' &&
            part !== 'data'
          )
          .pop();
        if (potentialName) {
          name = decodeURIComponent(potentialName.replace(/\+/g, ' '));
          console.log('📝 Found name in path parts:', name);
        }
      }

      // Clean up the extracted name
      if (name) {
        // Replace URL-safe characters with proper ones
        name = name
          .replace(/-/g, ' ')
          .replace(/@/g, ' at ')
          .replace(/\+/g, ' ');
        
        // Proper case for the name
        name = name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        // Try to determine category from the name
        const lowerName = name.toLowerCase();
        for (const [type, keywords] of Object.entries(businessTypes)) {
          if (keywords.some(keyword => lowerName.includes(keyword))) {
            category = type;
            break;
          }
        }

        console.log('✨ Final cleaned name:', name);
        console.log('🏷️ Detected category:', category || 'unknown');
      }

    } catch (e) {
      console.warn('⚠️ Could not parse name from URL:', e);
    }
    
    if (selectedCoords) {
      const result: ParsedLocation = {
        name: name || '[Name needed]',
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        placeId: placeIdMatch ? placeIdMatch[0] : 'unknown',
        metadata
      };

      if (category) {
        result.category = category;
      }
      
      console.log('✅ Successfully parsed location:', result);
      return result;
    }

    console.log('❌ Failed to parse location from URL');
    return null;

  } catch (error) {
    console.error('🚨 Error parsing Google Maps URL:', error);
    return null;
  }
}

// Helper function to format the JSON output for landmarks.json
export function formatForLandmarksJson(locations: ParsedLocation[], type: string) {
  return locations.map(loc => {
    // Build a rich description
    let description = loc.name;
    
    // Add business/landmark type if available
    if (loc.metadata?.type === 'business') {
      description += ' (Business)';
    } else if (loc.metadata?.type === 'landmark') {
      description += ' (Landmark)';
    }
    
    // Add detected category if different from assigned type
    if (loc.category && loc.category !== type) {
      description += ` - Detected as ${loc.category}`;
    }

    return {
      name: loc.name,
      position: {
        lat: loc.lat,
        lng: loc.lng
      },
      type,
      description,
      metadata: {
        ...loc.metadata,
        detectedCategory: loc.category,
        placeId: loc.placeId
      }
    };
  });
}

// Example usage in console:
/*
const urls = [
  'https://maps.app.goo.gl/example1',
  'https://maps.app.goo.gl/example2'
];

const locations = urls
  .map(parseGoogleMapsUrl)
  .filter((loc): loc is ParsedLocation => loc !== null);

console.log(JSON.stringify(locations, null, 2));
*/ 