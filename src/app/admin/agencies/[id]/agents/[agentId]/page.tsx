'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Agent } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { UserCircle2 } from 'lucide-react'
import { AgencySelect } from '@/components/shared/AgencySelect'

// Initial agent state without ID
const initialAgent: Omit<Agent, 'id'> = {
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  agency_id: '',
  name: '',
  email: '',
  phone: '',
  position: '',
  status: 'active',
  metadata: {}
}

export default function AgentEditPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [agent, setAgent] = useState<Agent>({ ...initialAgent, id: '', agency_id: params.id } as Agent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    async function loadAgent() {
      if (params.agentId === 'new') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', params.agentId)
          .single()

        if (error) throw error

        if (data) {
          setAgent(data)
        }
      } catch (err) {
        console.error('Error loading agent:', err)
        setError(err instanceof Error ? err : new Error('Failed to load agent'))
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [supabase, params.agentId, params.id])

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadProgress(0)
      setError(null)

      console.log('Starting avatar upload:', {
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name
      })

      // Check file size (2MB limit)
      const MAX_SIZE = 2 * 1024 * 1024 // 2MB in bytes
      if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds 2MB limit')
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${agent.id}/avatar-${Date.now()}.${fileExt}`
      console.log('Generated filename:', fileName)

      // Upload file
      console.log('Attempting to upload to Supabase storage...')
      const { data, error } = await supabase.storage
        .from('agent-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Supabase storage upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('agent-assets')
        .getPublicUrl(data.path)

      console.log('Generated public URL:', urlData)

      setAgent(prev => ({
        ...prev,
        avatar_url: urlData.publicUrl
      }))

      setUploadProgress(100)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err : new Error('Failed to upload avatar'))
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agent) return

    try {
      setSaving(true)
      setError(null)

      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'position']
      const missingFields = requiredFields.filter(field => !agent[field])
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      const updatedAgent = {
        ...agent,
        id: params.agentId === 'new' ? uuidv4() : agent.id,
        updated_at: new Date().toISOString(),
        created_at: params.agentId === 'new' ? new Date().toISOString() : agent.created_at
      }

      const isNew = params.agentId === 'new'
      const { data, error } = isNew
        ? await supabase.from('agents').insert([updatedAgent]).select()
        : await supabase
            .from('agents')
            .update(updatedAgent)
            .eq('id', updatedAgent.id)
            .select()

      if (error) {
        throw new Error(`Failed to save agent: ${error.message}`)
      }

      router.push(`/admin/agencies/${params.id}/agents`)
    } catch (err) {
      console.error('Error saving agent:', err)
      setError(err instanceof Error ? err : new Error('Failed to save agent'))
    } finally {
      setSaving(false)
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {params.agentId === 'new' ? 'New Agent' : 'Edit Agent'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                type="text"
                value={agent.position}
                onChange={(e) => setAgent({ ...agent, position: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={agent.email}
                onChange={(e) => setAgent({ ...agent, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={agent.phone}
                onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={agent.status}
                onChange={(e) => setAgent({ ...agent, status: e.target.value as 'active' | 'inactive' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Agency
              </label>
              <AgencySelect
                value={agent.agency_id}
                onChange={(value) => setAgent({ ...agent, agency_id: value })}
              />
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {agent.avatar_url ? (
                <Image
                  src={agent.avatar_url}
                  alt={`${agent.name} avatar`}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <UserCircle2 className="w-24 h-24 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleAvatarUpload(file)
                  }
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-600 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Upload a profile picture. Maximum size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/admin/agencies/${params.id}/agents`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </form>
    </div>
  )
} 