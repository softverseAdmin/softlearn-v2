import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseLessonsResponse, AdminLessonRecord } from './types'
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'

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

export function AdminCourseLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { csrfToken } = useAuth()
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

  const selectedLesson = useMemo(
    () => data.lessons.find((lesson) => lesson.lesson_id === selectedLessonId) ?? null,
    [data.lessons, selectedLessonId],
  )

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
        const response = await apiRequest<AdminCourseLessonsResponse>(`/admin/courses/${courseId}/lessons`)
        if (active) {
          setData(response)
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
  }, [courseId])

  async function refreshLessons() {
    if (!courseId) {
      return
    }
    const response = await apiRequest<AdminCourseLessonsResponse>(`/admin/courses/${courseId}/lessons`)
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
        await apiRequest<AdminLessonRecord>(`/admin/lessons/${selectedLesson.lesson_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        toast.success('Lesson updated successfully.')
      } else {
        await apiRequest<AdminLessonRecord>(`/admin/courses/${courseId}/lessons`, {
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
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to save lesson.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRetire(lessonId: number) {
    setSaving(true)
    setError(null)

    try {
      await apiRequest<AdminLessonRecord>(`/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshLessons()
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
      }
      toast.success('Lesson retired successfully.')
    } catch (saveError) {
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to retire lesson.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading lessons…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin lessons</p>
          <h1>{data.course.title || 'Course lessons'}</h1>
          <p className="lead">Create ordered lessons under a shared course so students can enroll and move through a real learning path.</p>
        </div>
        <div className="actions">
          <Link className="secondary-button inline-button" to="/admin/courses">
            Back to courses
          </Link>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedLesson ? 'Edit lesson' : 'Create lesson'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              <span>Summary</span>
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} />
            </label>
            <label>
              <span>Content</span>
              <MarkdownEditor value={content} onChange={setContent} rows={10} placeholder="Write lesson content in Markdown." />
            </label>
            <label>
              <span>Transcript</span>
              <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={8} />
            </label>
            <label>
              <span>YouTube video URL</span>
              <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            <label>
              <span>Sequence number</span>
              <input
                type="number"
                min={1}
                value={sequenceNumber}
                onChange={(event) => setSequenceNumber(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedLesson ? 'Update lesson' : 'Create lesson'}
              </button>
              {selectedLesson ? (
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => setSelectedLessonId(null)}
                  disabled={saving}
                >
                  New lesson
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Lessons</h2>
          <div className="stack-list">
            {data.lessons.map((lesson) => (
              <article key={lesson.lesson_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{lesson.sequence_number}. {lesson.title}</h3>
                    <p className="muted">{lesson.progress_entry_count} progress records</p>
                  </div>
                  <span className={`status-pill ${lesson.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {lesson.status}
                  </span>
                </div>
                <p className="muted">{lesson.summary || 'No lesson summary yet.'}</p>
                {lesson.video_url ? <p className="muted">YouTube video attached</p> : null}
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedLessonId(lesson.lesson_id)}>
                    Edit
                  </button>
                  {lesson.status !== 'inactive' ? (
                    <button
                      className="danger-button inline-button"
                      type="button"
                      onClick={() => void handleRetire(lesson.lesson_id)}
                      disabled={saving}
                    >
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.lessons.length === 0 ? <p className="muted">No lessons yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
