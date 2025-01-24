'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Agency } from '@/types/agency'

export default function AdminPage() {
  const supabase = createClientComponentClient()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadAgencies = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
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

  useEffect(() => {
    loadAgencies()
  }, [])

  const handleDeleteAgency = async (agencyId: string) => {
    try {
      // First, delete all assets from storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('agency-assets')
        .list(agencyId)

      if (storageError) {
        console.error('Error listing agency assets:', storageError)
        throw storageError
      }

      // Delete each file in the agency's folder
      if (storageData && storageData.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('agency-assets')
          .remove(storageData.map(file => `${agencyId}/${file.name}`))

        if (deleteError) {
          console.error('Error deleting agency assets:', deleteError)
          throw deleteError
        }
      }

      // Then delete the agency record
      const { error: deleteAgencyError } = await supabase
        .from('agency_settings')
        .delete()
        .eq('id', agencyId)

      if (deleteAgencyError) throw deleteAgencyError

      // Refresh the agencies list
      loadAgencies()
      toast.success('Agency deleted successfully')
    } catch (error) {
      console.error('Error deleting agency:', error)
      toast.error('Failed to delete agency')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agencies</h1>
        <Link
          href="/admin/agencies/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Agency
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
          {agencies.map((agency) => (
            <div key={agency.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{agency.name}</h2>
                  <p className="text-gray-600">{agency.email}</p>
                  <p className="text-gray-600">{agency.phone}</p>
                  <p className="text-gray-600">{agency.website}</p>
                </div>
                <div>
                  <img 
                    src={agency.branding?.logo?.light || '/placeholder-logo.png'} 
                    alt={`${agency.name} logo`}
                    className="h-12 object-contain"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{agency.propertyCount || 0} Properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{agency.agentCount || 0} Agents</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-8">
                  <Link href={`/admin/agencies/${agency.id}`} className="text-blue-600 hover:text-blue-800">
                    Edit Agency
                  </Link>
                  <Link href={`/admin/agencies/${agency.id}/properties`} className="text-blue-600 hover:text-blue-800">
                    View Properties
                  </Link>
                  <Link href={`/admin/agencies/${agency.id}/agents`} className="text-blue-600 hover:text-blue-800">
                    Manage Agents
                  </Link>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this agency? This action cannot be undone and will delete all associated assets.')) {
                      handleDeleteAgency(agency.id)
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
                  agency.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {agency.status === 'active' ? 'active' : 'inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 