import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseLessonsResponse, AdminCourseRecord, AdminCoursesResponse } from '../admin/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CoursePreviewHero, CoursePreviewSidebar } from './company-course-editor/EditorPreview'
import { ImageUploadPanel } from './company-course-editor/ImageUploadPanel'
import {
  buildPreviewSummarySeed,
  createLessonDraftFromRecord,
  dedupeText,
  editorCardClassName,
  emptyCoursesResponse,
  fieldClassName,
  formatLabel,
  readImageFile,
  slugify,
  supportedTechnologies,
  textAreaClassName,
} from './company-course-editor/shared'
import type { CompanyCourseEditorPageProps, LessonDraft } from './company-course-editor/shared'

export function CompanyCourseEditorPage({ mode }: CompanyCourseEditorPageProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminCoursesResponse>(emptyCoursesResponse)
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadingLessons, setLoadingLessons] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [category, setCategory] = useState('')
  const [courseLevel, setCourseLevel] = useState('')
  const [language, setLanguage] = useState('English')
  const [courseType, setCourseType] = useState<'free' | 'premium'>('free')
  const [status, setStatus] = useState('')
  const [thumbnailImage, setThumbnailImage] = useState('')
  const [thumbnailAltText, setThumbnailAltText] = useState('')
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null)
  const [isReadingThumbnail, setIsReadingThumbnail] = useState(false)
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [isFreeCourse, setIsFreeCourse] = useState(true)
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  const [totalDuration, setTotalDuration] = useState('')
  const [certificateAvailable, setCertificateAvailable] = useState(false)
  const [interviewPrepIncluded, setInterviewPrepIncluded] = useState(false)
  const [capstoneProjectIncluded, setCapstoneProjectIncluded] = useState(false)
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [lessons, setLessons] = useState<LessonDraft[]>([])
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [starterCodeUrl, setStarterCodeUrl] = useState('')
  const [submissionRequired, setSubmissionRequired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedCourse = useMemo(() => {
    if (mode !== 'edit' || !courseId) {
      return null
    }

    return data.courses.find((course) => String(course.course_id) === courseId) ?? null
  }, [courseId, data.courses, mode])
  const canEditSelectedCourse = mode !== 'edit' || Boolean(selectedCourse?.can_edit)
  const previewTitle = title.trim() || (mode === 'edit' ? selectedCourse?.title ?? 'Course title' : 'New course concept')
  const previewDescription =
    shortDescription.trim() ||
    fullDescription.trim() ||
    'Shape the learner-facing story here so the catalog card and course detail page feel production-ready from day one.'
  const normalizedDuration = Number.parseInt(totalDuration, 10)
  const estimatedHours = Number.isNaN(normalizedDuration) ? 0 : Math.max(0, normalizedDuration)
  const learnerCount = selectedCourse?.learning_record_count ?? 0
  const courseTags = useMemo(
    () =>
      dedupeText([
        category ? formatLabel(category) : null,
        courseLevel ? formatLabel(courseLevel) : null,
        language || null,
        courseType === 'premium' ? 'Premium' : 'Free',
        certificateAvailable ? 'Certificate' : null,
      ]).slice(0, 5),
    [category, certificateAvailable, courseLevel, courseType, language],
  )
  const learningHighlights = useMemo(
    () =>
      dedupeText([
        shortDescription || null,
        ...selectedTechnologies.slice(0, 3).map((technology) => `Build confidence with ${technology}.`),
        ...lessons
          .map((module) => module.title.trim())
          .filter(Boolean)
          .slice(0, 2)
          .map((lessonTitle) => `Progress through ${lessonTitle}.`),
        capstoneProjectIncluded || projectTitle.trim() ? 'Finish with a capstone-style project.' : null,
        interviewPrepIncluded ? 'Include interview-focused practice and takeaways.' : null,
      ]).slice(0, 6),
    [capstoneProjectIncluded, interviewPrepIncluded, lessons, projectTitle, selectedTechnologies, shortDescription],
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
    if (slugTouched) {
      return
    }

    setSlug(slugify(title))
  }, [slugTouched, title])

  useEffect(() => {
    if (mode !== 'edit') {
      return
    }

    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<AdminCoursesResponse>('/company/courses')
        if (active) {
          setData(response)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          const message = loadError instanceof ApiError ? loadError.message : 'Unable to load course.'
          setError(message)
          toast.error(message)
        }
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
  }, [mode])

  useEffect(() => {
    if (mode !== 'edit' || !selectedCourse) {
      return
    }

    setTitle(selectedCourse.title)
    setSlug(slugify(selectedCourse.title))
    setShortDescription(buildPreviewSummarySeed(selectedCourse.description))
    setFullDescription(selectedCourse.description)
    setCategory(selectedCourse.category)
    setCourseLevel(selectedCourse.difficulty_level)
    setTotalDuration(String(selectedCourse.estimated_hours))
    setStatus(selectedCourse.status)
    setThumbnailImage(selectedCourse.thumbnail_image || '')
    setThumbnailAltText(selectedCourse.thumbnail_alt_text || '')
    setPendingThumbnailFile(null)
  }, [mode, selectedCourse])

  useEffect(() => {
    if (mode !== 'edit' || !courseId) {
      setLoadingLessons(false)
      return
    }

    let active = true

    async function loadLessons() {
      try {
        const response = await apiRequest<AdminCourseLessonsResponse>(`/company/courses/${courseId}/lessons`)
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
  }, [courseId, mode])

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    setImage: (value: string) => void,
    setReadingState: (value: boolean) => void,
    options?: { trackFile?: boolean },
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setReadingState(true)
    try {
      const imageData = await readImageFile(file)
      setImage(imageData)
      if (options?.trackFile) {
        setPendingThumbnailFile(file)
      }
      setError(null)
    } catch (readError) {
      const message = readError instanceof Error ? readError.message : 'Unable to read image file.'
      setError(message)
      toast.error(message)
      event.target.value = ''
    } finally {
      setReadingState(false)
    }
  }

  function toggleTechnology(technology: string) {
    setSelectedTechnologies((current) =>
      current.includes(technology)
        ? current.filter((item) => item !== technology)
        : [...current, technology]
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const normalizedDuration = Number.parseInt(totalDuration, 10)

    try {
      const body = {
        title,
        description: fullDescription.trim() || shortDescription.trim(),
        category,
        difficulty_level: courseLevel,
        estimated_hours: Number.isNaN(normalizedDuration) ? 0 : Math.max(0, normalizedDuration),
        thumbnail_image: pendingThumbnailFile ? '' : thumbnailImage.trim(),
        thumbnail_alt_text: thumbnailAltText.trim(),
        status,
      }

      let savedCourse: AdminCourseRecord
      if (mode === 'edit' && courseId) {
        savedCourse = await apiRequest<AdminCourseRecord>(`/company/courses/${courseId}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
      } else {
        savedCourse = await apiRequest<AdminCourseRecord>('/company/courses', {
          method: 'POST',
          body,
          csrfToken,
        })
      }

      if (pendingThumbnailFile) {
        const formData = new FormData()
        formData.set('file', pendingThumbnailFile)
        const thumbnailUpdatedCourse = await apiRequest<AdminCourseRecord>(`/company/courses/${savedCourse.course_id}/thumbnail`, {
          method: 'POST',
          body: formData,
          csrfToken,
        })
        savedCourse = thumbnailUpdatedCourse
        setThumbnailImage(thumbnailUpdatedCourse.thumbnail_image || '')
        setPendingThumbnailFile(null)
      }

      toast.success(mode === 'edit' ? 'Course updated successfully.' : 'Course created successfully.')
      navigate(mode === 'edit' ? '/company/courses' : `/company/courses/${savedCourse.course_id}/lessons`)
    } catch (saveError) {
      const message =
        saveError instanceof ApiError
          ? saveError.message
          : saveError instanceof Error
            ? saveError.message
            : 'Unable to save course.'
      setError(message)
      toast.error(message)
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
      await apiRequest<AdminCourseRecord>(`/company/courses/${courseId}`, {
        method: 'DELETE',
        csrfToken,
      })
      toast.success('Course retired successfully.')
      navigate('/company/courses')
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to retire course.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingLessons) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
        <div className={editorCardClassName}>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-400" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading course editor...</p>
            </div>
          </div>
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
          <Link to="/company" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/company/courses" className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Edit course</span>
        </div>

        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 dark:border-red-900 dark:bg-red-950">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Course editing is not available</h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            Only courses created by your company can be edited or managed from this workspace.
          </p>
          <div className="mt-5">
            <Link to="/company/courses" className="inline-flex items-center text-sm font-medium text-red-900 underline dark:text-red-100">
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
          <Link to="/company" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/company/courses" className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{mode === 'edit' ? 'Edit course' : 'Create course'}</span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <main className={editorCardClassName}>
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <CoursePreviewHero
              thumbnailImage={thumbnailImage}
              thumbnailAltText={thumbnailAltText}
              previewTitle={previewTitle}
              previewDescription={previewDescription}
              learnerCount={learnerCount}
              estimatedHours={estimatedHours}
              courseTags={courseTags}
              mode={mode}
              courseId={courseId}
              saving={saving}
              onBack={() => navigate('/company/courses')}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course story</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Start from the same course-detail structure learners will experience in the catalog and preview flow.
                    </p>
                  </div>

                  <div className="mb-5 space-y-5">
                    <ImageUploadPanel
                      label="Thumbnail image"
                      image={thumbnailImage}
                      alt={thumbnailAltText || 'Thumbnail preview'}
                      isLoading={isReadingThumbnail}
                      onChange={(event) => void handleImageChange(event, setThumbnailImage, setIsReadingThumbnail, { trackFile: true })}
                      onRemove={() => setThumbnailImage('')}
                    />

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">Alt text</span>
                      <input
                        className={fieldClassName}
                        value={thumbnailAltText}
                        onChange={(event) => setThumbnailAltText(event.target.value)}
                        placeholder="Describe the course thumbnail for accessibility."
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Course title</span>
                      <input className={fieldClassName} value={title} onChange={(event) => setTitle(event.target.value)} required />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Slug</span>
                      <input
                        className={fieldClassName}
                        value={slug}
                        onChange={(event) => {
                          setSlugTouched(true)
                          setSlug(event.target.value)
                        }}
                        placeholder="complete-frontend-engineering-master-course"
                      />
                    </label>
                  </div>

                  <div className="mt-5 space-y-5">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Short description</span>
                      <textarea
                        className={textAreaClassName}
                        rows={3}
                        value={shortDescription}
                        onChange={(event) => setShortDescription(event.target.value)}
                        placeholder="Short summary for course cards and previews."
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Full description</span>
                      <textarea
                        className={textAreaClassName}
                        rows={6}
                        value={fullDescription}
                        onChange={(event) => setFullDescription(event.target.value)}
                        placeholder="Detailed course overview, outcomes, and expectations."
                      />
                    </label>
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Catalog positioning</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Define the metadata that powers the course card, filters, and detail hero.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Course category</span>
                      <input className={fieldClassName} value={category} onChange={(event) => setCategory(event.target.value)} required />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Course level</span>
                      <select className={fieldClassName} value={courseLevel} onChange={(event) => setCourseLevel(event.target.value)}>
                        <option value="">Select level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="beginner to advanced">Beginner to Advanced</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Language</span>
                      <input className={fieldClassName} value={language} onChange={(event) => setLanguage(event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Course type</span>
                      <select className={fieldClassName} value={courseType} onChange={(event) => setCourseType(event.target.value as 'free' | 'premium')}>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Status</span>
                      <select className={fieldClassName} value={status} onChange={(event) => setStatus(event.target.value)} required>
                        <option value="" disabled>
                          Select status
                        </option>
                        <option value="draft">Draft</option>
                        <option value="active">Published</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Total duration (hours)</span>
                      <input
                        className={fieldClassName}
                        type="number"
                        min={0}
                        value={totalDuration}
                        onChange={(event) => setTotalDuration(event.target.value)}
                        placeholder="24"
                      />
                    </label>
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pricing and learner value</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Capture the commercial and learner-facing signals that strengthen the course offer.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Price</span>
                      <input
                        className={fieldClassName}
                        type="number"
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="0.00"
                        disabled={isFreeCourse}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Discount price</span>
                      <input
                        className={fieldClassName}
                        type="number"
                        min={0}
                        step="0.01"
                        value={discountPrice}
                        onChange={(event) => setDiscountPrice(event.target.value)}
                        placeholder="0.00"
                        disabled={isFreeCourse}
                      />
                    </label>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                      <input type="checkbox" checked={isFreeCourse} onChange={(event) => setIsFreeCourse(event.target.checked)} />
                      <span>Is free course</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={subscriptionRequired}
                        onChange={(event) => setSubscriptionRequired(event.target.checked)}
                      />
                      <span>Subscription required</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={certificateAvailable}
                        onChange={(event) => setCertificateAvailable(event.target.checked)}
                      />
                      <span>Certificate available</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                      <input
                        type="checkbox"
                        checked={interviewPrepIncluded}
                        onChange={(event) => setInterviewPrepIncluded(event.target.checked)}
                      />
                      <span>Interview prep included</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={capstoneProjectIncluded}
                        onChange={(event) => setCapstoneProjectIncluded(event.target.checked)}
                      />
                      <span>Capstone project included</span>
                    </label>
                  </div>

                  <div className="mt-5 space-y-3">
                    <p className="text-sm font-medium text-foreground">Technologies covered</p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {supportedTechnologies.map((technology) => {
                        const isSelected = selectedTechnologies.includes(technology)

                        return (
                          <button
                            key={technology}
                            type="button"
                            onClick={() => toggleTechnology(technology)}
                            className={cn(
                              'rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200',
                            )}
                          >
                            {technology}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson studio handoff</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Keep this page focused on course story and preview setup. Add and manage lessons in the dedicated lesson studio.
                      </p>
                    </div>
                    {mode === 'edit' && courseId ? (
                      <Button type="button" variant="outline" asChild>
                        <Link to={`/company/courses/${courseId}/lessons`}>
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
                        Transcript coverage is tracked in the lesson studio and reflected in course preview stats here.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next step</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {mode === 'edit' ? 'Refine lessons in the lesson studio.' : 'Create the course, then continue into lesson studio.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {mode === 'edit'
                      ? 'Lesson titles still feed the learner preview on this page, but lesson content, transcripts, and ordering now live in the dedicated lesson studio only.'
                      : 'After you create the course, you will be taken directly to the lesson studio to add lessons there.'}
                  </div>
                </section>

                <section className={editorCardClassName}>
                  <div className="mb-5 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Project / assignment</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Capture the final proof-of-skill experience that closes the course.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Project title</span>
                      <input className={fieldClassName} value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Starter code URL</span>
                      <input className={fieldClassName} value={starterCodeUrl} onChange={(event) => setStarterCodeUrl(event.target.value)} />
                    </label>
                  </div>

                  <label className="mt-5 block space-y-2">
                    <span className="text-sm font-medium text-foreground">Project description</span>
                    <textarea
                      className={textAreaClassName}
                      rows={5}
                      value={projectDescription}
                      onChange={(event) => setProjectDescription(event.target.value)}
                    />
                  </label>

                  <label className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <input
                      type="checkbox"
                      checked={submissionRequired}
                      onChange={(event) => setSubmissionRequired(event.target.checked)}
                    />
                    <span>Submission required</span>
                  </label>
                </section>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                  Transcript fields are now included in each lesson editor. Current save behavior still persists the existing course fields supported by the API.
                </div>
              </div>

              <CoursePreviewSidebar
                status={status}
                estimatedHours={estimatedHours}
                lessonsWithTranscriptCount={lessonsWithTranscriptCount}
                populatedLessonCount={populatedLessonCount}
                lessonsLength={lessons.length}
                learningHighlights={learningHighlights}
                title={title}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
                category={category}
                courseLevel={courseLevel}
                thumbnailImage={thumbnailImage}
                mode={mode}
                saving={saving}
                onBack={() => navigate('/company/courses')}
                onRetire={() => void handleRetire()}
              />
            </div>
          </main>
        </form>
      </div>
    </div>
  )
}
