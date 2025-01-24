'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  position: string
  agency_id: string
}

interface AgentSelectProps {
  value: string
  agencyId: string | null
  onChange: (value: string) => void
}

export function AgentSelect({ value, agencyId, onChange }: AgentSelectProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadAgents() {
      if (!agencyId) {
        setAgents([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('agents')
          .select('id, name, email, phone, position, agency_id')
          .eq('agency_id', agencyId)
          .order('name')

        if (error) throw error

        setAgents(data || [])
      } catch (err) {
        console.error('Error loading agents:', err)
        setError(err instanceof Error ? err : new Error('Failed to load agents'))
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [supabase, agencyId])

  if (loading) {
    return (
      <select 
        className="w-full p-2 border rounded bg-gray-50" 
        disabled
      >
        <option>Loading agents...</option>
      </select>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error loading agents: {error.message}
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        disabled={!agencyId}
      >
        <option value="">Select an agent</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name} - {agent.position}
          </option>
        ))}
      </select>
      {agencyId && (
        <Link
          href={`/admin/agencies/${agencyId}/agents/new`}
          className="absolute right-0 top-0 h-full flex items-center pr-8 text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
} 