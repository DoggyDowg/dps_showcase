'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import type { Property } from '@/types/property'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface PropertyWithAgent extends Property {
  agent?: {
    name: string
    position: string
  }
}

export default function PropertiesPage() {
  const supabase = createClientComponentClient()
  const [properties, setProperties] = useState<PropertyWithAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:agent_id (
            name,
            position
          ),
          agency_settings:agency_id (
            id,
            branding
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add cache busting to logo URLs
      const propertiesWithCacheBusting = data?.map(property => {
        if (property.agency_settings?.branding?.logo) {
          const timestamp = Date.now()
          const branding = {
            ...property.agency_settings.branding,
            logo: {
              ...property.agency_settings.branding.logo
            }
          }
          if (branding.logo.dark) {
            branding.logo.dark = `${branding.logo.dark}?t=${timestamp}`
          }
          if (branding.logo.light) {
            branding.logo.light = `${branding.logo.light}?t=${timestamp}`
          }
          return {
            ...property,
            agency_settings: {
              ...property.agency_settings,
              branding
            }
          }
        }
        return property
      }) || []

      setProperties(propertiesWithCacheBusting)
    } catch (err) {
      console.error('Error loading properties:', err)
      setError(err instanceof Error ? err : new Error('Failed to load properties'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const handleDelete = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (error) throw error

      setProperties(prev => prev.filter(p => p.id !== propertyId))
      toast.success('Property deleted successfully')
    } catch (err) {
      console.error('Error deleting property:', err)
      toast.error('Failed to delete property')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Property
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/admin/properties/${property.id}`} className="group">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {property.name || 'Untitled Property'}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                      {property.content.hero.headline}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {property.suburb}
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.state}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {property.agency_name || 'No Agency'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {property.agent ? (
                    <div>
                      <div className="text-sm text-gray-900">
                        {property.agent.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.agent.position}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No Agent
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    property.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(property.updated_at || property.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                        aria-label="Delete property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this property? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(property.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No properties found. Click &quot;Add Property&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}