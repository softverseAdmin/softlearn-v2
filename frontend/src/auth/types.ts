export type UserRole = 'student' | 'company' | 'admin'

export interface AuthUser {
  user_id: number
  role: UserRole
  email: string
  name: string
  authenticated: true
  company_id: number | null
}

export interface SessionResponse {
  authenticated: boolean
  user: AuthUser | null
  csrf_token: string
}

export interface AuthContextValue {
  status: 'loading' | 'authenticated' | 'anonymous'
  user: AuthUser | null
  csrfToken: string | null
  globalError: string | null
  login: (payload: { email: string; password: string; role: UserRole }) => Promise<AuthUser>
  signup: (payload: {
    role: Extract<UserRole, 'student' | 'company'>
    email: string
    password: string
    name: string
    company_name?: string
  }) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearGlobalError: () => void
}
