import { apiRequest } from './api'

type RequestOptions = {
  params?: Record<string, string | number | boolean | null | undefined>
}

function appendParams(path: string, params?: RequestOptions['params']) {
  if (!params) {
    return path
  }

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions) {
    const data = await apiRequest<T>(appendParams(path, options?.params))
    return { data }
  },
  async post<T>(path: string, body: unknown) {
    const data = await apiRequest<T>(path, { method: 'POST', body })
    return { data }
  },
  async put<T>(path: string, body: unknown) {
    const data = await apiRequest<T>(path, { method: 'PUT', body })
    return { data }
  },
  async delete<T>(path: string) {
    const data = await apiRequest<T>(path, { method: 'DELETE' })
    return { data }
  },
}

export default apiClient
