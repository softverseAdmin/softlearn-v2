import { useState } from 'react'

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * AlertNotification component for displaying single alerts
 */
export function AlertNotification({
  alert,
  onDismiss,
}: {
  alert: Alert
  onDismiss?: (id: string) => void
}) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  }

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✓',
  }

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-4 ${styles[alert.type]}`}>
      <span className="text-xl flex-shrink-0">{icons[alert.type]}</span>

      <div className="flex-1">
        <h3 className="font-semibold mb-1">{alert.title}</h3>
        <p className="text-sm opacity-90">{alert.message}</p>
        <p className="text-xs opacity-75 mt-1">{alert.timestamp.toLocaleTimeString()}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {alert.action && (
          <button
            onClick={alert.action.onClick}
            className="text-sm font-medium px-3 py-1 rounded hover:opacity-80 transition-opacity"
          >
            {alert.action.label}
          </button>
        )}
        {alert.dismissible !== false && onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-xl hover:opacity-60 transition-opacity"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * AlertCenter component for managing multiple alerts
 */
export function AlertCenter({
  alerts,
  onDismiss,
  maxVisible = 5,
}: {
  alerts: Alert[]
  onDismiss?: (id: string) => void
  maxVisible?: number
}) {
  const [expanded, setExpanded] = useState(false)

  const visibleAlerts = expanded ? alerts : alerts.slice(0, maxVisible)
  const hiddenCount = Math.max(0, alerts.length - maxVisible)

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] z-50 space-y-2">
      {visibleAlerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
        />
      ))}

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          {expanded ? 'Hide' : `Show ${hiddenCount} more alert${hiddenCount !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}

/**
 * useAlerts hook for managing alert state
 */
export function useAlerts(maxAlerts = 10) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = (
    type: Alert['type'],
    title: string,
    message: string,
    options?: {
      dismissible?: boolean
      duration?: number
      action?: Alert['action']
    }
  ) => {
    const id = `${Date.now()}-${Math.random()}`
    const alert: Alert = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    }

    setAlerts((prev) => [...prev.slice(-maxAlerts + 1), alert])

    // Auto-dismiss after duration
    if (options?.duration) {
      setTimeout(() => dismissAlert(id), options.duration)
    }

    return id
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const clearAll = () => {
    setAlerts([])
  }

  return {
    alerts,
    addAlert,
    dismissAlert,
    clearAll,
    info: (title: string, message: string, opts?: Parameters<typeof addAlert>[3]) =>
      addAlert('info', title, message, opts),
    warning: (title: string, message: string, opts?: Parameters<typeof addAlert>[3]) =>
      addAlert('warning', title, message, opts),
    error: (title: string, message: string, opts?: Parameters<typeof addAlert>[3]) =>
      addAlert('error', title, message, opts),
    success: (title: string, message: string, opts?: Parameters<typeof addAlert>[3]) =>
      addAlert('success', title, message, opts),
  }
}

export default AlertNotification
