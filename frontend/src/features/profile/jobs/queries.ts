import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '@/lib/api'

import type { StudentJobDetailResponse } from '../types'

export const studentJobQueryKeys = {
  detail: (vacancyId: string) => ['student-jobs', 'detail', vacancyId] as const,
}

export function studentJobDetailQueryOptions(vacancyId: string) {
  return queryOptions({
    queryKey: studentJobQueryKeys.detail(vacancyId),
    queryFn: () => apiRequest<StudentJobDetailResponse>(`/student/jobs/${vacancyId}`),
  })
}
