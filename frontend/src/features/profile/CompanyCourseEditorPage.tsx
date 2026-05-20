import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseLessonsResponse, AdminCourseRecord, AdminCoursesResponse } from '../admin/types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CoursePreviewHero, CoursePreviewSidebar } from './company-course-editor/EditorPreview'
import { ImageUploadPanel } from './company-course-editor/ImageUploadPanel'
import {
  createLessonDraftFromRecord,
  dedupeText,
  editorCardClassName,
  emptyCoursesResponse,
  fieldClassName,
  formatLabel,
  readImageFile,
  textAreaClassName,
} from './company-course-editor/shared'
import type { CompanyCourseEditorPageProps, LessonDraft } from './company-course-editor/shared'

type EditorFieldName =
  | 'title'
  | 'fullDescription'
  | 'category'
  | 'courseLevel'
  | 'totalDuration'
  | 'status'
  | 'thumbnailAltText'
  | 'previewTitle'
  | 'previewShortDescription'
  | 'previewVideoUrl'
  | 'previewThumbnailImage'
  | 'previewDuration'
  | 'previewAccessType'
  | 'previewOrder'
  | 'previewStatus'

type EditorFieldErrors = Partial<Record<EditorFieldName, string>>

const courseStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Published' },
  { value: 'inactive', label: 'Inactive' },
] as const

const courseLevelOptions = [
  { value: '', label: 'Select level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'beginner to advanced', label: 'Beginner to Advanced' },
] as const

const previewAccessTypeOptions = [
  { value: 'free_preview', label: 'Free preview' },
  { value: 'enrolled_only', label: 'Enrolled only' },
] as const

const previewStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
] as const

function getInputClassName(hasError: boolean) {
  return cn(fieldClassName, hasError && 'border-red-500 focus-visible:ring-red-500/30')
}

function getTextAreaClassName(hasError: boolean) {
  return cn(textAreaClassName, hasError && 'border-red-500 focus-visible:ring-red-500/30')
}

function getFirstDetailMessage(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (Array.isArray(value)) {
    const firstMessage = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0)
    if (firstMessage) {
      return firstMessage
    }
  }

  return null
}

