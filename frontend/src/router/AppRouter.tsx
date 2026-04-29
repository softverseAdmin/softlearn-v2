import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignupPage } from '../pages/SignupPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { ProtectedGuard, PublicOnlyGuard, RoleGuard } from './guards'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyGuard />}>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedGuard />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleGuard role="student" />}>
            <Route path="/student" element={<DashboardPage role="student" />} />
            <Route path="/student/profile" element={<DashboardPage role="student" />} />
            <Route path="/student/learning" element={<DashboardPage role="student" />} />
          </Route>

          <Route element={<RoleGuard role="company" />}>
            <Route path="/company" element={<DashboardPage role="company" />} />
            <Route path="/company/candidates" element={<DashboardPage role="company" />} />
            <Route path="/company/vacancies" element={<DashboardPage role="company" />} />
          </Route>

          <Route element={<RoleGuard role="admin" />}>
            <Route path="/admin" element={<DashboardPage role="admin" />} />
            <Route path="/admin/users" element={<DashboardPage role="admin" />} />
            <Route path="/admin/operations" element={<DashboardPage role="admin" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
