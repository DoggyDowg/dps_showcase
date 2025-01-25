'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import type { Agent } from '@/types/agent'
import { UserCircle2 } from 'lucide-react'

export default function AgentsPage() {
  const supabase = createClientComponentClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadAgents = useCallback(async () => {
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
        .order('name')

      if (error) throw error

      setAgents(data || [])
    } catch (err) {
      console.error('Error loading agents:', err)
      setError(err instanceof Error ? err : new Error('Failed to load agents'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);  // Include loadAgents in the dependency array

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Get the agent's agency_id before deletion
      const agent = agents.find(a => a.id === agentId)
      const agencyId = agent?.agency_id

      // First, delete agent's avatar from storage if it exists
      if (agent?.avatar_url) {
        const avatarPath = agent.avatar_url.split('/').pop()
        if (avatarPath) {
          const { error: storageError } = await supabase.storage
            .from('agent-assets')
            .remove([`${agentId}/${avatarPath}`])

          if (storageError) {
            console.error('Error deleting agent avatar:', storageError)
          }
        }
      }

      // Then delete the agent record
      const { error: deleteAgentError } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)

      if (deleteAgentError) throw deleteAgentError

      // Refresh the agency page to update agent counts
      if (agencyId) {
        const { error: agencyError } = await supabase
          .from('agency_settings')
          .select('*')
          .eq('id', agencyId)
          .single()

        if (agencyError) {
          console.error('Error refreshing agency:', agencyError)
        }
      }

      // Refresh the agents list
      loadAgents()
      toast.success('Agent deleted successfully')
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast.error('Failed to delete agent')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link
          href="/admin/agents/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Agent
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{agent.name}</h2>
                  <p className="text-gray-600">{agent.position}</p>
                  <p className="text-gray-600">{agent.email}</p>
                  <p className="text-gray-600">{agent.phone}</p>
                  {agent.agency && (
                    <p className="text-gray-600 mt-2">
                      Agency: {agent.agency.name}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {agent.avatar_url ? (
                    <Image
                      src={agent.avatar_url}
                      alt={`${agent.name} avatar`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Link 
                  href={`/admin/agents/${agent.id}`} 
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit Agent
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
                      handleDeleteAgent(agent.id)
                    }
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}