function extractFieldErrors(details: unknown): EditorFieldErrors {
  if (!details || typeof details !== 'object') {
    return {}
  }

  const nextFieldErrors: EditorFieldErrors = {}
  for (const [key, value] of Object.entries(details as Record<string, unknown>)) {
    const message = getFirstDetailMessage(value)
    if (!message) {
      continue
    }

    if (
      key === 'title' ||
      key === 'description' ||
      key === 'category' ||
      key === 'difficulty_level' ||
      key === 'estimated_hours' ||
      key === 'status' ||
      key === 'thumbnail_alt_text' ||
      key === 'preview_title' ||
      key === 'preview_short_description' ||
      key === 'preview_video_url' ||
      key === 'preview_thumbnail_image' ||
      key === 'preview_duration' ||
      key === 'preview_access_type' ||
      key === 'preview_order' ||
      key === 'preview_status'
    ) {
      const mappedKey: EditorFieldName =
        key === 'description'
          ? 'fullDescription'
          : key === 'difficulty_level'
            ? 'courseLevel'
            : key === 'estimated_hours'
              ? 'totalDuration'
              : key === 'thumbnail_alt_text'
                ? 'thumbnailAltText'
                : key === 'preview_title'
                  ? 'previewTitle'
                  : key === 'preview_short_description'
                    ? 'previewShortDescription'
                    : key === 'preview_video_url'
                      ? 'previewVideoUrl'
                      : key === 'preview_thumbnail_image'
                        ? 'previewThumbnailImage'
                        : key === 'preview_duration'
                          ? 'previewDuration'
                          : key === 'preview_access_type'
                            ? 'previewAccessType'
                            : key === 'preview_order'
                              ? 'previewOrder'
                              : key === 'preview_status'
                                ? 'previewStatus'
                                : (key as EditorFieldName)

      nextFieldErrors[mappedKey] = message
    }
  }

  return nextFieldErrors
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidImageReference(value: string) {
  if (!value.trim()) {
    return false
  }

  return value.startsWith('/') || isValidUrl(value)
}

function parseOptionalInteger(value: string) {
  if (!value.trim()) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function validateForm(values: {
  title: string
  fullDescription: string
  category: string
  courseLevel: string
  totalDuration: string
  status: string
  thumbnailAltText: string
  previewTitle: string
  previewShortDescription: string
  previewVideoUrl: string
  previewThumbnailImage: string
  hasPendingPreviewThumbnailFile: boolean
  previewDuration: string
  previewAccessType: string
  previewOrder: string
  previewStatus: string
}) {
  const nextFieldErrors: EditorFieldErrors = {}

  if (!values.title.trim()) {
    nextFieldErrors.title = 'Course title is required.'
  }
  if (values.title.trim().length > 255) {
    nextFieldErrors.title = 'Course title must be 255 characters or fewer.'
  }
  if (values.fullDescription.trim().length > 0 && values.fullDescription.trim().length < 20) {
    nextFieldErrors.fullDescription = 'Course description should be at least 20 characters when provided.'
  }
  if (!values.category.trim()) {
    nextFieldErrors.category = 'Course category is required.'
  }
  if (!courseStatusOptions.some((option) => option.value === values.status)) {
    nextFieldErrors.status = 'Select a valid course status.'
  }

  const totalDurationValue = parseOptionalInteger(values.totalDuration)
  if (totalDurationValue === null || totalDurationValue < 0) {
    nextFieldErrors.totalDuration = 'Total duration must be zero or greater.'
  }

  if (values.thumbnailAltText.trim().length > 255) {
    nextFieldErrors.thumbnailAltText = 'Alt text must be 255 characters or fewer.'
  }

  if (!values.previewTitle.trim()) {
    nextFieldErrors.previewTitle = 'Preview title is required.'
  }
  if (!values.previewShortDescription.trim()) {
    nextFieldErrors.previewShortDescription = 'Preview short description is required.'
  } else if (values.previewShortDescription.trim().length > 500) {
    nextFieldErrors.previewShortDescription = 'Preview short description must be 500 characters or fewer.'
  }

  if (!values.previewVideoUrl.trim()) {
    nextFieldErrors.previewVideoUrl = 'Preview video URL is required.'
  } else if (!isValidUrl(values.previewVideoUrl.trim())) {
    nextFieldErrors.previewVideoUrl = 'Preview video URL must be a valid URL.'
  }

  if (!values.hasPendingPreviewThumbnailFile && !isValidImageReference(values.previewThumbnailImage.trim())) {
    nextFieldErrors.previewThumbnailImage = 'Provide a preview image URL or upload a preview image.'
  }

  const previewDurationValue = parseOptionalInteger(values.previewDuration)
  if (previewDurationValue === null || previewDurationValue <= 0) {
    nextFieldErrors.previewDuration = 'Preview duration must be greater than zero.'
  }

  if (!previewAccessTypeOptions.some((option) => option.value === values.previewAccessType)) {
    nextFieldErrors.previewAccessType = 'Select a valid preview access type.'
  }

  const previewOrderValue = parseOptionalInteger(values.previewOrder)
  if (previewOrderValue === null || previewOrderValue <= 0) {
    nextFieldErrors.previewOrder = 'Preview order must be greater than zero.'
  }

  if (!previewStatusOptions.some((option) => option.value === values.previewStatus)) {
    nextFieldErrors.previewStatus = 'Select a valid preview status.'
  }

  return nextFieldErrors
}

function FieldError({ error, id }: { error?: string; id: string }) {
  if (!error) {
    return null
  }

  return (
    <p id={id} className="text-sm text-red-600" role="alert">
      {error}
    </p>
  )
}

export function CompanyCourseEditorPage({ mode, workspaceRole = 'company' }: CompanyCourseEditorPageProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const workspacePrefix = workspaceRole === 'teacher' ? '/teacher' : '/company'
  const coursesPath = `${workspacePrefix}/courses`
  const lessonsPath = courseId ? `${workspacePrefix}/courses/${courseId}/lessons` : null

  const [data, setData] = useState<AdminCoursesResponse>(emptyCoursesResponse)
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadingLessons, setLoadingLessons] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [category, setCategory] = useState('')
  const [courseLevel, setCourseLevel] = useState('')
  const [status, setStatus] = useState('draft')
  const [thumbnailImage, setThumbnailImage] = useState('')
  const [thumbnailAltText, setThumbnailAltText] = useState('')
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null)
  const [isReadingThumbnail, setIsReadingThumbnail] = useState(false)
  const [shouldClearThumbnailUpload, setShouldClearThumbnailUpload] = useState(false)
  const [totalDuration, setTotalDuration] = useState('0')
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewShortDescription, setPreviewShortDescription] = useState('')
  const [previewVideoUrl, setPreviewVideoUrl] = useState('')
  const [previewThumbnailImage, setPreviewThumbnailImage] = useState('')
  const [pendingPreviewThumbnailFile, setPendingPreviewThumbnailFile] = useState<File | null>(null)
  const [isReadingPreviewThumbnail, setIsReadingPreviewThumbnail] = useState(false)
  const [shouldClearPreviewThumbnailUpload, setShouldClearPreviewThumbnailUpload] = useState(false)
  const [previewDuration, setPreviewDuration] = useState('')
  const [previewAccessType, setPreviewAccessType] = useState<'free_preview' | 'enrolled_only'>('free_preview')
  const [previewOrder, setPreviewOrder] = useState('1')
  const [previewStatus, setPreviewStatus] = useState<'draft' | 'published'>('draft')
  const [lessons, setLessons] = useState<LessonDraft[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EditorFieldErrors>({})

  const selectedCourse = useMemo(() => {
    if (mode !== 'edit' || !courseId) {
      return null
    }

    return data.courses.find((course) => String(course.course_id) === courseId) ?? null
  }, [courseId, data.courses, mode])

  const canEditSelectedCourse = mode !== 'edit' || Boolean(selectedCourse?.can_edit)
  const learnerCount = selectedCourse?.learning_record_count ?? 0
  const previewDurationValue = parseOptionalInteger(previewDuration)
  const courseTags = useMemo(
    () =>
      dedupeText([
        category.trim() ? formatLabel(category) : null,
        courseLevel.trim() ? formatLabel(courseLevel) : null,
        previewAccessType ? formatLabel(previewAccessType) : null,
      ]).slice(0, 4),
    [category, courseLevel, previewAccessType],
  )
  const populatedLessonCount = lessons.filter(
    (lesson) =>
      lesson.title.trim() ||
      lesson.description.trim() ||
      lesson.content.trim() ||
      lesson.videoUrl.trim() ||
      lesson.transcript.trim(),
  ).length
  const lessonsWithTranscriptCount = lessons.filter((lesson) => lesson.transcript.trim()).length

  useEffect(() => {
    if (mode !== 'edit') {
      return
    }

    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<AdminCoursesResponse>(`${workspacePrefix}/courses`)
        if (!active) {
          return
        }

        setData(response)
        setError(null)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message = loadError instanceof ApiError ? loadError.message : 'Unable to load course.'
        setError(message)
        toast.error(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCourses()
    return () => {
      active = false
    }
  }, [mode, workspacePrefix])

  useEffect(() => {
    if (mode !== 'edit' || !selectedCourse) {
      return
    }

    setTitle(selectedCourse.title)
    setFullDescription(selectedCourse.description)
    setCategory(selectedCourse.category)
    setCourseLevel(selectedCourse.difficulty_level)
    setStatus(selectedCourse.status || 'draft')
    setTotalDuration(String(selectedCourse.estimated_hours ?? 0))
    setThumbnailImage(selectedCourse.thumbnail_image || '')
    setThumbnailAltText(selectedCourse.thumbnail_alt_text || '')
    setPendingThumbnailFile(null)
    setShouldClearThumbnailUpload(false)
    setPreviewTitle(selectedCourse.preview_title || '')
    setPreviewShortDescription(selectedCourse.preview_short_description || '')
    setPreviewVideoUrl(selectedCourse.preview_video_url || '')
    setPreviewThumbnailImage(selectedCourse.preview_thumbnail_image || '')
    setPendingPreviewThumbnailFile(null)
    setShouldClearPreviewThumbnailUpload(false)
    setPreviewDuration(String(selectedCourse.preview_duration ?? ''))
    setPreviewAccessType((selectedCourse.preview_access_type as 'free_preview' | 'enrolled_only') || 'free_preview')
    setPreviewOrder(String(selectedCourse.preview_order ?? 1))
    setPreviewStatus((selectedCourse.preview_status as 'draft' | 'published') || 'draft')
    setFieldErrors({})
  }, [mode, selectedCourse])

  useEffect(() => {
    if (mode !== 'edit' || !courseId) {
      setLoadingLessons(false)
      return
    }

    let active = true

    async function loadLessons() {
      try {
        const response = await apiRequest<AdminCourseLessonsResponse>(`${workspacePrefix}/courses/${courseId}/lessons`)
        if (!active) {
          return
        }

        const editableLessons = response.lessons.filter((lesson) => lesson.status !== 'inactive')
        setLessons(editableLessons.map(createLessonDraftFromRecord))
      } catch (loadError) {
        if (!active) {
          return
        }

        const message = loadError instanceof ApiError ? loadError.message : 'Unable to load lessons.'
        setError(message)
        toast.error(message)
      } finally {
        if (active) {
          setLoadingLessons(false)
        }
      }
    }

    void loadLessons()
    return () => {
      active = false
    }
  }, [courseId, mode, workspacePrefix])

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    options: {
      setImage: (value: string) => void
      setFile: (value: File | null) => void
      setReadingState: (value: boolean) => void
      clearFlag: (value: boolean) => void
      errorField: EditorFieldName
    },
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    options.setReadingState(true)
    try {
      const imageData = await readImageFile(file)
      options.setImage(imageData)
      options.setFile(file)
      options.clearFlag(false)
      setError(null)
      setFieldErrors((current) => ({ ...current, [options.errorField]: undefined }))
    } catch (readError) {
      const message = readError instanceof Error ? readError.message : 'Unable to read image file.'
      setError(message)
      toast.error(message)
      event.target.value = ''
    } finally {
      options.setReadingState(false)
    }
  }

  function updateField<K extends EditorFieldName>(field: K, setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setError(null)
      setFieldErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextFieldErrors = validateForm({
      title,
      fullDescription,
      category,
      courseLevel,
      totalDuration,
      status,
      thumbnailAltText,
      previewTitle,
      previewShortDescription,
      previewVideoUrl,
      previewThumbnailImage,
      hasPendingPreviewThumbnailFile: Boolean(pendingPreviewThumbnailFile),
      previewDuration,
      previewAccessType,
      previewOrder,
      previewStatus,
    })

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Please review the highlighted fields and try again.')
      return
    }

    setSaving(true)
    setError(null)
    setFieldErrors({})

    const totalDurationValue = parseOptionalInteger(totalDuration) ?? 0
    const previewDurationValue = parseOptionalInteger(previewDuration) ?? 0
    const previewOrderValue = parseOptionalInteger(previewOrder) ?? 1

    try {
      const body = {
        title: title.trim(),
        description: fullDescription.trim(),
        category: category.trim(),
        difficulty_level: courseLevel.trim(),
        estimated_hours: totalDurationValue,
        thumbnail_image: pendingThumbnailFile ? '' : thumbnailImage.trim(),
        thumbnail_alt_text: thumbnailAltText.trim(),
        preview_title: previewTitle.trim(),
        preview_short_description: previewShortDescription.trim(),
        preview_video_url: previewVideoUrl.trim(),
        preview_thumbnail_image: pendingPreviewThumbnailFile ? '' : previewThumbnailImage.trim(),
        preview_thumbnail_upload_pending: Boolean(pendingPreviewThumbnailFile),
        preview_duration: previewDurationValue,
        preview_access_type: previewAccessType,
        preview_order: previewOrderValue,
        preview_status: previewStatus,
        status,
      }

      let savedCourse: AdminCourseRecord
      if (mode === 'edit' && courseId) {
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${courseId}`, {
          method: 'PUT',
          body,
          csrfToken,
          notifyOnError: false,
        })
      } else {
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses`, {
          method: 'POST',
          body,
          csrfToken,
          notifyOnError: false,
        })
      }

      if (mode === 'edit' && courseId && shouldClearThumbnailUpload && !pendingThumbnailFile && !thumbnailImage.trim()) {
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${courseId}/thumbnail`, {
          method: 'DELETE',
          csrfToken,
          notifyOnError: false,
        })
      }

      if (
        mode === 'edit' &&
        courseId &&
        shouldClearPreviewThumbnailUpload &&
        !pendingPreviewThumbnailFile &&
        !previewThumbnailImage.trim()
      ) {
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${courseId}/preview-thumbnail`, {
          method: 'DELETE',
          csrfToken,
          notifyOnError: false,
        })
      }

      if (pendingThumbnailFile) {
        const formData = new FormData()
        formData.set('file', pendingThumbnailFile)
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${savedCourse.course_id}/thumbnail`, {
          method: 'POST',
          body: formData,
          csrfToken,
          notifyOnError: false,
        })
        setThumbnailImage(savedCourse.thumbnail_image || '')
        setPendingThumbnailFile(null)
        setShouldClearThumbnailUpload(false)
      }

      if (pendingPreviewThumbnailFile) {
        const formData = new FormData()
        formData.set('file', pendingPreviewThumbnailFile)
        savedCourse = await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${savedCourse.course_id}/preview-thumbnail`, {
          method: 'POST',
          body: formData,
          csrfToken,
          notifyOnError: false,
        })
        setPreviewThumbnailImage(savedCourse.preview_thumbnail_image || '')
        setPendingPreviewThumbnailFile(null)
        setShouldClearPreviewThumbnailUpload(false)
      }

      toast.success(mode === 'edit' ? 'Course updated successfully.' : 'Course created successfully.')
      navigate(mode === 'edit' ? coursesPath : `${workspacePrefix}/courses/${savedCourse.course_id}/lessons`)
    } catch (saveError) {
      const apiFieldErrors = saveError instanceof ApiError ? extractFieldErrors(saveError.details) : {}
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors)
      }

      const message =
        saveError instanceof ApiError
          ? saveError.message
          : saveError instanceof Error
            ? saveError.message
            : 'Unable to save course.'
      setError(message)
      if (!(saveError instanceof ApiError && saveError.notified)) {
        toast.error(message)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRetire() {
    if (mode !== 'edit' || !courseId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await apiRequest<AdminCourseRecord>(`${workspacePrefix}/courses/${courseId}`, {
        method: 'DELETE',
        csrfToken,
        notifyOnError: false,
      })
      toast.success('Course retired successfully.')
      navigate(coursesPath)
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to retire course.'
      setError(message)
      if (!(saveError instanceof ApiError && saveError.notified)) {
        toast.error(message)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingLessons) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
        <div className={editorCardClassName}>
          <LoadingState title="Loading course editor" className="min-h-72 py-20" />
        </div>
      </div>
    )
  }

  if (mode === 'edit' && !selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error ?? 'Course was not found.'}
        </div>
      </div>
    )
  }

  if (mode === 'edit' && selectedCourse && !canEditSelectedCourse) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to={workspacePrefix} className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={coursesPath} className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Edit course</span>
        </div>

        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 dark:border-red-900 dark:bg-red-950">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Course editing is not available</h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            Only courses you created can be edited or managed from this workspace.
          </p>
          <div className="mt-5">
            <Link to={coursesPath} className="inline-flex items-center text-sm font-medium text-red-900 underline dark:text-red-100">
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to={workspacePrefix} className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={coursesPath} className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{mode === 'edit' ? 'Edit course' : 'Create course'}</span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <main className={editorCardClassName}>
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <CoursePreviewHero
              previewThumbnailImage={previewThumbnailImage}
              previewTitle={previewTitle.trim() || 'Preview title'}
              previewDescription={previewShortDescription.trim() || 'Add the learner-facing preview summary here.'}
              learnerCount={learnerCount}
              previewDuration={previewDurationValue}
              previewAccessType={previewAccessType}
              previewStatus={previewStatus}
              courseTags={courseTags}
              mode={mode}
              courseId={courseId}
              lessonsHref={lessonsPath}
              saving={saving}
              onBack={() => navigate(coursesPath)}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course basics</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Save the core course identity and description that the catalog and editor rely on.
                    </p>
                  </div>

                  <div className="mb-5 space-y-5">
                    <ImageUploadPanel
                      label="Course thumbnail"
                      image={thumbnailImage}
                      alt={thumbnailAltText || 'Course thumbnail'}
                      isLoading={isReadingThumbnail}
                      onChange={(event) =>
                        void handleImageChange(event, {
                          setImage: setThumbnailImage,
                          setFile: setPendingThumbnailFile,
                          setReadingState: setIsReadingThumbnail,
                          clearFlag: setShouldClearThumbnailUpload,
                          errorField: 'thumbnailAltText',
                        })
                      }
                      onRemove={() => {
                        setThumbnailImage('')
                        setPendingThumbnailFile(null)
                        setShouldClearThumbnailUpload(true)
                        setError(null)
                      }}
                    />

                    <label className="block space-y-2" htmlFor="course-thumbnail-alt-text">
                      <span className="text-sm font-medium text-foreground">Thumbnail alt text</span>
                      <input
                        id="course-thumbnail-alt-text"
                        className={getInputClassName(Boolean(fieldErrors.thumbnailAltText))}
                        value={thumbnailAltText}
                        onChange={(event) => updateField('thumbnailAltText', setThumbnailAltText)(event.target.value)}
                        placeholder="Describe the course thumbnail for accessibility."
                        aria-invalid={fieldErrors.thumbnailAltText ? 'true' : undefined}
                        aria-describedby={fieldErrors.thumbnailAltText ? 'course-thumbnail-alt-text-error' : undefined}
                      />
                      <FieldError id="course-thumbnail-alt-text-error" error={fieldErrors.thumbnailAltText} />
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2" htmlFor="course-title">
                      <span className="text-sm font-medium text-foreground">Course title</span>
                      <input
                        id="course-title"
                        className={getInputClassName(Boolean(fieldErrors.title))}
                        value={title}
                        onChange={(event) => updateField('title', setTitle)(event.target.value)}
                        aria-invalid={fieldErrors.title ? 'true' : undefined}
                        aria-describedby={fieldErrors.title ? 'course-title-error' : undefined}
                      />
                      <FieldError id="course-title-error" error={fieldErrors.title} />
                    </label>
                  </div>

                  <label className="mt-5 block space-y-2" htmlFor="course-description">
                    <span className="text-sm font-medium text-foreground">Full description</span>
                    <textarea
                      id="course-description"
                      className={getTextAreaClassName(Boolean(fieldErrors.fullDescription))}
                      rows={6}
                      value={fullDescription}
                      onChange={(event) => updateField('fullDescription', setFullDescription)(event.target.value)}
                      placeholder="Detailed course overview, outcomes, and expectations."
                      aria-invalid={fieldErrors.fullDescription ? 'true' : undefined}
                      aria-describedby={fieldErrors.fullDescription ? 'course-description-error' : undefined}
                    />
                    <FieldError id="course-description-error" error={fieldErrors.fullDescription} />
                  </label>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Catalog positioning</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Define the metadata that powers course listing, filtering, and publishing.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <label className="space-y-2" htmlFor="course-category">
                      <span className="text-sm font-medium text-foreground">Course category</span>
                      <input
                        id="course-category"
                        className={getInputClassName(Boolean(fieldErrors.category))}
                        value={category}
                        onChange={(event) => updateField('category', setCategory)(event.target.value)}
                        aria-invalid={fieldErrors.category ? 'true' : undefined}
                        aria-describedby={fieldErrors.category ? 'course-category-error' : undefined}
                      />
                      <FieldError id="course-category-error" error={fieldErrors.category} />
                    </label>

                    <label className="space-y-2" htmlFor="course-level">
                      <span className="text-sm font-medium text-foreground">Course level</span>
                      <select
                        id="course-level"
                        className={getInputClassName(Boolean(fieldErrors.courseLevel))}
                        value={courseLevel}
                        onChange={(event) => updateField('courseLevel', setCourseLevel)(event.target.value)}
                        aria-invalid={fieldErrors.courseLevel ? 'true' : undefined}
                        aria-describedby={fieldErrors.courseLevel ? 'course-level-error' : undefined}
                      >
                        {courseLevelOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FieldError id="course-level-error" error={fieldErrors.courseLevel} />
                    </label>

                    <label className="space-y-2" htmlFor="course-status">
                      <span className="text-sm font-medium text-foreground">Course status</span>
                      <select
                        id="course-status"
                        className={getInputClassName(Boolean(fieldErrors.status))}
                        value={status}
                        onChange={(event) => updateField('status', setStatus)(event.target.value)}
                        aria-invalid={fieldErrors.status ? 'true' : undefined}
                        aria-describedby={fieldErrors.status ? 'course-status-error' : undefined}
                      >
                        {courseStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FieldError id="course-status-error" error={fieldErrors.status} />
                    </label>

                    <label className="space-y-2" htmlFor="course-duration">
                      <span className="text-sm font-medium text-foreground">Total duration (hours)</span>
                      <input
                        id="course-duration"
                        className={getInputClassName(Boolean(fieldErrors.totalDuration))}
                        type="number"
                        min={0}
                        value={totalDuration}
                        onChange={(event) => updateField('totalDuration', setTotalDuration)(event.target.value)}
                        aria-invalid={fieldErrors.totalDuration ? 'true' : undefined}
                        aria-describedby={fieldErrors.totalDuration ? 'course-duration-error' : undefined}
                      />
                      <FieldError id="course-duration-error" error={fieldErrors.totalDuration} />
                    </label>
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course preview</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Configure the dedicated preview content that is saved with the course and loaded again in edit mode.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <ImageUploadPanel
                      label="Preview thumbnail / image"
                      image={previewThumbnailImage}
                      alt={previewTitle || 'Course preview image'}
                      isLoading={isReadingPreviewThumbnail}
                      onChange={(event) =>
                        void handleImageChange(event, {
                          setImage: setPreviewThumbnailImage,
                          setFile: setPendingPreviewThumbnailFile,
                          setReadingState: setIsReadingPreviewThumbnail,
                          clearFlag: setShouldClearPreviewThumbnailUpload,
                          errorField: 'previewThumbnailImage',
                        })
                      }
                      onRemove={() => {
                        setPreviewThumbnailImage('')
                        setPendingPreviewThumbnailFile(null)
                        setShouldClearPreviewThumbnailUpload(true)
                        setError(null)
                        setFieldErrors((current) => ({ ...current, previewThumbnailImage: undefined }))
                      }}
                    />

                    <label className="block space-y-2" htmlFor="course-preview-image-url">
                      <span className="text-sm font-medium text-foreground">Preview image URL</span>
                      <input
                        id="course-preview-image-url"
                        className={getInputClassName(Boolean(fieldErrors.previewThumbnailImage))}
                        type="url"
                        value={pendingPreviewThumbnailFile ? '' : previewThumbnailImage}
                        onChange={(event) => {
                          setPendingPreviewThumbnailFile(null)
                          setShouldClearPreviewThumbnailUpload(false)
                          updateField('previewThumbnailImage', setPreviewThumbnailImage)(event.target.value)
                        }}
                        placeholder="https://cdn.example.com/course-preview.webp"
                        aria-invalid={fieldErrors.previewThumbnailImage ? 'true' : undefined}
                        aria-describedby={fieldErrors.previewThumbnailImage ? 'course-preview-image-url-error' : undefined}
                      />
                      <FieldError id="course-preview-image-url-error" error={fieldErrors.previewThumbnailImage} />
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="space-y-2" htmlFor="course-preview-title">
                        <span className="text-sm font-medium text-foreground">Preview title</span>
                        <input
                          id="course-preview-title"
                          className={getInputClassName(Boolean(fieldErrors.previewTitle))}
                          value={previewTitle}
                          onChange={(event) => updateField('previewTitle', setPreviewTitle)(event.target.value)}
                          aria-invalid={fieldErrors.previewTitle ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewTitle ? 'course-preview-title-error' : undefined}
                        />
                        <FieldError id="course-preview-title-error" error={fieldErrors.previewTitle} />
                      </label>

                      <label className="space-y-2" htmlFor="course-preview-video-url">
                        <span className="text-sm font-medium text-foreground">Preview video URL</span>
                        <input
                          id="course-preview-video-url"
                          className={getInputClassName(Boolean(fieldErrors.previewVideoUrl))}
                          type="url"
                          value={previewVideoUrl}
                          onChange={(event) => updateField('previewVideoUrl', setPreviewVideoUrl)(event.target.value)}
                          placeholder="https://example.com/videos/course-preview"
                          aria-invalid={fieldErrors.previewVideoUrl ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewVideoUrl ? 'course-preview-video-url-error' : undefined}
                        />
                        <FieldError id="course-preview-video-url-error" error={fieldErrors.previewVideoUrl} />
                      </label>
                    </div>

                    <label className="block space-y-2" htmlFor="course-preview-short-description">
                      <span className="text-sm font-medium text-foreground">Preview short description</span>
                      <textarea
                        id="course-preview-short-description"
                        className={getTextAreaClassName(Boolean(fieldErrors.previewShortDescription))}
                        rows={4}
                        value={previewShortDescription}
                        onChange={(event) => updateField('previewShortDescription', setPreviewShortDescription)(event.target.value)}
                        placeholder="Summarize the preview experience learners will see before they enroll."
                        aria-invalid={fieldErrors.previewShortDescription ? 'true' : undefined}
                        aria-describedby={
                          fieldErrors.previewShortDescription ? 'course-preview-short-description-error' : undefined
                        }
                      />
                      <FieldError id="course-preview-short-description-error" error={fieldErrors.previewShortDescription} />
                    </label>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      <label className="space-y-2" htmlFor="course-preview-duration">
                        <span className="text-sm font-medium text-foreground">Preview duration (minutes)</span>
                        <input
                          id="course-preview-duration"
                          className={getInputClassName(Boolean(fieldErrors.previewDuration))}
                          type="number"
                          min={1}
                          value={previewDuration}
                          onChange={(event) => updateField('previewDuration', setPreviewDuration)(event.target.value)}
                          aria-invalid={fieldErrors.previewDuration ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewDuration ? 'course-preview-duration-error' : undefined}
                        />
                        <FieldError id="course-preview-duration-error" error={fieldErrors.previewDuration} />
                      </label>

                      <label className="space-y-2" htmlFor="course-preview-access-type">
                        <span className="text-sm font-medium text-foreground">Preview access type</span>
                        <select
                          id="course-preview-access-type"
                          className={getInputClassName(Boolean(fieldErrors.previewAccessType))}
                          value={previewAccessType}
                          onChange={(event) =>
                            updateField('previewAccessType', (value) =>
                              setPreviewAccessType(value as 'free_preview' | 'enrolled_only'),
                            )(event.target.value)
                          }
                          aria-invalid={fieldErrors.previewAccessType ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewAccessType ? 'course-preview-access-type-error' : undefined}
                        >
                          {previewAccessTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <FieldError id="course-preview-access-type-error" error={fieldErrors.previewAccessType} />
                      </label>

                      <label className="space-y-2" htmlFor="course-preview-order">
                        <span className="text-sm font-medium text-foreground">Preview order</span>
                        <input
                          id="course-preview-order"
                          className={getInputClassName(Boolean(fieldErrors.previewOrder))}
                          type="number"
                          min={1}
                          value={previewOrder}
                          onChange={(event) => updateField('previewOrder', setPreviewOrder)(event.target.value)}
                          aria-invalid={fieldErrors.previewOrder ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewOrder ? 'course-preview-order-error' : undefined}
                        />
                        <FieldError id="course-preview-order-error" error={fieldErrors.previewOrder} />
                      </label>

                      <label className="space-y-2" htmlFor="course-preview-status">
                        <span className="text-sm font-medium text-foreground">Preview status</span>
                        <select
                          id="course-preview-status"
                          className={getInputClassName(Boolean(fieldErrors.previewStatus))}
                          value={previewStatus}
                          onChange={(event) =>
                            updateField('previewStatus', (value) => setPreviewStatus(value as 'draft' | 'published'))(event.target.value)
                          }
                          aria-invalid={fieldErrors.previewStatus ? 'true' : undefined}
                          aria-describedby={fieldErrors.previewStatus ? 'course-preview-status-error' : undefined}
                        >
                          {previewStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <FieldError id="course-preview-status-error" error={fieldErrors.previewStatus} />
                      </label>
                    </div>
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson studio handoff</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Keep course creation focused on real saved fields and continue lesson authoring in the dedicated studio.
                      </p>
                    </div>
                    {mode === 'edit' && courseId ? (
                      <Button type="button" variant="outline" asChild>
                        <Link to={`${workspacePrefix}/courses/${courseId}/lessons`}>
                          Open lesson studio
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lessons ready</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{populatedLessonCount}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {mode === 'edit' ? 'Current lesson count loaded from the lesson studio.' : 'Save the course first to start adding lessons.'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Transcripts</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{lessonsWithTranscriptCount}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Transcript coverage is tracked in the lesson studio and reflected here.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next step</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {mode === 'edit' ? 'Refine lessons in the lesson studio.' : 'Create the course, then continue into lesson studio.'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <CoursePreviewSidebar
                courseStatus={status}
                previewStatus={previewStatus}
                previewDuration={previewDurationValue}
                previewAccessType={previewAccessType}
                previewVideoUrl={previewVideoUrl}
                previewOrder={previewOrder}
                populatedLessonCount={populatedLessonCount}
                lessonsLength={lessons.length}
                previewTitle={previewTitle}
                previewDescription={previewShortDescription}
                category={category}
                courseLevel={courseLevel}
                previewThumbnailImage={previewThumbnailImage}
                mode={mode}
                saving={saving}
                onBack={() => navigate(coursesPath)}
                onRetire={() => void handleRetire()}
              />
            </div>
          </main>
        </form>
      </div>
    </div>
  )
}
