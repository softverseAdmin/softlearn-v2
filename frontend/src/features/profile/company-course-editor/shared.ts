import type { ChangeEvent } from 'react'

import type { AdminCoursesResponse, AdminLessonRecord } from '@/features/admin/types'

export const emptyCoursesResponse: AdminCoursesResponse = {
  courses: [],
}

export const fieldClassName =
  'h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
export const textAreaClassName =
  'w-full rounded-none border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
export const editorCardClassName = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'

export type CompanyCourseEditorPageProps = {
  mode: 'create' | 'edit'
  workspaceRole?: 'company' | 'teacher'
}

export type LessonDraft = {
  lessonId: number | null
  id: string
  title: string
  description: string
  transcript: string
  type: 'video' | 'article' | 'quiz' | 'project' | 'external-link'
  videoUrl: string
  content: string
  externalResourceUrl: string
  duration: string
  isPreviewFree: boolean
  order: string
}

export type ImageUploadPanelProps = {
  label: string
  image: string
  alt: string
  isLoading: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

function createDraftId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createLessonDraftFromRecord(lesson: AdminLessonRecord): LessonDraft {
  return {
    lessonId: lesson.lesson_id,
    id: createDraftId('lesson'),
    title: lesson.title,
    description: lesson.summary,
    transcript: lesson.transcript,
    type: lesson.video_url ? 'video' : 'article',
    videoUrl: lesson.video_url,
    content: lesson.content,
    externalResourceUrl: '',
    duration: '',
    isPreviewFree: false,
    order: String(lesson.sequence_number),
  }
}

export function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to read image file.'))
    }
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })
}

export function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatDuration(hours: number) {
  if (hours <= 0) {
    return 'Self-paced'
  }

  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) {
    return `${minutes}m total`
  }

  if (minutes === 0) {
    return `${wholeHours}h total`
  }

  return `${wholeHours}h ${minutes}m total`
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function dedupeText(items: Array<string | null | undefined>) {
  const seen = new Set<string>()

  return items.filter((item): item is string => {
    if (!item) {
      return false
    }

    const normalized = item.trim()
    if (!normalized) {
      return false
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}
