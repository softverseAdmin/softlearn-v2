import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '@/lib/api'

import type { StudentProfile, StudentSkillsResponse } from '../types'

export const studentProfileQueryKeys = {
  details: ['student-profile', 'details'] as const,
}

export type StudentProfileQueryData = {
  profile: StudentProfile
  skills: StudentSkillsResponse
}

export function studentProfileQueryOptions() {
  return queryOptions({
    queryKey: studentProfileQueryKeys.details,
    queryFn: async (): Promise<StudentProfileQueryData> => {
      const [profile, skills] = await Promise.all([
        apiRequest<StudentProfile>('/student/profile'),
        apiRequest<StudentSkillsResponse>('/student/skills'),
      ])

      return {
        profile,
        skills,
      }
    },
  })
}
