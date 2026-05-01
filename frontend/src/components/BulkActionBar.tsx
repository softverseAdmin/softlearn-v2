import { useState } from 'react'

export interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (action: string) => void | Promise<void>
  actions?: {
    label: string
    action: string
    isDangerous?: boolean
  }[]
  isLoading?: boolean
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions = [],
  isLoading = false,
}: BulkActionBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (selectedCount === 0) return null

  const defaultActions = [
    { label: 'Activate', action: 'activate' },
    { label: 'Deactivate', action: 'deactivate' },
    { label: 'Delete', action: 'delete', isDangerous: true },
  ]

  const allActions = actions.length > 0 ? actions : defaultActions

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-blue-900">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClearSelection}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
        >
          Clear selection
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          Actions
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
            {allActions.map(item => (
              <button
                key={item.action}
                onClick={() => {
                  onBulkAction(item.action)
                  setIsOpen(false)
                }}
                disabled={isLoading}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50 ${
                  item.isDangerous ? 'text-red-600 hover:bg-red-50' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
