import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ChevronRight, Clock3, FileText, Layers3, ListOrdered, PlayCircle, Plus, Video } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseLessonsResponse, AdminLessonRecord } from '../admin/types'
import { LoadingState } from '@/components/LoadingIndicator'
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'
import { Button } from '@/components/ui/button'
import { cn, truncateText } from '@/lib/utils'

const emptyLessonsResponse: AdminCourseLessonsResponse = {
  course: {
    course_id: 0,
    title: '',
    description: '',
    category: '',
    difficulty_level: '',
    estimated_hours: 0,
    status: 'draft',
    lesson_count: 0,
    learning_record_count: 0,
    created_at: '',
    updated_at: '',
  },
  lessons: [],
}

const fieldClassName =
  'h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
const textAreaClassName =
  'w-full rounded-none border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50'
const editorCardClassName = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'

type YouTubeTranscriptResponse = {
  transcript: string
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatDuration(hours: number) {
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

function statusBadgeClassName(status: string) {
  switch (status) {
    case 'active':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
    case 'inactive':
      return 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
  }
}

export function CompanyCourseLessonsPage({ workspaceRole = 'company' }: { workspaceRole?: 'company' | 'teacher' }) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const workspacePrefix = workspaceRole === 'teacher' ? '/teacher' : '/company'
  const coursesPath = `${workspacePrefix}/courses`
  const canPreviewCourse = Boolean(courseId)
  const [data, setData] = useState<AdminCourseLessonsResponse>(emptyLessonsResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('1')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState<string | null>(null)
  const [transcriptLoading, setTranscriptLoading] = useState(false)

  const selectedLesson = useMemo(
    () => data.lessons.find((lesson) => lesson.lesson_id === selectedLessonId) ?? null,
    [data.lessons, selectedLessonId],
  )

  const draftLessonCount = useMemo(() => data.lessons.filter((lesson) => lesson.status === 'draft').length, [data.lessons])
  const activeLessonCount = useMemo(() => data.lessons.filter((lesson) => lesson.status === 'active').length, [data.lessons])
  const retiredLessonCount = useMemo(() => data.lessons.filter((lesson) => lesson.status === 'inactive').length, [data.lessons])
  const lessonsWithTranscriptCount = useMemo(
    () => data.lessons.filter((lesson) => lesson.transcript.trim().length > 0).length,
    [data.lessons],
  )
  const coursePreviewDescription = useMemo(() => truncateText(data.course.description, 160), [data.course.description])
  const lessonPreviewTitle = title.trim() || (selectedLesson ? selectedLesson.title : 'New lesson draft')
  const lessonPreviewSummary =
    summary.trim() || 'Add a concise lesson summary so preview and lesson lists communicate the learning step clearly.'

  useEffect(() => {
    if (!selectedLesson) {
      setTitle('')
      setSummary('')
      setContent('')
      setTranscript('')
      setVideoUrl('')
      setSequenceNumber(String(data.lessons.length + 1 || 1))
      setStatus('draft')
      return
    }

    setTitle(selectedLesson.title)
    setSummary(selectedLesson.summary)
    setContent(selectedLesson.content)
    setTranscript(selectedLesson.transcript)
    setVideoUrl(selectedLesson.video_url)
    setSequenceNumber(String(selectedLesson.sequence_number))
    setStatus(selectedLesson.status)
  }, [data.lessons.length, selectedLesson])

  useEffect(() => {
    let active = true

    async function loadLessons() {
      if (!courseId) {
        setError('Course id is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<AdminCourseLessonsResponse>(`${workspacePrefix}/courses/${courseId}/lessons`)
        if (active) {
          setData(response)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          const message = loadError instanceof ApiError ? loadError.message : 'Unable to load lessons.'
          setError(message)
          toast.error(message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLessons()
    return () => {
      active = false
    }
  }, [courseId, workspacePrefix])

  async function refreshLessons() {
    if (!courseId) {
      return
    }

    const response = await apiRequest<AdminCourseLessonsResponse>(`${workspacePrefix}/courses/${courseId}/lessons`)
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!courseId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const body = {
        title,
        summary,
        content,
        transcript,
        video_url: videoUrl,
        sequence_number: Number(sequenceNumber),
        status,
      }

      if (selectedLesson) {
        await apiRequest<AdminLessonRecord>(`${workspacePrefix}/lessons/${selectedLesson.lesson_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        toast.success('Lesson updated successfully.')
      } else {
        await apiRequest<AdminLessonRecord>(`${workspacePrefix}/courses/${courseId}/lessons`, {
          method: 'POST',
          body,
          csrfToken,
        })
        toast.success('Lesson created successfully.')
      }

      await refreshLessons()
      if (!selectedLesson) {
        setSelectedLessonId(null)
      }
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to save lesson.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAutoTranscript() {
    const normalizedVideoUrl = videoUrl.trim()
    if (!normalizedVideoUrl) {
      const message = 'Paste a YouTube video URL before fetching a transcript.'
      setError(message)
      toast.error(message)
      return
    }

    setTranscriptLoading(true)
    setError(null)

    try {
      const response = await apiRequest<YouTubeTranscriptResponse>(`${workspacePrefix}/youtube-transcript`, {
        method: 'POST',
        body: {
          video_url: normalizedVideoUrl,
        },
        csrfToken,
        notifyOnError: false,
        notifyOnSuccess: false,
      })

      setTranscript(response.transcript)
      toast.success('Transcript loaded from YouTube.')
    } catch (transcriptError) {
      const message = transcriptError instanceof Error ? transcriptError.message : 'Unable to load transcript from YouTube.'
      setError(message)
      toast.error(message)
    } finally {
      setTranscriptLoading(false)
    }
  }

  async function handleRetire(lessonId: number) {
    setSaving(true)
    setError(null)

    try {
      await apiRequest<AdminLessonRecord>(`${workspacePrefix}/lessons/${lessonId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshLessons()
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
      }
      toast.success('Lesson retired successfully.')
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to retire lesson.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  function startNewLesson() {
    setSelectedLessonId(null)
    setTitle('')
    setSummary('')
    setContent('')
    setTranscript('')
    setVideoUrl('')
    setSequenceNumber(String(data.lessons.length + 1 || 1))
    setStatus('draft')
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
        <div className={editorCardClassName}>
          <LoadingState title="Loading lesson studio" className="min-h-72 py-20" />
        </div>
      </div>
    )
  }

  if (!data.course.can_edit) {
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
            <span className="font-medium text-foreground">Lesson studio</span>
          </div>

          <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 dark:border-red-900 dark:bg-red-950">
            <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">Lesson editing is not available</h1>
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
          <span className="font-medium text-foreground">Lesson studio</span>
        </div>

        <main className={editorCardClassName}>
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-52 overflow-hidden rounded-xl bg-slate-950 shadow">
              {data.course.thumbnail_image ? (
                <img
                  src={data.course.thumbnail_image}
                  alt={data.course.thumbnail_alt_text || `${data.course.title} cover`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
                  <div className="text-center">
                    <div className="mb-3 text-6xl text-cyan-400">⚛</div>
                    <h2 className="text-3xl font-bold">
                      {data.course.title.split(' ').slice(0, 1).join(' ') || 'Course'}{' '}
                      <span className="rounded bg-blue-600 px-2">
                        {data.course.title.split(' ').slice(1, 2).join(' ') || 'Studio'}
                      </span>
                    </h2>
                    <p className="mt-1 text-xl">{data.course.title.split(' ').slice(2).join(' ') || 'Lessons'}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Build lesson preview</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 lg:text-4xl dark:text-slate-100">
                {data.course.title || 'Course lessons'}
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-500 dark:text-slate-400">
                {coursePreviewDescription || 'Shape the lesson flow with ordered content, transcripts, and video context so preview and learner experience stay aligned.'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-violet-500" />
                  {data.lessons.length} lessons
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  {activeLessonCount} active
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  {formatDuration(data.course.estimated_hours)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  data.course.category ? formatLabel(data.course.category) : null,
                  data.course.difficulty_level ? formatLabel(data.course.difficulty_level) : null,
                  `Course ${formatLabel(data.course.status || 'draft')}`,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  type="button"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 hover:text-white"
                  onClick={startNewLesson}
                  disabled={saving}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New lesson
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  onClick={() => navigate(`${workspacePrefix}/courses/${data.course.course_id}/edit`)}
                >
                  Edit course
                </Button>
                {canPreviewCourse ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    onClick={() => navigate(`${workspacePrefix}/courses/${data.course.course_id}/preview`)}
                  >
                    Preview course
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className={editorCardClassName}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {selectedLesson ? 'Edit lesson' : 'Create lesson'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Use the same structured editing pattern as the course form so each lesson is ready for preview, exams, and learner progress.
                    </p>
                  </div>
                  {selectedLesson ? (
                    <Button type="button" variant="outline" onClick={startNewLesson} disabled={saving}>
                      New lesson
                    </Button>
                  ) : null}
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Lesson title</span>
                      <input className={fieldClassName} value={title} onChange={(event) => setTitle(event.target.value)} required />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Status</span>
                      <select className={fieldClassName} value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Sequence number</span>
                      <input
                        className={fieldClassName}
                        type="number"
                        min={1}
                        value={sequenceNumber}
                        onChange={(event) => setSequenceNumber(event.target.value)}
                        required
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">YouTube video URL</span>
                      <input
                        className={fieldClassName}
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Lesson summary</span>
                    <textarea
                      className={textAreaClassName}
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      rows={4}
                      placeholder="Short summary for lesson lists and preview cards."
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Transcript</span>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-3 top-3 z-10"
                        onClick={() => void handleAutoTranscript()}
                        disabled={!videoUrl.trim() || transcriptLoading}
                      >
                        {transcriptLoading ? 'Getting transcript…' : 'Auto get transcript'}
                      </Button>
                      <textarea
                        className={cn(textAreaClassName, 'pt-14')}
                        value={transcript}
                        onChange={(event) => setTranscript(event.target.value)}
                        rows={8}
                        placeholder="Paste the lesson transcript here when available."
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Lesson content</span>
                    <MarkdownEditor value={content} onChange={setContent} rows={12} placeholder="Write lesson content in Markdown." />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white" disabled={saving}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {saving ? 'Saving…' : selectedLesson ? 'Update lesson' : 'Create lesson'}
                    </Button>
                    {selectedLesson && selectedLesson.status !== 'inactive' ? (
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-xl"
                        onClick={() => void handleRetire(selectedLesson.lesson_id)}
                        disabled={saving}
                      >
                        Retire lesson
                      </Button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className={editorCardClassName}>
                <div className="mb-5 space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson library</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Review the ordered lesson stack and jump into any lesson to refine content, transcripts, and publishing state.
                  </p>
                </div>

                <div className="space-y-4">
                  {data.lessons.map((lesson) => {
                    const isSelected = selectedLessonId === lesson.lesson_id

                    return (
                      <div
                        key={lesson.lesson_id}
                        className={cn(
                          'rounded-2xl border p-4 transition-colors',
                          isSelected
                            ? 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40'
                            : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50',
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {lesson.sequence_number}. {lesson.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {lesson.progress_entry_count} progress records
                            </p>
                          </div>
                          <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', statusBadgeClassName(lesson.status))}>
                            {formatLabel(lesson.status)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {lesson.summary || 'No lesson summary yet.'}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {lesson.video_url ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 dark:bg-slate-950">
                              <Video className="h-3.5 w-3.5" />
                              Video attached
                            </span>
                          ) : null}
                          {lesson.transcript.trim() ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 dark:bg-slate-950">
                              <FileText className="h-3.5 w-3.5" />
                              Transcript ready
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button type="button" variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => setSelectedLessonId(lesson.lesson_id)}>
                            {isSelected ? 'Editing' : 'Edit lesson'}
                          </Button>
                          {lesson.status !== 'inactive' ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => void handleRetire(lesson.lesson_id)} disabled={saving}>
                              Retire
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}

                  {data.lessons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No lessons yet. Create the first lesson to start shaping the course path.
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <section className={editorCardClassName}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson snapshot</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Live summary of the lesson currently being prepared.
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {formatLabel(status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <ListOrdered className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Lesson {sequenceNumber || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-violet-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Transcript</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {transcript.trim() ? 'Ready' : 'Missing'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Video</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{videoUrl.trim() ? 'Attached' : 'Optional'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lessonPreviewTitle}</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{lessonPreviewSummary}</p>
                </div>
              </section>

              <section className={editorCardClassName}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Publishing checklist</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-center justify-between gap-3">
                    <span>Lesson title</span>
                    <span className={title.trim() ? 'text-emerald-600' : 'text-slate-400'}>{title.trim() ? 'Ready' : 'Missing'}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Summary</span>
                    <span className={summary.trim() ? 'text-emerald-600' : 'text-slate-400'}>{summary.trim() ? 'Ready' : 'Missing'}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Lesson content</span>
                    <span className={content.trim() ? 'text-emerald-600' : 'text-slate-400'}>{content.trim() ? 'Ready' : 'Missing'}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Transcript</span>
                    <span className={transcript.trim() ? 'text-emerald-600' : 'text-slate-400'}>{transcript.trim() ? 'Ready' : 'Optional'}</span>
                  </p>
                </div>
              </section>

              <section className={editorCardClassName}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course lesson health</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-center justify-between gap-3">
                    <span>Total lessons</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{data.lessons.length}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Active lessons</span>
                    <span className="font-semibold text-emerald-600">{activeLessonCount}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Draft lessons</span>
                    <span className="font-semibold text-amber-600">{draftLessonCount}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Retired lessons</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{retiredLessonCount}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Transcripts ready</span>
                    <span className="font-semibold text-violet-600">{lessonsWithTranscriptCount}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span>Learning records</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{data.course.learning_record_count}</span>
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
