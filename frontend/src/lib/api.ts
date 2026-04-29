const DEFAULT_API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  code: string
  details: Record<string, unknown>
  requestId?: string
  status: number

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
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  csrfToken?: string | null
  signal?: AbortSignal
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
}

function isSafeMethod(method: string) {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? 'GET'
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (!isSafeMethod(method) && options.csrfToken) {
    headers.set('X-CSRFToken', options.csrfToken)
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

  const payload = (await response.json()) as
    | { data: T }
    | {
        error: {
          code?: string
          message?: string
          details?: Record<string, unknown>
          request_id?: string
        }
      }

  if (!response.ok || 'error' in payload) {
    const error = 'error' in payload ? payload.error : undefined
    throw new ApiError(error?.message ?? 'Request failed.', {
      code: error?.code,
      details: error?.details,
      requestId: error?.request_id,
      status: response.status,
    })
  }

  return payload.data
}
