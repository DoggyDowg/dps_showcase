'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { templateManager } from '@/lib/templateManager'
import type { TemplateVersion, PropertyTemplate } from '@/types/template'

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<PropertyTemplate[]>([])
  const [newVersion, setNewVersion] = useState<TemplateVersion>({
    major: 1,
    minor: 0,
    patch: 0,
    created_at: new Date().toISOString(),
    changes: [],
    is_stable: false
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleCreateVersion = async () => {
    try {
      const version = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`
      const template: PropertyTemplate = {
        version,
        components: [],
        schema: {},
        migrations: [],
        created_at: new Date().toISOString(),
        changes: newVersion.changes,
        is_stable: newVersion.is_stable
      }

      const { error } = await supabase
        .from('templates')
        .insert({
          version,
          major: newVersion.major,
          minor: newVersion.minor,
          patch: newVersion.patch,
          is_stable: newVersion.is_stable,
          changes: newVersion.changes,
          created_at: template.created_at
        })

      if (error) throw error

      templateManager.registerTemplate(template)
      await loadTemplates()

      // Reset form after successful creation
      setNewVersion({
        major: 1,
        minor: 0,
        patch: 0,
        created_at: new Date().toISOString(),
        changes: [],
        is_stable: false
      })
    } catch (error) {
      console.error('Error creating template version:', error)
    }
  }

  const handleMarkStable = async (version: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ is_stable: true })
        .eq('version', version)

      if (error) throw error

      await loadTemplates()
    } catch (error) {
      console.error('Error marking template as stable:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Template Management</h1>

      {/* Create New Version */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Version</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Major</label>
            <input
              type="number"
              value={newVersion.major}
              onChange={(e) => setNewVersion(prev => ({ ...prev, major: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minor</label>
            <input
              type="number"
              value={newVersion.minor}
              onChange={(e) => setNewVersion(prev => ({ ...prev, minor: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Patch</label>
            <input
              type="number"
              value={newVersion.patch}
              onChange={(e) => setNewVersion(prev => ({ ...prev, patch: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Changes</label>
          <textarea
            value={newVersion.changes.join('\n')}
            onChange={(e) => setNewVersion(prev => ({ ...prev, changes: e.target.value.split('\n').filter(Boolean) }))}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Enter changes (one per line)"
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={newVersion.is_stable}
            onChange={(e) => setNewVersion(prev => ({ ...prev, is_stable: e.target.checked }))}
            className="mr-2"
          />
          <label className="text-sm font-medium">Mark as stable</label>
        </div>
        <button
          onClick={handleCreateVersion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Version
        </button>
      </div>

      {/* Template List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Template Versions</h2>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.version}
                className="border p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">Version {template.version}</h3>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                  {template.changes?.length > 0 && (
                    <ul className="text-sm text-gray-600 mt-2">
                      {template.changes.map((change: string, i: number) => (
                        <li key={i}>• {change}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {template.is_stable ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Stable
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkStable(template.version)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                    >
                      Mark Stable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}