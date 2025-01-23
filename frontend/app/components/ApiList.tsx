'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'

interface ApiListProps {
  apis: { id: string; name: string }[]
  selectedApis: { id: string; name: string }[]
  apiSearch: string
  onApiSelect: (api:{id: string, name:string}) => void
  onApiSearchChange: (search: string) => void
  onClose: () => void
  position: { top: number; left: number; bottom: number }
}

export function ApiList({
  apis,
  selectedApis,
  apiSearch,
  onApiSelect,
  onApiSearchChange,
  onClose,
  position
}: ApiListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      ref={ref}
      className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      style={{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
        <div className="flex justify-between items-center">
          <Input
            value={apiSearch}
            onChange={(e) => onApiSearchChange(e.target.value)}
            placeholder="Search APIs..."
            className="w-full mr-2"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close API list"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="p-2">
        {apis.map(api => (
          <div
            key={api.id}
            className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedApis.includes(api) ? 'bg-blue-100' : ''}`}
            onClick={() => onApiSelect(api)}
          >
            {api.name}
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}

