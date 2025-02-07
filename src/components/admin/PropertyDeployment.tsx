'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Property } from '@/types/property'
import { toast } from 'sonner'

interface PropertyDeploymentProps {
  property: Property
  onSave?: () => void
}

type DeploymentStatus = 'idle' | 'validating' | 'deploying' | 'deployed' | 'failed'

export default function PropertyDeployment({ property, onSave }: PropertyDeploymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customDomain, setCustomDomain] = useState(property.custom_domain || '')
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>('idle')
  const [isValidatingDomain, setIsValidatingDomain] = useState(false)
  const [domainError, setDomainError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Load current deployment status
  useEffect(() => {
    async function checkDeploymentStatus() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('status, custom_domain')
          .eq('id', property.id)
          .single()

        if (error) throw error

        // Set initial deployment status based on property status
        setDeploymentStatus(data.status === 'published' ? 'deployed' : 'idle')
        setCustomDomain(data.custom_domain || '')
      } catch (err) {
        console.error('Error checking deployment status:', err)
        setError('Failed to load deployment status')
      }
    }

    checkDeploymentStatus()
  }, [property.id, supabase])

  // Validate domain format
  const validateDomain = (domain: string): boolean => {
    // Basic domain format validation
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/
    return domainRegex.test(domain)
  }

  // Handle domain change
  const handleDomainChange = (domain: string) => {
    setCustomDomain(domain)
    setDomainError(null)
    
    if (domain && !validateDomain(domain)) {
      setDomainError('Please enter a valid domain (e.g., example.com)')
    }
  }

  // Check domain availability and DNS configuration
  const checkDomainAvailability = async (domain: string): Promise<boolean> => {
    try {
      setIsValidatingDomain(true)
      
      // Check if domain is already in use by another property
      const { data: existingProperty, error } = await supabase
        .from('properties')
        .select('id')
        .eq('custom_domain', domain)
        .neq('id', property.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is what we want
        throw error
      }

      if (existingProperty) {
        setDomainError('This domain is already in use by another property')
        return false
      }

      // TODO: Add DNS verification here
      // For now, we'll just simulate a check
      await new Promise(resolve => setTimeout(resolve, 1000))

      return true
    } catch (err) {
      console.error('Error checking domain availability:', err)
      setDomainError('Failed to verify domain availability')
      return false
    } finally {
      setIsValidatingDomain(false)
    }
  }

  // Save custom domain
  const saveDomain = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ custom_domain: customDomain })
        .eq('id', property.id)

      if (error) throw error

      toast.success('Custom domain saved successfully')
      onSave?.()
    } catch (err) {
      console.error('Error saving custom domain:', err)
      toast.error('Failed to save custom domain')
      throw err
    }
  }

  // Handle deployment
  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)
      setDeploymentStatus('validating')

      // Validate domain if provided
      if (customDomain) {
        if (!validateDomain(customDomain)) {
          setDomainError('Please enter a valid domain')
          setDeploymentStatus('failed')
          return
        }

        const isDomainAvailable = await checkDomainAvailability(customDomain)
        if (!isDomainAvailable) {
          setDeploymentStatus('failed')
          return
        }

        // Save the domain
        await saveDomain()
      }

      setDeploymentStatus('deploying')

      // Call deployment API
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          customDomain
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Deployment failed')
      }

      setDeploymentStatus('deployed')
      toast.success('Property deployed successfully')
      onSave?.()
    } catch (err) {
      console.error('Deployment error:', err)
      setError(err instanceof Error ? err.message : 'Failed to deploy property')
      setDeploymentStatus('failed')
      toast.error('Deployment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Property Deployment</h2>
        <button
          onClick={handleDeploy}
          disabled={loading || !!domainError || isValidatingDomain}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Deploying...' : 'Deploy Property'}
        </button>
      </div>

      {/* Custom Domain Input */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Custom Domain</h3>
        <div className="space-y-2">
          <div className="flex gap-4">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              placeholder="Enter your domain (e.g., property.example.com)"
              className={`flex-1 p-2 border rounded ${
                domainError ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isValidatingDomain}
            />
          </div>
          {domainError && (
            <p className="text-sm text-red-600">{domainError}</p>
          )}
          {isValidatingDomain && (
            <p className="text-sm text-blue-600">Validating domain...</p>
          )}
          <p className="text-sm text-gray-500">
            Make sure to configure your DNS settings to point to our servers before deploying.
          </p>
        </div>
      </div>

      {/* Deployment Status */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-medium mb-4">Deployment Status</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              deploymentStatus === 'deployed' ? 'bg-green-500' :
              deploymentStatus === 'deploying' ? 'bg-blue-500 animate-pulse' :
              deploymentStatus === 'failed' ? 'bg-red-500' :
              'bg-gray-300'
            }`} />
            <span className="capitalize">{deploymentStatus}</span>
          </div>
          
          <div className="text-sm space-y-2">
            <p>Property ID: {property.id}</p>
            {customDomain && (
              <p>Custom Domain: {customDomain}</p>
            )}
            <p>Default URL: {`https://${property.id}.yourdomain.com`}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* DNS Configuration Guide */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-medium mb-4">DNS Configuration Guide</h3>
        <div className="space-y-4 text-sm">
          <p>To use a custom domain, add these DNS records to your domain provider:</p>
          <div className="bg-white p-4 rounded border border-blue-100">
            <pre className="text-sm">
              {`Type: CNAME
Record: ${customDomain || 'your-domain.com'}
Value: properties.yourdomain.com
TTL: 3600`}
            </pre>
          </div>
          <p className="text-blue-600">
            Note: DNS changes can take up to 48 hours to propagate globally.
          </p>
        </div>
      </div>
    </div>
  )
} 