import { Route, Routes } from 'react-router-dom'

import { AdminCompaniesPage } from '../features/admin/AdminCompaniesPage'
import { AdminCoursesPage } from '../features/admin/AdminCoursesPage'
import { AdminCourseLessonsPage } from '../features/admin/AdminCourseLessonsPage'
import { AdminExamsPage } from '../features/admin/AdminExamsPage'
import { AdminExamQuestionsPage } from '../features/admin/AdminExamQuestionsPage'
import { AdminVacanciesPage } from '../features/admin/AdminVacanciesPage'
import { AdminUsersPage } from '../features/admin/AdminUsersPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { CompanyApplicationsPage } from '../features/profile/CompanyApplicationsPage'
import { CompanyCandidateDetailPage } from '../features/profile/CompanyCandidateDetailPage'
import { CompanyCandidatesPage } from '../features/profile/CompanyCandidatesPage'
import { CompanyCourseCatalogPage } from '../features/profile/CompanyCourseCatalogPage'
import { CompanyCourseEditorPage } from '../features/profile/CompanyCourseEditorPage'
import { CompanyCourseLessonsPage } from '../features/profile/CompanyCourseLessonsPage'
import { CompanyInterviewDetailPage } from '../features/profile/CompanyInterviewDetailPage'
import { CompanyInterviewsPage } from '../features/profile/CompanyInterviewsPage'
import { CompanyMessagesPage } from '../features/profile/CompanyMessagesPage'
import { CompanyPostJobsPage } from '../features/profile/CompanyPostJobsPage'
import { CompanyProfilePage } from '../features/profile/CompanyProfilePage'
import { CompanyShortlistPage } from '../features/profile/CompanyShortlistPage'
import { CompanyVacancyMatchesPage } from '../features/profile/CompanyVacancyMatchesPage'
import { CompanyVacanciesPage } from '../features/profile/CompanyVacanciesPage'
import { StudentApplicationsPage } from '../features/profile/StudentApplicationsPage'
import { StudentCourseCatalogPage, StudentWishlistedCoursesPage } from '../features/profile/StudentCourseCatalogPage'
import { StudentCourseDetailPage } from '../features/profile/StudentCourseDetailPage'
import { StudentExamPage } from '../features/profile/StudentExamPage'
import StudentExamResultsPage from '../features/profile/StudentExamResultsPage'
import { StudentInterviewDetailPage } from '../features/profile/StudentInterviewDetailPage'
import { StudentInterviewsPage } from '../features/profile/StudentInterviewsPage'
import { StudentJobDetailPage } from '../features/profile/StudentJobDetailPage'
import { StudentJobsPage, StudentSavedJobsPage } from '../features/profile/StudentJobsPage'
import { StudentLessonPage } from '../features/profile/StudentLessonPage'
import { StudentLearningPage } from '../features/profile/StudentLearningPage'
import { StudentMatchesPage } from '../features/profile/StudentMatchesPage'
import { StudentMockExamPage } from '../features/profile/StudentMockExamPage'
import { StudentMessagesPage } from '../features/profile/StudentMessagesPage'
import { StudentPreparationPage } from '../features/profile/StudentPreparationPage'
import { StudentPrivacySettingsPage } from '../features/profile/StudentPrivacySettingsPage'
import { StudentProfilePage } from '../features/profile/StudentProfilePage'
import { StudentSkillsPage } from '../features/profile/StudentSkillsPage'
import { StudentWorkHistoryPage } from '../features/profile/StudentWorkHistoryPage'
import { StudentWorkspacePlaceholderPage } from '../features/profile/StudentWorkspacePlaceholderPage'
import { ExamCategoryPage } from '../features/learning/ExamCategoryPage'
import { PracticeQuestionPage } from '../features/learning/PracticeQuestionPage'
import { MockExamPage } from '../features/learning/MockExamPage'
import { StudyPlanPage } from '../features/learning/StudyPlanPage'
import { PerformancePage } from '../features/learning/PerformancePage'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignupPage } from '../pages/SignupPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { ProtectedGuard, PublicOnlyGuard, RoleGuard } from './guards'
import { AppLayoutWrapper } from './AppLayoutWrapper'

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
        <Route element={<AppLayoutWrapper />}>
          <Route element={<RoleGuard role="student" />}>
            <Route path="/student" element={<DashboardPage role="student" />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/messages" element={<StudentMessagesPage />} />
            <Route path="/student/matches" element={<StudentMatchesPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/skills" element={<StudentSkillsPage />} />
            <Route path="/student/courses" element={<StudentCourseCatalogPage />} />
            <Route path="/student/courses/wishlist" element={<StudentWishlistedCoursesPage />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetailPage />} />
            <Route path="/student/courses/:courseId/lessons/:lessonId" element={<StudentLessonPage />} />
            <Route path="/student/jobs" element={<StudentJobsPage />} />
            <Route path="/student/jobs/saved" element={<StudentSavedJobsPage />} />
            <Route path="/student/jobs/:vacancyId" element={<StudentJobDetailPage />} />
            <Route path="/student/learning" element={<StudentLearningPage />} />
            <Route path="/student/preparation" element={<StudentPreparationPage />} />
            <Route path="/student/exams" element={<StudentExamResultsPage />} />
            <Route path="/student/exams/:examId" element={<StudentExamPage />} />
            <Route path="/student/mock-exams/:examId" element={<StudentMockExamPage />} />
            <Route path="/student/interviews" element={<StudentInterviewsPage />} />
            <Route path="/student/interviews/:interviewId" element={<StudentInterviewDetailPage />} />
            <Route path="/student/privacy" element={<StudentPrivacySettingsPage />} />
            <Route path="/student/mock-interviews" element={<StudentWorkspacePlaceholderPage title="Mock Interviews" description="Mock interview scheduling and coaching will live here. The work history workspace is ready now and can be used to improve future interview context." />} />
            <Route path="/student/community" element={<StudentWorkspacePlaceholderPage title="Community" description="Community discussions and peer collaboration will be added here without changing the protected student workspace shell." />} />
            <Route path="/student/resume" element={<StudentWorkHistoryPage />} />
            <Route path="/student/work-history" element={<StudentWorkHistoryPage />} />
            <Route path="/student/documents" element={<StudentWorkHistoryPage />} />
            <Route path="/student/certificates" element={<StudentWorkspacePlaceholderPage title="Certificates" description="Certificate management will be added here later. Your current work history documents remain available in the document workspace." />} />
            <Route path="/learning/categories" element={<ExamCategoryPage />} />
            <Route path="/learning/practice/:examId" element={<PracticeQuestionPage />} />
            <Route path="/learning/mock-exams/:examId" element={<MockExamPage />} />
            <Route path="/learning/study-plan" element={<StudyPlanPage />} />
            <Route path="/learning/performance" element={<PerformancePage />} />
          </Route>

          <Route element={<RoleGuard role="company" />}>
            <Route path="/company" element={<DashboardPage role="company" />} />
            <Route path="/company/notifications" element={<NotificationsPage />} />
            <Route path="/company/messages" element={<CompanyMessagesPage />} />
            <Route path="/company/applications" element={<CompanyApplicationsPage />} />
            <Route path="/company/courses" element={<CompanyCourseCatalogPage />} />
            <Route path="/company/courses/new" element={<CompanyCourseEditorPage mode="create" />} />
            <Route path="/company/courses/:courseId/edit" element={<CompanyCourseEditorPage mode="edit" />} />
            <Route path="/company/courses/:courseId/lessons" element={<CompanyCourseLessonsPage />} />
            <Route path="/company/jobs" element={<CompanyPostJobsPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/candidates" element={<CompanyCandidatesPage />} />
            <Route path="/company/candidates/:candidateAccessId" element={<CompanyCandidateDetailPage />} />
            <Route path="/company/interviews" element={<CompanyInterviewsPage />} />
            <Route path="/company/interviews/:interviewId" element={<CompanyInterviewDetailPage />} />
            <Route path="/company/shortlist" element={<CompanyShortlistPage />} />
            <Route path="/company/vacancies" element={<CompanyVacanciesPage />} />
            <Route path="/company/vacancies/:vacancyId/matches" element={<CompanyVacancyMatchesPage />} />
          </Route>

          <Route element={<RoleGuard role="admin" />}>
            <Route path="/admin" element={<DashboardPage role="admin" />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/operations" element={<AdminCompaniesPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/courses/:courseId/lessons" element={<AdminCourseLessonsPage />} />
            <Route path="/admin/exams" element={<AdminExamsPage />} />
            <Route path="/admin/exams/:examId/questions" element={<AdminExamQuestionsPage />} />
            <Route path="/admin/vacancies" element={<AdminVacanciesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
