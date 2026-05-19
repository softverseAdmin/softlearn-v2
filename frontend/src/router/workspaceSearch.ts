import type { UserRole } from '@/auth/types'

const workspaceSearchParam = 'q'

type SearchRouteRule = {
  prefix: string
  target: string
}

const workspaceSearchRulesByRole: Record<UserRole, SearchRouteRule[]> = {
  student: [
    { prefix: '/student/notifications', target: '/student/notifications' },
    { prefix: '/student/messages', target: '/student/messages' },
    { prefix: '/student/jobs/saved', target: '/student/jobs/saved' },
    { prefix: '/student/jobs', target: '/student/jobs' },
    { prefix: '/student/courses/wishlist', target: '/student/courses/wishlist' },
    { prefix: '/student/courses/completed', target: '/student/courses/completed' },
    { prefix: '/student/courses', target: '/student/courses' },
  ],
  company: [
    { prefix: '/company/notifications', target: '/company/notifications' },
    { prefix: '/company/messages', target: '/company/messages' },
    { prefix: '/company/applications', target: '/company/applications' },
    { prefix: '/company/candidates', target: '/company/candidates' },
    { prefix: '/company/interviews', target: '/company/interviews' },
    { prefix: '/company/courses/saved', target: '/company/courses/saved' },
    { prefix: '/company/courses/retired', target: '/company/courses/retired' },
    { prefix: '/company/courses', target: '/company/courses' },
  ],
  admin: [],
}

const defaultWorkspaceSearchPathByRole: Record<UserRole, string> = {
  student: '/student/courses',
  company: '/company/candidates',
  admin: '/admin',
}

export function getWorkspaceSearchQuery(searchParams: URLSearchParams) {
  return searchParams.get(workspaceSearchParam)?.trim() ?? ''
}

export function withWorkspaceSearchQuery(searchParams: URLSearchParams, query: string) {
  const next = new URLSearchParams(searchParams)
  const normalizedQuery = query.trim()

  if (normalizedQuery) {
    next.set(workspaceSearchParam, normalizedQuery)
  } else {
    next.delete(workspaceSearchParam)
  }

  return next
}

export function getWorkspaceSearchPath(role: UserRole, pathname: string) {
  const matchedRule = workspaceSearchRulesByRole[role].find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
  )

  return matchedRule?.target ?? defaultWorkspaceSearchPathByRole[role]
}
