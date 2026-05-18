import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

const titledRoutes = [
  { path: '/', title: 'Softlearn' },
  { path: '/login', title: 'Log in' },
  { path: '/signup', title: 'Sign up' },
  { path: '/unauthorized', title: 'Access denied' },
  { path: '/student', title: 'Student dashboard' },
  { path: '/student/notifications', title: 'Student notifications' },
  { path: '/student/messages', title: 'Student messages' },
  { path: '/student/matches', title: 'Matched jobs' },
  { path: '/student/jobs', title: 'Student jobs' },
  { path: '/student/jobs/saved', title: 'Saved jobs' },
  { path: '/student/jobs/:vacancyId', title: 'Job details' },
  { path: '/student/applications', title: 'Student applications' },
  { path: '/student/profile', title: 'Student profile' },
  { path: '/student/skills', title: 'Student skills' },
  { path: '/student/courses', title: 'Course catalog' },
  { path: '/student/courses/wishlist', title: 'Wishlisted courses' },
  { path: '/student/courses/completed', title: 'Completed courses' },
  { path: '/student/courses/:courseId', title: 'Course details' },
  { path: '/student/courses/:courseId/lessons/:lessonId', title: 'Lesson' },
  { path: '/student/learning', title: 'Learning progress' },
  { path: '/student/preparation', title: 'Preparation workspace' },
  { path: '/student/exams', title: 'Exam results' },
  { path: '/student/exams/:examId', title: 'Take exam' },
  { path: '/student/mock-exams/:examId', title: 'Mock exam' },
  { path: '/student/interviews', title: 'Student interviews' },
  { path: '/student/interviews/:interviewId', title: 'Interview details' },
  { path: '/student/privacy', title: 'Privacy settings' },
  { path: '/company', title: 'Company dashboard' },
  { path: '/company/notifications', title: 'Company notifications' },
  { path: '/company/applications', title: 'Company applications' },
  { path: '/company/courses', title: 'Company courses' },
  { path: '/company/courses/saved', title: 'Saved company courses' },
  { path: '/company/courses/retired', title: 'Retired company courses' },
  { path: '/company/courses/new', title: 'Create course' },
  { path: '/company/courses/:courseId/edit', title: 'Edit course' },
  { path: '/company/courses/:courseId/lessons', title: 'Company course lessons' },
  { path: '/company/profile', title: 'Company profile' },
  { path: '/company/candidates', title: 'Candidates' },
  { path: '/company/candidates/:candidateAccessId', title: 'Candidate details' },
  { path: '/company/interviews', title: 'Company interviews' },
  { path: '/company/interviews/:interviewId', title: 'Interview details' },
  { path: '/company/shortlist', title: 'Shortlist' },
  { path: '/company/vacancies', title: 'Vacancies' },
  { path: '/company/vacancies/:vacancyId/matches', title: 'Matched students' },
  { path: '/admin', title: 'Admin dashboard' },
  { path: '/admin/notifications', title: 'Admin notifications' },
  { path: '/admin/users', title: 'User management' },
  { path: '/admin/operations', title: 'Company management' },
  { path: '/admin/courses', title: 'Course management' },
  { path: '/admin/courses/:courseId/lessons', title: 'Lesson management' },
  { path: '/admin/exams', title: 'Exam management' },
  { path: '/admin/exams/:examId/questions', title: 'Question management' },
  { path: '/admin/vacancies', title: 'Vacancy management' },
]

function resolveTitle(pathname: string) {
  const match = titledRoutes.find((route) => matchPath({ path: route.path, end: true }, pathname))
  return match ? `${match.title} | Softlearn` : 'Softlearn'
}

export function PageTitle() {
  const location = useLocation()

  useEffect(() => {
    document.title = resolveTitle(location.pathname)
  }, [location.pathname])

  return null
}
