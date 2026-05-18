import { Route } from 'react-router-dom'

import { loadableNamed } from '@/router/loadable'

const DashboardPage = loadableNamed(() => import('@/pages/DashboardPage'), 'DashboardPage')
const NotificationsPage = loadableNamed(() => import('@/features/notifications/NotificationsPage'), 'NotificationsPage')
const CompanyMessagesPage = loadableNamed(() => import('@/features/profile/CompanyMessagesPage'), 'CompanyMessagesPage')
const CompanyApplicationsPage = loadableNamed(() => import('@/features/profile/CompanyApplicationsPage'), 'CompanyApplicationsPage')
const CompanyCourseCatalogPage = loadableNamed(() => import('@/features/profile/CompanyCourseCatalogPage'), 'CompanyCourseCatalogPage')
const CompanySavedCoursesPage = loadableNamed(
  () => import('@/features/profile/CompanyCourseCatalogPage'),
  'CompanySavedCoursesPage',
)
const CompanyRetiredCoursesPage = loadableNamed(
  () => import('@/features/profile/CompanyCourseCatalogPage'),
  'CompanyRetiredCoursesPage',
)
const CompanyCourseEditorPage = loadableNamed(() => import('@/features/profile/CompanyCourseEditorPage'), 'CompanyCourseEditorPage')
const CompanyCoursePreviewDetailPage = loadableNamed(
  () => import('@/features/profile/CompanyCoursePreviewDetailPage'),
  'CompanyCoursePreviewDetailPage',
)
const CompanyCoursePreviewLessonPage = loadableNamed(
  () => import('@/features/profile/CompanyCoursePreviewLessonPage'),
  'CompanyCoursePreviewLessonPage',
)
const CompanyCourseLessonsPage = loadableNamed(() => import('@/features/profile/CompanyCourseLessonsPage'), 'CompanyCourseLessonsPage')
const CompanyPostJobsPage = loadableNamed(() => import('@/features/profile/CompanyPostJobsPage'), 'CompanyPostJobsPage')
const CompanyProfilePage = loadableNamed(() => import('@/features/profile/CompanyProfilePage'), 'CompanyProfilePage')
const CompanyCandidatesPage = loadableNamed(() => import('@/features/profile/CompanyCandidatesPage'), 'CompanyCandidatesPage')
const CompanyCandidateDetailPage = loadableNamed(
  () => import('@/features/profile/CompanyCandidateDetailPage'),
  'CompanyCandidateDetailPage',
)
const CompanyInterviewsPage = loadableNamed(() => import('@/features/profile/CompanyInterviewsPage'), 'CompanyInterviewsPage')
const CompanyInterviewDetailPage = loadableNamed(
  () => import('@/features/profile/CompanyInterviewDetailPage'),
  'CompanyInterviewDetailPage',
)
const CompanyShortlistPage = loadableNamed(() => import('@/features/profile/CompanyShortlistPage'), 'CompanyShortlistPage')
const CompanyVacanciesPage = loadableNamed(() => import('@/features/profile/CompanyVacanciesPage'), 'CompanyVacanciesPage')
const CompanyVacancyMatchesPage = loadableNamed(
  () => import('@/features/profile/CompanyVacancyMatchesPage'),
  'CompanyVacancyMatchesPage',
)

export function renderCompanyRoutes() {
  return (
    <>
      <Route path="/company" element={<DashboardPage role="company" />} />
      <Route path="/company/notifications" element={<NotificationsPage />} />
      <Route path="/company/messages" element={<CompanyMessagesPage />} />
      <Route path="/company/applications" element={<CompanyApplicationsPage />} />
      <Route path="/company/courses" element={<CompanyCourseCatalogPage />} />
      <Route path="/company/courses/saved" element={<CompanySavedCoursesPage />} />
      <Route path="/company/courses/retired" element={<CompanyRetiredCoursesPage />} />
      <Route path="/company/courses/new" element={<CompanyCourseEditorPage mode="create" />} />
      <Route path="/company/courses/:courseId/edit" element={<CompanyCourseEditorPage mode="edit" />} />
      <Route path="/company/courses/:courseId/preview" element={<CompanyCoursePreviewDetailPage />} />
      <Route
        path="/company/courses/:courseId/preview/lessons/:lessonId"
        element={<CompanyCoursePreviewLessonPage />}
      />
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
    </>
  )
}
