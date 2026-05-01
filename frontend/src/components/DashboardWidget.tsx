import { useState } from 'react'
import { type ReactNode } from 'react'

export interface DashboardMetric {
  label: string
  value: string | number
  trend?: number
  unit?: string
  icon?: ReactNode
}

export interface DashboardWidgetProps {
  title: string
  children: ReactNode
  onRefresh?: () => void
  isLoading?: boolean
  icon?: ReactNode
}

/**
 * MetricCard component for displaying KPIs
 */
export function MetricCard({
  label,
  value,
  trend,
  unit = '',
  icon,
}: DashboardMetric) {
  const isTrendPositive = trend && trend > 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {unit && <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>}
          </div>
          {trend !== undefined && (
            <p
              className={`text-sm font-medium mt-2 ${
                isTrendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isTrendPositive ? '↑' : '↓'} {Math.abs(trend)}% vs last period
            </p>
          )}
        </div>
        {icon && <div className="text-4xl opacity-20">{icon}</div>}
      </div>
    </div>
  )
}

/**
 * DashboardWidget component for dashboard panels
 */
export function DashboardWidget({
  title,
  children,
  onRefresh,
  isLoading = false,
  icon,
}: DashboardWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
            aria-label="Refresh widget"
            title="Refresh"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

/**
 * DashboardGrid component for organizing widgets
 */
export function DashboardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode
  columns?: number
}) {
  return (
    <div
      className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${
        columns >= 3 ? 'lg:grid-cols-3' : ''
      } xl:grid-cols-${columns}`}
    >
      {children}
    </div>
  )
}

/**
 * StatRow component for displaying metrics in a list format
 */
export function StatRow({
  label,
  value,
  subtext,
  icon,
}: {
  label: string
  value: string | number
  subtext?: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl opacity-60">{icon}</span>}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
          {subtext && <p className="text-xs text-gray-500 dark:text-gray-400">{subtext}</p>}
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export default DashboardWidget
