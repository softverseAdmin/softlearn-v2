import { toast } from 'sonner'

const DEFAULT_API_BASE_URL = '/api/v1'
const JSON_CONTENT_TYPE = 'application/json'
const ACCESS_TOKEN_STORAGE_KEY = 'softlearn.accessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'softlearn.refreshToken'

export class ApiError extends Error {
  code: string
  details: Record<string, unknown>
  requestId?: string
  status: number
  notified: boolean

  constructor(
    message: string,
    options: {
      code?: string
      details?: Record<string, unknown>
      requestId?: string
      status: number
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code ?? 'UNKNOWN_ERROR'
    this.details = options.details ?? {}
    this.requestId = options.requestId
    this.status = options.status
    this.notified = false
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  csrfToken?: string | null
  signal?: AbortSignal
  notifyOnSuccess?: boolean
  notifyOnError?: boolean
  skipAuthRefresh?: boolean
}

type ApiSuccessResponse<T> = {
  data: T
  meta?: Record<string, unknown>
}

type ApiFailureResponse = {
  error: {
    code?: string
    message?: string
    details?: Record<string, unknown>
    request_id?: string
  }
}

type AuthTokenResponse = {
  access_token: string
  refresh_token: string
}

let refreshTokensPromise: Promise<string | null> | null = null

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return `${baseUrl}/${normalizedPath}`
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getStoredAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null
}

export function getStoredRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? null
}

export function hasStoredRefreshToken() {
  return Boolean(getStoredRefreshToken())
}

export function storeAuthTokens(accessToken: string, refreshToken: string) {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export function clearAuthTokens() {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

function isSafeMethod(method: string) {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

function shouldNotifyByDefault(method: string) {
  return !isSafeMethod(method)
}

function getResponseMessage(value: unknown) {
  if (!value || typeof value !== 'object' || !('message' in value)) {
    return null
  }

  const message = (value as { message?: unknown }).message
  return typeof message === 'string' && message.trim() ? message : null
}

function getFirstErrorDetailMessage(details: unknown): string | null {
  if (!details || typeof details !== 'object') {
    return null
  }

  for (const value of Object.values(details as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }

    if (Array.isArray(value)) {
      const firstTextItem = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0)
      if (firstTextItem) {
        return firstTextItem
      }
    }
  }

  return null
}

function getApiErrorPayload(payload: unknown): ApiFailureResponse['error'] | null {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return null
  }

  const error = (payload as { error?: unknown }).error
  if (!error || typeof error !== 'object') {
    return null
  }

  return error as ApiFailureResponse['error']
}

function getApiSuccessPayload<T>(payload: unknown): ApiSuccessResponse<T> | null {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return null
  }

  return payload as ApiSuccessResponse<T>
}

function getFallbackErrorMessage(response: Response, payload: unknown) {
  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (trimmed && !trimmed.startsWith('<')) {
      return trimmed
    }
  }

  if (response.status >= 500) {
    return 'The server returned an unexpected error.'
  }

  if (response.status === 404) {
    return 'The requested resource was not found.'
  }

  return response.statusText || 'Request failed.'
}

async function parseResponsePayload(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return null
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength === '0') {
    return null
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (contentType.includes(JSON_CONTENT_TYPE)) {
    try {
      return (await response.json()) as unknown
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text.trim() ? text : null
  } catch {
    return null
  }
}

async function refreshStoredAuthTokens() {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await fetch(buildApiUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: JSON_CONTENT_TYPE,
      'Content-Type': JSON_CONTENT_TYPE,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  const payload = await parseResponsePayload(response)
  const error = getApiErrorPayload(payload)

  if (!response.ok || error) {
    clearAuthTokens()
    throw new ApiError(error?.message ?? 'Authentication expired. Please sign in again.', {
      code: error?.code,
      details: error?.details,
      requestId: error?.request_id ?? response.headers.get('X-Request-ID') ?? undefined,
      status: response.status,
    })
  }

  const responseData = getApiSuccessPayload<AuthTokenResponse>(payload)?.data
  if (!responseData?.access_token || !responseData.refresh_token) {
    clearAuthTokens()
    throw new ApiError('Authentication expired. Please sign in again.', {
      code: 'INVALID_REFRESH_RESPONSE',
      status: response.status,
    })
  }

  storeAuthTokens(responseData.access_token, responseData.refresh_token)
  return responseData.access_token
}

export async function ensureFreshAccessToken() {
  if (refreshTokensPromise) {
    return refreshTokensPromise
  }

  refreshTokensPromise = refreshStoredAuthTokens().finally(() => {
    refreshTokensPromise = null
  })
  return refreshTokensPromise
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? 'GET'
  const notifyOnSuccess = options.notifyOnSuccess ?? shouldNotifyByDefault(method)
  const notifyOnError = options.notifyOnError ?? shouldNotifyByDefault(method)
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (!isSafeMethod(method) && options.csrfToken) {
    headers.set('X-CSRFToken', options.csrfToken)
  }

  const accessToken = getStoredAccessToken()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (
    response.status === 401 &&
    accessToken &&
    !options.skipAuthRefresh &&
    path !== '/auth/refresh' &&
    path !== '/auth/login' &&
    path !== '/auth/signup' &&
    hasStoredRefreshToken()
  ) {
    try {
      const refreshedAccessToken = await ensureFreshAccessToken()
      if (refreshedAccessToken) {
        return apiRequest<T>(path, { ...options, skipAuthRefresh: true })
      }
    } catch (refreshError) {
      if (notifyOnError && refreshError instanceof ApiError) {
        toast.error(refreshError.message)
        refreshError.notified = true
      }
      throw refreshError
    }
  }

  const payload = await parseResponsePayload(response)
  const requestId = response.headers.get('X-Request-ID') ?? undefined
  const error = getApiErrorPayload(payload)

  if (!response.ok || error) {
    const fallbackMessage = error?.message ?? getFallbackErrorMessage(response, payload)
    const validationDetailMessage =
      error?.code === 'VALIDATION_ERROR' ? getFirstErrorDetailMessage(error?.details) : null

    const apiError = new ApiError(validationDetailMessage ?? fallbackMessage, {
      code: error?.code,
      details: error?.details,
      requestId: error?.request_id ?? requestId,
      status: response.status,
    })

    if (notifyOnError) {
      toast.error(apiError.message)
      apiError.notified = true
    }

    throw apiError
  }

  const successPayload = getApiSuccessPayload<T>(payload)
  const responseData = successPayload?.data ?? (payload as T)
  const responseMessage = getResponseMessage(responseData)
  if (notifyOnSuccess && responseMessage) {
    toast.success(responseMessage)
  }

  return responseData
}
