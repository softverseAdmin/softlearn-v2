import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider } from '../auth/AuthContext'
import { WorkspaceStateProvider } from '../app/workspace/WorkspaceStateContext'
import { PageTitle } from './PageTitle'
import { AppRouter } from '../router/AppRouter'
import { useServiceWorker, useWebVitals } from '../hooks/usePerformance'

function AppContent() {
  useServiceWorker()
  useWebVitals()

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
      <AuthProvider>
        <WorkspaceStateProvider>
          <AppContent />
        </WorkspaceStateProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
