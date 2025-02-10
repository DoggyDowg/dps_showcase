import { createClient } from '@supabase/supabase-js'
import type { Property } from '@/types/property'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getProperty(id: string): Promise<Property | null> {
  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('*, agency_settings:agency_settings(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      return null
    }

    return property
  } catch (error) {
    console.error('Error in getProperty:', error)
    return null
  }
} 