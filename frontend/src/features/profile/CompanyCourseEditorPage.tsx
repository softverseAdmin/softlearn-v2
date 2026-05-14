import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseRecord, AdminCoursesResponse } from '../admin/types'
import { getCourseMediaOverrideForCourse, setCourseMediaOverride } from './courseMediaStorage'

const emptyCoursesResponse: AdminCoursesResponse = {
  courses: [],
}

const fieldClassName =
  'h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
const textAreaClassName =
  'w-full rounded-none border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
const supportedTechnologies = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Tailwind CSS',
  'Git',
  'Testing',
  'AI Tools',
]

type CompanyCourseEditorPageProps = {
  mode: 'create' | 'edit'
}

type ModuleDraft = {
  id: string
  title: string
  description: string
  order: string
  duration: string
}

type LessonDraft = {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'quiz' | 'project' | 'external-link'
  videoUrl: string
  content: string
  externalResourceUrl: string
  duration: string
  isPreviewFree: boolean
  order: string
}

type ImageUploadPanelProps = {
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

function createModuleDraft(order: number): ModuleDraft {
  return {
    id: createDraftId('module'),
    title: '',
    description: '',
    order: String(order),
    duration: '',
  }
}

function createLessonDraft(order: number): LessonDraft {
  return {
    id: createDraftId('lesson'),
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    content: '',
    externalResourceUrl: '',
    duration: '',
    isPreviewFree: false,
    order: String(order),
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readImageFile(file: File) {
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

function ImageUploadPanel({ label, image, alt, isLoading, onChange, onRemove }: ImageUploadPanelProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-4 rounded-none border border-dashed border-border bg-muted/20 p-4">
        {image ? (
          <img src={image} alt={alt} className="h-56 w-full rounded-none object-cover" />
        ) : (
          <div className="flex min-h-44 items-center justify-center border border-border/60 bg-background px-6 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Upload image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP recommended.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-none file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {image ? (
            <button type="button" onClick={onRemove} className="secondary-button inline-button">
              Remove image
            </button>
          ) : null}
          {isLoading ? <span className="text-xs text-muted-foreground">Loading preview…</span> : null}
        </div>
      </div>
    </div>
  )
}

export function CompanyCourseEditorPage({ mode }: CompanyCourseEditorPageProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminCoursesResponse>(emptyCoursesResponse)
  const [loading, setLoading] = useState(mode === 'edit')
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
  const [previewImage, setPreviewImage] = useState('')
  const [thumbnailAltText, setThumbnailAltText] = useState('')
  const [isReadingThumbnail, setIsReadingThumbnail] = useState(false)
  const [isReadingPreview, setIsReadingPreview] = useState(false)
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [isFreeCourse, setIsFreeCourse] = useState(true)
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  const [totalDuration, setTotalDuration] = useState('')
  const [certificateAvailable, setCertificateAvailable] = useState(false)
  const [interviewPrepIncluded, setInterviewPrepIncluded] = useState(false)
  const [capstoneProjectIncluded, setCapstoneProjectIncluded] = useState(false)
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [modules, setModules] = useState<ModuleDraft[]>([createModuleDraft(1)])
  const [lessons, setLessons] = useState<LessonDraft[]>([createLessonDraft(1)])
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

    const savedMedia = getCourseMediaOverrideForCourse(selectedCourse.course_id, selectedCourse.title)

    setTitle(selectedCourse.title)
    setSlug(slugify(selectedCourse.title))
    setShortDescription(selectedCourse.description)
    setFullDescription(selectedCourse.description)
    setCategory(selectedCourse.category)
    setCourseLevel(selectedCourse.difficulty_level)
    setTotalDuration(String(selectedCourse.estimated_hours))
    setStatus(selectedCourse.status)
    setThumbnailImage(savedMedia?.thumbnailImage ?? '')
    setPreviewImage(savedMedia?.previewImage ?? '')
    setThumbnailAltText(savedMedia?.thumbnailAltText ?? '')
  }, [mode, selectedCourse])

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    setImage: (value: string) => void,
    setReadingState: (value: boolean) => void,
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setReadingState(true)
    try {
      const imageData = await readImageFile(file)
      setImage(imageData)
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

  function resizeModules(nextCount: number) {
    setModules((current) => {
      const normalizedCount = Math.max(1, nextCount)

      if (normalizedCount === current.length) {
        return current
      }

      if (normalizedCount < current.length) {
        return current.slice(0, normalizedCount)
      }

      return [
        ...current,
        ...Array.from({ length: normalizedCount - current.length }, (_, index) =>
          createModuleDraft(current.length + index + 1)
        ),
      ]
    })
  }

  function resizeLessons(nextCount: number) {
    setLessons((current) => {
      const normalizedCount = Math.max(1, nextCount)

      if (normalizedCount === current.length) {
        return current
      }

      if (normalizedCount < current.length) {
        return current.slice(0, normalizedCount)
      }

      return [
        ...current,
        ...Array.from({ length: normalizedCount - current.length }, (_, index) =>
          createLessonDraft(current.length + index + 1)
        ),
      ]
    })
  }

  function updateModule(moduleId: string, field: keyof Omit<ModuleDraft, 'id'>, value: string) {
    setModules((current) =>
      current.map((module) => (module.id === moduleId ? { ...module, [field]: value } : module))
    )
  }

  function addModule() {
    resizeModules(modules.length + 1)
  }

  function removeModule(moduleId: string) {
    setModules((current) => (current.length > 1 ? current.filter((module) => module.id !== moduleId) : current))
  }

  function updateLesson(lessonId: string, field: keyof Omit<LessonDraft, 'id'>, value: string | boolean) {
    setLessons((current) =>
      current.map((lesson) => (lesson.id === lessonId ? { ...lesson, [field]: value } : lesson))
    )
  }

  function addLesson() {
    resizeLessons(lessons.length + 1)
  }

  function removeLesson(lessonId: string) {
    setLessons((current) => (current.length > 1 ? current.filter((lesson) => lesson.id !== lessonId) : current))
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

      setCourseMediaOverride(savedCourse.course_id, savedCourse.title, {
        thumbnailImage,
        previewImage,
        thumbnailAltText,
      })

      toast.success(mode === 'edit' ? 'Course updated successfully.' : 'Course created successfully.')
      navigate('/company/courses')
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to save course.'
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

  if (loading) {
    return <section className="page"><div className="card">Loading course…</div></section>
  }

  if (mode === 'edit' && !selectedCourse) {
    return (
      <section className="page">
        <div className="card form-error">{error ?? 'Course was not found.'}</div>
      </section>
    )
  }

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
        <span className="font-medium text-foreground">{mode === 'edit' ? 'Edit course' : 'Add course'}</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{mode === 'edit' ? 'Edit course' : 'Add course'}</h1>
        <p className="text-base text-muted-foreground">
          Build out the course structure, media, pricing, lessons, and project details from one place.
        </p>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">1. Basic Course Information</h2>
              <p className="text-sm text-muted-foreground">Core details for the course identity and catalog entry.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span>Course title</span>
                <input className={fieldClassName} value={title} onChange={(event) => setTitle(event.target.value)} required />
              </label>
              <label className="space-y-2">
                <span>Slug</span>
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

            <label className="space-y-2">
              <span>Short description</span>
              <textarea
                className={textAreaClassName}
                rows={3}
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                placeholder="Short summary for course cards and previews."
              />
            </label>

            <label className="space-y-2">
              <span>Full description</span>
              <textarea
                className={textAreaClassName}
                rows={6}
                value={fullDescription}
                onChange={(event) => setFullDescription(event.target.value)}
                placeholder="Detailed course overview, outcomes, and expectations."
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2">
                <span>Course category</span>
                <input className={fieldClassName} value={category} onChange={(event) => setCategory(event.target.value)} required />
              </label>
              <label className="space-y-2">
                <span>Course level</span>
                <select className={fieldClassName} value={courseLevel} onChange={(event) => setCourseLevel(event.target.value)}>
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="beginner to advanced">Beginner to Advanced</option>
                </select>
              </label>
              <label className="space-y-2">
                <span>Language</span>
                <input className={fieldClassName} value={language} onChange={(event) => setLanguage(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span>Course type</span>
                <select className={fieldClassName} value={courseType} onChange={(event) => setCourseType(event.target.value as 'free' | 'premium')}>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <label className="space-y-2">
                <span>Status</span>
                <select className={fieldClassName} value={status} onChange={(event) => setStatus(event.target.value)} required>
                  <option value="" disabled>
                    Select status
                  </option>
                  <option value="draft">Draft</option>
                  <option value="active">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">2. Thumbnail Upload</h2>
              <p className="text-sm text-muted-foreground">Preview the course cover assets directly in the form.</p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ImageUploadPanel
                label="Thumbnail image"
                image={thumbnailImage}
                alt={thumbnailAltText || 'Thumbnail preview'}
                isLoading={isReadingThumbnail}
                onChange={(event) => void handleImageChange(event, setThumbnailImage, setIsReadingThumbnail)}
                onRemove={() => setThumbnailImage('')}
              />
              <ImageUploadPanel
                label="Preview image"
                image={previewImage}
                alt={thumbnailAltText || 'Preview image'}
                isLoading={isReadingPreview}
                onChange={(event) => void handleImageChange(event, setPreviewImage, setIsReadingPreview)}
                onRemove={() => setPreviewImage('')}
              />
            </div>

            <label className="space-y-2">
              <span>Alt text</span>
              <input
                className={fieldClassName}
                value={thumbnailAltText}
                onChange={(event) => setThumbnailAltText(event.target.value)}
                placeholder="Describe the course thumbnail for accessibility."
              />
            </label>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">3. Pricing</h2>
              <p className="text-sm text-muted-foreground">Capture pricing details for future paid-course support.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span>Price</span>
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
                <span>Discount price</span>
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

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={isFreeCourse}
                  onChange={(event) => setIsFreeCourse(event.target.checked)}
                />
                <span>Is free course</span>
              </label>
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={subscriptionRequired}
                  onChange={(event) => setSubscriptionRequired(event.target.checked)}
                />
                <span>Subscription required</span>
              </label>
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">4. Course Content</h2>
              <p className="text-sm text-muted-foreground">Track duration, totals, and included learning extras.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2">
                <span>Total duration (hours)</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min={0}
                  value={totalDuration}
                  onChange={(event) => setTotalDuration(event.target.value)}
                  placeholder="24"
                />
              </label>
              <label className="space-y-2">
                <span>Total modules</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min={1}
                  value={String(modules.length)}
                  onChange={(event) => {
                    const nextValue = Number.parseInt(event.target.value, 10)
                    if (!Number.isNaN(nextValue)) {
                      resizeModules(nextValue)
                    }
                  }}
                />
              </label>
              <label className="space-y-2">
                <span>Total lessons</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min={1}
                  value={String(lessons.length)}
                  onChange={(event) => {
                    const nextValue = Number.parseInt(event.target.value, 10)
                    if (!Number.isNaN(nextValue)) {
                      resizeLessons(nextValue)
                    }
                  }}
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={certificateAvailable}
                  onChange={(event) => setCertificateAvailable(event.target.checked)}
                />
                <span>Certificate available</span>
              </label>
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={interviewPrepIncluded}
                  onChange={(event) => setInterviewPrepIncluded(event.target.checked)}
                />
                <span>Interview prep included</span>
              </label>
              <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={capstoneProjectIncluded}
                  onChange={(event) => setCapstoneProjectIncluded(event.target.checked)}
                />
                <span>Capstone project included</span>
              </label>
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">5. Technologies</h2>
              <p className="text-sm text-muted-foreground">Select the technologies covered by the course.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {supportedTechnologies.map((technology) => {
                const isSelected = selectedTechnologies.includes(technology)

                return (
                  <button
                    key={technology}
                    type="button"
                    onClick={() => toggleTechnology(technology)}
                    className={
                      isSelected
                        ? 'border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground'
                        : 'border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40'
                    }
                  >
                    {technology}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">6. Modules</h2>
                <p className="text-sm text-muted-foreground">Outline the course modules and the order students should follow.</p>
              </div>
              <button type="button" onClick={addModule} className="secondary-button inline-button">
                Add module
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={module.id} className="space-y-4 border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">Module {index + 1}</h3>
                    {modules.length > 1 ? (
                      <button type="button" onClick={() => removeModule(module.id)} className="secondary-button inline-button">
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span>Module title</span>
                      <input className={fieldClassName} value={module.title} onChange={(event) => updateModule(module.id, 'title', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span>Module order</span>
                      <input className={fieldClassName} value={module.order} onChange={(event) => updateModule(module.id, 'order', event.target.value)} />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span>Module description</span>
                    <textarea
                      className={textAreaClassName}
                      rows={4}
                      value={module.description}
                      onChange={(event) => updateModule(module.id, 'description', event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span>Module duration</span>
                    <input className={fieldClassName} value={module.duration} onChange={(event) => updateModule(module.id, 'duration', event.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">7. Lessons</h2>
                <p className="text-sm text-muted-foreground">Prepare the lessons that will live inside the selected modules.</p>
              </div>
              <button type="button" onClick={addLesson} className="secondary-button inline-button">
                Add lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="space-y-4 border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">Lesson {index + 1}</h3>
                    {lessons.length > 1 ? (
                      <button type="button" onClick={() => removeLesson(lesson.id)} className="secondary-button inline-button">
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span>Lesson title</span>
                      <input className={fieldClassName} value={lesson.title} onChange={(event) => updateLesson(lesson.id, 'title', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span>Lesson type</span>
                      <select className={fieldClassName} value={lesson.type} onChange={(event) => updateLesson(lesson.id, 'type', event.target.value)}>
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                        <option value="quiz">Quiz</option>
                        <option value="project">Project</option>
                        <option value="external-link">External Link</option>
                      </select>
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span>Lesson description</span>
                    <textarea
                      className={textAreaClassName}
                      rows={3}
                      value={lesson.description}
                      onChange={(event) => updateLesson(lesson.id, 'description', event.target.value)}
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span>Video URL</span>
                      <input className={fieldClassName} value={lesson.videoUrl} onChange={(event) => updateLesson(lesson.id, 'videoUrl', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span>External resource URL</span>
                      <input
                        className={fieldClassName}
                        value={lesson.externalResourceUrl}
                        onChange={(event) => updateLesson(lesson.id, 'externalResourceUrl', event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <span>Duration</span>
                      <input className={fieldClassName} value={lesson.duration} onChange={(event) => updateLesson(lesson.id, 'duration', event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span>Lesson order</span>
                      <input className={fieldClassName} value={lesson.order} onChange={(event) => updateLesson(lesson.id, 'order', event.target.value)} />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span>Lesson content</span>
                    <textarea
                      className={textAreaClassName}
                      rows={5}
                      value={lesson.content}
                      onChange={(event) => updateLesson(lesson.id, 'content', event.target.value)}
                    />
                  </label>

                  <label className="flex items-center gap-3 border border-border px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={lesson.isPreviewFree}
                      onChange={(event) => updateLesson(lesson.id, 'isPreviewFree', event.target.checked)}
                    />
                    <span>Is preview free</span>
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5 border border-border bg-muted/20 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">8. Project / Assignment</h2>
              <p className="text-sm text-muted-foreground">Capture the final project and submission expectations.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span>Project title</span>
                <input className={fieldClassName} value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span>Starter code URL</span>
                <input className={fieldClassName} value={starterCodeUrl} onChange={(event) => setStarterCodeUrl(event.target.value)} />
              </label>
            </div>

            <label className="space-y-2">
              <span>Project description</span>
              <textarea
                className={textAreaClassName}
                rows={5}
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
              />
            </label>

            <label className="flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={submissionRequired}
                onChange={(event) => setSubmissionRequired(event.target.checked)}
              />
              <span>Submission required</span>
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3 border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Frontend-only sections are ready in the form. Current save behavior still persists the existing course fields supported by the API.
          </div>

          <div className="actions">
            <button className="primary-button inline-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : mode === 'edit' ? 'Update course' : 'Create course'}
            </button>
            <Link className="secondary-button inline-button" to="/company/courses">
              Back to courses
            </Link>
            {mode === 'edit' && courseId ? (
              <Link className="secondary-button inline-button" to={`/company/courses/${courseId}/lessons`}>
                Lessons
              </Link>
            ) : null}
            {mode === 'edit' ? (
              <button className="danger-button inline-button" type="button" onClick={() => void handleRetire()} disabled={saving}>
                Retire
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
