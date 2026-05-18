import { apiRequest } from '@/lib/api'

import type { CompanyVacanciesResponse } from './types'

export type CompanyVacancyMutationPayload = Record<string, unknown>

export const emptyCompanyVacanciesResponse: CompanyVacanciesResponse = {
  vacancies: [],
  available_skills: [],
}

export async function fetchCompanyVacancies(signal?: AbortSignal) {
  return apiRequest<CompanyVacanciesResponse>('/company/vacancies', { signal })
}

export async function saveCompanyVacancy(options: {
  vacancyId?: number | null
  payload: CompanyVacancyMutationPayload
  csrfToken?: string | null
}) {
  const { vacancyId, payload, csrfToken } = options

  if (vacancyId) {
    return apiRequest(`/company/vacancies/${vacancyId}`, {
      method: 'PUT',
      body: payload,
      csrfToken,
    })
  }

  return apiRequest('/company/vacancies', {
    method: 'POST',
    body: payload,
    csrfToken,
  })
}

export async function retireCompanyVacancy(vacancyId: number, csrfToken?: string | null) {
  return apiRequest(`/company/vacancies/${vacancyId}`, {
    method: 'DELETE',
    csrfToken,
  })
}
