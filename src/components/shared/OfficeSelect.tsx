'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface OfficeSelectProps {
  value: string
  agencyId: string | null
  onChange: (value: string) => void
}

export function OfficeSelect({ value, agencyId, onChange }: OfficeSelectProps) {
  const supabase = createClientComponentClient()
  const [offices, setOffices] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadOffices() {
      if (!agencyId) {
        setOffices([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data: agency, error } = await supabase
          .from('agency_settings')
          .select('office_addresses')
          .eq('id', agencyId)
          .single()

        if (error) throw error

        // Convert office addresses to the format we need
        const officeList = (agency.office_addresses || []).map((office: any) => ({
          id: office.id,
          name: office.name
        }))

        setOffices(officeList)
      } catch (err) {
        console.error('Error loading offices:', err)
        setError(err instanceof Error ? err : new Error('Failed to load offices'))
      } finally {
        setLoading(false)
      }
    }

    loadOffices()
  }, [supabase, agencyId])

  if (loading) {
    return (
      <select disabled className="w-full p-2 border rounded bg-gray-50">
        <option>Loading offices...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select disabled className="w-full p-2 border rounded bg-red-50 text-red-600">
        <option>Error loading offices</option>
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
      disabled={!agencyId}
    >
      <option value="">Select a sales office</option>
      {offices.map((office) => (
        <option key={office.id} value={office.id}>
          {office.name}
        </option>
      ))}
    </select>
  )
} 