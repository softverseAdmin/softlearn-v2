import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { LessonDetailResponse, LessonProgressUpdateResponse } from './types'

const emptyLesson: LessonDetailResponse = {
  lesson_id: 0,
  course_id: 0,
  course_title: '',
  course_href: '',
  title: '',
  summary: '',
  content: '',
  sequence_number: 0,
  total_lessons: 0,
  progress: {
    status: 'not_started',
    started_at: null,
    completed_at: null,
  },
  previous_lesson_href: null,
  next_lesson_href: null,
}

export function StudentLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<LessonDetailResponse>(emptyLesson)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadLesson() {
      if (!courseId || !lessonId) {
        setError('Course id and lesson id are required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<LessonDetailResponse>(`/student/courses/${courseId}/lessons/${lessonId}`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load lesson.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLesson()
    return () => {
      active = false
    }
  }, [courseId, lessonId])

  async function updateProgress(status: 'in_progress' | 'completed') {
    if (!courseId || !lessonId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<LessonProgressUpdateResponse>(`/student/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: { status },
        csrfToken,
      })
      setData(response.lesson)
      setSuccess(status === 'completed' ? 'Lesson marked complete.' : 'Lesson started.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update lesson progress.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading lesson…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Lesson {data.sequence_number} of {data.total_lessons}</p>
          <h1>{data.title || 'Lesson'}</h1>
          <p className="lead">{data.summary || 'Continue the structured course path and keep your progress up to date.'}</p>
        </div>
        <div className="card compact-card">
          <strong>{data.course_title}</strong>
          <p className="muted">Status: {data.progress.status.replace('_', ' ')}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="card stack-card">
        <h2>Lesson content</h2>
        <p>{data.content || 'No lesson content yet.'}</p>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Progress actions</h2>
          <div className="actions">
            <button
              className="secondary-button inline-button"
              type="button"
              onClick={() => void updateProgress('in_progress')}
              disabled={saving || data.progress.status === 'in_progress' || data.progress.status === 'completed'}
            >
              {saving ? 'Saving…' : 'Mark in progress'}
            </button>
            <button
              className="primary-button inline-button"
              type="button"
              onClick={() => void updateProgress('completed')}
              disabled={saving || data.progress.status === 'completed'}
            >
              {saving ? 'Saving…' : 'Mark completed'}
            </button>
          </div>
        </div>

        <div className="card stack-card">
          <h2>Navigation</h2>
          <div className="actions">
            <Link className="secondary-button inline-button" to={data.course_href || `/student/courses/${data.course_id}`}>
              Back to course
            </Link>
            {data.previous_lesson_href ? (
              <Link className="secondary-button inline-button" to={data.previous_lesson_href}>
                Previous lesson
              </Link>
            ) : null}
            {data.next_lesson_href ? (
              <Link className="primary-button inline-button" to={data.next_lesson_href}>
                Next lesson
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
