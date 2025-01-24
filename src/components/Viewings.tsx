'use client'

import { siteContent } from '@/config/content'
import { useState } from 'react'
import { useUpcomingViewing } from '@/hooks/useUpcomingViewing'
import { useHeroVideo } from '@/hooks/useHeroVideo'
import { format } from 'date-fns'
import type { Property } from '@/types/property'

interface ViewingsProps {
  property: Property
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function Viewings({ property }: ViewingsProps) {
  const { viewings } = siteContent
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const { upcomingViewing, loading } = useUpcomingViewing(property.id)
  const { videoUrl: backgroundVideoUrl } = useHeroVideo(property.id)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  // Format the viewing date and time if available
  const formattedViewing = upcomingViewing ? {
    date: format(new Date(upcomingViewing.viewing_datetime), 'EEEE, MMMM do'),
    time: format(new Date(upcomingViewing.viewing_datetime), 'h:mm a')
  } : null

  return (
    <section id="viewings" className="relative py-20">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {backgroundVideoUrl ? (
          <video
            className="absolute h-[100vh] w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{ position: 'fixed', top: 0, left: 0, zIndex: -20 }}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-brand-dark" />
        )}
        <div className="absolute inset-0 bg-brand-dark/50 -z-10" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center">
        <h2 className="text-4xl font-light text-brand-light mb-8 text-center">{viewings.title}</h2>

        {/* Combined Viewing Form */}
        <div className="max-w-[500px] min-w-[280px]">
          <div 
            className="backdrop-blur-[12px] p-8 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(var(--brand-light-rgb), 0.7)' }}
          >
            {/* Next Viewing Section */}
            <div className="text-brand-dark mb-6">
              <h3 className="text-2xl font-light mb-4">{viewings.nextViewing.title}</h3>
              {loading ? (
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
              ) : formattedViewing ? (
                <p className="text-xl mb-8">{formattedViewing.date} at {formattedViewing.time}</p>
              ) : (
                <p className="text-xl mb-8">No upcoming viewings scheduled. Check back soon.</p>
              )}
            </div>

            <hr className="border-t border-brand-light mb-8" />

            {/* Private Viewing Form */}
            <div>
              <h3 className="text-2xl font-light mb-4 text-brand-dark">{viewings.privateViewing.title}</h3>
              <p className="mb-6 text-brand-dark">{viewings.privateViewing.description}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-brand-dark"
                  >
                    {viewings.privateViewing.formLabels.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-brand-dark"
                  >
                    {viewings.privateViewing.formLabels.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-brand-dark"
                  >
                    {viewings.privateViewing.formLabels.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-brand-dark"
                  >
                    {viewings.privateViewing.formLabels.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-dark text-brand-light py-3 rounded hover:bg-brand-dark/90 transition-colors"
                >
                  {viewings.privateViewing.submitButton}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 