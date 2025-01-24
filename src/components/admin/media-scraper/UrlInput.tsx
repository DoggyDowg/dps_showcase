'use client'

import { useState } from 'react'

interface UrlInputProps {
  onSubmit: (url: string) => void
  disabled?: boolean
}

export function UrlInput({ onSubmit, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
      onSubmit(url)
      setUrl('') // Clear the input after successful submission
    } catch (_e) {
      alert('Please enter a valid URL')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter property listing URL"
          className="flex-1 p-2 border rounded"
          required
          disabled={disabled}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Fetch Media
        </button>
      </div>
    </form>
  )
}