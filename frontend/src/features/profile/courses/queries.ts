import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '@/lib/api'

import type { CompanyCoursesResponse } from '../types'

export const companyCourseQueryKeys = {
  catalog: (params: Record<string, string>) => ['company-courses', 'catalog', params] as const,
}

export function companyCourseCatalogQueryOptions(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params)
  const path = searchParams.size > 0 ? `/company/courses?${searchParams.toString()}` : '/company/courses'
  return queryOptions({
    queryKey: companyCourseQueryKeys.catalog(params),
    queryFn: () => apiRequest<CompanyCoursesResponse>(path),
  })
}
