import { DashboardWidget } from './DashboardWidget'

export interface SystemHealthMetrics {
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number
  uptime?: string
  responseTime?: number
  errorRate?: number
  activeConnections?: number
}

/**
 * SystemHealth component for displaying system metrics
 */
export function SystemHealth({
  metrics,
  onRefresh,
  isLoading = false,
}: {
  metrics: SystemHealthMetrics
  onRefresh?: () => void
  isLoading?: boolean
}) {
  const getHealthStatus = (percentage: number | undefined) => {
    if (!percentage) return 'unknown'
    if (percentage < 60) return 'healthy'
    if (percentage < 80) return 'warning'
    return 'critical'
  }

  const HealthBar = ({ label, value }: { label: string; value: number | undefined }) => {
    if (!value) return null

    const status = getHealthStatus(value)
    const statusColors = {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500',
      unknown: 'bg-gray-500',
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${statusColors[status]} transition-all duration-300`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <DashboardWidget
      title="System Health"
      icon="⚙️"
      onRefresh={onRefresh}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <HealthBar label="CPU Usage" value={metrics.cpuUsage} />
        <HealthBar label="Memory Usage" value={metrics.memoryUsage} />
        <HealthBar label="Disk Usage" value={metrics.diskUsage} />

        {/* Additional Stats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {metrics.uptime && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="font-semibold text-gray-900 dark:text-white">{metrics.uptime}</span>
            </div>
          )}
          {metrics.responseTime && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">{metrics.responseTime}ms</span>
            </div>
          )}
          {metrics.errorRate !== undefined && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
              <span
                className={`font-semibold ${
                  metrics.errorRate < 1
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metrics.errorRate}%
              </span>
            </div>
          )}
          {metrics.activeConnections && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
              <span className="font-semibold text-gray-900 dark:text-white">{metrics.activeConnections}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardWidget>
  )
}

export default SystemHealth
