'use client'

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Asset } from '@/types/assets'

interface UseAssetsOptions {
  propertyId: string
  category?: string
  status?: string
  limit?: number
  offset?: number
}

interface UseAssetsResult {
  assets: Asset[]
  isLoading: boolean
  error: Error | null
  totalCount: number
}

export function useAssets({
  propertyId,
  category,
  status = 'active',
  limit = 10,
  offset = 0,
}: UseAssetsOptions): UseAssetsResult {
  const supabase = createClientComponentClient()
  
  const queryKey = ['assets', propertyId, category, status, limit, offset]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .eq('property_id', propertyId)
        .eq(category ? 'category' : 'id', category || 'id')
        .eq(status ? 'status' : 'id', status || 'id')
        .order('display_order', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const totalCount = count ?? 0
      const assets = data ?? []

      return { assets, totalCount }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    assets: data?.assets ?? [],
    isLoading,
    error: error as Error | null,
    totalCount: data?.totalCount ?? 0,
  }
}