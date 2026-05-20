import { Route, Routes } from 'react-router-dom'

import { PublicLayout } from '../layouts/PublicLayout'
import { ProtectedGuard, PublicOnlyGuard, RoleGuard } from './guards'
import { AppLayoutWrapper } from './AppLayoutWrapper'
import { renderAdminRoutes } from './routes/adminRoutes'
import { renderCompanyRoutes } from './routes/companyRoutes'
import { renderPublicRoutes } from './routes/publicRoutes'
import { renderStudentRoutes } from './routes/studentRoutes'
import { renderTeacherRoutes } from './routes/teacherRoutes'
import { loadableNamed } from './loadable'

const NotFoundPage = loadableNamed(() => import('../pages/NotFoundPage'), 'NotFoundPage')
const UnauthorizedPage = loadableNamed(() => import('../pages/UnauthorizedPage'), 'UnauthorizedPage')

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyGuard />}>
        <Route element={<PublicLayout />}>
          {renderPublicRoutes()}
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedGuard />}>
        <Route element={<AppLayoutWrapper />}>
          <Route element={<RoleGuard role="student" />}>
            {renderStudentRoutes()}
          </Route>

          <Route element={<RoleGuard role="company" />}>
            {renderCompanyRoutes()}
          </Route>

          <Route element={<RoleGuard role="teacher" />}>
            {renderTeacherRoutes()}
          </Route>

          <Route element={<RoleGuard role="admin" />}>
            {renderAdminRoutes()}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
