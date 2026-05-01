import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'

import { AuthProvider } from '../auth/AuthContext'
import { PageTitle } from './PageTitle'
import { AppRouter } from '../router/AppRouter'
import { useServiceWorker, useWebVitals, usePerformanceMetrics, useNetworkStatus } from '../hooks/usePerformance'

function App() {
  // Initialize performance monitoring and optimization
  useServiceWorker()
  useWebVitals()
  usePerformanceMetrics()
  useNetworkStatus()

  useEffect(() => {
    // Preload critical resources
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = '/assets/recharts.js'
    document.head.appendChild(link)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <PageTitle />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
