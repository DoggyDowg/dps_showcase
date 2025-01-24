import type { PlaceDetails } from '@/types/maps';

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await fetch(`/api/place-details?placeId=${placeId}`);
    if (!response.ok) {
      return null;
    }
    
    const { result } = await response.json();
    if (!result) return null;
    
    // Extract relevant information
    const details: PlaceDetails = {};
    
    if (result.types && result.types.length > 0) {
      // Map Google place types to more user-friendly categories
      const categoryMap: Record<string, string> = {
        // Dining
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'bar': 'Bar',
        'food': 'Restaurant',
        'meal_takeaway': 'Takeaway',
        'bakery': 'Bakery',
        
        // Education
        'school': 'School',
        'primary_school': 'Primary School',
        'secondary_school': 'Secondary School',
        'university': 'University',
        'library': 'Library',
        
        // Recreation
        'park': 'Park',
        'stadium': 'Stadium',
        'gym': 'Gym',
        'golf_course': 'Golf Club',
        'sports_complex': 'Sports Complex',
        
        // Shopping
        'shopping_mall': 'Shopping Center',
        'store': 'Store',
        'supermarket': 'Supermarket',
        'convenience_store': 'Convenience Store',
        'clothing_store': 'Clothing Store',
        
        // Transport
        'train_station': 'Train Station',
        'bus_station': 'Bus Station',
        'transit_station': 'Transit Station',
        'subway_station': 'Subway Station',
        'taxi_stand': 'Taxi Stand',
        
        // Other
        'point_of_interest': 'Point of Interest',
        'establishment': 'Establishment',
        'local_government_office': 'Government Office',
        'post_office': 'Post Office',
        'bank': 'Bank',
        'atm': 'ATM'
      };
      
      // Find the most specific category
      const mainType = result.types.find((type: string) => categoryMap[type]);
      if (mainType) {
        details.category = categoryMap[mainType];
      }
      
      // Get additional type for subcategory
      const subType = result.types.find((type: string) => 
        categoryMap[type] && type !== mainType
      );
      if (subType) {
        details.subcategory = categoryMap[subType];
      }
    }
    
    return Object.keys(details).length > 0 ? details : null;
    
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
} 