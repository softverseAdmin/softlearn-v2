import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '../auth/AuthContext'
import { PageTitle } from './PageTitle'
import { AppRouter } from '../router/AppRouter'

function App() {
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
