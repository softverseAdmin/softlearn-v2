import type { LucideIcon } from 'lucide-react'

import type { StudentDashboardResponse } from '../types'
import type { CourseCatalogRecord } from '../../profile/types'

export const dashboardThumbnailBackgrounds = [
  'from-violet-600 via-indigo-600 to-blue-500',
  'from-cyan-500 via-sky-600 to-indigo-700',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-orange-400 via-amber-500 to-yellow-400',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-slate-700 via-slate-800 to-slate-900',
]

export type StudentDashboardStatCard = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  iconClassName: string
}

export function formatLearningStatus(status: StudentDashboardResponse['continue_learning']['status']) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatLessonStatus(status: NonNullable<StudentDashboardResponse['current_lesson']>['status']) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatCourseDifficulty(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('beginner')) return 'Beginner'
  if (normalized.includes('advanced')) return 'Advanced'
  if (normalized.includes('intermediate')) return 'Intermediate'

  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatCourseCategory(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getRecommendationScore(
  course: CourseCatalogRecord,
  learningData: StudentDashboardResponse | null
) {
  const learningContext = [
    learningData?.continue_learning.roadmap_title ?? '',
    learningData?.continue_learning.topic_title ?? '',
    learningData?.current_lesson?.course_title ?? '',
  ]
    .join(' ')
    .toLowerCase()

  const searchableCourseText = `${course.title} ${course.category} ${course.description}`.toLowerCase()
  const contextTokens = learningContext.split(/\W+/).filter((token) => token.length >= 4)
  const contextMatches = contextTokens.reduce((count, token) => {
    return searchableCourseText.includes(token) ? count + 1 : count
  }, 0)

  return course.readiness_cues.length * 12 + contextMatches * 8 + course.lesson_count - (course.estimated_hours || 0) / 4
}
