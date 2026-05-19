import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

import { AuthContext } from './context'
import {
  ApiError,
  apiRequest,
  clearAuthTokens,
  ensureFreshAccessToken,
  getStoredAccessToken,
  hasStoredRefreshToken,
  storeAuthTokens,
} from '../lib/api'
import type { AuthContextValue, AuthResponse, AuthUser, SessionResponse } from './types'

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
      if (hasStoredRefreshToken() && !getStoredAccessToken()) {
        await ensureFreshAccessToken()
      }

      let session = await apiRequest<SessionResponse>('/auth/session', { notifyOnError: false })
      if (!session.authenticated && hasStoredRefreshToken()) {
        await ensureFreshAccessToken()
        session = await apiRequest<SessionResponse>('/auth/session', { notifyOnError: false })
      }
      applySession(session)
      if (!session.authenticated) {
        clearAuthTokens()
      }
    } catch (error) {
      clearAuthTokens()
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
    async (payload: { email: string; password: string; role: AuthUser['role'] }) => {
      const token = await ensureCsrfToken()
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: payload,
        csrfToken: token,
      })

      storeAuthTokens(response.access_token, response.refresh_token)
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
      role: 'student' | 'company'
      email: string
      password: string
      name: string
      company_name?: string
    }) => {
      const token = await ensureCsrfToken()
      const response = await apiRequest<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: payload,
        csrfToken: token,
      })

      storeAuthTokens(response.access_token, response.refresh_token)
      setCsrfToken(response.csrf_token)
      setUser(response)
      setStatus('authenticated')
      setGlobalError(null)
      return response
    },
    [ensureCsrfToken],
  )

  const logout = useCallback(async () => {
    try {
      const token = await ensureCsrfToken()
      await apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
        csrfToken: token,
        notifyOnError: false,
      })
    } finally {
      clearAuthTokens()
      setUser(null)
      setStatus('anonymous')
      setGlobalError(null)
      await fetchCsrfToken()
    }
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
