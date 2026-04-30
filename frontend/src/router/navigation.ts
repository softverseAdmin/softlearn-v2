import type { AuthUser, UserRole } from '../auth/types'

export type NavigationItem = {
  label: string
  to: string
}

export const roleHomePaths: Record<UserRole, string> = {
  student: '/student',
  company: '/company',
  admin: '/admin',
}

export const navigationItemsByRole: Record<UserRole, NavigationItem[]> = {
  student: [
    { label: 'Dashboard', to: '/student' },
    { label: 'Notifications', to: '/student/notifications' },
    { label: 'Jobs', to: '/student/jobs' },
    { label: 'Applications', to: '/student/applications' },
    { label: 'Profile', to: '/student/profile' },
    { label: 'Skills', to: '/student/skills' },
    { label: 'Learning', to: '/student/learning' },
    { label: 'Exams', to: '/student/exams' },
    { label: 'Interviews', to: '/student/interviews' },
    { label: 'Privacy', to: '/student/privacy' },
  ],
  company: [
    { label: 'Dashboard', to: '/company' },
    { label: 'Notifications', to: '/company/notifications' },
    { label: 'Applications', to: '/company/applications' },
    { label: 'Profile', to: '/company/profile' },
    { label: 'Candidates', to: '/company/candidates' },
    { label: 'Interviews', to: '/company/interviews' },
    { label: 'Shortlist', to: '/company/shortlist' },
    { label: 'Vacancies', to: '/company/vacancies' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Notifications', to: '/admin/notifications' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Companies', to: '/admin/operations' },
    { label: 'Vacancies', to: '/admin/vacancies' },
  ],
}

export function getHomePath(user: AuthUser | null) {
  if (!user) {
    return '/login'
  }

  return roleHomePaths[user.role]
}
