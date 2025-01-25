import { useState, useEffect, ChangeEvent } from 'react'
import Image from 'next/image'

interface FileUploadProps {
  label: string
  accept?: string
  value?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  isDarkBg?: boolean
  isFont?: boolean
}

export function FileUpload({ label, accept, value, onChange, isDarkBg, isFont }: FileUploadProps) {
  const [imageExists, setImageExists] = useState(false)
  const [fontFamily, setFontFamily] = useState<string>('')

  useEffect(() => {
    async function checkFile() {
      if (!value) {
        setImageExists(false)
        return
      }

      try {
        const response = await fetch(value, { method: 'HEAD' })
        setImageExists(response.ok)

        if (response.ok && isFont) {
          // Create a unique font family name
          const uniqueFontFamily = `preview-font-${Math.random().toString(36).substr(2, 9)}`
          
          // Create and inject a style element for the font
          const style = document.createElement('style')
          style.textContent = `
            @font-face {
              font-family: '${uniqueFontFamily}';
              src: url('${value}') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
          `
          document.head.appendChild(style)
          setFontFamily(uniqueFontFamily)

          return () => {
            document.head.removeChild(style)
          }
        }
      } catch (error) {
        console.error(`Error checking ${label}:`, error)
        setImageExists(false)
      }
    }

    checkFile()
  }, [value, label, isFont])

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="w-full p-2 border rounded text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {imageExists && (
        <div className={`mt-3 p-4 rounded-lg border ${isDarkBg ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex justify-center">
            {isFont ? (
              <div 
                style={{ fontFamily: fontFamily || 'system-ui' }}
                className={`text-xl ${isDarkBg ? 'text-white' : 'text-gray-900'}`}
              >
                The quick brown fox jumps over the lazy dog
                <div className="text-base mt-1">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                  <br />
                  0123456789
                </div>
              </div>
            ) : (
              <Image
                src={value || '/placeholder-image.png'}
                alt={`Current ${label}`}
                width={64}
                height={64}
                className="h-16 w-auto object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}