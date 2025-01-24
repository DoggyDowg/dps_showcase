'use client'

import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

interface GoogleMapsLoaderState {
  isLoaded: boolean
  loadError: Error | null
}

export function useGoogleMaps() {
  const [state, setState] = useState<GoogleMapsLoaderState>({
    isLoaded: false,
    loadError: null,
  })

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })

    loader
      .load()
      .then(() => {
        setState({ isLoaded: true, loadError: null })
      })
      .catch((err) => {
        setState({ isLoaded: false, loadError: err })
      })
  }, [])

  return {
    isLoaded: state.isLoaded,
    loadError: state.loadError,
  }
} 