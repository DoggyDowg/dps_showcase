"use client";

import { Suspense } from 'react';
import VirtualTour from '@/components/virtual-tour/VirtualTour';

export default function TestVirtualTour() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Virtual Tour Test Page</h1>
      
      <Suspense 
        fallback={
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
            <div>Loading...</div>
          </div>
        }
      >
        <div className="bg-white rounded-lg shadow-lg p-4">
          <VirtualTour 
            modelPath="/models/property-tour/the_king_s_hall.glb"
            className="rounded-lg overflow-hidden"
          />
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Controls</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Left Click + Drag: Rotate view</li>
            <li>Scroll: Zoom in/out</li>
            <li>Right Click + Drag: Pan</li>
            <li>Double Click: Reset view</li>
          </ul>
        </div>
      </Suspense>
    </div>
  );
} 