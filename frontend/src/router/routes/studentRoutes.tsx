import { Navigate, Route } from 'react-router-dom'

import { loadable, loadableNamed } from '@/router/loadable'

const DashboardPage = loadableNamed(() => import('@/pages/DashboardPage'), 'DashboardPage')
const NotificationsPage = loadableNamed(() => import('@/features/notifications/NotificationsPage'), 'NotificationsPage')
const StudentMessagesPage = loadableNamed(() => import('@/features/profile/messages/pages/StudentMessagesPage'), 'StudentMessagesPage')
const StudentMatchesPage = loadableNamed(() => import('@/features/profile/StudentMatchesPage'), 'StudentMatchesPage')
const StudentApplicationsPage = loadableNamed(() => import('@/features/profile/StudentApplicationsPage'), 'StudentApplicationsPage')
const StudentProfilePage = loadableNamed(() => import('@/features/profile/StudentProfilePage'), 'StudentProfilePage')
const StudentSkillsPage = loadableNamed(() => import('@/features/profile/StudentSkillsPage'), 'StudentSkillsPage')
const StudentCourseCatalogPage = loadableNamed(() => import('@/features/profile/StudentCourseCatalogPage'), 'StudentCourseCatalogPage')
const StudentWishlistedCoursesPage = loadableNamed(
  () => import('@/features/profile/StudentCourseCatalogPage'),
  'StudentWishlistedCoursesPage',
)
const StudentCompletedCoursesPage = loadableNamed(
  () => import('@/features/profile/StudentCourseCatalogPage'),
  'StudentCompletedCoursesPage',
)
const StudentCourseDetailPage = loadableNamed(() => import('@/features/profile/StudentCourseDetailPage'), 'StudentCourseDetailPage')
const StudentLessonPage = loadableNamed(() => import('@/features/profile/StudentLessonPage'), 'StudentLessonPage')
const StudentJobsPage = loadableNamed(() => import('@/features/profile/StudentJobsPage'), 'StudentJobsPage')
const StudentSavedJobsPage = loadableNamed(() => import('@/features/profile/StudentJobsPage'), 'StudentSavedJobsPage')
const StudentJobDetailPage = loadableNamed(() => import('@/features/profile/StudentJobDetailPage'), 'StudentJobDetailPage')
const StudentLearningPage = loadableNamed(() => import('@/features/profile/StudentLearningPage'), 'StudentLearningPage')
const StudentPreparationPage = loadableNamed(() => import('@/features/profile/StudentPreparationPage'), 'StudentPreparationPage')
const StudentExamResultsPage = loadable(() => import('@/features/profile/StudentExamResultsPage'))
const StudentExamPage = loadableNamed(() => import('@/features/profile/StudentExamPage'), 'StudentExamPage')
const StudentMockExamPage = loadableNamed(() => import('@/features/profile/StudentMockExamPage'), 'StudentMockExamPage')
const StudentInterviewsPage = loadableNamed(() => import('@/features/profile/StudentInterviewsPage'), 'StudentInterviewsPage')
const StudentInterviewDetailPage = loadableNamed(
  () => import('@/features/profile/StudentInterviewDetailPage'),
  'StudentInterviewDetailPage',
)
const StudentPrivacySettingsPage = loadableNamed(
  () => import('@/features/profile/StudentPrivacySettingsPage'),
  'StudentPrivacySettingsPage',
)
const StudentWorkHistoryPage = loadableNamed(() => import('@/features/profile/work-history/pages/StudentWorkHistoryPage'), 'StudentWorkHistoryPage')

export function renderStudentRoutes() {
  return (
    <>
      <Route path="/student" element={<DashboardPage role="student" />} />
      <Route path="/student/notifications" element={<NotificationsPage />} />
      <Route path="/student/messages" element={<StudentMessagesPage />} />
      <Route path="/student/matches" element={<StudentMatchesPage />} />
      <Route path="/student/applications" element={<StudentApplicationsPage />} />
      <Route path="/student/profile" element={<StudentProfilePage />} />
      <Route path="/student/skills" element={<StudentSkillsPage />} />
      <Route path="/student/courses" element={<StudentCourseCatalogPage />} />
      <Route path="/student/courses/wishlist" element={<StudentWishlistedCoursesPage />} />
      <Route path="/student/courses/completed" element={<StudentCompletedCoursesPage />} />
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
      <Route path="/student/mock-interviews" element={<Navigate to="/student/interviews" replace />} />
      <Route path="/student/community" element={<Navigate to="/student/messages" replace />} />
      <Route path="/student/resume" element={<StudentWorkHistoryPage />} />
      <Route path="/student/work-history" element={<StudentWorkHistoryPage />} />
      <Route path="/student/documents" element={<StudentWorkHistoryPage />} />
      <Route path="/student/certificates" element={<Navigate to="/student/profile" replace />} />
      <Route path="/learning/categories" element={<StudentPreparationPage />} />
      <Route path="/learning/practice/:examId" element={<StudentPreparationPage />} />
      <Route path="/learning/mock-exams/:examId" element={<StudentMockExamPage />} />
      <Route path="/learning/study-plan" element={<StudentPreparationPage />} />
      <Route path="/learning/performance" element={<StudentPreparationPage />} />
    </>
  )
}
