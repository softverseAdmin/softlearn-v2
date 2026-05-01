import { type ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

/**
 * EmptyState component for displaying empty data states
 */
export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Loading component for skeleton-like loading states
 */
export function SkeletonLoader({
  count = 1,
  type = 'card',
}: {
  count?: number
  type?: 'card' | 'list' | 'table'
}) {
  const items = Array.from({ length: count })

  return (
    <div className="space-y-3">
      {items.map((_, idx) => {
        switch (type) {
          case 'list':
            return (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            )
          case 'table':
            return (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            )
          case 'card':
          default:
            return (
              <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 animate-pulse space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
                </div>
              </div>
            )
        }
      })}
    </div>
  )
}

export default EmptyState
