import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { AuthContext } from './context'
import { ApiError, apiRequest } from '../lib/api'
import type { AuthContextValue, AuthUser, SessionResponse } from './types'

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Something went wrong while contacting the server.'
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const applySession = useCallback((session: SessionResponse) => {
    setCsrfToken(session.csrf_token)
    if (session.authenticated && session.user) {
      setUser(session.user)
      setStatus('authenticated')
      return
    }

    setUser(null)
    setStatus('anonymous')
  }, [])

  const fetchCsrfToken = useCallback(async () => {
    const response = await apiRequest<{ csrf_token: string }>('/auth/csrf')
    setCsrfToken(response.csrf_token)
    return response.csrf_token
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      setGlobalError(null)
      const session = await apiRequest<SessionResponse>('/auth/session')
      applySession(session)
    } catch (error) {
      setUser(null)
      setStatus('anonymous')
      setGlobalError(getErrorMessage(error))
    }
  }, [applySession])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const ensureCsrfToken = useCallback(async () => {
    if (csrfToken) {
      return csrfToken
    }

    return fetchCsrfToken()
  }, [csrfToken, fetchCsrfToken])

  const login = useCallback(
    async (payload: { email: string; password: string; role?: AuthUser['role'] }) => {
      const token = await ensureCsrfToken()
      const response = await apiRequest<AuthUser & { csrf_token: string }>('/auth/login', {
        method: 'POST',
        body: payload,
        csrfToken: token,
      })

      setCsrfToken(response.csrf_token)
      setUser(response)
      setStatus('authenticated')
      setGlobalError(null)
      return response
    },
    [ensureCsrfToken],
  )

  const signup = useCallback(
    async (payload: {
      role: 'student' | 'company' | 'teacher'
      email: string
      password: string
      name: string
      company_name?: string
    }) => {
      const token = await ensureCsrfToken()
      const response = await apiRequest<AuthUser & { csrf_token: string }>('/auth/signup', {
        method: 'POST',
        body: payload,
        csrfToken: token,
      })

      setCsrfToken(response.csrf_token)
      setUser(response)
      setStatus('authenticated')
      setGlobalError(null)
      return response
    },
    [ensureCsrfToken],
  )

  const logout = useCallback(async () => {
    const token = await ensureCsrfToken()
    await apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      csrfToken: token,
    })
    setUser(null)
    setStatus('anonymous')
    setGlobalError(null)
    await fetchCsrfToken()
  }, [ensureCsrfToken, fetchCsrfToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      csrfToken,
      globalError,
      login,
      signup,
      logout,
      refreshSession,
      clearGlobalError: () => setGlobalError(null),
    }),
    [csrfToken, globalError, login, logout, refreshSession, signup, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
