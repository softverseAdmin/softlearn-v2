import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { FullPageState } from '../components/FullPageState'
import { getHomePath } from './navigation'
import type { UserRole } from '../auth/types'

export function PublicOnlyGuard() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <FullPageState title="Restoring session" description="Checking your session and loading the right experience." />
  }

  if (status === 'authenticated') {
    return <Navigate to={getHomePath(user)} replace />
  }

  return <Outlet />
}

export function ProtectedGuard() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageState title="Restoring session" description="Checking your session and loading the right experience." />
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RoleGuard({ role }: { role: UserRole }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
