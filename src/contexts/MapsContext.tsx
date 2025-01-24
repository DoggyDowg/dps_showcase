'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Script from 'next/script';

interface MapsContextType {
  apiKey: string | null;
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapsContext = createContext<MapsContextType | null>(null);

export function MapsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error>();

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch('/api/maps');
        if (!response.ok) throw new Error('Failed to initialize map');
        const { apiKey } = await response.json();
        if (!apiKey) throw new Error('No API key returned');
        setApiKey(apiKey);
      } catch (err) {
        console.error('Error fetching API key:', err);
        setLoadError(err as Error);
      }
    }

    fetchApiKey();
  }, []);

  const handleScriptLoad = () => {
    setIsLoaded(true);
  };

  const handleScriptError = () => {
    setLoadError(new Error('Failed to load Google Maps script'));
  };

  return (
    <MapsContext.Provider value={{ apiKey, isLoaded, loadError }}>
      {apiKey && (
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          onLoad={handleScriptLoad}
          onError={handleScriptError}
          strategy="afterInteractive"
        />
      )}
      {isLoaded && children}
    </MapsContext.Provider>
  );
}

export function useMapsContext() {
  const context = useContext(MapsContext);
  if (!context) {
    throw new Error('useMapsContext must be used within a MapsProvider');
  }
  return context;
} 