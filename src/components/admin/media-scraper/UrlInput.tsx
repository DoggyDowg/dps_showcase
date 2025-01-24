'use client'

import { useState } from 'react'

interface UrlInputProps {
  onSubmit: (url: string) => void
}

export function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
      onSubmit(url)
    } catch (e) {
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
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fetch Media
        </button>
      </div>
    </form>
  )
} 