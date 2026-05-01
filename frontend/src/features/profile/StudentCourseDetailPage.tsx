import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CourseDetailResponse, StudentCourseEnrollmentResponse } from './types'

const emptyDetail: CourseDetailResponse = {
  course_id: 0,
  title: '',
  description: '',
  category: '',
  difficulty_level: '',
  estimated_hours: 0,
  status: 'active',
  lesson_count: 0,
  is_enrolled: false,
  enrollment_status: null,
  progress_percent: null,
  readiness_cues: [],
  detail_href: '',
  next_step_label: '',
  next_step_href: '',
  enrollment: {
    is_enrolled: false,
    learning_record_id: null,
    status: null,
    progress_percent: null,
    completed_at: null,
    lesson_count: 0,
    completed_lesson_count: 0,
  },
  lessons: [],
  learning_outcomes: [],
}

export function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CourseDetailResponse>(emptyDetail)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadCourse(active = true) {
    if (!courseId) {
      setError('Course id is required.')
      setLoading(false)
      return
    }

    try {
      const response = await apiRequest<CourseDetailResponse>(`/student/courses/${courseId}`)
      if (active) {
        setData(response)
      }
    } catch (loadError) {
      if (active) {
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course detail.')
      }
    } finally {
      if (active) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true
    void loadCourse(active)
    return () => {
      active = false
    }
  }, [courseId])

  async function handleEnroll() {
    if (!courseId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentCourseEnrollmentResponse>(`/student/courses/${courseId}/enrollment`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await loadCourse(true)
      setSuccess(response.created ? 'Course enrollment started.' : 'You are already enrolled in this course.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to enroll in this course.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading course details…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Course detail</p>
          <h1>{data.title || 'Course detail'}</h1>
          <p className="lead">Review the full course context, enroll, and continue through the lesson path from one place.</p>
        </div>
        <div className="card compact-card">
          <strong>Course summary</strong>
          <p className="muted">
            {data.category}
            {data.difficulty_level ? ` · ${data.difficulty_level}` : ''}
            {data.estimated_hours > 0 ? ` · ${data.estimated_hours}h` : ''}
            {data.lesson_count > 0 ? ` · ${data.lesson_count} lessons` : ''}
          </p>
          {data.enrollment.progress_percent !== null ? <p className="muted">Progress: {data.enrollment.progress_percent}%</p> : null}
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      {!error ? (
        <>
          <div className="card stack-card">
            <h2>Overview</h2>
            <p>{data.description || 'No course description yet.'}</p>
            {data.readiness_cues.length > 0 ? (
              <ul className="feature-list">
                {data.readiness_cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="page-split">
            <div className="card stack-card">
              <h2>Enrollment</h2>
              {data.enrollment.is_enrolled ? (
                <>
                  <p className="muted">
                    {data.enrollment.completed_lesson_count} of {data.enrollment.lesson_count} lessons completed
                  </p>
                  <p className="muted">Status: {data.enrollment.status?.replace('_', ' ')}</p>
                  <div className="actions">
                    <Link className="primary-button inline-button" to={data.next_step_href}>
                      {data.next_step_label}
                    </Link>
                    <Link className="secondary-button inline-button" to="/student/learning">
                      View learning summary
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">Enrollment unlocks lesson access and creates the progress record used in your learning summary.</p>
                  <button className="primary-button inline-button" type="button" onClick={() => void handleEnroll()} disabled={saving}>
                    {saving ? 'Enrolling…' : 'Enroll in course'}
                  </button>
                </>
              )}
            </div>

            <div className="card stack-card">
              <h2>What to expect</h2>
              {data.learning_outcomes.length === 0 ? <p className="muted">No additional course outcomes yet.</p> : null}
              <div className="stack-list">
                {data.learning_outcomes.map((item) => (
                  <article key={item} className="skill-card">
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="card stack-card">
            <h2>Lessons</h2>
            {data.lessons.length === 0 ? <p className="muted">No active lessons are available yet.</p> : null}
            <div className="stack-list">
              {data.lessons.map((lesson) => (
                <article key={lesson.lesson_id} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <h3>{lesson.sequence_number}. {lesson.title}</h3>
                      <p className="muted">{lesson.status ? lesson.status.replace('_', ' ') : 'Locked until enrolled'}</p>
                    </div>
                    <span className={`status-pill ${lesson.is_accessible ? 'status-success' : 'status-muted'}`}>
                      {lesson.is_accessible ? 'Open' : 'Locked'}
                    </span>
                  </div>
                  <p>{lesson.summary || 'No lesson summary yet.'}</p>
                  {lesson.detail_href ? (
                    <Link className="secondary-button inline-button" to={lesson.detail_href}>
                      Open lesson
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="actions">
            <Link className="secondary-button inline-button" to="/student/courses">
              Back to catalog
            </Link>
          </div>
        </>
      ) : null}
    </section>
  )
}
