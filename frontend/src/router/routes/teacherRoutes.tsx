import { Route } from 'react-router-dom'

import { loadableNamed } from '@/router/loadable'

const DashboardPage = loadableNamed(() => import('@/pages/DashboardPage'), 'DashboardPage')
const NotificationsPage = loadableNamed(() => import('@/features/notifications/NotificationsPage'), 'NotificationsPage')
const TeacherCoursesPage = loadableNamed(() => import('@/features/teacher/pages/TeacherCoursesPage'), 'TeacherCoursesPage')
const TeacherCourseCreatePage = loadableNamed(() => import('@/features/teacher/pages/TeacherCourseEditorPage'), 'TeacherCourseCreatePage')
const TeacherCourseEditPage = loadableNamed(() => import('@/features/teacher/pages/TeacherCourseEditorPage'), 'TeacherCourseEditPage')
const TeacherCourseLessonsPage = loadableNamed(() => import('@/features/teacher/pages/TeacherCourseLessonsPage'), 'TeacherCourseLessonsPage')
const TeacherCoursePreviewDetailPage = loadableNamed(() => import('@/features/teacher/pages/TeacherCoursePreviewDetailPage'), 'TeacherCoursePreviewDetailPage')
const TeacherCoursePreviewLessonPage = loadableNamed(() => import('@/features/teacher/pages/TeacherCoursePreviewLessonPage'), 'TeacherCoursePreviewLessonPage')
const TeacherExamsPage = loadableNamed(() => import('@/features/teacher/pages/TeacherExamsPage'), 'TeacherExamsPage')
const TeacherProgressPage = loadableNamed(() => import('@/features/teacher/pages/TeacherProgressPage'), 'TeacherProgressPage')
const TeacherStudentsPage = loadableNamed(() => import('@/features/teacher/pages/TeacherStudentsPage'), 'TeacherStudentsPage')
const TeacherProfilePage = loadableNamed(() => import('@/features/teacher/pages/TeacherProfilePage'), 'TeacherProfilePage')
const TeacherSettingsPage = loadableNamed(() => import('@/features/teacher/pages/TeacherSettingsPage'), 'TeacherSettingsPage')

export function renderTeacherRoutes() {
  return (
    <>
      <Route path="/teacher" element={<DashboardPage role="teacher" />} />
      <Route path="/teacher/notifications" element={<NotificationsPage />} />
      <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
      <Route path="/teacher/courses/new" element={<TeacherCourseCreatePage />} />
      <Route path="/teacher/courses/:courseId/edit" element={<TeacherCourseEditPage />} />
      <Route path="/teacher/courses/:courseId/lessons" element={<TeacherCourseLessonsPage />} />
      <Route path="/teacher/courses/:courseId/preview" element={<TeacherCoursePreviewDetailPage />} />
      <Route path="/teacher/courses/:courseId/preview/lessons/:lessonId" element={<TeacherCoursePreviewLessonPage />} />
      <Route path="/teacher/progress" element={<TeacherProgressPage />} />
      <Route path="/teacher/exams" element={<TeacherExamsPage />} />
      <Route path="/teacher/students" element={<TeacherStudentsPage />} />
      <Route path="/teacher/profile" element={<TeacherProfilePage />} />
      <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
    </>
  )
}
