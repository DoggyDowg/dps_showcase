'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Agency {
  id: string
  name: string
}

interface AgencySelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function AgencySelect({ value, onChange, className }: AgencySelectProps) {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadAgencies() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('agency_settings')
          .select('id, name')
          .order('name')

        if (error) throw error

        setAgencies(data || [])
      } catch (err) {
        console.error('Error loading agencies:', err)
        setError(err instanceof Error ? err : new Error('Failed to load agencies'))
      } finally {
        setLoading(false)
      }
    }

    loadAgencies()
  }, [supabase])

  if (loading) {
    return (
      <select 
        className={`w-full p-2 border rounded bg-gray-50 ${className || ''}`} 
        disabled
      >
        <option>Loading agencies...</option>
      </select>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error loading agencies: {error.message}
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border rounded ${className || ''}`}
    >
      <option value="">Select an agency</option>
      {agencies.map((agency) => (
        <option key={agency.id} value={agency.id}>
          {agency.name}
        </option>
      ))}
    </select>
  )
}