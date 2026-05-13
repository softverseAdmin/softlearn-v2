import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../auth/ThemeContext'
import { PageTitle } from './PageTitle'
import { AppRouter } from '../router/AppRouter'
import { useServiceWorker, useWebVitals, usePerformanceMetrics, useNetworkStatus } from '../hooks/usePerformance'

function AppContent() {
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
    <>
      <PageTitle />
      <Toaster position="bottom-center" richColors duration={3000} />
      <AppRouter />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
