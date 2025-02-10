import type { LucideIcon } from 'lucide-react';

export interface PlaceDetails {
  category?: string;
  subcategory?: string;
  shortDescription?: string;
  photoUrl?: string;
}

export interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  landmarks?: Landmark[];
  property?: Property;
  mode?: 'admin' | 'view';
  onPlaceClick?: (place: google.maps.places.PlaceResult) => Promise<void>;
  onAddLandmark?: (place: google.maps.places.PlaceResult) => void;
  isAddingLandmark?: boolean;
}

export interface Property {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  address: string;
  id: string;
  is_demo: boolean;
}

export interface Landmark {
  name: string;
  type: LandmarkType;
  position: google.maps.LatLngLiteral;
  details?: PlaceDetails;
  description?: string;
  address?: string;
}

export type LandmarkType = 'shopping' | 'dining' | 'schools' | 'leisure' | 'transport';

export interface LandmarkTypeConfig {
  type: string;
  label: LandmarkType;
  icon: LucideIcon;
  markerColor: string;
} 