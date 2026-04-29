import { Route, Routes } from 'react-router-dom'

import { AdminCompaniesPage } from '../features/admin/AdminCompaniesPage'
import { AdminUsersPage } from '../features/admin/AdminUsersPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { AppLayout } from '../layouts/AppLayout'
import { CompanyCandidateDetailPage } from '../features/profile/CompanyCandidateDetailPage'
import { CompanyCandidatesPage } from '../features/profile/CompanyCandidatesPage'
import { CompanyInterviewDetailPage } from '../features/profile/CompanyInterviewDetailPage'
import { CompanyInterviewsPage } from '../features/profile/CompanyInterviewsPage'
import { CompanyProfilePage } from '../features/profile/CompanyProfilePage'
import { CompanyShortlistPage } from '../features/profile/CompanyShortlistPage'
import { CompanyVacanciesPage } from '../features/profile/CompanyVacanciesPage'
import { StudentExamResultsPage } from '../features/profile/StudentExamResultsPage'
import { StudentInterviewDetailPage } from '../features/profile/StudentInterviewDetailPage'
import { StudentInterviewsPage } from '../features/profile/StudentInterviewsPage'
import { StudentLearningPage } from '../features/profile/StudentLearningPage'
import { StudentPrivacySettingsPage } from '../features/profile/StudentPrivacySettingsPage'
import { StudentProfilePage } from '../features/profile/StudentProfilePage'
import { StudentSkillsPage } from '../features/profile/StudentSkillsPage'
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
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/skills" element={<StudentSkillsPage />} />
            <Route path="/student/learning" element={<StudentLearningPage />} />
            <Route path="/student/exams" element={<StudentExamResultsPage />} />
            <Route path="/student/interviews" element={<StudentInterviewsPage />} />
            <Route path="/student/interviews/:interviewId" element={<StudentInterviewDetailPage />} />
            <Route path="/student/privacy" element={<StudentPrivacySettingsPage />} />
          </Route>

          <Route element={<RoleGuard role="company" />}>
            <Route path="/company" element={<DashboardPage role="company" />} />
            <Route path="/company/notifications" element={<NotificationsPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/candidates" element={<CompanyCandidatesPage />} />
            <Route path="/company/candidates/:candidateAccessId" element={<CompanyCandidateDetailPage />} />
            <Route path="/company/interviews" element={<CompanyInterviewsPage />} />
            <Route path="/company/interviews/:interviewId" element={<CompanyInterviewDetailPage />} />
            <Route path="/company/shortlist" element={<CompanyShortlistPage />} />
            <Route path="/company/vacancies" element={<CompanyVacanciesPage />} />
          </Route>

          <Route element={<RoleGuard role="admin" />}>
            <Route path="/admin" element={<DashboardPage role="admin" />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/operations" element={<AdminCompaniesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
