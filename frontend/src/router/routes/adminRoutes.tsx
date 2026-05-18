import { Route } from 'react-router-dom'

import { loadableNamed } from '@/router/loadable'

const DashboardPage = loadableNamed(() => import('@/pages/DashboardPage'), 'DashboardPage')
const NotificationsPage = loadableNamed(() => import('@/features/notifications/NotificationsPage'), 'NotificationsPage')
const AdminUsersPage = loadableNamed(() => import('@/features/admin/AdminUsersPage'), 'AdminUsersPage')
const AdminCompaniesPage = loadableNamed(() => import('@/features/admin/AdminCompaniesPage'), 'AdminCompaniesPage')
const AdminCoursesPage = loadableNamed(() => import('@/features/admin/AdminCoursesPage'), 'AdminCoursesPage')
const AdminCourseLessonsPage = loadableNamed(() => import('@/features/admin/AdminCourseLessonsPage'), 'AdminCourseLessonsPage')
const AdminExamsPage = loadableNamed(() => import('@/features/admin/AdminExamsPage'), 'AdminExamsPage')
const AdminExamQuestionsPage = loadableNamed(() => import('@/features/admin/AdminExamQuestionsPage'), 'AdminExamQuestionsPage')
const AdminVacanciesPage = loadableNamed(() => import('@/features/admin/AdminVacanciesPage'), 'AdminVacanciesPage')

export function renderAdminRoutes() {
  return (
    <>
      <Route path="/admin" element={<DashboardPage role="admin" />} />
      <Route path="/admin/notifications" element={<NotificationsPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/operations" element={<AdminCompaniesPage />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/courses/:courseId/lessons" element={<AdminCourseLessonsPage />} />
      <Route path="/admin/exams" element={<AdminExamsPage />} />
      <Route path="/admin/exams/:examId/questions" element={<AdminExamQuestionsPage />} />
      <Route path="/admin/vacancies" element={<AdminVacanciesPage />} />
    </>
  )
}
