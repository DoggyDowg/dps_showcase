'use client';

import { InfoWindow } from '@react-google-maps/api';
import type { Landmark } from '@/types/maps';
import Image from 'next/image';

interface MapInfoWindowProps {
  landmark: Landmark;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  onClose: () => void;
  distance?: string;
}

export function MapInfoWindow({ landmark, position, onClose, distance }: MapInfoWindowProps) {
  return (
    <InfoWindow 
      position={position} 
      onCloseClick={onClose}
      options={{
        pixelOffset: new google.maps.Size(0, -35),
        maxWidth: 250
      }}
    >
      <div 
        className="min-w-[250px] flex flex-col"
        style={{ 
          margin: '-8px -16px -16px -16px', // Counteract InfoWindow's internal padding
          padding: '8px 16px 16px 16px'
        }}
      >
        {/* Image */}
        {landmark.details?.photoUrl && (
          <div className="relative w-[100px] h-16 rounded-lg overflow-hidden mb-3">
            <Image
              src={landmark.details.photoUrl}
              alt={landmark.name}
              fill
              className="object-cover"
              unoptimized // Since we're using external URLs from Google
            />
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg font-medium mb-1">{landmark.name}</h3>
        <p className="text-sm text-gray-600">
          {landmark.details?.shortDescription}
        </p>
        {distance && (
          <p className="text-sm text-gray-500 mt-1">
            {distance} from property
          </p>
        )}
      </div>
    </InfoWindow>
  );
} 