'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Asset } from '@/types/assets'

export function useMoreInfoFloorplans(propertyId?: string, isDemoProperty?: boolean) {
  const [floorplans, setFloorplans] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    async function loadFloorplans() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // If it's a demo property, use the demo floorplans
        if (isDemoProperty) {
          console.log('Loading demo floorplans')
          const supportedFormats = ['webp', 'jpg', 'jpeg', 'pdf'] // Added PDF support
          const demoFloorplans: Asset[] = []
          
          // Try to find up to 3 floorplans (floor1, floor2, floor3)
          for (let floor = 1; floor <= 3; floor++) {
            let foundFloorplan = false
            
            for (const format of supportedFormats) {
              const { data: publicUrlData } = supabase
                .storage
                .from('property-assets')
                .getPublicUrl(`demo/floorplan/floor${floor}.${format}`)

              // Verify if the floorplan exists
              try {
                const response = await fetch(publicUrlData.publicUrl, { 
                  method: 'HEAD',
                  signal: abortController.signal
                })
                if (response.ok) {
                  console.log(`Found demo floorplan ${floor} in ${format} format`)
                  demoFloorplans.push({
                    id: `demo-floor-${floor}`,
                    property_id: propertyId,
                    category: 'floorplan',
                    storage_path: `demo/floorplan/floor${floor}.${format}`,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  foundFloorplan = true
                  break
                }
              } catch (err) {
                console.log(`No ${format} format found for demo floorplan ${floor}:`, err)
              }
            }

            // If we didn't find this floor's plan, stop looking for more
            if (!foundFloorplan) break
          }

          if (demoFloorplans.length === 0) {
            console.error('No supported floorplan formats found for demo property')
          }
          
          if (isMounted) {
            setFloorplans(demoFloorplans)
            setLoading(false)
          }
          return
        }

        // Otherwise, query the assets table for a real property
        console.log('Fetching floorplans for property:', propertyId)
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('property_id', propertyId)
          .eq('category', 'floorplan')
          .eq('status', 'active')

        if (error) throw error

        if (isMounted) {
          setFloorplans(data || [])
        }
      } catch (err) {
        console.error('Error loading floorplans:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load floorplans'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFloorplans()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [supabase, propertyId, isDemoProperty])

  return { floorplans, loading, error }
} 