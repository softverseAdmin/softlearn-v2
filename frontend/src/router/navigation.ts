import type { AuthUser, UserRole } from '../auth/types'

export type NavigationItem = {
  label: string
  to: string
}

export type ShellNavigationTargets = {
  notificationsHref?: string
  messagesHref?: string
  profileHref?: string
  settingsHref?: string
}

export const roleHomePaths: Record<UserRole, string> = {
  student: '/student',
  company: '/company',
  teacher: '/teacher',
  admin: '/admin',
}

export const navigationItemsByRole: Record<UserRole, NavigationItem[]> = {
  student: [
    { label: 'Dashboard', to: '/student' },
    { label: 'Courses', to: '/student/courses' },
    { label: 'Jobs', to: '/student/jobs' },
    { label: 'Profile', to: '/student/profile' },
    { label: 'Exams', to: '/student/exams' },
    { label: 'Settings', to: '/student/privacy' },
  ],
  company: [
    { label: 'Dashboard', to: '/company' },
    { label: 'Post Jobs', to: '/company/jobs' },
    { label: 'Courses', to: '/company/courses' },
    { label: 'Applications', to: '/company/applications' },
    { label: 'Candidates', to: '/company/candidates' },
    { label: 'Interviews', to: '/company/interviews' },
    { label: 'Profile', to: '/company/profile' },
    { label: 'Settings', to: '/company/privacy' },
  ],
  teacher: [
    { label: 'Dashboard', to: '/teacher' },
    { label: 'Courses', to: '/teacher/courses' },
    { label: 'Progress', to: '/teacher/progress' },
    { label: 'Exams', to: '/teacher/exams' },
    { label: 'Students', to: '/teacher/students' },
    { label: 'Notifications', to: '/teacher/notifications' },
    { label: 'Profile', to: '/teacher/profile' },
    { label: 'Settings', to: '/teacher/settings' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Notifications', to: '/admin/notifications' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Companies', to: '/admin/operations' },
    { label: 'Courses', to: '/admin/courses' },
    { label: 'Exams', to: '/admin/exams' },
    { label: 'Vacancies', to: '/admin/vacancies' },
  ],
}

export const shellNavigationTargetsByRole: Record<UserRole, ShellNavigationTargets> = {
  student: {
    notificationsHref: '/student/notifications',
    messagesHref: '/student/messages',
    profileHref: '/student/profile',
    settingsHref: '/student/privacy',
  },
  company: {
    notificationsHref: '/company/notifications',
    messagesHref: '/company/messages',
    profileHref: '/company/profile',
    settingsHref: '/company/privacy',
  },
  teacher: {
    notificationsHref: '/teacher/notifications',
    profileHref: '/teacher/profile',
    settingsHref: '/teacher/settings',
  },
  admin: {
    notificationsHref: '/admin/notifications',
  },
}

export function getHomePath(user: AuthUser | null) {
  if (!user) {
    return '/login'
  }

  return roleHomePaths[user.role]
}
