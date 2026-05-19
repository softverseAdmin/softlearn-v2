import { useEffect } from 'react'
import { observeWebVitals, type WebVitals } from '../lib/performance'

export function useServiceWorker() {
  useEffect(() => {
    let updateInterval: ReturnType<typeof window.setInterval> | null = null

    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          updateInterval = window.setInterval(() => {
            registration.update()
          }, 60000)
        })
        .catch(() => {})
    }

    return () => {
      if (updateInterval !== null) {
        window.clearInterval(updateInterval)
      }
    }
  }, [])
}

export function useWebVitals(onVitals?: (vitals: WebVitals) => void) {
  useEffect(() => {
    const stopObserving = observeWebVitals((vitals) => {
      if (import.meta.env.PROD && onVitals) {
        onVitals(vitals)
      }
    })

    return () => {
      stopObserving()
    }
  }, [onVitals])
}
