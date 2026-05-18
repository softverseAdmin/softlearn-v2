import { useEffect } from 'react'
import { observeWebVitals, type WebVitals, logBundleSize } from '../lib/performance'
import { buildApiUrl } from '../lib/api'

/**
 * Hook for registering service worker
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000)
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])
}

/**
 * Hook for monitoring Web Vitals
 */
export function useWebVitals(onVitals?: (vitals: WebVitals) => void) {
  useEffect(() => {
    observeWebVitals(vitals => {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('Web Vitals:', vitals)
      }

      // Send to analytics in production
      if (import.meta.env.PROD && onVitals) {
        onVitals(vitals)
      }

      // Send to server for monitoring
      if (vitals.lcp) {
        navigator.sendBeacon(buildApiUrl('metrics/web-vitals'), JSON.stringify(vitals))
      }
    })
  }, [onVitals])
}

/**
 * Hook for reporting bundle size and performance metrics
 */
export function usePerformanceMetrics() {
  useEffect(() => {
    // Log bundle size and performance metrics in development
    if (import.meta.env.DEV) {
      logBundleSize()
    }

    // Monitor page visibility and pause non-essential work when hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden - pausing non-essential work')
      } else {
        console.log('Page visible - resuming work')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
}

/**
 * Hook for monitoring network status
 */
export function useNetworkStatus() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online')
    }

    const handleOffline = () => {
      console.log('Offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
}
