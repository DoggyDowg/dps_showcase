'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Agent } from '@/types/agent'
import Image from 'next/image'
import { UserCircle2, Plus } from 'lucide-react'

export default function AgentsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('agents')
          .select(`
            *,
            agency:agency_id (
              id,
              name
            )
          `)
          .eq('agency_id', params.id)
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
  }, [supabase, params.id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          onClick={() => router.push(`/admin/agencies/${params.id}/agents/new`)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <UserCircle2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new agent.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push(`/admin/agencies/${params.id}/agents/new`)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => router.push(`/admin/agencies/${params.id}/agents/${agent.id}`)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {agent.avatar_url ? (
                    <Image
                      src={agent.avatar_url}
                      alt={`${agent.name} avatar`}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircle2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.position}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="font-medium mr-2">Email:</span>
                  {agent.email}
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="font-medium mr-2">Phone:</span>
                  {agent.phone}
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="font-medium mr-2">Agency:</span>
                  {(agent.agency as { name: string })?.name || 'Unknown Agency'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 