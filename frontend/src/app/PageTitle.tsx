import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

const titledRoutes = [
  { path: '/', title: 'Softlearn' },
  { path: '/login', title: 'Log in' },
  { path: '/signup', title: 'Sign up' },
  { path: '/unauthorized', title: 'Access denied' },
  { path: '/student', title: 'Student dashboard' },
  { path: '/student/notifications', title: 'Student notifications' },
  { path: '/student/jobs', title: 'Student jobs' },
  { path: '/student/profile', title: 'Student profile' },
  { path: '/student/skills', title: 'Student skills' },
  { path: '/student/learning', title: 'Learning progress' },
  { path: '/student/exams', title: 'Exam results' },
  { path: '/student/interviews', title: 'Student interviews' },
  { path: '/student/interviews/:interviewId', title: 'Interview details' },
  { path: '/student/privacy', title: 'Privacy settings' },
  { path: '/company', title: 'Company dashboard' },
  { path: '/company/notifications', title: 'Company notifications' },
  { path: '/company/profile', title: 'Company profile' },
  { path: '/company/candidates', title: 'Candidates' },
  { path: '/company/candidates/:candidateAccessId', title: 'Candidate details' },
  { path: '/company/interviews', title: 'Company interviews' },
  { path: '/company/interviews/:interviewId', title: 'Interview details' },
  { path: '/company/shortlist', title: 'Shortlist' },
  { path: '/company/vacancies', title: 'Vacancies' },
  { path: '/admin', title: 'Admin dashboard' },
  { path: '/admin/notifications', title: 'Admin notifications' },
  { path: '/admin/users', title: 'User management' },
  { path: '/admin/operations', title: 'Company management' },
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
